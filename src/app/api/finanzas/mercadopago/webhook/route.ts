// ============================================================
// EDGE FUNCTION — Webhook MercadoPago
// Archivo: src/app/api/finanzas/mercadopago/webhook/route.ts
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/src/lib/supabase/service';
import { MercadoPagoWebhookSchema } from '@/src/modules/finanzas/schemas/finanzas.schema';
import crypto from 'crypto';

// ─── Verificar firma HMAC del webhook ────────────────────────
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expected = hmac.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature.replace('sha256=', ''), 'hex')
    );
  } catch {
    return false;
  }
}

// ─── Obtener detalle del pago desde MP API ─────────────────
async function fetchPaymentDetail(
  paymentId: string,
  accessToken: string
) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  if (!res.ok) throw new Error(`MP API error: ${res.status}`);
  return res.json();
}

// ─── Handler principal ───────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature') ?? '';

  // Parsear y validar payload
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = MercadoPagoWebhookSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const event = parsed.data;

  // Solo procesar eventos de pago
  if (event.type !== 'payment') {
    return NextResponse.json({ received: true, processed: false });
  }

  const supabase = createServiceRoleClient();

  try {
    // 1. Buscar el link de pago por mp_preference_id (si aplica)
    //    O directamente registrar el movimiento externo

    // Para simplificar, asumimos que el external_reference del pago
    // contiene el instrumento_id y comision_id como JSON
    const paymentId = event.data.id;

    // 2. Buscar config de MP para obtener el access_token
    //    Aquí necesitamos saber qué instrumento procesó este pago.
    //    Estrategia: El external_reference del pago contiene instrumento_id.

    // Obtener detalle del pago (necesitamos el access_token correcto)
    // En producción, se resuelve el instrumento desde external_reference.
    // Aquí asumimos que el primer instrumento activo de MP tiene el token.
    const { data: mpConfig, error: cfgError } = await supabase
      .from('mercadopago_configs')
      .select('*, instrumento:instrumentos_financieros!instrumento_id(comision_id)')
      .eq('activo', true)
      .limit(1)
      .single();

    if (cfgError || !mpConfig) {
      console.error('[Webhook MP] No se encontró config activa:', cfgError);
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    // Verificar firma
    const webhookSecret = mpConfig.webhook_secret;
    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Signature mismatch' }, { status: 401 });
    }

    // Descifrar access_token (en producción usar Vault / KMS)
    // Por ahora asumimos que está en texto plano en sandbox
    const accessToken = mpConfig.access_token_enc; // TODO: descifrar

    // 3. Obtener detalle del pago
    const paymentDetail = await fetchPaymentDetail(paymentId, accessToken);

    const instrumento_id: string = mpConfig.instrumento_id;
    const comision_id: string = mpConfig.instrumento.comision_id;

    // 4. Insertar movimiento externo (upsert para idempotencia)
    const { error: movError } = await supabase
      .from('movimientos_externos')
      .upsert({
        instrumento_id,
        tipo: 'ingreso',
        monto: paymentDetail.transaction_amount,
        moneda: paymentDetail.currency_id ?? 'ARS',
        descripcion: paymentDetail.description ?? `Pago MP ${paymentId}`,
        referencia_ext: String(paymentId),
        fecha_mov: paymentDetail.date_approved ?? paymentDetail.date_created,
        estado_conc: 'pendiente',
        metadatos: {
          mp_status: paymentDetail.status,
          mp_status_detail: paymentDetail.status_detail,
          payer_email: paymentDetail.payer?.email,
          external_reference: paymentDetail.external_reference,
        },
      }, {
        onConflict: 'instrumento_id,referencia_ext',
        ignoreDuplicates: false,
      });

    if (movError) {
      console.error('[Webhook MP] Error insertando movimiento:', movError);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    // 5. Si hay external_reference, buscar ingreso asociado y actualizar link
    if (paymentDetail.external_reference) {
      await supabase
        .from('links_de_pago')
        .update({
          estado: paymentDetail.status === 'approved' ? 'pagado' : 'activo',
          mp_payment_id: String(paymentId),
          pagado_en: paymentDetail.status === 'approved' ? paymentDetail.date_approved : null,
        })
        .eq('mp_preference_id', paymentDetail.external_reference);
    }

    // 6. Intentar auto-conciliación si el pago fue aprobado
    if (paymentDetail.status === 'approved') {
      await supabase.rpc('fn_conciliacion_automatica', { p_instrumento_id: instrumento_id });
    }

    // 7. Log de auditoría
    await supabase.from('finanzas_auditoria').insert({
      tabla: 'movimientos_externos',
      registro_id: paymentId,
      accion: 'INSERT',
      comision_id,
      datos_despues: { source: 'webhook_mp', payment_id: paymentId, status: paymentDetail.status },
    });

    return NextResponse.json({ received: true, processed: true });

  } catch (err) {
    console.error('[Webhook MP] Error inesperado:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ============================================================
// EDGE FUNCTION — Crear link de pago MercadoPago
// Archivo: src/app/api/finanzas/mercadopago/create-link/route.ts
// ============================================================
export async function createLinkHandler(req: NextRequest) {
  const body = await req.json();
  const { instrumento_id, monto, concepto, vence_en, comision_id } = body;

  const supabase = createServiceRoleClient();

  // Obtener config de MP para el instrumento
  const { data: mpConfig, error } = await supabase
    .from('mercadopago_configs')
    .select('*')
    .eq('instrumento_id', instrumento_id)
    .eq('activo', true)
    .single();

  if (error || !mpConfig) {
    return NextResponse.json({ error: 'Configuración MercadoPago no encontrada' }, { status: 404 });
  }

  const accessToken = mpConfig.access_token_enc; // TODO: descifrar

  // Crear preference en MercadoPago
  const preferenceBody = {
    items: [{
      title: concepto,
      quantity: 1,
      currency_id: 'ARS',
      unit_price: monto,
    }],
    external_reference: `${comision_id}::${instrumento_id}`,
    expires: Boolean(vence_en),
    expiration_date_to: vence_en,
    notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/finanzas/mercadopago/webhook`,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_BASE_URL}/finanzas/instrumentos?pago=exitoso`,
      failure: `${process.env.NEXT_PUBLIC_BASE_URL}/finanzas/instrumentos?pago=fallido`,
    },
    auto_return: 'approved',
  };

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferenceBody),
  });

  if (!mpRes.ok) {
    const mpError = await mpRes.json();
    return NextResponse.json({ error: 'Error creando preference en MP', detail: mpError }, { status: 502 });
  }

  const preference = await mpRes.json();

  return NextResponse.json({
    preference_id: preference.id,
    init_point: preference.init_point,
    sandbox_init_point: preference.sandbox_init_point,
    qr_data: preference.point_of_interaction?.transaction_data?.qr_code ?? null,
  });
}
