import { DrawerAuditoria } from './DrawerAuditoria';
import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useRegisterActions } from '../../shells/ActionBarContext';
import { useShell } from '../../../context/ShellContext';
import {
  Search, CheckCircle2, XCircle, AlertCircle, Circle,
  Package, Code2, Database, Palette, Shield, Layers,
  ChevronDown, ChevronRight, Filter, GitBranch,
  FileCode2, Boxes, Zap, RefreshCw, FolderOpen,
  Check, X, Minus
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type CriterioStatus = 'ok' | 'fail' | 'partial' | 'unknown';
type ModuloEstructura = 'charlie' | 'legacy' | 'partial';

interface Criterio {
  id: string;
  label: string;
  descripcion: string;
  status: CriterioStatus;
  detalle?: string;
}

interface ModuloRepo {
  id: string;
  nombre: string;
  viewFile: string;
  estructura: ModuloEstructura;
  grupo: string;
  criterios: Criterio[];
  score: number; // 0-8
  tieneServicio: boolean;
  tieneModuleConfig: boolean;
  tieneTokens: boolean;
  tieneSchema: boolean;
  tieneAdapter: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATOS — estado real de los módulos en CoreTesting
// Cada módulo es auditado contra los 8 criterios del Protocolo Charlie (CAP 03)
// ─────────────────────────────────────────────────────────────────────────────

const SERVICIOS_DISPONIBLES = new Set([
  'abastecimiento', 'categorias', 'departamentos', 'depositos', 'disputas',
  'entregas', 'envios', 'etiquetas', 'fulfillment', 'integraciones',
  'inventario', 'mapaEnvios', 'marketing', 'metodosEnvio', 'metodosPago',
  'organizaciones', 'pedidos', 'personas', 'produccion', 'productosSecondhand',
  'roadmap', 'roles', 'rrss', 'rutas', 'subcategorias', 'tracking',
  'transportistas', 'vehiculos',
]);

// Mapeo viewFile → serviceKey
const VIEW_SERVICE_MAP: Record<string, string> = {
  AbastecimientoView: 'abastecimiento',
  DepartamentosView: 'departamentos',
  DepositosView: 'depositos',
  EntregasView: 'entregas',
  EnviosView: 'envios',
  FulfillmentView: 'fulfillment',
  InventarioView: 'inventario',
  MapaEnviosView: 'mapaEnvios',
  MetodosEnvioView: 'metodosEnvio',
  MetodosPagoView: 'metodosPago',
  OrganizacionesView: 'organizaciones',
  PagosView: 'metodosPago',
  PedidosView: 'pedidos',
  PersonasView: 'personas',
  ProduccionView: 'produccion',
  RutasView: 'rutas',
  TrackingPublicoView: 'tracking',
  TransportistasView: 'transportistas',
  VehiculosView: 'vehiculos',
  GoogleAdsView: 'marketing',
  MailingView: 'marketing',
  RedesSocialesView: 'rrss',
};

// Módulos con estructura nueva Charlie (src/modules/)
const MODULOS_CHARLIE_COMPLETOS = new Set(['pedidos']);

// Módulos con colores hardcodeados conocidos (C5 fail)
const TIENE_HARDCODED_COLORS = new Set([
  'ChecklistView', 'IdeasBoardView', 'ConstructorView', 'AuditoriaHubView',
  'DashboardView', 'AdminDashboardView', 'GestionView', 'ERPCRMView',
  'ERPFacturacionView', 'ERPInventarioView', 'ERPRRHHView', 'ERPComprasView',
]);

// Módulos con module.config.ts (C4)
const TIENE_MODULE_CONFIG = new Set(['pedidos']);

// Módulos con tokens.css (C6)
const TIENE_TOKENS = new Set(['pedidos']);

// Módulos con schema.sql (C2 completo)
const TIENE_SCHEMA = new Set([
  'pedidos', 'envios', 'transportistas', 'vehiculos', 'rutas',
  'depositos', 'entregas', 'fulfillment', 'produccion', 'abastecimiento',
  'personas', 'organizaciones', 'departamentos', 'metodosPago', 'metodosEnvio',
]);

// Grupos funcionales
function getGrupo(viewFile: string): string {
  const g: Record<string, string> = {
    AbastecimientoView: 'Logística', DepositosView: 'Logística', EntregasView: 'Logística',
    EnviosView: 'Logística', FulfillmentView: 'Logística', InventarioView: 'Logística',
    MapaEnviosView: 'Logística', ProduccionView: 'Logística', RutasView: 'Logística',
    TrackingPublicoView: 'Logística', TransportistasView: 'Logística', VehiculosView: 'Logística',
    PedidosView: 'eCommerce', PagosView: 'eCommerce', MetodosPagoView: 'eCommerce',
    MetodosEnvioView: 'eCommerce', EcommerceView: 'eCommerce', SecondHandView: 'eCommerce',
    PersonasView: 'CRM', OrganizacionesView: 'CRM', ClientesView: 'CRM', FidelizacionView: 'CRM',
    DepartamentosView: 'ERP', ERPComprasView: 'ERP', ERPContabilidadView: 'ERP',
    ERPFacturacionView: 'ERP', ERPInventarioView: 'ERP', ERPRRHHView: 'ERP', POSView: 'ERP',
    GoogleAdsView: 'Marketing', MailingView: 'Marketing', SEOView: 'Marketing',
    RedesSocialesView: 'Marketing', MetaBusinessView: 'Marketing', MetaMapView: 'Marketing',
    RRSSHubView: 'Marketing', MigracionRRSSView: 'Marketing',
    BibliotecaWorkspace: 'Herramientas', EditorImagenesWorkspace: 'Herramientas',
    GenDocumentosWorkspace: 'Herramientas', ImpresionWorkspace: 'Herramientas',
    QrGeneratorView: 'Herramientas', OCRWorkspace: 'Herramientas',
    GenPresupuestosWorkspace: 'Herramientas', UnifiedWorkspaceView: 'Herramientas',
    ChecklistView: 'Sistema', IdeasBoardView: 'Sistema', ConstructorView: 'Sistema',
    SistemaView: 'Sistema', AdminDashboardView: 'Sistema', ConfigVistasPorRolView: 'Sistema',
    APIKeysView: 'Sistema', HealthMonitorView: 'Sistema', SystemLogsView: 'Sistema',
    DocumentacionView: 'Sistema', RepositorioAPIsView: 'Sistema', WebhooksView: 'Sistema',
    AuditoriaHubView: 'Auditoría', CargaMasivaView: 'Auditoría',
    DashboardView: 'Dashboard', UserDashboardView: 'Dashboard', GestionView: 'Dashboard',
    IntegracionesView: 'Integraciones', IntegracionesPagosView: 'Integraciones',
    IntegracionesLogisticaView: 'Integraciones', IntegracionesMarketplaceView: 'Integraciones',
    IntegracionesTiendasView: 'Integraciones', IntegracionesComunicacionView: 'Integraciones',
    IntegracionesIdentidadView: 'Integraciones', IntegracionesServiciosView: 'Integraciones',
    IntegracionesRRSSView: 'Integraciones',
    ProyectosView: 'Proyectos',
    GoogleMapsTestView: 'Herramientas',
    ERPCRMView: 'ERP',
    EtiquetaEmotivaView: 'Marketing', RuedaSorteosView: 'Marketing',
    AuthRegistroView: 'Sistema', DisenoView: 'Sistema',
    LogisticaView: 'Logística', MarketingView: 'Marketing', HerramientasView: 'Herramientas',
  };
  return g[viewFile] ?? 'Sin grupo';
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERAR CRITERIOS para un módulo
// ─────────────────────────────────────────────────────────────────────────────
function generarCriterios(viewFile: string): Criterio[] {
  const serviceKey = VIEW_SERVICE_MAP[viewFile];
  const tieneServicio = serviceKey ? SERVICIOS_DISPONIBLES.has(serviceKey) : false;
  const esCharlieCompleto = MODULOS_CHARLIE_COMPLETOS.has(viewFile.replace('View', '').toLowerCase());
  const tieneSchema = TIENE_SCHEMA.has(serviceKey ?? '');
  const tieneHardcoded = TIENE_HARDCODED_COLORS.has(viewFile);
  const tieneModuleConfig = TIENE_MODULE_CONFIG.has(viewFile.replace('View', '').toLowerCase());
  const tieneTokens = TIENE_TOKENS.has(viewFile.replace('View', '').toLowerCase());

  // Hubs/views compuestas que no tienen DB directa
  const esHub = viewFile.includes('Hub') || viewFile.includes('Workspace') ||
    ['LogisticaView', 'MarketingView', 'HerramientasView', 'EcommerceView',
     'IntegracionesView', 'SistemaView', 'DashboardView', 'AdminDashboardView',
     'GestionView', 'UserDashboardView'].includes(viewFile);

  return [
    {
      id: 'C1',
      label: 'Tiene vista (UI)',
      descripcion: 'Componente React exportado y registrado',
      status: 'ok',
      detalle: `${viewFile}.tsx encontrado en /admin/views/`,
    },
    {
      id: 'C2',
      label: 'Tiene backend (DB)',
      descripcion: 'Tabla accesible en Supabase del tenant',
      status: esHub ? 'partial' : tieneSchema ? 'ok' : 'fail',
      detalle: esHub
        ? 'Hub compuesto — sin tabla directa por diseño'
        : tieneSchema
        ? `Tabla ${serviceKey} verificada en Supabase`
        : 'Sin schema.sql ni tabla verificada',
    },
    {
      id: 'C3',
      label: 'Tiene service layer',
      descripcion: 'Existe {nombre}Api.ts con getAll, create, update, delete',
      status: tieneServicio ? 'ok' : esHub ? 'partial' : 'fail',
      detalle: tieneServicio
        ? `${serviceKey}Api.ts encontrado en /services/`
        : esHub
        ? 'Hub — sin service propio por diseño'
        : 'No existe archivo de servicio',
    },
    {
      id: 'C4',
      label: 'Tiene module.config.ts',
      descripcion: 'Contrato público del módulo en src/modules/{id}/',
      status: tieneModuleConfig ? 'ok' : esCharlieCompleto ? 'ok' : 'fail',
      detalle: tieneModuleConfig
        ? 'module.config.ts presente en estructura Charlie'
        : 'Pendiente — módulo en estructura legacy',
    },
    {
      id: 'C5',
      label: 'Sin colores hardcodeados',
      descripcion: '0 ocurrencias de #HEX o rgb() en el view file',
      status: tieneHardcoded ? 'fail' : 'partial',
      detalle: tieneHardcoded
        ? 'Contiene valores #HEX hardcodeados — reemplazar por tokens --m-*'
        : 'No verificado automáticamente — requiere inspección manual',
    },
    {
      id: 'C6',
      label: 'Tokens CSS definidos',
      descripcion: 'Existe ui/tokens.css con fallbacks --m-*',
      status: tieneTokens ? 'ok' : 'fail',
      detalle: tieneTokens
        ? 'tokens.css presente'
        : 'Falta tokens.css en src/modules/{id}/ui/',
    },
    {
      id: 'C7',
      label: 'Party Model',
      descripcion: 'Usa organizaciones + roles_contextuales en vez de tablas directas',
      status: ['PersonasView', 'OrganizacionesView', 'ClientesView', 'TransportistasView'].includes(viewFile)
        ? 'partial'
        : 'unknown',
      detalle: ['PersonasView', 'OrganizacionesView', 'ClientesView', 'TransportistasView'].includes(viewFile)
        ? 'Usa tablas directas — migrar a Party Model'
        : 'No aplica directamente o requiere auditoría manual',
    },
    {
      id: 'C8',
      label: 'Data Zero (Conjuntos)',
      descripcion: 'Usa useTable() semántico — no supabase.from() hardcodeado',
      status: esCharlieCompleto ? 'ok' : tieneServicio ? 'partial' : 'fail',
      detalle: esCharlieCompleto
        ? 'Estructura Charlie completa — useTable() implementado'
        : tieneServicio
        ? 'Usa supabase directo en el Api — pendiente migrar a useTable()'
        : 'Sin service layer — C8 no aplicable hasta resolver C3',
    },
  ];
}

function calcularScore(criterios: Criterio[]): number {
  return criterios.filter(c => c.status === 'ok').length;
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTADO DE TODOS LOS MÓDULOS DEL REPO
// ─────────────────────────────────────────────────────────────────────────────
const ALL_VIEWS = [
  'AbastecimientoView','AdminDashboardView','APIKeysView','AuditoriaHubView',
  'AuthRegistroView','BibliotecaWorkspace','CargaMasivaView','ChecklistView',
  'ClientesView','ConfigVistasPorRolView','ConstructorView','DashboardView',
  'DepartamentosView','DepositosView','DisenoView','DocumentacionView',
  'EcommerceView','EditorImagenesWorkspace','EntregasView','EnviosView',
  'ERPComprasView','ERPContabilidadView','ERPCRMView','ERPFacturacionView',
  'ERPInventarioView','ERPRRHHView','EtiquetaEmotivaView','FidelizacionView',
  'FulfillmentView','GenDocumentosWorkspace','GenPresupuestosWorkspace',
  'GestionView','GoogleAdsView','GoogleMapsTestView','HealthMonitorView',
  'HerramientasView','IdeasBoardView','ImpresionWorkspace',
  'IntegracionesComunicacionView','IntegracionesIdentidadView',
  'IntegracionesLogisticaView','IntegracionesMarketplaceView',
  'IntegracionesPagosView','IntegracionesRRSSView','IntegracionesServiciosView',
  'IntegracionesTiendasView','IntegracionesView','InventarioView',
  'LogisticaView','MailingView','MapaEnviosView','MarketingView',
  'MetaBusinessView','MetaMapView','MetodosEnvioView','MetodosPagoView',
  'MigracionRRSSView','OCRWorkspace','OrganizacionesView','PagosView',
  'PedidosView','PersonasView','POSView','ProduccionView','ProyectosView',
  'QrGeneratorView','RedesSocialesView','RepositorioAPIsView','RRSSHubView',
  'RuedaSorteosView','RutasView','SEOView','SecondHandView',
  'SistemaView','SystemLogsView','TrackingPublicoView','TransportistasView',
  'UnifiedWorkspaceView','UserDashboardView','VehiculosView','WebhooksView',
];

function buildModulos(): ModuloRepo[] {
  return ALL_VIEWS.map(viewFile => {
    const criterios = generarCriterios(viewFile);
    const serviceKey = VIEW_SERVICE_MAP[viewFile] ?? '';
    const esCharlieCompleto = MODULOS_CHARLIE_COMPLETOS.has(viewFile.replace('View', '').toLowerCase());
    return {
      id: viewFile.replace('View', '').replace('Workspace', '').toLowerCase(),
      nombre: viewFile.replace(/View$|Workspace$/, '').replace(/([A-Z])/g, ' $1').trim(),
      viewFile,
      estructura: esCharlieCompleto ? 'charlie' : criterios.filter(c => c.status === 'ok').length >= 4 ? 'partial' : 'legacy',
      grupo: getGrupo(viewFile),
      criterios,
      score: calcularScore(criterios),
      tieneServicio: serviceKey ? SERVICIOS_DISPONIBLES.has(serviceKey) : false,
      tieneModuleConfig: TIENE_MODULE_CONFIG.has(viewFile.replace('View', '').toLowerCase()),
      tieneTokens: TIENE_TOKENS.has(viewFile.replace('View', '').toLowerCase()),
      tieneSchema: TIENE_SCHEMA.has(serviceKey),
      tieneAdapter: esCharlieCompleto,
    };
  });
}

const MODULOS = buildModulos();

// ─────────────────────────────────────────────────────────────────────────────
// COLORES Y BADGES
// ─────────────────────────────────────────────────────────────────────────────
const GRUPO_COLORS: Record<string, string> = {
  'Logística':     '#16a34a',
  'eCommerce':     '#f97316',
  'CRM':           '#9333ea',
  'ERP':           '#2563eb',
  'Marketing':     '#ec4899',
  'Herramientas':  '#0d9488',
  'Sistema':       '#64748b',
  'Auditoría':     '#7c3aed',
  'Dashboard':     '#0ea5e9',
  'Integraciones': '#06b6d4',
  'Proyectos':     '#4f46e5',
  'Sin grupo':     '#9ca3af',
};

function getScoreColor(score: number): string {
  if (score >= 7) return '#16a34a';
  if (score >= 5) return '#0ea5e9';
  if (score >= 3) return '#f97316';
  return '#dc2626';
}

function getEstructuraBadge(e: ModuloEstructura) {
  if (e === 'charlie') return { label: 'Charlie ✓', bg: '#dcfce7', color: '#15803d', border: '#86efac' };
  if (e === 'partial') return { label: 'Parcial', bg: '#fef9c3', color: '#854d0e', border: '#fde047' };
  return { label: 'Legacy', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
}

function CriterioIcon({ status }: { status: CriterioStatus }) {
  if (status === 'ok') return <CheckCircle2 style={{ width: 14, height: 14, color: '#16a34a', flexShrink: 0 }} />;
  if (status === 'fail') return <XCircle style={{ width: 14, height: 14, color: '#dc2626', flexShrink: 0 }} />;
  if (status === 'partial') return <AlertCircle style={{ width: 14, height: 14, color: '#f97316', flexShrink: 0 }} />;
  return <Minus style={{ width: 14, height: 14, color: '#9ca3af', flexShrink: 0 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  onNavigate?: (section: string) => void;
}

export function RepositorioView({ onNavigate }: Props) {
  const [search, setSearch] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState<string>('all');
  const [estructuraFiltro, setEstructuraFiltro] = useState<string>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [scoresDB, setScoresDB] = React.useState<Record<string,number>>({});
  const { setSubtitulo } = useShell();

  useEffect(() => {
    const total    = MODULOS.length;
    const charlie  = MODULOS.filter(m => m.estructura === 'charlie').length;
    const avgScore = Math.round(MODULOS.reduce((s, m) => s + (scoresDB[m.id] ?? m.score), 0) / total * 10) / 10;
    setSubtitulo(`${total} modulos · ${charlie} Charlie · score promedio ${avgScore}/8`);
    return () => setSubtitulo(null);
  }, [scoresDB]);

  useRegisterActions({
    searchPlaceholder: 'Buscar módulo...',
    onSearch: (q) => setSearch(q),
    buttons: [
      {
        label:   'Nuevo módulo',
        primary: true,
        icon:    Plus,
        onClick: () => { setNuevoModulo(true); setNmResultado(null); setNmNombre(''); setNmTabla(''); setNmDesc(''); },
      },
    ],
  }, []);

  const [gruposColapsados, setGruposColapsados] = React.useState<Set<string>>(new Set());
  const toggleGrupo = (g: string) => setGruposColapsados(p => { const n = new Set(p); n.has(g) ? n.delete(g) : n.add(g); return n; });
  const [nuevoModulo, setNuevoModulo]       = React.useState(false);
  const [nmNombre, setNmNombre]             = React.useState('');
  const [nmTabla, setNmTabla]               = React.useState('');
  const [nmGrupo, setNmGrupo]               = React.useState('Sin grupo');
  const [nmDesc, setNmDesc]                 = React.useState('');
  const [nmCreando, setNmCreando]           = React.useState(false);
  const [nmResultado, setNmResultado]       = React.useState<{ok:boolean;archivos?:any[];error?:string} | null>(null);
  const [moduloAuditado, setModuloAuditado] = React.useState<{section:string;nombre:string;criteriosIniciales?:any[]} | null>(null);
  const [sortBy, setSortBy] = useState<'nombre' | 'score' | 'grupo'>('grupo');

  const grupos = useMemo(() => Array.from(new Set(MODULOS.map(m => m.grupo))).sort(), []);

  const filtrados = useMemo(() => {
    return MODULOS
      .filter(m => {
        if (search && !m.nombre.toLowerCase().includes(search.toLowerCase()) &&
            !m.viewFile.toLowerCase().includes(search.toLowerCase())) return false;
        if (grupoFiltro !== 'all' && m.grupo !== grupoFiltro) return false;
        if (estructuraFiltro !== 'all' && m.estructura !== estructuraFiltro) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.score - a.score;
        if (sortBy === 'grupo') return a.grupo.localeCompare(b.grupo) || a.nombre.localeCompare(b.nombre);
        return a.nombre.localeCompare(b.nombre);
      });
  }, [search, grupoFiltro, estructuraFiltro, sortBy]);

  const stats = useMemo(() => {
    const total = MODULOS.length;
    const charlie = MODULOS.filter(m => m.estructura === 'charlie').length;
    const partial = MODULOS.filter(m => m.estructura === 'partial').length;
    const legacy = MODULOS.filter(m => m.estructura === 'legacy').length;
    const avgScore = Math.round(MODULOS.reduce((s, m) => s + m.score, 0) / total);
    const conServicio = MODULOS.filter(m => m.tieneServicio).length;
    return { total, charlie, partial, legacy, avgScore, conServicio };
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // Agrupar por grupo cuando sortBy === 'grupo'
  const agrupadoPorGrupo = useMemo(() => {
    if (sortBy !== 'grupo') return null;
    const map: Record<string, ModuloRepo[]> = {};
    filtrados.forEach(m => {
      if (!map[m.grupo]) map[m.grupo] = [];
      map[m.grupo].push(m);
    });
    return map;
  }, [filtrados, sortBy]);

  const S: Record<string, React.CSSProperties> = {
    root: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#F8F9FA', fontFamily: 'system-ui, sans-serif' },
    scroll: { flex: 1, overflowY: 'auto', padding: '20px 24px' },

    // Stats bar
    statsBar: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 },
    statCard: { backgroundColor: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 2 },
    statNum: { fontSize: 22, fontWeight: 800, lineHeight: 1 },
    statLabel: { fontSize: 11, color: '#6B7280' },

    // Toolbar
    toolbar: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const },
    searchWrap: { position: 'relative', flex: 1, minWidth: 180 },
    searchInput: { width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' as const },
    searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' },
    select: { padding: '7px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, backgroundColor: '#fff', cursor: 'pointer' },

    // Grupo header
    grupoHeader: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', marginBottom: 6, marginTop: 16 },
    grupoLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const },

    // Módulo row
    moduloWrap: { backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, marginBottom: 6, overflow: 'hidden' },
    moduloRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', userSelect: 'none' as const },
    moduloNombre: { flex: 1, fontSize: 13, fontWeight: 600, color: '#111827' },
    moduloView: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' },
    scoreBadge: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 },
    badge: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, border: '1px solid', flexShrink: 0 },

    // Criterios panel
    criteriosPanel: { borderTop: '1px solid #F3F4F6', padding: '12px 14px', backgroundColor: '#FAFAFA' },
    criterioRow: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderBottom: '1px solid #F3F4F6' },
    criterioId: { fontSize: 10, fontWeight: 800, color: '#6B7280', minWidth: 24, paddingTop: 1 },
    criterioLabel: { fontSize: 12, fontWeight: 600, color: '#374151', minWidth: 160 },
    criterioDetalle: { fontSize: 11, color: '#6B7280', flex: 1 },

    // Mini criterios (en la row)
    miniCriterios: { display: 'flex', gap: 3, alignItems: 'center' },
  };

  const renderModulo = (m: ModuloRepo) => {
    const isOpen = expanded.has(m.id);
    const scoreReal = scoresDB[m.id] ?? m.score;
    const eb = getEstructuraBadge(m.estructura);
    const sc = getScoreColor(scoreReal);
    const grupoColor = GRUPO_COLORS[m.grupo] ?? '#9ca3af';

    return (
      <div key={m.id} style={S.moduloWrap}>
        <div style={S.moduloRow} onClick={() => toggleExpand(m.id)}>
          {/* Score */}
          <div style={{ ...S.scoreBadge, backgroundColor: sc }}>{scoreReal}</div>

          {/* Punto de color grupo */}
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: grupoColor, flexShrink: 0 }} />

          {/* Nombre + viewFile */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={S.moduloNombre}>{m.nombre}</div>
            <div style={S.moduloView}>{m.viewFile}.tsx</div>
          </div>

          {/* Mini criterios */}
          <div style={S.miniCriterios}>
            {m.criterios.map(c => <CriterioIcon key={c.id} status={c.status} />)}
          </div>

          {/* Estructura badge */}
          <div style={{ ...S.badge, backgroundColor: eb.bg, color: eb.color, borderColor: eb.border }}>
            {eb.label}
          </div>

          {/* Botón Auditar */}
          <button
            onClick={e => { e.stopPropagation(); setModuloAuditado({ section: m.id, nombre: m.nombre, criteriosIniciales: m.criterios.map(c => ({ id: c.id, label: c.label, status: c.status, detalle: c.detalle ?? '', auto: ['C1','C2','C3'].includes(c.id) })) }); }}
            style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', fontSize: 11, color: '#6B7280', flexShrink: 0 }}
          >Auditar</button>
          {/* Chevron */}
          {isOpen
            ? <ChevronDown style={{ width: 14, height: 14, color: '#9CA3AF', flexShrink: 0 }} />
            : <ChevronRight style={{ width: 14, height: 14, color: '#9CA3AF', flexShrink: 0 }} />
          }
        </div>

        {/* Criterios expandidos */}
        {isOpen && (
          <div style={S.criteriosPanel}>
            {m.criterios.map(c => (
              <div key={c.id} style={S.criterioRow}>
                <span style={S.criterioId}>{c.id}</span>
                <CriterioIcon status={c.status} />
                <span style={S.criterioLabel}>{c.label}</span>
                <span style={S.criterioDetalle}>{c.detalle ?? c.descripcion}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {!m.tieneModuleConfig && (
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
                  Falta module.config.ts
                </span>
              )}
              {!m.tieneTokens && (
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
                  Falta tokens.css
                </span>
              )}
              {!m.tieneServicio && (
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, backgroundColor: '#FFF7ED', color: '#92400E', border: '1px solid #FED7AA' }}>
                  Sin service layer
                </span>
              )}
              {m.estructura === 'charlie' && (
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>
                  ✓ Estructura Charlie completa
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={S.root}>
      <div style={S.scroll}>

        {/* Stats */}
        <div style={S.statsBar}>
          <div style={S.statCard}>
            <span style={{ ...S.statNum, color: '#111827' }}>{stats.total}</span>
            <span style={S.statLabel}>Módulos totales</span>
          </div>
          <div style={S.statCard}>
            <span style={{ ...S.statNum, color: '#16a34a' }}>{stats.charlie}</span>
            <span style={S.statLabel}>Estructura Charlie</span>
          </div>
          <div style={S.statCard}>
            <span style={{ ...S.statNum, color: '#f97316' }}>{stats.partial}</span>
            <span style={S.statLabel}>Parcialmente OK</span>
          </div>
          <div style={S.statCard}>
            <span style={{ ...S.statNum, color: '#dc2626' }}>{stats.legacy}</span>
            <span style={S.statLabel}>Legacy</span>
          </div>
          <div style={S.statCard}>
            <span style={{ ...S.statNum, color: '#0ea5e9' }}>{stats.conServicio}</span>
            <span style={S.statLabel}>Con service layer</span>
          </div>
          <div style={S.statCard}>
            <span style={{ ...S.statNum, color: '#7c3aed' }}>{stats.avgScore}/8</span>
            <span style={S.statLabel}>Score promedio</span>
          </div>
        </div>

        {/* Toolbar */}
        <div style={S.toolbar}>
          <div style={S.searchWrap}>
            <Search style={{ ...S.searchIcon, width: 14, height: 14 }} />
            <input
              style={S.searchInput}
              placeholder="Buscar módulo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select style={S.select} value={grupoFiltro} onChange={e => setGrupoFiltro(e.target.value)}>
            <option value="all">Todos los grupos</option>
            {grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select style={S.select} value={estructuraFiltro} onChange={e => setEstructuraFiltro(e.target.value)}>
            <option value="all">Toda estructura</option>
            <option value="charlie">Charlie ✓</option>
            <option value="partial">Parcial</option>
            <option value="legacy">Legacy</option>
          </select>
          <select style={S.select} value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="grupo">Agrupar por grupo</option>
            <option value="score">Ordenar por score</option>
            <option value="nombre">Ordenar por nombre</option>
          </select>
          <span style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
            {filtrados.length} de {MODULOS.length}
          </span>
        </div>

        {/* Lista */}
        {sortBy === 'grupo' && agrupadoPorGrupo ? (
          Object.entries(agrupadoPorGrupo).map(([grupo, mods]) => (
            <div key={grupo}>
              <div style={{ ...S.grupoHeader, cursor: 'pointer' }} onClick={() => toggleGrupo(grupo)}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: GRUPO_COLORS[grupo] ?? '#9ca3af' }} />
                <span style={{ ...S.grupoLabel, color: GRUPO_COLORS[grupo] ?? '#6B7280' }}>{grupo}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{mods.length} módulos</span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#F3F4F6' }} />
                {gruposColapsados.has(grupo) && (() => {
                  const ok      = mods.filter(m => (scoresDB[m.id] ?? m.score) === 8).length;
                  const parcial = mods.filter(m => { const s = scoresDB[m.id] ?? m.score; return s >= 4 && s < 8; }).length;
                  const mal     = mods.filter(m => (scoresDB[m.id] ?? m.score) < 4).length;
                  const avg     = Math.round(mods.reduce((a, m) => a + (scoresDB[m.id] ?? m.score), 0) / mods.length * 10) / 10;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>{ok} ✓</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#FFF7ED', color: '#92400E', border: '1px solid #FED7AA' }}>{parcial} ●</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>{mal} ✕</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginLeft: 2 }}>Ø{avg}/8</span>
                    </div>
                  );
                })()}
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 6 }}>{gruposColapsados.has(grupo) ? '▶' : '▼'}</span>
              </div>
              {!gruposColapsados.has(grupo) && mods.map(renderModulo)}
            </div>
          ))
        ) : (
          filtrados.map(renderModulo)
        )}


          {/* ── Drawer Nuevo Modulo ── */}
          {nuevoModulo && (
            <>
              <div onClick={() => setNuevoModulo(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 100, backdropFilter: 'blur(2px)' }} />
              <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, backgroundColor: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #FF6835 0%, #ff8c42 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Plus size={18} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>Nuevo módulo</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>Genera C1 C3 C4 C5 C6 C8 automáticamente</div>
                  </div>
                  <button onClick={() => setNuevoModulo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9CA3AF', padding: 4 }}>✕</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Nombre del módulo *</label>
                    <input value={nmNombre} onChange={e => setNmNombre(e.target.value)} placeholder="ej: Proveedores" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    {nmNombre && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{'→'} {nmNombre.toLowerCase().replace(/\s+/g, '')}View.tsx</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Tabla Supabase (C2) *</label>
                    <input value={nmTabla} onChange={e => setNmTabla(e.target.value)} placeholder="ej: proveedores" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Nombre exacto de la tabla en Supabase</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Grupo</label>
                    <select value={nmGrupo} onChange={e => setNmGrupo(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                      {grupos.map(g => <option key={g} value={g}>{g}</option>)}
                      <option value="Sin grupo">Sin grupo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Descripción</label>
                    <textarea value={nmDesc} onChange={e => setNmDesc(e.target.value)} placeholder="Para qué sirve este módulo..." rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'system-ui' }} />
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB', padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Archivos a generar</div>
                    {[
                      { criterio: 'C1',    archivo: `views/${nmNombre ? nmNombre.toLowerCase().replace(/\s+/g,'') : '{nombre}'}View.tsx` },
                      { criterio: 'C3 C8', archivo: `services/${nmNombre ? nmNombre.toLowerCase().replace(/\s+/g,'') : '{nombre}'}Api.ts` },
                      { criterio: 'C4',    archivo: `modules/${nmNombre ? nmNombre.toLowerCase().replace(/\s+/g,'') : '{nombre}'}/module.config.ts` },
                      { criterio: 'C5 C6', archivo: `modules/${nmNombre ? nmNombre.toLowerCase().replace(/\s+/g,'') : '{nombre}'}/ui/tokens.css` },
                    ].map(({ criterio, archivo }) => (
                      <div key={criterio} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#EFF6FF', color: '#1D4ED8', flexShrink: 0 }}>{criterio}</span>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151' }}>{archivo}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E5E7EB', fontSize: 11, color: '#9CA3AF' }}>C2 y C7 requieren configuración manual posterior</div>
                  </div>
                  {nmResultado && (
                    <div style={{ borderRadius: 8, border: `1px solid ${nmResultado.ok ? '#BBF7D0' : '#FECACA'}`, backgroundColor: nmResultado.ok ? '#F0FDF4' : '#FEF2F2', padding: '12px 14px' }}>
                      {nmResultado.ok ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 8 }}>✓ Módulo creado exitosamente</div>
                          {nmResultado.archivos?.map((a: any) => (
                            <div key={a.path} style={{ fontSize: 11, color: '#166534', marginBottom: 3 }}>✓ {a.path} <span style={{ color: '#9CA3AF' }}>— {a.contenido}</span></div>
                          ))}
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>Reiniciá el dev server para que Vite detecte los nuevos archivos.</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: '#991B1B' }}>✕ {nmResultado.error}</div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB' }}>
                  <button
                    disabled={!nmNombre.trim() || !nmTabla.trim() || nmCreando}
                    onClick={async () => {
                      setNmCreando(true);
                      setNmResultado(null);
                      try {
                        const r = await fetch('/api/create-module', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ nombre: nmNombre.trim(), tabla: nmTabla.trim(), grupo: nmGrupo, descripcion: nmDesc.trim() }),
                        });
                        const data = await r.json();
                        setNmResultado(data.ok ? { ok: true, archivos: data.archivos } : { ok: false, error: data.error });
                      } catch (e: any) {
                        setNmResultado({ ok: false, error: e.message });
                      } finally {
                        setNmCreando(false);
                      }
                    }}
                    style={{ width: '100%', padding: 11, borderRadius: 8, border: 'none', backgroundColor: !nmNombre.trim() || !nmTabla.trim() ? '#E5E7EB' : '#FF6835', color: !nmNombre.trim() || !nmTabla.trim() ? '#9CA3AF' : '#fff', fontSize: 13, fontWeight: 700, cursor: !nmNombre.trim() || !nmTabla.trim() ? 'not-allowed' : 'pointer' }}
                  >
                    {nmCreando ? 'Creando...' : 'Crear módulo'}
                  </button>
                </div>
              </div>
            </>
          )}
      <DrawerAuditoria modulo={moduloAuditado} onClose={() => setModuloAuditado(null)}
        onGuardado={(id, score) => setScoresDB(p => ({ ...p, [id]: score }))} />
      </div>
    </div>
  );
}



