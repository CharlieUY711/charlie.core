f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
lines = open(f, encoding='utf-8').readlines()
seen = False
result = []
for l in lines:
    if "import { useRegisterActions } from '../../shells/ActionBarContext';" in l:
        if seen:
            continue
        seen = True
    result.append(l)
open(f, 'w', encoding='utf-8').writelines(result)
print('OK')
