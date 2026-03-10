// ui/views/ChecklistRoadmapView.tsx
// C1: Componente React principal del módulo — registrado en moduleManifest.ts
// C5: Zero colores hardcodeados. Solo tokens CSS --m-* definidos en tokens.css
// Sin imports de otros módulos. Sin supabase.from() directo.
//
// ADAPTACIONES PARA charlie.core localhost:517:
// ─ Importa useOrchestrator() desde el contexto del OrchestratorProvider
// ─ Usa MainSection typing compatible con AdminDashboard.tsx
// ─ El manifest se lee vía syncManifest que ya corrió al montar AdminDashboard
// ─ Navigation: usa onNavigate del shell (acceptsOnNavigate: true en manifest)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../tokens.css';

// Hooks de Charlie Core — disponibles en localhost:517
// Ajustar path según estructura real del proyecto
import { useOrchestrator } from '@/app/context/OrchestratorContext';
import type { RoadmapModule, FamiliaGroup, CriterioId, CriterioEstado, ModuleStatus } from '../../types';

// ─── Datos internos (CRITERIOS_META) ─────────────────────────────────────────
// Definición canónica de los 8 criterios según CAP 03

const CRITERIOS_META: Array<{
  id: CriterioId;
  label: string;
  descripcion: string;
  deteccion: 'automatico' | 'parcial';
  howToFix: string;
}> = [
  {
    id: 'C1', label: 'Vista (UI)', deteccion: 'automatico',
    descripcion: 'isReal: true en manifest + componente React exportado.',
    howToFix: 'Crear el componente y registrarlo en moduleManifest.ts con isReal: true.',
  },
  {
    id: 'C2', label: 'Backend (DB)', deteccion: 'automatico',
    descripcion: 'hasSupabase: true en manifest + tabla accesible en Supabase del tenant.',
    howToFix: 'Crear schema.sql idempotente y ejecutarlo en el Supabase del tenant.',
  },
  {
    id: 'C3', label: 'Service layer', deteccion: 'automatico',
    descripcion: 'Existe {nombre}Api.ts en src/modules/{id}/service/',
    howToFix: 'Crear el archivo de servicio con getAll, getById, create, update, remove.',
  },
  {
    id: 'C4', label: 'module.config.ts', deteccion: 'automatico',
    descripcion: 'Existe src/modules/{id}/module.config.ts',
    howToFix: 'Crear module.config.ts siguiendo el template oficial (CAP 05).',
  },
  {
    id: 'C5', label: 'Sin colores hardcodeados', deteccion: 'automatico',
    descripcion: 'grep #HEX y rgb() en el viewFile — 0 ocurrencias permitidas.',
    howToFix: 'Reemplazar cada valor por el token CSS --m-* correspondiente.',
  },
  {
    id: 'C6', label: 'Tokens CSS definidos', deteccion: 'automatico',
    descripcion: 'Existe ui/tokens.css con fallbacks para todos los --m-* usados.',
    howToFix: 'Crear tokens.css con los fallbacks del estándar (ver CAP 05 §4.2).',
  },
  {
    id: 'C7', label: 'Party Model', deteccion: 'parcial',
    descripcion: 'No usa tablas transportistas/clientes/couriers directas — usa organizaciones + roles_contextuales.',
    howToFix: 'Migrar drawer: buscar en organizaciones primero, agregar rol si no existe.',
  },
  {
    id: 'C8', label: 'Data Zero (Conjuntos)', deteccion: 'parcial',
    descripcion: 'useTable() con nombre semántico, no supabase.from(\'tabla\') hardcodeado.',
    howToFix: 'Reemplazar llamadas directas por useTable(\'nombre-semantico\').',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<ModuleStatus, { emoji: string; label: string; color: string }> = {
  'no-registrado':   { emoji: '⬜', label: 'No Registrado',   color: 'var(--m-state-no-registrado)' },
  'registrado':      { emoji: '🟣', label: 'Registrado',      color: 'var(--m-state-registrado)' },
  'bloqueado':       { emoji: '🔴', label: 'Bloqueado',       color: 'var(--m-state-bloqueado)' },
  'en-progreso':     { emoji: '🟡', label: 'En Progreso',     color: 'var(--m-state-en-progreso)' },
  'ui-lista':        { emoji: '🔵', label: 'UI Lista',        color: 'var(--m-state-ui-lista)' },
  'cumple-estandar': { emoji: '🟢', label: 'Cumple Estándar', color: 'var(--m-state-cumple)' },
  'produccion':      { emoji: '✅', label: 'Producción',      color: 'var(--m-state-produccion)' },
};

function calcularPorcentaje(criterios: Record<CriterioId, CriterioEstado>): number {
  const vals = Object.values(criterios);
  if (!vals.length) return 0;
  return Math.round((vals.filter(v => v === 'ok').length / 8) * 100);
}

function calcularStatus(mod: RoadmapModule): ModuleStatus {
  const c = mod.criterios;
  if (!c) return 'registrado';
  const ok = (id: CriterioId) => c[id] === 'ok';
  const err = (id: CriterioId) => c[id] === 'error';
  const allOk = (['C1','C2','C3','C4','C5','C6','C7','C8'] as CriterioId[]).every(ok);
  const anyErr = (['C1','C2','C3','C4','C5','C6','C7','C8'] as CriterioId[]).some(err);

  if (anyErr && (mod.status === 'produccion' || mod.status === 'cumple-estandar')) return 'bloqueado';
  if (allOk && mod.status === 'produccion') return 'produccion';
  if (allOk) return 'cumple-estandar';
  if (ok('C1') && ok('C3')) return 'ui-lista';
  if (ok('C1')) return 'en-progreso';
  return 'registrado';
}

// ─── Mock data (reemplazar por getAllModules() cuando esté conectado a Supabase)
// Se usa solo cuando useOrchestrator no tiene módulos sincronizados todavía.

function buildMockFromManifest(manifest: any[]): RoadmapModule[] {
  return manifest.map((entry, i) => ({
    id: entry.section,
    section: entry.section,
    nombre: entry.section.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    familia: entry.group || 'sin-clasificar',
    viewFile: entry.viewFile || '',
    isReal: !!entry.isReal,
    hasSupabase: !!entry.hasSupabase,
    status: (entry.isReal && entry.hasSupabase ? 'en-progreso' : entry.isReal ? 'ui-lista' : 'registrado') as ModuleStatus,
    prioridad: i + 1,
    criterios: {
      C1: entry.isReal ? 'ok' : 'error',
      C2: entry.hasSupabase ? 'ok' : 'error',
      C3: entry.isReal ? 'ok' : 'error',
      C4: 'pending',
      C5: 'pending',
      C6: 'pending',
      C7: 'pending',
      C8: 'pending',
    } as Record<CriterioId, CriterioEstado>,
  }));
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ChecklistRoadmapView() {
  const { manifest, tenant } = useOrchestrator?.() ?? { manifest: [], tenant: null };

  const [modulos, setModulos] = useState<RoadmapModule[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [vista, setVista] = useState<'familias' | 'roadmap'>('familias');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ModuleStatus | 'todos'>('todos');
  const [auditando, setAuditando] = useState<string | null>(null);
  const [expandedFix, setExpandedFix] = useState<CriterioId | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  // Cargar módulos al montar — en producción, usar getAllModules()
  useEffect(() => {
    const data = buildMockFromManifest(manifest ?? []);
    setModulos(data.length > 0 ? data : DEMO_MODULES);
  }, [manifest]);

  const selectedModule = modulos.find(m => m.id === selectedId) ?? null;

  // Agrupar por familia
  const familias: FamiliaGroup[] = React.useMemo(() => {
    const filtered = modulos.filter(m => {
      const matchSearch = !searchQuery || m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'todos' || m.status === filterStatus;
      return matchSearch && matchStatus;
    });
    const map = new Map<string, RoadmapModule[]>();
    for (const m of filtered) {
      if (!map.has(m.familia)) map.set(m.familia, []);
      map.get(m.familia)!.push(m);
    }
    return Array.from(map.entries()).map(([nombre, mods]) => ({
      nombre,
      modulos: mods,
      porcentajeCumplimiento: Math.round(
        mods.filter(m => m.status === 'cumple-estandar' || m.status === 'produccion').length / mods.length * 100
      ),
    })).sort((a, b) => b.porcentajeCumplimiento - a.porcentajeCumplimiento);
  }, [modulos, searchQuery, filterStatus]);

  // Auditoría manual de un módulo
  const handleAudit = useCallback(async (moduleId: string) => {
    setAuditando(moduleId);
    // Simula latencia de auditoría — en producción usa runAudit(moduleId)
    await new Promise(r => setTimeout(r, 900));
    setModulos(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      const updated = { ...m, auditedAt: new Date().toISOString() };
      updated.status = calcularStatus(updated);
      return updated;
    }));
    setAuditando(null);
  }, []);

  // Toggle criterio (solo para demo — en producción usa updateCriterio())
  const handleToggleCriterio = useCallback((moduleId: string, criterioId: CriterioId) => {
    setModulos(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      const ciclo: CriterioEstado[] = ['pending', 'ok', 'warn', 'error'];
      const actual = m.criterios[criterioId] ?? 'pending';
      const next = ciclo[(ciclo.indexOf(actual) + 1) % ciclo.length];
      const criterios = { ...m.criterios, [criterioId]: next };
      return { ...m, criterios, status: calcularStatus({ ...m, criterios }) };
    }));
  }, []);

  const totalOk = modulos.filter(m => m.status === 'cumple-estandar' || m.status === 'produccion').length;
  const totalBloqueados = modulos.filter(m => m.status === 'bloqueado').length;
  const pctGlobal = modulos.length ? Math.round(totalOk / modulos.length * 100) : 0;

  return (
    <div style={styles.root}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>⚙️</span>
          <div>
            <h1 style={styles.headerTitle}>Checklist & Roadmap</h1>
            <p style={styles.headerSub}>
              {modulos.length} módulos · {totalOk} cumplen estándar
              {totalBloqueados > 0 && (
                <span style={styles.headerBadgeBlocked}> · {totalBloqueados} bloqueados</span>
              )}
            </p>
          </div>
        </div>
        <div style={styles.headerRight}>
          {/* Progress global */}
          <div style={styles.progressWrap}>
            <div style={styles.progressLabel}>{pctGlobal}% estándar</div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${pctGlobal}%` }} />
            </div>
          </div>
          {/* Vista switcher */}
          <div style={styles.tabSwitch}>
            {(['familias', 'roadmap'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVista(v)}
                style={vista === v ? styles.tabActive : styles.tab}
              >
                {v === 'familias' ? '📋 Familias' : '🗺️ Roadmap'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Buscar módulo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          style={styles.filterSelect}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
        >
          <option value="todos">Todos los estados</option>
          {(Object.keys(STATUS_META) as ModuleStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_META[s].emoji} {STATUS_META[s].label}</option>
          ))}
        </select>
        <span style={styles.toolbarCount}>{modulos.length} módulos</span>
      </div>

      {/* ── Body ── */}
      <div style={styles.body}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          {vista === 'familias' ? (
            familias.map(fam => (
              <FamiliaSection
                key={fam.nombre}
                familia={fam}
                selectedId={selectedId}
                onSelect={id => { setSelectedId(id); setExpandedFix(null); }}
                auditando={auditando}
              />
            ))
          ) : (
            <RoadmapView
              modulos={modulos.filter(m => {
                const matchSearch = !searchQuery || m.nombre.toLowerCase().includes(searchQuery.toLowerCase());
                const matchStatus = filterStatus === 'todos' || m.status === filterStatus;
                return matchSearch && matchStatus;
              })}
              selectedId={selectedId}
              onSelect={id => { setSelectedId(id); setExpandedFix(null); }}
            />
          )}
        </div>

        {/* Detail panel */}
        {selectedModule && (
          <div style={styles.rightPanel} ref={detailRef}>
            <ModuleDetail
              mod={selectedModule}
              auditando={auditando === selectedModule.id}
              expandedFix={expandedFix}
              onAudit={() => handleAudit(selectedModule.id)}
              onToggleCriterio={(cid) => handleToggleCriterio(selectedModule.id, cid)}
              onToggleFix={cid => setExpandedFix(expandedFix === cid ? null : cid)}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FamiliaSection({ familia, selectedId, onSelect, auditando }: {
  familia: FamiliaGroup;
  selectedId: string | null;
  onSelect: (id: string) => void;
  auditando: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={styles.familiaBlock}>
      <button style={styles.familiaHeader} onClick={() => setCollapsed(c => !c)}>
        <span style={styles.familiaChevron}>{collapsed ? '▶' : '▼'}</span>
        <span style={styles.familiaNombre}>{familia.nombre}</span>
        <span style={styles.familiaCount}>{familia.modulos.length}</span>
        <div style={styles.familiaPctWrap}>
          <div style={styles.familiaPctBar}>
            <div style={{ ...styles.familiaPctFill, width: `${familia.porcentajeCumplimiento}%` }} />
          </div>
          <span style={styles.familiaPctLabel}>{familia.porcentajeCumplimiento}%</span>
        </div>
      </button>
      {!collapsed && (
        <div style={styles.familiaList}>
          {familia.modulos.map(m => (
            <ModuleRow
              key={m.id}
              mod={m}
              selected={selectedId === m.id}
              onSelect={() => onSelect(m.id)}
              auditando={auditando === m.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleRow({ mod, selected, onSelect, auditando }: {
  mod: RoadmapModule;
  selected: boolean;
  onSelect: () => void;
  auditando: boolean;
}) {
  const statusMeta = STATUS_META[mod.status] ?? STATUS_META['registrado'];
  const pct = calcularPorcentaje(mod.criterios);

  return (
    <button
      style={{
        ...styles.moduleRow,
        background: selected ? 'var(--m-color-surface-hover)' : 'transparent',
        borderLeft: selected ? '3px solid var(--m-color-primary)' : '3px solid transparent',
      }}
      onClick={onSelect}
    >
      <span style={{ ...styles.moduleStatus, color: statusMeta.color }}>
        {auditando ? '⏳' : statusMeta.emoji}
      </span>
      <div style={styles.moduleRowContent}>
        <span style={styles.moduleRowName}>{mod.nombre}</span>
        <span style={styles.moduleRowId}>{mod.id}</span>
      </div>
      <div style={styles.moduleRowRight}>
        <div style={styles.moduleMiniBar}>
          <div style={{ ...styles.moduleMiniFill, width: `${pct}%` }} />
        </div>
        <span style={styles.moduleMiniPct}>{pct}%</span>
      </div>
    </button>
  );
}

function RoadmapView({ modulos, selectedId, onSelect }: {
  modulos: RoadmapModule[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const sorted = [...modulos].sort((a, b) => a.prioridad - b.prioridad);
  const statusOrder: ModuleStatus[] = ['bloqueado', 'registrado', 'en-progreso', 'ui-lista', 'cumple-estandar', 'produccion'];

  return (
    <div style={styles.roadmapWrap}>
      {statusOrder.map(status => {
        const mods = sorted.filter(m => m.status === status);
        if (!mods.length) return null;
        const meta = STATUS_META[status];
        return (
          <div key={status} style={styles.roadmapLane}>
            <div style={styles.roadmapLaneHeader}>
              <span>{meta.emoji}</span>
              <span style={styles.roadmapLaneLabel}>{meta.label}</span>
              <span style={styles.roadmapLaneCount}>{mods.length}</span>
            </div>
            {mods.map(m => (
              <ModuleRow
                key={m.id}
                mod={m}
                selected={selectedId === m.id}
                onSelect={() => onSelect(m.id)}
                auditando={false}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ModuleDetail({ mod, auditando, expandedFix, onAudit, onToggleCriterio, onToggleFix, onClose }: {
  mod: RoadmapModule;
  auditando: boolean;
  expandedFix: CriterioId | null;
  onAudit: () => void;
  onToggleCriterio: (id: CriterioId) => void;
  onToggleFix: (id: CriterioId) => void;
  onClose: () => void;
}) {
  const statusMeta = STATUS_META[mod.status] ?? STATUS_META['registrado'];
  const pct = calcularPorcentaje(mod.criterios);

  return (
    <div style={styles.detail}>
      {/* Detail header */}
      <div style={styles.detailHeader}>
        <div style={styles.detailHeaderLeft}>
          <span style={{ ...styles.detailStatusDot, background: statusMeta.color }} />
          <div>
            <h2 style={styles.detailTitle}>{mod.nombre}</h2>
            <code style={styles.detailId}>{mod.id}</code>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      {/* Status + meta */}
      <div style={styles.detailMeta}>
        <div style={styles.detailMetaRow}>
          <span style={styles.detailMetaLabel}>Estado</span>
          <span style={{ ...styles.detailStatusBadge, color: statusMeta.color }}>
            {statusMeta.emoji} {statusMeta.label}
          </span>
        </div>
        <div style={styles.detailMetaRow}>
          <span style={styles.detailMetaLabel}>Familia</span>
          <span style={styles.detailMetaValue}>{mod.familia}</span>
        </div>
        <div style={styles.detailMetaRow}>
          <span style={styles.detailMetaLabel}>Cumplimiento</span>
          <span style={styles.detailMetaValue}>{pct}% ({Object.values(mod.criterios).filter(v => v === 'ok').length}/8 criterios)</span>
        </div>
        {mod.isReal && (
          <div style={styles.detailMetaRow}>
            <span style={styles.detailMetaLabel}>ViewFile</span>
            <code style={styles.detailMetaCode}>{mod.viewFile}</code>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={styles.detailProgressWrap}>
        <div style={styles.detailProgressBar}>
          <div style={{ ...styles.detailProgressFill, width: `${pct}%` }} />
        </div>
      </div>

      {/* Audit button */}
      <button
        style={auditando ? styles.auditBtnLoading : styles.auditBtn}
        onClick={onAudit}
        disabled={auditando}
      >
        {auditando ? '⏳ Auditando C1–C6...' : '⚡ Re-auditar módulo'}
      </button>

      {/* Criterios C1–C8 */}
      <div style={styles.criteriosLabel}>Criterios de Cumplimiento</div>
      <div style={styles.criteriosList}>
        {CRITERIOS_META.map(meta => {
          const estado = mod.criterios?.[meta.id] ?? 'pending';
          const isExpanded = expandedFix === meta.id;
          return (
            <div key={meta.id} style={styles.criterioWrap}>
              <div style={styles.criterioRow}>
                <button
                  style={styles.criterioToggleBtn}
                  onClick={() => onToggleCriterio(meta.id)}
                  title="Click para cambiar estado (demo)"
                >
                  <span style={styles.criterioId}>{meta.id}</span>
                  <span style={{ ...styles.criterioBadge, ...getCriterioBadgeStyle(estado) }}>
                    {getCriterioIcon(estado)}
                  </span>
                </button>
                <div style={styles.criterioContent}>
                  <div style={styles.criterioLabelRow}>
                    <span style={styles.criterioLabel}>{meta.label}</span>
                    <span style={styles.criterioDeteccion}>
                      {meta.deteccion === 'automatico' ? '✅ Auto' : '⚠️ Parcial'}
                    </span>
                  </div>
                  <p style={styles.criterioDesc}>{meta.descripcion}</p>
                </div>
                {estado !== 'ok' && (
                  <button
                    style={styles.howToBtn}
                    onClick={() => onToggleFix(meta.id)}
                  >
                    {isExpanded ? '▲' : '¿Cómo?'}
                  </button>
                )}
              </div>
              {isExpanded && (
                <div style={styles.howToBox}>
                  <span style={styles.howToIcon}>🔧</span>
                  <p style={styles.howToText}>{meta.howToFix}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notas */}
      {mod.notas && (
        <div style={styles.notasBox}>
          <span style={styles.notasLabel}>📝 Notas</span>
          <p style={styles.notasText}>{mod.notas}</p>
        </div>
      )}
    </div>
  );
}

// ─── Helpers de estilo de criterios ──────────────────────────────────────────

function getCriterioIcon(estado: CriterioEstado): string {
  return { ok: '✓', warn: '⚠', error: '✗', pending: '·' }[estado];
}

function getCriterioBadgeStyle(estado: CriterioEstado): React.CSSProperties {
  return {
    ok:      { background: 'var(--m-color-ok-soft)',      color: 'var(--m-color-ok)' },
    warn:    { background: 'var(--m-color-warn-soft)',    color: 'var(--m-color-warn)' },
    error:   { background: 'var(--m-color-error-soft)',   color: 'var(--m-color-error)' },
    pending: { background: 'var(--m-color-pending-soft)', color: 'var(--m-color-pending)' },
  }[estado];
}

// ─── Styles (100% tokens --m-*) ───────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
    background: 'var(--m-color-bg)', color: 'var(--m-color-text)',
    fontFamily: 'var(--m-font-sans)', fontSize: '14px',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: 'var(--m-space-6)', borderBottom: '1px solid var(--m-color-border)',
    flexShrink: 0,
  },
  headerLeft:   { display: 'flex', alignItems: 'center', gap: 'var(--m-space-3)' },
  headerIcon:   { fontSize: '24px' },
  headerTitle:  { margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--m-color-text)' },
  headerSub:    { margin: 0, fontSize: '12px', color: 'var(--m-color-text-muted)', marginTop: '2px' },
  headerBadgeBlocked: { color: 'var(--m-color-error)' },
  headerRight:  { display: 'flex', alignItems: 'center', gap: 'var(--m-space-4)' },
  progressWrap: { display: 'flex', alignItems: 'center', gap: 'var(--m-space-2)' },
  progressLabel:{ fontSize: '12px', color: 'var(--m-color-text-muted)', whiteSpace: 'nowrap' },
  progressBar:  { width: '80px', height: '6px', background: 'var(--m-color-surface-2)', borderRadius: '99px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--m-color-ok)', borderRadius: '99px', transition: 'width 0.4s ease' },
  tabSwitch:    { display: 'flex', gap: 'var(--m-space-1)', background: 'var(--m-color-surface)', borderRadius: 'var(--m-radius-md)', padding: 'var(--m-space-1)' },
  tab:          { background: 'transparent', border: 'none', color: 'var(--m-color-text-muted)', padding: '6px 12px', borderRadius: 'var(--m-radius-sm)', cursor: 'pointer', fontSize: '13px' },
  tabActive:    { background: 'var(--m-color-surface-2)', border: 'none', color: 'var(--m-color-text)', padding: '6px 12px', borderRadius: 'var(--m-radius-sm)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  toolbar:      { display: 'flex', alignItems: 'center', gap: 'var(--m-space-3)', padding: 'var(--m-space-3) var(--m-space-6)', borderBottom: '1px solid var(--m-color-border)', flexShrink: 0 },
  searchWrap:   { display: 'flex', alignItems: 'center', gap: 'var(--m-space-2)', background: 'var(--m-color-surface)', borderRadius: 'var(--m-radius-md)', padding: '6px 12px', flex: 1, maxWidth: '280px' },
  searchIcon:   { fontSize: '12px', color: 'var(--m-color-text-subtle)' },
  searchInput:  { background: 'transparent', border: 'none', outline: 'none', color: 'var(--m-color-text)', fontSize: '13px', width: '100%' },
  filterSelect: { background: 'var(--m-color-surface)', border: '1px solid var(--m-color-border)', color: 'var(--m-color-text)', borderRadius: 'var(--m-radius-md)', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' },
  toolbarCount: { fontSize: '12px', color: 'var(--m-color-text-subtle)', marginLeft: 'auto' },
  body:         { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },
  leftPanel:    { flex: 1, overflowY: 'auto', padding: 'var(--m-space-4)' },
  rightPanel:   { width: '380px', borderLeft: '1px solid var(--m-color-border)', overflowY: 'auto', flexShrink: 0 },

  // Familia
  familiaBlock:  { marginBottom: 'var(--m-space-3)' },
  familiaHeader: { display: 'flex', alignItems: 'center', gap: 'var(--m-space-2)', width: '100%', background: 'var(--m-color-surface)', border: 'none', color: 'var(--m-color-text)', padding: '10px var(--m-space-4)', borderRadius: 'var(--m-radius-md)', cursor: 'pointer', textAlign: 'left', marginBottom: 'var(--m-space-1)' },
  familiaChevron:{ fontSize: '10px', color: 'var(--m-color-text-subtle)' },
  familiaNombre: { flex: 1, fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' },
  familiaCount:  { fontSize: '11px', background: 'var(--m-color-surface-2)', color: 'var(--m-color-text-muted)', padding: '2px 8px', borderRadius: '99px' },
  familiaPctWrap:{ display: 'flex', alignItems: 'center', gap: 'var(--m-space-2)' },
  familiaPctBar: { width: '48px', height: '4px', background: 'var(--m-color-border)', borderRadius: '99px', overflow: 'hidden' },
  familiaPctFill:{ height: '100%', background: 'var(--m-color-ok)', borderRadius: '99px' },
  familiaPctLabel:{ fontSize: '11px', color: 'var(--m-color-text-muted)', width: '30px', textAlign: 'right' },
  familiaList:   { paddingLeft: 'var(--m-space-2)' },

  // Module row
  moduleRow:     { display: 'flex', alignItems: 'center', gap: 'var(--m-space-3)', width: '100%', border: 'none', borderRadius: 'var(--m-radius-sm)', padding: '8px var(--m-space-3)', cursor: 'pointer', textAlign: 'left', marginBottom: '2px', transition: 'background 0.15s' },
  moduleStatus:  { fontSize: '14px', flexShrink: 0 },
  moduleRowContent:{ flex: 1, minWidth: 0 },
  moduleRowName: { display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--m-color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  moduleRowId:   { display: 'block', fontSize: '11px', color: 'var(--m-color-text-subtle)', fontFamily: 'var(--m-font-mono)' },
  moduleRowRight:{ display: 'flex', alignItems: 'center', gap: 'var(--m-space-2)', flexShrink: 0 },
  moduleMiniBar: { width: '36px', height: '3px', background: 'var(--m-color-border)', borderRadius: '99px', overflow: 'hidden' },
  moduleMiniFill:{ height: '100%', background: 'var(--m-color-ok)', borderRadius: '99px' },
  moduleMiniPct: { fontSize: '10px', color: 'var(--m-color-text-subtle)', width: '26px', textAlign: 'right' },

  // Roadmap
  roadmapWrap:   { display: 'flex', flexDirection: 'column', gap: 'var(--m-space-4)' },
  roadmapLane:   { background: 'var(--m-color-surface)', borderRadius: 'var(--m-radius-lg)', padding: 'var(--m-space-3)' },
  roadmapLaneHeader:{ display: 'flex', alignItems: 'center', gap: 'var(--m-space-2)', marginBottom: 'var(--m-space-2)', padding: '0 var(--m-space-2)' },
  roadmapLaneLabel: { flex: 1, fontSize: '12px', fontWeight: 600, color: 'var(--m-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  roadmapLaneCount: { fontSize: '11px', background: 'var(--m-color-surface-2)', color: 'var(--m-color-text-muted)', padding: '2px 8px', borderRadius: '99px' },

  // Detail panel
  detail:        { padding: 'var(--m-space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--m-space-4)' },
  detailHeader:  { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  detailHeaderLeft:{ display: 'flex', alignItems: 'center', gap: 'var(--m-space-3)' },
  detailStatusDot:{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, marginTop: '4px' },
  detailTitle:   { margin: 0, fontSize: '16px', fontWeight: 700 },
  detailId:      { fontSize: '11px', color: 'var(--m-color-text-muted)', fontFamily: 'var(--m-font-mono)' },
  closeBtn:      { background: 'transparent', border: 'none', color: 'var(--m-color-text-subtle)', cursor: 'pointer', fontSize: '16px', padding: '4px', borderRadius: 'var(--m-radius-sm)' },
  detailMeta:    { background: 'var(--m-color-surface)', borderRadius: 'var(--m-radius-md)', padding: 'var(--m-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--m-space-2)' },
  detailMetaRow: { display: 'flex', alignItems: 'center', gap: 'var(--m-space-3)' },
  detailMetaLabel:{ fontSize: '11px', color: 'var(--m-color-text-muted)', width: '80px', flexShrink: 0 },
  detailMetaValue:{ fontSize: '13px', color: 'var(--m-color-text)' },
  detailMetaCode: { fontSize: '11px', fontFamily: 'var(--m-font-mono)', color: 'var(--m-color-primary)' },
  detailStatusBadge:{ fontSize: '13px', fontWeight: 600 },
  detailProgressWrap:{ height: '4px', background: 'var(--m-color-surface-2)', borderRadius: '99px', overflow: 'hidden' },
  detailProgressBar: { height: '100%', width: '100%', background: 'var(--m-color-surface-2)', borderRadius: '99px' },
  detailProgressFill:{ height: '100%', background: 'var(--m-color-ok)', borderRadius: '99px', transition: 'width 0.4s ease' },
  auditBtn:      { background: 'var(--m-color-primary-soft)', border: '1px solid var(--m-color-primary)', color: 'var(--m-color-primary)', borderRadius: 'var(--m-radius-md)', padding: '8px var(--m-space-4)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' },
  auditBtnLoading:{ background: 'var(--m-color-surface)', border: '1px solid var(--m-color-border)', color: 'var(--m-color-text-muted)', borderRadius: 'var(--m-radius-md)', padding: '8px var(--m-space-4)', cursor: 'not-allowed', fontSize: '13px', fontWeight: 600 },
  criteriosLabel:{ fontSize: '11px', fontWeight: 700, color: 'var(--m-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  criteriosList: { display: 'flex', flexDirection: 'column', gap: 'var(--m-space-1)' },
  criterioWrap:  { borderRadius: 'var(--m-radius-md)', overflow: 'hidden' },
  criterioRow:   { display: 'flex', alignItems: 'flex-start', gap: 'var(--m-space-3)', padding: '8px var(--m-space-3)', background: 'var(--m-color-surface)' },
  criterioToggleBtn:{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--m-space-1)', flexShrink: 0, padding: 0 },
  criterioId:    { fontSize: '11px', fontFamily: 'var(--m-font-mono)', fontWeight: 700, color: 'var(--m-color-text-subtle)', width: '22px' },
  criterioBadge: { width: '22px', height: '22px', borderRadius: 'var(--m-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 },
  criterioContent:{ flex: 1, minWidth: 0 },
  criterioLabelRow:{ display: 'flex', alignItems: 'center', gap: 'var(--m-space-2)' },
  criterioLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--m-color-text)' },
  criterioDeteccion:{ fontSize: '10px', color: 'var(--m-color-text-subtle)' },
  criterioDesc:  { margin: '2px 0 0', fontSize: '11px', color: 'var(--m-color-text-muted)', lineHeight: '1.4' },
  howToBtn:      { background: 'transparent', border: '1px solid var(--m-color-border)', color: 'var(--m-color-text-muted)', borderRadius: 'var(--m-radius-sm)', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', flexShrink: 0, alignSelf: 'center' },
  howToBox:      { display: 'flex', gap: 'var(--m-space-3)', background: 'var(--m-color-warn-soft)', borderTop: '1px solid var(--m-color-warn)', padding: 'var(--m-space-3)' },
  howToIcon:     { fontSize: '14px', flexShrink: 0 },
  howToText:     { margin: 0, fontSize: '12px', color: 'var(--m-color-text)', lineHeight: '1.5' },
  notasBox:      { background: 'var(--m-color-surface)', borderRadius: 'var(--m-radius-md)', padding: 'var(--m-space-4)' },
  notasLabel:    { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--m-color-text-muted)', marginBottom: 'var(--m-space-2)' },
  notasText:     { margin: 0, fontSize: '12px', color: 'var(--m-color-text)', lineHeight: '1.5' },
};

// ─── Demo data (para cuando manifest está vacío — desarrollo local) ───────────

const DEMO_MODULES: RoadmapModule[] = [
  { id: 'dashboard',           section: 'dashboard',           nombre: 'Dashboard',           familia: 'core',            viewFile: 'DashboardView.tsx',          isReal: true,  hasSupabase: false, status: 'cumple-estandar', prioridad: 1,  criterios: { C1:'ok', C2:'ok', C3:'ok', C4:'ok', C5:'ok', C6:'ok', C7:'ok', C8:'ok' } },
  { id: 'checklist-roadmap',   section: 'checklist-roadmap',   nombre: 'Checklist & Roadmap', familia: 'core',            viewFile: 'ChecklistRoadmapView.tsx',   isReal: true,  hasSupabase: true,  status: 'produccion',      prioridad: 2,  criterios: { C1:'ok', C2:'ok', C3:'ok', C4:'ok', C5:'ok', C6:'ok', C7:'ok', C8:'ok' } },
  { id: 'constructor-modulos', section: 'constructor-modulos', nombre: 'Constructor Módulos', familia: 'core',            viewFile: 'ConstructorModulos.tsx',     isReal: true,  hasSupabase: false, status: 'cumple-estandar', prioridad: 3,  criterios: { C1:'ok', C2:'ok', C3:'ok', C4:'ok', C5:'ok', C6:'ok', C7:'ok', C8:'ok' } },
  { id: 'ecommerce',           section: 'ecommerce',           nombre: 'eCommerce',           familia: 'transaccional',   viewFile: 'EcommerceView.tsx',          isReal: true,  hasSupabase: true,  status: 'en-progreso',     prioridad: 4,  criterios: { C1:'ok', C2:'ok', C3:'ok', C4:'ok', C5:'error', C6:'ok', C7:'warn', C8:'warn' } },
  { id: 'logistica',           section: 'logistica',           nombre: 'Logística',           familia: 'operaciones',     viewFile: 'LogisticaView.tsx',          isReal: true,  hasSupabase: true,  status: 'ui-lista',        prioridad: 5,  criterios: { C1:'ok', C2:'ok', C3:'ok', C4:'error', C5:'ok', C6:'ok', C7:'warn', C8:'warn' } },
  { id: 'transportistas',      section: 'transportistas',      nombre: 'Transportistas',      familia: 'operaciones',     viewFile: 'TransportistasView.tsx',     isReal: true,  hasSupabase: true,  status: 'bloqueado',       prioridad: 6,  criterios: { C1:'ok', C2:'ok', C3:'ok', C4:'ok', C5:'error', C6:'ok', C7:'error', C8:'ok' } },
  { id: 'organizaciones',      section: 'organizaciones',      nombre: 'Organizaciones',      familia: 'erp-crm',         viewFile: 'OrganizacionesView.tsx',     isReal: true,  hasSupabase: true,  status: 'en-progreso',     prioridad: 7,  criterios: { C1:'ok', C2:'ok', C3:'ok', C4:'ok', C5:'ok', C6:'ok', C7:'pending', C8:'warn' } },
  { id: 'metodos-envio',       section: 'metodos-envio',       nombre: 'Métodos de Envío',    familia: 'transaccional',   viewFile: 'MetodosEnvioView.tsx',       isReal: true,  hasSupabase: false, status: 'registrado',      prioridad: 8,  criterios: { C1:'ok', C2:'error', C3:'ok', C4:'error', C5:'pending', C6:'pending', C7:'pending', C8:'pending' } },
  { id: 'marketing',           section: 'marketing',           nombre: 'Marketing',           familia: 'marketing',       viewFile: 'MarketingView.tsx',          isReal: false, hasSupabase: false, status: 'registrado',      prioridad: 9,  criterios: { C1:'error', C2:'error', C3:'error', C4:'error', C5:'pending', C6:'pending', C7:'pending', C8:'pending' } },
  { id: 'pedidos',             section: 'pedidos',             nombre: 'Pedidos',             familia: 'transaccional',   viewFile: 'PedidosView.tsx',            isReal: true,  hasSupabase: true,  status: 'cumple-estandar', prioridad: 10, criterios: { C1:'ok', C2:'ok', C3:'ok', C4:'ok', C5:'ok', C6:'ok', C7:'ok', C8:'ok' } },
];

export default ChecklistRoadmapView;
