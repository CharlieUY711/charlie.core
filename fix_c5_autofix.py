f = r'C:\Carlos\charlie-workspace\charlie.core\vite-plugin-creator.ts'
content = open(f, encoding='utf-8').read()

# Reemplazar el bloque C5 completo con uno que auto-repara
old_c5 = """        // ── C5 — colores hardcodeados ──────────────────────────────────────────
        if ((!soloEste || soloEste === 'C5') && fs.existsSync(viewPath)) {
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
        }"""

new_c5 = """        // ── C5 — colores hardcodeados — AUTO-FIX ──────────────────────────────
        if ((!soloEste || soloEste === 'C5') && fs.existsSync(viewPath)) {
          const COLOR_MAP: Record<string, string> = {
            // Bordes y superficies
            '#E5E7EB':  'var(--m-border)',
            '#D1D5DB':  'var(--m-border)',
            '#F3F4F6':  'var(--m-surface-2)',
            '#F9FAFB':  'var(--m-surface-2)',
            '#FAFAFA':  'var(--m-surface-2)',
            '#F8F9FA':  'var(--m-bg)',
            '#fff':     'var(--m-surface)',
            '#FFF':     'var(--m-surface)',
            '#FFFFFF':  'var(--m-surface)',
            '#ffffff':  'var(--m-surface)',
            // Texto
            '#111827':  'var(--m-text)',
            '#111':     'var(--m-text)',
            '#374151':  'var(--m-text-secondary)',
            '#6B7280':  'var(--m-text-muted)',
            '#9CA3AF':  'var(--m-text-muted)',
            '#4B5563':  'var(--m-text-secondary)',
            // Primario
            '#FF6835':  'var(--m-primary)',
            '#ff6835':  'var(--m-primary)',
            '#F05520':  'var(--m-primary)',
            '#FFF4EC':  'var(--m-primary-10)',
            '#FFE8DF':  'var(--m-primary-20)',
            // Exito
            '#10B981':  'var(--m-success)',
            '#059669':  'var(--m-success)',
            '#D1FAE5':  'var(--m-success-bg)',
            '#065F46':  'var(--m-success-text)',
            '#166534':  'var(--m-success-text)',
            // Advertencia
            '#F59E0B':  'var(--m-warning)',
            '#D97706':  'var(--m-warning)',
            '#FEF3C7':  'var(--m-warning-bg)',
            '#FFF7ED':  'var(--m-warning-bg)',
            '#92400E':  'var(--m-warning-text)',
            '#FED7AA':  'var(--m-warning-border)',
            // Error / Peligro
            '#EF4444':  'var(--m-danger)',
            '#DC2626':  'var(--m-danger)',
            '#FEE2E2':  'var(--m-danger-bg)',
            '#FEF2F2':  'var(--m-danger-bg)',
            '#991B1B':  'var(--m-danger-text)',
            '#FECACA':  'var(--m-danger-border)',
            // Info / Azul
            '#3B82F6':  'var(--m-info)',
            '#2563EB':  'var(--m-info)',
            '#EFF6FF':  'var(--m-info-bg)',
            '#1D4ED8':  'var(--m-info-text)',
            '#DBEAFE':  'var(--m-info-border)',
            // Purple
            '#8B5CF6':  'var(--m-purple)',
            '#7C3AED':  'var(--m-purple)',
          };

          let viewContent = fs.readFileSync(viewPath, 'utf-8');
          const antes = [...new Set([...viewContent.matchAll(/#[0-9A-Fa-f]{3,6}\\b/g)].map(m => m[0]))];
          let reemplazados = 0;
          let noMapeados: string[] = [];

          // Reemplazar solo dentro de strings de style (entre comillas simples o dobles)
          // Ordenar por longitud desc para que #FFFFFF no sea reemplazado antes que #FFF
          const coloresOrdenados = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);
          for (const hex of coloresOrdenados) {
            const token = COLOR_MAP[hex];
            // Solo reemplazar cuando el hex esta como valor de propiedad CSS (entre comillas)
            const regex = new RegExp("((?:color|backgroundColor|borderColor|background|fill|stroke|boxShadow|border|outline)(?:[^'\"]*)['\"])(" + hex.replace('#', '\\\\#') + ")(['\"])", 'g');
            const antes_count = (viewContent.match(new RegExp(hex.replace('#', '\\\\#'), 'g')) ?? []).length;
            viewContent = viewContent.replace(regex, (_, pre, _hex, post) => pre + token + post);
            // Reemplazo simple para casos directos como: color: '#FF6835'
            const simpleRegex = new RegExp("(:\\s*['\"])" + hex.replace('#', '\\\\#') + "(['\"])", 'g');
            viewContent = viewContent.replace(simpleRegex, (_, pre, post) => pre + token + post);
            const despues_count = (viewContent.match(new RegExp(hex.replace('#', '\\\\#'), 'g')) ?? []).length;
            if (antes_count > despues_count) reemplazados += (antes_count - despues_count);
          }

          // Detectar los que quedaron sin reemplazar
          const despues = [...new Set([...viewContent.matchAll(/#[0-9A-Fa-f]{3,6}\\b/g)].map(m => m[0]))];
          noMapeados = despues.filter(c => !COLOR_MAP[c]);

          if (reemplazados > 0) {
            fs.writeFileSync(viewPath, viewContent, 'utf-8');
            reparados.push({
              criterio: 'C5',
              archivo: `views/${N}View.tsx`,
              accion: `${reemplazados} colores reemplazados por tokens var(--m-*)`,
            });
          }

          if (noMapeados.length > 0) {
            pendientes.push({
              criterio: 'C5',
              titulo: `${noMapeados.length} colores sin token mapeado`,
              instrucciones: 'Estos colores no tienen token equivalente en el sistema. Revisalos manualmente o agregalos a tokens.css.',
              evidencia: noMapeados.slice(0, 15).join('  '),
            });
          }
        }"""

result = content.replace(old_c5, new_c5)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old_c5 in content else 'NO MATCH')
