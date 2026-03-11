f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
lines = open(f, encoding='utf-8').readlines()

# Encontrar linea "const MODULOS = buildModulos();"
idx = next(i for i, l in enumerate(lines) if 'const MODULOS = buildModulos()' in l)
print(f'Linea {idx+1}: {repr(lines[idx])}')

# Reemplazar con estado dinamico - agregar estado dentro del componente
# Primero convertimos la constante global en un fallback estatico
lines[idx] = 'const MODULOS_ESTATICOS = buildModulos();\n'

open(f, 'w', encoding='utf-8').writelines(lines)
print('OK')
