f = r'C:\Carlos\charlie-workspace\charlie.core\vite-plugin-audit.ts'
content = open(f, encoding='utf-8').read()

# Agregar endpoint GET /api/modules antes del cierre del configureServer
old = "      server.middlewares.use('/api/audit', (req, res) => {"

new = """      // GET /api/modules — lista dinamica desde filesystem
      server.middlewares.use('/api/modules', (req, res) => {
        if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
        try {
          const files = fs.readdirSync(VIEWS_DIR);
          const modulos = files
            .filter(f => f.endsWith('View.tsx') || f.endsWith('Workspace.tsx'))
            .filter(f => !Array.from(HUBS).some(h => f === h + '.tsx'))
            .map(f => {
              const viewFile = f.replace('.tsx', '');
              const moduloId = viewFile.replace(/View$|Workspace$/, '').toLowerCase();
              const serviceKey = VIEW_SERVICE_MAP[viewFile] ?? null;
              const configPath = path.join(MODULES_DIR, moduloId, 'module.config.ts');
              let grupo = 'General';
              let nombre = viewFile.replace(/View$|Workspace$/, '');
              if (fs.existsSync(configPath)) {
                const cfg = fs.readFileSync(configPath, 'utf-8');
                const gMatch = cfg.match(/grupo['"\\s]*:['"\\s]*['"]([^'"]+)['"]/);
                const nMatch = cfg.match(/nombre['"\\s]*:['"\\s]*['"]([^'"]+)['"]/);
                if (gMatch) grupo = gMatch[1];
                if (nMatch) nombre = nMatch[1];
              }
              return { id: moduloId, viewFile, nombre, grupo, serviceKey };
            });
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ modulos, total: modulos.length }));
        } catch (e: any) {
          res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
        }
      });

      server.middlewares.use('/api/audit', (req, res) => {"""

result = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old in content else 'NO MATCH')
