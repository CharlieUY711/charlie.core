'use server';
// ============================================================
// SERVER ACTIONS — Módulo Finanzas
// ============================================================
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/src/lib/supabase/server';
import {
  CreateIngresoSchema,
  UpdateIngresoSchema,
  CreateEgresoSchema,
  UpdateEgresoSchema,
  CreateLinkPagoSchema,
  ConciliarManualSchema,
  CreateProyeccionSchema,
  FiltrosFinanzasSchema,
  CreateCuentaBancariaSchema,
  CreateInstrumentoSchema,
} from '../schemas/finanzas.schema';
import type {
  ActionResult,
  Ingreso,
  Egreso,
  PaginatedResult,
  ResumenFinanciero,
  FlujoCajaDia,
  ConciliacionSugerida,
  InstrumentoFinanciero,
  LinkDePago,
  FiltrosFinanzas,
} from '../types/finanzas.types';

// ─── Helpers ─────────────────────────────────────────────────

function parseError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Error desconocido';
}

// ─── INGRESOS ─────────────────────────────────────────────────

/**
 * Obtener ingresos paginados con filtros
 */
export async function getIngresos(
  filtros: FiltrosFinanzas
): Promise<ActionResult<PaginatedResult<Ingreso>>> {
  try {
    const parsed = FiltrosFinanzasSchema.safeParse(filtros);
    if (!parsed.success) {
      return { success: false, error: 'Filtros inválidos', validationErrors: parsed.error.flatten().fieldErrors };
    }

    const f = parsed.data;
    const supabase = await createServerClient();
    const from = (f.page - 1) * f.per_page;
    const to = from + f.per_page - 1;

    let query = supabase
      .from('finanzas_ingresos')
      .select('*, categoria:finanzas_categorias(*), estudiante:estudiantes(id, nombre, apellido)', { count: 'exact' })
      .is('deleted_at', null)
      .range(from, to);

    if (f.comision_id) query = query.eq('comision_id', f.comision_id);
    if (f.estado) query = query.eq('estado', f.estado);
    if (f.categoria_id) query = query.eq('categoria_id', f.categoria_id);
    if (f.visibilidad) query = query.eq('visibilidad', f.visibilidad);
    if (f.es_proyeccion !== undefined) query = query.eq('es_proyeccion', f.es_proyeccion);
    if (f.fecha_desde) query = query.gte('fecha_confirmada', f.fecha_desde);
    if (f.fecha_hasta) query = query.lte('fecha_confirmada', f.fecha_hasta);
    if (f.busqueda) query = query.ilike('descripcion', `%${f.busqueda}%`);

    const orderCol = f.order_by ?? 'created_at';
    query = query.order(orderCol, { ascending: f.order_dir === 'asc' });

    const { data, error, count } = await query;

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        data: data as Ingreso[],
        count: count ?? 0,
        page: f.page,
        per_page: f.per_page,
        total_pages: Math.ceil((count ?? 0) / f.per_page),
      },
    };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

/**
 * Crear un nuevo ingreso
 */
export async function createIngreso(
  input: unknown
): Promise<ActionResult<Ingreso>> {
  try {
    const parsed = CreateIngresoSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Datos inválidos', validationErrors: parsed.error.flatten().fieldErrors };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data, error } = await supabase
      .from('finanzas_ingresos')
      .insert({ ...parsed.data, created_by: user.id })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/finanzas');
    return { success: true, data: data as Ingreso };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

/**
 * Actualizar un ingreso
 */
export async function updateIngreso(
  id: string,
  input: unknown
): Promise<ActionResult<Ingreso>> {
  try {
    const parsed = UpdateIngresoSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Datos inválidos', validationErrors: parsed.error.flatten().fieldErrors };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data, error } = await supabase
      .from('finanzas_ingresos')
      .update({ ...parsed.data, updated_by: user.id })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/finanzas');
    return { success: true, data: data as Ingreso };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

/**
 * Soft delete de un ingreso
 */
export async function deleteIngreso(id: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('finanzas_ingresos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/finanzas');
    return { success: true };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

/**
 * Confirmar un ingreso (pendiente → confirmado)
 */
export async function confirmarIngreso(
  id: string,
  fecha_confirmada: string
): Promise<ActionResult<Ingreso>> {
  return updateIngreso(id, {
    estado: 'confirmado',
    fecha_confirmada,
    es_proyeccion: false,
  });
}

// ─── EGRESOS ──────────────────────────────────────────────────

export async function getEgresos(
  filtros: FiltrosFinanzas
): Promise<ActionResult<PaginatedResult<Egreso>>> {
  try {
    const parsed = FiltrosFinanzasSchema.safeParse(filtros);
    if (!parsed.success) {
      return { success: false, error: 'Filtros inválidos' };
    }

    const f = parsed.data;
    const supabase = await createServerClient();
    const from = (f.page - 1) * f.per_page;

    let query = supabase
      .from('finanzas_egresos')
      .select('*, categoria:finanzas_categorias(*), proveedor:proveedores(id, nombre)', { count: 'exact' })
      .is('deleted_at', null)
      .range(from, from + f.per_page - 1);

    if (f.comision_id) query = query.eq('comision_id', f.comision_id);
    if (f.estado) query = query.eq('estado', f.estado);
    if (f.categoria_id) query = query.eq('categoria_id', f.categoria_id);
    if (f.busqueda) query = query.ilike('descripcion', `%${f.busqueda}%`);

    query = query.order(f.order_by ?? 'created_at', { ascending: f.order_dir === 'asc' });

    const { data, error, count } = await query;
    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        data: data as Egreso[],
        count: count ?? 0,
        page: f.page,
        per_page: f.per_page,
        total_pages: Math.ceil((count ?? 0) / f.per_page),
      },
    };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

export async function createEgreso(input: unknown): Promise<ActionResult<Egreso>> {
  try {
    const parsed = CreateEgresoSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Datos inválidos', validationErrors: parsed.error.flatten().fieldErrors };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data, error } = await supabase
      .from('finanzas_egresos')
      .insert({ ...parsed.data, created_by: user.id })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/finanzas');
    return { success: true, data: data as Egreso };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

export async function updateEgreso(id: string, input: unknown): Promise<ActionResult<Egreso>> {
  try {
    const parsed = UpdateEgresoSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Datos inválidos', validationErrors: parsed.error.flatten().fieldErrors };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data, error } = await supabase
      .from('finanzas_egresos')
      .update({ ...parsed.data, updated_by: user.id })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/finanzas');
    return { success: true, data: data as Egreso };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

// ─── DASHBOARD ────────────────────────────────────────────────

export async function getResumenFinanciero(
  comision_id: string
): Promise<ActionResult<ResumenFinanciero>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('mv_dashboard_finanzas')
      .select('*')
      .eq('comision_id', comision_id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ResumenFinanciero };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

export async function getFlujoCaja(
  comision_id: string,
  fecha_desde?: string,
  fecha_hasta?: string
): Promise<ActionResult<FlujoCajaDia[]>> {
  try {
    const supabase = await createServerClient();
    let query = supabase
      .from('v_flujo_caja')
      .select('*')
      .eq('comision_id', comision_id)
      .order('fecha', { ascending: true });

    if (fecha_desde) query = query.gte('fecha', fecha_desde);
    if (fecha_hasta) query = query.lte('fecha', fecha_hasta);

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as FlujoCajaDia[] };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

// ─── INSTRUMENTOS FINANCIEROS ────────────────────────────────

export async function getInstrumentos(
  comision_id: string
): Promise<ActionResult<InstrumentoFinanciero[]>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('instrumentos_financieros')
      .select('*, cuenta_bancaria:cuentas_bancarias(*)')
      .eq('comision_id', comision_id)
      .order('es_principal', { ascending: false })
      .order('nombre');

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as InstrumentoFinanciero[] };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

export async function createInstrumento(
  input: unknown
): Promise<ActionResult<InstrumentoFinanciero>> {
  try {
    const parsed = CreateInstrumentoSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Datos inválidos', validationErrors: parsed.error.flatten().fieldErrors };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data, error } = await supabase
      .from('instrumentos_financieros')
      .insert({ ...parsed.data, created_by: user.id })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/finanzas/instrumentos');
    return { success: true, data: data as InstrumentoFinanciero };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

// ─── LINKS DE PAGO ───────────────────────────────────────────

export async function createLinkDePago(
  input: unknown
): Promise<ActionResult<LinkDePago>> {
  try {
    const parsed = CreateLinkPagoSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Datos inválidos', validationErrors: parsed.error.flatten().fieldErrors };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    // Llamar a Edge Function para crear preference en MercadoPago
    const { data: mpData, error: mpError } = await supabase.functions.invoke('mercadopago-create-link', {
      body: parsed.data,
    });

    if (mpError) return { success: false, error: `Error MercadoPago: ${mpError.message}` };

    const { data, error } = await supabase
      .from('links_de_pago')
      .insert({
        ...parsed.data,
        mp_preference_id: mpData.preference_id,
        mp_payment_link: mpData.init_point,
        qr_data: mpData.qr_data,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/finanzas/instrumentos');
    return { success: true, data: data as LinkDePago };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

// ─── CONCILIACIÓN ────────────────────────────────────────────

export async function getSugerenciasConciliacion(
  instrumento_id: string
): Promise<ActionResult<ConciliacionSugerida[]>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.rpc('fn_conciliacion_automatica', { p_instrumento_id: instrumento_id });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ConciliacionSugerida[] };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

export async function conciliarManual(input: unknown): Promise<ActionResult> {
  try {
    const parsed = ConciliarManualSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Datos inválidos', validationErrors: parsed.error.flatten().fieldErrors };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    // Crear conciliación
    const { error: concError } = await supabase
      .from('conciliaciones')
      .insert({
        ...parsed.data,
        estado: 'conciliado',
        conciliado_por: user.id,
        conciliado_en: new Date().toISOString(),
        metodo: 'manual',
      });

    if (concError) return { success: false, error: concError.message };

    // Actualizar estado del movimiento externo
    const { error: movError } = await supabase
      .from('movimientos_externos')
      .update({ estado_conc: 'conciliado' })
      .eq('id', parsed.data.movimiento_ext_id);

    if (movError) return { success: false, error: movError.message };

    // Actualizar estado del ingreso o egreso
    if (parsed.data.ingreso_id) {
      await supabase
        .from('finanzas_ingresos')
        .update({ estado: 'confirmado' })
        .eq('id', parsed.data.ingreso_id);
    }
    if (parsed.data.egreso_id) {
      await supabase
        .from('finanzas_egresos')
        .update({ estado: 'confirmado' })
        .eq('id', parsed.data.egreso_id);
    }

    revalidatePath('/finanzas/instrumentos/conciliacion');
    return { success: true };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

// ─── PROYECCIONES ─────────────────────────────────────────────

export async function getProyeccionCalculada(
  comision_id: string,
  meses: number = 3
): Promise<ActionResult<Array<{ mes: string; monto_proyectado: number; confianza: number }>>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.rpc('fn_proyeccion_ingresos', {
      p_comision_id: comision_id,
      p_meses_historico: 3,
      p_meses_proyeccion: meses,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

export async function createProyeccion(input: unknown): Promise<ActionResult> {
  try {
    const parsed = CreateProyeccionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Datos inválidos', validationErrors: parsed.error.flatten().fieldErrors };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { error } = await supabase
      .from('proyecciones_financieras')
      .insert({ ...parsed.data, created_by: user.id });

    if (error) return { success: false, error: error.message };

    revalidatePath('/finanzas');
    return { success: true };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

// ─── AUDITORÍA ────────────────────────────────────────────────

export async function getAuditoria(
  comision_id: string,
  tabla?: string,
  page: number = 1
): Promise<ActionResult<{ data: unknown[]; count: number }>> {
  try {
    const supabase = await createServerClient();
    const from = (page - 1) * 50;

    let query = supabase
      .from('finanzas_auditoria')
      .select('*', { count: 'exact' })
      .eq('comision_id', comision_id)
      .order('created_at', { ascending: false })
      .range(from, from + 49);

    if (tabla) query = query.eq('tabla', tabla);

    const { data, error, count } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: { data: data ?? [], count: count ?? 0 } };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}
