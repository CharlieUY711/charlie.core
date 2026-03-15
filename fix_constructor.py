import re

path = r'src\app\components\admin\views\ConstructorView.tsx'
with open(path, encoding='utf-8') as f:
    content = f.read()

old = """// Cliente de Charlie — donde vive tenant_config
const charlieSupabase = createClient(
  'https://qhnmxvexkizcsmivfuam.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobm14dmV4a2l6Y3NtaXZmdWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMjEyODEsImV4cCI6MjA4Njc5NzI4MX0.Ifz4fJYldIGZFzhBK5PPxQeqdYzO2ZKNQ5uo8j2mYmM'
);"""

new = """// Cliente de Charlie — donde vive tenant_config
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
const charlieSupabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);"""

if old in content:
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK — reemplazado correctamente')
else:
    print('ERROR — no se encontro el bloque exacto, revisar manualmente')
