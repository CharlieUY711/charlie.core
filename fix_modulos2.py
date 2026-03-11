f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
lines = open(f, encoding='utf-8').readlines()

# 1. Agregar estado de modulos despues de la linea de scoresDB
idx_scores = next(i for i, l in enumerate(lines) if 'const [scoresDB, setScoresDB]' in l)

new_state = [
    '\n',
    '  // Lista dinamica de modulos desde /api/modules (fallback a estatica)\n',
    '  const [modulos, setModulos] = React.useState<ModuloRepo[]>(MODULOS);\n',
    '\n',
    '  useEffect(() => {\n',
    "    fetch('/api/modules')\n",
    '      .then(r => r.json())\n',
    '      .then((data: { modulos: { id: string; viewFile: string; nombre: string; grupo: string }[] }) => {\n',
    '        if (!data.modulos?.length) return;\n',
    '        const dinamicos = data.modulos.map(m => {\n',
    '          const criterios = generarCriterios(m.viewFile);\n',
    "          const esCharlieCompleto = MODULOS_CHARLIE_COMPLETOS.has(m.id);\n",
    '          return {\n',
    '            id: m.id,\n',
    '            nombre: m.nombre,\n',
    '            viewFile: m.viewFile,\n',
    "            estructura: (esCharlieCompleto ? 'charlie' : criterios.filter(c => c.status === 'ok').length >= 4 ? 'partial' : 'legacy') as ModuloEstructura,\n",
    '            grupo: m.grupo !== "General" && m.grupo !== "Sin grupo" ? m.grupo : getGrupo(m.viewFile),\n',
    '            criterios,\n',
    '            score: calcularScore(criterios),\n',
    "            tieneServicio: !!(VIEW_SERVICE_MAP[m.viewFile] && SERVICIOS_DISPONIBLES.has(VIEW_SERVICE_MAP[m.viewFile])),\n",
    "            tieneModuleConfig: TIENE_MODULE_CONFIG.has(m.id),\n",
    "            tieneTokens: TIENE_TOKENS.has(m.id),\n",
    "            tieneSchema: TIENE_SCHEMA.has(VIEW_SERVICE_MAP[m.viewFile] ?? ''),\n",
    '            tieneAdapter: esCharlieCompleto,\n',
    '          };\n',
    '        });\n',
    '        setModulos(dinamicos);\n',
    '      })\n',
    '      .catch(() => {}); // fallback a MODULOS estatico\n',
    '  }, []);\n',
]

lines = lines[:idx_scores+1] + new_state + lines[idx_scores+1:]
open(f, 'w', encoding='utf-8').writelines(lines)
print(f'Insertado despues de linea {idx_scores+1}, OK')
