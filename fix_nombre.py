f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
lines = open(f, encoding='utf-8').readlines()
idx = next(i for i, l in enumerate(lines) if 'const MODULOS_ESTATICOS = buildModulos()' in l)
lines[idx] = 'const MODULOS = buildModulos();\n'
open(f, 'w', encoding='utf-8').writelines(lines)
print(f'Linea {idx+1} restaurada OK')
