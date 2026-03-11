/* =====================================================
   CRM — Contactos · Pipeline · Actividades
   ===================================================== */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Search, Plus, Filter, Phone, Mail, Building2, Tag,
  Calendar, CheckSquare, Clock, Star, MoreHorizontal,
  TrendingUp, Users, DollarSign, Target, ChevronLeft,
  AlertCircle, CheckCircle2, Circle, User, Edit2,
} from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }

type Tab = 'contactos' | 'pipeline' | 'actividades';

/* ── Mock Data ─────────────────────────────────────── */
const CONTACTS = [
  { id: 1, name: 'Valentina García',    company: 'TechSur SA',        email: 'vgarcia@techsur.com',     phone: '+598 99 123 456', tag: 'Cliente',    status: 'Activo',   value: 45000, lastContact: 'Hoy' },
  { id: 2, name: 'Martín Rodríguez',    company: 'Distribuidora RM',  email: 'martin@distrib-rm.com',   phone: '+598 98 234 567', tag: 'Lead',       status: 'Nuevo',    value: 12000, lastContact: 'Ayer' },
  { id: 3, name: 'Camila Torres',       company: 'Supermercado Norte', email: 'ctorres@supnorte.uy',    phone: '+598 99 345 678', tag: 'Prospecto',  status: 'Activo',   value: 78000, lastContact: 'Hace 2 días' },
  { id: 4, name: 'Sebastián López',     company: 'Importadora SL',    email: 'slopez@importsl.com',     phone: '+598 98 456 789', tag: 'Cliente',    status: 'VIP',      value: 230000, lastContact: 'Hoy' },
  { id: 5, name: 'Luciana Fernández',   company: 'Moda Latina',       email: 'lfernan@modalatina.uy',   phone: '+598 99 567 890', tag: 'Lead',       status: 'Inactivo', value: 8500,  lastContact: 'Hace 7 días' },
  { id: 6, name: 'Diego Martínez',      company: 'Agro del Este',     email: 'dmartinez@agroeste.com',  phone: '+598 98 678 901', tag: 'Prospecto',  status: 'Activo',   value: 55000, lastContact: 'Ayer' },
  { id: 7, name: 'Florencia Álvarez',   company: 'Boutique FA',       email: 'falvarez@boutiquefa.com', phone: '+598 99 789 012', tag: 'Cliente',    status: 'Activo',   value: 19000, lastContact: 'Hoy' },
  { id: 8, name: 'Nicolás Pérez',       company: 'Constructora NP',   email: 'nperez@construcnp.uy',    phone: '+598 98 890 123', tag: 'Lead',       status: 'Nuevo',    value: 95000, lastContact: 'Hace 3 días' },
];

const PIPELINE: { id: string; label: string; color: string; amount: number; deals: { id: number; name: string; company: string; value: number; probability: number; dueDate: string; owner: string }[] }[] = [
  {
    id: 'nuevo', label: 'Nuevo Lead', color: 'var(--m-text-muted)', amount: 53500,
    deals: [
      { id: 1, name: 'Propuesta Distribución', company: 'Distribuidora RM', value: 12000, probability: 20, dueDate: '28 Feb', owner: 'CV' },
      { id: 2, name: 'Consulta Inicial', company: 'Boutique Estrella', value: 8500, probability: 15, dueDate: '01 Mar', owner: 'AM' },
      { id: 3, name: 'Referido Interno', company: 'Moda Latina', value: 33000, probability: 25, dueDate: '05 Mar', owner: 'CV' },
    ],
  },
  {
    id: 'contactado', label: 'Contactado', color: 'var(--m-info)', amount: 128000,
    deals: [
      { id: 4, name: 'Demo Plataforma', company: 'TechSur SA', value: 45000, probability: 40, dueDate: '22 Feb', owner: 'CV' },
      { id: 5, name: 'Reunión de Ventas', company: 'Agro del Este', value: 55000, probability: 35, dueDate: '25 Feb', owner: 'LP' },
      { id: 6, name: 'Evaluación Sistema', company: 'Importadora FS', value: 28000, probability: 30, dueDate: '27 Feb', owner: 'AM' },
    ],
  },
  {
    id: 'propuesta', label: 'Propuesta', color: 'var(--m-warning)', amount: 347000,
    deals: [
      { id: 7, name: 'Contrato Anual ERP', company: 'Supermercado Norte', value: 78000, probability: 60, dueDate: '20 Feb', owner: 'CV' },
      { id: 8, name: 'Licencia Multi-sede', company: 'Constructora NP', value: 95000, probability: 55, dueDate: '24 Feb', owner: 'LP' },
      { id: 9, name: 'Integración Total', company: 'LogiUy', value: 174000, probability: 65, dueDate: '28 Feb', owner: 'CV' },
    ],
  },
  {
    id: 'negociacion', label: 'Negociación', color: 'var(--m-purple)', amount: 312000,
    deals: [
      { id: 10, name: 'Revisión Precios', company: 'Importadora SL', value: 230000, probability: 75, dueDate: '21 Feb', owner: 'CV' },
      { id: 11, name: 'Ajuste de Plan', company: 'RetailSur', value: 82000, probability: 70, dueDate: '23 Feb', owner: 'AM' },
    ],
  },
  {
    id: 'ganado', label: 'Cerrado Ganado', color: 'var(--m-success)', amount: 189000,
    deals: [
      { id: 12, name: 'Plan Empresarial', company: 'Techpark UY', value: 120000, probability: 100, dueDate: '15 Feb', owner: 'CV' },
      { id: 13, name: 'Renovación Anual', company: 'FarmaPlus', value: 69000, probability: 100, dueDate: '10 Feb', owner: 'LP' },
    ],
  },
];

const ACTIVITIES = [
  { id: 1, type: 'call',    title: 'Llamada con Valentina García',  company: 'TechSur SA',        time: '10:00', date: 'Hoy',         priority: 'alta',  done: false, owner: 'CV' },
  { id: 2, type: 'meeting', title: 'Demo plataforma Supermercado Norte', company: 'Supermercado Norte', time: '14:30', date: 'Hoy',  priority: 'crítica', done: false, owner: 'CV' },
  { id: 3, type: 'task',    title: 'Enviar propuesta Importadora SL', company: 'Importadora SL', time: '17:00', date: 'Hoy',           priority: 'alta',  done: true,  owner: 'CV' },
  { id: 4, type: 'call',    title: 'Follow-up Diego Martínez',      company: 'Agro del Este',     time: '09:00', date: 'Mañana',       priority: 'media', done: false, owner: 'LP' },
  { id: 5, type: 'meeting', title: 'Negociación final Constructora NP', company: 'Constructora NP', time: '11:00', date: 'Mañana',   priority: 'crítica', done: false, owner: 'CV' },
  { id: 6, type: 'task',    title: 'Actualizar propuesta LogiUy',   company: 'LogiUy',            time: '15:00', date: 'Mañana',       priority: 'alta',  done: false, owner: 'AM' },
  { id: 7, type: 'email',   title: 'Enviar contrato Techpark UY',   company: 'Techpark UY',       time: '10:30', date: '21 Feb',       priority: 'media', done: true,  owner: 'CV' },
  { id: 8, type: 'call',    title: 'Onboarding FarmaPlus',          company: 'FarmaPlus',         time: '16:00', date: '21 Feb',       priority: 'baja',  done: false, owner: 'LP' },
];

/* ── Tag colors ────────────────────────────────────── */
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Cliente:   { bg: 'var(--m-success-bg)', text: 'var(--m-success-text)' },
  Lead:      { bg: 'var(--m-info-border)', text: 'var(--m-info-text)' },
  Prospecto: { bg: 'var(--m-warning-bg)', text: 'var(--m-warning-text)' },
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Activo:   { bg: 'var(--m-success-bg)', text: 'var(--m-success-text)' },
  Nuevo:    { bg: 'var(--m-info-border)', text: 'var(--m-info-text)' },
  VIP:      { bg: 'var(--m-purple-bg)', text: 'var(--m-purple)' },
  Inactivo: { bg: 'var(--m-surface-2)', text: 'var(--m-text-muted)' },
};
const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  crítica: { bg: 'var(--m-danger-bg)', text: 'var(--m-danger)' },
  alta:    { bg: 'var(--m-warning-bg)', text: 'var(--m-warning-text)' },
  media:   { bg: 'var(--m-info-border)', text: 'var(--m-info-text)' },
  baja:    { bg: 'var(--m-surface-2)', text: 'var(--m-text-muted)' },
};
const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  call:    <Phone size={14} />,
  meeting: <Calendar size={14} />,
  task:    <CheckSquare size={14} />,
  email:   <Mail size={14} />,
};

/* ── Helpers ───────────────────────────────────────── */
const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

export function ERPCRMView({ onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('contactos');
  const [search, setSearch] = useState('');

  const TABS = [
    { id: 'contactos' as Tab,  icon: <Users size={15} />,      label: 'Contactos' },
    { id: 'pipeline'  as Tab,  icon: <TrendingUp size={15} />, label: 'Pipeline' },
    { id: 'actividades' as Tab, icon: <Calendar size={15} />, label: 'Actividades' },
  ];

  /* KPI summary */
  const totalValue   = CONTACTS.reduce((s, c) => s + c.value, 0);
  const totalClients = CONTACTS.filter(c => c.tag === 'Cliente').length;
  const totalLeads   = CONTACTS.filter(c => c.tag === 'Lead').length;
  const pipelineTotal = PIPELINE.reduce((s, col) => s + col.amount, 0);

  const kpis = [
    { label: 'Total Contactos', value: CONTACTS.length, icon: <Users size={18} />, color: 'var(--m-info)' },
    { label: 'Clientes Activos', value: totalClients, icon: <Star size={18} />, color: 'var(--m-success)' },
    { label: 'Leads Activos', value: totalLeads, icon: <Target size={18} />, color: 'var(--m-warning)' },
    { label: 'Pipeline Total', value: fmt(pipelineTotal), icon: <DollarSign size={18} />, color: 'var(--m-purple)' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Users}
        title="CRM — Gestión de Clientes"
        subtitle="Contactos, pipeline de ventas y actividades del equipo"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('gestion') },
          { label: '+ Nuevo Contacto', primary: true },
        ]}
      />

      {/* KPIs */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', padding: '16px 28px', display: 'flex', gap: '16px', flexShrink: 0 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', backgroundColor: 'var(--m-surface-2)', borderRadius: '10px', flex: 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--m-text)', lineHeight: 1.1 }}>{k.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--m-text-muted)', marginTop: '1px' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', display: 'flex', padding: '0 28px', gap: '4px', flexShrink: 0 }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '14px 20px', border: 'none', borderBottom: `3px solid ${active ? '#FF6835' : 'transparent'}`, backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: active ? 700 : 500, color: active ? '#FF6835' : 'var(--m-text-muted)', transition: 'all 0.15s' }}>
              {t.icon}{t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        {tab === 'contactos'   && <TabContactos search={search} setSearch={setSearch} />}
        {tab === 'pipeline'    && <TabPipeline />}
        {tab === 'actividades' && <TabActividades />}
      </div>
    </div>
  );
}

/* ── Tab Contactos ─────────────────────────────────── */
function TabContactos({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  const [tagFilter, setTagFilter] = useState('Todos');
  const tags = ['Todos', 'Cliente', 'Lead', 'Prospecto'];

  const filtered = CONTACTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    const matchTag = tagFilter === 'Todos' || c.tag === tagFilter;
    return matchSearch && matchTag;
  });

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative', maxWidth: '340px' }}>
          <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contactos..." 
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #E0E0E0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--m-surface)', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {tags.map(t => (
            <button key={t} onClick={() => setTagFilter(t)}
              style={{ padding: '8px 14px', border: `1.5px solid ${tagFilter === t ? '#FF6835' : 'var(--m-border)'}`, borderRadius: '8px', backgroundColor: tagFilter === t ? '#FF683510' : 'var(--m-surface)', color: tagFilter === t ? '#FF6835' : 'var(--m-text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: tagFilter === t ? 700 : 500 }}>
              {t}
            </button>
          ))}
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', backgroundColor: 'var(--m-surface)', cursor: 'pointer', fontSize: '13px', color: 'var(--m-text-muted)' }}>
          <Filter size={14} /> Filtros
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--m-surface-2)', borderBottom: '1.5px solid #E5E7EB' }}>
              {['Contacto', 'Empresa', 'Email / Teléfono', 'Tag', 'Estado', 'Valor Est.', 'Último Contacto', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'var(--m-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-surface)', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                      {c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--m-text)' }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--m-text-secondary)' }}>
                    <Building2 size={13} color="#9CA3AF" />{c.company}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--m-text-muted)', lineHeight: '1.7' }}>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}><Mail size={11} />{c.email}</div>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}><Phone size={11} />{c.phone}</div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, ...TAG_COLORS[c.tag] }}>{c.tag}</span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, ...STATUS_COLORS[c.status] }}>{c.status}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: 'var(--m-text)' }}>{fmt(c.value)}</td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--m-text-muted)' }}>{c.lastContact}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{ width: 28, height: 28, borderRadius: '6px', border: '1px solid #E0E0E0', backgroundColor: 'var(--m-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={13} color="#3B82F6" /></button>
                    <button style={{ width: 28, height: 28, borderRadius: '6px', border: '1px solid #E0E0E0', backgroundColor: 'var(--m-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={13} color="#10B981" /></button>
                    <button style={{ width: 28, height: 28, borderRadius: '6px', border: '1px solid #E0E0E0', backgroundColor: 'var(--m-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={13} color="#6B7280" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Tab Pipeline ──────────────────────────────────── */
function TabPipeline() {
  return (
    <div style={{ padding: '24px 28px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '16px', minWidth: 'max-content' }}>
        {PIPELINE.map(col => (
          <div key={col.id} style={{ width: '240px', flexShrink: 0 }}>
            {/* Column header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: col.color }} />
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--m-text)' }}>{col.label}</span>
                <span style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--m-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--m-text-muted)' }}>{col.deals.length}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--m-text-muted)' }}>{fmt(col.amount)}</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: '3px', backgroundColor: 'var(--m-surface-2)', borderRadius: '2px', marginBottom: '12px' }}>
              <div style={{ height: '100%', borderRadius: '2px', backgroundColor: col.color, width: `${Math.min((col.amount / 400000) * 100, 100)}%` }} />
            </div>
            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {col.deals.map(deal => (
                <div key={deal.id} style={{ backgroundColor: 'var(--m-surface)', borderRadius: '10px', border: '1px solid #E5E7EB', padding: '14px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--m-text)', marginBottom: '4px' }}>{deal.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--m-text-muted)', marginBottom: '10px' }}>
                    <Building2 size={11} />{deal.company}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: col.color }}>{fmt(deal.value)}</span>
                    <span style={{ fontSize: '11px', color: 'var(--m-text-muted)' }}>{deal.probability}%</span>
                  </div>
                  {/* Probability bar */}
                  <div style={{ height: '3px', backgroundColor: 'var(--m-surface-2)', borderRadius: '2px', marginTop: '8px' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: col.color, width: `${deal.probability}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--m-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-surface)', fontSize: '10px', fontWeight: 700 }}>{deal.owner}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--m-text-muted)' }}>
                      <Calendar size={10} />{deal.dueDate}
                    </div>
                  </div>
                </div>
              ))}
              {/* Add button */}
              <button style={{ width: '100%', padding: '10px', border: '1.5px dashed #D1D5DB', borderRadius: '10px', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', color: 'var(--m-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Plus size={14} /> Agregar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tab Actividades ────────────────────────────────── */
function TabActividades() {
  const [doneMap, setDoneMap] = useState<Record<number, boolean>>(
    Object.fromEntries(ACTIVITIES.map(a => [a.id, a.done]))
  );
  const toggle = (id: number) => setDoneMap(m => ({ ...m, [id]: !m[id] }));

  const grouped = ACTIVITIES.reduce<Record<string, typeof ACTIVITIES>>((acc, a) => {
    (acc[a.date] = acc[a.date] || []).push(a);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 28px' }}>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Pendientes', value: ACTIVITIES.filter(a => !a.done).length, color: 'var(--m-warning)' },
          { label: 'Completadas', value: ACTIVITIES.filter(a => a.done).length, color: 'var(--m-success)' },
          { label: 'Críticas', value: ACTIVITIES.filter(a => a.priority === 'crítica').length, color: 'var(--m-danger)' },
          { label: 'Esta semana', value: ACTIVITIES.length, color: 'var(--m-info)' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: 'var(--m-surface)', borderRadius: '10px', border: '1px solid #E5E7EB', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--m-text-muted)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grouped list */}
      {Object.entries(grouped).map(([date, acts]) => (
        <div key={date} style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--m-text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{date}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {acts.map(a => (
              <div key={a.id} style={{ backgroundColor: 'var(--m-surface)', borderRadius: '10px', border: '1px solid #E5E7EB', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', opacity: doneMap[a.id] ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                <button onClick={() => toggle(a.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0, color: doneMap[a.id] ? '#10B981' : 'var(--m-border)' }}>
                  {doneMap[a.id] ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: 'var(--m-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-text-muted)', flexShrink: 0 }}>
                  {ACTIVITY_ICONS[a.type]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--m-text)', textDecoration: doneMap[a.id] ? 'line-through' : 'none' }}>{a.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--m-text-muted)' }}>{a.company}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: 'var(--m-border)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--m-text-muted)' }}>{a.time}</span>
                  </div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, ...PRIORITY_COLORS[a.priority], flexShrink: 0 }}>{a.priority}</span>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--m-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-surface)', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>{a.owner}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}