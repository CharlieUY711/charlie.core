// ============================================================
// ZOD SCHEMAS — Módulo Finanzas + Instrumentos
// ============================================================
import { z } from 'zod';

// ─── Enums como Zod ──────────────────────────────────────────
export const VisibilidadSchema = z.enum(['privado', 'comision', 'publico']);
export const EstadoMovimientoSchema = z.enum(['pendiente', 'confirmado', 'rechazado', 'anulado']);
export const TipoMovimientoSchema = z.enum(['ingreso', 'egreso', 'transferencia']);
export const TipoInstrumentoSchema = z.enum(['cuenta_bancaria', 'mercado_pago', 'efectivo', 'otro']);
export const EstadoConciliacionSchema = z.enum(['pendiente', 'conciliado', 'discrepancia', 'excluido']);
export const TipoCuentaBancariaSchema = z.enum(['corriente', 'caja_ahorro', 'virtual']);
export const PeriodoProyeccionSchema = z.enum(['mensual', 'trimestral', 'anual']);

// ─── UUID helper ─────────────────────────────────────────────
const uuidSchema = z.string().uuid('ID inválido');
const montoSchema = z.number({ required_error: 'El monto es requerido' })
  .positive('El monto debe ser mayor a 0')
  .finite('El monto debe ser un número válido')
  .transform(v => Math.round(v * 100) / 100); // 2 decimales

// ─── Ingreso ──────────────────────────────────────────────────
export const CreateIngresoSchema = z.object({
  comision_id: uuidSchema,
  categoria_id: uuidSchema.optional(),
  estudiante_id: uuidSchema.optional(),
  actividad_id: uuidSchema.optional(),
  instrumento_id: uuidSchema.optional(),
  descripcion: z
    .string({ required_error: 'La descripción es requerida' })
    .min(3, 'Mínimo 3 caracteres')
    .max(500, 'Máximo 500 caracteres')
    .trim(),
  monto: montoSchema,
  monto_proyectado: montoSchema.optional(),
  moneda: z.string().length(3, 'Código de moneda inválido').default('ARS'),
  estado: EstadoMovimientoSchema.default('pendiente'),
  fecha_esperada: z.string().date('Fecha inválida').optional(),
  fecha_confirmada: z.string().date('Fecha inválida').optional(),
  comprobante_url: z.string().url('URL inválida').optional().or(z.literal('')),
  notas: z.string().max(2000).optional(),
  visibilidad: VisibilidadSchema.default('privado'),
  es_proyeccion: z.boolean().default(false),
  referencia_ext: z.string().max(255).optional(),
  metadatos: z.record(z.unknown()).default({}),
}).refine(
  (data) => !data.es_proyeccion || data.monto_proyectado !== undefined,
  { message: 'Las proyecciones requieren monto_proyectado', path: ['monto_proyectado'] }
);

export const UpdateIngresoSchema = CreateIngresoSchema.partial().omit({ comision_id: true });

export type CreateIngresoSchemaType = z.infer<typeof CreateIngresoSchema>;
export type UpdateIngresoSchemaType = z.infer<typeof UpdateIngresoSchema>;

// ─── Egreso ───────────────────────────────────────────────────
export const CreateEgresoSchema = z.object({
  comision_id: uuidSchema,
  categoria_id: uuidSchema.optional(),
  proveedor_id: uuidSchema.optional(),
  actividad_id: uuidSchema.optional(),
  instrumento_id: uuidSchema.optional(),
  descripcion: z.string().min(3).max(500).trim(),
  monto: montoSchema,
  monto_proyectado: montoSchema.optional(),
  moneda: z.string().length(3).default('ARS'),
  estado: EstadoMovimientoSchema.default('pendiente'),
  fecha_esperada: z.string().date().optional(),
  fecha_confirmada: z.string().date().optional(),
  comprobante_url: z.string().url().optional().or(z.literal('')),
  notas: z.string().max(2000).optional(),
  visibilidad: VisibilidadSchema.default('privado'),
  es_proyeccion: z.boolean().default(false),
  referencia_ext: z.string().max(255).optional(),
  metadatos: z.record(z.unknown()).default({}),
});

export const UpdateEgresoSchema = CreateEgresoSchema.partial().omit({ comision_id: true });

export type CreateEgresoSchemaType = z.infer<typeof CreateEgresoSchema>;
export type UpdateEgresoSchemaType = z.infer<typeof UpdateEgresoSchema>;

// ─── Instrumento Financiero ───────────────────────────────────
export const CreateInstrumentoSchema = z.object({
  comision_id: uuidSchema,
  tipo: TipoInstrumentoSchema,
  nombre: z.string().min(2).max(100).trim(),
  descripcion: z.string().max(500).optional(),
  estado: z.enum(['activa', 'inactiva', 'bloqueada']).default('activa'),
  visibilidad: VisibilidadSchema.default('privado'),
  es_principal: z.boolean().default(false),
  moneda: z.string().length(3).default('ARS'),
  metadatos: z.record(z.unknown()).default({}),
});

// ─── Cuenta Bancaria ─────────────────────────────────────────
export const CreateCuentaBancariaSchema = z.object({
  instrumento_id: uuidSchema,
  banco: z.string().min(2).max(100).trim(),
  tipo_cuenta: TipoCuentaBancariaSchema,
  numero_cuenta: z.string().max(50).optional(),
  cbu: z
    .string()
    .length(22, 'El CBU debe tener 22 dígitos')
    .regex(/^\d{22}$/, 'El CBU solo debe contener números')
    .optional(),
  cvu: z
    .string()
    .length(22, 'El CVU debe tener 22 dígitos')
    .regex(/^\d{22}$/, 'El CVU solo debe contener números')
    .optional(),
  alias: z.string().max(50).optional(),
  titular: z.string().min(2).max(200).trim(),
  cuit_titular: z
    .string()
    .regex(/^\d{2}-\d{8}-\d{1}$/, 'Formato CUIT inválido (XX-XXXXXXXX-X)')
    .optional(),
});

export type CreateCuentaBancariaType = z.infer<typeof CreateCuentaBancariaSchema>;

// ─── MercadoPago Config ───────────────────────────────────────
export const CreateMercadoPagoConfigSchema = z.object({
  instrumento_id: uuidSchema,
  mp_user_id: z.string().min(1, 'El User ID de MP es requerido'),
  mp_email: z.string().email('Email inválido').optional(),
  access_token: z.string().min(20, 'Access token inválido'), // Se cifra antes de guardar
  public_key: z.string().optional(),
  webhook_secret: z.string().optional(),
  ambiente: z.enum(['production', 'sandbox']).default('production'),
});

export type CreateMercadoPagoConfigType = z.infer<typeof CreateMercadoPagoConfigSchema>;

// ─── Link de Pago ─────────────────────────────────────────────
export const CreateLinkPagoSchema = z.object({
  comision_id: uuidSchema,
  instrumento_id: uuidSchema,
  ingreso_id: uuidSchema.optional(),
  estudiante_id: uuidSchema.optional(),
  monto: montoSchema,
  concepto: z.string().min(3).max(200).trim(),
  vence_en: z.string().datetime().optional(),
  metadatos: z.record(z.unknown()).default({}),
});

export type CreateLinkPagoType = z.infer<typeof CreateLinkPagoSchema>;

// ─── Conciliación Manual ──────────────────────────────────────
export const ConciliarManualSchema = z.object({
  movimiento_ext_id: uuidSchema,
  ingreso_id: uuidSchema.optional(),
  egreso_id: uuidSchema.optional(),
  notas: z.string().max(1000).optional(),
}).refine(
  (data) => Boolean(data.ingreso_id) !== Boolean(data.egreso_id),
  { message: 'Debe especificar ingreso_id O egreso_id, no ambos ni ninguno' }
);

export type ConciliarManualType = z.infer<typeof ConciliarManualSchema>;

// ─── Proyección ───────────────────────────────────────────────
export const CreateProyeccionSchema = z.object({
  comision_id: uuidSchema,
  periodo: PeriodoProyeccionSchema,
  fecha_inicio: z.string().date(),
  fecha_fin: z.string().date(),
  ingresos_proy: z.number().nonnegative(),
  egresos_proy: z.number().nonnegative(),
  confianza: z.number().min(0).max(1).default(0.8),
  fuente: z.enum(['manual', 'calculado', 'ml']).default('manual'),
  notas: z.string().max(1000).optional(),
}).refine(
  (data) => new Date(data.fecha_fin) > new Date(data.fecha_inicio),
  { message: 'La fecha fin debe ser posterior a la fecha inicio', path: ['fecha_fin'] }
);

// ─── Filtros ──────────────────────────────────────────────────
export const FiltrosFinanzasSchema = z.object({
  comision_id: uuidSchema.optional(),
  fecha_desde: z.string().date().optional(),
  fecha_hasta: z.string().date().optional(),
  estado: EstadoMovimientoSchema.optional(),
  categoria_id: uuidSchema.optional(),
  visibilidad: VisibilidadSchema.optional(),
  es_proyeccion: z.boolean().optional(),
  busqueda: z.string().max(200).optional(),
  moneda: z.string().length(3).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  order_by: z.string().optional(),
  order_dir: z.enum(['asc', 'desc']).default('desc'),
});

export type FiltrosFinanzasType = z.infer<typeof FiltrosFinanzasSchema>;

// ─── Webhook MercadoPago ──────────────────────────────────────
export const MercadoPagoWebhookSchema = z.object({
  id: z.number(),
  type: z.enum(['payment', 'merchant_order', 'subscription_authorized_payment']),
  action: z.string(),
  date_created: z.string(),
  data: z.object({
    id: z.string(),
  }),
});

export type MercadoPagoWebhookType = z.infer<typeof MercadoPagoWebhookSchema>;
