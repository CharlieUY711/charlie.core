f = r'C:\Carlos\charlie-workspace\charlie.core\vite-plugin-creator.ts'
content = open(f, encoding='utf-8').read()

# Reemplazar el inicio del endpoint para aceptar criterio opcional
old = "        const { moduloId, nombre, tabla, grupo, descripcion } = JSON.parse(body);"
new = "        const { moduloId, nombre, tabla, grupo, descripcion, criterio: soloCriterio } = JSON.parse(body);"
content = content.replace(old, new)

# Agregar logica de criterio unico despues del id/N/serviceKey
old2 = "        const reparados:  { criterio: string; archivo: string; accion: string }[] = [];"
new2 = """        // Si viene criterio especifico, solo reparar ese
        const soloEste: string | null = soloCriterio ?? null;
        const reparados:  { criterio: string; archivo: string; accion: string }[] = [];"""
content = content.replace(old2, new2)

# Hacer cada bloque condicional con soloEste
old3 = "        // ── C1 — View ──────────────────────────────────────────────────────────\n        const viewPath = path.join(VIEWS_DIR, `${N}View.tsx`);\n        if (!fs.existsSync(viewPath)) {"
new3 = "        // ── C1 — View ──────────────────────────────────────────────────────────\n        const viewPath = path.join(VIEWS_DIR, `${N}View.tsx`);\n        if ((!soloEste || soloEste === 'C1') && !fs.existsSync(viewPath)) {"
content = content.replace(old3, new3)

old4 = "        // ── C3 — Api ───────────────────────────────────────────────────────────\n        const apiPath = path.join(SERVICES_DIR, `${id}Api.ts`);\n        if (!fs.existsSync(apiPath)) {"
new4 = "        // ── C3 — Api ───────────────────────────────────────────────────────────\n        const apiPath = path.join(SERVICES_DIR, `${id}Api.ts`);\n        if ((!soloEste || soloEste === 'C3') && !fs.existsSync(apiPath)) {"
content = content.replace(old4, new4)

old5 = "        } else {\n          // C8 — verificar .from() en Api existente"
new5 = "        } else if (!soloEste || soloEste === 'C3' || soloEste === 'C8') {\n          // C8 — verificar .from() en Api existente"
content = content.replace(old5, new5)

old6 = "        // ── C4 — module.config.ts ──────────────────────────────────────────────\n        const modDir    = path.join(MODULES_DIR, id);\n        const configPath = path.join(modDir, 'module.config.ts');\n        if (!fs.existsSync(modDir)) fs.mkdirSync(modDir, { recursive: true });\n        if (!fs.existsSync(configPath)) {"
new6 = "        // ── C4 — module.config.ts ──────────────────────────────────────────────\n        const modDir    = path.join(MODULES_DIR, id);\n        const configPath = path.join(modDir, 'module.config.ts');\n        if (!fs.existsSync(modDir)) fs.mkdirSync(modDir, { recursive: true });\n        if ((!soloEste || soloEste === 'C4') && !fs.existsSync(configPath)) {"
content = content.replace(old6, new6)

old7 = "        // ── C5 — colores hardcodeados ──────────────────────────────────────────\n        if (fs.existsSync(viewPath)) {"
new7 = "        // ── C5 — colores hardcodeados ──────────────────────────────────────────\n        if ((!soloEste || soloEste === 'C5') && fs.existsSync(viewPath)) {"
content = content.replace(old7, new7)

old8 = "        // ── C6 — tokens.css ───────────────────────────────────────────────────\n        const uiDir      = path.join(modDir, 'ui');\n        const tokensPath = path.join(uiDir, 'tokens.css');\n        if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });\n        if (!fs.existsSync(tokensPath)) {"
new8 = "        // ── C6 — tokens.css ───────────────────────────────────────────────────\n        const uiDir      = path.join(modDir, 'ui');\n        const tokensPath = path.join(uiDir, 'tokens.css');\n        if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });\n        if ((!soloEste || soloEste === 'C6') && !fs.existsSync(tokensPath)) {"
content = content.replace(old8, new8)

old9 = "        // ── C2 — tabla Supabase ───────────────────────────────────────────────\n        if (!tabla) {"
new9 = "        // ── C2 — tabla Supabase ───────────────────────────────────────────────\n        if ((!soloEste || soloEste === 'C2') && !tabla) {"
content = content.replace(old9, new9)

old10 = "        // ── C7 — Party Model ──────────────────────────────────────────────────\n        pendientes.push({"
new10 = "        // ── C7 — Party Model ──────────────────────────────────────────────────\n        if (!soloEste || soloEste === 'C7') pendientes.push({"
content = content.replace(old10, new10)

# Cerrar el if del C7 push
old11 = "          instrucciones: 'Verificar que el módulo usa organizaciones + roles_contextuales en lugar de tablas de clientes/transportistas directas. Si aplica, migrar las relaciones.',\n        });"
new11 = "          instrucciones: 'Verificar que el módulo usa organizaciones + roles_contextuales en lugar de tablas de clientes/transportistas directas. Si aplica, migrar las relaciones.',\n        });"
content = content.replace(old11, new11)

open(f, 'w', encoding='utf-8').write(content)
print('OK')
