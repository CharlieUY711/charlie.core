// ============================================================
// TIPOS TYPESCRIPT — Módulo Finanzas + Instrumentos
// ============================================================

// ─── Enums ───────────────────────────────────────────────────

export type Visibilidad = 'privado' | 'comision' | 'publico';
export type EstadoMovimiento = 'pendiente' | 'confirmado' | 'rechazado' | 'anulado';
export type TipoMovimiento = 'ingreso' | 'egreso' | 'transferencia';
export type TipoInstrumento = 'cuenta_bancaria' | 'mercado_pago' | 'efectivo' | 'otro';
export type EstadoConciliacion = 'pendiente' | 'conciliado' | 'discrepancia' | 'excluido';
export type EstadoCuenta = 'activa' | 'inactiva' | 'bloqueada';
export type TipoCuentaBancaria = 'corriente' | 'caja_ahorro' | 'virtual';
export type PeriodoProyeccion = 'mensual' | 'trimestral' | 'anual';
export type AuditAccion = 'INSERT' | 'UPDATE' | 'DELETE' | 'VIEW_SENSITIVE';
export type CategoriaMovimiento =
  | 'cuota_viaje' | 'inscripcion' | 'sponsor' | 'subsidio' | 'otro_ingreso'
  | 'transporte' | 'alojamiento' | 'alimentacion' | 'seguro' | 'tramite'
  | 'actividad' | 'proveedor' | 'comision_servicio' | 'otro_egreso';

// ─── Entidades base ──────────────────────────────────────────

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface FinanzasCategoria extends BaseEntity {
  comision_id: string;
  nombre: string;
  tipo: TipoMovimiento;
  categoria_base?: CategoriaMovimiento;
  color: string;
  icono: string;
  activa: boolean;
}

// ─── Ingresos ─────────────────────────────────────────────────

export interface Ingreso extends BaseEntity {
  comision_id: string;
  categoria_id?: string;
  estudiante_id?: string;
  actividad_id?: string;
  instrumento_id?: string;
  descripcion: string;
  monto: number;
  monto_proyectado?: number;
  moneda: string;
  estado: EstadoMovimiento;
  fecha_esperada?: string;
  fecha_confirmada?: string;
  comprobante_url?: string;
  notas?: string;
  visibilidad: Visibilidad;
  es_proyeccion: boolean;
  referencia_ext?: string;
  metadatos: Record<string, unknown>;
  created_by: string;
  updated_by?: string;
  deleted_at?: string;
  // Relaciones populadas
  categoria?: FinanzasCategoria;
  estudiante?: { id: string; nombre: string; apellido: string };
}

export type CreateIngresoInput = Omit<
  Ingreso,
  'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'deleted_at' | 'categoria' | 'estudiante'
>;

export type UpdateIngresoInput = Partial<CreateIngresoInput>;

// ─── Egresos ──────────────────────────────────────────────────

export interface Egreso extends BaseEntity {
  comision_id: string;
  categoria_id?: string;
  proveedor_id?: string;
  actividad_id?: string;
  instrumento_id?: string;
  descripcion: string;
  monto: number;
  monto_proyectado?: number;
  moneda: string;
  estado: EstadoMovimiento;
  fecha_esperada?: string;
  fecha_confirmada?: string;
  comprobante_url?: string;
  notas?: string;
  visibilidad: Visibilidad;
  es_proyeccion: boolean;
  referencia_ext?: string;
  metadatos: Record<string, unknown>;
  created_by: string;
  updated_by?: string;
  deleted_at?: string;
  // Relaciones populadas
  categoria?: FinanzasCategoria;
  proveedor?: { id: string; nombre: string };
}

export type CreateEgresoInput = Omit<
  Egreso,
  'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'deleted_at' | 'categoria' | 'proveedor'
>;

export type UpdateEgresoInput = Partial<CreateEgresoInput>;

// ─── Instrumentos Financieros ────────────────────────────────

export interface InstrumentoFinanciero extends BaseEntity {
  comision_id: string;
  tipo: TipoInstrumento;
  nombre: string;
  descripcion?: string;
  estado: EstadoCuenta;
  visibilidad: Visibilidad;
  es_principal: boolean;
  saldo_actual: number;
  saldo_disponible: number;
  moneda: string;
  ultima_sync?: string;
  sync_estado: string;
  metadatos: Record<string, unknown>;
  created_by: string;
  // Relaciones
  cuenta_bancaria?: CuentaBancaria;
  mercadopago_config?: MercadoPagoConfig;
}

export interface CuentaBancaria {
  id: string;
  instrumento_id: string;
  banco: string;
  tipo_cuenta: TipoCuentaBancaria;
  numero_cuenta?: string;
  cbu?: string;
  cvu?: string;
  alias?: string;
  titular: string;
  cuit_titular?: string;
}

export interface MercadoPagoConfig {
  id: string;
  instrumento_id: string;
  mp_user_id: string;
  mp_email?: string;
  // access_token_enc NO se expone al cliente
  public_key?: string;
  ambiente: 'production' | 'sandbox';
  scopes: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkDePago extends BaseEntity {
  comision_id: string;
  instrumento_id: string;
  ingreso_id?: string;
  estudiante_id?: string;
  mp_preference_id?: string;
  mp_payment_link?: string;
  qr_data?: string;
  monto: number;
  concepto: string;
  estado: 'activo' | 'pagado' | 'vencido' | 'cancelado';
  vence_en?: string;
  pagado_en?: string;
  mp_payment_id?: string;
  metadatos: Record<string, unknown>;
  created_by: string;
}

// ─── Movimientos y Conciliación ──────────────────────────────

export interface MovimientoExterno {
  id: string;
  instrumento_id: string;
  tipo: TipoMovimiento;
  monto: number;
  moneda: string;
  descripcion?: string;
  referencia_ext: string;
  fecha_mov: string;
  fecha_importado: string;
  estado_conc: EstadoConciliacion;
  metadatos: Record<string, unknown>;
}

export interface Conciliacion {
  id: string;
  movimiento_ext_id: string;
  ingreso_id?: string;
  egreso_id?: string;
  estado: EstadoConciliacion;
  diferencia: number;
  notas?: string;
  conciliado_por?: string;
  conciliado_en?: string;
  metodo: 'manual' | 'automatico';
  created_at: string;
  // Relaciones
  movimiento_ext?: MovimientoExterno;
}

export interface ConciliacionSugerida {
  movimiento_ext_id: string;
  match_id: string;
  match_tabla: 'finanzas_ingresos' | 'finanzas_egresos';
  confianza: number;
  diferencia: number;
}

// ─── Proyecciones ────────────────────────────────────────────

export interface ProyeccionFinanciera extends BaseEntity {
  comision_id: string;
  periodo: PeriodoProyeccion;
  fecha_inicio: string;
  fecha_fin: string;
  ingresos_proy: number;
  egresos_proy: number;
  resultado_proy: number; // computed
  ingresos_real?: number;
  egresos_real?: number;
  resultado_real?: number; // computed
  confianza: number;
  fuente: 'manual' | 'calculado' | 'ml';
  notas?: string;
  created_by: string;
}

// ─── Dashboard / Vistas ──────────────────────────────────────

export interface ResumenFinanciero {
  comision_id: string;
  comision_nombre: string;
  total_ingresos_conf: number;
  total_ingresos_proy: number;
  total_egresos_conf: number;
  total_egresos_proy: number;
  resultado_neto: number;
  mov_sin_conciliar: number;
}

export interface FlujoCajaDia {
  comision_id: string;
  fecha: string;
  ingresos_confirmados: number;
  ingresos_proyectados: number;
  egresos_confirmados: number;
  egresos_proyectados: number;
  resultado_neto: number;
  saldo_acumulado: number;
}

export interface FinanzasSnapshot {
  id: string;
  comision_id: string;
  fecha: string;
  total_ingresos: number;
  total_egresos: number;
  resultado: number;
  saldo_caja: number;
  ingresos_proy: number;
  egresos_proy: number;
}

// ─── Auditoría ───────────────────────────────────────────────

export interface AuditoriaRegistro {
  id: number;
  tabla: string;
  registro_id: string;
  accion: AuditAccion;
  usuario_id?: string;
  ip_address?: string;
  datos_antes?: Record<string, unknown>;
  datos_despues?: Record<string, unknown>;
  cambios?: Record<string, { antes: unknown; despues: unknown }>;
  comision_id?: string;
  created_at: string;
  // Relaciones
  usuario?: { email: string; nombre: string };
}

// ─── Filtros ─────────────────────────────────────────────────

export interface FiltrosFinanzas {
  comision_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoMovimiento;
  categoria_id?: string;
  visibilidad?: Visibilidad;
  es_proyeccion?: boolean;
  busqueda?: string;
  moneda?: string;
  page?: number;
  per_page?: number;
  order_by?: string;
  order_dir?: 'asc' | 'desc';
}

export interface FiltrosConciliacion {
  instrumento_id?: string;
  estado_conc?: EstadoConciliacion;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  per_page?: number;
}

// ─── Paginación ──────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ─── Respuestas de Server Actions ────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

// ─── Webhook MercadoPago ─────────────────────────────────────

export interface MercadoPagoWebhookPayload {
  id: number;
  type: 'payment' | 'merchant_order' | 'subscription_authorized_payment';
  action: 'payment.created' | 'payment.updated';
  date_created: string;
  data: {
    id: string;
  };
}

export interface MercadoPagoPaymentDetail {
  id: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  description: string;
  external_reference?: string;
  payer: {
    email: string;
    id?: string;
  };
  date_approved?: string;
  date_created: string;
  metadata?: Record<string, unknown>;
}
