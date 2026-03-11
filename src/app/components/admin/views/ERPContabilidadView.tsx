/* =====================================================
   Contabilidad
   Plan de Cuentas · Asientos · Cobrar/Pagar · Bancos
   ===================================================== */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  BookOpen, CreditCard, ArrowDownCircle, ArrowUpCircle,
  TrendingUp, TrendingDown, DollarSign, Building2,
  Plus, Filter, Download, ChevronRight, CheckCircle2,
  Clock, AlertCircle, RefreshCw,
} from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }
type Tab = 'plan' | 'asientos' | 'cobrar' | 'bancos';

/* ── Mock data ─────────────────────────────────────── */
const ACCOUNTS = [
  { code: '1',      name: 'ACTIVO',                        type: 'encabezado', level: 0, balance: 2_847_500 },
  { code: '1.1',    name: 'Activo Corriente',               type: 'encabezado', level: 1, balance: 1_523_000 },
  { code: '1.1.1',  name: 'Caja y Bancos',                  type: 'cuenta',     level: 2, balance: 487_000 },
  { code: '1.1.2',  name: 'Cuentas por Cobrar',             type: 'cuenta',     level: 2, balance: 634_500 },
  { code: '1.1.3',  name: 'Inventario de Mercaderías',      type: 'cuenta',     level: 2, balance: 401_500 },
  { code: '1.2',    name: 'Activo No Corriente',            type: 'encabezado', level: 1, balance: 1_324_500 },
  { code: '1.2.1',  name: 'Inmuebles y Equipamiento',       type: 'cuenta',     level: 2, balance: 1_200_000 },
  { code: '1.2.2',  name: 'Depreciación Acumulada',         type: 'cuenta',     level: 2, balance: -124_500 },
  { code: '2',      name: 'PASIVO',                        type: 'encabezado', level: 0, balance: 1_105_000 },
  { code: '2.1',    name: 'Pasivo Corriente',               type: 'encabezado', level: 1, balance: 680_000 },
  { code: '2.1.1',  name: 'Cuentas por Pagar',              type: 'cuenta',     level: 2, balance: 380_000 },
  { code: '2.1.2',  name: 'IVA por Pagar',                  type: 'cuenta',     level: 2, balance: 145_000 },
  { code: '2.1.3',  name: 'Sueldos por Pagar',              type: 'cuenta',     level: 2, balance: 155_000 },
  { code: '3',      name: 'PATRIMONIO',                    type: 'encabezado', level: 0, balance: 1_742_500 },
  { code: '3.1',    name: 'Capital Social',                 type: 'cuenta',     level: 1, balance: 1_500_000 },
  { code: '3.2',    name: 'Resultados del Ejercicio',       type: 'cuenta',     level: 1, balance: 242_500 },
  { code: '4',      name: 'INGRESOS',                      type: 'encabezado', level: 0, balance: 3_890_000 },
  { code: '4.1',    name: 'Ventas de Productos',            type: 'cuenta',     level: 1, balance: 3_450_000 },
  { code: '4.2',    name: 'Servicios y Comisiones',         type: 'cuenta',     level: 1, balance: 440_000 },
  { code: '5',      name: 'EGRESOS',                       type: 'encabezado', level: 0, balance: 3_647_500 },
  { code: '5.1',    name: 'Costo de Mercaderías Vendidas',  type: 'cuenta',     level: 1, balance: 2_100_000 },
  { code: '5.2',    name: 'Gastos de Personal',             type: 'cuenta',     level: 1, balance: 890_000 },
  { code: '5.3',    name: 'Gastos Operativos',              type: 'cuenta',     level: 1, balance: 657_500 },
];

const ENTRIES = [
  { id: 'AS-00201', date: '19 Feb', ref: 'FAC-1089', description: 'Venta a TechSur SA', debit: 'Cuentas por Cobrar', credit: 'Ventas de Productos', amount: 45_000, status: 'confirmado' },
  { id: 'AS-00202', date: '19 Feb', ref: 'COMP-0541', description: 'Compra mercadería Proveedor X', debit: 'Inventario', credit: 'Cuentas por Pagar', amount: 28_000, status: 'confirmado' },
  { id: 'AS-00203', date: '18 Feb', ref: 'PAG-0334', description: 'Pago sueldos febrero', debit: 'Sueldos por Pagar', credit: 'Banco Itaú', amount: 155_000, status: 'confirmado' },
  { id: 'AS-00204', date: '18 Feb', ref: 'FAC-1090', description: 'Venta a Supermercado Norte', debit: 'Cuentas por Cobrar', credit: 'Ventas de Productos', amount: 78_000, status: 'borrador' },
  { id: 'AS-00205', date: '17 Feb', ref: 'IVA-0219', description: 'Liquidación IVA mensual', debit: 'IVA por Pagar', credit: 'Banco BROU', amount: 38_500, status: 'confirmado' },
  { id: 'AS-00206', date: '17 Feb', ref: 'GTO-0089', description: 'Alquiler oficina feb', debit: 'Gastos Operativos', credit: 'Banco Itaú', amount: 25_000, status: 'borrador' },
];

const AR_INVOICES = [
  { id: 'FC-1080', client: 'TechSur SA',       date: '05 Feb', due: '05 Mar', amount: 45_000, paid: 20_000, status: 'parcial' },
  { id: 'FC-1081', client: 'Supermercado Norte', date: '08 Feb', due: '08 Mar', amount: 78_000, paid: 0, status: 'pendiente' },
  { id: 'FC-1082', client: 'Importadora SL',   date: '10 Feb', due: '12 Feb', amount: 230_000, paid: 230_000, status: 'pagado' },
  { id: 'FC-1083', client: 'Constructora NP',  date: '01 Feb', due: '01 Feb', amount: 95_000, paid: 0, status: 'vencido' },
  { id: 'FC-1084', client: 'Agro del Este',    date: '14 Feb', due: '14 Mar', amount: 55_000, paid: 55_000, status: 'pagado' },
];

const BANKS = [
  { name: 'BROU — Cuenta Corriente',     number: '****4521', currency: 'UYU', balance: 287_400, lastSync: 'Hoy 10:30' },
  { name: 'Itaú — Cuenta Corriente',     number: '****8832', currency: 'UYU', balance: 145_600, lastSync: 'Hoy 10:28' },
  { name: 'Santander — USD',             number: '****2190', currency: 'USD', balance: 18_250, lastSync: 'Ayer 18:00' },
  { name: 'Mercado Pago — Cuenta',       number: '****mp01', currency: 'UYU', balance: 54_000, lastSync: 'Hoy 10:45' },
];

const BANK_TRANSACTIONS = [
  { date: '19 Feb', desc: 'Cobro Factura TechSur', type: 'ingreso',  amount: 25_000, balance: 287_400 },
  { date: '18 Feb', desc: 'Pago Proveedor Alpack',  type: 'egreso',   amount: -12_500, balance: 262_400 },
  { date: '18 Feb', desc: 'Cobro Factura LogiUy',   type: 'ingreso',  amount: 174_000, balance: 274_900 },
  { date: '17 Feb', desc: 'Transferencia a Itaú',   type: 'egreso',   amount: -50_000, balance: 100_900 },
  { date: '17 Feb', desc: 'Impuesto IVA',           type: 'egreso',   amount: -38_500, balance: 150_900 },
  { date: '16 Feb', desc: 'Ventas del día (MP)',    type: 'ingreso',  amount: 89_000, balance: 189_400 },
];

/* ── Helpers ───────────────────────────────────────── */
const fmt = (n: number) => {
  const abs = Math.abs(n);
  const s = abs >= 1_000_000 ? `${(abs/1_000_000).toFixed(2)}M` : abs >= 1_000 ? `${(abs/1_000).toFixed(1)}K` : `${abs}`;
  return n < 0 ? `-$${s}` : `$${s}`;
};

const AR_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pagado:    { label: 'Pagado',    color: 'var(--m-success)', bg: 'var(--m-success-bg)' },
  parcial:   { label: 'Parcial',   color: 'var(--m-warning)', bg: 'var(--m-warning-bg)' },
  pendiente: { label: 'Pendiente', color: 'var(--m-info)', bg: 'var(--m-info-border)' },
  vencido:   { label: 'Vencido',   color: 'var(--m-danger)', bg: 'var(--m-danger-bg)' },
};

export function ERPContabilidadView({ onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('plan');
  const TABS = [
    { id: 'plan'     as Tab, icon: <BookOpen size={14} />,        label: 'Plan de Cuentas' },
    { id: 'asientos' as Tab, icon: <RefreshCw size={14} />,       label: 'Asientos' },
    { id: 'cobrar'   as Tab, icon: <ArrowDownCircle size={14} />, label: 'Cuentas por Cobrar/Pagar' },
    { id: 'bancos'   as Tab, icon: <CreditCard size={14} />,      label: 'Bancos y Cajas' },
  ];

  /* Financial summary */
  const totalAssets  = 2_847_500;
  const totalRevenue = 3_890_000;
  const totalExpenses= 3_647_500;
  const netResult    = totalRevenue - totalExpenses;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={BookOpen}
        title="Contabilidad"
        subtitle="Plan de cuentas, asientos contables, AR/AP y conciliación bancaria"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('gestion') },
          { label: 'Nuevo Asiento', primary: true },
        ]}
      />

      {/* Summary */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', padding: '14px 28px', display: 'flex', gap: '16px', flexShrink: 0 }}>
        {[
          { label: 'Total Activos',   value: fmt(totalAssets),   icon: <TrendingUp size={16} />,   color: 'var(--m-info)' },
          { label: 'Ingresos (mes)',  value: fmt(totalRevenue),  icon: <ArrowDownCircle size={16} />, color: 'var(--m-success)' },
          { label: 'Egresos (mes)',   value: fmt(totalExpenses), icon: <ArrowUpCircle size={16} />, color: 'var(--m-danger)' },
          { label: 'Resultado Neto',  value: fmt(netResult),     icon: <DollarSign size={16} />,   color: netResult >= 0 ? '#10B981' : 'var(--m-danger)' },
        ].map(k => (
          <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', backgroundColor: 'var(--m-surface-2)', borderRadius: '10px', flex: 1 }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--m-text)' }}>{k.value}</div>
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
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '14px 18px', border: 'none', borderBottom: `3px solid ${active ? '#FF6835' : 'transparent'}`, backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: active ? 700 : 500, color: active ? '#FF6835' : 'var(--m-text-muted)', whiteSpace: 'nowrap' }}>
              {t.icon}{t.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        {tab === 'plan'     && <TabPlan />}
        {tab === 'asientos' && <TabAsientos />}
        {tab === 'cobrar'   && <TabCobrar />}
        {tab === 'bancos'   && <TabBancos />}
      </div>
    </div>
  );
}

/* ── Plan de Cuentas ────────────────────────────────── */
function TabPlan() {
  const [expanded, setExpanded] = useState(new Set(['1', '2', '3', '4', '5']));
  const toggle = (code: string) => setExpanded(s => { const n = new Set(s); n.has(code) ? n.delete(code) : n.add(code); return n; });

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Plan de Cuentas</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', backgroundColor: 'var(--m-surface)', cursor: 'pointer', fontSize: '13px', color: 'var(--m-text-muted)' }}>
            <Download size={13} /> Exportar
          </button>
          <button style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 14px', backgroundColor: 'var(--m-primary)', border: 'none', borderRadius: '8px', color: 'var(--m-surface)', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
            <Plus size={13} /> Nueva Cuenta
          </button>
        </div>
      </div>
      <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--m-surface-2)', borderBottom: '1.5px solid #E5E7EB' }}>
              {['Código', 'Nombre', 'Tipo', 'Saldo'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACCOUNTS.map((acc, i) => {
              const isHeader = acc.type === 'encabezado';
              const indent = acc.level * 24;
              return (
                <tr key={acc.code} style={{ borderBottom: i < ACCOUNTS.length - 1 ? '1px solid #F3F4F6' : 'none', backgroundColor: isHeader ? '#F9FAFB' : 'transparent' }}>
                  <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--m-text-muted)' }}>{acc.code}</td>
                  <td style={{ padding: '11px 16px', paddingLeft: `${16 + indent}px` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isHeader && (
                        <button onClick={() => toggle(acc.code)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--m-text-muted)', padding: 0 }}>
                          <ChevronRight size={14} style={{ transform: expanded.has(acc.code) ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                        </button>
                      )}
                      <span style={{ fontWeight: isHeader ? 700 : 400, fontSize: isHeader ? '14px' : '13px', color: isHeader ? '#111' : 'var(--m-text-secondary)' }}>{acc.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: isHeader ? '#F3F4F6' : 'var(--m-info-bg)', color: isHeader ? '#374151' : 'var(--m-info-text)' }}>
                      {isHeader ? 'Encabezado' : 'Cuenta'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontWeight: isHeader ? 800 : 600, fontSize: '14px', color: acc.balance < 0 ? '#EF4444' : 'var(--m-text)', textAlign: 'right' }}>
                    {fmt(acc.balance)}
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

/* ── Asientos ────────────────────────────────────────── */
function TabAsientos() {
  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Asientos Contables</h3>
        <button style={{ padding: '8px 16px', backgroundColor: 'var(--m-primary)', color: 'var(--m-surface)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
          + Nuevo Asiento
        </button>
      </div>
      <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--m-surface-2)', borderBottom: '1.5px solid #E5E7EB' }}>
              {['N° Asiento', 'Fecha', 'Referencia', 'Descripción', 'Debe', 'Haber', 'Importe', 'Estado'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENTRIES.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: i < ENTRIES.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                onMouseEnter={el => (el.currentTarget.style.backgroundColor = '#FAFAFA')}
                onMouseLeave={el => (el.currentTarget.style.backgroundColor = 'transparent')}>
                <td style={{ padding: '13px 14px', fontWeight: 700, fontSize: '13px', color: 'var(--m-primary)' }}>{e.id}</td>
                <td style={{ padding: '13px 14px', fontSize: '13px', color: 'var(--m-text-muted)' }}>{e.date}</td>
                <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--m-text-muted)' }}>{e.ref}</td>
                <td style={{ padding: '13px 14px', fontSize: '13px', color: 'var(--m-text)', maxWidth: '200px' }}>{e.description}</td>
                <td style={{ padding: '13px 14px', fontSize: '12px', color: 'var(--m-text-secondary)' }}>{e.debit}</td>
                <td style={{ padding: '13px 14px', fontSize: '12px', color: 'var(--m-text-secondary)' }}>{e.credit}</td>
                <td style={{ padding: '13px 14px', fontWeight: 700, color: 'var(--m-text)' }}>{fmt(e.amount)}</td>
                <td style={{ padding: '13px 14px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: e.status === 'confirmado' ? '#D1FAE5' : 'var(--m-warning-bg)', color: e.status === 'confirmado' ? '#065F46' : 'var(--m-warning-text)' }}>
                    {e.status === 'confirmado' ? '✓ Confirmado' : '⏳ Borrador'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Cobrar / Pagar ──────────────────────────────────── */
function TabCobrar() {
  const [mode, setMode] = useState<'cobrar' | 'pagar'>('cobrar');
  const totalPending = AR_INVOICES.filter(i => i.status !== 'pagado').reduce((s, i) => s + (i.amount - i.paid), 0);
  const totalOverdue = AR_INVOICES.filter(i => i.status === 'vencido').reduce((s, i) => s + i.amount, 0);

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setMode('cobrar')} style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '10px 20px', border: `2px solid ${mode === 'cobrar' ? '#FF6835' : 'var(--m-border)'}`, borderRadius: '10px', backgroundColor: mode === 'cobrar' ? '#FF683510' : 'var(--m-surface)', color: mode === 'cobrar' ? '#FF6835' : 'var(--m-text-muted)', cursor: 'pointer', fontWeight: mode === 'cobrar' ? 700 : 500, fontSize: '14px' }}>
          <ArrowDownCircle size={16} /> Cuentas por Cobrar
        </button>
        <button onClick={() => setMode('pagar')} style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '10px 20px', border: `2px solid ${mode === 'pagar' ? '#FF6835' : 'var(--m-border)'}`, borderRadius: '10px', backgroundColor: mode === 'pagar' ? '#FF683510' : 'var(--m-surface)', color: mode === 'pagar' ? '#FF6835' : 'var(--m-text-muted)', cursor: 'pointer', fontWeight: mode === 'pagar' ? 700 : 500, fontSize: '14px' }}>
          <ArrowUpCircle size={16} /> Cuentas por Pagar
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total Pendiente', value: fmt(totalPending), color: 'var(--m-warning)', bg: 'var(--m-warning-bg)' },
          { label: 'Total Vencido',   value: fmt(totalOverdue), color: 'var(--m-danger)', bg: 'var(--m-danger-bg)' },
          { label: 'Cobrado (mes)',   value: fmt(299_000),      color: 'var(--m-success)', bg: 'var(--m-success-bg)' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: s.color, marginTop: '3px', opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--m-surface-2)', borderBottom: '1.5px solid #E5E7EB' }}>
              {['Factura', mode === 'cobrar' ? 'Cliente' : 'Proveedor', 'Emisión', 'Vencimiento', 'Total', 'Pagado', 'Saldo', 'Estado', ''].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AR_INVOICES.map((inv, i) => {
              const st = AR_STATUS[inv.status];
              const saldo = inv.amount - inv.paid;
              return (
                <tr key={inv.id} style={{ borderBottom: i < AR_INVOICES.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '13px 14px', fontWeight: 700, fontSize: '13px', color: 'var(--m-primary)' }}>{inv.id}</td>
                  <td style={{ padding: '13px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--m-text)' }}>{inv.client}</td>
                  <td style={{ padding: '13px 14px', fontSize: '12px', color: 'var(--m-text-muted)' }}>{inv.date}</td>
                  <td style={{ padding: '13px 14px', fontSize: '12px', color: inv.status === 'vencido' ? '#DC2626' : 'var(--m-text-muted)', fontWeight: inv.status === 'vencido' ? 700 : 400 }}>{inv.due}</td>
                  <td style={{ padding: '13px 14px', fontWeight: 600, color: 'var(--m-text)' }}>{fmt(inv.amount)}</td>
                  <td style={{ padding: '13px 14px', fontSize: '13px', color: 'var(--m-success)', fontWeight: 600 }}>{fmt(inv.paid)}</td>
                  <td style={{ padding: '13px 14px', fontWeight: 700, color: saldo > 0 ? '#DC2626' : 'var(--m-success)' }}>{fmt(saldo)}</td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    {inv.status !== 'pagado' && (
                      <button style={{ padding: '5px 12px', backgroundColor: 'var(--m-primary)', color: 'var(--m-surface)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Registrar Pago</button>
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

/* ── Bancos ──────────────────────────────────────────── */
function TabBancos() {
  const [selectedBank, setSelectedBank] = useState(0);
  const totalUYU = BANKS.filter(b => b.currency === 'UYU').reduce((s, b) => s + b.balance, 0);

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        {/* Bank list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--m-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cuentas</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--m-success)' }}>Total UYU: {fmt(totalUYU)}</span>
          </div>
          {BANKS.map((b, i) => (
            <button key={b.name} onClick={() => setSelectedBank(i)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `2px solid ${selectedBank === i ? '#FF6835' : 'var(--m-border)'}`, backgroundColor: selectedBank === i ? '#FF683508' : 'var(--m-surface)', cursor: 'pointer', textAlign: 'left', marginBottom: '8px', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--m-text)' }}>{b.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--m-text-muted)', marginTop: '2px' }}>{b.number}</div>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--m-surface-2)', color: 'var(--m-text-secondary)' }}>{b.currency}</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--m-text)', marginTop: '8px' }}>{fmt(b.balance)}</div>
              <div style={{ fontSize: '11px', color: 'var(--m-text-muted)', marginTop: '3px' }}>Sync: {b.lastSync}</div>
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--m-text)' }}>{BANKS[selectedBank].name}</div>
              <div style={{ fontSize: '13px', color: 'var(--m-text-muted)', marginTop: '1px' }}>Últimos movimientos</div>
            </div>
            <button style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', backgroundColor: 'var(--m-surface)', cursor: 'pointer', fontSize: '13px', color: 'var(--m-text-muted)' }}>
              <RefreshCw size={13} /> Sincronizar
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--m-surface-2)' }}>
                {['Fecha', 'Descripción', 'Tipo', 'Importe', 'Saldo'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANK_TRANSACTIONS.map((t, i) => (
                <tr key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--m-text-muted)' }}>{t.date}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--m-text)' }}>{t.desc}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: t.type === 'ingreso' ? '#059669' : 'var(--m-danger)' }}>
                      {t.type === 'ingreso' ? <ArrowDownCircle size={13} /> : <ArrowUpCircle size={13} />}
                      {t.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: t.type === 'ingreso' ? '#059669' : 'var(--m-danger)' }}>
                    {t.type === 'ingreso' ? '+' : ''}{fmt(t.amount)}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--m-text)' }}>{fmt(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}