/* =====================================================
   IdeasView — Lista de ideas con evaluación y score
   ===================================================== */
import React, { useState, useMemo } from 'react';
import {
  Lightbulb, Plus, X, ChevronDown, ChevronUp,
  ArrowUpCircle, Trash2, Clock, CheckCircle2, XCircle, PauseCircle,
} from 'lucide-react';
import type { MainSection } from '../../../AdminDashboard';
import { MODULE_MANIFEST } from '../../../utils/moduleManifest';

interface Props { onNavigate?: (s: MainSection) => void; }

// ─── Modelo ──────────────────────────────────────────────────────────────────

type Estado = 'nueva' | 'en_revision' | 'aprobada' | 'descartada' | 'promovida';
type Alcance = 'uno' | 'varios' | 'todos';
type Complejidad = 'baja' | 'media' | 'alta';

interface Evaluacion {
  resuelve_problema: boolean;
  alcance: Alcance;
  complejidad: Complejidad;
  depende_de: string; // section id o ''
}

interface Idea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: Estado;
  evaluacion: Evaluacion | null;
  score: number;
  modulo_generado: string;
  created_at: string;
  updated_at: string;
}

// ─── Score automático ─────────────────────────────────────────────────────────

function calcScore(ev: Evaluacion): number {
  let s = 0;
  if (ev.resuelve_problema)     s += 40;
  if (ev.alcance === 'todos')   s += 30;
  if (ev.alcance === 'varios')  s += 15;
  if (ev.alcance === 'uno')     s += 5;
  if (ev.complejidad === 'baja')   s += 20;
  if (ev.complejidad === 'media')  s += 10;
  if (ev.complejidad === 'alta')   s += 0;
  if (ev.depende_de)            s -= 10;
  return Math.max(0, Math.min(100, s));
}

function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'Promover',  color: '#10B981' };
  if (score >= 45) return { label: 'Revisar',   color: '#F59E0B' };
  return              { label: 'Descartar',  color: '#EF4444' };
}

// ─── Estado labels ────────────────────────────────────────────────────────────

const ESTADO_INFO: Record<Estado, { label: string; color: string; icon: React.ElementType }> = {
  nueva:       { label: 'Nueva',       color: '#3B82F6', icon: Lightbulb    },
  en_revision: { label: 'En revisión', color: '#F59E0B', icon: Clock        },
  aprobada:    { label: 'Aprobada',    color: '#10B981', icon: CheckCircle2 },
  descartada:  { label: 'Descartada',  color: '#9CA3AF', icon: XCircle      },
  promovida:   { label: 'Promovida',   color: '#FF6835', icon: ArrowUpCircle },
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const KEY = 'charlie_ideas_v1';

function load(): Idea[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
  catch { return []; }
}

function save(ideas: Idea[]) {
  localStorage.setItem(KEY, JSON.stringify(ideas));
}

function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ─── Componente ───────────────────────────────────────────────────────────────

const DEFAULT_EV: Evaluacion = {
  resuelve_problema: false,
  alcance: 'uno',
  complejidad: 'media',
  depende_de: '',
};

export function IdeasView(_props: Props) {
  const [ideas, setIdeas]           = useState<Idea[]>(load);
  const [filtro, setFiltro]         = useState<Estado | 'todas'>('todas');
  const [expanded, setExpanded]     = useState<Set<string>>(new Set());
  const [showForm, setShowForm]     = useState(false);

  // Form nueva idea
  const [titulo, setTitulo]         = useState('');
  const [descripcion, setDescripcion] = useState('');

  const persist = (next: Idea[]) => { setIdeas(next); save(next); };

  const agregarIdea = () => {
    if (!titulo.trim()) return;
    const now = new Date().toISOString();
    const idea: Idea = {
      id: newId(), titulo: titulo.trim(), descripcion: descripcion.trim(),
      estado: 'nueva', evaluacion: null, score: 0,
      modulo_generado: '', created_at: now, updated_at: now,
    };
    persist([idea, ...ideas]);
    setTitulo(''); setDescripcion(''); setShowForm(false);
    setExpanded(prev => new Set([...prev, idea.id]));
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateEvaluacion = (id: string, ev: Evaluacion) => {
    persist(ideas.map(i => i.id === id
      ? { ...i, evaluacion: ev, score: calcScore(ev), updated_at: new Date().toISOString() }
      : i
    ));
  };

  const cambiarEstado = (id: string, estado: Estado) => {
    persist(ideas.map(i => i.id === id
      ? { ...i, estado, updated_at: new Date().toISOString() }
      : i
    ));
  };

  const eliminar = (id: string) => persist(ideas.filter(i => i.id !== id));

  const filtered = useMemo(() =>
    filtro === 'todas' ? ideas : ideas.filter(i => i.estado === filtro),
    [ideas, filtro]
  );

  const conteo = useMemo(() =>
    Object.fromEntries(
      (['todas', ...Object.keys(ESTADO_INFO)] as (Estado | 'todas')[])
        .map(e => [e, e === 'todas' ? ideas.length : ideas.filter(i => i.estado === e).length])
    ), [ideas]
  );

  const modulos = MODULE_MANIFEST.filter(e => e.isReal);

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8F9FA', padding: '32px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111', margin: '0 0 6px' }}>Ideas</h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            {ideas.length} ideas · {conteo['promovida'] ?? 0} promovidas · {conteo['aprobada'] ?? 0} aprobadas
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', borderRadius: '10px', border: 'none',
            backgroundColor: '#FF6835', color: '#fff',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Plus size={15} /> Nueva idea
        </button>
      </div>

      {/* ── Form nueva idea ── */}
      {showForm && (
        <div style={{
          backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB',
          padding: '20px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>Nueva idea</span>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} color="#9CA3AF" />
            </button>
          </div>
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Título de la idea..."
            autoFocus
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: '1.5px solid #E5E7EB', fontSize: '14px', fontWeight: 600,
              marginBottom: '10px', boxSizing: 'border-box', outline: 'none',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#FF6835'}
            onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
          />
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Descripción libre — qué problema resuelve, contexto, referencias..."
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: '1.5px solid #E5E7EB', fontSize: '13px', resize: 'vertical',
              marginBottom: '14px', boxSizing: 'border-box', outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#FF6835'}
            onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB',
              backgroundColor: '#fff', fontSize: '13px', cursor: 'pointer', color: '#6B7280',
            }}>Cancelar</button>
            <button onClick={agregarIdea} style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              backgroundColor: '#FF6835', color: '#fff', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer',
            }}>Guardar idea</button>
          </div>
        </div>
      )}

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['todas', ...Object.keys(ESTADO_INFO)] as (Estado | 'todas')[]).map(e => {
          const isActive = filtro === e;
          const color = e === 'todas' ? '#374151' : ESTADO_INFO[e as Estado].color;
          return (
            <button
              key={e}
              onClick={() => setFiltro(e)}
              style={{
                padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                border: isActive ? `2px solid ${color}` : '1.5px solid #E5E7EB',
                backgroundColor: isActive ? `${color}14` : '#fff',
                color: isActive ? color : '#6B7280',
                cursor: 'pointer',
              }}
            >
              {e === 'todas' ? 'Todas' : ESTADO_INFO[e as Estado].label} ({conteo[e] ?? 0})
            </button>
          );
        })}
      </div>

      {/* ── Lista ── */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
          <Lightbulb size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '14px' }}>
            {filtro === 'todas' ? 'Todavía no hay ideas. ¡Agregá la primera!' : 'No hay ideas en este estado.'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(idea => {
          const isOpen   = expanded.has(idea.id);
          const info     = ESTADO_INFO[idea.estado];
          const Icon     = info.icon;
          const ev       = idea.evaluacion;
          const sg       = ev ? scoreLabel(idea.score) : null;

          return (
            <div key={idea.id} style={{
              backgroundColor: '#fff', borderRadius: '12px',
              border: '1px solid #E5E7EB', overflow: 'hidden',
            }}>
              {/* ── Fila principal ── */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', cursor: 'pointer',
                }}
                onClick={() => toggleExpand(idea.id)}
              >
                <Icon size={16} color={info.color} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>{idea.titulo}</span>
                  {idea.descripcion && (
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {idea.descripcion}
                    </p>
                  )}
                </div>

                {/* Score badge */}
                {ev && sg && (
                  <div style={{
                    padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                    backgroundColor: `${sg.color}15`, color: sg.color, flexShrink: 0,
                  }}>
                    {idea.score}% — {sg.label}
                  </div>
                )}

                {/* Estado badge */}
                <span style={{
                  padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                  backgroundColor: `${info.color}15`, color: info.color, flexShrink: 0,
                }}>
                  {info.label}
                </span>

                <span style={{ fontSize: '11px', color: '#D1D5DB', flexShrink: 0 }}>
                  {new Date(idea.created_at).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' })}
                </span>

                {isOpen ? <ChevronUp size={15} color="#9CA3AF" /> : <ChevronDown size={15} color="#9CA3AF" />}
              </div>

              {/* ── Panel expandido ── */}
              {isOpen && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' }}>

                  {/* Descripción completa */}
                  {idea.descripcion && (
                    <p style={{ fontSize: '13px', color: '#374151', margin: '14px 0', lineHeight: '1.6' }}>
                      {idea.descripcion}
                    </p>
                  )}

                  {/* ── Evaluación ── */}
                  <div style={{
                    backgroundColor: '#F9FAFB', borderRadius: '10px',
                    padding: '16px', marginBottom: '14px',
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>
                      Evaluación
                    </p>

                    {/* Pregunta 1 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#374151' }}>¿Resuelve un problema real?</span>
                      <button
                        onClick={() => {
                          const base = ev ?? { ...DEFAULT_EV };
                          updateEvaluacion(idea.id, { ...base, resuelve_problema: !base.resuelve_problema });
                        }}
                        style={{
                          padding: '5px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '12px', fontWeight: 700,
                          backgroundColor: ev?.resuelve_problema ? '#D1FAE5' : '#F3F4F6',
                          color: ev?.resuelve_problema ? '#059669' : '#9CA3AF',
                        }}
                      >
                        {ev?.resuelve_problema ? 'Sí' : 'No'}
                      </button>
                    </div>

                    {/* Pregunta 2 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#374151' }}>¿Cuántos clientes lo necesitan?</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['uno', 'varios', 'todos'] as Alcance[]).map(a => (
                          <button key={a} onClick={() => {
                            const base = ev ?? { ...DEFAULT_EV };
                            updateEvaluacion(idea.id, { ...base, alcance: a });
                          }} style={{
                            padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 600,
                            backgroundColor: ev?.alcance === a ? '#DBEAFE' : '#F3F4F6',
                            color: ev?.alcance === a ? '#1D4ED8' : '#9CA3AF',
                          }}>
                            {a === 'uno' ? 'Uno' : a === 'varios' ? 'Varios' : 'Todos'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pregunta 3 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#374151' }}>Complejidad estimada</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['baja', 'media', 'alta'] as Complejidad[]).map(c => {
                          const col = c === 'baja' ? '#10B981' : c === 'media' ? '#F59E0B' : '#EF4444';
                          return (
                            <button key={c} onClick={() => {
                              const base = ev ?? { ...DEFAULT_EV };
                              updateEvaluacion(idea.id, { ...base, complejidad: c });
                            }} style={{
                              padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              fontSize: '12px', fontWeight: 600,
                              backgroundColor: ev?.complejidad === c ? `${col}20` : '#F3F4F6',
                              color: ev?.complejidad === c ? col : '#9CA3AF',
                            }}>
                              {c.charAt(0).toUpperCase() + c.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pregunta 4 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#374151' }}>¿Depende de otro módulo?</span>
                      <select
                        value={ev?.depende_de ?? ''}
                        onChange={e => {
                          const base = ev ?? { ...DEFAULT_EV };
                          updateEvaluacion(idea.id, { ...base, depende_de: e.target.value });
                        }}
                        style={{
                          padding: '5px 10px', borderRadius: '8px', border: '1px solid #E5E7EB',
                          fontSize: '12px', color: '#374151', backgroundColor: '#fff', cursor: 'pointer',
                        }}
                      >
                        <option value="">Ninguno</option>
                        {modulos.map(m => (
                          <option key={m.section} value={m.section}>{m.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Score */}
                    {ev && (
                      <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Score de viabilidad</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: sg?.color }}>{idea.score}% — {sg?.label}</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: '99px', transition: 'width 0.3s ease',
                            width: `${idea.score}%`, backgroundColor: sg?.color,
                          }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Acciones de estado ── */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(Object.keys(ESTADO_INFO) as Estado[])
                      .filter(e => e !== idea.estado)
                      .map(e => {
                        const inf = ESTADO_INFO[e];
                        const Ic  = inf.icon;
                        return (
                          <button key={e} onClick={() => cambiarEstado(idea.id, e)} style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 12px', borderRadius: '8px',
                            border: `1px solid ${inf.color}40`,
                            backgroundColor: `${inf.color}08`, color: inf.color,
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          }}>
                            <Ic size={12} /> {inf.label}
                          </button>
                        );
                      })}
                    <button onClick={() => eliminar(idea.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto',
                      padding: '6px 12px', borderRadius: '8px',
                      border: '1px solid #FCA5A540', backgroundColor: '#FEF2F2',
                      color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    }}>
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
