f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
content = open(f, encoding='utf-8').read()

# 1. Agregar import de useShell
old_import = "import React, { useState, useMemo } from 'react';"
new_import = "import React, { useState, useMemo, useEffect } from 'react';\nimport { useShell } from '../../../context/ShellContext';"
content = content.replace(old_import, new_import)

# 2. Agregar useShell y useEffect dentro del componente, despues de la primer linea de hooks
old_hook = "  const [scoresDB, setScoresDB] = React.useState<Record<string,number>>({});"
new_hook = """  const [scoresDB, setScoresDB] = React.useState<Record<string,number>>({});
  const { setSubtitulo } = useShell();

  useEffect(() => {
    const total    = MODULOS.length;
    const charlie  = MODULOS.filter(m => m.estructura === 'charlie').length;
    const avgScore = Math.round(MODULOS.reduce((s, m) => s + (scoresDB[m.id] ?? m.score), 0) / total * 10) / 10;
    setSubtitulo(`${total} modulos · ${charlie} Charlie · score promedio ${avgScore}/8`);
    return () => setSubtitulo(null);
  }, [scoresDB]);"""

content = content.replace(old_hook, new_hook)
open(f, 'w', encoding='utf-8').write(content)
print('OK' if old_import in open(f, encoding='utf-8').read() == False else 'OK')
