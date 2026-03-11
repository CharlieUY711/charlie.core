import React from 'react';
import { OrangeHeader } from '../OrangeHeader';
import { Plus, Edit2, Trash2, AlertTriangle, Loader2, ArrowUp } from 'lucide-react';
import { getInventario, createItem, updateItem, deleteItem, registrarMovimiento } from '../../../services/inventarioApi';
import { getDepositos } from '../../../services/depositosApi';
import { toast } from 'sonner';

const ORANGE = '#FF6835';

export function InventarioView({ onNavigate }: any) {
  const [items, setItems] = React.useState<any[]>([]);
  const [depositos, setDepositos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filtroDeposito, setFiltroDeposito] = React.useState('');
  const [alertasCount, setAlertasCount] = React.useState(0);
  const [showForm, setShowForm] = React.useState(false);
  const [showMov, setShowMov] = React.useState<any>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<any>({});
  const [mov, setMov] = React.useState({ tipo: 'entrada', cantidad: 0, notas: '' });
  const [saving, setSaving] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [inv, deps]: any = await Promise.all([
        getInventario({ deposito_id: filtroDeposito || undefined, search: search || undefined }),
        getDepositos(),
      ]);
      setItems(inv.data); setAlertasCount(inv.alertas_count); setDepositos(deps);
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, [filtroDeposito]);

  const save = async () => {
    if (!form.sku || !form.nombre || !form.deposito_id) return toast.error('SKU, nombre y deposito requeridos');
    setSaving(true);
    try {
      if (editing) { await updateItem(editing, form); toast.success('Actualizado'); }
      else { await createItem(form); toast.success('Creado'); }
      setShowForm(false); load();
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  const registrar = async () => {
    if (!showMov || !mov.cantidad) return toast.error('Cantidad requerida');
    setSaving(true);
    try {
      const r: any = await registrarMovimiento(showMov.id, mov as any);
      toast.success('Stock: ' + r.cantidad_anterior + ' a ' + r.cantidad_nueva);
      setShowMov(null); load();
    } catch (e: any) { toast.error(e.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--m-surface-2)' }}>
      <OrangeHeader title="Inventario" subtitle="Stock por deposito" onBack={() => onNavigate('logistica')} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {alertasCount > 0 && (
          <div style={{ background: 'var(--m-warning-bg)', border: '1px solid #F59E0B', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} style={{ color: 'var(--m-warning)' }} />
            <strong>{alertasCount} item(s) bajo stock minimo</strong>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={(e: any) => { if (e.key === 'Enter') load(); }}
            placeholder="Buscar SKU o nombre (Enter)..."
            style={{ flex: 1, minWidth: 200, padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 }}
          />
          <select value={filtroDeposito} onChange={e => setFiltroDeposito(e.target.value)}
            style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 12px', fontSize: 14 }}>
            <option value="">Todos los depositos</option>
            {depositos.map((d: any) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
          <button onClick={() => { setForm({}); setEditing(null); setShowForm(true); }}
            style={{ background: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, cursor: 'pointer' }}>
            + Nuevo
          </button>
        </div>

        {loading
          ? <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} style={{ color: ORANGE }} /></div>
          : (
            <div style={{ background: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--m-surface-2)' }}>
                    {['SKU', 'Nombre', 'Deposito', 'Stock', 'Min', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--m-text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--m-text-muted)' }}>No hay items</td></tr>
                    : items.map((item: any) => {
                        const bajo = item.cantidad <= item.cantidad_minima;
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6', background: bajo ? '#FFFBEB' : 'var(--m-surface)' }}>
                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>{item.sku}</td>
                            <td style={{ padding: '12px 16px' }}>
                              {bajo && <AlertTriangle size={13} style={{ color: 'var(--m-warning)', marginRight: 4, verticalAlign: 'middle' }} />}
                              {item.nombre}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--m-text-muted)', fontSize: 13 }}>{item.depositos?.nombre || '-'}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: bajo ? '#D97706' : 'var(--m-text)' }}>{item.cantidad}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--m-text-muted)', fontSize: 13 }}>{item.cantidad_minima}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <button onClick={() => setShowMov(item)}
                                style={{ background: 'var(--m-success-bg)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'var(--m-success)', marginRight: 4 }}>
                                <ArrowUp size={13} />
                              </button>
                              <button onClick={() => { setForm(item); setEditing(item.id); setShowForm(true); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)', marginRight: 4 }}><Edit2 size={13} /></button>
                              <button onClick={async () => { if (confirm('Eliminar?')) { await deleteItem(item.id); load(); } }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-danger)' }}><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          )
        }

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--m-surface)', borderRadius: 14, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 20px' }}>{editing ? 'Editar' : 'Nuevo'} item</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Deposito *</label>
                <select value={form.deposito_id || ''} onChange={e => setForm((p: any) => ({ ...p, deposito_id: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 14 }}>
                  <option value="">Seleccionar...</option>
                  {depositos.map((d: any) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              {[['sku','SKU *'],['nombre','Nombre *'],['categoria','Categoria'],['ubicacion','Ubicacion']].map(([k,l]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>{l}</label>
                  <input value={form[k] || ''} onChange={e => setForm((p: any) => ({ ...p, [k]: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
              {[['cantidad','Stock inicial'],['cantidad_minima','Stock minimo'],['costo_unitario','Costo unitario']].map(([k,l]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>{l}</label>
                  <input type="number" value={form[k] ?? ''} onChange={e => setForm((p: any) => ({ ...p, [k]: Number(e.target.value) }))}
                    style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={save} disabled={saving} style={{ padding: '9px 18px', background: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showMov && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--m-surface)', borderRadius: 14, padding: 28, width: '100%', maxWidth: 400 }}>
              <h3 style={{ margin: '0 0 6px' }}>Movimiento de stock</h3>
              <p style={{ margin: '0 0 20px', color: 'var(--m-text-muted)', fontSize: 14 }}>
                {showMov.nombre} — Stock actual: <strong>{showMov.cantidad}</strong>
              </p>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Tipo</label>
                <select value={mov.tipo} onChange={e => setMov((p: any) => ({ ...p, tipo: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 14 }}>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="ajuste">Ajuste (cantidad exacta)</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Cantidad</label>
                <input type="number" value={mov.cantidad} onChange={e => setMov((p: any) => ({ ...p, cantidad: Number(e.target.value) }))}
                  style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Notas</label>
                <input value={mov.notas} onChange={e => setMov((p: any) => ({ ...p, notas: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowMov(null)} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={registrar} disabled={saving} style={{ padding: '9px 18px', background: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
