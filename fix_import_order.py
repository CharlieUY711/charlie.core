path = r'src\app\components\admin\views\ConstructorView.tsx'
with open(path, encoding='utf-8') as f:
    lines = f.readlines()

import_line = "import { projectId, publicAnonKey } from '../../../../utils/supabase/info';\n"

# Quitar la linea del lugar donde quedo
lines = [l for l in lines if l.strip() != import_line.strip()]

# Insertarla despues del ultimo import existente al tope (linea 5 aprox)
last_import_idx = 0
for i, l in enumerate(lines):
    if l.strip().startswith('import '):
        last_import_idx = i

lines.insert(last_import_idx + 1, import_line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('OK — import movido al tope')
