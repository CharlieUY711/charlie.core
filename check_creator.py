f = r'C:\Carlos\charlie-workspace\charlie.core\vite-plugin-creator.ts'
lines = open(f, encoding='utf-8').readlines()

# Encontrar y mostrar lineas 395-415
for i, l in enumerate(lines[393:417], start=394):
    print(i, repr(l))
