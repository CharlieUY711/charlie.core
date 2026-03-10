/**
 * ChecklistView — Auditor genérico de repositorios Charlie
 * El usuario ingresa el path del repo a auditar.
 * Audita C1–C8 por módulo y muestra estado en tiempo real.
 * Sin ningún path hardcodeado.
 */

import { useState, useCallback } from 'react'
import {
  RefreshCw, CheckCircle2, XCircle, AlertCircle,
  ChevronDown, ChevronRight, Search, Filter,
  FolderOpen, Play, RotateCcw,
} from 'lucide-react'

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

interface RepoAuditResult {
  repoPath: string
  timestamp: string
  modulos: ModuloAuditado[]
  resumen: {
    total: number
    cumpleEstandar: number
    enProgreso: number
    registrados: number
    bloqueados: number
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CRITERIO_LABELS: Record<string, string> = {
  C1: 'Vista (UI)',
  C2: 'Backend (DB)',
  C3: 'Service layer',
  C4: 'module.config.ts',
  C5: 'Sin hardcoding',
  C6: 'Tokens CSS',
  C7: 'Party Model',
  C8: 'Data Zero',
}

const ESTADO_CONFIG: Record<ModuloEstado, { label: string; color: string; bg: string; dot: string }> = {
  'no-registrado':   { label: 'No registrado',  color: '#6B7280', bg: '#F3F4F6', dot: '#9CA3AF' },
  'registrado':      { label: 'Registrado',      color: '#7C3AED', bg: '#EDE9FE', dot: '#7C3AED' },
  'en-progreso':     { label: 'En progreso',     color: '#D97706', bg: '#FEF3C7', dot: '#F59E0B' },
  'ui-lista':        { label: 'UI Lista',         color: '#0284C7', bg: '#E0F2FE', dot: '#0EA5E9' },
  'cumple-estandar': { label: 'Cumple estándar', color: '#059669', bg: '#D1FAE5', dot: '#10B981' },
  'produccion':      { label: 'Producción',       color: '#065F46', bg: '#A7F3D0', dot: '#059669' },
  'bloqueado':       { label: 'Bloqueado',        color: '#DC2626', bg: '#FEE2E2', dot: '#EF4444' },
}

const FAMILIA_COLORS: Record<string, string> = {
  core:           '#7C3AED',
  transaccional:  '#059669',
  logistica:      '#D97706',
  erp:            '#0284C7',
  marketing:      '#DB2777',
  herramientas:   '#0891B2',
  integraciones:  '#6366F1',
  sin_clasificar: '#9CA3AF',
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function CriterioIcon({ estado }: { estado: CriterioEstado }) {
  if (estado === 'ok')      return <CheckCircle2 size={14} color="#10B981" />
  if (estado === 'falla')   return <XCircle      size={14} color="#EF4444" />
  if (estado === 'parcial') return <AlertCircle  size={14} color="#F59E0B" />
  return <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #D1D5DB' }} />
}

function CriterioBadge({ criterio }: { criterio: Criterio }) {
  const colors = {
    ok:          { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
    falla:       { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
    parcial:     { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    'no-aplica': { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
  }[criterio.estado]

  return (
    <div
      title={criterio.detalle || criterio.nombre}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 20,
        fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
        background: colors.bg, color: colors.text,
        border: `1px solid ${colors.border}`,
        cursor: criterio.detalle ? 'help' : 'default',
      }}
    >
      <CriterioIcon estado={criterio.estado} />
      {criterio.id}
    </div>
  )
}

function OkBar({ ok, total }: { ok: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((ok / total) * 100)
  const color = pct === 100 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 80 }}>
      <div style={{ flex: 1, height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', minWidth: 24 }}>
        {ok}/{total}
      </span>
    </div>
  )
}

function ModuloRow({ modulo, expanded, onToggle }: {
  modulo: ModuloAuditado; expanded: boolean; onToggle: () => void
}) {
  const estadoConf = ESTADO_CONFIG[modulo.estado]
  const familiaColor = FAMILIA_COLORS[modulo.familia] || FAMILIA_COLORS.sin_clasificar

  return (
    <>
      <div
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: '24px 1fr 100px 130px 208px 80px',
          alignItems: 'center', gap: 12,
          padding: '10px 16px',
          background: expanded ? '#F8F9FF' : 'white',
          borderBottom: '1px solid #F3F4F6',
          cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA' }}
        onMouseLeave={e => { if (!expanded) (e.currentTarget as HTMLDivElement).style.background = 'white' }}
      >
        <div style={{ color: '#9CA3AF' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{modulo.nombre}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', marginTop: 1 }}>{modulo.path}</div>
        </div>

        <div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: familiaColor + '18', color: familiaColor,
            border: `1px solid ${familiaColor}40`,
          }}>
            {modulo.familia}
          </span>
        </div>

        <div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: estadoConf.bg, color: estadoConf.color,
            border: `1px solid ${estadoConf.dot}40`,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: estadoConf.dot }} />
            {estadoConf.label}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {modulo.criterios.map(c => <CriterioBadge key={c.id} criterio={c} />)}
        </div>

        <OkBar ok={modulo.okCount} total={8} />
      </div>

      {expanded && (
        <div style={{ padding: '16px 52px 20px', background: '#F8F9FF', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {modulo.criterios.map(c => {
              const colors = {
                ok:          { bg: '#F0FDF4', border: '#86EFAC', icon: '#16A34A' },
                falla:       { bg: '#FFF1F2', border: '#FCA5A5', icon: '#DC2626' },
                parcial:     { bg: '#FFFBEB', border: '#FCD34D', icon: '#D97706' },
                'no-aplica': { bg: '#F9FAFB', border: '#E5E7EB', icon: '#9CA3AF' },
              }[c.estado]
              return (
                <div key={c.id} style={{ padding: '10px 12px', borderRadius: 8, background: colors.bg, border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <CriterioIcon estado={c.estado} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: colors.icon, fontFamily: 'monospace' }}>{c.id}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{CRITERIO_LABELS[c.id]}</span>
                  </div>
                  {c.detalle && (
                    <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>{c.detalle}</div>
                  )}
                </div>
              )
            })}
          </div>
          {modulo.notas && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#EEF2FF', borderRadius: 6, fontSize: 12, color: '#4338CA' }}>
              📝 {modulo.notas}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div style={{ padding: '14px 18px', background: 'white', borderRadius: 10, border: '1px solid #E5E7EB', flex: 1 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ─── Pantalla inicial — ingreso de repo ───────────────────────────────────────

function RepoInput({ onAudit }: { onAudit: (path: string) => void }) {
  const [inputPath, setInputPath] = useState('')

  const submit = () => {
    const trimmed = inputPath.trim()
    if (trimmed) onAudit(trimmed)
  }

  // Repos sugeridos — no hardcodeados como destino fijo, solo shortcuts de UI
  const SUGERIDOS = [
    'C:\\Carlos\\charlie-workspace\\CoreTesting',
    'C:\\Carlos\\charlie-workspace\\charlie.core',
  ]

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F8F9FA', padding: 40,
    }}>
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #E5E7EB',
        padding: '40px 48px', maxWidth: 560, width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderOpen size={22} color="#7C3AED" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Checklist & Roadmap</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>Auditoría C1–C8 de módulos Charlie</div>
          </div>
        </div>

        <div style={{ height: 1, background: '#F3F4F6', margin: '20px 0' }} />

        {/* Input path */}
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
          Path del repositorio a auditar
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={inputPath}
            onChange={e => setInputPath(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="C:\ruta\al\repositorio"
            style={{
              flex: 1, padding: '10px 14px',
              border: '1px solid #D1D5DB', borderRadius: 8,
              fontSize: 13, fontFamily: 'monospace', outline: 'none',
              color: '#111827', background: '#FAFAFA',
            }}
            onFocus={e => (e.target.style.borderColor = '#7C3AED')}
            onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
          />
          <button
            onClick={submit}
            disabled={!inputPath.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px',
              background: inputPath.trim() ? '#7C3AED' : '#E5E7EB',
              color: inputPath.trim() ? 'white' : '#9CA3AF',
              border: 'none', borderRadius: 8,
              cursor: inputPath.trim() ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >
            <Play size={14} />
            Auditar
          </button>
        </div>

        {/* Sugeridos */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Accesos rápidos
          </div>
          {SUGERIDOS.map(r => (
            <button
              key={r}
              onClick={() => { setInputPath(r); onAudit(r) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', marginBottom: 6,
                background: '#F9FAFB', border: '1px solid #E5E7EB',
                borderRadius: 6, cursor: 'pointer',
                fontSize: 12, fontFamily: 'monospace', color: '#4B5563',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#EDE9FE'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#7C3AED'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#7C3AED'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#4B5563'
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Info criterios */}
        <div style={{ marginTop: 24, padding: '12px 14px', background: '#F8F9FA', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Criterios auditados</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
            {Object.entries(CRITERIO_LABELS).map(([id, label]) => (
              <div key={id} style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', gap: 6 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7C3AED' }}>{id}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ChecklistView() {
  const [repoPath, setRepoPath] = useState<string | null>(null)
  const [data, setData] = useState<RepoAuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState<ModuloEstado | 'todos'>('todos')
  const [filterFamilia, setFilterFamilia] = useState<string>('todas')
  const [refreshing, setRefreshing] = useState(false)

  const runAudit = useCallback(async (path: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/repo-audit?path=${encodeURIComponent(path)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
      const json: RepoAuditResult = await res.json()
      setData(json)
      setRepoPath(path)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const handleReset = () => { setData(null); setRepoPath(null); setError(null) }

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Pantalla inicial
  if (!repoPath && !loading) return <RepoInput onAudit={p => runAudit(p)} />

  // Loading
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: '#6B7280' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 14, fontWeight: 500 }}>Auditando repositorio…</div>
      <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' }}>{repoPath}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  // Error
  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <XCircle size={40} color="#EF4444" />
      <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Error al auditar</div>
      <div style={{ fontSize: 13, color: '#6B7280', maxWidth: 400, textAlign: 'center' }}>{error}</div>
      <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace', padding: '8px 12px', background: '#F3F4F6', borderRadius: 6 }}>{repoPath}</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleReset} style={{ padding: '8px 20px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Cambiar repo
        </button>
        <button onClick={() => repoPath && runAudit(repoPath)} style={{ padding: '8px 20px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Reintentar
        </button>
      </div>
    </div>
  )

  if (!data) return null

  // Filters
  const familias = [...new Set(data.modulos.map(m => m.familia))].sort()
  const filtered = data.modulos.filter(m => {
    const matchSearch = !search || m.nombre.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase())
    const matchEstado = filterEstado === 'todos' || m.estado === filterEstado
    const matchFamilia = filterFamilia === 'todas' || m.familia === filterFamilia
    return matchSearch && matchEstado && matchFamilia
  })

  const { resumen } = data
  const cobertura = resumen.total > 0 ? Math.round((resumen.cumpleEstandar / resumen.total) * 100) : 0

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8F9FA', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Top bar */}
      <div style={{ padding: '14px 24px', background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 7, cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>
            <RotateCcw size={12} />
            Cambiar repo
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FolderOpen size={14} color="#7C3AED" />
            <span style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>{data.repoPath}</span>
            <span style={{ fontSize: 11, color: '#D1D5DB' }}>·</span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(data.timestamp).toLocaleTimeString('es-UY')}</span>
          </div>
        </div>
        <button
          onClick={() => repoPath && runAudit(repoPath, true)}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            background: refreshing ? '#F3F4F6' : '#7C3AED',
            color: refreshing ? '#9CA3AF' : 'white',
            border: 'none', borderRadius: 8, cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 600,
          }}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          {refreshing ? 'Auditando…' : 'Re-auditar'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ padding: '14px 24px', display: 'flex', gap: 10, flexShrink: 0 }}>
        <StatCard label="Total módulos"   value={resumen.total}          color="#111827" />
        <StatCard label="Cumple estándar" value={resumen.cumpleEstandar} color="#059669" sub="C1–C8 ✓" />
        <StatCard label="En progreso"     value={resumen.enProgreso}     color="#D97706" />
        <StatCard label="Registrados"     value={resumen.registrados}    color="#7C3AED" sub="pendientes" />
        <StatCard label="Bloqueados"      value={resumen.bloqueados}     color="#DC2626" />
        <div style={{ flex: 2, padding: '14px 18px', background: 'white', borderRadius: 10, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Cobertura de estándar</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>{cobertura}%</span>
          </div>
          <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${cobertura}%`, height: '100%', background: 'linear-gradient(90deg, #059669, #10B981)', borderRadius: 3, transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{resumen.cumpleEstandar} de {resumen.total} módulos cumplen C1–C8</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '0 24px 12px', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar módulo…" style={{ width: '100%', padding: '7px 10px 7px 30px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', background: 'white', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} color="#9CA3AF" />
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value as ModuloEstado | 'todos')} style={{ padding: '7px 10px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, background: 'white', cursor: 'pointer', outline: 'none' }}>
            <option value="todos">Todos los estados</option>
            {(Object.keys(ESTADO_CONFIG) as ModuloEstado[]).map(e => (
              <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
            ))}
          </select>
        </div>
        <select value={filterFamilia} onChange={e => setFilterFamilia(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, background: 'white', cursor: 'pointer', outline: 'none' }}>
          <option value="todas">Todas las familias</option>
          {familias.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF' }}>
          {filtered.length} módulo{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', margin: '0 24px 24px', borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 100px 130px 208px 80px', gap: 12, padding: '8px 16px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 1 }}>
          {['', 'Módulo', 'Familia', 'Estado', 'Criterios', 'Progreso'].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
          ))}
        </div>
        {filtered.length === 0
          ? <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No se encontraron módulos</div>
          : filtered.map(m => <ModuloRow key={m.id} modulo={m} expanded={expanded.has(m.id)} onToggle={() => toggleExpand(m.id)} />)
        }
      </div>
    </div>
  )
}
