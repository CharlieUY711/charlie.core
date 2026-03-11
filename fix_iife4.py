f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
lines = open(f, encoding='utf-8').readlines()

idx = next(i for i, l in enumerate(lines) if 'export function RepositorioView' in l)
print(f'Insertando antes de linea {idx+1}')

component = [
    'function GrupoStats({ mods, scoresDB }: { mods: ModuloRepo[]; scoresDB: Record<string,number> }) {\n',
    '  const ok      = mods.filter(m => (scoresDB[m.id] ?? m.score) === 8).length;\n',
    "  const parcial = mods.filter(m => { const s = scoresDB[m.id] ?? m.score; return s >= 4 && s < 8; }).length;\n",
    '  const mal     = mods.filter(m => (scoresDB[m.id] ?? m.score) < 4).length;\n',
    '  const avg     = Math.round(mods.reduce((a, m) => a + (scoresDB[m.id] ?? m.score), 0) / mods.length * 10) / 10;\n',
    '  return (\n',
    "    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>\n",
    "      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: 'var(--m-success-bg)', color: 'var(--m-success-text)', border: '1px solid var(--m-success-border)' }}>{ok} \u2713</span>\n",
    "      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: 'var(--m-warning-bg)', color: 'var(--m-warning-text)', border: '1px solid var(--m-warning-border)' }}>{parcial} \u25cf</span>\n",
    "      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: 'var(--m-danger-bg)', color: 'var(--m-danger-text)', border: '1px solid var(--m-danger-border)' }}>{mal} \u2715</span>\n",
    "      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--m-text-muted)', marginLeft: 2 }}>\u00d8{avg}/8</span>\n",
    '    </div>\n',
    '  );\n',
    '}\n',
    '\n',
]

lines = lines[:idx] + component + lines[idx:]
open(f, 'w', encoding='utf-8').writelines(lines)
print('OK')
