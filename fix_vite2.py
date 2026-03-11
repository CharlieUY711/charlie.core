f = r'C:\Carlos\charlie-workspace\charlie.core\vite.config.ts'
content = open(f, encoding='utf-8').read()

old = "import { createModuleEndpoint } from './vite-plugin-creator'"
new = "import { createModuleEndpoint, repairModuleEndpoint } from './vite-plugin-creator'"
content = content.replace(old, new)

old2 = "      configureServer(server) { createModuleEndpoint(server); },"
new2 = "      configureServer(server) { createModuleEndpoint(server); repairModuleEndpoint(server); },"
content = content.replace(old2, new2)

open(f, 'w', encoding='utf-8').write(content)
print('OK')
