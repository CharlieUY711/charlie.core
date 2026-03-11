// vite-plugin-audit.ts
// Expone GET /api/audit/:moduloId que escanea el filesystem real
import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

const ROOT        = path.resolve(__dirname, 'src');
const VIEWS_DIR   = path.join(ROOT, 'app/components/admin/views');
const SERVICES_DIR = path.join(ROOT, 'app/services');
const MODULES_DIR  = path.join(ROOT, 'modules');

const VIEW_SERVICE_MAP: Record<string, string> = {
  AbastecimientoView: 'abastecimiento', DepartamentosView: 'departamentos',
  DepositosView: 'depositos', EntregasView: 'entregas', EnviosView: 'envios',
  FulfillmentView: 'fulfillment', InventarioView: 'inventario',
  MapaEnviosView: 'mapaEnvios', MetodosEnvioView: 'metodosEnvio',
  MetodosPagoView: 'metodosPago', OrganizacionesView: 'organizaciones',
  PagosView: 'metodosPago', PedidosView: 'pedidos', PersonasView: 'personas',
  ProduccionView: 'produccion', RutasView: 'rutas', TrackingPublicoView: 'tracking',
  TransportistasView: 'transportistas', VehiculosView: 'vehiculos',
  GoogleAdsView: 'marketing', MailingView: 'marketing', RedesSocialesView: 'rrss',
};

const HUBS = new Set([
  'LogisticaView','MarketingView','HerramientasView','EcommerceView',
  'IntegracionesView','SistemaView','DashboardView','AdminDashboardView',
  'GestionView','UserDashboardView'
]);

// moduloId → viewFile (ej: 'envios' → 'EnviosView')
function findViewFile(moduloId: string): string | null {
  const files = fs.readdirSync(VIEWS_DIR);
  const match = files.find(f => f.replace(/View\.tsx$|Workspace\.tsx$/, '').toLowerCase() === moduloId);
  return match ? match.replace('.tsx', '') : null;
}

function auditModulo(moduloId: string) {
  const viewFile = findViewFile(moduloId);
  if (!viewFile) return null;

  const viewPath    = path.join(VIEWS_DIR, `${viewFile}.tsx`);
  const serviceKey  = VIEW_SERVICE_MAP[viewFile] ?? null;
  const esHub       = HUBS.has(viewFile);
  const criterios: any[] = [];

  // C1 — Existe el archivo view
  const c1ok = fs.existsSync(viewPath);
  criterios.push({ id: 'C1', status: c1ok ? 'ok' : 'fail', detalle: c1ok ? `${viewFile}.tsx encontrado` : `No existe ${viewFile}.tsx`, auto: true });

  // C2 — Tiene schema/tabla
  let c2status = 'fail', c2detalle = 'Sin tabla verificada';
  if (esHub) { c2status = 'partial'; c2detalle = 'Hub — sin tabla directa por diseño'; }
  else if (serviceKey) {
    const apiPath = path.join(SERVICES_DIR, `${serviceKey}Api.ts`);
    const schemaFiles = fs.readdirSync(ROOT, { recursive: true } as any) as string[];
    const hasSchema = schemaFiles.some((f: string) => f.includes('.sql') && f.includes(serviceKey));
    if (hasSchema) { c2status = 'ok'; c2detalle = `schema encontrado para ${serviceKey}`; }
    else if (fs.existsSync(apiPath)) { c2status = 'partial'; c2detalle = 'Api existe pero sin schema.sql verificado'; }
  }
  criterios.push({ id: 'C2', status: c2status, detalle: c2detalle, auto: true });

  // C3 — Existe *Api.ts
  let c3status = 'fail', c3detalle = 'No existe archivo de servicio';
  if (esHub) { c3status = 'partial'; c3detalle = 'Hub — sin service propio por diseño'; }
  else if (serviceKey) {
    const apiPath = path.join(SERVICES_DIR, `${serviceKey}Api.ts`);
    if (fs.existsSync(apiPath)) { c3status = 'ok'; c3detalle = `${serviceKey}Api.ts encontrado`; }
  }
  criterios.push({ id: 'C3', status: c3status, detalle: c3detalle, auto: true });

  // C4 — Existe module.config.ts
  const configPath = path.join(MODULES_DIR, moduloId, 'module.config.ts');
  const c4ok = fs.existsSync(configPath);
  criterios.push({ id: 'C4', status: c4ok ? 'ok' : 'fail', detalle: c4ok ? 'module.config.ts presente' : 'Falta module.config.ts', auto: false });

  // C5 — Sin colores hardcodeados
  let c5status = 'unknown', c5detalle = 'No verificado';
  if (fs.existsSync(viewPath)) {
    const content = fs.readFileSync(viewPath, 'utf-8');
    const hexCount = (content.match(/#[0-9A-Fa-f]{3,6}\b/g) ?? []).length;
    const rgbCount = (content.match(/rgb\(/g) ?? []).length;
    if (hexCount > 0 || rgbCount > 0) {
      c5status = 'fail'; c5detalle = `${hexCount} valores hex + ${rgbCount} rgb() hardcodeados`;
    } else {
      c5status = 'ok'; c5detalle = 'Sin colores hardcodeados detectados';
    }
  }
  criterios.push({ id: 'C5', status: c5status, detalle: c5detalle, auto: false });

  // C6 — Existe tokens.css
  const tokensPath = path.join(MODULES_DIR, moduloId, 'ui', 'tokens.css');
  const c6ok = fs.existsSync(tokensPath);
  criterios.push({ id: 'C6', status: c6ok ? 'ok' : 'fail', detalle: c6ok ? 'tokens.css presente' : 'Falta tokens.css', auto: false });

  // C7 — Party Model (manual)
  criterios.push({ id: 'C7', status: 'unknown', detalle: 'Requiere auditoría manual', auto: false });

  // C8 — Sin supabase.from() directo
  let c8status = 'unknown', c8detalle = 'Sin service layer para verificar';
  if (serviceKey) {
    const apiPath = path.join(SERVICES_DIR, `${serviceKey}Api.ts`);
    if (fs.existsSync(apiPath)) {
      const apiContent = fs.readFileSync(apiPath, 'utf-8');
      const fromCount = (apiContent.match(/\.from\(/g) ?? []).length;
      if (fromCount === 0) { c8status = 'ok'; c8detalle = 'Sin supabase.from() directo'; }
      else { c8status = 'fail'; c8detalle = `${fromCount} ocurrencias de .from() hardcodeado`; }
    }
  }
  criterios.push({ id: 'C8', status: c8status, detalle: c8detalle, auto: false });

  return { moduloId, viewFile, criterios, score: criterios.filter((c: any) => c.status === 'ok').length };
}

export function auditPlugin(): Plugin {
  return {
    name: 'vite-audit-plugin',
    configureServer(server) {
      server.middlewares.use('/api/audit', (req, res) => {
        const moduloId = req.url?.replace('/', '') ?? '';
        if (!moduloId) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'moduloId requerido' })); return;
        }
        const result = auditModulo(moduloId);
        if (!result) {
          res.writeHead(404); res.end(JSON.stringify({ error: `Módulo ${moduloId} no encontrado` })); return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(result));
      });
    },
  };
}
