f = r'C:\Carlos\charlie-workspace\charlie.core\vite-plugin-creator.ts'
content = open(f, encoding='utf-8').read()

# Reemplazar el bloque del regex complejo por uno simple que funciona igual
old = """          // Solo reemplazar cuando el hex esta como valor de propiedad CSS (entre comillas)
          // Ordenar por longitud desc para que #FFFFFF no sea reemplazado antes que #FFF
          const coloresOrdenados = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);
          for (const hex of coloresOrdenados) {
            const token = COLOR_MAP[hex];
            // Solo reemplazar cuando el hex esta como valor de propiedad CSS (entre comillas)
            const regex = new RegExp("((?:color|backgroundColor|borderColor|background|fill|stroke|boxShadow|border|outline)(?:[^'\"]*)['\"])(" + hex.replace('#', '\\\\#') + ")(['\"])", 'g');
            const antes_count = (viewContent.match(new RegExp(hex.replace('#', '\\\\#'), 'g')) ?? []).length;
            viewContent = viewContent.replace(regex, (_, pre, _hex, post) => pre + token + post);
            // Reemplazo simple para casos directos como: color: '#FF6835'
            const simpleRegex = new RegExp("(:\\\\s*['\"])" + hex.replace('#', '\\\\#') + "(['\"])", 'g');
            viewContent = viewContent.replace(simpleRegex, (_, pre, post) => pre + token + post);
            const despues_count = (viewContent.match(new RegExp(hex.replace('#', '\\\\#'), 'g')) ?? []).length;
            if (antes_count > despues_count) reemplazados += (antes_count - despues_count);
          }"""

new = """          // Reemplazar valores CSS hardcodeados por tokens
          const coloresOrdenados = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);
          for (const hex of coloresOrdenados) {
            const token = COLOR_MAP[hex];
            const escaped = hex.replace('#', String.raw`\\#`);
            const simpleRegex = new RegExp("(:\\\\s*['\\\"])" + escaped + "(['\\\"])", 'g');
            const antes_count = (viewContent.match(new RegExp(escaped, 'g')) ?? []).length;
            viewContent = viewContent.replace(simpleRegex, (_m, pre, post) => pre + token + post);
            const despues_count = (viewContent.match(new RegExp(escaped, 'g')) ?? []).length;
            if (antes_count > despues_count) reemplazados += (antes_count - despues_count);
          }"""

result = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old in content else 'NO MATCH - mostrando lineas 398-408:')
if old not in content:
    lines = content.splitlines()
    for i, l in enumerate(lines[396:410], start=397):
        print(i, repr(l))
