f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
content = open(f, encoding='utf-8').read()

# 1. Agregar import de useRegisterActions
old_import = "import { Plus } from 'lucide-react';"
new_import = "import { Plus } from 'lucide-react';\nimport { useRegisterActions } from '../../shells/ActionBarContext';"
content = content.replace(old_import, new_import)

# 2. Agregar useRegisterActions con buscador + boton
old_effect = "    return () => setSubtitulo(null);\n  }, [scoresDB]);"
new_effect = """    return () => setSubtitulo(null);
  }, [scoresDB]);

  useRegisterActions({
    searchPlaceholder: 'Buscar m\u00f3dulo...',
    onSearch: (q) => setSearch(q),
    buttons: [
      {
        label:   'Nuevo m\u00f3dulo',
        primary: true,
        icon:    Plus,
        onClick: () => { setNuevoModulo(true); setNmResultado(null); setNmNombre(''); setNmTabla(''); setNmDesc(''); },
      },
    ],
  }, []);"""
content = content.replace(old_effect, new_effect)

# 3. Quitar buscador y boton del toolbar interno si existen
old_btn = """          <button
            onClick={() => { setNuevoModulo(true); setNmResultado(null); setNmNombre(''); setNmTabla(''); setNmDesc(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', backgroundColor: '#FF6835', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
          >
            <Plus size={13} /> Nuevo m\u00f3dulo
          </button>
          """
content = content.replace(old_btn, "          ")

open(f, 'w', encoding='utf-8').write(content)
print('OK')
