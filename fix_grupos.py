f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
content = open(f, encoding='utf-8').read()

old = """              <div style={{ ...S.grupoHeader, cursor: 'pointer' }} onClick={() => toggleGrupo(grupo)}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: GRUPO_COLORS[grupo] ?? '#9ca3af' }} />
                <span style={{ ...S.grupoLabel, color: GRUPO_COLORS[grupo] ?? '#6B7280' }}>{grupo}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{mods.length} módulos</span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#F3F4F6' }} />
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 6 }}>{gruposColapsados.has(grupo) ? '\u25b6' : '\u25bc'}</span>
              </div>"""

new = """              <div style={{ ...S.grupoHeader, cursor: 'pointer' }} onClick={() => toggleGrupo(grupo)}>
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
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>{ok} \u2713</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#FFF7ED', color: '#92400E', border: '1px solid #FED7AA' }}>{parcial} \u25cf</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>{mal} \u2715</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginLeft: 2 }}>\u00d8{avg}/8</span>
                    </div>
                  );
                })()}
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 6 }}>{gruposColapsados.has(grupo) ? '\u25b6' : '\u25bc'}</span>
              </div>"""

result = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old in content else 'NO MATCH')
