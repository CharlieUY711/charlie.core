f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
lines = open(f, encoding='utf-8').readlines()

# Encontrar inicio del componente
comp_start = next(i for i, l in enumerate(lines) if 'export function RepositorioView' in l)

# Reemplazar MODULOS por modulos solo despues del inicio del componente
count = 0
for i in range(comp_start, len(lines)):
    if 'MODULOS' in lines[i] and 'MODULOS_' not in lines[i] and 'const MODULOS' not in lines[i]:
        lines[i] = lines[i].replace('MODULOS', 'modulos')
        count += 1

open(f, 'w', encoding='utf-8').writelines(lines)
print(f'Reemplazados {count} usos de MODULOS -> modulos dentro del componente')
