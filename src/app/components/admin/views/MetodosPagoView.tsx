/* =====================================================
   MetodosPagoView — Configuración de métodos de pago
   v2.0 — Templates, campos contextuales, comisión,
          reordenamiento y vista previa de checkout
   ===================================================== */
import React, { useState, useEffect, useCallback } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { toast } from 'sonner';
import { getMetodosPago, createMetodoPago, updateMetodoPago, deleteMetodoPago, type MetodoPago } from '../../../services/metodosPagoApi';
import {
  CreditCard, Landmark, Banknote, Wallet, RefreshCw,
  Plus, X, Save, Trash2, CheckCircle, XCircle,
  Edit2, Globe, ChevronUp, ChevronDown, Eye, Percent,
  Info, Zap, ShoppingCart, Lock, Radio, AlertCircle,
} from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE  = '#FF6835';

interface FormState {
  nombre: string;
  tipo: string;
  proveedor: string;
  descripcion: string;
  comision: string;       // % como string para el input
  instrucciones: string;
  activo: boolean;
  orden: number;
}

// ── Comisión embebida en instrucciones ─────────────────────────────────────
const COMISION_MARKER = /^💳 Comisión: ([\d.]+)%\n?/;

function parseInstrucciones(raw?: string): { comision: string; instrucciones: string } {
  if (!raw) return { comision: '', instrucciones: '' };
  const m = raw.match(COMISION_MARKER);
  if (m) return { comision: m[1], instrucciones: raw.replace(m[0], '') };
  return { comision: '', instrucciones: raw };
}

function buildInstrucciones(comision: string, instrucciones: string): string {
  const c = parseFloat(comision);
  const prefix = !isNaN(c) && c > 0 ? `💳 Comisión: ${c}%\n` : '';
  return prefix + instrucciones;
}

// ── Templates rápidos ──────────────────────────────────────────────────────
interface Template {
  id: string;
  emoji: string;
  nombre: string;
  tipo: string;
  proveedor: string;
  descripcion: string;
  comision: string;
  instrucciones: string;
  color: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'mercadopago', emoji: '🛒', nombre: 'MercadoPago',
    tipo: 'pasarela', proveedor: 'mercadopago',
    descripcion: 'Pagá con tarjeta, dinero en cuenta o efectivo vía MercadoPago',
    comision: '5.99',
    instrucciones: 'Serás redirigido al sitio de MercadoPago para completar tu pago de forma segura.',
    color: '#009EE3',
  },
  {
    id: 'stripe', emoji: '💳', nombre: 'Stripe',
    tipo: 'pasarela', proveedor: 'stripe',
    descripcion: 'Tarjeta de crédito/débito internacional vía Stripe',
    comision: '2.9',
    instrucciones: 'Pagá de forma segura con tu tarjeta Visa, Mastercard o American Express.',
    color: '#635BFF',
  },
  {
    id: 'paypal', emoji: '🅿️', nombre: 'PayPal',
    tipo: 'pasarela', proveedor: 'paypal',
    descripcion: 'Pago internacional vía cuenta PayPal',
    comision: '3.4',
    instrucciones: 'Serás redirigido a PayPal para completar tu pago.',
    color: '#003087',
  },
  {
    id: 'transferencia', emoji: '🏦', nombre: 'Transferencia Bancaria',
    tipo: 'transferencia', proveedor: '',
    descripcion: 'Transferencia directa a cuenta bancaria',
    comision: '0',
    instrucciones: 'Banco: \nCBU/CVU: \nAlias: \nTitular: \n\nEnviá el comprobante por WhatsApp al confirmar el pedido.',
    color: 'var(--m-success)',
  },
  {
    id: 'abitab', emoji: '🏪', nombre: 'Abitab',
    tipo: 'efectivo', proveedor: 'abitab',
    descripcion: 'Pago en efectivo en cualquier local Abitab del país',
    comision: '0',
    instrucciones: 'Al confirmar tu pedido recibirás el número de operación para abonar en cualquier local Abitab.',
    color: 'var(--m-warning)',
  },
  {
    id: 'redpagos', emoji: '🔴', nombre: 'RedPagos',
    tipo: 'efectivo', proveedor: 'redpagos',
    descripcion: 'Pago en efectivo en locales RedPagos',
    comision: '0',
    instrucciones: 'Al confirmar tu pedido recibirás el código para abonar en cualquier local RedPagos.',
    color: '#E30613',
  },
  {
    id: 'efectivo', emoji: '💵', nombre: 'Efectivo contra entrega',
    tipo: 'efectivo', proveedor: '',
    descripcion: 'Pagás en efectivo al recibir el pedido',
    comision: '0',
    instrucciones: 'Por favor tener el monto exacto preparado al momento de la entrega.',
    color: 'var(--m-text-muted)',
  },
];

// ── Hints contextuales ─────────────────────────────────────────────────────
const TIPO_HINTS: Record<string, { placeholder: string; infoBox?: string }> = {
  transferencia: {
    placeholder: 'Banco: \nCBU/CVU: \nAlias: \nTitular: \n\nDescripción adicional...',
    infoBox: 'Completá los datos bancarios para que el cliente pueda realizar la transferencia. Pedile que envíe el comprobante.',
  },
  efectivo: {
    placeholder: 'Ej: Tener el monto exacto. / Dirección: ... / Horario: ...',
    infoBox: 'Indicá cómo y dónde se realiza el pago en efectivo.',
  },
  pasarela: {
    placeholder: 'Mensaje al cliente sobre el proceso de pago online.',
    infoBox: '⚙️ Las credenciales de API (Access Token, Public Key, etc.) se configuran como Variables de Entorno en el servidor — no se guardan aquí.',
  },
  credito: {
    placeholder: 'Información sobre financiación, cuotas o condiciones.',
  },
  otro: {
    placeholder: 'Instrucciones para el cliente...',
  },
};

const TIPO_ICON: Record<string, React.ElementType> = {
  pasarela: Globe, transferencia: Landmark, efectivo: Banknote, credito: CreditCard, otro: Wallet,
};

const PROVEEDOR_COLOR: Record<string, string> = {
  mercadopago: '#009EE3', stripe: '#635BFF', paypal: '#003087',
  redpagos: '#E30613', abitab: 'var(--m-warning)', otro: 'var(--m-text-muted)',
};

const TIPOS = [
  { value: 'pasarela',      label: 'Pasarela online'   },
  { value: 'transferencia', label: 'Transferencia'      },
  { value: 'efectivo',      label: 'Efectivo'           },
  { value: 'credito',       label: 'Tarjeta de crédito' },
  { value: 'otro',          label: 'Otro'               },
];

const PROVEEDORES = [
  { value: 'mercadopago', label: 'MercadoPago' },
  { value: 'stripe',      label: 'Stripe'      },
  { value: 'paypal',      label: 'PayPal'      },
  { value: 'redpagos',    label: 'RedPagos'    },
  { value: 'abitab',      label: 'Abitab'      },
  { value: 'otro',        label: 'Otro'        },
];

const emptyForm = (): FormState => ({
  nombre: '', tipo: 'pasarela', proveedor: '', descripcion: '',
  comision: '', instrucciones: '', activo: true, orden: 0,
});

// ══════════════════════════════════════════════════════════════════════════════
export function MetodosPagoView({ onNavigate }: Props) {
  const [metodos, setMetodos]         = useState<MetodoPago[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState<FormState>(emptyForm());
  const [saving, setSaving]           = useState(false);
  const [reordering, setReordering]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<MetodoPago | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);

  const fetchMetodos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMetodosPago();
      setMetodos(data);
    } catch (e: unknown) {
      console.error('Error cargando métodos de pago:', e);
      toast.error('Error al cargar métodos de pago');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMetodos(); }, [fetchMetodos]);

  // ── Abrir form ─────────────────────────────────────────────────────────
  const openNew = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (m: MetodoPago) => {
    const { comision, instrucciones } = parseInstrucciones(m.instrucciones);
    setEditId(m.id);
    setForm({
      nombre: m.nombre, tipo: m.tipo, proveedor: m.proveedor ?? '',
      descripcion: m.descripcion ?? '', comision, instrucciones,
      activo: m.activo, orden: m.orden,
    });
    setShowModal(true);
  };

  const applyTemplate = (t: Template) => {
    setEditId(null);
    setForm({
      nombre: t.nombre, tipo: t.tipo, proveedor: t.proveedor,
      descripcion: t.descripcion, comision: t.comision,
      instrucciones: t.instrucciones, activo: true, orden: metodos.length,
    });
    setShowModal(true);
  };

  // ── Cuando cambia el tipo: auto-fill instrucciones si está vacío ──────
  const handleTipoChange = (tipo: string) => {
    setForm(f => {
      const hint = TIPO_HINTS[tipo]?.placeholder ?? '';
      return {
        ...f, tipo,
        instrucciones: f.instrucciones ? f.instrucciones : hint,
      };
    });
  };

  // ── Guardar ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return; }
    setSaving(true);
    try {
      const instruccionesFull = buildInstrucciones(form.comision, form.instrucciones);
      const body = {
        nombre: form.nombre, tipo: form.tipo,
        proveedor: form.proveedor || null,
        descripcion: form.descripcion,
        instrucciones: instruccionesFull,
        activo: form.activo, orden: form.orden,
      };
      if (editId) {
        const data = await updateMetodoPago(editId, body);
        if (!data) throw new Error('No se pudo actualizar el método');
      } else {
        const data = await createMetodoPago(body);
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

  // ── Toggle activo ──────────────────────────────────────────────────────
  const toggleActivo = async (m: MetodoPago) => {
    try {
      const data = await updateMetodoPago(m.id, { activo: !m.activo });
      if (!data) throw new Error('No se pudo actualizar');
      toast.success(m.activo ? 'Método desactivado' : 'Método activado');
      fetchMetodos();
    } catch { toast.error('Error al actualizar'); }
  };

  // ── Eliminar ───────────────────────────────────────────────────────────
  const handleDelete = async (m: MetodoPago) => {
    try {
      const ok = await deleteMetodoPago(m.id);
      if (!ok) throw new Error('No se pudo eliminar');
      toast.success('Método eliminado');
      setConfirmDelete(null);
      fetchMetodos();
    } catch { toast.error('Error al eliminar'); }
  };

  // ── Reordenar ──────────────────────────────────────────────────────────
  const handleReorder = async (m: MetodoPago, dir: 'up' | 'down') => {
    const sorted = [...metodos].sort((a, b) => a.orden - b.orden);
    const idx    = sorted.findIndex(x => x.id === m.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const sibling = sorted[swapIdx];
    const tmpOrden = m.orden;

    setReordering(true);
    try {
      await Promise.all([
        updateMetodoPago(m.id, { orden: sibling.orden }),
        updateMetodoPago(sibling.id, { orden: tmpOrden }),
      ]);
      fetchMetodos();
    } catch { toast.error('Error al reordenar'); }
    finally { setReordering(false); }
  };

  const sortedMetodos = [...metodos].sort((a, b) => a.orden - b.orden);
  const activos   = metodos.filter(m => m.activo).length;
  const inactivos = metodos.filter(m => !m.activo).length;

  const hint = TIPO_HINTS[form.tipo];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <OrangeHeader
        icon={CreditCard}
        title="Métodos de Pago"
        subtitle="Configuración de pasarelas y formas de pago disponibles"
        actions={[
          { label: '👁 Vista previa',  primary: false, onClick: () => setShowPreview(true) },
          { label: '+ Nuevo Método',   primary: true,  onClick: openNew },
        ]}
      />

      {/* Stats */}
      <div style={{ padding: '12px 28px', backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 12 }}>
        {[
          { label: 'Total métodos', value: metodos.length, icon: CreditCard,  color: ORANGE    },
          { label: 'Activos',       value: activos,        icon: CheckCircle, color: 'var(--m-success)' },
          { label: 'Inactivos',     value: inactivos,      icon: XCircle,     color: 'var(--m-danger)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={15} color={s.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--m-text)', lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--m-text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Templates rápidos */}
      <div style={{ backgroundColor: 'var(--m-warning-bg)', borderBottom: '1px solid #FEE9D7' }}>
        <button
          onClick={() => setShowTemplates(t => !t)}
          style={{ width: '100%', padding: '8px 28px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}
        >
          <Zap size={14} color={ORANGE} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: ORANGE }}>Templates rápidos</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--m-text-muted)', marginLeft: 4 }}>— clic para agregar un método pre-configurado</span>
          <ChevronDown size={14} color={ORANGE} style={{ marginLeft: 'auto', transform: showTemplates ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>

        {showTemplates && (
          <div style={{ padding: '0 28px 14px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 10,
                  border: `1.5px solid ${t.color}30`,
                  backgroundColor: t.color + '10',
                  cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = t.color + '22')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = t.color + '10')}
              >
                <span style={{ fontSize: '1.1rem' }}>{t.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: t.color }}>{t.nombre}</p>
                  {parseFloat(t.comision) > 0 && (
                    <p style={{ margin: 0, fontSize: '0.66rem', color: 'var(--m-text-muted)' }}>{t.comision}% comisión</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        {loading ? (
          <LoadingSpinner />
        ) : sortedMetodos.length === 0 ? (
          <EmptyState onApplyTemplate={() => applyTemplate(TEMPLATES[0])} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16 }}>
            {sortedMetodos.map((m, idx) => {
              const TipoIcon  = TIPO_ICON[m.tipo] ?? Wallet;
              const provColor = PROVEEDOR_COLOR[m.proveedor ?? ''] ?? '#6B7280';
              const { comision, instrucciones } = parseInstrucciones(m.instrucciones);
              return (
                <div key={m.id} style={{
                  backgroundColor: 'var(--m-surface)', borderRadius: 14,
                  border: `1.5px solid ${m.activo ? '#E5E7EB' : 'var(--m-surface-2)'}`,
                  padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
                  opacity: m.activo ? 1 : 0.65,
                  boxShadow: m.activo ? '0 1px 6px rgba(0,0,0,0.06)' : 'none',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Reorder */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <button onClick={() => handleReorder(m, 'up')} disabled={idx === 0 || reordering}
                          style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid #E5E7EB', background: idx === 0 ? '#F9FAFB' : 'var(--m-surface)', cursor: idx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                          <ChevronUp size={12} color={idx === 0 ? '#D1D5DB' : 'var(--m-text-secondary)'} />
                        </button>
                        <button onClick={() => handleReorder(m, 'down')} disabled={idx === sortedMetodos.length - 1 || reordering}
                          style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid #E5E7EB', background: idx === sortedMetodos.length - 1 ? '#F9FAFB' : 'var(--m-surface)', cursor: idx === sortedMetodos.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                          <ChevronDown size={12} color={idx === sortedMetodos.length - 1 ? '#D1D5DB' : 'var(--m-text-secondary)'} />
                        </button>
                      </div>
                      <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: provColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <TipoIcon size={20} color={provColor} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--m-text)', fontSize: '0.95rem' }}>{m.nombre}</p>
                        <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, backgroundColor: 'var(--m-surface-2)', color: 'var(--m-text-muted)', padding: '2px 7px', borderRadius: 20 }}>
                            {TIPOS.find(t => t.value === m.tipo)?.label ?? m.tipo}
                          </span>
                          {m.proveedor && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: provColor + '18', color: provColor, padding: '2px 7px', borderRadius: 20 }}>
                              {PROVEEDORES.find(p => p.value === m.proveedor)?.label ?? m.proveedor}
                            </span>
                          )}
                          {comision && parseFloat(comision) > 0 && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--m-warning-bg)', color: ORANGE, padding: '2px 7px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Percent size={9} /> {comision}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => toggleActivo(m)}
                      style={{ padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, backgroundColor: m.activo ? '#D1FAE5' : 'var(--m-danger-bg)', color: m.activo ? '#059669' : 'var(--m-danger)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {m.activo ? '● Activo' : '● Inactivo'}
                    </button>
                  </div>

                  {m.descripcion && (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--m-text-muted)', lineHeight: 1.5 }}>{m.descripcion}</p>
                  )}

                  {instrucciones && (
                    <div style={{ padding: '8px 12px', backgroundColor: 'var(--m-warning-bg)', borderRadius: 8, border: '1px solid #FDE68A' }}>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--m-warning-text)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                        <strong>Instrucciones:</strong>{'\n'}{instrucciones}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button onClick={() => openEdit(m)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 8, border: '1.5px solid #E5E7EB', background: 'var(--m-surface-2)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--m-text-secondary)' }}>
                      <Edit2 size={13} /> Editar
                    </button>
                    <button onClick={() => setConfirmDelete(m)}
                      style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid #FEE2E2', background: 'var(--m-danger-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={14} color="#DC2626" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal Formulario ─────────────────────────────────────────── */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={{ ...modalStyle, maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--m-text)' }}>
                {editId ? 'Editar método de pago' : 'Nuevo método de pago'}
              </h2>
              <button onClick={() => setShowModal(false)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '70vh', overflowY: 'auto' }}>

              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  style={inputStyle} placeholder="Ej: MercadoPago, Transferencia Bancaria…" />
              </div>

              {/* Tipo + Proveedor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Tipo *</label>
                  <select value={form.tipo} onChange={e => handleTipoChange(e.target.value)} style={selStyle}>
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Proveedor</label>
                  <select value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))} style={selStyle}>
                    <option value="">— Sin proveedor —</option>
                    {PROVEEDORES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label style={labelStyle}>Descripción visible al cliente</label>
                <input value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  style={inputStyle} placeholder="Breve descripción del método de pago" />
              </div>

              {/* Comisión */}
              <div>
                <label style={labelStyle}>Comisión del proveedor (%)</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" step="0.01" min="0" max="100"
                    value={form.comision}
                    onChange={e => setForm(f => ({ ...f, comision: e.target.value }))}
                    style={{ ...inputStyle, paddingRight: 36 }}
                    placeholder="Ej: 3.5 (dejar vacío si es gratis)" />
                  <Percent size={14} color="#9CA3AF" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>
                  Comisión que el proveedor cobra por transacción. Solo informativo.
                </p>
              </div>

              {/* Info box contextual */}
              {hint?.infoBox && (
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--m-info-bg)', borderRadius: 8, border: '1px solid #BFDBFE', display: 'flex', gap: 8 }}>
                  <Info size={15} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--m-info-text)', lineHeight: 1.5 }}>{hint.infoBox}</p>
                </div>
              )}

              {/* Instrucciones */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label style={{ ...labelStyle, margin: 0 }}>Instrucciones de pago</label>
                  {hint?.placeholder && !form.instrucciones && (
                    <button
                      onClick={() => setForm(f => ({ ...f, instrucciones: hint.placeholder! }))}
                      style={{ fontSize: '0.7rem', color: ORANGE, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      + Template
                    </button>
                  )}
                </div>
                <textarea value={form.instrucciones}
                  onChange={e => setForm(f => ({ ...f, instrucciones: e.target.value }))}
                  style={{ ...inputStyle, height: 90, paddingTop: 8, resize: 'vertical' }}
                  placeholder={hint?.placeholder ?? 'Instrucciones para el cliente…'} />
              </div>

              {/* Orden + Activo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Orden de visualización</label>
                  <input type="number" value={form.orden}
                    onChange={e => setForm(f => ({ ...f, orden: parseInt(e.target.value) || 0 }))}
                    style={inputStyle} min={0} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--m-text-secondary)' }}>
                    <input type="checkbox" checked={form.activo}
                      onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: ORANGE }} />
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

      {/* ── Modal Vista Previa Checkout ──────────────────────────────── */}
      {showPreview && (
        <div style={overlayStyle} onClick={() => setShowPreview(false)}>
          <div style={{ ...modalStyle, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={16} color={ORANGE} />
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--m-text)' }}>Vista previa — Checkout</h2>
              </div>
              <button onClick={() => setShowPreview(false)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Mock checkout card */}
              <div style={{ backgroundColor: 'var(--m-surface-2)', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                {/* Header mock */}
                <div style={{ backgroundColor: ORANGE, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={16} color="#fff" />
                  <span style={{ color: 'var(--m-surface)', fontWeight: 700, fontSize: '0.9rem' }}>Forma de pago</span>
                </div>

                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sortedMetodos.filter(m => m.activo).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--m-text-muted)' }}>
                      <AlertCircle size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No hay métodos activos</p>
                    </div>
                  ) : (
                    sortedMetodos.filter(m => m.activo).map((m, idx) => {
                      const TipoIcon  = TIPO_ICON[m.tipo] ?? Wallet;
                      const provColor = PROVEEDOR_COLOR[m.proveedor ?? ''] ?? '#6B7280';
                      const { comision, instrucciones } = parseInstrucciones(m.instrucciones);
                      return (
                        <label key={m.id} style={{
                          display: 'flex', gap: 12, padding: '12px 14px',
                          backgroundColor: idx === 0 ? '#fff' : 'var(--m-surface)',
                          border: `1.5px solid ${idx === 0 ? ORANGE : 'var(--m-border)'}`,
                          borderRadius: 10, cursor: 'pointer',
                          boxShadow: idx === 0 ? `0 0 0 3px ${ORANGE}22` : 'none',
                        }}>
                          <div style={{ paddingTop: 2 }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%',
                              border: `2px solid ${idx === 0 ? ORANGE : 'var(--m-border)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {idx === 0 && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: ORANGE }} />}
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: provColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <TipoIcon size={14} color={provColor} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--m-text)' }}>{m.nombre}</span>
                              </div>
                              {comision && parseFloat(comision) > 0 && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--m-text-muted)', whiteSpace: 'nowrap' }}>+{comision}%</span>
                              )}
                            </div>
                            {m.descripcion && (
                              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--m-text-muted)' }}>{m.descripcion}</p>
                            )}
                            {idx === 0 && instrucciones && (
                              <div style={{ marginTop: 8, padding: '8px 10px', backgroundColor: 'var(--m-warning-bg)', borderRadius: 7, border: '1px solid #FDE68A' }}>
                                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--m-warning-text)', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{instrucciones}</p>
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                <div style={{ padding: '0 16px 16px' }}>
                  <button style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: 'none', backgroundColor: ORANGE, color: 'var(--m-surface)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Lock size={15} /> Confirmar pedido
                  </button>
                </div>
              </div>

              <p style={{ margin: '12px 0 0', fontSize: '0.75rem', color: 'var(--m-text-muted)', textAlign: 'center' }}>
                Solo se muestran los métodos <strong>activos</strong>, en el orden configurado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ───────────────────────────────────────────── */}
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
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: 'var(--m-text-muted)' }}>
      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} /> Cargando…
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

function EmptyState({ onApplyTemplate }: { onApplyTemplate: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--m-text-muted)' }}>
      <CreditCard size={44} style={{ marginBottom: 12, opacity: 0.25 }} />
      <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--m-text-secondary)' }}>No hay métodos de pago</p>
      <p style={{ fontSize: '0.875rem', marginTop: 6 }}>Usá los templates de arriba o hacé clic aquí:</p>
      <button onClick={onApplyTemplate}
        style={{ marginTop: 10, padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: ORANGE, color: 'var(--m-surface)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
        🛒 Agregar MercadoPago
      </button>
    </div>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────
const overlayStyle: React.CSSProperties     = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
const modalStyle: React.CSSProperties       = { backgroundColor: 'var(--m-surface)', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' };
const modalHeaderStyle: React.CSSProperties = { padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
const modalFooterStyle: React.CSSProperties = { padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 10 };
const closeBtnStyle: React.CSSProperties    = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)' };
const labelStyle: React.CSSProperties       = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--m-text-secondary)', marginBottom: 5 };
const inputStyle: React.CSSProperties       = { width: '100%', height: 36, border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '0 10px', fontSize: '0.84rem', color: 'var(--m-text)', outline: 'none', boxSizing: 'border-box' };
const selStyle: React.CSSProperties         = { width: '100%', height: 36, border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '0 10px', fontSize: '0.84rem', color: 'var(--m-text-secondary)', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' };
const cancelBtnStyle: React.CSSProperties   = { padding: '9px 20px', borderRadius: 8, border: '1.5px solid #E5E7EB', background: 'var(--m-surface)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--m-text-secondary)' };
const saveBtnStyle: React.CSSProperties     = { padding: '9px 22px', borderRadius: 8, border: 'none', backgroundColor: ORANGE, color: 'var(--m-surface)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 };
