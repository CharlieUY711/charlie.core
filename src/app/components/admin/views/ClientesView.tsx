/* =====================================================
   ClientesView — Personas y Organizaciones con rol 'cliente'
   ===================================================== */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { toast } from 'sonner';
import { getPersonas, type Persona } from '../../../services/personasApi';
import { getOrganizaciones } from '../../../services/organizacionesApi';
import {
  Search, User, Building2, Mail, Phone, RefreshCw,
  Plus, X, Save, CheckCircle, XCircle, Tag, Users,
  ShoppingBag, Calendar, ChevronRight,
} from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE = '#FF6835';

interface PersonaOption { id: string; nombre: string; apellido?: string; email?: string; }
interface OrgOption     { id: string; nombre: string; }

type Tab = 'personas' | 'organizaciones';

export function ClientesView({ onNavigate }: Props) {
  const [personasClientes, setPersonasClientes] = useState<Persona[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<Tab>('personas');
  const [search, setSearch]         = useState('');
  const [filterActivo, setFilterActivo] = useState<boolean | undefined>(true);

  // Modal
  const [showModal, setShowModal]   = useState(false);
  const [personas, setPersonas]     = useState<PersonaOption[]>([]);
  const [orgs, setOrgs]             = useState<OrgOption[]>([]);
  const [form, setForm]             = useState({ persona_id: '', organizacion_id: '', contexto: '', activo: true });
  const [saving, setSaving]         = useState(false);

  /* ── Fetch personas con rol cliente ── */
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPersonas({
        rol: 'cliente',
        activo: filterActivo,
      });
      setPersonasClientes(data);
    } catch (e: unknown) {
      console.error('Error cargando clientes:', e);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [filterActivo]);

  const fetchOptions = useCallback(async () => {
    try {
      const [personasData, orgsData] = await Promise.all([
        getPersonas({ activo: true }),
        getOrganizaciones({ activo: true }),
      ]);
      setPersonas(personasData);
      setOrgs(orgsData);
    } catch (e) { console.error('Error cargando opciones:', e); }
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  /* ── Search filter ── */
  const filteredPersonas = useMemo(() => personasClientes.filter(p => {
    if (!search) return true;
    const full  = `${p.nombre ?? ''} ${p.apellido ?? ''}`.toLowerCase();
    const email = (p.email ?? '').toLowerCase();
    const s     = search.toLowerCase();
    return full.includes(s) || email.includes(s);
  }), [personasClientes, search]);

  // TODO: organizaciones con rol cliente - endpoint pendiente
  const filteredOrgs: OrgOption[] = useMemo(() => [], []);

  /* ── Stats ── */
  const totalActivos   = personasClientes.filter(p => p.activo).length;
  const totalInactivos = personasClientes.filter(p => !p.activo).length;

  /* ── Save ── */
  const openModal = () => {
    fetchOptions();
    setForm({ persona_id: '', organizacion_id: '', contexto: '', activo: true });
    setShowModal(true);
  };

  const handleSave = async () => {
    // TODO: implementar creación de cliente - endpoint /api/personas con rol pendiente
    toast.error('Funcionalidad pendiente - endpoint /api/personas con rol cliente');
    setSaving(false);
  };

  const toggleActivo = async (p: Persona) => {
    // TODO: implementar toggle activo - endpoint pendiente
    toast.error('Funcionalidad pendiente - actualización de rol cliente');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <OrangeHeader
        icon={ShoppingBag}
        title="Clientes"
        subtitle="Personas y organizaciones con rol de cliente en el sistema"
        actions={[{ label: '+ Registrar Cliente', primary: true, onClick: openModal }]}
      />

      {/* ── Stats ── */}
      <div style={{ padding: '14px 28px', backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Clientes',    value: personasClientes.length, icon: Tag,        color: ORANGE      },
          { label: 'Personas Clientes', value: personasClientes.length, icon: User,       color: 'var(--m-info)'   },
          { label: 'Orgs. Clientes',    value: 0,                        icon: Building2,  color: 'var(--m-purple)'   },
          { label: 'Activos',           value: totalActivos,            icon: CheckCircle, color: 'var(--m-success)'  },
          { label: 'Inactivos',         value: totalInactivos,          icon: XCircle,     color: 'var(--m-danger)'  },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={16} color={s.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--m-text)', lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--m-text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', padding: '0 28px', display: 'flex', gap: 0 }}>
        {([
          { key: 'personas',       label: 'Personas Clientes',       icon: User,      count: personasClientes.length },
          { key: 'organizaciones', label: 'Organizaciones Clientes', icon: Building2, count: 0 },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '12px 18px',
              border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: tab === t.key ? `3px solid ${ORANGE}` : '3px solid transparent',
              color: tab === t.key ? ORANGE : 'var(--m-text-muted)',
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: '0.875rem',
              transition: 'all 0.15s',
            }}
          >
            <t.icon size={15} />
            {t.label}
            <span style={{
              fontSize: '0.72rem', fontWeight: 700,
              backgroundColor: tab === t.key ? ORANGE + '18' : 'var(--m-surface-2)',
              color: tab === t.key ? ORANGE : 'var(--m-text-muted)',
              padding: '1px 7px', borderRadius: 20,
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div style={{ padding: '10px 28px', backgroundColor: 'var(--m-bg)', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--m-text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'personas' ? 'Buscar por nombre, email u organización…' : 'Buscar por nombre de organización…'}
            style={{ width: '100%', paddingLeft: 30, paddingRight: 12, height: 34, border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--m-surface)' }}
          />
        </div>
        <select
          value={filterActivo === undefined ? '' : filterActivo ? 'true' : 'false'}
          onChange={e => setFilterActivo(e.target.value === '' ? undefined : e.target.value === 'true')}
          style={{ height: 34, border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '0 10px', fontSize: '0.84rem', color: 'var(--m-text-secondary)', cursor: 'pointer', backgroundColor: 'var(--m-surface)' }}
        >
          <option value="">Todos</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
        </select>
        <button onClick={fetchClientes} style={{ height: 34, width: 34, border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'var(--m-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={14} color="#6B7280" />
        </button>
      </div>

      {/* ── Contenido ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: 'var(--m-text-muted)' }}>
            <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} /> Cargando clientes...
          </div>

        ) : tab === 'personas' ? (
          /* ── Tab Personas ── */
          filteredPersonas.length === 0 ? (
            <EmptyState icon={User} title="No hay personas clientes" sub='Registrá el primero usando "+ Registrar Cliente"' />
          ) : (
            <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--m-surface-2)', borderBottom: '1px solid #E5E7EB' }}>
                    {['Cliente', 'Contacto', 'Tipo', 'Documento', 'Alta', 'Estado'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--m-text-secondary)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonas.map((p, i) => (
                    <tr
                      key={p.id}
                      style={{ borderBottom: i < filteredPersonas.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFAFA'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
                    >
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'var(--m-warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={15} color={ORANGE} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--m-text)', fontSize: '0.875rem' }}>
                              {p.nombre} {p.apellido ?? ''}
                            </p>
                            {p.email && (
                              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--m-text-muted)' }}>{p.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '11px 16px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>
                        {p.telefono ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={12} /> {p.telefono}
                          </div>
                        ) : <span style={{ color: 'var(--m-border)' }}>—</span>}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, backgroundColor: p.tipo === 'natural' ? '#EFF6FF' : 'var(--m-warning-bg)', color: p.tipo === 'natural' ? '#3B82F6' : ORANGE, padding: '3px 10px', borderRadius: 20 }}>
                          {p.tipo === 'natural' ? 'Natural' : 'Jurídica'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>
                        {p.documento_tipo && p.documento_numero ? `${p.documento_tipo}: ${p.documento_numero}` : <span style={{ color: 'var(--m-border)' }}>—</span>}
                      </td>
                      <td style={{ padding: '11px 16px', color: 'var(--m-text-muted)', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} />
                          {new Date(p.created_at).toLocaleDateString('es-UY')}
                        </div>
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <button
                          onClick={() => toggleActivo(p)}
                          style={{ padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600, backgroundColor: p.activo ? '#D1FAE5' : 'var(--m-danger-bg)', color: p.activo ? '#10B981' : 'var(--m-danger)' }}
                        >
                          {p.activo ? '● Activo' : '● Inactivo'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )

        ) : (
          /* ── Tab Organizaciones ── */
          // TODO: endpoint /api/organizaciones?rol=cliente pendiente
          <EmptyState icon={Building2} title="No hay organizaciones clientes" sub='Endpoint /api/organizaciones?rol=cliente pendiente' />
        )}
      </div>

      {/* ── Modal Registrar Cliente ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--m-text)' }}>Registrar Cliente</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>Persona y/u organización con rol cliente</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label style={labelStyle}>Persona <span style={{ color: 'var(--m-text-muted)', fontWeight: 400 }}>(opcional si hay organización)</span></label>
                <select value={form.persona_id} onChange={e => setForm(f => ({ ...f, persona_id: e.target.value }))} style={selectStyle}>
                  <option value="">— Sin persona específica —</option>
                  {personas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido ?? ''} {p.email ? `(${p.email})` : ''}
                    </option>
                  ))}
                </select>
                {personas.length === 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: 'var(--m-warning)' }}>
                    ⚠️ No hay personas.{' '}
                    <button onClick={() => { setShowModal(false); onNavigate('personas'); }} style={{ background: 'none', border: 'none', color: ORANGE, cursor: 'pointer', fontWeight: 600, fontSize: '0.76rem', padding: 0 }}>
                      Crear una
                    </button>
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Organización <span style={{ color: 'var(--m-text-muted)', fontWeight: 400 }}>(opcional si hay persona)</span></label>
                <select value={form.organizacion_id} onChange={e => setForm(f => ({ ...f, organizacion_id: e.target.value }))} style={selectStyle}>
                  <option value="">— Sin organización —</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                </select>
                {orgs.length === 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: 'var(--m-warning)' }}>
                    ⚠️ No hay organizaciones.{' '}
                    <button onClick={() => { setShowModal(false); onNavigate('organizaciones'); }} style={{ background: 'none', border: 'none', color: ORANGE, cursor: 'pointer', fontWeight: 600, fontSize: '0.76rem', padding: 0 }}>
                      Crear una
                    </button>
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Contexto / Nota</label>
                <input
                  value={form.contexto}
                  onChange={e => setForm(f => ({ ...f, contexto: e.target.value }))}
                  style={inputStyle}
                  placeholder="Ej: Canal mayorista, referido por…"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="cli-activo" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} style={{ width: 16, height: 16, accentColor: ORANGE, cursor: 'pointer' }} />
                <label htmlFor="cli-activo" style={{ fontSize: '0.875rem', color: 'var(--m-text-secondary)', cursor: 'pointer' }}>Cliente activo</label>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: 'var(--m-warning-bg)', borderRadius: 8, border: '1px solid #FDBA74', fontSize: '0.78rem', color: 'var(--m-warning-text)' }}>
                💡 Podés registrar una <strong>persona cliente</strong>, una <strong>organización cliente</strong>, o ambas en el mismo registro.
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid #E5E7EB', background: 'var(--m-surface)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--m-text-secondary)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', backgroundColor: ORANGE, color: 'var(--m-surface)', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
                <Save size={15} /> {saving ? 'Guardando…' : 'Registrar cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Empty state helper ── */
function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--m-text-muted)' }}>
      <Icon size={44} style={{ marginBottom: 12, opacity: 0.25 }} />
      <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{title}</p>
      <p style={{ fontSize: '0.875rem', marginTop: 6 }}>{sub}</p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--m-text-secondary)', marginBottom: 5,
};
const inputStyle: React.CSSProperties = {
  width: '100%', height: 38, border: '1.5px solid #E5E7EB', borderRadius: 8,
  padding: '0 12px', fontSize: '0.875rem', color: 'var(--m-text)', outline: 'none', boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = {
  width: '100%', height: 38, border: '1.5px solid #E5E7EB', borderRadius: 8,
  padding: '0 10px', fontSize: '0.875rem', color: 'var(--m-text-secondary)', cursor: 'pointer', outline: 'none',
};
