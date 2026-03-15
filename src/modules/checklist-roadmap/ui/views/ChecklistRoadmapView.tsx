// =============================================================================
// ChecklistRoadmapView.tsx — Pilar 1: Checklist & Roadmap
// C1: Vista principal del módulo checklist-roadmap
// C5: Zero colores hardcodeados — solo tokens CSS var(--m-*)
// C8: Datos via getAllModules() — nunca supabase.from() directo
// =============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../tokens.css';
import { useOrchestrator } from '@/shells/DashboardShell/app/providers/OrchestratorProvider';
import { getAllModules, updateCriterio, updateModuleStatus } from '../../service/checklistRoadmapApi';
import { auditModulo } from '../../service/auditEngine';
import { RoadmapPanel } from './RoadmapPanel';
import { IdeasBoard }   from './IdeasBoard';
import { ModuleView } from '@/app/components/shells/ModuleView';
import type {
  RoadmapModule,
  FamiliaGroup,
  CriterioId,
  CriterioEstado,
  ModuleStatus,
} from '../../types';

// =============================================================================
// CONSTANTES
// =============================================================================

const CRITERIOS_META: Array<{
  id: CriterioId;
  label: string;
  deteccion: 'automatico' | 'asistido';
  descripcion: string;
}> = [
  { id: 'C1', label: 'Vista (UI)',              deteccion: 'automatico', descripcion: 'Componente React exportado con isReal: true' },
  { id: 'C2', label: 'Backend (DB)',             deteccion: 'automatico', descripcion: 'Tabla accesible en Supabase del tenant' },
  { id: 'C3', label: 'Service layer',            deteccion: 'automatico', descripcion: 'Existe {nombre}Api.ts con 5 funciones base' },
  { id: 'C4', label: 'module.config.ts',         deteccion: 'automatico', descripcion: 'Existe src/modules/{id}/module.config.ts' },
  { id: 'C5', label: 'Sin colores hardcodeados', deteccion: 'automatico', descripcion: 'grep #HEX y rgb() en viewFile — 0 ocurrencias' },
  { id: 'C6', label: 'Tokens CSS definidos',     deteccion: 'automatico', descripcion: 'Existe ui/tokens.css con fallbacks --m-*' },
  { id: 'C7', label: 'Party Model',              deteccion: 'asistido',   descripcion: 'Usa organizaciones + roles_contextuales' },
  { id: 'C8', label: 'Data Zero (Conjuntos)',    deteccion: 'asistido',   descripcion: 'useTable() con nombre semántico' },
];

const STATUS_LABEL: Record<ModuleStatus, string> = {
  'no-registrado':   'No registrado',
  'registrado':      'Registrado',
  'bloqueado':       'Bloqueado',
  'en-progreso':     'En progreso',
  'ui-lista':        'UI lista',
  'cumple-estandar': 'Cumple estándar',
  'produccion':      'Producción',
};

const STATUS_COLOR: Record<ModuleStatus, string> = {
  'no-registrado':   'var(--m-color-pending)',
  'registrado':      'var(--m-state-registrado)',
  'bloqueado':       'var(--m-state-bloqueado)',
  'en-progreso':     'var(--m-state-en-progreso)',
  'ui-lista':        'var(--m-state-ui-lista)',
  'cumple-estandar': 'var(--m-state-cumple)',
  'produccion':      'var(--m-state-produccion)',
};

type TabId = 'checklist' | 'roadmap' | 'ideas';

const TABS: { id: TabId; label: string }[] = [
  { id: 'checklist', label: '⚙️  Checklist' },
  { id: 'roadmap',   label: '🗺️  Roadmap'   },
  { id: 'ideas',     label: '💡  Ideas'     },
];

// =============================================================================
// HELPERS
// =============================================================================

function scoreModulo(criterios: RoadmapModule['criterios']): number {
  if (!criterios) return 0;
  return Object.values(criterios).filter(v => v === 'ok').length;
}

function agruparPorFamilia(modulos: RoadmapModule[]): FamiliaGroup[] {
  const map = new Map<string, RoadmapModule[]>();
  for (const m of modulos) {
    const key = m.familia ?? 'Sin familia';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries()).map(([nombre, mods]) => ({
    nombre,
    modulos: mods,
    porcentajeCumplimiento: mods.length
      ? Math.round(mods.filter(m => m.status === 'cumple-estandar' || m.status === 'produccion').length / mods.length * 100)
      : 0,
  }));
}

// =============================================================================
// SUB-COMPONENTES
// =============================================================================

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8
    ? 'var(--m-color-ok)'
    : score >= 4
    ? 'var(--m-color-warn)'
    : 'var(--m-color-error)';
  return (
    <div style={{
      width:           32,
      height:          32,
      borderRadius:    '50%',
      border:          `2px solid ${color}`,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      fontSize:        12,
      fontWeight:      800,
      color,
      flexShrink:      0,
    }}>
      {score}
    </div>
  );
}

function StatusPill({ status }: { status: ModuleStatus }) {
  const color = STATUS_COLOR[status] ?? 'var(--m-color-pending)';
  return (
    <div style={{
      fontSize:        10,
      fontWeight:      700,
      padding:         '2px 8px',
      borderRadius:    'var(--m-radius-sm)',
      backgroundColor: color + '22',
      color,
      border:          `1px solid ${color}44`,
      whiteSpace:      'nowrap' as const,
      flexShrink:      0,
    }}>
      {STATUS_LABEL[status]}
    </div>
  );
}

function CriterioTag({ id, estado }: { id: CriterioId; estado: CriterioEstado | undefined }) {
  const colorMap: Record<CriterioEstado, string> = {
    ok:      'var(--m-color-ok)',
    warn:    'var(--m-color-warn)',
    error:   'var(--m-color-error)',
    pending: 'var(--m-color-text-subtle)',
  };
  const symbolMap: Record<CriterioEstado, string> = {
    ok: '✓', warn: '●', error: '✕', pending: '○',
  };
  const e = estado ?? 'pending';
  const color = colorMap[e];
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color }}>
      {id} {symbolMap[e]}
    </span>
  );
}

// =============================================================================
// FILA DE MÓDULO
// =============================================================================

interface ModuloRowProps {
  modulo:     RoadmapModule;
  auditando:  boolean;
  onAudit:    () => void;
  onSelect:   () => void;
}

function ModuloRow({ modulo, auditando, onAudit, onSelect }: ModuloRowProps) {
  const score = scoreModulo(modulo.criterios);
  return (
    <div
      onClick={onSelect}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             'var(--m-space-3)',
        padding:         'var(--m-space-3) var(--m-space-4)',
        backgroundColor: 'var(--m-color-surface)',
        border:          '1px solid var(--m-color-border)',
        borderRadius:    'var(--m-radius-md)',
        marginBottom:    'var(--m-space-2)',
        cursor:          'pointer',
        transition:      'box-shadow 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--m-shadow-sm)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <ScoreBadge score={score} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize:     13,
          fontWeight:   700,
          color:        'var(--m-color-text)',
          marginBottom: 4,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap' as const,
        }}>
          {modulo.nombre}
        </div>
        <div style={{ display: 'flex', gap: 'var(--m-space-2)', flexWrap: 'wrap' as const }}>
          {CRITERIOS_META.map(c => (
            <CriterioTag key={c.id} id={c.id} estado={modulo.criterios?.[c.id]} />
          ))}
        </div>
      </div>

      <StatusPill status={modulo.status} />

      <button
        onClick={e => { e.stopPropagation(); onAudit(); }}
        disabled={auditando}
        style={{
          padding:         '5px 12px',
          borderRadius:    'var(--m-radius-sm)',
          border:          '1px solid var(--m-color-border)',
          backgroundColor: 'var(--m-color-surface-2)',
          color:           'var(--m-color-text-muted)',
          fontSize:        11,
          fontWeight:      600,
          cursor:          auditando ? 'wait' : 'pointer',
          flexShrink:      0,
          opacity:         auditando ? 0.6 : 1,
        }}
      >
        {auditando ? '...' : 'Auditar'}
      </button>
    </div>
  );
}

// =============================================================================
// VISTA CHECKLIST
// =============================================================================

interface ChecklistViewProps {
  modulos:       RoadmapModule[];
  auditando:     string | null;
  onAudit:       (id: string) => void;
  onSelect:      (id: string) => void;
}

function ChecklistContent({ modulos, auditando, onAudit, onSelect }: ChecklistViewProps) {
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState<ModuleStatus | 'todos'>('todos');

  const filtrados = useMemo(() => modulos.filter(m => {
    const matchSearch = !search
      || m.nombre.toLowerCase().includes(search.toLowerCase())
      || m.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || m.status === filterStatus;
    return matchSearch && matchStatus;
  }), [modulos, search, filterStatus]);

  const familias = useMemo(() => agruparPorFamilia(filtrados), [filtrados]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, flex: 1, overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          'var(--m-space-3)',
        padding:      'var(--m-space-3) var(--m-space-6)',
        borderBottom: '1px solid var(--m-color-border)',
      }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar módulo..."
          style={{
            flex:            1,
            padding:         'var(--m-space-2) var(--m-space-3)',
            borderRadius:    'var(--m-radius-md)',
            border:          '1px solid var(--m-color-border)',
            backgroundColor: 'var(--m-color-surface)',
            color:           'var(--m-color-text)',
            fontSize:        13,
            outline:         'none',
          }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as ModuleStatus | 'todos')}
          style={{
            padding:         'var(--m-space-2) var(--m-space-3)',
            borderRadius:    'var(--m-radius-md)',
            border:          '1px solid var(--m-color-border)',
            backgroundColor: 'var(--m-color-surface)',
            color:           'var(--m-color-text)',
            fontSize:        12,
            cursor:          'pointer',
          }}
        >
          <option value="todos">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: 'var(--m-color-text-muted)', whiteSpace: 'nowrap' as const }}>
          {filtrados.length} de {modulos.length}
        </span>
      </div>

      {/* Lista por familia */}
      <div style={{ flex: 1, overflowY: 'auto' as const, padding: 'var(--m-space-4) var(--m-space-6)' }}>
        {familias.length === 0 ? (
          <div style={{ textAlign: 'center' as const, color: 'var(--m-color-text-muted)', padding: 'var(--m-space-12)' }}>
            No hay módulos que coincidan con los filtros.
          </div>
        ) : (
          familias.map(familia => (
            <div key={familia.nombre} style={{ marginBottom: 'var(--m-space-6)' }}>
              {/* Header familia */}
              <div style={{
                display:       'flex',
                alignItems:    'center',
                gap:           'var(--m-space-2)',
                marginBottom:  'var(--m-space-2)',
                paddingBottom: 'var(--m-space-2)',
                borderBottom:  '1px solid var(--m-color-border)',
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--m-color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                  {familia.nombre}
                </span>
                <span style={{ fontSize: 11, color: 'var(--m-color-text-subtle)' }}>
                  {familia.modulos.length} módulos · {familia.porcentajeCumplimiento}% estándar
                </span>
              </div>

              {familia.modulos.map(m => (
                <ModuloRow
                  key={m.id}
                  modulo={m}
                  auditando={auditando === m.id}
                  onAudit={() => onAudit(m.id)}
                  onSelect={() => onSelect(m.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =============================================================================
// VISTA PRINCIPAL
// =============================================================================

export function ChecklistRoadmapView() {
  const { isReady } = useOrchestrator();

  const [modulos,      setModulos]      = useState<RoadmapModule[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [auditando,    setAuditando]    = useState<string | null>(null);
  const [activeTab,    setActiveTab]    = useState<TabId>('checklist');

  // ── Carga ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    getAllModules()
      .then(data => { setModulos(data); setError(null); })
      .catch(err  => setError(err.message ?? 'Error cargando módulos'))
      .finally(()  => setLoading(false));
  }, [isReady]);

  // ── Auditoría ─────────────────────────────────────────────────────────────
  const handleAudit = useCallback(async (moduleId: string) => {
    setAuditando(moduleId);
    try {
      const result = await auditModulo(moduleId);
      if (!result) return;
      setModulos(prev => prev.map(m =>
        m.id === moduleId
          ? {
              ...m,
              criterios: Object.fromEntries(
                Object.entries(result.criterios).map(([k, v]) => [k, v.estado])
              ) as Record<CriterioId, CriterioEstado>,
              auditedAt: result.timestamp,
            }
          : m
      ));
    } finally {
      setAuditando(null);
    }
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalOk         = modulos.filter(m => m.status === 'cumple-estandar' || m.status === 'produccion').length;
  const totalBloqueados = modulos.filter(m => m.status === 'bloqueado').length;
  const pctGlobal       = modulos.length ? Math.round(totalOk / modulos.length * 100) : 0;
  const scorePromedio   = modulos.length
    ? Math.round(modulos.reduce((acc, m) => acc + scoreModulo(m.criterios), 0) / modulos.length * 10) / 10
    : 0;

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--m-color-text-muted)' }}>
      Cargando módulos...
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--m-color-error)' }}>
      Error: {error}
    </div>
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column' as const, height: '100%',
    }}>

      {/* ── Stats bar ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap:                 'var(--m-space-3)',
        padding:             'var(--m-space-4) var(--m-space-6)',
        borderBottom:        '1px solid var(--m-color-border)',
      }}>
        {[
          { label: 'Módulos totales',  value: modulos.length,       color: 'var(--m-color-text)' },
          { label: 'Cumplen estándar', value: totalOk,              color: 'var(--m-color-ok)' },
          { label: 'Bloqueados',       value: totalBloqueados,      color: 'var(--m-color-error)' },
          { label: 'Score promedio',   value: `${scorePromedio}/8`, color: 'var(--m-color-primary)' },
        ].map(stat => (
          <div key={stat.label} style={{
            backgroundColor: 'var(--m-color-surface)',
            borderRadius:    'var(--m-radius-md)',
            padding:         'var(--m-space-3) var(--m-space-4)',
            border:          '1px solid var(--m-color-border)',
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--m-color-text-muted)', marginTop: 'var(--m-space-1)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Progress global ── */}
      <div style={{ padding: 'var(--m-space-3) var(--m-space-6)', borderBottom: '1px solid var(--m-color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--m-space-1)' }}>
          <span style={{ fontSize: 11, color: 'var(--m-color-text-muted)' }}>Cumplimiento global</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--m-color-ok)' }}>{pctGlobal}%</span>
        </div>
        <div style={{ height: 4, backgroundColor: 'var(--m-color-surface-2)', borderRadius: 2 }}>
          <div style={{
            height:          '100%',
            width:           `${pctGlobal}%`,
            backgroundColor: 'var(--m-color-ok)',
            borderRadius:    2,
            transition:      'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display:      'flex',
        borderBottom: '1px solid var(--m-color-border)',
        padding:      '0 var(--m-space-6)',
      }}>
        {TABS.map(tab => {
          const activo = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding:         'var(--m-space-3) var(--m-space-4)',
                border:          'none',
                borderBottom:    activo ? '2px solid var(--m-color-primary)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color:           activo ? 'var(--m-color-primary)' : 'var(--m-color-text-muted)',
                fontSize:        13,
                fontWeight:      activo ? 700 : 400,
                cursor:          'pointer',
                transition:      'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Contenido por tab ── */}
      {activeTab === 'checklist' && (
        <ChecklistContent
          modulos={modulos}
          auditando={auditando}
          onAudit={handleAudit}
          onSelect={setSelectedId}
        />
      )}

      {activeTab === 'roadmap' && <RoadmapPanel />}

      {activeTab === 'ideas' && (
        <IdeasBoard onNavigate={s => setActiveTab(s as TabId)} />
      )}

    </div>
  );
}
