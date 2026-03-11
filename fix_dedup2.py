f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
lines = open(f, encoding='utf-8').readlines()

# Encontrar los dos bloques useRegisterActions y quedarnos solo con el primero
first_idx = None
second_idx = None
for i, l in enumerate(lines):
    if 'useRegisterActions({' in l:
        if first_idx is None:
            first_idx = i
        else:
            second_idx = i
            break

if second_idx is not None:
    # Encontrar el cierre del segundo bloque (buscar }, []);)
    end_idx = second_idx
    for i in range(second_idx, min(second_idx + 15, len(lines))):
        if '}, []);' in lines[i]:
            end_idx = i
            break
    # Eliminar desde second_idx hasta end_idx inclusive
    result = lines[:second_idx] + lines[end_idx+1:]
    open(f, 'w', encoding='utf-8').writelines(result)
    print(f'OK - eliminado bloque en lineas {second_idx+1} a {end_idx+1}')
else:
    print('No se encontro duplicado')
