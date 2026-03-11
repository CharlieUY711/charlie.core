f = r'C:\Carlos\charlie-workspace\charlie.core\vite-plugin-creator.ts'
content = open(f, encoding='utf-8').read()

repair_endpoint = '''
// ─── ENDPOINT REPARADOR ───────────────────────────────────────────────────────

export function repairModuleEndpoint(server: any) {
  server.middlewares.use('/api/repair-module', (req: any, res: any) => {
    if (req.method !== 'POST') {
      res.writeHead(405); res.end(JSON.stringify({ error: 'Method not allowed' })); return;
    }

    let body = '';
    req.on('data', (chunk: any) => body += chunk);
    req.on('end', () => {
      try {
        const { moduloId, nombre, tabla, grupo, descripcion } = JSON.parse(body);
        const id  = moduloId ?? nombre?.toLowerCase().replace(/\\s+/g, '');
        const N   = id.charAt(0).toUpperCase() + id.slice(1);
        const serviceKey = tabla ?? id;

        const reparados:  { criterio: string; archivo: string; accion: string }[] = [];
        const pendientes: { criterio: string; titulo: string; instrucciones: string; evidencia?: string }[] = [];

        // ── C1 — View ──────────────────────────────────────────────────────────
        const viewPath = path.join(VIEWS_DIR, `${N}View.tsx`);
        if (!fs.existsSync(viewPath)) {
          fs.writeFileSync(viewPath, tplView(id, serviceKey), 'utf-8');
          reparados.push({ criterio: 'C1', archivo: `views/${N}View.tsx`, accion: 'Creado View base' });
        }

        // ── C3 — Api ───────────────────────────────────────────────────────────
        const apiPath = path.join(SERVICES_DIR, `${id}Api.ts`);
        if (!fs.existsSync(apiPath)) {
          fs.writeFileSync(apiPath, tplApi(id, serviceKey), 'utf-8');
          reparados.push({ criterio: 'C3', archivo: `services/${id}Api.ts`, accion: 'Creado service layer base' });
        } else {
          // C8 — verificar .from() en Api existente
          const apiContent = fs.readFileSync(apiPath, 'utf-8');
          const fromMatches = [...apiContent.matchAll(/supabase\.from\(['"](\w+)['"]\)/g)];
          if (fromMatches.length > 0) {
            pendientes.push({
              criterio: 'C8',
              titulo: `${fromMatches.length} llamadas directas a supabase.from()`,
              instrucciones: `Migrar cada .from() a una funcion en ${id}Api.ts y llamarla desde el View.`,
              evidencia: fromMatches.map(m => m[0]).join(', '),
            });
          }
        }

        // ── C4 — module.config.ts ──────────────────────────────────────────────
        const modDir    = path.join(MODULES_DIR, id);
        const configPath = path.join(modDir, 'module.config.ts');
        if (!fs.existsSync(modDir)) fs.mkdirSync(modDir, { recursive: true });
        if (!fs.existsSync(configPath)) {
          fs.writeFileSync(configPath, tplConfig(id, grupo ?? 'Sin grupo', descripcion ?? ''), 'utf-8');
          reparados.push({ criterio: 'C4', archivo: `modules/${id}/module.config.ts`, accion: 'Creado module.config.ts' });
        }

        // ── C5 — colores hardcodeados ──────────────────────────────────────────
        if (fs.existsSync(viewPath)) {
          const viewContent = fs.readFileSync(viewPath, 'utf-8');
          const hexMatches  = [...new Set([...viewContent.matchAll(/#[0-9A-Fa-f]{3,6}\\b/g)].map(m => m[0]))];
          const rgbMatches  = [...new Set([...viewContent.matchAll(/rgb\\([^)]+\\)/g)].map(m => m[0]))];
          if (hexMatches.length > 0 || rgbMatches.length > 0) {
            pendientes.push({
              criterio: 'C5',
              titulo: `${hexMatches.length + rgbMatches.length} colores hardcodeados encontrados`,
              instrucciones: 'Reemplazar cada valor por el token correspondiente de tokens.css usando var(--m-*).',
              evidencia: [...hexMatches.slice(0, 10), ...rgbMatches.slice(0, 5)].join('  '),
            });
          }
        }

        // ── C6 — tokens.css ───────────────────────────────────────────────────
        const uiDir      = path.join(modDir, 'ui');
        const tokensPath = path.join(uiDir, 'tokens.css');
        if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });
        if (!fs.existsSync(tokensPath)) {
          fs.writeFileSync(tokensPath, tplTokens(id), 'utf-8');
          reparados.push({ criterio: 'C6', archivo: `modules/${id}/ui/tokens.css`, accion: 'Creado tokens.css con variables --m-*' });
        }

        // ── C2 — tabla Supabase ───────────────────────────────────────────────
        if (!tabla) {
          pendientes.push({
            criterio: 'C2',
            titulo: 'Tabla Supabase no verificada',
            instrucciones: `Crear tabla "${id}" en Supabase con columnas: id (uuid), nombre (text), estado (text), created_at (timestamptz), updated_at (timestamptz). Habilitar RLS y agregar policy allow_all.`,
          });
        }

        // ── C7 — Party Model ──────────────────────────────────────────────────
        pendientes.push({
          criterio: 'C7',
          titulo: 'Party Model — requiere auditoría manual',
          instrucciones: 'Verificar que el módulo usa organizaciones + roles_contextuales en lugar de tablas de clientes/transportistas directas. Si aplica, migrar las relaciones.',
        });

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ok: true, moduloId: id, reparados, pendientes }));

      } catch (e: any) {
        res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
      }
    });
  });
}
'''

content = content + repair_endpoint
open(f, 'w', encoding='utf-8').write(content)
print('OK')
