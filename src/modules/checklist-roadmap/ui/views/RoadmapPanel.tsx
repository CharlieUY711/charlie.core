// =============================================================================
// RoadmapPanel.tsx — Pilar 1: Checklist & Roadmap
// C1: Panel de roadmap priorizado con drag-to-reorder
// C5: Zero colores hardcodeados — solo tokens CSS var(--m-*)
// C8: Datos via getAllModules() / updateModule() — nunca supabase.from() directo
// =============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../tokens.css';
import { getAllModules, updateModule } from '../../service/checklistRoadmapApi';
import type { RoadmapModule, ModuleStatus } from '../../types';

// =============================================================================
// CONSTANTES
// =============================================================================

const STATUS_ORDEN: Record<ModuleStatus, number> = {
  'no-registrado':   0,
  'registrado':      1,
  'bloqueado':       2,
  'en-progreso':     3,
  'ui-lista':        4,
  'cumple-estandar': 5,
  'produccion':      6,
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

const STATUS_LABEL: Record<ModuleStatus, string> = {
  'no-registrado':   'No registrado',
  'registrado':      'Registrado',
  'bloqueado':       'Bloqueado',
  'en-progreso':     'En progreso',
  'ui-lista':        'UI lista',
  'cumple-estandar': 'Cumple estándar',
  'produccion':      'Producción',
};

// =============================================================================
// HELPERS
// =============================================================================

function calcularScore(criterios: RoadmapModule['criterios']): number {
  if (!criterios) return 0;
  const vals = Object.values(criterios);
  if (vals.length === 0) return 0;
  const ok = vals.filter(v => v === 'ok').length;
  return Math.round((ok / 8) * 8);
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'var(--m-color-ok)';
  if (score >= 4) return 'var(--m-color-warn)';
  return 'var(--m-color-error)';
}

// =============================================================================
// COMPONENTE — TARJETA DE MÓDULO EN EL ROADMAP
// =============================================================================

interface RoadmapCardProps {
  modulo:       RoadmapModule;
  index:        number;
  isDragging:   boolean;
  isDragOver:   boolean;
  onDragStart:  (index: number) => void;
  onDragOver:   (index: number) => void;
  onDragEnd:    () => void;
  onIniciar:    (modulo: RoadmapModule) => void;
}

function RoadmapCard({
  modulo, index, isDragging, isDragOver,
  onDragStart, onDragOver, onDragEnd, onIniciar,
}: RoadmapCardProps) {
  const score = calcularScore(modulo.criterios);
  const scoreColor = getScoreColor(score);
  const statusColor = STATUS_COLOR[modulo.status] ?? 'var(--m-color-pending)';
  const puedeIniciar = modulo.status === 'registrado' || modulo.status === 'no-registrado';

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(index); }}
      onDragEnd={onDragEnd}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             'var(--m-space-3)',
        padding:         'var(--m-space-3) var(--m-space-4)',
        backgroundColor: isDragOver ? 'var(--m-color-primary-soft)' : 'var(--m-color-surface)',
        border:          `1px solid ${isDragOver ? 'var(--m-color-primary)' : 'var(--m-color-border)'}`,
        borderRadius:    'var(--m-radius-md)',
        marginBottom:    'var(--m-space-2)',
        cursor:          'grab',
        opacity:         isDragging ? 0.4 : 1,
        transition:      'all 0.15s',
        userSelect:      'none',
      }}
    >
      {/* Grip */}
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        gap:            3,
        opacity:        0.3,
        flexShrink:     0,
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            display: 'flex', gap: 3,
          }}>
            <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: 'var(--m-color-text)' }} />
            <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: 'var(--m-color-text)' }} />
          </div>
        ))}
      </div>

      {/* Número de prioridad */}
      <div style={{
        width:           28,
        height:          28,
        borderRadius:    'var(--m-radius-sm)',
        backgroundColor: 'var(--m-color-surface-2)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        fontSize:        11,
        fontWeight:      800,
        color:           'var(--m-color-text-muted)',
        flexShrink:      0,
      }}>
        {index + 1}
      </div>

      {/* Score badge */}
      <div style={{
        width:           32,
        height:          32,
        borderRadius:    '50%',
        backgroundColor: 'var(--m-color-surface-2)',
        border:          `2px solid ${scoreColor}`,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        fontSize:        12,
        fontWeight:      800,
        color:           scoreColor,
        flexShrink:      0,
      }}>
        {score}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize:     13,
          fontWeight:   700,
          color:        'var(--m-color-text)',
          marginBottom: 2,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}>
          {modulo.nombre}
        </div>
        <div style={{
          fontSize:  11,
          color:     'var(--m-color-text-muted)',
          fontFamily: 'var(--m-font-mono)',
        }}>
          {modulo.familia} · {modulo.id}
        </div>
      </div>

      {/* Status badge */}
      <div style={{
        fontSize:        10,
        fontWeight:      700,
        padding:         '3px 8px',
        borderRadius:    'var(--m-radius-sm)',
        backgroundColor: statusColor + '22',
        color:           statusColor,
        border:          `1px solid ${statusColor}44`,
        flexShrink:      0,
        whiteSpace:      'nowrap',
      }}>
        {STATUS_LABEL[modulo.status]}
      </div>

      {/* Botón iniciar */}
      {puedeIniciar && (
        <button
          onClick={e => { e.stopPropagation(); onIniciar(modulo); }}
          style={{
            padding:         '5px 12px',
            borderRadius:    'var(--m-radius-sm)',
            border:          '1px solid var(--m-color-primary)',
            backgroundColor: 'transparent',
            color:           'var(--m-color-primary)',
            fontSize:        11,
            fontWeight:      700,
            cursor:          'pointer',
            flexShrink:      0,
            transition:      'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--m-color-primary)';
            e.currentTarget.style.color           = 'var(--m-color-surface)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color           = 'var(--m-color-primary)';
          }}
        >
          Iniciar
        </button>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

interface Props {
  onNavigate?: (section: string) => void;
}

export function RoadmapPanel({ onNavigate }: Props) {
  const [modulos,      setModulos]      = useState<RoadmapModule[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<ModuleStatus | 'todos'>('todos');
  const [saving,       setSaving]       = useState(false);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const [dragOver,  setDragOver]  = useState<number | null>(null);
  const [dragging,  setDragging]  = useState<number | null>(null);

  // ── Carga de datos ──────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllModules();
      // Ordenar por prioridad
      const ordenados = [...data].sort((a, b) => (a.prioridad ?? 99) - (b.prioridad ?? 99));
      setModulos(ordenados);
    } catch (e) {
      setError('Error cargando el roadmap. Verificá la conexión con Supabase.');
      console.error('[RoadmapPanel]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  function handleDragStart(index: number) {
    dragIndex.current = index;
    setDragging(index);
  }

  function handleDragOver(index: number) {
    setDragOver(index);
  }

  function handleDragEnd() {
    const from = dragIndex.current;
    const to   = dragOver;

    if (from !== null && to !== null && from !== to) {
      const nuevo = [...modulos];
      const [item] = nuevo.splice(from, 1);
      nuevo.splice(to, 0, item);
      // Actualizar prioridades localmente
      const actualizados = nuevo.map((m, i) => ({ ...m, prioridad: i + 1 }));
      setModulos(actualizados);
      // Persistir en Supabase
      persistirPrioridades(actualizados);
    }

    dragIndex.current = null;
    setDragging(null);
    setDragOver(null);
  }

  async function persistirPrioridades(lista: RoadmapModule[]) {
    setSaving(true);
    try {
      await Promise.all(
        lista.map(m => updateModule(m.id, { prioridad: m.prioridad }))
      );
    } catch (e) {
      console.error('[RoadmapPanel] Error persistiendo prioridades:', e);
    } finally {
      setSaving(false);
    }
  }

  // ── Iniciar desarrollo ───────────────────────────────────────────────────
  async function handleIniciar(modulo: RoadmapModule) {
    try {
      await updateModule(modulo.id, { status: 'en-progreso' });
      setModulos(prev =>
        prev.map(m => m.id === modulo.id ? { ...m, status: 'en-progreso' } : m)
      );
    } catch (e) {
      console.error('[RoadmapPanel] Error iniciando módulo:', e);
    }
  }

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const modulosFiltrados = filtroStatus === 'todos'
    ? modulos
    : modulos.filter(m => m.status === filtroStatus);

  const statusDisponibles = Array.from(new Set(modulos.map(m => m.status)));

  // ── Stats ────────────────────────────────────────────────────────────────
  const enProgreso   = modulos.filter(m => m.status === 'en-progreso').length;
  const enProduccion = modulos.filter(m => m.status === 'produccion').length;
  const pendientes   = modulos.filter(m => m.status === 'registrado' || m.status === 'no-registrado').length;

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--m-color-text-muted)', fontSize: 13 }}>
      Cargando roadmap...
    </div>
  );

  if (error) return (
    <div style={{ padding: 'var(--m-space-8)', color: 'var(--m-color-error)', fontSize: 13 }}>
      {error}
    </div>
  );

  return (
    <div style={{
      height:          '100%',
      overflowY:       'auto',
      backgroundColor: 'var(--m-color-bg)',
      padding:         'var(--m-space-8)',
      boxSizing:       'border-box',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--m-space-6)' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--m-color-text)', margin: '0 0 4px' }}>
            Roadmap de Desarrollo
          </h2>
          <p style={{ fontSize: 12, color: 'var(--m-color-text-muted)', margin: 0 }}>
            {modulos.length} módulos · arrastrá para reordenar prioridades
            {saving && ' · guardando...'}
          </p>
        </div>

        {/* Filtro */}
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value as ModuleStatus | 'todos')}
          style={{
            padding:         '6px 12px',
            borderRadius:    'var(--m-radius-sm)',
            border:          '1px solid var(--m-color-border)',
            backgroundColor: 'var(--m-color-surface)',
            color:           'var(--m-color-text)',
            fontSize:        12,
            cursor:          'pointer',
          }}
        >
          <option value="todos">Todos los estados</option>
          {statusDisponibles.map(s => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: 'var(--m-space-3)', marginBottom: 'var(--m-space-6)' }}>
        {[
          { label: 'En progreso',  value: enProgreso,   color: 'var(--m-state-en-progreso)' },
          { label: 'Producción',   value: enProduccion, color: 'var(--m-state-produccion)' },
          { label: 'Pendientes',   value: pendientes,   color: 'var(--m-color-text-muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex:            1,
            padding:         'var(--m-space-3) var(--m-space-4)',
            backgroundColor: 'var(--m-color-surface)',
            border:          '1px solid var(--m-color-border)',
            borderRadius:    'var(--m-radius-md)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--m-color-text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Lista ── */}
      {modulosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--m-color-text-muted)', fontSize: 13, marginTop: 48 }}>
          No hay módulos con este estado.
        </div>
      ) : (
        <div>
          {modulosFiltrados.map((modulo, index) => (
            <RoadmapCard
              key={modulo.id}
              modulo={modulo}
              index={index}
              isDragging={dragging === index}
              isDragOver={dragOver === index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onIniciar={handleIniciar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
