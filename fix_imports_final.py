path = r'src\app\components\admin\views\ConstructorView.tsx'
with open(path, encoding='utf-8') as f:
    lines = f.readlines()

# Separar en: imports al tope (antes de cualquier codigo) vs resto
# La linea const charlieSupabase es el primer "codigo real"
const_line = next(i for i, l in enumerate(lines) if 'const charlieSupabase' in l)

top_imports = []   # imports que ya estan antes del const
bottom_imports = [] # imports que quedaron despues del const
other = []         # todo lo demas

for i, l in enumerate(lines):
    if i < const_line:
        top_imports.append(l)
    elif l.strip().startswith('import '):
        bottom_imports.append(l)
    else:
        other.append(l)

# Reconstruir: todos los imports primero, luego el resto
result = top_imports + bottom_imports + other

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(result)
print(f'OK — {len(bottom_imports)} imports movidos al tope')
