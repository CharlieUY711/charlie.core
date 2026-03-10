/**
 * analizar-repo.js
 * Charlie Platform — Scanner de repositorio
 *
 * Escanea CoreTesting contra los 8 criterios del Protocolo Charlie (CAP 03)
 * y guarda los resultados en Supabase tabla `repositorio_modulos`.
 *
 * Uso:
 *   node analizar-repo.js
 *
 * Requiere:
 *   npm install @supabase/supabase-js
 */

const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — ajustar si es necesario
// ─────────────────────────────────────────────────────────────────────────────
const REPO_PATH    = 'C:\\Carlos\\charlie-workspace\\CoreTesting';
const VIEWS_PATH   = path.join(REPO_PATH, 'src\\app\\components\\admin\\views');
const SERVICES_PATH= path.join(REPO_PATH, 'src\\app\\services');
const MODULES_PATH = path.join(REPO_PATH, 'src\\modules');

// Leer credenciales desde el archivo de config del repo
let SUPABASE_URL = 'https://yomgqobfmgatavnbtvdz.supabase.co';
let SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbWdxb2JmbWdhdGF2bmJ0dmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzAzMTksImV4cCI6MjA4NjAwNjMxOX0.yZ9Zb6Jz9BKZTkn7Ld8TzeLyHsb8YhBAoCvFLPBiqZk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// MAPEO viewFile → serviceKey
// ─────────────────────────────────────────────────────────────────────────────
function inferServiceKey(viewFile) {
  // Quitar sufijo View/Workspace, pasar a camelCase minúscula
  const base = viewFile
    .replace(/View$|Workspace$/, '')
    .replace(/^([A-Z])/, c => c.toLowerCase());

  // Buscar si existe {base}Api.ts o {base}s Api.ts (plural)
  const candidates = [
    `${base}Api.ts`,
    `${base}sApi.ts`,
    `${base.replace(/s$/, '')}Api.ts`,
  ];

  for (const c of candidates) {
    if (fs.existsSync(path.join(SERVICES_PATH, c))) {
      return c.replace('Api.ts', '');
    }
  }

  // Mapeo manual para casos irregulares
  const manual = {
    'Pagos':              'metodosPago',
    'MapaEnvios':         'mapaEnvios',
    'MetodosEnvio':       'metodosEnvio',
    'MetodosPago':        'metodosPago',
    'TrackingPublico':    'tracking',
    'GoogleMapsTest':     null,
    'Ecommerce':          null,
    'Logistica':          null,
    'Marketing':          null,
    'Herramientas':       null,
    'Sistema':            null,
    'Dashboard':          null,
    'AdminDashboard':     null,
    'UserDashboard':      null,
    'Gestion':            null,
    'AuditoriaHub':       null,
    'ERPCRM':             null,
    'ERPInventario':      null,
    'ERPFacturacion':     null,
    'ERPCompras':         null,
    'ERPContabilidad':    null,
    'ERPRRHH':            null,
    'RRSSHub':            null,
    'Integraciones':      null,
    'IntegracionesPagos': null,
    'IntegracionesLogistica': null,
    'IntegracionesIdentidad': null,
    'IntegracionesMarketplace': null,
    'IntegracionesComunicacion': null,
    'IntegracionesRRSS':  null,
    'IntegracionesServicios': null,
    'IntegracionesTiendas': null,
  };

  const basePascal = viewFile.replace(/View$|Workspace$/, '');
  if (basePascal in manual) return manual[basePascal];

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO FUNCIONAL
// ─────────────────────────────────────────────────────────────────────────────
function inferGrupo(viewFile) {
  const grupos = {
    Logistica: ['AbastecimientoView','DepositosView','EntregasView','EnviosView',
      'FulfillmentView','InventarioView','MapaEnviosView','ProduccionView',
      'RutasView','TrackingPublicoView','TransportistasView','VehiculosView','LogisticaView'],
    eCommerce: ['PedidosView','PagosView','MetodosPagoView','MetodosEnvioView',
      'EcommerceView','SecondHandView','POSView','CargaMasivaView'],
    CRM: ['PersonasView','OrganizacionesView','ClientesView','FidelizacionView'],
    ERP: ['DepartamentosView','ERPCRMView','ERPInventarioView','ERPFacturacionView',
      'ERPComprasView','ERPContabilidadView','ERPRRHHView'],
    Marketing: ['GoogleAdsView','MailingView','SEOView','RedesSocialesView',
      'RRSSHubView','MigracionRRSSView','MetaBusinessView','MetaMapView',
      'EtiquetaEmotivaView','RuedaSorteosView','MarketingView'],
    Herramientas: ['BibliotecaWorkspace','EditorImagenesWorkspace','GenDocumentosWorkspace',
      'ImpresionWorkspace','QrGeneratorView','OCRWorkspace','GenPresupuestosWorkspace',
      'UnifiedWorkspaceView','HerramientasView','GoogleMapsTestView'],
    Sistema: ['ChecklistView','IdeasBoardView','ConstructorView','SistemaView',
      'AdminDashboardView','ConfigVistasPorRolView','APIKeysView','HealthMonitorView',
      'SystemLogsView','DocumentacionView','RepositorioAPIsView','WebhooksView',
      'AuthRegistroView','DisenoView','AuditoriaHubView','CargaMasivaView',
      'IdeasView','ConstructorModulos','ConstruccionView'],
    Dashboard: ['DashboardView','UserDashboardView','GestionView'],
    Integraciones: ['IntegracionesView','IntegracionesPagosView','IntegracionesLogisticaView',
      'IntegracionesIdentidadView','IntegracionesMarketplaceView','IntegracionesComunicacionView',
      'IntegracionesRRSSView','IntegracionesServiciosView','IntegracionesTiendasView'],
    Proyectos: ['ProyectosView'],
  };

  for (const [grupo, views] of Object.entries(grupos)) {
    if (views.includes(viewFile)) return grupo;
  }
  return 'Sin grupo';
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDITAR UN MÓDULO — 8 criterios
// ─────────────────────────────────────────────────────────────────────────────
function auditarModulo(viewFile) {
  const viewPath    = path.join(VIEWS_PATH, `${viewFile}.tsx`);
  const serviceKey  = inferServiceKey(viewFile);
  const servicePath = serviceKey ? path.join(SERVICES_PATH, `${serviceKey}Api.ts`) : null;
  const baseName    = viewFile.replace(/View$|Workspace$/, '').toLowerCase();
  const modulePath  = path.join(MODULES_PATH, baseName);

  // Leer contenido del view
  const viewContent = fs.existsSync(viewPath) ? fs.readFileSync(viewPath, 'utf8') : '';
  const serviceContent = (servicePath && fs.existsSync(servicePath))
    ? fs.readFileSync(servicePath, 'utf8') : '';

  const esHub = /Hub|Workspace/.test(viewFile) ||
    ['LogisticaView','MarketingView','HerramientasView','EcommerceView',
     'IntegracionesView','SistemaView','DashboardView','AdminDashboardView',
     'GestionView','UserDashboardView'].includes(viewFile);

  // ── C1: Tiene vista ───────────────────────────────────────────────────────
  const c1 = fs.existsSync(viewPath);

  // ── C2: Tiene backend ─────────────────────────────────────────────────────
  // Busca referencias a tablas en el service
  const c2_tablas = serviceContent.match(/\.from\(['"`](\w+)['"`]\)/g) ?? [];
  const c2 = esHub ? 'partial' : c2_tablas.length > 0 ? 'ok' : servicePath ? 'partial' : 'fail';
  const c2_detalle = esHub
    ? 'Hub — sin tabla directa por diseño'
    : c2_tablas.length > 0
    ? `Tablas: ${[...new Set(c2_tablas.map(t => t.match(/['"`](\w+)['"`]/)[1]))].join(', ')}`
    : servicePath ? 'Service existe pero sin .from() detectado' : 'Sin service ni tabla verificada';

  // ── C3: Tiene service layer ───────────────────────────────────────────────
  const c3 = servicePath && fs.existsSync(servicePath) ? 'ok' : esHub ? 'partial' : 'fail';
  const c3_detalle = c3 === 'ok'
    ? `${serviceKey}Api.ts encontrado`
    : esHub ? 'Hub — sin service propio' : 'No existe archivo de servicio';

  // Verificar métodos CRUD en el service
  const tieneCRUD = serviceContent.includes('getAll') || serviceContent.includes('getById');

  // ── C4: Tiene module.config.ts ────────────────────────────────────────────
  const configPath = path.join(modulePath, 'module.config.ts');
  const c4 = fs.existsSync(configPath) ? 'ok' : 'fail';
  const c4_detalle = c4 === 'ok' ? 'module.config.ts presente' : 'Falta en src/modules/' + baseName + '/';

  // ── C5: Sin colores hardcodeados ──────────────────────────────────────────
  const hexMatches  = viewContent.match(/#[0-9A-Fa-f]{3,6}\b/g) ?? [];
  const rgbMatches  = viewContent.match(/rgb\s*\(/g) ?? [];
  const totalHardcoded = hexMatches.length + rgbMatches.length;
  const c5 = totalHardcoded === 0 ? 'ok' : totalHardcoded <= 3 ? 'partial' : 'fail';
  const c5_detalle = totalHardcoded === 0
    ? 'Sin colores hardcodeados'
    : `${totalHardcoded} ocurrencias: ${[...new Set(hexMatches)].slice(0, 5).join(', ')}${hexMatches.length > 5 ? '...' : ''}`;

  // ── C6: Tokens CSS ────────────────────────────────────────────────────────
  const tokensPath = path.join(modulePath, 'ui', 'tokens.css');
  const c6 = fs.existsSync(tokensPath) ? 'ok' : 'fail';
  const c6_detalle = c6 === 'ok' ? 'tokens.css presente' : 'Falta en src/modules/' + baseName + '/ui/';

  // ── C7: Party Model ───────────────────────────────────────────────────────
  const tablasDirect = ['transportistas','clientes','couriers','proveedores','contactos'];
  const c7_violaciones = tablasDirect.filter(t =>
    serviceContent.includes(`from('${t}')`) || serviceContent.includes(`from("${t}")`)
  );
  const c7 = c7_violaciones.length === 0 ? 'ok' : 'partial';
  const c7_detalle = c7_violaciones.length === 0
    ? 'Sin tablas directas detectadas'
    : `Tablas directas: ${c7_violaciones.join(', ')} — migrar a Party Model`;

  // ── C8: Data Zero ─────────────────────────────────────────────────────────
  const usaSupabaseDirecto = serviceContent.includes("import { supabase }") ||
    serviceContent.includes('import {supabase}');
  const usaUseTable = serviceContent.includes('useTable(') ||
    viewContent.includes('useTable(');
  const esCharlieCompleto = fs.existsSync(path.join(modulePath, 'module.config.ts'));

  const c8 = esCharlieCompleto && usaUseTable ? 'ok'
    : usaUseTable ? 'ok'
    : usaSupabaseDirecto ? 'partial'
    : c3 === 'fail' ? 'fail'
    : 'partial';
  const c8_detalle = usaUseTable
    ? 'useTable() implementado'
    : usaSupabaseDirecto
    ? 'Usa supabase directo — migrar a useTable()'
    : 'No verificable sin service layer';

  // ── Score ──────────────────────────────────────────────────────────────────
  const statusToNum = (s) => s === 'ok' ? 1 : 0;
  const score = [c1,c2,c3,c4,c5,c6,c7,c8].map(s => typeof s === 'boolean' ? (s ? 1 : 0) : statusToNum(s))
    .reduce((a, b) => a + b, 0);

  // ── Estructura ────────────────────────────────────────────────────────────
  const estructura = esCharlieCompleto ? 'charlie' : score >= 4 ? 'partial' : 'legacy';

  return {
    view_file:  viewFile,
    nombre:     viewFile.replace(/View$|Workspace$/, '').replace(/([A-Z])/g, ' $1').trim(),
    grupo:      inferGrupo(viewFile),
    estructura,
    score,
    service_key: serviceKey,
    tiene_servicio: c3 === 'ok',
    tiene_module_config: c4 === 'ok',
    tiene_tokens: c6 === 'ok',
    tiene_schema: c2 === 'ok',
    tiene_adapter: esCharlieCompleto,
    es_hub: esHub,
    criterios: {
      C1: { status: c1 ? 'ok' : 'fail', detalle: c1 ? `${viewFile}.tsx encontrado` : 'Archivo no encontrado' },
      C2: { status: c2, detalle: c2_detalle },
      C3: { status: c3, detalle: c3_detalle },
      C4: { status: c4, detalle: c4_detalle },
      C5: { status: c5, detalle: c5_detalle },
      C6: { status: c6, detalle: c6_detalle },
      C7: { status: c7, detalle: c7_detalle },
      C8: { status: c8, detalle: c8_detalle },
    },
    hardcoded_colors: [...new Set(hexMatches)].slice(0, 10),
    tablas_directas: (serviceContent.match(/\.from\(['"`](\w+)['"`]\)/g) ?? [])
      .map(t => t.match(/['"`](\w+)['"`]/)[1]),
    tiene_crud: tieneCRUD,
    updated_at: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Charlie Platform — Scanner de Repositorio ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // Leer todos los views del repo
  const allFiles = fs.readdirSync(VIEWS_PATH)
    .filter(f => f.endsWith('.tsx'))
    .map(f => f.replace('.tsx', ''));

  console.log(`📁 Repositorio: ${REPO_PATH}`);
  console.log(`📦 Módulos encontrados: ${allFiles.length}\n`);

  // Auditar cada módulo
  const resultados = [];
  for (const viewFile of allFiles) {
    const r = auditarModulo(viewFile);
    resultados.push(r);
    const icon = r.estructura === 'charlie' ? '✅' : r.estructura === 'partial' ? '🟡' : '🔴';
    console.log(`${icon} [${r.score}/8] ${r.view_file.padEnd(35)} ${r.grupo}`);
  }

  // Resumen
  const charlie = resultados.filter(r => r.estructura === 'charlie').length;
  const partial = resultados.filter(r => r.estructura === 'partial').length;
  const legacy  = resultados.filter(r => r.estructura === 'legacy').length;
  const avgScore = (resultados.reduce((s, r) => s + r.score, 0) / resultados.length).toFixed(1);

  console.log('\n──────────────────────────────────────────');
  console.log(`✅ Charlie completo: ${charlie}`);
  console.log(`🟡 Parcial:          ${partial}`);
  console.log(`🔴 Legacy:           ${legacy}`);
  console.log(`📊 Score promedio:   ${avgScore}/8`);
  console.log('──────────────────────────────────────────\n');

  // Guardar en Supabase
  console.log('💾 Guardando en Supabase...');

  // Upsert por view_file
  const { error } = await supabase
    .from('repositorio_modulos')
    .upsert(
      resultados.map(r => ({
        view_file:          r.view_file,
        nombre:             r.nombre,
        grupo:              r.grupo,
        estructura:         r.estructura,
        score:              r.score,
        service_key:        r.service_key,
        tiene_servicio:     r.tiene_servicio,
        tiene_module_config:r.tiene_module_config,
        tiene_tokens:       r.tiene_tokens,
        tiene_schema:       r.tiene_schema,
        tiene_adapter:      r.tiene_adapter,
        es_hub:             r.es_hub,
        criterios:          r.criterios,
        hardcoded_colors:   r.hardcoded_colors,
        tablas_directas:    r.tablas_directas,
        tiene_crud:         r.tiene_crud,
        updated_at:         r.updated_at,
      })),
      { onConflict: 'view_file' }
    );

  if (error) {
    console.error('❌ Error al guardar:', error.message);
    console.log('\n💡 Si la tabla no existe, ejecutá este SQL en Supabase:\n');
    console.log(SQL_SCHEMA);
  } else {
    console.log(`✅ ${resultados.length} módulos guardados en repositorio_modulos`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SQL para crear la tabla (mostrado si falla el upsert)
// ─────────────────────────────────────────────────────────────────────────────
const SQL_SCHEMA = `
CREATE TABLE IF NOT EXISTS repositorio_modulos (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  view_file           text UNIQUE NOT NULL,
  nombre              text,
  grupo               text,
  estructura          text,
  score               integer,
  service_key         text,
  tiene_servicio      boolean DEFAULT false,
  tiene_module_config boolean DEFAULT false,
  tiene_tokens        boolean DEFAULT false,
  tiene_schema        boolean DEFAULT false,
  tiene_adapter       boolean DEFAULT false,
  es_hub              boolean DEFAULT false,
  criterios           jsonb,
  hardcoded_colors    text[],
  tablas_directas     text[],
  tiene_crud          boolean DEFAULT false,
  updated_at          timestamptz DEFAULT now()
);
`;

main().catch(console.error);
