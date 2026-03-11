f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\DrawerAuditoria.tsx'
content = open(f, encoding='utf-8').read()

old = "  const criterioIds = (criteriosFS.length > 0 ? criteriosFS : modulo.criteriosIniciales ?? []).map(c => c.id);"

new = """  // Siempre mostrar C1-C8. Fuente de IDs: criteriosFS > criteriosIniciales > C1-C8 fijo
  const CRITERIOS_BASE = ['C1','C2','C3','C4','C5','C6','C7','C8'];
  const criterioIds = criteriosFS.length > 0
    ? criteriosFS.map(c => c.id)
    : (modulo.criteriosIniciales ?? []).length > 0
      ? modulo.criteriosIniciales!.map(c => c.id)
      : CRITERIOS_BASE;"""

result = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old in content else 'NO MATCH')
