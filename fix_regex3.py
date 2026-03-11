f = r'C:\Carlos\charlie-workspace\charlie.core\vite-plugin-creator.ts'
lines = open(f, encoding='utf-8').readlines()

# Encontrar inicio y fin del bloque for del C5
start = None
end = None
for i, l in enumerate(lines):
    if 'const coloresOrdenados = Object.keys(COLOR_MAP)' in l and start is None:
        start = i
    if start is not None and i > start + 2 and l.strip() == '}':
        end = i + 1
        break

print(f'start={start+1} end={end}')

# Version nueva sin comillas mixtas en RegExp - usa template string alternativo
new_block = (
'          const coloresOrdenados = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);\n'
'          for (const hex of coloresOrdenados) {\n'
'            const token = COLOR_MAP[hex];\n'
'            const esc = hex.replace("#", "\\\\#");\n'
'            const q = "[\'\\"]";\n'
'            const pat = new RegExp("(:\\\\s*" + q + ")" + esc + "(" + q + ")", "g");\n'
'            const b = (viewContent.match(new RegExp(esc, "g")) ?? []).length;\n'
'            viewContent = viewContent.replace(pat, (_m, pre, post) => pre + token + post);\n'
'            const a = (viewContent.match(new RegExp(esc, "g")) ?? []).length;\n'
'            if (b > a) reemplazados += (b - a);\n'
'          }\n'
)

result = lines[:start] + [new_block] + lines[end:]
open(f, 'w', encoding='utf-8').writelines(result)
print('OK')
