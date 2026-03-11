f = r'C:\Carlos\charlie-workspace\charlie.core\vite.config.ts'
content = open(f, encoding='utf-8').read()

old = "import { auditPlugin } from './vite-plugin-audit'"
new = "import { auditPlugin } from './vite-plugin-audit'\nimport { createModuleEndpoint } from './vite-plugin-creator'"

content = content.replace(old, new)

old2 = "    auditPlugin(),"
new2 = """    auditPlugin(),
    {
      name: 'vite-creator-plugin',
      configureServer(server) { createModuleEndpoint(server); },
    },"""

content = content.replace(old2, new2)
open(f, 'w', encoding='utf-8').write(content)
print('OK')
