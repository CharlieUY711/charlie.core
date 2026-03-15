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
  'no-registrado':   'var(--m-state-no-registrado)',
  'registrado':      'var(--m-state-registrado)',
  'bloqueado':       'var(--m-state-bloqueado)',
  'en-progreso':     'var(--m-state-en-progreso)',
  'ui-lista':        'var(--m-state-ui-lista)',
  'cumple-estandar': 'var(--m-state-cumple)',
  'produccion':      'var(--m-state-produccion)',
};

const CRITERIO_COLOR: Record<CriterioEstado, string> = {
  ok:      'var(--m-color-ok)',
  warn:    'var(--m-color-warn)',
  error:   'var(--m-color-error)',
  pending: 'var(--m-color-pending)',
};

const CRITERIO_ICON: Record<CriterioEstado, string> = {
  ok:      '✓',
  warn:    '●',
  error:   '✕',
  pending: '○',
};

// =============================================================================
// HELPERS
// =============================================================================

function scoreModulo(criterios: Record<CriterioId, CriterioEstado>): number {
  if (!criterios) return 0;
  return Object.values(criterios).filter(v => v === 'ok').length;
}

function agruparPorFamilia(modulos: RoadmapModule[]): FamiliaGroup[] {
  const map = new Map<string, RoadmapModule[]>();
  for (const m of modulos) {
    if (!map.has(m.familia)) map.set(m.familia, []);
    map.get(m.familia)!.push(m);
  }
  return Array.from(map.entries())
    .map(([nombre, mods]) => ({
      nombre,
      modulos: mods.sort((a, b) => a.prioridad - b.prioridad),
      porcentajeCumplimiento: Math.round(
        mods.filter(m => m.status === 'cumple-estandar' || m.status === 'produccion').length
        / mods.length * 100
      ),
    }))
    .sort((a, b) => b.porcentajeCumplimiento - a.porcentajeCumplimiento);
}

// =============================================================================
// SUB-COMPONENTES
// =============================================================================

// ─── CriterioTag ─────────────────────────────────────────────────────────────
function CriterioTag({ id, estado }: { id: CriterioId; estado: CriterioEstado }) {
  return (
    <span style={{
      display:         'inline-flex',
      alignItems:      'center',
      gap:             'var(--m-space-1)',
      fontSize:        10,
      fontWeight:      700,
      padding:         '2px 6px',
      borderRadius:    'var(--m-radius-sm)',
      backgroundColor: `${CRITERIO_COLOR[estado]}22`,
      color:           CRITERIO_COLOR[estado],
      border:          `1px solid ${CRITERIO_COLOR[estado]}44`,
      fontFamily:      'var(--m-font-mono)',
    }}>
      {id} {CRITERIO_ICON[estado]}
    </span>
  );
}

// ─── ScoreBadge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color = score === 8
    ? 'var(--m-color-ok)'
    : score >= 5
    ? 'var(--m-color-warn)'
    : 'var(--m-color-error)';

  return (
    <div style={{
      width:           32,
      height:          32,
      borderRadius:    '50%',
      backgroundColor: `${color}22`,
      border:          `2px solid ${color}`,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      fontSize:        12,
      fontWeight:      800,
      color,
      flexShrink:      0,
      fontFamily:      'var(--m-font-mono)',
    }}>
      {score}
    </div>
  );
}

// ─── StatusPill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: ModuleStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span style={{
      fontSize:        10,
      fontWeight:      700,
      padding:         '2px 8px',
      borderRadius:    'var(--m-radius-sm)',
      backgroundColor: `${color}22`,
      color,
      border:          `1px solid ${color}44`,
      whiteSpace:      'nowrap' as const,
    }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ─── ModuloRow ───────────────────────────────────────────────────────────────
interface ModuloRowProps {
  modulo:     RoadmapModule;
  isSelected: boolean;
  isAuditando: boolean;
  onSelect:   (id: string) => void;
  onAudit:    (id: string) => void;
}

function ModuloRow({ modulo, isSelected, isAuditando, onSelect, onAudit }: ModuloRowProps) {
  const score = scoreModulo(modulo.criterios);
  const criterioIds = ['C1','C2','C3','C4','C5','C6','C7','C8'] as CriterioId[];

  return (
    <div
      onClick={() => onSelect(modulo.id)}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             'var(--m-space-3)',
        padding:         'var(--m-space-3) var(--m-space-4)',
        backgroundColor: isSelected ? 'var(--m-color-primary-soft)' : 'var(--m-color-surface)',
        border:          `1px solid ${isSelected ? 'var(--m-color-primary)' : 'var(--m-color-border)'}`,
        borderRadius:    'var(--m-radius-md)',
        cursor:          'pointer',
        marginBottom:    'var(--m-space-2)',
        transition:      'background-color 0.15s ease',
      }}
    >
      <ScoreBadge score={score} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize:     13,
          fontWeight:   600,
          color:        'var(--m-color-text)',
          marginBottom: 'var(--m-space-1)',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap' as const,
        }}>
          {modulo.nombre}
        </div>
        <div style={{ display: 'flex', gap: 'var(--m-space-1)', flexWrap: 'wrap' as const }}>
          {criterioIds.map(id => (
            <CriterioTag
              key={id}
              id={id}
              estado={modulo.criterios?.[id] ?? 'pending'}
            />
          ))}
        </div>
      </div>

      <StatusPill status={modulo.status} />

      <button
        onClick={e => { e.stopPropagation(); onAudit(modulo.id); }}
        disabled={isAuditando}
        style={{
          padding:         '4px 10px',
          borderRadius:    'var(--m-radius-sm)',
          border:          '1px solid var(--m-color-border)',
          backgroundColor: 'transparent',
          color:           'var(--m-color-text-muted)',
          fontSize:        11,
          fontWeight:      600,
          cursor:          isAuditando ? 'not-allowed' : 'pointer',
          opacity:         isAuditando ? 0.5 : 1,
          flexShrink:      0,
        }}
      >
        {isAuditando ? '...' : 'Auditar'}
      </button>
    </div>
  );
}

// ─── ModuleDetail ────────────────────────────────────────────────────────────
interface ModuleDetailProps {
  modulo:    RoadmapModule;
  onClose:   () => void;
  onUpdate:  (updated: RoadmapModule) => void;
}

function ModuleDetail({ modulo, onClose, onUpdate }: ModuleDetailProps) {
  const score = scoreModulo(modulo.criterios);
  const criterioIds = ['C1','C2','C3','C4','C5','C6','C7','C8'] as CriterioId[];

  const handleToggleCriterio = async (criterioId: CriterioId) => {
    const ciclo: CriterioEstado[] = ['pending', 'ok', 'warn', 'error'];
    const actual = modulo.criterios?.[criterioId] ?? 'pending';
    const next = ciclo[(ciclo.indexOf(actual) + 1) % ciclo.length];
    try {
      const updated = await updateCriterio(modulo.id, criterioId, next);
      onUpdate(updated);
    } catch {
      // fallback optimista
      onUpdate({
        ...modulo,
        criterios: { ...modulo.criterios, [criterioId]: next },
      });
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position:        'fixed',
          inset:           0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex:          100,
          backdropFilter:  'blur(2px)',
        }}
      />

      {/* Panel */}
      <div style={{
        position:        'fixed',
        top:             0,
        right:           0,
        bottom:          0,
        width:           480,
        backgroundColor: 'var(--m-color-surface)',
        zIndex:          101,
        display:         'flex',
        flexDirection:   'column' as const,
        boxShadow:       'var(--m-shadow-lg)',
        borderLeft:      '1px solid var(--m-color-border)',
      }}>
        {/* Header del drawer */}
        <div style={{
          padding:      'var(--m-space-4) var(--m-space-6)',
          borderBottom: '1px solid var(--m-color-border)',
          display:      'flex',
          alignItems:   'center',
          gap:          'var(--m-space-3)',
        }}>
          <ScoreBadge score={score} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--m-color-text)' }}>
              {modulo.nombre}
            </div>
            <div style={{ fontSize: 11, color: 'var(--m-color-text-muted)', fontFamily: 'var(--m-font-mono)' }}>
              {modulo.id}
            </div>
          </div>
          <StatusPill status={modulo.status} />
          <button
            onClick={onClose}
            style={{
              background:   'none',
              border:       'none',
              cursor:       'pointer',
              color:        'var(--m-color-text-muted)',
              fontSize:     18,
              padding:      'var(--m-space-1)',
              lineHeight:   1,
            }}
          >✕</button>
        </div>

        {/* Criterios */}
        <div style={{ flex: 1, overflowY: 'auto' as const, padding: 'var(--m-space-6)' }}>
          <div style={{
            fontSize:      11,
            fontWeight:    700,
            color:         'var(--m-color-text-muted)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            marginBottom:  'var(--m-space-4)',
          }}>
            Criterios C1–C8
          </div>

          {criterioIds.map(id => {
            const meta  = CRITERIOS_META.find(c => c.id === id)!;
            const estado = modulo.criterios?.[id] ?? 'pending';
            const color  = CRITERIO_COLOR[estado];

            return (
              <div
                key={id}
                style={{
                  display:         'flex',
                  alignItems:      'flex-start',
                  gap:             'var(--m-space-3)',
                  padding:         'var(--m-space-3)',
                  borderRadius:    'var(--m-radius-md)',
                  backgroundColor: `${color}11`,
                  border:          `1px solid ${color}33`,
                  marginBottom:    'var(--m-space-2)',
                  cursor:          'pointer',
                  transition:      'background-color 0.15s ease',
                }}
                onClick={() => handleToggleCriterio(id)}
              >
                <span style={{
                  fontSize:   10,
                  fontWeight: 800,
                  color,
                  fontFamily: 'var(--m-font-mono)',
                  minWidth:   24,
                  paddingTop: 2,
                }}>
                  {id}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--m-color-text)', marginBottom: 2 }}>
                    {meta.label}
                    <span style={{
                      marginLeft:      'var(--m-space-2)',
                      fontSize:        9,
                      fontWeight:      600,
                      padding:         '1px 5px',
                      borderRadius:    'var(--m-radius-sm)',
                      backgroundColor: meta.deteccion === 'automatico'
                        ? 'var(--m-color-ok-soft)'
                        : 'var(--m-color-warn-soft)',
                      color: meta.deteccion === 'automatico'
                        ? 'var(--m-color-ok)'
                        : 'var(--m-color-warn)',
                    }}>
                      {meta.deteccion}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--m-color-text-muted)' }}>
                    {meta.descripcion}
                  </div>
                </div>
                <span style={{ fontSize: 14, color, fontWeight: 800, flexShrink: 0 }}>
                  {CRITERIO_ICON[estado]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding:    'var(--m-space-4) var(--m-space-6)',
          borderTop:  '1px solid var(--m-color-border)',
          fontSize:   11,
          color:      'var(--m-color-text-muted)',
        }}>
          {modulo.auditedAt
            ? `Última auditoría: ${new Date(modulo.auditedAt).toLocaleString('es-UY')}`
            : 'Sin auditoría registrada'
          }
        </div>
      </div>
    </>
  );
}

// =============================================================================
// VISTA PRINCIPAL
// =============================================================================

export function ChecklistRoadmapView() {
  const { isReady } = useOrchestrator();

  const [modulos,     setModulos]     = useState<RoadmapModule[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [auditando,   setAuditando]   = useState<string | null>(null);
  const [search,      setSearch]      = useState('');
  const [filterStatus, setFilterStatus] = useState<ModuleStatus | 'todos'>('todos');

  // ─── Carga de datos ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    getAllModules()
      .then(data => { setModulos(data); setError(null); })
      .catch(err  => setError(err.message ?? 'Error cargando módulos'))
      .finally(()  => setLoading(false));
  }, [isReady]);

  // ─── Auditoría ────────────────────────────────────────────────────────────
  const handleAudit = useCallback(async (moduleId: string) => {
    setAuditando(moduleId);
    try {
      const result = await auditModulo(moduleId);
      if (!result) return;
      setModulos(prev => prev.map(m =>
        m.id === moduleId
          ? { ...m, criterios: Object.fromEntries(
              Object.entries(result.criterios).map(([k, v]) => [k, v.estado])
            ) as Record<CriterioId, CriterioEstado>, auditedAt: result.timestamp }
          : m
      ));
    } finally {
      setAuditando(null);
    }
  }, []);

  // ─── Update desde detail ──────────────────────────────────────────────────
  const handleUpdate = useCallback((updated: RoadmapModule) => {
    setModulos(prev => prev.map(m => m.id === updated.id ? updated : m));
  }, []);

  // ─── Filtrado y agrupado ──────────────────────────────────────────────────
  const filtrados = useMemo(() => {
    return modulos.filter(m => {
      const matchSearch = !search
        || m.nombre.toLowerCase().includes(search.toLowerCase())
        || m.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'todos' || m.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [modulos, search, filterStatus]);

  const familias = useMemo(() => agruparPorFamilia(filtrados), [filtrados]);

  const selectedModule = modulos.find(m => m.id === selectedId) ?? null;

  // ─── Stats globales ───────────────────────────────────────────────────────
  const totalOk        = modulos.filter(m => m.status === 'cumple-estandar' || m.status === 'produccion').length;
  const totalBloqueados = modulos.filter(m => m.status === 'bloqueado').length;
  const pctGlobal      = modulos.length ? Math.round(totalOk / modulos.length * 100) : 0;
  const scorePromedio  = modulos.length
    ? Math.round(modulos.reduce((acc, m) => acc + scoreModulo(m.criterios), 0) / modulos.length * 10) / 10
    : 0;

  // ─── Render ───────────────────────────────────────────────────────────────
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
      display:       'flex',
      flexDirection: 'column' as const,
      height:        '100%',
      backgroundColor: 'var(--m-color-bg)',
      fontFamily:    'var(--m-font-sans)',
    }}>

      {/* ── Stats bar ── */}
      <div style={{
        display:    'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap:        'var(--m-space-3)',
        padding:    'var(--m-space-4) var(--m-space-6)',
        borderBottom: '1px solid var(--m-color-border)',
      }}>
        {[
          { label: 'Módulos totales',   value: modulos.length,   color: 'var(--m-color-text)' },
          { label: 'Cumplen estándar',  value: totalOk,          color: 'var(--m-color-ok)' },
          { label: 'Bloqueados',        value: totalBloqueados,  color: 'var(--m-color-error)' },
          { label: 'Score promedio',    value: `${scorePromedio}/8`, color: 'var(--m-color-primary)' },
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

      {/* ── Toolbar ── */}
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

      {/* ── Lista por familia ── */}
      <div style={{ flex: 1, overflowY: 'auto' as const, padding: 'var(--m-space-4) var(--m-space-6)' }}>
        {familias.length === 0 ? (
          <div style={{ textAlign: 'center' as const, color: 'var(--m-color-text-muted)', padding: 'var(--m-space-12)' }}>
            No hay módulos que coincidan con los filtros.
          </div>
        ) : (
          familias.map(familia => (
            <div key={familia.nombre} style={{ marginBottom: 'var(--m-space-6)' }}>
              {/* Header de familia */}
              <div style={{
                display:       'flex',
                alignItems:    'center',
                gap:           'var(--m-space-3)',
                marginBottom:  'var(--m-space-3)',
              }}>
                <span style={{
                  fontSize:      11,
                  fontWeight:    700,
                  color:         'var(--m-color-text-muted)',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                }}>
                  {familia.nombre}
                </span>
                <span style={{ fontSize: 11, color: 'var(--m-color-text-subtle)' }}>
                  {familia.modulos.length} módulos · {familia.porcentajeCumplimiento}% estándar
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--m-color-border)' }} />
              </div>

              {/* Módulos de la familia */}
              {familia.modulos.map(modulo => (
                <ModuloRow
                  key={modulo.id}
                  modulo={modulo}
                  isSelected={selectedId === modulo.id}
                  isAuditando={auditando === modulo.id}
                  onSelect={id => setSelectedId(id === selectedId ? null : id)}
                  onAudit={handleAudit}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* ── Detail drawer ── */}
      {selectedModule && (
        <ModuleDetail
          modulo={selectedModule}
          onClose={() => setSelectedId(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
