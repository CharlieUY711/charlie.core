// ============================================================
// MANIFEST DEL ORQUESTADOR — Módulo Finanzas
// Archivo: src/modules/finanzas/manifest.ts
// ============================================================
import type { ModuleManifest } from '@/src/orchestrator/types';

export const finanzasManifest: ModuleManifest = {
  // ─── Identificación ─────────────────────────────────────────
  id: 'finanzas',
  nombre: 'Finanzas',
  version: '1.0.0',
  descripcion: 'Módulo de gestión financiera completo: ingresos, egresos, flujo de caja, proyecciones, auditoría e instrumentos financieros.',
  icono: 'wallet',
  color: '#6366f1',
  ruta_base: '/finanzas',

  // ─── Permisos de acceso al módulo ───────────────────────────
  permisos: {
    // Quién puede ACCEDER al módulo
    acceso: ['super_admin', 'admin_general', 'admin_comision', 'colaborador_comision'],
    // Quién puede ver el dashboard completo
    dashboard_completo: ['super_admin', 'admin_general', 'admin_comision'],
    // Quién puede ver datos públicos
    datos_publicos: ['estudiante', 'padre', 'institucion', 'proveedor'],
    // Quién puede CREAR registros
    crear: ['super_admin', 'admin_general', 'admin_comision'],
    // Quién puede EDITAR registros
    editar: ['super_admin', 'admin_general', 'admin_comision'],
    // Quién puede ELIMINAR (soft delete)
    eliminar: ['super_admin', 'admin_general', 'admin_comision'],
    // Quién puede ver la auditoría
    auditoria: ['super_admin', 'admin_general', 'admin_comision'],
    // Quién puede exportar datos
    exportar: ['super_admin', 'admin_general', 'admin_comision'],
    // Quién puede gestionar instrumentos financieros
    instrumentos: ['super_admin', 'admin_general', 'admin_comision'],
    // Quién puede configurar MercadoPago
    mercadopago_config: ['super_admin', 'admin_comision'],
    // Quién puede conciliar
    conciliar: ['super_admin', 'admin_general', 'admin_comision'],
  },

  // ─── Sub-módulos / secciones ─────────────────────────────────
  secciones: [
    {
      id: 'dashboard',
      nombre: 'Dashboard',
      ruta: '/finanzas',
      icono: 'layout-dashboard',
      descripcion: 'Resumen ejecutivo financiero',
      permisos: ['super_admin', 'admin_general', 'admin_comision', 'colaborador_comision'],
    },
    {
      id: 'ingresos',
      nombre: 'Ingresos',
      ruta: '/finanzas/ingresos',
      icono: 'trending-up',
      descripcion: 'Gestión de ingresos confirmados y proyectados',
      permisos: ['super_admin', 'admin_general', 'admin_comision', 'colaborador_comision'],
    },
    {
      id: 'egresos',
      nombre: 'Egresos',
      ruta: '/finanzas/egresos',
      icono: 'trending-down',
      descripcion: 'Gestión de egresos confirmados y proyectados',
      permisos: ['super_admin', 'admin_general', 'admin_comision', 'colaborador_comision'],
    },
    {
      id: 'flujo',
      nombre: 'Flujo de Caja',
      ruta: '/finanzas/flujo',
      icono: 'bar-chart-3',
      descripcion: 'Análisis de flujo de caja histórico y proyectado',
      permisos: ['super_admin', 'admin_general', 'admin_comision'],
    },
    {
      id: 'instrumentos',
      nombre: 'Instrumentos',
      ruta: '/finanzas/instrumentos',
      icono: 'credit-card',
      descripcion: 'Cuentas bancarias, MercadoPago, conciliación',
      permisos: ['super_admin', 'admin_general', 'admin_comision'],
    },
    {
      id: 'reportes',
      nombre: 'Reportes',
      ruta: '/finanzas/reportes',
      icono: 'file-bar-chart',
      descripcion: 'Reportes avanzados y exportación de datos',
      permisos: ['super_admin', 'admin_general', 'admin_comision'],
    },
    {
      id: 'auditoria',
      nombre: 'Auditoría',
      ruta: '/finanzas/auditoria',
      icono: 'shield-check',
      descripcion: 'Log inmutable de todas las operaciones financieras',
      permisos: ['super_admin', 'admin_general', 'admin_comision'],
    },
  ],

  // ─── Capacidades del módulo ──────────────────────────────────
  capacidades: {
    soporta_multimoneda: true,
    soporta_proyecciones: true,
    soporta_conciliacion_automatica: true,
    soporta_webhooks: true,
    soporta_exportacion: ['csv', 'xlsx', 'pdf'],
    soporta_visibilidad_granular: true,
    soporta_soft_delete: true,
    soporta_auditoria_completa: true,
    soporta_snapshot_diario: true,
    instrumentos_soportados: ['cuenta_bancaria', 'mercado_pago', 'efectivo', 'otro'],
    integraciones_externas: ['mercadopago'],
  },

  // ─── Eventos que EMITE el módulo ─────────────────────────────
  eventos: {
    emite: [
      {
        nombre: 'finanzas:ingreso:creado',
        descripcion: 'Se registra un nuevo ingreso',
        payload: { id: 'string', comision_id: 'string', monto: 'number', estado: 'string' },
      },
      {
        nombre: 'finanzas:ingreso:confirmado',
        descripcion: 'Un ingreso pendiente fue confirmado',
        payload: { id: 'string', comision_id: 'string', monto: 'number', fecha_confirmada: 'string' },
      },
      {
        nombre: 'finanzas:egreso:creado',
        descripcion: 'Se registra un nuevo egreso',
        payload: { id: 'string', comision_id: 'string', monto: 'number', estado: 'string' },
      },
      {
        nombre: 'finanzas:egreso:confirmado',
        descripcion: 'Un egreso pendiente fue confirmado',
        payload: { id: 'string', comision_id: 'string', monto: 'number' },
      },
      {
        nombre: 'finanzas:pago:recibido',
        descripcion: 'MercadoPago notificó un pago aprobado vía webhook',
        payload: { payment_id: 'string', monto: 'number', instrumento_id: 'string', comision_id: 'string' },
      },
      {
        nombre: 'finanzas:conciliacion:completada',
        descripcion: 'Un movimiento externo fue conciliado con un registro interno',
        payload: { conciliacion_id: 'string', movimiento_ext_id: 'string', metodo: 'string' },
      },
      {
        nombre: 'finanzas:alerta:descubierto',
        descripcion: 'El resultado neto cayó por debajo del umbral configurado',
        payload: { comision_id: 'string', resultado_neto: 'number', umbral: 'number' },
      },
      {
        nombre: 'finanzas:link_pago:creado',
        descripcion: 'Se generó un nuevo link de pago de MercadoPago',
        payload: { link_id: 'string', estudiante_id: 'string | null', monto: 'number', mp_link: 'string' },
      },
    ],

    // ─── Eventos que CONSUME ──────────────────────────────────
    consume: [
      {
        nombre: 'estudiantes:inscripcion:creada',
        descripcion: 'Cuando se inscribe un estudiante, puede pre-crear una proyección de ingreso por cuota',
        accion: 'Crear ingreso proyectado con categoría "cuota_viaje"',
      },
      {
        nombre: 'proveedores:contrato:firmado',
        descripcion: 'Cuando se firma un contrato con proveedor, puede pre-crear proyección de egreso',
        accion: 'Crear egreso proyectado vinculado al proveedor',
      },
      {
        nombre: 'actividades:actividad:creada',
        descripcion: 'Cuando se crea una actividad del viaje, se puede asociar a egresos/ingresos',
        accion: 'Disponibilizar actividad como opción de asociación en ingresos/egresos',
      },
    ],
  },

  // ─── Acciones registradas (para Action Bar del orquestador) ──
  acciones: [
    {
      id: 'nuevo_ingreso',
      label: 'Nuevo Ingreso',
      icono: 'plus',
      variante: 'primary',
      secciones: ['ingresos'],
      permisos: ['admin_comision', 'admin_general', 'super_admin'],
      shortcut: 'i',
    },
    {
      id: 'nuevo_egreso',
      label: 'Nuevo Egreso',
      icono: 'minus',
      variante: 'secondary',
      secciones: ['egresos'],
      permisos: ['admin_comision', 'admin_general', 'super_admin'],
      shortcut: 'e',
    },
    {
      id: 'nuevo_link_pago',
      label: 'Generar Link de Pago',
      icono: 'link',
      variante: 'secondary',
      secciones: ['instrumentos'],
      permisos: ['admin_comision', 'admin_general', 'super_admin'],
    },
    {
      id: 'run_conciliacion',
      label: 'Conciliar Automático',
      icono: 'zap',
      variante: 'ghost',
      secciones: ['instrumentos'],
      permisos: ['admin_comision', 'admin_general', 'super_admin'],
    },
    {
      id: 'exportar_reporte',
      label: 'Exportar',
      icono: 'download',
      variante: 'ghost',
      secciones: ['ingresos', 'egresos', 'reportes', 'flujo'],
      permisos: ['admin_comision', 'admin_general', 'super_admin'],
    },
    {
      id: 'refresh_dashboard',
      label: 'Actualizar',
      icono: 'refresh-cw',
      variante: 'ghost',
      secciones: ['dashboard'],
      permisos: ['admin_comision', 'admin_general', 'super_admin', 'colaborador_comision'],
    },
  ],

  // ─── Contexto requerido del orquestador ──────────────────────
  contexto_requerido: {
    usuario: {
      id: true,
      rol: true,
      comision_id: true,
    },
    comision: {
      id: true,
      nombre: true,
    },
    // El módulo no necesita contexto de otras entidades por defecto
  },

  // ─── Dependencias de otros módulos ───────────────────────────
  dependencias: {
    modulos_requeridos: [],   // No depende de otros módulos para funcionar
    modulos_opcionales: [
      {
        id: 'estudiantes',
        razon: 'Para vincular pagos de estudiantes a ingresos',
      },
      {
        id: 'proveedores',
        razon: 'Para vincular egresos a contratos de proveedores',
      },
      {
        id: 'actividades',
        razon: 'Para asociar movimientos financieros a actividades del viaje',
      },
    ],
    servicios_externos: [
      {
        id: 'mercadopago',
        obligatorio: false,
        razon: 'Para procesar pagos online y gestionar links/QR',
        configuracion_requerida: ['access_token', 'mp_user_id'],
      },
    ],
  },

  // ─── Hooks de integración ────────────────────────────────────
  hooks: {
    /**
     * Se ejecuta al montar el módulo en el orquestador.
     * Registra las acciones del módulo en el ActionBar.
     */
    onMount: 'registerFinanzasActions',
    /**
     * Se ejecuta al desmontar (limpiar suscripciones realtime, etc.)
     */
    onUnmount: 'cleanupFinanzasSubscriptions',
    /**
     * Se llama cuando el orquestador detecta un cambio de comisión activa.
     */
    onComisionChange: 'resetFinanzasState',
    /**
     * Se llama cuando llega un evento externo al módulo (ver eventos.consume).
     */
    onExternalEvent: 'handleFinanzasExternalEvent',
  },

  // ─── Navegación / Layout del módulo ──────────────────────────
  layout: {
    tipo: 'sidebar_interno',  // Tiene navegación lateral propia
    sidebar_items: [
      { id: 'dashboard',    label: 'Dashboard',     icono: 'layout-dashboard', ruta: '/finanzas' },
      { id: 'ingresos',     label: 'Ingresos',      icono: 'trending-up',      ruta: '/finanzas/ingresos' },
      { id: 'egresos',      label: 'Egresos',       icono: 'trending-down',    ruta: '/finanzas/egresos' },
      { id: 'flujo',        label: 'Flujo de Caja', icono: 'bar-chart-3',      ruta: '/finanzas/flujo' },
      { separator: true },
      { id: 'instrumentos', label: 'Instrumentos',  icono: 'credit-card',      ruta: '/finanzas/instrumentos' },
      { id: 'reportes',     label: 'Reportes',      icono: 'file-bar-chart',   ruta: '/finanzas/reportes' },
      { separator: true },
      { id: 'auditoria',    label: 'Auditoría',     icono: 'shield-check',     ruta: '/finanzas/auditoria', permisos: ['super_admin', 'admin_general', 'admin_comision'] },
    ],
    breadcrumb_base: [
      { label: 'Inicio', href: '/' },
      { label: 'Finanzas', href: '/finanzas' },
    ],
  },

  // ─── Metadatos para el orquestador ──────────────────────────
  meta: {
    requiere_comision_activa: true,
    visible_en_sidebar_global: true,
    orden_en_sidebar: 3,
    badge_dinamico: {
      fuente: 'mov_sin_conciliar',  // Campo de mv_dashboard_finanzas
      color: 'amber',
      mostrar_si_mayor_que: 0,
    },
    estado_inicial: 'activo',
    created_at: '2025-01-01',
  },
};

export default finanzasManifest;
