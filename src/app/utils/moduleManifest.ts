/**
 * MODULE MANIFEST — Charlie Marketplace Builder
 * ═══════════════════════════════════════════════════
 * Universo completo de módulos Charlie.
 * 
 * pendingImport: true  → existe en Testing, no migrado a charlie.core aún
 * isReal: true         → tiene componente React funcional
 * hasSupabase: true    → tiene tabla Supabase conectada
 * serviceFile          → tiene {nombre}Api.ts en /services/
 */

import React from 'react';
import type { MainSection } from '../AdminDashboard';

export type ModuleGroup =
  | 'Sistema'
  | 'eCommerce'
  | 'Logística'
  | 'Marketing'
  | 'RRSS'
  | 'Herramientas'
  | 'Gestión'
  | 'Integraciones'
  | 'Auth';

export interface ManifestEntry {
  checklistIds:       string[];
  section:            MainSection;
  group:              ModuleGroup;
  label:              string;
  viewFile:           string;
  serviceFile?:       string;
  component:          React.ComponentType<any> | null;
  isReal:             boolean;
  hasSupabase?:       boolean;
  pendingImport?:     boolean;  // existe en Testing, no en charlie.core todavía
  acceptsOnNavigate?: boolean;
  notes?:             string;
}

// Helper: entrada pendiente (sin componente real todavía en charlie.core)
const pending = (
  section: MainSection,
  group: ModuleGroup,
  label: string,
  isReal: boolean,
  hasSupabase?: boolean,
  serviceFile?: string,
): ManifestEntry => ({
  checklistIds: [],
  section, group, label,
  viewFile: `${section}/view.tsx`,
  serviceFile,
  component: null,
  isReal,
  hasSupabase,
  pendingImport: true,
});

export const MODULE_MANIFEST: ManifestEntry[] = [

  // ══════════════════════════════════════════════════════
  // SISTEMA
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [], section: 'dashboard', group: 'Sistema', label: 'Dashboard',
    viewFile: 'DashboardView.tsx',
    component: React.lazy(() => import('../components/admin/views/DashboardView').then(m => ({ default: m.DashboardView }))),
    isReal: true,
  },
  {
    checklistIds: ['system-hub'], section: 'sistema', group: 'Sistema', label: 'Sistema',
    viewFile: 'SistemaView.tsx',
    component: React.lazy(() => import('../components/admin/views/SistemaView').then(m => ({ default: m.SistemaView }))),
    isReal: true,
  },
  {
    checklistIds: ['system-checklist'], section: 'checklist', group: 'Sistema', label: 'Checklist & Roadmap',
    viewFile: 'ChecklistView.tsx',
    component: React.lazy(() => import('../components/admin/views/ChecklistView').then(m => ({ default: m.ChecklistView }))),
    isReal: true,
    notes: 'Árbol C1-C8 automático + toggles manuales con timestamps',
  },
  {
    checklistIds: ['system-ideas'], section: 'ideas', group: 'Sistema', label: 'Ideas',
    viewFile: 'IdeasView.tsx',
    component: React.lazy(() => import('../components/admin/views/IdeasView').then(m => ({ default: m.IdeasView }))),
    isReal: true,
    notes: 'Lista de ideas con evaluación y score de viabilidad',
  },
  pending('roadmap',          'Sistema', 'Roadmap',            true,  false),
  pending('constructor',      'Sistema', 'Constructor',        true,  false),
  pending('departamentos',    'Sistema', 'Departamentos',      true,  false),
  pending('diseno',           'Sistema', 'Diseño',             false, false),
  pending('config-vistas',    'Sistema', 'Config. Vistas',     true,  false),
  pending('documentacion',    'Sistema', 'Documentación',      true,  false),
  pending('dashboard-admin',  'Sistema', 'Dashboard Admin',    true,  false),
  pending('dashboard-usuario','Sistema', 'Dashboard Usuario',  true,  false),
  pending('auth-registro',    'Sistema', 'Auth & Registro',    true,  false),
  pending('metamap-config',   'Sistema', 'MetaMap Config',     true,  false),

  // ══════════════════════════════════════════════════════
  // eCOMMERCE
  // ══════════════════════════════════════════════════════
  pending('ecommerce',        'eCommerce', 'eCommerce Hub',    false, false),
  pending('pedidos',          'eCommerce', 'Pedidos',          true,  true,  'pedidosApi.ts'),
  pending('pagos',            'eCommerce', 'Pagos',            true,  true,  'metodosPagoApi.ts'),
  pending('metodos-pago',     'eCommerce', 'Métodos de Pago',  true,  true,  'metodosPagoApi.ts'),
  pending('metodos-envio',    'eCommerce', 'Métodos de Envío', true,  true,  'metodosEnvioApi.ts'),
  pending('clientes',         'eCommerce', 'Clientes',         true,  true,  'personasApi.ts'),
  pending('personas',         'eCommerce', 'Personas',         true,  true,  'personasApi.ts'),
  pending('organizaciones',   'eCommerce', 'Organizaciones',   true,  true,  'organizacionesApi.ts'),
  pending('storefront',       'eCommerce', 'Storefront',       true,  false),
  pending('secondhand',       'eCommerce', 'Second Hand',      true,  false),
  pending('pos',              'eCommerce', 'POS',              true,  false),

  // ══════════════════════════════════════════════════════
  // LOGÍSTICA
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['logistics-hub'], section: 'logistica', group: 'Logística', label: 'Logística Hub',
    viewFile: 'LogisticaView.tsx',
    component: React.lazy(() => import('../components/admin/views/LogisticaView').then(m => ({ default: m.LogisticaView }))),
    isReal: false,
  },
  {
    checklistIds: ['logistics-shipping'], section: 'envios', group: 'Logística', label: 'Envíos',
    viewFile: 'EnviosView.tsx', serviceFile: 'enviosApi.ts',
    component: React.lazy(() => import('../components/admin/views/EnviosView').then(m => ({ default: m.EnviosView }))),
    isReal: true, hasSupabase: true,
  },
  {
    checklistIds: ['logistics-carriers'], section: 'transportistas', group: 'Logística', label: 'Transportistas',
    viewFile: 'TransportistasView.tsx', serviceFile: 'transportistasApi.ts',
    component: React.lazy(() => import('../components/admin/views/TransportistasView').then(m => ({ default: m.TransportistasView }))),
    isReal: true, hasSupabase: true,
  },
  pending('rutas',            'Logística', 'Rutas',            true,  true,  'rutasApi.ts'),
  pending('vehiculos',        'Logística', 'Vehículos',        true,  true,  'vehiculosApi.ts'),
  pending('depositos',        'Logística', 'Depósitos',        true,  true,  'depositosApi.ts'),
  pending('inventario',       'Logística', 'Inventario',       true,  true,  'inventarioApi.ts'),
  pending('entregas',         'Logística', 'Entregas',         true,  true,  'entregasApi.ts'),
  pending('fulfillment',      'Logística', 'Fulfillment',      true,  true,  'fulfillmentApi.ts'),
  pending('produccion',       'Logística', 'Producción',       true,  true,  'produccionApi.ts'),
  pending('abastecimiento',   'Logística', 'Abastecimiento',   true,  true,  'abastecimientoApi.ts'),
  pending('mapa-envios',      'Logística', 'Mapa de Envíos',   true,  false, 'mapaEnviosApi.ts'),
  pending('tracking-publico', 'Logística', 'Tracking Público', true,  false, 'trackingApi.ts'),

  // ══════════════════════════════════════════════════════
  // MARKETING
  // ══════════════════════════════════════════════════════
  pending('marketing',        'Marketing', 'Marketing Hub',    false, false),
  pending('google-ads',       'Marketing', 'Google Ads',       true,  false, 'marketingApi.ts'),
  pending('mailing',          'Marketing', 'Mailing',          true,  false),
  pending('seo',              'Marketing', 'SEO',              true,  false),
  pending('fidelizacion',     'Marketing', 'Fidelización',     true,  false),
  pending('rueda-sorteos',    'Marketing', 'Rueda de Sorteos', true,  false),
  pending('etiqueta-emotiva', 'Marketing', 'Etiqueta Emotiva', true,  true),

  // ══════════════════════════════════════════════════════
  // RRSS
  // ══════════════════════════════════════════════════════
  pending('rrss',             'RRSS', 'RRSS Hub',              false, false),
  pending('redes-sociales',   'RRSS', 'Redes Sociales',        true,  false, 'rrssApi.ts'),
  pending('migracion-rrss',   'RRSS', 'Migración RRSS',        true,  false),
  pending('meta-business',    'RRSS', 'Meta Business',         true,  false),

  // ══════════════════════════════════════════════════════
  // HERRAMIENTAS
  // ══════════════════════════════════════════════════════
  pending('herramientas',     'Herramientas', 'Herramientas Hub',  false, false),
  pending('biblioteca',       'Herramientas', 'Biblioteca',        true,  false),
  pending('editor-imagenes',  'Herramientas', 'Editor de Imágenes',true,  false),
  pending('gen-documentos',   'Herramientas', 'Generador Docs',    true,  false),
  pending('gen-presupuestos', 'Herramientas', 'Presupuestos',      true,  false),
  pending('ocr',              'Herramientas', 'OCR',               true,  false),
  pending('impresion',        'Herramientas', 'Impresión',         true,  false),
  pending('qr-generator',     'Herramientas', 'QR Generator',      true,  false),
  pending('ideas-board',      'Herramientas', 'Ideas Board',       true,  true),
  pending('carga-masiva',     'Herramientas', 'Carga Masiva',      true,  false),
  pending('unified-workspace','Herramientas', 'Workspace Unificado',true, false),

  // ══════════════════════════════════════════════════════
  // GESTIÓN
  // ══════════════════════════════════════════════════════
  pending('gestion',          'Gestión', 'Gestión Hub',        false, false),
  pending('erp-inventario',   'Gestión', 'ERP Inventario',     true,  false),
  pending('erp-facturacion',  'Gestión', 'ERP Facturación',    true,  false),
  pending('erp-compras',      'Gestión', 'ERP Compras',        true,  false),
  pending('erp-crm',          'Gestión', 'ERP CRM',            true,  false),
  pending('erp-contabilidad', 'Gestión', 'ERP Contabilidad',   true,  false),
  pending('erp-rrhh',         'Gestión', 'ERP RRHH',           true,  false),
  pending('proyectos',        'Gestión', 'Proyectos',          true,  false),
  pending('auditoria',        'Gestión', 'Auditoría Hub',      true,  false),
  pending('auditoria-health', 'Gestión', 'Health Monitor',     true,  true),
  pending('auditoria-logs',   'Gestión', 'System Logs',        true,  false),

  // ══════════════════════════════════════════════════════
  // INTEGRACIONES
  // ══════════════════════════════════════════════════════
  pending('integraciones',              'Integraciones', 'Integraciones Hub',    true,  false, 'integracionesApi.ts'),
  pending('integraciones-pagos',        'Integraciones', 'Pagos',                true,  false),
  pending('integraciones-logistica',    'Integraciones', 'Logística',            true,  false),
  pending('integraciones-tiendas',      'Integraciones', 'Tiendas',              true,  false),
  pending('integraciones-rrss',         'Integraciones', 'RRSS',                 true,  false),
  pending('integraciones-servicios',    'Integraciones', 'Servicios',            true,  false),
  pending('integraciones-marketplace',  'Integraciones', 'Marketplace',          true,  false),
  pending('integraciones-comunicacion', 'Integraciones', 'Comunicación',         true,  false),
  pending('integraciones-identidad',    'Integraciones', 'Identidad',            true,  false),
  pending('integraciones-api-keys',     'Integraciones', 'API Keys',             true,  false),
  pending('integraciones-webhooks',     'Integraciones', 'Webhooks',             true,  false),
  pending('integraciones-apis',         'Integraciones', 'Repositorio APIs',     true,  false),
  pending('google-maps-test',           'Integraciones', 'Google Maps',          true,  false),

  // ══════════════════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════════════════
  pending('auth-registro',    'Auth', 'Auth & Registro',       true,  false),

];

// ── Helpers ───────────────────────────────────────────────────────────────────

export const REAL_CHECKLIST_IDS = new Set<string>(
  MODULE_MANIFEST.filter(e => e.isReal).flatMap(e => e.checklistIds)
);

export const MANIFEST_BY_SECTION = new Map<MainSection, ManifestEntry>(
  MODULE_MANIFEST.map(e => [e.section, e])
);

export const MANIFEST_BY_GROUP = MODULE_MANIFEST.reduce<Record<string, ManifestEntry[]>>(
  (acc, e) => { if (!acc[e.group]) acc[e.group] = []; acc[e.group].push(e); return acc; },
  {}
);
