/* =====================================================
   MetodosEnvioView — Configuración de métodos de envío
   ===================================================== */
import React, { useState, useEffect, useCallback } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { toast } from 'sonner';
import { getMetodosEnvio, createMetodoEnvio, updateMetodoEnvio, deleteMetodoEnvio, type MetodoEnvio } from '../../../services/metodosEnvioApi';
import {
  Truck, Package, MapPin, Clock, DollarSign,
  RefreshCw, Plus, X, Save, Trash2, Edit2,
  CheckCircle, XCircle, Home, Globe,
} from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE  = '#FF6835';

const TIPOS = [
  { value: 'flat_rate',     label: 'Tarifa fija',    icon: DollarSign, color: 'var(--m-info)' },
  { value: 'gratis',        label: 'Envío gratis',   icon: Package,    color: 'var(--m-success)' },
  { value: 'calculado',     label: 'Calculado',      icon: Globe,      color: 'var(--m-purple)' },
  { value: 'retiro_local',  label: 'Retiro en local',icon: Home,       color: ORANGE    },
];

const emptyForm = () => ({
  nombre: '', tipo: 'flat_rate', precio: 0, zona: '',
  tiempo_estimado: '', descripcion: '', activo: true, orden: 0,
});

export function MetodosEnvioView({ onNavigate }: Props) {
  const [metodos, setMetodos]     = useState<MetodoEnvio[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<MetodoEnvio | null>(null);

  const fetchMetodos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMetodosEnvio();
      setMetodos(data);
    } catch (e: unknown) {
      console.error('Error cargando métodos de envío:', e);
      toast.error('Error al cargar métodos de envío');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMetodos(); }, [fetchMetodos]);

  const openNew = () => { setEditId(null); setForm(emptyForm()); setShowModal(true); };
  const openEdit = (m: MetodoEnvio) => {
    setEditId(m.id);
    setForm({ nombre: m.nombre, tipo: m.tipo, precio: m.precio, zona: m.zona ?? '', tiempo_estimado: m.tiempo_estimado ?? '', descripcion: m.descripcion ?? '', activo: m.activo, orden: m.orden });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nombre) { toast.error('El nombre es requerido'); return; }
    setSaving(true);
    try {
      const body = { ...form, zona: form.zona || null, tiempo_estimado: form.tiempo_estimado || null, descripcion: form.descripcion || null };
      if (editId) {
        const data = await updateMetodoEnvio(editId, body);
        if (!data) throw new Error('No se pudo actualizar el método');
      } else {
        const data = await createMetodoEnvio(body);
        if (!data) throw new Error('No se pudo crear el método');
      }
      toast.success(editId ? 'Método actualizado' : 'Método creado');
      setShowModal(false);
      fetchMetodos();
    } catch (e: unknown) {
      console.error('Error guardando método:', e);
      toast.error(`Error: ${e instanceof Error ? e.message : e}`);
    } finally { setSaving(false); }
  };

  const toggleActivo = async (m: MetodoEnvio) => {
    try {
      const data = await updateMetodoEnvio(m.id, { activo: !m.activo });
      if (!data) throw new Error('No se pudo actualizar');
      toast.success(m.activo ? 'Método desactivado' : 'Método activado');
      fetchMetodos();
    } catch { toast.error('Error al actualizar'); }
  };

  const handleDelete = async (m: MetodoEnvio) => {
    try {
      const ok = await deleteMetodoEnvio(m.id);
      if (!ok) throw new Error('No se pudo eliminar');
      toast.success('Método eliminado');
      setConfirmDelete(null);
      fetchMetodos();
    } catch { toast.error('Error al eliminar'); }
  };

  const activos   = metodos.filter(m => m.activo).length;
  const inactivos = metodos.filter(m => !m.activo).length;
  const tipoActual = TIPOS.find(t => t.value === form.tipo);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Truck}
        title="Métodos de Envío"
        subtitle="Zonas, tarifas y opciones de entrega disponibles"
        actions={[{ label: '+ Nuevo Método', primary: true, onClick: openNew }]}
      />

      {/* Stats */}
      <div style={{ padding: '14px 28px', backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 12 }}>
        {[
          { label: 'Total métodos', value: metodos.length, icon: Truck,        color: ORANGE    },
          { label: 'Activos',       value: activos,        icon: CheckCircle,  color: 'var(--m-success)' },
          { label: 'Inactivos',     value: inactivos,      icon: XCircle,      color: 'var(--m-danger)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={16} color={s.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--m-text)', lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--m-text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: 'var(--m-text-muted)' }}>
            <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} /> Cargando…
          </div>
        ) : metodos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--m-text-muted)' }}>
            <Truck size={44} style={{ marginBottom: 12, opacity: 0.25 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>No hay métodos de envío</p>
            <p style={{ fontSize: '0.875rem', marginTop: 6 }}>Agregá el primero con "+ Nuevo Método"</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--m-surface-2)', borderBottom: '1px solid #E5E7EB' }}>
                  {['Método', 'Tipo', 'Precio', 'Zona', 'Tiempo estimado', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--m-text-secondary)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metodos.map((m, i) => {
                  const tipoCfg = TIPOS.find(t => t.value === m.tipo);
                  const TIcon   = tipoCfg?.icon ?? Truck;
                  return (
                    <tr key={m.id}
                      style={{ borderBottom: i < metodos.length - 1 ? '1px solid #F3F4F6' : 'none', opacity: m.activo ? 1 : 0.55 }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFAFA'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: (tipoCfg?.color ?? '#6B7280') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <TIcon size={16} color={tipoCfg?.color ?? '#6B7280'} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--m-text)', fontSize: '0.875rem' }}>{m.nombre}</p>
                            {m.descripcion && <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{m.descripcion}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, backgroundColor: (tipoCfg?.color ?? '#6B7280') + '18', color: tipoCfg?.color ?? '#6B7280', padding: '3px 9px', borderRadius: 20 }}>
                          {tipoCfg?.label ?? m.tipo}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: m.tipo === 'gratis' ? '#059669' : 'var(--m-text)' }}>
                        {m.tipo === 'gratis' ? 'Gratis' : `$${(m.precio ?? 0).toLocaleString('es-UY')}`}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>
                        {m.zona ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} /> {m.zona}
                          </div>
                        ) : <span style={{ color: 'var(--m-border)' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>
                        {m.tiempo_estimado ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} /> {m.tiempo_estimado}
                          </div>
                        ) : <span style={{ color: 'var(--m-border)' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => toggleActivo(m)}
                          style={{ padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700, backgroundColor: m.activo ? '#D1FAE5' : 'var(--m-danger-bg)', color: m.activo ? '#059669' : 'var(--m-danger)' }}>
                          {m.activo ? '● Activo' : '● Inactivo'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(m)}
                            style={{ width: 30, height: 30, borderRadius: 6, border: '1.5px solid #E5E7EB', background: 'var(--m-surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Edit2 size={13} color="#374151" />
                          </button>
                          <button onClick={() => setConfirmDelete(m)}
                            style={{ width: 30, height: 30, borderRadius: 6, border: '1.5px solid #FEE2E2', background: 'var(--m-danger-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={13} color="#DC2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal form */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--m-text)' }}>
                {editId ? 'Editar método de envío' : 'Nuevo método de envío'}
              </h2>
              <button onClick={() => setShowModal(false)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={inputStyle} placeholder="Ej: Envío estándar, Retiro en local…" />
              </div>

              {/* Tipo selector visual */}
              <div>
                <label style={labelStyle}>Tipo *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {TIPOS.map(t => (
                    <button key={t.value} onClick={() => setForm(f => ({ ...f, tipo: t.value }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                        borderRadius: 8, border: `1.5px solid ${form.tipo === t.value ? t.color : 'var(--m-border)'}`,
                        backgroundColor: form.tipo === t.value ? t.color + '12' : 'var(--m-surface-2)',
                        cursor: 'pointer', color: form.tipo === t.value ? t.color : 'var(--m-text-secondary)',
                        fontWeight: form.tipo === t.value ? 700 : 500, fontSize: '0.84rem',
                      }}>
                      <t.icon size={15} color={form.tipo === t.value ? t.color : 'var(--m-text-muted)'} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>
                    Precio ($) {form.tipo === 'gratis' && <span style={{ color: 'var(--m-success)', fontWeight: 400 }}>— automático $0</span>}
                  </label>
                  <input type="number" value={form.tipo === 'gratis' ? 0 : form.precio}
                    onChange={e => setForm(f => ({ ...f, precio: parseFloat(e.target.value) || 0 }))}
                    style={{ ...inputStyle, backgroundColor: form.tipo === 'gratis' ? '#F3F4F6' : 'var(--m-surface)' }}
                    min={0} disabled={form.tipo === 'gratis'} />
                </div>
                <div>
                  <label style={labelStyle}>Tiempo estimado</label>
                  <input value={form.tiempo_estimado} onChange={e => setForm(f => ({ ...f, tiempo_estimado: e.target.value }))} style={inputStyle} placeholder="Ej: 2-3 días hábiles" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Zona de cobertura</label>
                <input value={form.zona} onChange={e => setForm(f => ({ ...f, zona: e.target.value }))} style={inputStyle} placeholder="Ej: Todo el país, Montevideo, Interior…" />
              </div>
              <div>
                <label style={labelStyle}>Descripción</label>
                <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} style={inputStyle} placeholder="Info adicional para el cliente" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Orden</label>
                  <input type="number" value={form.orden} onChange={e => setForm(f => ({ ...f, orden: parseInt(e.target.value) || 0 }))} style={inputStyle} min={0} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--m-text-secondary)' }}>
                    <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} style={{ width: 16, height: 16, accentColor: ORANGE }} />
                    Método activo
                  </label>
                </div>
              </div>
            </div>
            <div style={modalFooterStyle}>
              <button onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ ...saveBtnStyle, opacity: saving ? 0.7 : 1 }}>
                <Save size={14} /> {saving ? 'Guardando…' : editId ? 'Actualizar' : 'Crear método'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div style={overlayStyle} onClick={() => setConfirmDelete(null)}>
          <div style={{ ...modalStyle, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 28, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--m-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={24} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--m-text)' }}>¿Eliminar método?</h3>
                <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: 'var(--m-text-muted)' }}>
                  Se eliminará <strong>{confirmDelete.nombre}</strong>. Esta acción no se puede deshacer.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button onClick={() => setConfirmDelete(null)} style={{ ...cancelBtnStyle, flex: 1 }}>Cancelar</button>
                <button onClick={() => handleDelete(confirmDelete)}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', backgroundColor: 'var(--m-danger)', color: 'var(--m-surface)', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

const overlayStyle: React.CSSProperties     = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
const modalStyle: React.CSSProperties       = { backgroundColor: 'var(--m-surface)', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' };
const modalHeaderStyle: React.CSSProperties = { padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
const modalFooterStyle: React.CSSProperties = { padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 10 };
const closeBtnStyle: React.CSSProperties    = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)' };
const labelStyle: React.CSSProperties       = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--m-text-secondary)', marginBottom: 5 };
const inputStyle: React.CSSProperties       = { width: '100%', height: 36, border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '0 10px', fontSize: '0.84rem', color: 'var(--m-text)', outline: 'none', boxSizing: 'border-box' };
const cancelBtnStyle: React.CSSProperties   = { padding: '9px 20px', borderRadius: 8, border: '1.5px solid #E5E7EB', background: 'var(--m-surface)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--m-text-secondary)' };
const saveBtnStyle: React.CSSProperties     = { padding: '9px 22px', borderRadius: 8, border: 'none', backgroundColor: 'var(--m-primary)', color: 'var(--m-surface)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 };
