import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Plus, Search, Eye, Edit2, Trash2, X, CheckCircle2, Clock,
  AlertCircle, ClipboardList, Users, TrendingUp, Star
} from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE = '#FF6835';

type TabType = 'ordenes' | 'proveedores' | 'nueva-orden';

interface Supplier {
  id: string; name: string; contact: string; email: string; phone: string;
  category: string; rating: number; lead: number; terms: string; status: 'active' | 'inactive';
}

interface PurchaseOrder {
  id: string; number: string; date: string; expectedDate: string;
  supplier: string; items: { description: string; qty: number; cost: number }[];
  status: 'draft' | 'sent' | 'received' | 'partial' | 'cancelled';
  notes: string;
}

const SUPPLIERS: Supplier[] = [
  { id: '1', name: 'TechDistrib SRL',        contact: 'Roberto Sánchez', email: 'ventas@techdistrib.com',   phone: '+598 99 123 456', category: 'Tecnología',      rating: 5, lead: 3,  terms: '30 días',    status: 'active' },
  { id: '2', name: 'ModaImport SA',           contact: 'Valentina Cruz',  email: 'compras@modaimport.com',   phone: '+598 98 234 567', category: 'Moda',            rating: 4, lead: 7,  terms: 'Contado',    status: 'active' },
  { id: '3', name: 'Alimentos del Sur',       contact: 'Diego Fontana',   email: 'pedidos@alimentossur.uy', phone: '+598 97 345 678', category: 'Alimentos',       rating: 5, lead: 1,  terms: '15 días',    status: 'active' },
  { id: '4', name: 'Hogar & Estilo',          contact: 'Patricia Méndez', email: 'ventas@hogarestilo.com',   phone: '+598 96 456 789', category: 'Hogar',           rating: 3, lead: 14, terms: '45 días',    status: 'active' },
  { id: '5', name: 'Deportes Mayorista',      contact: 'Gonzalo Lima',    email: 'mayorista@deportes.uy',    phone: '+598 95 567 890', category: 'Deportes',        rating: 4, lead: 5,  terms: '30 días',    status: 'inactive' },
];

const ORDERS: PurchaseOrder[] = [
  { id: '1', number: 'OC-2026-001', date: '2026-02-18', expectedDate: '2026-02-21', supplier: 'TechDistrib SRL',  items: [{ description: 'iPhone 14 128GB', qty: 5, cost: 650 }, { description: 'AirPods Pro', qty: 3, cost: 180 }], status: 'sent',     notes: 'Urgente para reponer stock' },
  { id: '2', number: 'OC-2026-002', date: '2026-02-17', expectedDate: '2026-02-18', supplier: 'Alimentos del Sur', items: [{ description: 'Café Molido 500g', qty: 100, cost: 4.20 }], status: 'received', notes: '' },
  { id: '3', number: 'OC-2026-003', date: '2026-02-15', expectedDate: '2026-03-01', supplier: 'ModaImport SA',    items: [{ description: 'Campera Fleece M', qty: 10, cost: 90 }, { description: 'Campera Fleece L', qty: 8, cost: 90 }], status: 'partial',  notes: 'Recibidos 8 de 18 items' },
  { id: '4', number: 'OC-2026-004', date: '2026-02-19', expectedDate: '2026-02-25', supplier: 'Deportes Mayorista', items: [{ description: 'Pelota Nike', qty: 20, cost: 22 }], status: 'draft',    notes: '' },
];

const STATUS_MAP = {
  draft:     { label: 'Borrador',  bg: 'var(--m-surface-2)', color: 'var(--m-text-secondary)', Icon: Clock },
  sent:      { label: 'Enviada',   bg: 'var(--m-purple-bg)', color: 'var(--m-purple)', Icon: TrendingUp },
  received:  { label: 'Recibida',  bg: 'var(--m-success-bg)', color: 'var(--m-success)', Icon: CheckCircle2 },
  partial:   { label: 'Parcial',   bg: 'var(--m-warning-bg)', color: 'var(--m-warning-text)', Icon: AlertCircle },
  cancelled: { label: 'Cancelada', bg: 'var(--m-danger-bg)', color: 'var(--m-danger)', Icon: X },
};

export function ERPComprasView({ onNavigate }: Props) {
  const [tab, setTab] = useState<TabType>('ordenes');
  const [search, setSearch] = useState('');
  const [showSupModal, setShowSupModal] = useState(false);
  const [selectedSup, setSelectedSup] = useState<Supplier | null>(null);

  const totalOrders = ORDERS.length;
  const pending = ORDERS.filter(o => o.status === 'sent' || o.status === 'partial').length;
  const totalSpent = ORDERS.filter(o => o.status === 'received').reduce((s, o) => s + o.items.reduce((a, it) => a + it.qty * it.cost, 0), 0);

  const filteredOrders = ORDERS.filter(o =>
    !search || o.supplier.toLowerCase().includes(search.toLowerCase()) || o.number.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuppliers = SUPPLIERS.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={ClipboardList}
        title="Compras y Proveedores"
        subtitle="Órdenes de compra, recepción y gestión de proveedores — ERP"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('gestion') },
          { label: tab === 'ordenes' ? '+ Nueva OC' : tab === 'proveedores' ? '+ Nuevo Proveedor' : '+ Guardar OC', primary: true, onClick: () => tab === 'ordenes' ? setTab('nueva-orden') : tab === 'proveedores' ? (setSelectedSup(null), setShowSupModal(true)) : undefined },
        ]}
      />

      {/* Tabs */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ display: 'flex', padding: '0 28px' }}>
          {[
            { id: 'ordenes' as TabType,     label: '📋 Órdenes de Compra' },
            { id: 'proveedores' as TabType, label: '🏭 Proveedores' },
            { id: 'nueva-orden' as TabType, label: '✏️ Nueva OC' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '14px 18px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: tab === t.id ? ORANGE : 'var(--m-text-muted)', fontWeight: tab === t.id ? '700' : '500', fontSize: '0.875rem', borderBottom: tab === t.id ? `2px solid ${ORANGE}` : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        <div style={{ padding: '24px 28px', maxWidth: '1200px' }}>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Órdenes',       value: totalOrders.toString(), color: 'var(--m-text)' },
              { label: 'Pendientes/Parciales', value: pending.toString(),     color: 'var(--m-warning)' },
              { label: 'Proveedores Activos',  value: SUPPLIERS.filter(s => s.status === 'active').length.toString(), color: 'var(--m-success)' },
              { label: 'Compras Recibidas',    value: `$${totalSpent.toLocaleString('es', { maximumFractionDigits: 0 })}`, color: ORANGE },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px 20px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── ÓRDENES ── */}
          {tab === 'ordenes' && (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
                  <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} size={14} color="#9CA3AF" />
                  <input type="text" placeholder="Buscar por proveedor o número..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button onClick={() => setTab('nueva-orden')} style={{ padding: '9px 16px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Plus size={14} /> Nueva OC
                </button>
              </div>

              <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--m-surface-2)' }}>
                      {['Número', 'Proveedor', 'Total', 'Fecha', 'Llegada Est.', 'Estado', 'Notas', ''].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o, i) => {
                      const total = o.items.reduce((s, it) => s + it.qty * it.cost, 0);
                      const st = STATUS_MAP[o.status];
                      return (
                        <tr key={o.id} style={{ borderTop: '1px solid #F3F4F6', backgroundColor: i % 2 === 0 ? '#FFF' : 'var(--m-surface-2)' }}>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>{o.number}</td>
                          <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--m-text)', fontSize: '0.875rem' }}>{o.supplier}</td>
                          <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--m-text)' }}>${total.toFixed(2)}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>{o.date}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>{o.expectedDate}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ padding: '3px 9px', borderRadius: '20px', backgroundColor: st.bg, color: st.color, fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                              <st.Icon size={10} /> {st.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--m-text-muted)', fontSize: '0.75rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.notes || '—'}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)' }}><Eye size={13} /></button>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)' }}><Edit2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── PROVEEDORES ── */}
          {tab === 'proveedores' && (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
                  <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} size={14} color="#9CA3AF" />
                  <input type="text" placeholder="Buscar proveedor..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button onClick={() => { setSelectedSup(null); setShowSupModal(true); }} style={{ padding: '9px 16px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Plus size={14} /> Nuevo Proveedor
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {filteredSuppliers.map(s => (
                  <div key={s.id} style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 2px', fontWeight: '800', color: 'var(--m-text)', fontSize: '0.95rem' }}>{s.name}</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{s.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: s.status === 'active' ? '#DCFCE7' : 'var(--m-surface-2)', color: s.status === 'active' ? '#15803D' : 'var(--m-text-muted)', fontSize: '0.7rem', fontWeight: '700' }}>
                          {s.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                        <button onClick={() => { setSelectedSup(s); setShowSupModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)', padding: '2px' }}><Edit2 size={13} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '0.78rem', color: 'var(--m-text-secondary)' }}>
                      <span>👤 {s.contact}</span>
                      <span>📧 {s.email}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {[
                        { label: 'Plazo', value: `${s.lead}d` },
                        { label: 'Términos', value: s.terms },
                        { label: 'Rating', value: Array.from({ length: 5 }, (_, i) => i < s.rating ? '⭐' : '☆').join('') },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--m-text-muted)', textTransform: 'uppercase' }}>{label}</p>
                          <p style={{ margin: '1px 0 0', fontWeight: '700', color: 'var(--m-text-secondary)', fontSize: '0.78rem' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── NUEVA OC ── */}
          {tab === 'nueva-orden' && (
            <div style={{ maxWidth: '700px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Supplier selector */}
                <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 12px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.9rem' }}>Proveedor</h4>
                  <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', backgroundColor: 'var(--m-surface)' }}>
                    <option value="">Seleccionar proveedor...</option>
                    {SUPPLIERS.filter(s => s.status === 'active').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Dates */}
                <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[{ label: 'Fecha de la OC', type: 'date' }, { label: 'Fecha de entrega estimada', type: 'date' }].map(({ label, type }) => (
                      <div key={label}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--m-text-secondary)', marginBottom: '4px' }}>{label}</label>
                        <input type={type} style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--m-text)', fontSize: '0.9rem' }}>Artículos a comprar</h4>
                    <button style={{ padding: '5px 12px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '7px', fontWeight: '700', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Plus size={12} /> Agregar línea
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: '8px', marginBottom: '6px' }}>
                    {['Artículo/Descripción', 'Cantidad', 'Costo unit.', 'Total', ''].map(h => (
                      <span key={h} style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--m-text-muted)', textTransform: 'uppercase' }}>{h}</span>
                    ))}
                  </div>
                  {[1, 2].map(i => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input type="text" placeholder="Descripción del artículo"
                        style={{ padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '7px', fontSize: '0.82rem', outline: 'none' }} />
                      <input type="number" placeholder="0"
                        style={{ padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '7px', fontSize: '0.82rem', outline: 'none' }} />
                      <input type="number" placeholder="0.00" step={0.01}
                        style={{ padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '7px', fontSize: '0.82rem', outline: 'none' }} />
                      <span style={{ padding: '8px 10px', backgroundColor: 'var(--m-surface-2)', borderRadius: '7px', fontSize: '0.82rem', color: 'var(--m-text-muted)', textAlign: 'right' }}>$0.00</span>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-danger)' }}><X size={14} /></button>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--m-text-secondary)', marginBottom: '6px' }}>Notas / Instrucciones</label>
                  <textarea rows={3} placeholder="Notas adicionales para el proveedor..."
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ flex: 1, padding: '12px', backgroundColor: 'var(--m-surface-2)', color: 'var(--m-text-secondary)', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Guardar borrador
                  </button>
                  <button style={{ flex: 2, padding: '12px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Enviar Orden de Compra
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Modal */}
      {showSupModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowSupModal(false)}>
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '16px', padding: '28px', width: '560px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: 'var(--m-text)' }}>{selectedSup ? `Editar: ${selectedSup.name}` : '+ Nuevo Proveedor'}</h2>
              <button onClick={() => setShowSupModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { label: 'Razón Social', key: 'name', ph: 'TechDistrib SRL', cs: 2 },
                { label: 'Persona de contacto', key: 'contact', ph: 'Roberto Sánchez' },
                { label: 'Email', key: 'email', ph: 'ventas@proveedor.com' },
                { label: 'Teléfono', key: 'phone', ph: '+598 99 123 456' },
                { label: 'Categoría de productos', key: 'category', ph: 'Tecnología' },
                { label: 'Días de entrega (Lead time)', key: 'lead', ph: '3', type: 'number' },
                { label: 'Términos de pago', key: 'terms', ph: '30 días' },
                { label: 'Sitio web', key: 'website', ph: 'https://proveedor.com' },
              ].map(({ label, key, ph, cs, type }) => (
                <div key={key} style={{ gridColumn: cs === 2 ? '1 / -1' : 'auto' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--m-text-secondary)', marginBottom: '4px' }}>{label}</label>
                  <input type={type || 'text'} placeholder={ph} defaultValue={selectedSup ? String((selectedSup as any)[key] || '') : ''}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--m-text-secondary)', marginBottom: '8px' }}>Notas internas</label>
              <textarea rows={2} placeholder="Notas sobre este proveedor..."
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button onClick={() => setShowSupModal(false)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'var(--m-surface)', color: 'var(--m-text-secondary)', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>Cancelar</button>
              <button style={{ flex: 2, padding: '11px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem' }}>
                {selectedSup ? 'Actualizar Proveedor' : '+ Crear Proveedor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}