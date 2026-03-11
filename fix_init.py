f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
lines = open(f, encoding='utf-8').readlines()
idx = next(i for i, l in enumerate(lines) if 'React.useState<ModuloRepo[]>(modulos)' in l)
print(f'Linea {idx+1}: {repr(lines[idx])}')
lines[idx] = lines[idx].replace('useState<ModuloRepo[]>(modulos)', 'useState<ModuloRepo[]>(MODULOS)')
open(f, 'w', encoding='utf-8').writelines(lines)
print('OK')
