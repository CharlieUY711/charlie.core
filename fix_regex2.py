f = r'C:\Carlos\charlie-workspace\charlie.core\vite-plugin-creator.ts'
lines = open(f, encoding='utf-8').readlines()

# Reemplazar lineas 396-410 (indices 395-409) con version limpia
new_block = """          // Reemplazar valores CSS hardcodeados por tokens
          const coloresOrdenados = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);
          for (const hex of coloresOrdenados) {
            const token = COLOR_MAP[hex];
            const escaped = hex.replace('#', '\\\\#');
            const simpleRegex = new RegExp('(:\\\\s*[\'"])' + escaped + '([\'"])', 'g');
            const antes_count = (viewContent.match(new RegExp(escaped, 'g')) ?? []).length;
            viewContent = viewContent.replace(simpleRegex, (_m, pre, post) => pre + token + post);
            const despues_count = (viewContent.match(new RegExp(escaped, 'g')) ?? []).length;
            if (antes_count > despues_count) reemplazados += (antes_count - despues_count);
          }
"""

# Encontrar la linea del comentario "Solo reemplazar" y el cierre del for
start = None
end = None
for i, l in enumerate(lines):
    if '// Solo reemplazar cuando el hex esta como valor de propiedad CSS (entre comillas)' in l and start is None:
        start = i - 1  # incluir la linea anterior "Ordenar por longitud"
    if start is not None and i > start and l.strip() == '}' and end is None:
        end = i + 1
        break

print(f'Reemplazando lineas {start+1} a {end}')
result = lines[:start] + [new_block] + lines[end:]
open(f, 'w', encoding='utf-8').writelines(result)
print('OK')
