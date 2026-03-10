/**
 * GET /api/repo-audit?path=C:\ruta\al\repo
 *
 * Recibe el path del repositorio como query param.
 * Audita todos los módulos encontrados contra C1–C8.
 * Sin ningún path hardcodeado.
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// ─── Types ────────────────────────────────────────────────────────────────────

type CriterioEstado = 'ok' | 'falla' | 'parcial' | 'no-aplica'
type ModuloEstado =
  | 'no-registrado' | 'registrado' | 'en-progreso'
  | 'ui-lista' | 'cumple-estandar' | 'produccion' | 'bloqueado'

interface Criterio {
  id: string
  nombre: string
  estado: CriterioEstado
  detalle?: string
}

interface ModuloAuditado {
  id: string
  nombre: string
  familia: string
  path: string
  estado: ModuloEstado
  criterios: Criterio[]
  okCount: number
  notas?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileExists(p: string): boolean {
  try { return fs.existsSync(p) } catch { return false }
}

function readFileSafe(p: string): string {
  try { return fs.readFileSync(p, 'utf-8') } catch { return '' }
}

function findFilesRecursive(dir: string, pattern: RegExp): string[] {
  const results: string[] = []
  if (!fileExists(dir)) return results
  const recurse = (current: string) => {
    try {
      const entries = fs.readdirSync(current, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name)
        if (entry.isDirectory() && !['node_modules', '.git', 'dist', '.next'].includes(entry.name)) {
          recurse(fullPath)
        } else if (entry.isFile() && pattern.test(entry.name)) {
          results.push(fullPath)
        }
      }
    } catch { /* skip */ }
  }
  recurse(dir)
  return results
}

// ─── Discovery ────────────────────────────────────────────────────────────────

interface ModuleSource {
  id: string
  nombre: string
  familia: string
  modulePath: string
  absolutePath: string
  type: 'nueva' | 'vieja'
}

function discoverModules(repoRoot: string): ModuleSource[] {
  const modules: ModuleSource[] = []
  const seen = new Set<string>()

  // 1. Estructura nueva: src/modules/{id}/
  const modulesDir = path.join(repoRoot, 'src', 'modules')
  if (fileExists(modulesDir)) {
    for (const entry of fs.readdirSync(modulesDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const id = entry.name
      if (seen.has(id)) continue
      const absPath = path.join(modulesDir, id)
      const configContent = readFileSafe(path.join(absPath, 'module.config.ts'))
      const nombre = configContent.match(/nombre\s*:\s*['"](.+?)['"]/)?.[1] ?? id
      const familia = configContent.match(/familia\s*:\s*['"](.+?)['"]/)?.[1] ?? 'sin_clasificar'
      seen.add(id)
      modules.push({ id, nombre, familia, modulePath: path.relative(repoRoot, absPath), absolutePath: absPath, type: 'nueva' })
    }
  }

  // 2. Estructura vieja: src/app/components/admin/views/*View.tsx
  const viewsDir = path.join(repoRoot, 'src', 'app', 'components', 'admin', 'views')
  if (fileExists(viewsDir)) {
    for (const entry of fs.readdirSync(viewsDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('View.tsx')) continue
      const rawName = entry.name.replace('View.tsx', '')
      const id = rawName.replace(/([A-Z])/g, (_, c, i) => (i > 0 ? '-' : '') + c.toLowerCase()).replace(/^-/, '')
      if (seen.has(id)) continue
      const nombre = rawName.replace(/([A-Z])/g, ' $1').trim()
      seen.add(id)
      modules.push({
        id, nombre, familia: 'sin_clasificar',
        modulePath: path.relative(repoRoot, path.join(viewsDir, entry.name)),
        absolutePath: path.join(viewsDir, entry.name),
        type: 'vieja',
      })
    }
  }

  return modules
}

function readManifest(repoRoot: string): Map<string, { isReal: boolean; hasSupabase: boolean; notes?: string }> {
  const map = new Map<string, { isReal: boolean; hasSupabase: boolean; notes?: string }>()
  const manifestPath = path.join(repoRoot, 'src', 'app', 'utils', 'moduleManifest.ts')
  if (!fileExists(manifestPath)) return map
  const content = readFileSafe(manifestPath)
  const entryPattern = /section\s*:\s*['"]([^'"]+)['"][^}]*?isReal\s*:\s*(true|false)[^}]*?hasSupabase\s*:\s*(true|false)/gs
  let match
  while ((match = entryPattern.exec(content)) !== null) {
    const [, section, isReal, hasSupabase] = match
    const notesMatch = content.slice(match.index, match.index + 400).match(/notes\s*:\s*['"]([^'"]*?)['"]/)
    map.set(section, { isReal: isReal === 'true', hasSupabase: hasSupabase === 'true', notes: notesMatch?.[1] })
  }
  return map
}

// ─── Audit C1–C8 ─────────────────────────────────────────────────────────────

function auditModule(src: ModuleSource, repoRoot: string, manifest: Map<string, { isReal: boolean; hasSupabase: boolean; notes?: string }>): ModuloAuditado {
  const criterios: Criterio[] = []
  const entry = manifest.get(src.id)

  // C1 — Tiene vista (UI)
  let c1: CriterioEstado = 'falla'
  let c1d = 'No aparece en MODULE_MANIFEST con isReal: true'
  if (src.type === 'vieja') { c1 = 'ok'; c1d = `Vista en ${src.modulePath}` }
  else {
    const viewsDir = path.join(src.absolutePath, 'ui', 'views')
    const views = fileExists(viewsDir) ? fs.readdirSync(viewsDir).filter(f => f.endsWith('.tsx')) : []
    if (views.length > 0) { c1 = entry?.isReal ? 'ok' : 'parcial'; c1d = entry?.isReal ? `${views.length} vista(s)` : 'Vista existe pero isReal: false en manifest' }
    else { c1 = 'falla'; c1d = 'No existe ui/views/' }
  }
  if (entry?.isReal) { c1 = 'ok'; c1d = 'isReal: true en manifest' }
  criterios.push({ id: 'C1', nombre: 'Vista (UI)', estado: c1, detalle: c1d })

  // C2 — Tiene backend (DB)
  const hasSchema = src.type === 'nueva' && fileExists(path.join(src.absolutePath, 'edge-function', 'schema.sql'))
  let c2: CriterioEstado = 'falla'
  let c2d = 'No tiene schema.sql ni hasSupabase en manifest'
  if (entry?.hasSupabase) { c2 = hasSchema ? 'ok' : 'parcial'; c2d = hasSchema ? 'hasSupabase: true + schema.sql' : 'hasSupabase: true pero falta schema.sql' }
  else if (hasSchema) { c2 = 'parcial'; c2d = 'schema.sql presente pero hasSupabase: false' }
  else if (src.type === 'vieja') { c2 = 'no-aplica'; c2d = 'Estructura vieja — verificar manualmente' }
  criterios.push({ id: 'C2', nombre: 'Backend (DB)', estado: c2, detalle: c2d })

  // C3 — Service layer
  const serviceDir = path.join(src.absolutePath, 'service')
  const serviceFiles = src.type === 'nueva' && fileExists(serviceDir) ? fs.readdirSync(serviceDir).filter(f => f.endsWith('Api.ts')) : []
  let c3: CriterioEstado = 'falla'
  let c3d = 'No existe service layer'
  if (serviceFiles.length > 0) {
    const content = readFileSafe(path.join(serviceDir, serviceFiles[0]))
    c3 = content.includes('useTable(') ? 'ok' : 'parcial'
    c3d = content.includes('useTable(') ? `${serviceFiles[0]} — usa useTable() ✓` : `${serviceFiles[0]} — OJO: no usa useTable()`
  } else if (src.type === 'vieja') { c3 = 'no-aplica'; c3d = 'Estructura vieja — verificar manualmente' }
  criterios.push({ id: 'C3', nombre: 'Service layer', estado: c3, detalle: c3d })

  // C4 — module.config.ts
  let c4: CriterioEstado = 'falla'
  let c4d = 'No existe module.config.ts'
  if (src.type === 'nueva') {
    const configPath = path.join(src.absolutePath, 'module.config.ts')
    if (fileExists(configPath)) {
      const content = readFileSafe(configPath)
      const ok = content.includes('id:') && content.includes('criterios')
      c4 = ok ? 'ok' : 'parcial'
      c4d = ok ? 'Completo (id + criterios)' : 'Incompleto — faltan campos'
    }
  } else { c4 = 'falla'; c4d = 'Crear module.config.ts en src/modules/' + src.id + '/' }
  criterios.push({ id: 'C4', nombre: 'module.config.ts', estado: c4, detalle: c4d })

  // C5 — Sin colores hardcodeados
  const tsxFiles = src.type === 'nueva'
    ? findFilesRecursive(src.absolutePath, /\.(tsx|jsx)$/)
    : [src.absolutePath]
  let c5: CriterioEstado = 'no-aplica'
  let c5d = 'Sin archivos de vista'
  if (tsxFiles.length > 0) {
    let hexCount = 0; let worstFile = ''
    for (const f of tsxFiles) {
      const noComments = readFileSafe(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
      const matches = (noComments.match(/#[0-9A-Fa-f]{3,8}\b/g) || []).length + (noComments.match(/rgb\s*\(/g) || []).length
      if (matches > 0) worstFile = path.relative(repoRoot, f)
      hexCount += matches
    }
    c5 = hexCount === 0 ? 'ok' : 'falla'
    c5d = hexCount === 0 ? 'Sin colores hardcodeados' : `${hexCount} colores hardcodeados — ej: ${worstFile}`
  }
  criterios.push({ id: 'C5', nombre: 'Sin hardcoding', estado: c5, detalle: c5d })

  // C6 — Tokens CSS
  let c6: CriterioEstado = 'falla'
  let c6d = 'No existe ui/tokens.css'
  if (src.type === 'nueva') {
    const tokensPath = path.join(src.absolutePath, 'ui', 'tokens.css')
    if (fileExists(tokensPath)) {
      const count = (readFileSafe(tokensPath).match(/--m-/g) || []).length
      c6 = count > 0 ? 'ok' : 'parcial'
      c6d = count > 0 ? `${count} tokens --m-* definidos` : 'tokens.css sin tokens --m-*'
    }
  } else { c6 = 'falla'; c6d = 'Crear ui/tokens.css en src/modules/' + src.id + '/' }
  criterios.push({ id: 'C6', nombre: 'Tokens CSS', estado: c6, detalle: c6d })

  // C7 — Party Model
  const allFiles = src.type === 'nueva' ? findFilesRecursive(src.absolutePath, /\.(ts|tsx)$/) : [src.absolutePath]
  const forbidden = ['transportistas', 'clientes', 'couriers', 'conductores', 'proveedores']
  const found: string[] = []
  for (const f of allFiles) {
    const content = readFileSafe(f)
    let m; const re = /supabase\.from\(['"](\w+)['"]\)/g
    while ((m = re.exec(content)) !== null) if (forbidden.includes(m[1])) found.push(m[1])
  }
  const c7: CriterioEstado = found.length > 0 ? 'falla' : 'parcial'
  const c7d = found.length > 0 ? `Tablas directas: ${[...new Set(found)].join(', ')}` : 'Sin tablas Party Model directas — confirmar'
  criterios.push({ id: 'C7', nombre: 'Party Model', estado: c7, detalle: c7d })

  // C8 — Data Zero
  let directCount = 0; let useTableCount = 0
  for (const f of allFiles) {
    if (f.endsWith('.sql')) continue
    const content = readFileSafe(f)
    directCount += (content.match(/supabase\.from\s*\(/g) || []).length
    useTableCount += (content.match(/useTable\s*\(/g) || []).length
  }
  let c8: CriterioEstado; let c8d: string
  if (directCount === 0 && useTableCount === 0) { c8 = 'parcial'; c8d = 'Sin llamadas detectadas — confirmar al implementar' }
  else if (directCount === 0) { c8 = 'ok'; c8d = `Solo useTable() — ${useTableCount} llamadas ✓` }
  else if (useTableCount > 0) { c8 = 'parcial'; c8d = `Mezcla: ${useTableCount} useTable() + ${directCount} directas` }
  else { c8 = 'falla'; c8d = `${directCount} llamadas directas supabase.from() — migrar a useTable()` }
  criterios.push({ id: 'C8', nombre: 'Data Zero', estado: c8, detalle: c8d })

  // Estado del módulo
  const okCount = criterios.filter(c => c.estado === 'ok').length
  const failCount = criterios.filter(c => c.estado === 'falla').length
  const c1ok = criterios[0].estado === 'ok'
  const c3ok = criterios[2].estado === 'ok'
  const c2ok = criterios[1].estado === 'ok'
  let estado: ModuloEstado
  if (okCount === 8) estado = 'cumple-estandar'
  else if (c1ok && c3ok && c2ok) estado = 'ui-lista'
  else if (c1ok) estado = 'en-progreso'
  else if (failCount >= 4) estado = 'registrado'
  else if (entry) estado = 'registrado'
  else estado = 'no-registrado'

  return { id: src.id, nombre: src.nombre, familia: src.familia, path: src.modulePath, estado, criterios, okCount, notas: entry?.notes }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // El path viene como query param — sin hardcodeo
  const repoRoot = req.nextUrl.searchParams.get('path')

  if (!repoRoot) {
    return NextResponse.json(
      { error: 'Falta el parámetro "path". Ejemplo: /api/repo-audit?path=C:\\ruta\\al\\repo' },
      { status: 400 }
    )
  }

  if (!fileExists(repoRoot)) {
    return NextResponse.json(
      { error: `Repositorio no encontrado: ${repoRoot}` },
      { status: 404 }
    )
  }

  try {
    const manifest = readManifest(repoRoot)
    const sources = discoverModules(repoRoot)
    const modulos = sources.map(src => auditModule(src, repoRoot, manifest))

    const estadoOrder: Record<ModuloEstado, number> = {
      'bloqueado': 0, 'registrado': 1, 'en-progreso': 2,
      'ui-lista': 3, 'cumple-estandar': 4, 'produccion': 5, 'no-registrado': 6,
    }
    modulos.sort((a, b) => estadoOrder[a.estado] - estadoOrder[b.estado] || a.nombre.localeCompare(b.nombre))

    const resumen = {
      total: modulos.length,
      cumpleEstandar: modulos.filter(m => m.estado === 'cumple-estandar' || m.estado === 'produccion').length,
      enProgreso: modulos.filter(m => m.estado === 'en-progreso' || m.estado === 'ui-lista').length,
      registrados: modulos.filter(m => m.estado === 'registrado').length,
      bloqueados: modulos.filter(m => m.estado === 'bloqueado').length,
    }

    return NextResponse.json({ repoPath: repoRoot, timestamp: new Date().toISOString(), modulos, resumen })

  } catch (e: unknown) {
    return NextResponse.json(
      { error: `Error durante la auditoría: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    )
  }
}
