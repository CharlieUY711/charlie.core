/* =====================================================
   ChecklistView — Dos árboles separados
   Árbol 1: Checklist (C1-C8)
   Árbol 2: Roadmap (pendientes de importar)
   ===================================================== */
import React, { useState, useEffect } from 'react';
import { useModuleSubtitulo } from '../../../hooks/useModuleSubtitulo';
import {
  ChevronRight, ChevronDown, CheckCircle2, XCircle,
  ToggleLeft, ToggleRight, Clock, Square,
} from 'lucide-react';
import { useModules } from '../../../../shells/DashboardShell/app/hooks/useModules';
import type { ModuloActivo } from '../../../../shells/DashboardShell/app/hooks/useModules';
import { DrawerAuditoria } from './DrawerAuditoria';

interface Props { onNavigate?: (s: string) => void; }

const CRITERIA = [
  { id: 'C1', description: 'Tiene componente React (view)',          auto: true  },
  { id: 'C2', description: 'Tiene tabla Supabase conectada',         auto: true  },
  { id: 'C3', description: 'Tiene {nombre}Api.ts en /services/',     auto: true  },
  { id: 'C4', description: 'Tiene module.config.ts',                 auto: false },
  { id: 'C5', description: 'Sin colores hardcodeados (CSS tokens)',  auto: false },
  { id: 'C6', description: 'Tiene tokens.css con fallbacks',         auto: false },
  { id: 'C7', description: 'Usa Party Model (organizaciones+roles)', auto: false },
  { id: 'C8', description: 'Usa Data Zero (useTable, no .from)',     auto: false },
];

function detectAuto(e: ModuloActivo) {
  return { C1: e.isReal, C2: !!e.hasSupabase, C3: !!e.serviceFile };
}

const STORAGE_KEY  = 'charlie_checklist_manual_v1';
const IMPORTED_KEY = 'charlie_imported_v1';

interface StoredModule { values: Record<string, boolean>; updatedAt: string; }

function loadManual(): Record<string, StoredModule> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
}
function saveManual(d: Record<string, StoredModule>) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
function loadImported(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(IMPORTED_KEY) ?? '[]')); } catch { return new Set(); }
}
function saveImported(s: Set<string>) { localStorage.setItem(IMPORTED_KEY, JSON.stringify([...s])); }

function fmtRelative(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

const GROUP_COLORS: Record<string, string> = {
  'sistema': '#475569', 'ecommerce': '#FF6835', 'logistica': '#059669',
  'marketing': '#EC4899', 'rrss': '#F43F5E', 'herramientas': '#0D9488',
  'gestion': '#2563EB', 'integraciones': '#0891B2', 'auth': '#7C3AED',
  'construccion': '#F59E0B', 'dashboard': '#6366F1',
};
const ROADMAP_COLOR = '#94A3B8';

// ─── Sub-componente: árbol genérico ──────────────────────────────────────────

interface TreeProps {
  entries:         ModuloActivo[];
  expandedState:   [Set<string>, (g: string) => void];
  isRoadmap:       boolean;
  manual?:         Record<string, StoredModule>;
  onToggleManual?: (section: string, cid: string) => void;
  onToggleImport?: (section: string) => void;
  onAuditar?:      (modulo: ModuloActivo) => void;
}
function GroupTree({ entries, expandedState, isRoadmap, manual, onToggleManual, onToggleImport, onAuditar }: TreeProps) {
  const [expanded, toggleGroup] = expandedState;

  const getCriteria = (e: ModuloActivo) => {
    const auto = detectAuto(e);
    const man  = manual?.[e.section]?.values ?? {};
    return Object.fromEntries(CRITERIA.map(c => [c.id, c.auto ? (auto[c.id as keyof typeof auto] ?? false) : (man[c.id] ?? false)]));
  };
  const getScore     = (e: ModuloActivo) => Object.values(getCriteria(e)).filter(Boolean).length;
  const getUpdatedAt = (e: ModuloActivo) => manual?.[e.section]?.updatedAt ?? null;

  const grouped = entries.reduce<Record<string, ModuloActivo[]>>((acc, e) => {
    const g = e.grupo ?? 'sin-grupo';
    if (!acc[g]) acc[g] = [];
    acc[g].push(e);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {Object.entries(grouped).map(([group, groupEntries]) => {
        const isOpen     = expanded.has(group);
        const groupColor = isRoadmap ? ROADMAP_COLOR : (GROUP_COLORS[group] ?? '#6B7280');
        const groupScore = isRoadmap ? 0 : groupEntries.reduce((s, e) => s + getScore(e), 0);
        const groupMax   = isRoadmap ? 0 : groupEntries.length * 8;
        const groupPct   = groupMax > 0 ? Math.round((groupScore / groupMax) * 100) : 0;

        const timestamps = isRoadmap ? [] : groupEntries.map(e => getUpdatedAt(e)).filter(Boolean) as string[];
        const newest = timestamps.length > 0 ? timestamps.reduce((a, b) => a > b ? a : b) : null;
        const oldest = timestamps.length > 1 ? timestamps.reduce((a, b) => a < b ? a : b) : null;

        return (
          <div key={group}>
            <div
              onClick={() => toggleGroup(group)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', backgroundColor: '#fff',
                borderRadius: isOpen ? '12px 12px 0 0' : '12px',
                border: '1px solid #E5E7EB', borderLeft: `4px solid ${groupColor}`,
                cursor: 'pointer', userSelect: 'none',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'}
            >
              {isOpen ? <ChevronDown size={15} color="#9CA3AF" /> : <ChevronRight size={15} color="#9CA3AF" />}
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#111', flex: 1 }}>{group}</span>

              {newest && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '10px' }}>
                  <span style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={9} /> {fmtRelative(newest)}
                  </span>
                  {oldest && oldest !== newest && (
                    <span style={{ fontSize: '10px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={9} /> {fmtRelative(oldest)}
                    </span>
                  )}
                </div>
              )}

              <span style={{ fontSize: '12px', color: '#9CA3AF', marginRight: '10px' }}>
                {groupEntries.length} módulos{!isRoadmap && ` · ${groupScore}/${groupMax}`}
              </span>

              <div style={{ width: '80px', height: '6px', backgroundColor: '#F3F4F6', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '99px', width: `${groupPct}%`, backgroundColor: groupColor, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: groupColor, minWidth: '36px', textAlign: 'right' }}>
                {isRoadmap ? '—' : `${groupPct}%`}
              </span>
            </div>

            {isOpen && (
              <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                {groupEntries.map((entry, idx) => {
                  const isLast = idx === groupEntries.length - 1;

                  if (isRoadmap) {
                    return (
                      <div key={entry.section} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '9px 16px 9px 36px', backgroundColor: '#F8FAFC',
                        borderBottom: isLast ? 'none' : '1px solid #EEF2F7',
                      }}>
                        <div onClick={() => onToggleImport?.(entry.section)}
                          title="Marcar como importado → pasa al Checklist"
                          style={{ cursor: 'pointer', color: ROADMAP_COLOR, flexShrink: 0 }}>
                          <Square size={14} />
                        </div>
                        <span style={{ fontSize: '13px', color: '#94A3B8', flex: 1 }}>{entry.nombre}</span>
                      </div>
                    );
                  }

                  const criteria  = getCriteria(entry);
                  const score     = Object.values(criteria).filter(Boolean).length;
                  const updatedAt = getUpdatedAt(entry);

                  return (
                    <div key={entry.section} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 16px 10px 36px', backgroundColor: '#fff',
                      borderBottom: isLast ? 'none' : '1px solid #F3F4F6',
                    }}>
                      <div style={{ minWidth: '180px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{entry.nombre}</span>
                        {updatedAt && (
                          <div style={{ fontSize: '10px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <Clock size={9} />{fmtRelative(updatedAt)}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                        {CRITERIA.map(c => {
                          const ok = criteria[c.id];
                          if (c.auto) return (
                            <div key={c.id} title={c.description} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: '#9CA3AF' }}>{c.id}</span>
                              {ok ? <CheckCircle2 size={16} color="#10B981" /> : <XCircle size={16} color="#E5E7EB" />}
                            </div>
                          );
                          return (
                            <div key={c.id} title={`${c.description} — clic`}
                              onClick={() => onToggleManual?.(entry.section, c.id)}
                              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: '#9CA3AF' }}>{c.id}</span>
                              {ok ? <ToggleRight size={16} color="#FF6835" /> : <ToggleLeft size={16} color="#D1D5DB" />}
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
                        <div style={{ flex: 1, height: '4px', backgroundColor: '#F3F4F6', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: '99px', transition: 'width 0.3s',
                            width: `${(score / 8) * 100}%`,
                            backgroundColor: score === 8 ? '#10B981' : score >= 5 ? '#3B82F6' : score >= 3 ? '#F59E0B' : '#E5E7EB',
                          }} />
                        </div>
                        <span style={{ fontSize: '10px', color: '#9CA3AF', minWidth: '20px' }}>{score}/8</span>
                          <button
                            onClick={() => onAuditar?.(entry)}
                            title="Auditar módulo"
                            style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}
                          >
                            Auditar
                          </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function ChecklistView(_props: Props) {
  const { modulos } = useModules();
  const [manual,            setManual]   = useState<Record<string, StoredModule>>(loadManual);
  const [imported,          setImported] = useState<Set<string>>(loadImported);
  const [expandedChecklist, setExpandedC] = useState<Set<string>>(new Set(['sistema', 'logistica']));
  const [expandedRoadmap,   setExpandedR] = useState<Set<string>>(new Set());
  const [moduloAuditado,    setModuloAuditado] = useState<ModuloActivo | null>(null);

  useEffect(() => { saveManual(manual);     }, [manual]);
  useEffect(() => { saveImported(imported); }, [imported]);

  const toggleC = (g: string) => setExpandedC(p => { const n = new Set(p); n.has(g) ? n.delete(g) : n.add(g); return n; });
  const toggleR = (g: string) => setExpandedR(p => { const n = new Set(p); n.has(g) ? n.delete(g) : n.add(g); return n; });

  const toggleManual = (section: string, cid: string) => {
    const now = new Date().toISOString();
    setManual(p => {
      const c = p[section] ?? { values: {}, updatedAt: now };
      return { ...p, [section]: { values: { ...c.values, [cid]: !(c.values[cid] ?? false) }, updatedAt: now } };
    });
  };

  const isInChecklist = (e: ModuloActivo) => imported.has(e.section) || e.isReal;
  const toggleImport  = (section: string) =>
    setImported(p => { const n = new Set(p); n.has(section) ? n.delete(section) : n.add(section); return n; });

  const checklistEntries = modulos.filter(e => isInChecklist(e));
  const roadmapEntries   = modulos.filter(e => !isInChecklist(e));

  const totalScore = checklistEntries.reduce((s, e) => {
    const auto = detectAuto(e);
    const man  = manual[e.section]?.values ?? {};
    return s + CRITERIA.filter(c => c.auto ? auto[c.id as keyof typeof auto] : man[c.id]).length;
  }, 0);
  const maxScore = checklistEntries.length * 8;
  const pct      = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  useModuleSubtitulo(`Checklist: ${checklistEntries.length} módulos · ${totalScore}/${maxScore} · ${pct}%  ·  Roadmap: ${roadmapEntries.length} pendientes`);

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8F9FA', padding: '32px' }}>

      {/* ── Barra global ── */}
      <div style={{ marginBottom: '24px', backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Progreso Checklist</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{pct}%</span>
        </div>
        <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '99px', transition: 'width 0.4s', width: `${pct}%`,
            background: pct === 100 ? '#10B981' : pct >= 60 ? '#3B82F6' : pct >= 30 ? '#F59E0B' : '#EF4444',
          }} />
        </div>
      </div>

      {/* ── Criterios — 4 col × 2 filas ── */}
      <div style={{
        marginBottom: '28px', backgroundColor: '#fff', borderRadius: '12px',
        padding: '16px 20px', border: '1px solid #E5E7EB',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 24px',
      }}>
        {CRITERIA.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '5px', flexShrink: 0, marginTop: '1px',
              backgroundColor: c.auto ? '#EFF6FF' : '#FFF7ED',
              color: c.auto ? '#1D4ED8' : '#92400E',
            }}>{c.id}</span>
            <span style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>{c.description}</span>
          </div>
        ))}
      </div>

      {/* ══ ÁRBOL 1 — CHECKLIST ══ */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '3px', height: '18px', borderRadius: '2px', backgroundColor: GROUP_COLORS['logistica'] }} />
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Checklist
          </h2>
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{checklistEntries.length} módulos</span>
        </div>
        <GroupTree
          entries={checklistEntries}
          expandedState={[expandedChecklist, toggleC]}
          isRoadmap={false}
          manual={manual}
          onToggleManual={toggleManual}
        />
      </div>

      {/* ══ ÁRBOL 2 — ROADMAP ══ */}
      {roadmapEntries.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '3px', height: '18px', borderRadius: '2px', backgroundColor: ROADMAP_COLOR }} />
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Roadmap
            </h2>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{roadmapEntries.length} pendientes de importar</span>
            <span style={{ fontSize: '11px', color: '#CBD5E1', marginLeft: 'auto' }}>☐ clic para importar al Checklist</span>
          </div>
          <GroupTree
            entries={roadmapEntries}
            expandedState={[expandedRoadmap, toggleR]}
            isRoadmap={true}
            onToggleImport={toggleImport}
          />
        </div>
      )}
        <DrawerAuditoria modulo={moduloAuditado} onClose={() => setModuloAuditado(null)} />

    </div>
  );
}
