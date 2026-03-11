f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
lines = open(f, encoding='utf-8').readlines()

# Reemplazar lineas 648-661 (indices 647-660) con componente limpio
new_line = "                {gruposColapsados.has(grupo) && <GrupoStats mods={mods} scoresDB={scoresDB} />}\n"
lines = lines[:647] + [new_line] + lines[661:]

open(f, 'w', encoding='utf-8').writelines(lines)
print('OK')
