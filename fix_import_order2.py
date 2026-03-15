path = r'src\app\components\admin\views\ConstructorView.tsx'
with open(path, encoding='utf-8') as f:
    lines = f.readlines()

import_line = "import { projectId, publicAnonKey } from '../../../../utils/supabase/info';\n"

# Quitar la linea dondequiera que este
lines = [l for l in lines if l.strip() != import_line.strip()]

# Insertar justo despues de "import { createClient } from '@supabase/supabase-js';"
target = "import { createClient } from '@supabase/supabase-js';"
insert_at = next((i for i, l in enumerate(lines) if target in l), None)

if insert_at is not None:
    lines.insert(insert_at + 1, import_line)
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f'OK — import insertado en linea {insert_at + 2}')
else:
    print('ERROR — no se encontro la linea target')
