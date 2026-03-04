/* =====================================================
   ChecklistView — Árbol de módulos C1-C8
   ===================================================== */
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, XCircle, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import type { MainSection } from '../../../AdminDashboard';
import { MODULE_MANIFEST, MANIFEST_BY_GROUP, type ManifestEntry, type ModuleGroup } from '../../../utils/moduleManifest';

interface Props { onNavigate?: (s: MainSection) => void; }

// ─── Criterios ────────────────────────────────────────────────────────────────

interface Criterion {
  id: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8';
  label: string;
  description: string;
  auto: boolean; // true = se detecta del manifest, false = toggle manual
}

const CRITERIA: Criterion[] = [
  { id: 'C1', label: 'UI',      description: 'Tiene componente React (view)',          auto: true  },
  { id: 'C2', label: 'Backend', description: 'Tiene tabla Supabase conectada',         auto: true  },
  { id: 'C3', label: 'Service', description: 'Tiene {nombre}Api.ts en /services/',     auto: true  },
  { id: 'C4', label: 'Config',  description: 'Tiene module.config.ts',                 auto: false },
  { id: 'C5', label: 'Tokens',  description: 'Sin colores hardcodeados (CSS tokens)',  auto: false },
  { id: 'C6', label: 'CSS',     description: 'Tiene tokens.css con fallbacks',         auto: false },
  { id: 'C7', label: 'Party',   description: 'Usa Party Model (organizaciones+roles)', auto: false },
  { id: 'C8', label: 'Data0',   description: 'Usa Data Zero (useTable, no .from)',     auto: false },
];

// ─── Detección automática desde el manifest ───────────────────────────────────

function detectAuto(entry: ManifestEntry): Record<string, boolean> {
  // C3: existe serviceFile en el manifest
  const hasService = !!entry.serviceFile;

  return {
    C1: entry.isReal,
    C2: !!entry.hasSupabase,
    C3: hasService,
  };
}

// ─── Storage key para toggles manuales ───────────────────────────────────────

const STORAGE_KEY = 'charlie_checklist_manual_v1';

function loadManual(): Record<string, Record<string, boolean>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveManual(data: Record<string, Record<string, boolean>>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Colores de grupo ─────────────────────────────────────────────────────────

const GROUP_COLORS: Record<ModuleGroup, string> = {
  'Logística': '#059669',
  'Sistema':   '#475569',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function ChecklistView(_props: Props) {
  const [expanded, setExpanded]   = useState<Set<string>>(new Set(Object.keys(MANIFEST_BY_GROUP)));
  const [manual, setManual]       = useState<Record<string, Record<string, boolean>>>(loadManual);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => { saveManual(manual); }, [manual]);

  const toggleGroup = (group: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  const toggleManual = (section: string, cid: string) => {
    setManual(prev => ({
      ...prev,
      [section]: { ...(prev[section] ?? {}), [cid]: !(prev[section]?.[cid] ?? false) },
    }));
  };

  const getCriteria = (entry: ManifestEntry): Record<string, boolean> => {
    const auto = detectAuto(entry);
    const man  = manual[entry.section] ?? {};
    const result: Record<string, boolean> = {};
    CRITERIA.forEach(c => {
      result[c.id] = c.auto ? (auto[c.id] ?? false) : (man[c.id] ?? false);
    });
    return result;
  };

  const getScore = (entry: ManifestEntry) => {
    const vals = Object.values(getCriteria(entry));
    return vals.filter(Boolean).length;
  };

  // Totales globales
  const allEntries = MODULE_MANIFEST;
  const totalScore = allEntries.reduce((s, e) => s + getScore(e), 0);
  const maxScore   = allEntries.length * 8;
  const pct        = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const groups = Object.entries(MANIFEST_BY_GROUP) as [ModuleGroup, ManifestEntry[]][];

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8F9FA', padding: '32px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111', margin: '0 0 6px' }}>
            Checklist & Roadmap
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            {allEntries.length} módulos · {totalScore}/{maxScore} criterios · {pct}% completado
          </p>
        </div>
        <button
          onClick={() => setLastUpdate(new Date())}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB',
            backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px', color: '#6B7280',
          }}
        >
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* ── Barra global ── */}
      <div style={{ marginBottom: '28px', backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Progreso global</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{pct}%</span>
        </div>
        <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '99px', transition: 'width 0.4s ease',
            width: `${pct}%`,
            background: pct === 100 ? '#10B981' : pct >= 60 ? '#3B82F6' : pct >= 30 ? '#F59E0B' : '#EF4444',
          }} />
        </div>
      </div>

      {/* ── Leyenda C1-C8 ── */}
      <div style={{
        marginBottom: '20px', backgroundColor: '#fff', borderRadius: '12px',
        padding: '14px 20px', border: '1px solid #E5E7EB',
        display: 'flex', flexWrap: 'wrap', gap: '12px',
      }}>
        {CRITERIA.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
              backgroundColor: c.auto ? '#EFF6FF' : '#FFF7ED',
              color: c.auto ? '#1D4ED8' : '#92400E',
            }}>{c.id}</span>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>{c.description}</span>
            {!c.auto && <span style={{ fontSize: '10px', color: '#9CA3AF' }}>(manual)</span>}
          </div>
        ))}
      </div>

      {/* ── Árbol de grupos ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {groups.map(([group, entries]) => {
          const isOpen    = expanded.has(group);
          const color     = GROUP_COLORS[group] ?? '#6B7280';
          const groupScore = entries.reduce((s, e) => s + getScore(e), 0);
          const groupMax   = entries.length * 8;
          const groupPct   = groupMax > 0 ? Math.round((groupScore / groupMax) * 100) : 0;

          return (
            <div key={group}>
              {/* ── Grupo row ── */}
              <div
                onClick={() => toggleGroup(group)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', backgroundColor: '#fff',
                  borderRadius: isOpen ? '12px 12px 0 0' : '12px',
                  border: '1px solid #E5E7EB',
                  borderLeft: `4px solid ${color}`,
                  cursor: 'pointer', userSelect: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'}
              >
                {isOpen
                  ? <ChevronDown size={15} color="#9CA3AF" />
                  : <ChevronRight size={15} color="#9CA3AF" />
                }
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#111', flex: 1 }}>{group}</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {entries.length} módulos · {groupScore}/{groupMax}
                </span>
                {/* mini barra */}
                <div style={{ width: '80px', height: '6px', backgroundColor: '#F3F4F6', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    width: `${groupPct}%`,
                    backgroundColor: color,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color, minWidth: '32px', textAlign: 'right' }}>{groupPct}%</span>
              </div>

              {/* ── Módulos del grupo ── */}
              {isOpen && (
                <div style={{
                  border: '1px solid #E5E7EB', borderTop: 'none',
                  borderRadius: '0 0 12px 12px', overflow: 'hidden',
                }}>
                  {entries.map((entry, idx) => {
                    const criteria = getCriteria(entry);
                    const score    = Object.values(criteria).filter(Boolean).length;
                    const isLast   = idx === entries.length - 1;

                    return (
                      <div
                        key={entry.section}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '11px 16px 11px 36px',
                          backgroundColor: '#fff',
                          borderBottom: isLast ? 'none' : '1px solid #F3F4F6',
                        }}
                      >
                        {/* Nombre */}
                        <div style={{ minWidth: '160px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                            {entry.label}
                          </span>
                          <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '6px' }}>
                            {score}/8
                          </span>
                        </div>

                        {/* C1-C8 */}
                        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                          {CRITERIA.map(c => {
                            const ok = criteria[c.id];
                            if (c.auto) {
                              return (
                                <div key={c.id} title={c.description} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#9CA3AF' }}>{c.id}</span>
                                  {ok
                                    ? <CheckCircle2 size={16} color="#10B981" />
                                    : <XCircle      size={16} color="#E5E7EB" />
                                  }
                                </div>
                              );
                            }
                            // toggle manual
                            return (
                              <div
                                key={c.id}
                                title={`${c.description} — clic para cambiar`}
                                onClick={() => toggleManual(entry.section, c.id)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                              >
                                <span style={{ fontSize: '9px', fontWeight: 700, color: '#9CA3AF' }}>{c.id}</span>
                                {ok
                                  ? <ToggleRight size={16} color="#FF6835" />
                                  : <ToggleLeft  size={16} color="#D1D5DB" />
                                }
                              </div>
                            );
                          })}
                        </div>

                        {/* Mini barra del módulo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
                          <div style={{ flex: 1, height: '4px', backgroundColor: '#F3F4F6', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '99px',
                              width: `${(score / 8) * 100}%`,
                              backgroundColor: score === 8 ? '#10B981' : score >= 5 ? '#3B82F6' : score >= 3 ? '#F59E0B' : '#E5E7EB',
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: '10px', color: '#9CA3AF', minWidth: '20px' }}>{score}/8</span>
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

      <p style={{ fontSize: '11px', color: '#D1D5DB', marginTop: '24px', textAlign: 'center' }}>
        Última actualización: {lastUpdate.toLocaleTimeString()} · C1-C3 automáticos del manifest · C4-C8 toggles manuales
      </p>
    </div>
  );
}
