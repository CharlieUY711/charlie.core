/* =====================================================
   Recursos Humanos
   Empleados · Asistencia · Nómina
   ===================================================== */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Users, Clock, DollarSign, CheckCircle2, CircleX,
  CircleMinus, Plus, Download, Phone, Mail, MapPin,
  Star, Award, TrendingUp, Calendar,
} from 'lucide-react';
import { UserCheck } from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }
type Tab = 'empleados' | 'asistencia' | 'nomina';

/* ── Mock data ─────────────────────────────────────── */
const EMPLOYEES = [
  { id: 1, name: 'Carlos Varalla',     role: 'CEO & Founder',      dept: 'Dirección',   phone: '+598 99 000 001', email: 'cv@charlie.com',      salary: 120_000, status: 'activo',    joined: 'Ene 2020', performance: 98, avatar: 'CV' },
  { id: 2, name: 'Ana Martínez',       role: 'Jefa de Ventas',     dept: 'Ventas',      phone: '+598 99 111 222', email: 'am@charlie.com',      salary: 85_000,  status: 'activo',    joined: 'Mar 2021', performance: 94, avatar: 'AM' },
  { id: 3, name: 'Luis Pérez',         role: 'Dev Lead',           dept: 'Tecnología',  phone: '+598 98 222 333', email: 'lp@charlie.com',      salary: 95_000,  status: 'activo',    joined: 'Jun 2021', performance: 91, avatar: 'LP' },
  { id: 4, name: 'Sofía Ramírez',      role: 'Community Manager',  dept: 'Marketing',   phone: '+598 99 333 444', email: 'sr@charlie.com',      salary: 55_000,  status: 'activo',    joined: 'Ago 2022', performance: 88, avatar: 'SR' },
  { id: 5, name: 'Pablo Núñez',        role: 'Logístico Senior',   dept: 'Logística',   phone: '+598 98 444 555', email: 'pn@charlie.com',      salary: 62_000,  status: 'licencia',  joined: 'Feb 2022', performance: 85, avatar: 'PN' },
  { id: 6, name: 'Gabriela Torres',    role: 'Contadora',          dept: 'Finanzas',    phone: '+598 99 555 666', email: 'gt@charlie.com',      salary: 75_000,  status: 'activo',    joined: 'Nov 2021', performance: 92, avatar: 'GT' },
  { id: 7, name: 'Federico Alves',     role: 'Soporte Técnico',    dept: 'Tecnología',  phone: '+598 98 666 777', email: 'fa@charlie.com',      salary: 48_000,  status: 'activo',    joined: 'Abr 2023', performance: 80, avatar: 'FA' },
  { id: 8, name: 'Romina Sosa',        role: 'Asistente RRHH',     dept: 'RRHH',        phone: '+598 99 777 888', email: 'rs@charlie.com',      salary: 50_000,  status: 'activo',    joined: 'Jul 2023', performance: 87, avatar: 'RS' },
];

const DEPTS = ['Todos', 'Dirección', 'Ventas', 'Tecnología', 'Marketing', 'Logística', 'Finanzas', 'RRHH'];

// Days in Feb 2026
const DAYS = Array.from({ length: 19 }, (_, i) => i + 1);
const ATTENDANCE_DATA: Record<number, Record<number, 'present' | 'absent' | 'late' | 'leave'>> = {
  1: { 1:'present',2:'present',3:'present',4:'present',5:'present',6:'present',7:'present',8:'present',9:'present',10:'present',11:'present',12:'present',13:'present',14:'present',15:'present',16:'present',17:'present',18:'present',19:'present' },
  2: { 1:'present',2:'present',3:'present',4:'late',5:'present',6:'present',7:'present',8:'present',9:'present',10:'present',11:'present',12:'present',13:'late',14:'present',15:'present',16:'present',17:'present',18:'present',19:'present' },
  3: { 1:'present',2:'present',3:'present',4:'present',5:'present',6:'late',7:'present',8:'present',9:'present',10:'present',11:'present',12:'present',13:'present',14:'present',15:'present',16:'absent',17:'present',18:'present',19:'present' },
  4: { 1:'present',2:'present',3:'late',4:'present',5:'present',6:'present',7:'present',8:'present',9:'absent',10:'present',11:'present',12:'present',13:'present',14:'present',15:'present',16:'present',17:'present',18:'present',19:'present' },
  5: { 1:'leave',2:'leave',3:'leave',4:'leave',5:'leave',6:'leave',7:'leave',8:'leave',9:'leave',10:'leave',11:'leave',12:'leave',13:'leave',14:'leave',15:'present',16:'present',17:'present',18:'present',19:'present' },
  6: { 1:'present',2:'present',3:'present',4:'present',5:'present',6:'present',7:'present',8:'late',9:'present',10:'present',11:'present',12:'present',13:'present',14:'present',15:'present',16:'present',17:'present',18:'present',19:'present' },
  7: { 1:'present',2:'present',3:'present',4:'present',5:'present',6:'present',7:'present',8:'present',9:'present',10:'present',11:'present',12:'present',13:'present',14:'present',15:'present',16:'absent',17:'present',18:'present',19:'present' },
  8: { 1:'present',2:'present',3:'present',4:'present',5:'present',6:'present',7:'present',8:'present',9:'present',10:'present',11:'present',12:'present',13:'present',14:'present',15:'present',16:'present',17:'late',18:'present',19:'present' },
};

const PAYROLL = [
  { id: 1, name: 'Carlos Varalla',  role: 'CEO', dept: 'Dirección', gross: 120_000, ips: 18_000, irpf: 8_400, net: 93_600, status: 'pagado' },
  { id: 2, name: 'Ana Martínez',   role: 'Jefa Ventas', dept: 'Ventas', gross: 85_000, ips: 12_750, irpf: 5_100, net: 67_150, status: 'pagado' },
  { id: 3, name: 'Luis Pérez',     role: 'Dev Lead', dept: 'Tecnología', gross: 95_000, ips: 14_250, irpf: 6_650, net: 74_100, status: 'procesando' },
  { id: 4, name: 'Sofía Ramírez',  role: 'CM', dept: 'Marketing', gross: 55_000, ips: 8_250, irpf: 2_200, net: 44_550, status: 'procesando' },
  { id: 5, name: 'Gabriela Torres',role: 'Contadora', dept: 'Finanzas', gross: 75_000, ips: 11_250, irpf: 4_500, net: 59_250, status: 'pendiente' },
  { id: 6, name: 'Federico Alves', role: 'Soporte', dept: 'Tecnología', gross: 48_000, ips: 7_200, irpf: 1_440, net: 39_360, status: 'pendiente' },
  { id: 7, name: 'Romina Sosa',    role: 'Asist. RRHH', dept: 'RRHH', gross: 50_000, ips: 7_500, irpf: 1_500, net: 41_000, status: 'pendiente' },
];

const ATT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  present: { bg: 'var(--m-success-bg)', color: 'var(--m-success-text)', label: '✓' },
  absent:  { bg: 'var(--m-danger-bg)', color: 'var(--m-danger-text)', label: '✗' },
  late:    { bg: 'var(--m-warning-bg)', color: 'var(--m-warning-text)', label: '~' },
  leave:   { bg: 'var(--m-info-border)', color: 'var(--m-info-text)', label: 'L' },
};

const PAYROLL_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pagado:     { label: 'Pagado',      color: 'var(--m-success)', bg: 'var(--m-success-bg)' },
  procesando: { label: 'Procesando',  color: 'var(--m-info)', bg: 'var(--m-info-border)' },
  pendiente:  { label: 'Pendiente',   color: 'var(--m-warning)', bg: 'var(--m-warning-bg)' },
};

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  activo:   { label: 'Activo',   color: 'var(--m-success)', bg: 'var(--m-success-bg)' },
  licencia: { label: 'Licencia', color: 'var(--m-info)', bg: 'var(--m-info-border)' },
  inactivo: { label: 'Inactivo', color: 'var(--m-text-muted)', bg: 'var(--m-surface-2)' },
};

const fmt = (n: number) => `$${n.toLocaleString('es-UY')}`;
const DEPT_COLORS = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#6366F1','#EC4899'];

export function ERPRRHHView({ onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('empleados');
  const TABS = [
    { id: 'empleados'  as Tab, icon: <Users size={14} />,    label: 'Empleados' },
    { id: 'asistencia' as Tab, icon: <Clock size={14} />,    label: 'Asistencia' },
    { id: 'nomina'     as Tab, icon: <DollarSign size={14} />, label: 'Nómina' },
  ];

  const totalSalary = EMPLOYEES.reduce((s, e) => s + e.salary, 0);
  const byDept = DEPTS.slice(1).map(d => ({ dept: d, count: EMPLOYEES.filter(e => e.dept === d).length })).filter(d => d.count > 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={UserCheck}
        title="Recursos Humanos"
        subtitle="Gestión de empleados, asistencia y liquidación de nómina"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('gestion') },
          { label: '+ Nuevo Empleado', primary: true },
        ]}
      />

      {/* KPIs */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', padding: '14px 28px', display: 'flex', gap: '14px', flexShrink: 0 }}>
        {[
          { label: 'Total Empleados',  value: EMPLOYEES.length, color: 'var(--m-info)' },
          { label: 'Activos hoy',      value: EMPLOYEES.filter(e => e.status === 'activo').length, color: 'var(--m-success)' },
          { label: 'En licencia',      value: EMPLOYEES.filter(e => e.status === 'licencia').length, color: 'var(--m-warning)' },
          { label: 'Masa Salarial',    value: fmt(totalSalary), color: 'var(--m-purple)' },
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
        {tab === 'empleados'  && <TabEmpleados />}
        {tab === 'asistencia' && <TabAsistencia />}
        {tab === 'nomina'     && <TabNomina />}
      </div>
    </div>
  );
}

/* ── Empleados ───────────────────────────────────────── */
function TabEmpleados() {
  const [dept, setDept] = useState('Todos');
  const filtered = dept === 'Todos' ? EMPLOYEES : EMPLOYEES.filter(e => e.dept === dept);

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Department filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {DEPTS.map((d, i) => (
          <button key={d} onClick={() => setDept(d)}
            style={{ padding: '7px 14px', border: `1.5px solid ${dept === d ? '#FF6835' : 'var(--m-border)'}`, borderRadius: '20px', backgroundColor: dept === d ? '#FF683510' : 'var(--m-surface)', color: dept === d ? '#FF6835' : 'var(--m-text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: dept === d ? 700 : 500 }}>
            {d}
          </button>
        ))}
      </div>

      {/* Employee cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filtered.map(emp => {
          const st = STATUS_STYLE[emp.status];
          return (
            <div key={emp.id} style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--m-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-surface)', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                  {emp.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--m-text)', marginBottom: '2px' }}>{emp.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--m-text-muted)' }}>{emp.role}</div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--m-text-muted)' }}>{emp.dept}</span>
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { icon: <Mail size={11} />, value: emp.email },
                    { icon: <Phone size={11} />, value: emp.phone },
                    { icon: <Calendar size={11} />, value: `Desde ${emp.joined}` },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--m-text-muted)' }}>
                      <span style={{ color: 'var(--m-text-muted)', flexShrink: 0 }}>{row.icon}</span>{row.value}
                    </div>
                  ))}
                </div>
                {/* Performance */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--m-text-muted)' }}>Performance</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: emp.performance >= 90 ? '#059669' : emp.performance >= 80 ? '#D97706' : 'var(--m-danger)' }}>{emp.performance}%</span>
                  </div>
                  <div style={{ height: '5px', backgroundColor: 'var(--m-surface-2)', borderRadius: '3px' }}>
                    <div style={{ height: '100%', borderRadius: '3px', backgroundColor: emp.performance >= 90 ? '#10B981' : emp.performance >= 80 ? '#F59E0B' : 'var(--m-danger)', width: `${emp.performance}%`, transition: 'width 0.5s' }} />
                  </div>
                </div>
                <div style={{ marginTop: '12px', fontWeight: 700, fontSize: '14px', color: 'var(--m-primary)' }}>{fmt(emp.salary)}<span style={{ fontSize: '11px', color: 'var(--m-text-muted)', fontWeight: 400 }}>/mes</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Asistencia ──────────────────────────────────────── */
function TabAsistencia() {
  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Asistencia — Febrero 2026</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { label: 'Presente', style: ATT_STYLE.present },
              { label: 'Tarde',    style: ATT_STYLE.late },
              { label: 'Ausente',  style: ATT_STYLE.absent },
              { label: 'Licencia', style: ATT_STYLE.leave },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--m-text-muted)' }}>
                <span style={{ width: 14, height: 14, borderRadius: '3px', backgroundColor: l.style.bg, display: 'inline-block' }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--m-surface-2)' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)', minWidth: '160px' }}>Empleado</th>
              {DAYS.map(d => (
                <th key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: '11px', color: 'var(--m-text-muted)', width: '32px' }}>{d}</th>
              ))}
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)' }}>%</th>
            </tr>
          </thead>
          <tbody>
            {EMPLOYEES.slice(0, 8).map((emp, row) => {
              const data = ATTENDANCE_DATA[row + 1] || {};
              const presentCount = DAYS.filter(d => data[d] === 'present').length;
              const pct = Math.round((presentCount / DAYS.length) * 100);
              return (
                <tr key={emp.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--m-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-surface)', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{emp.avatar}</div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--m-text)', whiteSpace: 'nowrap' }}>{emp.name.split(' ')[0]}</span>
                    </div>
                  </td>
                  {DAYS.map(d => {
                    const status = data[d] || 'present';
                    const s = ATT_STYLE[status];
                    return (
                      <td key={d} style={{ padding: '6px 3px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '4px', backgroundColor: s.bg, fontSize: '11px', fontWeight: 700, color: s.color }}>
                          {s.label}
                        </span>
                      </td>
                    );
                  })}
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: pct >= 95 ? '#059669' : pct >= 80 ? '#D97706' : 'var(--m-danger)' }}>{pct}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Nómina ──────────────────────────────────────────── */
function TabNomina() {
  const totalGross = PAYROLL.reduce((s, p) => s + p.gross, 0);
  const totalNet   = PAYROLL.reduce((s, p) => s + p.net, 0);
  const totalIPS   = PAYROLL.reduce((s, p) => s + p.ips, 0);
  const totalIRPF  = PAYROLL.reduce((s, p) => s + p.irpf, 0);

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Salario Bruto Total', value: fmt(totalGross), color: 'var(--m-info)', bg: 'var(--m-info-bg)' },
          { label: 'IPS (15%)',           value: fmt(totalIPS),   color: 'var(--m-purple)', bg: 'var(--m-purple-bg)' },
          { label: 'IRPF',                value: fmt(totalIRPF),  color: 'var(--m-warning)', bg: 'var(--m-warning-bg)' },
          { label: 'Neto a Pagar',        value: fmt(totalNet),   color: 'var(--m-success)', bg: 'var(--m-success-bg)' },
        ].map(c => (
          <div key={c.label} style={{ backgroundColor: c.bg, borderRadius: '12px', padding: '16px 20px', border: `1px solid ${c.color}20` }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: '12px', color: c.color, opacity: 0.8, marginTop: '3px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Period header */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 700 }}>Liquidación Febrero 2026</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--m-text-muted)' }}>Período: 01/02/2026 — 28/02/2026</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', backgroundColor: 'var(--m-surface)', cursor: 'pointer', fontSize: '13px', color: 'var(--m-text-muted)' }}>
              <Download size={13} /> Exportar
            </button>
            <button style={{ padding: '8px 16px', backgroundColor: 'var(--m-primary)', color: 'var(--m-surface)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
              Procesar Todos
            </button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--m-surface-2)' }}>
              {['Empleado', 'Cargo', 'Departamento', 'Bruto', 'IPS (15%)', 'IRPF', 'Neto', 'Estado', ''].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAYROLL.map((p, i) => {
              const st = PAYROLL_STATUS[p.status];
              return (
                <tr key={p.id} style={{ borderTop: '1px solid #F3F4F6' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: 'var(--m-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-surface)', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                        {p.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--m-text)' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: '12px', color: 'var(--m-text-muted)' }}>{p.role}</td>
                  <td style={{ padding: '13px 14px', fontSize: '12px', color: 'var(--m-text-secondary)' }}>{p.dept}</td>
                  <td style={{ padding: '13px 14px', fontWeight: 600, color: 'var(--m-text)' }}>{fmt(p.gross)}</td>
                  <td style={{ padding: '13px 14px', color: 'var(--m-purple)', fontWeight: 600 }}>-{fmt(p.ips)}</td>
                  <td style={{ padding: '13px 14px', color: 'var(--m-warning)', fontWeight: 600 }}>-{fmt(p.irpf)}</td>
                  <td style={{ padding: '13px 14px', fontWeight: 800, color: 'var(--m-success)' }}>{fmt(p.net)}</td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    {p.status !== 'pagado' && (
                      <button style={{ padding: '5px 12px', backgroundColor: p.status === 'procesando' ? '#3B82F6' : 'var(--m-primary)', color: 'var(--m-surface)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                        {p.status === 'procesando' ? 'Confirmar' : 'Procesar'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}