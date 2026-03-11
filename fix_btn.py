f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
content = open(f, encoding='utf-8').read()

old = """          <span style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>"""

new = """          <button
            onClick={() => { setNuevoModulo(true); setNmResultado(null); setNmNombre(''); setNmTabla(''); setNmDesc(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', backgroundColor: '#FF6835', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
          >
            <Plus size={13} /> Nuevo m\u00f3dulo
          </button>
          <span style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>"""

result = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old in content else 'NO MATCH')
