/* =====================================================
   Proyectos y Tareas
   Proyectos (con Gantt simplificado) · Tablero Kanban
   ===================================================== */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  FolderOpen, Kanban, Plus, Calendar, Users, CheckCircle2,
  Clock, AlertCircle, MoreHorizontal, Flag, Target,
  TrendingUp, Paperclip, MessageSquare, ChevronRight,
  FolderKanban,
} from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }
type Tab = 'proyectos' | 'kanban';

/* ── Mock data ─────────────────────────────────────── */
const PROJECTS = [
  {
    id: 1, name: 'Lanzamiento Storefront v1',   status: 'activo',   priority: 'crítica', progress: 72,
    deadline: '28 Feb 2026', team: ['CV','AM','LP'], tags: ['Frontend','React'],
    tasks: { total: 34, done: 24 }, client: 'Interno',
    milestones: [
      { name: 'Diseño UI',       done: true,  date: '10 Feb' },
      { name: 'Desarrollo',      done: true,  date: '18 Feb' },
      { name: 'Testing',         done: false, date: '25 Feb' },
      { name: 'Deploy',          done: false, date: '28 Feb' },
    ],
  },
  {
    id: 2, name: 'Integración WhatsApp Business', status: 'activo', priority: 'crítica', progress: 30,
    deadline: '15 Mar 2026', team: ['LP','FA'], tags: ['API','Backend'],
    tasks: { total: 18, done: 5 }, client: 'Interno',
    milestones: [
      { name: 'Configuración Meta',  done: true,  date: '15 Feb' },
      { name: 'Webhook',            done: false, date: '25 Feb' },
      { name: 'Catálogo',           done: false, date: '08 Mar' },
      { name: 'Deploy',             done: false, date: '15 Mar' },
    ],
  },
  {
    id: 3, name: 'ERP Contabilidad Módulo', status: 'activo', priority: 'alta', progress: 15,
    deadline: '30 Abr 2026', team: ['GT','CV'], tags: ['ERP','Finanzas'],
    tasks: { total: 42, done: 6 }, client: 'Interno',
    milestones: [
      { name: 'Plan de Cuentas',    done: true,  date: '19 Feb' },
      { name: 'Asientos',           done: false, date: '15 Mar' },
      { name: 'AR/AP',              done: false, date: '01 Abr' },
      { name: 'Bancos',             done: false, date: '15 Abr' },
    ],
  },
  {
    id: 4, name: 'CRM — Pipeline de Ventas', status: 'completado', priority: 'alta', progress: 100,
    deadline: '19 Feb 2026', team: ['AM','CV'], tags: ['CRM','Ventas'],
    tasks: { total: 22, done: 22 }, client: 'Interno',
    milestones: [
      { name: 'Contactos',    done: true, date: '05 Feb' },
      { name: 'Pipeline',     done: true, date: '12 Feb' },
      { name: 'Actividades',  done: true, date: '19 Feb' },
    ],
  },
  {
    id: 5, name: 'App Móvil POS v2',        status: 'pausado',    priority: 'media', progress: 45,
    deadline: '30 May 2026', team: ['LP','FA','CV'], tags: ['Mobile','React Native'],
    tasks: { total: 60, done: 27 }, client: 'Interno',
    milestones: [
      { name: 'Diseño',    done: true,  date: '01 Feb' },
      { name: 'Auth',      done: true,  date: '10 Feb' },
      { name: 'POS Core',  done: false, date: '15 Apr' },
      { name: 'Payments',  done: false, date: '15 May' },
    ],
  },
];

const KANBAN_COLS: { id: string; label: string; color: string; tasks: { id: number; title: string; priority: 'crítica'|'alta'|'media'|'baja'; tags: string[]; assignee: string; comments: number; attachments: number; dueDate?: string }[] }[] = [
  {
    id: 'todo', label: 'Por Hacer', color: 'var(--m-text-muted)',
    tasks: [
      { id: 101, title: 'Implementar filtros de búsqueda en catálogo',  priority: 'alta',    tags: ['Frontend'], assignee: 'LP', comments: 3, attachments: 1, dueDate: '25 Feb' },
      { id: 102, title: 'Configurar webhook WhatsApp Business',         priority: 'crítica', tags: ['API'],      assignee: 'LP', comments: 5, attachments: 2, dueDate: '24 Feb' },
      { id: 103, title: 'Diseñar módulo de notas de crédito',           priority: 'media',   tags: ['ERP'],      assignee: 'GT', comments: 1, attachments: 0, dueDate: '01 Mar' },
      { id: 104, title: 'Documentar endpoints de la API REST',          priority: 'baja',    tags: ['Docs'],     assignee: 'FA', comments: 0, attachments: 1 },
    ],
  },
  {
    id: 'progress', label: 'En Progreso', color: 'var(--m-info)',
    tasks: [
      { id: 105, title: 'Checkout multi-paso — paso 3 (pago)',          priority: 'crítica', tags: ['Storefront'], assignee: 'CV', comments: 8, attachments: 3, dueDate: '22 Feb' },
      { id: 106, title: 'Integración Mercado Pago v2',                  priority: 'alta',    tags: ['Pagos'],  assignee: 'LP', comments: 4, attachments: 1, dueDate: '23 Feb' },
      { id: 107, title: 'Vista de Pipeline CRM',                        priority: 'alta',    tags: ['CRM'],    assignee: 'AM', comments: 2, attachments: 0, dueDate: '21 Feb' },
    ],
  },
  {
    id: 'review', label: 'En Revisión', color: 'var(--m-warning)',
    tasks: [
      { id: 108, title: 'Home Storefront — Hero + Grilla de productos', priority: 'alta',    tags: ['Storefront'], assignee: 'CV', comments: 6, attachments: 2, dueDate: '20 Feb' },
      { id: 109, title: 'Modal de artículos — autocomplete ML',         priority: 'crítica', tags: ['ERP'],    assignee: 'CV', comments: 12, attachments: 4 },
    ],
  },
  {
    id: 'done', label: 'Completado', color: 'var(--m-success)',
    tasks: [
      { id: 110, title: 'Migración RRSS — Vista Instagram/Facebook',    priority: 'media',   tags: ['Marketing'], assignee: 'SR', comments: 3, attachments: 1 },
      { id: 111, title: 'Módulo CRM — Contactos y Actividades',         priority: 'alta',    tags: ['CRM'],    assignee: 'AM', comments: 5, attachments: 2 },
      { id: 112, title: 'Checklist & Roadmap automático',               priority: 'baja',    tags: ['Sistema'], assignee: 'CV', comments: 2, attachments: 0 },
      { id: 113, title: 'Portal del Cliente — Storefront completo',     priority: 'crítica', tags: ['Storefront'], assignee: 'CV', comments: 18, attachments: 5 },
    ],
  },
];

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  activo:    { label: 'Activo',     color: 'var(--m-info)', bg: 'var(--m-info-border)' },
  completado:{ label: 'Completado', color: 'var(--m-success)', bg: 'var(--m-success-bg)' },
  pausado:   { label: 'Pausado',    color: 'var(--m-warning)', bg: 'var(--m-warning-bg)' },
};
const PRIORITY_COLOR: Record<string, string> = {
  crítica: 'var(--m-danger)', alta: 'var(--m-warning)', media: 'var(--m-info)', baja: 'var(--m-text-muted)',
};

const AVATAR_COLORS = ['#FF6835','#3B82F6','#10B981','#8B5CF6','#F59E0B','#EC4899'];

export function ProyectosView({ onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('proyectos');
  const TABS = [
    { id: 'proyectos' as Tab, icon: <FolderOpen size={14} />, label: 'Proyectos' },
    { id: 'kanban'    as Tab, icon: <Kanban size={14} />,     label: 'Tablero Kanban' },
  ];

  const totalTasks   = PROJECTS.reduce((s, p) => s + p.tasks.total, 0);
  const doneTasks    = PROJECTS.reduce((s, p) => s + p.tasks.done, 0);
  const activeProj   = PROJECTS.filter(p => p.status === 'activo').length;
  const avgProgress  = Math.round(PROJECTS.reduce((s, p) => s + p.progress, 0) / PROJECTS.length);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={FolderKanban}
        title="Proyectos y Tareas"
        subtitle="Gestión de proyectos, hitos y tablero Kanban del equipo"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('gestion') },
          { label: '+ Nuevo Proyecto', primary: true },
        ]}
      />

      {/* KPIs */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', padding: '14px 28px', display: 'flex', gap: '14px', flexShrink: 0 }}>
        {[
          { label: 'Proyectos Activos', value: activeProj,  color: 'var(--m-info)' },
          { label: 'Tareas Totales',    value: totalTasks,   color: 'var(--m-purple)' },
          { label: 'Completadas',       value: doneTasks,    color: 'var(--m-success)' },
          { label: 'Progreso Promedio', value: `${avgProgress}%`, color: 'var(--m-warning)' },
        ].map(k => (
          <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', backgroundColor: 'var(--m-surface-2)', borderRadius: '10px', flex: 1 }}>
            <div style={{ width: 8, height: 36, borderRadius: '4px', backgroundColor: k.color }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--m-text)' }}>{k.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--m-text-muted)' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', display: 'flex', padding: '0 28px', flexShrink: 0 }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '14px 22px', border: 'none', borderBottom: `3px solid ${active ? '#FF6835' : 'transparent'}`, backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: active ? 700 : 500, color: active ? '#FF6835' : 'var(--m-text-muted)' }}>
              {t.icon}{t.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        {tab === 'proyectos' && <TabProyectos />}
        {tab === 'kanban'    && <TabKanban />}
      </div>
    </div>
  );
}

/* ── Tab Proyectos ─────────────────────────────────── */
function TabProyectos() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggle = (id: number) => setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {PROJECTS.map(proj => {
          const st = STATUS_STYLE[proj.status];
          const isOpen = expanded.has(proj.id);
          return (
            <div key={proj.id} style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: `1px solid ${isOpen ? '#FF6835' : 'var(--m-border)'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
              {/* Header row */}
              <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => toggle(proj.id)}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#FF683510', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FolderOpen size={20} color="#FF6835" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--m-text)' }}>{proj.name}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: PRIORITY_COLOR[proj.priority] }}>● {proj.priority}</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--m-surface-2)', borderRadius: '3px', maxWidth: '300px' }}>
                      <div style={{ height: '100%', borderRadius: '3px', backgroundColor: proj.progress === 100 ? '#10B981' : 'var(--m-primary)', width: `${proj.progress}%`, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)' }}>{proj.progress}%</span>
                    <span style={{ fontSize: '12px', color: 'var(--m-text-muted)' }}>{proj.tasks.done}/{proj.tasks.total} tareas</span>
                  </div>
                </div>
                {/* Meta */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {proj.team.map((member, i) => (
                      <div key={member} style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-surface)', fontSize: '10px', fontWeight: 700, border: '2px solid #fff', marginLeft: i > 0 ? '-6px' : 0 }}>
                        {member}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--m-text-muted)' }}>
                    <Calendar size={12} />{proj.deadline}
                  </div>
                  <ChevronRight size={18} color="#9CA3AF" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </div>

              {/* Expanded: milestones + tags */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #F3F4F6', padding: '18px 22px', backgroundColor: 'var(--m-surface-2)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Milestones */}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--m-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hitos</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {proj.milestones.map((m, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {m.done
                              ? <CheckCircle2 size={16} color="#10B981" />
                              : <Clock size={16} color="#9CA3AF" />
                            }
                            <span style={{ fontSize: '13px', color: m.done ? '#374151' : 'var(--m-text-muted)', textDecoration: m.done ? 'none' : 'none' }}>{m.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--m-text-muted)', marginLeft: 'auto' }}>{m.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Tags + details */}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--m-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detalles</div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        {proj.tags.map(tag => (
                          <span key={tag} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--m-info-bg)', color: 'var(--m-info-text)' }}>{tag}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--m-text-secondary)', lineHeight: '1.7' }}>
                        <div><strong>Cliente:</strong> {proj.client}</div>
                        <div><strong>Vencimiento:</strong> {proj.deadline}</div>
                        <div><strong>Equipo:</strong> {proj.team.join(', ')}</div>
                      </div>
                    </div>
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

/* ── Tab Kanban ────────────────────────────────────── */
function TabKanban() {
  return (
    <div style={{ padding: '24px 28px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '16px', minWidth: 'max-content' }}>
        {KANBAN_COLS.map(col => (
          <div key={col.id} style={{ width: '270px', flexShrink: 0 }}>
            {/* Column header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: col.color }} />
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--m-text)' }}>{col.label}</span>
                <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--m-surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)' }}>
                  {col.tasks.length}
                </span>
              </div>
              <button style={{ width: 26, height: 26, borderRadius: '6px', border: '1.5px solid #E0E0E0', backgroundColor: 'var(--m-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={13} color="#6B7280" />
              </button>
            </div>

            {/* Column bar */}
            <div style={{ height: '3px', backgroundColor: col.color, borderRadius: '2px', marginBottom: '12px' }} />

            {/* Task cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {col.tasks.map(task => (
                <div key={task.id} style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '14px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                  {/* Priority + tag row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {task.tags.map(t => (
                        <span key={t} style={{ padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, backgroundColor: 'var(--m-surface-2)', color: 'var(--m-text-muted)' }}>{t}</span>
                      ))}
                    </div>
                    <Flag size={13} color={PRIORITY_COLOR[task.priority]} />
                  </div>
                  {/* Title */}
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--m-text)', lineHeight: '1.5', marginBottom: '12px' }}>{task.title}</div>
                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--m-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MessageSquare size={11} />{task.comments}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Paperclip size={11} />{task.attachments}
                      </span>
                      {task.dueDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} />{task.dueDate}
                        </span>
                      )}
                    </div>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: 'var(--m-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-surface)', fontSize: '10px', fontWeight: 700 }}>
                      {task.assignee}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}