/* =====================================================
   PedidosView — Gestión de pedidos eCommerce
   ===================================================== */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { toast } from 'sonner';
import { getPedidos, createPedido, updatePedidoEstado, updatePedidoEstadoPago, type Pedido, type PedidoItem } from '../../../services/pedidosApi';
import { getPersonas } from '../../../services/personasApi';
import { getOrganizaciones } from '../../../services/organizacionesApi';
import { getMetodosPago } from '../../../services/metodosPagoApi';
import { getMetodosEnvio } from '../../../services/metodosEnvioApi';
import {
  Search, RefreshCw, X, Save, Plus, Trash2,
  ShoppingCart, CheckCircle, XCircle, Truck, Package,
  Clock, ChevronRight, User, Building2, CreditCard,
  MapPin, FileText, Calendar, DollarSign, AlertCircle,
  RotateCcw, Eye,
} from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE  = '#FF6835';

interface PersonaOpt  { id: string; nombre: string; apellido?: string; email?: string }
interface OrgOpt      { id: string; nombre: string }
interface PagoOpt     { id: string; nombre: string; tipo: string }
interface EnvioOpt    { id: string; nombre: string; tipo: string; precio: number }

// ── Estado config ──────────────────────────────────
const ESTADO_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pendiente:      { label: 'Pendiente',      color: 'var(--m-warning)', bg: 'var(--m-warning-bg)', icon: Clock        },
  confirmado:     { label: 'Confirmado',     color: 'var(--m-info)', bg: 'var(--m-info-bg)', icon: CheckCircle  },
  en_preparacion: { label: 'En preparación', color: 'var(--m-purple)', bg: 'var(--m-purple-bg)', icon: Package      },
  enviado:        { label: 'Enviado',        color: 'var(--m-cyan)', bg: 'var(--m-cyan-bg)', icon: Truck        },
  entregado:      { label: 'Entregado',      color: 'var(--m-success)', bg: 'var(--m-success-bg)', icon: CheckCircle  },
  cancelado:      { label: 'Cancelado',      color: 'var(--m-danger)', bg: 'var(--m-danger-bg)', icon: XCircle      },
  devuelto:       { label: 'Devuelto',       color: 'var(--m-text-muted)', bg: 'var(--m-surface-2)', icon: RotateCcw    },
};

const PAGO_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:   { label: 'Pago pendiente', color: 'var(--m-warning)', bg: 'var(--m-warning-bg)' },
  pagado:      { label: 'Pagado',         color: 'var(--m-success)', bg: 'var(--m-success-bg)' },
  parcial:     { label: 'Parcial',        color: 'var(--m-purple)', bg: 'var(--m-purple-bg)' },
  fallido:     { label: 'Fallido',        color: 'var(--m-danger)', bg: 'var(--m-danger-bg)' },
  reembolsado: { label: 'Reembolsado',    color: 'var(--m-text-muted)', bg: 'var(--m-surface-2)' },
};

const TRANSICIONES: Record<string, string[]> = {
  pendiente:      ['confirmado', 'cancelado'],
  confirmado:     ['en_preparacion', 'cancelado'],
  en_preparacion: ['enviado', 'cancelado'],
  enviado:        ['entregado', 'cancelado'],
  entregado:      ['devuelto'],
  cancelado:      [],
  devuelto:       [],
};

const PIPELINE = ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado'];

// ── Component ─────────────────────────────────────
export function PedidosView({ onNavigate }: Props) {
  const [pedidosList, setPedidosList] = useState<Pedido[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterEstado, setFilterEstado]     = useState('');
  const [filterEstadoPago, setFilterEstadoPago] = useState('');

  // Opciones para modal
  const [personas, setPersonas]   = useState<PersonaOpt[]>([]);
  const [orgs, setOrgs]           = useState<OrgOpt[]>([]);
  const [pagos, setPagos]         = useState<PagoOpt[]>([]);
  const [envios, setEnvios]       = useState<EnvioOpt[]>([]);

  // Modales
  const [detailPedido, setDetailPedido] = useState<Pedido | null>(null);
  const [showNew, setShowNew]           = useState(false);
  const [saving, setSaving]             = useState(false);

  // Form nuevo pedido
  const emptyForm = () => ({
    cliente_persona_id: '', cliente_org_id: '',
    metodo_pago_id: '', metodo_envio_id: '',
    descuento: 0, impuestos: 0, notas: '',
    direccion_envio: { calle: '', ciudad: '', departamento: '', pais: 'Uruguay', cp: '' },
    items: [{ nombre: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }] as PedidoItem[],
  });
  const [form, setForm] = useState(emptyForm());

  // ── Fetch ──
  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPedidos({
        estado: filterEstado || undefined,
        estado_pago: filterEstadoPago || undefined,
        search: search || undefined,
      });
      setPedidosList(data);
    } catch (e: unknown) {
      console.error('Error cargando pedidos:', e);
      toast.error('Error al cargar pedidos');
    } finally { setLoading(false); }
  }, [filterEstado, filterEstadoPago, search]);

  const fetchOptions = useCallback(async () => {
    try {
      const [personasData, orgsData, pagosData, enviosData] = await Promise.all([
        getPersonas({ activo: true }),
        getOrganizaciones({ activo: true }),
        getMetodosPago({ activo: true }),
        getMetodosEnvio({ activo: true }),
      ]);
      setPersonas(personasData);
      setOrgs(orgsData);
      setPagos(pagosData);
      setEnvios(enviosData);
    } catch (e) { console.error('Error cargando opciones:', e); }
  }, []);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total     = pedidosList.length;
    const pendiente = pedidosList.filter(p => p.estado === 'pendiente').length;
    const enCurso   = pedidosList.filter(p => ['confirmado', 'en_preparacion', 'enviado'].includes(p.estado)).length;
    const entregado = pedidosList.filter(p => p.estado === 'entregado').length;
    const facturado = pedidosList.reduce((s, p) => s + (p.total ?? 0), 0);
    return { total, pendiente, enCurso, entregado, facturado };
  }, [pedidosList]);

  const pipelineCounts = useMemo(() =>
    PIPELINE.reduce((acc, e) => ({ ...acc, [e]: pedidosList.filter(p => p.estado === e).length }), {} as Record<string, number>)
  , [pedidosList]);

  // ── Item helpers ──
  const updateItem = (idx: number, field: keyof PedidoItem, val: string | number) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: val };
      if (field === 'cantidad' || field === 'precio_unitario') {
        items[idx].subtotal = items[idx].cantidad * items[idx].precio_unitario;
      }
      return { ...f, items };
    });
  };
  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { nombre: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }] }));
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const subtotalForm  = form.items.reduce((s, i) => s + i.subtotal, 0);
  const totalForm     = subtotalForm - form.descuento + form.impuestos;

  // ── Save nuevo pedido ──
  const handleSave = async () => {
    if (!form.cliente_persona_id && !form.cliente_org_id) { toast.error('Seleccioná un cliente'); return; }
    if (form.items.some(i => !i.nombre)) { toast.error('Todos los ítems deben tener nombre'); return; }
    setSaving(true);
    try {
      const body = {
        ...form,
        cliente_persona_id: form.cliente_persona_id || null,
        cliente_org_id:     form.cliente_org_id || null,
        metodo_pago_id:     form.metodo_pago_id || null,
        metodo_envio_id:    form.metodo_envio_id || null,
        subtotal: subtotalForm,
        total:    totalForm,
        items:    form.items,
      };
      const data = await createPedido(body);
      if (!data) throw new Error('No se pudo crear el pedido');
      toast.success(`Pedido ${data.numero_pedido} creado`);
      setShowNew(false);
      fetchPedidos();
    } catch (e: unknown) {
      console.error('Error creando pedido:', e);
      toast.error(`Error: ${e instanceof Error ? e.message : e}`);
    } finally { setSaving(false); }
  };

  // ── Cambiar estado ──
  const cambiarEstado = async (pedido: Pedido, nuevo_estado: string) => {
    try {
      const data = await updatePedidoEstado(pedido.id, nuevo_estado);
      if (!data) throw new Error('No se pudo actualizar el estado');
      toast.success(`Pedido → ${ESTADO_CFG[nuevo_estado]?.label}`);
      fetchPedidos();
      if (detailPedido?.id === pedido.id) setDetailPedido({ ...detailPedido, estado: nuevo_estado });
    } catch (e: unknown) {
      toast.error(`Error: ${e instanceof Error ? e.message : e}`);
    }
  };

  // ── Cambiar estado pago ──
  const cambiarEstadoPago = async (pedido: Pedido, estado_pago: string) => {
    try {
      const data = await updatePedidoEstadoPago(pedido.id, estado_pago);
      if (!data) throw new Error('No se pudo actualizar el estado de pago');
      toast.success(`Pago → ${PAGO_CFG[estado_pago]?.label}`);
      fetchPedidos();
      if (detailPedido?.id === pedido.id) setDetailPedido({ ...detailPedido, estado_pago });
    } catch (e: unknown) {
      toast.error(`Error: ${e instanceof Error ? e.message : e}`);
    }
  };

  const clienteLabel = (p: Pedido) => {
    if (p.cliente_persona) return `${p.cliente_persona.nombre} ${p.cliente_persona.apellido ?? ''}`.trim();
    if (p.cliente_org)     return p.cliente_org.nombre;
    return '—';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <OrangeHeader
        icon={ShoppingCart}
        title="Pedidos"
        subtitle="Gestión de órdenes, estados y pagos"
        actions={[{ label: '+ Nuevo Pedido', primary: true, onClick: () => { fetchOptions(); setForm(emptyForm()); setShowNew(true); } }]}
      />

      {/* ── Stats ── */}
      <div style={{ padding: '14px 28px', backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Total pedidos',   value: stats.total,                          icon: ShoppingCart, color: ORANGE     },
          { label: 'Pendientes',      value: stats.pendiente,                      icon: Clock,        color: 'var(--m-warning)'  },
          { label: 'En curso',        value: stats.enCurso,                        icon: Truck,        color: 'var(--m-info)'  },
          { label: 'Entregados',      value: stats.entregado,                      icon: CheckCircle,  color: 'var(--m-success)'  },
          { label: 'Facturado',       value: `$${stats.facturado.toLocaleString('es-UY')}`, icon: DollarSign, color: 'var(--m-purple)' },
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

      {/* ── Pipeline visual ── */}
      <div style={{ padding: '12px 28px', backgroundColor: 'var(--m-surface-2)', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto' }}>
        {PIPELINE.map((e, idx) => {
          const cfg = ESTADO_CFG[e];
          const count = pipelineCounts[e] ?? 0;
          return (
            <React.Fragment key={e}>
              <button
                onClick={() => setFilterEstado(filterEstado === e ? '' : e)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
                  borderColor: filterEstado === e ? cfg.color : 'var(--m-border)',
                  backgroundColor: filterEstado === e ? cfg.bg : 'var(--m-surface)',
                  color: cfg.color, cursor: 'pointer', whiteSpace: 'nowrap',
                  fontWeight: filterEstado === e ? 700 : 500, fontSize: '0.8rem',
                  transition: 'all 0.15s',
                }}
              >
                <cfg.icon size={13} />
                {cfg.label}
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{count}</span>
              </button>
              {idx < PIPELINE.length - 1 && <ChevronRight size={14} color="#D1D5DB" style={{ flexShrink: 0 }} />}
            </React.Fragment>
          );
        })}
        <div style={{ width: 1, height: 24, backgroundColor: 'var(--m-border)', margin: '0 4px' }} />
        {['cancelado', 'devuelto'].map(e => {
          const cfg = ESTADO_CFG[e];
          const count = pedidosList.filter(p => p.estado === e).length;
          return (
            <button
              key={e}
              onClick={() => setFilterEstado(filterEstado === e ? '' : e)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
                borderColor: filterEstado === e ? cfg.color : 'var(--m-border)',
                backgroundColor: filterEstado === e ? cfg.bg : 'var(--m-surface)',
                color: cfg.color, cursor: 'pointer', whiteSpace: 'nowrap',
                fontWeight: filterEstado === e ? 700 : 500, fontSize: '0.8rem',
              }}
            >
              <cfg.icon size={13} />
              {cfg.label} {count > 0 && <span style={{ fontWeight: 800 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Filtros ── */}
      <div style={{ padding: '10px 28px', backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--m-text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchPedidos()}
            placeholder="Buscar por nº de pedido…"
            style={{ width: '100%', paddingLeft: 30, paddingRight: 12, height: 34, border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select value={filterEstadoPago} onChange={e => setFilterEstadoPago(e.target.value)}
          style={selStyle}>
          <option value="">Todos los pagos</option>
          {Object.entries(PAGO_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={fetchPedidos} style={{ height: 34, width: 34, border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'var(--m-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={14} color="#6B7280" />
        </button>
      </div>

      {/* ── Tabla ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        {loading ? (
          <LoadingSpinner text="Cargando pedidos…" />
        ) : pedidosList.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No hay pedidos aún" sub='Creá el primero con "+ Nuevo Pedido"' />
        ) : (
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--m-surface-2)', borderBottom: '1px solid #E5E7EB' }}>
                  {['N° Pedido', 'Cliente', 'Items', 'Total', 'Estado', 'Pago', 'Fecha', ''].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--m-text-secondary)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidosList.map((p, i) => {
                  const eCfg  = ESTADO_CFG[p.estado]  ?? ESTADO_CFG.pendiente;
                  const pgCfg = PAGO_CFG[p.estado_pago] ?? PAGO_CFG.pendiente;
                  return (
                    <tr key={p.id}
                      style={{ borderBottom: i < pedidosList.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFAFA'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
                      onClick={() => setDetailPedido(p)}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 700, color: ORANGE, fontSize: '0.84rem', fontFamily: 'monospace' }}>{p.numero_pedido}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: p.cliente_persona ? '#FFF7ED' : 'var(--m-purple-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {p.cliente_persona ? <User size={14} color={ORANGE} /> : <Building2 size={14} color="#8B5CF6" />}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--m-text)', fontSize: '0.84rem' }}>{clienteLabel(p)}</p>
                            {p.cliente_persona?.email && <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{p.cliente_persona.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>
                        {(p.items?.length ?? 0)} ítem{(p.items?.length ?? 0) !== 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--m-text)', fontSize: '0.9rem' }}>
                          ${(p.total ?? 0).toLocaleString('es-UY')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, backgroundColor: eCfg.bg, color: eCfg.color, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                          {eCfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, backgroundColor: pgCfg.bg, color: pgCfg.color, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                          {pgCfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--m-text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {new Date(p.created_at).toLocaleDateString('es-UY')}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'var(--m-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Eye size={13} color="#6B7280" />
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

      {/* ── Modal Detalle ── */}
      {detailPedido && (
        <div style={overlayStyle} onClick={() => setDetailPedido(null)}>
          <div style={{ ...modalStyle, maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--m-text)' }}>
                  Pedido <span style={{ color: ORANGE, fontFamily: 'monospace' }}>{detailPedido.numero_pedido}</span>
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--m-text-muted)' }}>
                  {new Date(detailPedido.created_at).toLocaleString('es-UY')}
                </p>
              </div>
              <button onClick={() => setDetailPedido(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Estado + Pago */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: 14, backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB' }}>
                  <p style={sectionLabel}>Estado del pedido</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {(TRANSICIONES[detailPedido.estado] ?? []).map(e => {
                      const cfg = ESTADO_CFG[e];
                      return (
                        <button key={e} onClick={() => cambiarEstado(detailPedido, e)}
                          style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${cfg.color}`, backgroundColor: cfg.bg, color: cfg.color, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                          → {cfg.label}
                        </button>
                      );
                    })}
                    {(TRANSICIONES[detailPedido.estado] ?? []).length === 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>Sin transiciones disponibles</span>
                    )}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, backgroundColor: ESTADO_CFG[detailPedido.estado]?.bg, color: ESTADO_CFG[detailPedido.estado]?.color, padding: '3px 10px', borderRadius: 20 }}>
                      Actual: {ESTADO_CFG[detailPedido.estado]?.label}
                    </span>
                  </div>
                </div>
                <div style={{ padding: 14, backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB' }}>
                  <p style={sectionLabel}>Estado de pago</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {Object.keys(PAGO_CFG).filter(k => k !== detailPedido.estado_pago).map(k => {
                      const cfg = PAGO_CFG[k];
                      return (
                        <button key={k} onClick={() => cambiarEstadoPago(detailPedido, k)}
                          style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${cfg.color}`, backgroundColor: cfg.bg, color: cfg.color, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, backgroundColor: PAGO_CFG[detailPedido.estado_pago]?.bg, color: PAGO_CFG[detailPedido.estado_pago]?.color, padding: '3px 10px', borderRadius: 20 }}>
                      Actual: {PAGO_CFG[detailPedido.estado_pago]?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cliente + Métodos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <InfoBlock icon={User} label="Cliente" color="#3B82F6">
                  <p style={infoText}>{clienteLabel(detailPedido)}</p>
                  {detailPedido.cliente_persona?.email && <p style={infoSub}>{detailPedido.cliente_persona.email}</p>}
                  {detailPedido.cliente_org?.tipo && <p style={infoSub}>{detailPedido.cliente_org.tipo}</p>}
                </InfoBlock>
                <InfoBlock icon={CreditCard} label="Pago / Envío" color="#8B5CF6">
                  <p style={infoText}>{detailPedido.metodo_pago?.nombre ?? <span style={{ color: 'var(--m-border)' }}>Sin método de pago</span>}</p>
                  <p style={infoSub}>{detailPedido.metodo_envio?.nombre ?? 'Sin método de envío'}</p>
                </InfoBlock>
              </div>

              {/* Dirección */}
              {detailPedido.direccion_envio && Object.values(detailPedido.direccion_envio).some(v => v) && (
                <InfoBlock icon={MapPin} label="Dirección de envío" color="#059669">
                  <p style={infoText}>
                    {[detailPedido.direccion_envio.calle, detailPedido.direccion_envio.ciudad, detailPedido.direccion_envio.departamento, detailPedido.direccion_envio.pais].filter(Boolean).join(', ')}
                  </p>
                </InfoBlock>
              )}

              {/* Items */}
              <div>
                <p style={sectionLabel}>Ítems del pedido</p>
                <div style={{ backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB', overflow: 'hidden', marginTop: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        {['Producto', 'Cant.', 'Precio unit.', 'Subtotal'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--m-text-secondary)', fontSize: '0.76rem' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(detailPedido.items ?? []).map((item, i) => (
                        <tr key={i} style={{ borderBottom: i < (detailPedido.items?.length ?? 0) - 1 ? '1px solid #F3F4F6' : 'none' }}>
                          <td style={{ padding: '8px 12px', color: 'var(--m-text)', fontWeight: 500 }}>{item.nombre}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--m-text-muted)' }}>{item.cantidad}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--m-text-muted)' }}>${(item.precio_unitario ?? 0).toLocaleString('es-UY')}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--m-text)' }}>${(item.subtotal ?? 0).toLocaleString('es-UY')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div style={{ backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB', padding: '14px 16px' }}>
                {[
                  { label: 'Subtotal',  value: detailPedido.subtotal ?? 0,  bold: false },
                  { label: 'Descuento', value: -(detailPedido.descuento ?? 0), bold: false, color: 'var(--m-success)' },
                  { label: 'Impuestos', value: detailPedido.impuestos ?? 0,   bold: false },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.84rem', color: r.color ?? '#6B7280' }}>
                    <span>{r.label}</span>
                    <span>${r.value.toLocaleString('es-UY')}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: 'var(--m-text)' }}>
                  <span>Total</span>
                  <span style={{ color: ORANGE }}>${(detailPedido.total ?? 0).toLocaleString('es-UY')}</span>
                </div>
              </div>

              {/* Notas */}
              {detailPedido.notas && (
                <InfoBlock icon={FileText} label="Notas" color="#6B7280">
                  <p style={infoText}>{detailPedido.notas}</p>
                </InfoBlock>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Nuevo Pedido ── */}
      {showNew && (
        <div style={overlayStyle} onClick={() => setShowNew(false)}>
          <div style={{ ...modalStyle, maxWidth: 660 }} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--m-text)' }}>Nuevo Pedido</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--m-text-muted)' }}>Completá los datos del pedido</p>
              </div>
              <button onClick={() => setShowNew(false)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Cliente */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Persona cliente</label>
                  <select value={form.cliente_persona_id} onChange={e => setForm(f => ({ ...f, cliente_persona_id: e.target.value }))} style={selFormStyle}>
                    <option value="">— Sin persona —</option>
                    {personas.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido ?? ''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Organización cliente</label>
                  <select value={form.cliente_org_id} onChange={e => setForm(f => ({ ...f, cliente_org_id: e.target.value }))} style={selFormStyle}>
                    <option value="">— Sin organización —</option>
                    {orgs.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Métodos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Método de pago</label>
                  <select value={form.metodo_pago_id} onChange={e => setForm(f => ({ ...f, metodo_pago_id: e.target.value }))} style={selFormStyle}>
                    <option value="">— Sin método —</option>
                    {pagos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Método de envío</label>
                  <select value={form.metodo_envio_id} onChange={e => setForm(f => ({ ...f, metodo_envio_id: e.target.value }))} style={selFormStyle}>
                    <option value="">— Sin envío —</option>
                    {envios.map(e => <option key={e.id} value={e.id}>{e.nombre} (${e.precio})</option>)}
                  </select>
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label style={labelStyle}>Dirección de envío</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                  <input value={form.direccion_envio.calle} onChange={e => setForm(f => ({ ...f, direccion_envio: { ...f.direccion_envio, calle: e.target.value } }))} style={inputStyle} placeholder="Calle y número" />
                  <input value={form.direccion_envio.cp} onChange={e => setForm(f => ({ ...f, direccion_envio: { ...f.direccion_envio, cp: e.target.value } }))} style={inputStyle} placeholder="CP" />
                  <input value={form.direccion_envio.ciudad} onChange={e => setForm(f => ({ ...f, direccion_envio: { ...f.direccion_envio, ciudad: e.target.value } }))} style={inputStyle} placeholder="Ciudad" />
                  <input value={form.direccion_envio.departamento} onChange={e => setForm(f => ({ ...f, direccion_envio: { ...f.direccion_envio, departamento: e.target.value } }))} style={inputStyle} placeholder="Departamento" />
                </div>
              </div>

              {/* Items */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={labelStyle}>Ítems del pedido *</label>
                  <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: `1.5px solid ${ORANGE}`, background: 'var(--m-warning-bg)', color: ORANGE, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                    <Plus size={13} /> Agregar ítem
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                      <input value={item.nombre} onChange={e => updateItem(idx, 'nombre', e.target.value)} style={inputStyle} placeholder="Nombre del producto" />
                      <input type="number" value={item.cantidad} onChange={e => updateItem(idx, 'cantidad', parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Cant." min={1} />
                      <input type="number" value={item.precio_unitario} onChange={e => updateItem(idx, 'precio_unitario', parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Precio" min={0} />
                      <button onClick={() => removeItem(idx)} style={{ width: 32, height: 32, borderRadius: 6, border: '1.5px solid #FEE2E2', background: 'var(--m-danger-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={13} color="#DC2626" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descuento / Impuestos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Descuento ($)</label>
                  <input type="number" value={form.descuento} onChange={e => setForm(f => ({ ...f, descuento: parseFloat(e.target.value) || 0 }))} style={inputStyle} min={0} />
                </div>
                <div>
                  <label style={labelStyle}>Impuestos ($)</label>
                  <input type="number" value={form.impuestos} onChange={e => setForm(f => ({ ...f, impuestos: parseFloat(e.target.value) || 0 }))} style={inputStyle} min={0} />
                </div>
              </div>

              {/* Total preview */}
              <div style={{ backgroundColor: 'var(--m-warning-bg)', borderRadius: 10, border: `1.5px solid ${ORANGE}30`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--m-warning-text)', fontWeight: 600 }}>Total del pedido</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: ORANGE }}>${totalForm.toLocaleString('es-UY')}</span>
              </div>

              {/* Notas */}
              <div>
                <label style={labelStyle}>Notas internas</label>
                <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  style={{ ...inputStyle, height: 72, paddingTop: 8, resize: 'vertical' }} placeholder="Observaciones, instrucciones especiales…" />
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowNew(false)} style={cancelBtnStyle}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ ...saveBtnStyle, opacity: saving ? 0.7 : 1 }}>
                <Save size={14} /> {saving ? 'Guardando…' : 'Crear pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Helpers UI ──────────────────────────────────────
function LoadingSpinner({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: 'var(--m-text-muted)' }}>
      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} /> {text}
    </div>
  );
}
function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--m-text-muted)' }}>
      <Icon size={44} style={{ marginBottom: 12, opacity: 0.25 }} />
      <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{title}</p>
      <p style={{ fontSize: '0.875rem', marginTop: 6 }}>{sub}</p>
    </div>
  );
}
function InfoBlock({ icon: Icon, label, color, children }: { icon: React.ElementType; label: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 14, backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={12} color={color} />
        </div>
        <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: 'var(--m-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      </div>
      {children}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
const modalStyle: React.CSSProperties   = { backgroundColor: 'var(--m-surface)', borderRadius: 16, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' };
const modalHeaderStyle: React.CSSProperties = { padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 };
const closeBtnStyle: React.CSSProperties   = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)', padding: 4 };
const sectionLabel: React.CSSProperties    = { margin: 0, fontSize: '0.72rem', fontWeight: 700, color: 'var(--m-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' };
const infoText: React.CSSProperties        = { margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--m-text)' };
const infoSub: React.CSSProperties         = { margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--m-text-muted)' };
const labelStyle: React.CSSProperties      = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--m-text-secondary)', marginBottom: 5 };
const inputStyle: React.CSSProperties      = { width: '100%', height: 36, border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '0 10px', fontSize: '0.84rem', color: 'var(--m-text)', outline: 'none', boxSizing: 'border-box' };
const selStyle: React.CSSProperties        = { height: 34, border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '0 10px', fontSize: '0.84rem', color: 'var(--m-text-secondary)', cursor: 'pointer', backgroundColor: 'var(--m-surface)' };
const selFormStyle: React.CSSProperties    = { width: '100%', height: 36, border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '0 10px', fontSize: '0.84rem', color: 'var(--m-text-secondary)', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' };
const cancelBtnStyle: React.CSSProperties  = { padding: '9px 20px', borderRadius: 8, border: '1.5px solid #E5E7EB', background: 'var(--m-surface)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--m-text-secondary)' };
const saveBtnStyle: React.CSSProperties    = { padding: '9px 22px', borderRadius: 8, border: 'none', backgroundColor: 'var(--m-primary)', color: 'var(--m-surface)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 };
