f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\DrawerAuditoria.tsx'
content = open(f, encoding='utf-8').read()

old = "  const isAuto   = (cid: string) => (criteriosFS.length > 0 ? criteriosFS : modulo.criteriosIniciales ?? []).find(c => c.id === cid)?.auto ?? false;\n  const getLabel = (cid: string) => (criteriosFS.length > 0 ? criteriosFS : modulo.criteriosIniciales ?? []).find(c => c.id === cid)?.label ?? cid;"

new = """  const LABEL_MAP: Record<string,string> = {
    C1: 'View.tsx existe', C2: 'Tabla Supabase conectada', C3: 'Service layer (Api.ts)',
    C4: 'module.config.ts', C5: 'Sin colores hardcodeados', C6: 'tokens.css con var(--m-*)',
    C7: 'Party Model', C8: 'Sin .from() en View',
  };
  const isAuto   = (cid: string) => (criteriosFS.length > 0 ? criteriosFS : modulo.criteriosIniciales ?? []).find(c => c.id === cid)?.auto ?? false;
  const getLabel = (cid: string) => (criteriosFS.length > 0 ? criteriosFS : modulo.criteriosIniciales ?? []).find(c => c.id === cid)?.label ?? LABEL_MAP[cid] ?? cid;"""

result = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old in content else 'NO MATCH')
