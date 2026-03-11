import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Mail, Users, BarChart2, TestTube2, TrendingUp,
  Plus, Search, Filter, Send, Clock, FileText,
  CheckCircle2, CircleX, Eye, Edit2, Trash2,
  Upload, Download, Tag, ChevronDown, Loader2,
} from 'lucide-react';
import {
  getCampanas, createCampana, updateCampana, deleteCampana,
  getSuscriptores, createSuscriptor, updateSuscriptor, deleteSuscriptor,
  type Campana, type Suscriptor,
} from '../../../services/marketingApi';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE = '#FF6835';
type Tab = 'campanas' | 'suscriptores' | 'segmentacion' | 'abtesting' | 'analiticas';

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  enviada:    { label: 'Enviada',     bg: 'var(--m-success-bg)', color: 'var(--m-success)' },
  programada: { label: 'Programada', bg: 'var(--m-purple-bg)', color: 'var(--m-purple)' },
  borrador:   { label: 'Borrador',   bg: 'var(--m-surface-2)', color: 'var(--m-text-secondary)' },
  pausada:    { label: 'Pausada',    bg: 'var(--m-warning-bg)', color: 'var(--m-warning-text)' },
};

export function MailingView({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('campanas');
  const [searchSubs, setSearchSubs] = useState('');
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', subject: '', body: '' });
  
  // Estados para datos reales
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [suscriptores, setSuscriptores] = useState<Suscriptor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [campanasData, suscriptoresData] = await Promise.all([
        getCampanas(),
        getSuscriptores(),
      ]);
      setCampanas(campanasData);
      setSuscriptores(suscriptoresData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
      console.error('Error loading mailing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampana = async (estado: 'borrador' | 'programada' = 'borrador') => {
    if (!newCampaign.name || !newCampaign.subject) {
      alert('Nombre y asunto son requeridos');
      return;
    }
    try {
      const created = await createCampana({
        nombre: newCampaign.name,
        asunto: newCampaign.subject,
        contenido_html: newCampaign.body,
        estado: estado,
      });
      if (created) {
        setCampanas([...campanas, created]);
        setShowNewCampaign(false);
        setNewCampaign({ name: '', subject: '', body: '' });
      }
    } catch (err) {
      alert('Error creando campaña: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteCampana = async (id: string) => {
    if (!confirm('¿Eliminar esta campaña?')) return;
    try {
      const success = await deleteCampana(id);
      if (success) {
        setCampanas(campanas.filter(c => c.id !== id));
      }
    } catch (err) {
      alert('Error eliminando campaña');
    }
  };

  const handleDeleteSuscriptor = async (id: string) => {
    if (!confirm('¿Eliminar este suscriptor?')) return;
    try {
      const success = await deleteSuscriptor(id);
      if (success) {
        setSuscriptores(suscriptores.filter(s => s.id !== id));
      }
    } catch (err) {
      alert('Error eliminando suscriptor');
    }
  };

  const handleCreateSuscriptor = async () => {
    const email = prompt('Email del suscriptor:');
    if (!email) return;
    try {
      const created = await createSuscriptor({ email, estado: 'activo' });
      if (created) {
        setSuscriptores([...suscriptores, created]);
      }
    } catch (err) {
      alert('Error creando suscriptor: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const tabs: { id: Tab; label: string; Icon: any }[] = [
    { id: 'campanas',     label: 'Campañas',    Icon: Mail },
    { id: 'suscriptores', label: 'Suscriptores', Icon: Users },
    { id: 'segmentacion', label: 'Segmentación', Icon: Filter },
    { id: 'abtesting',    label: 'A/B Testing',  Icon: TestTube2 },
    { id: 'analiticas',   label: 'Analíticas',   Icon: BarChart2 },
  ];

  const sent       = campanas.filter(c => c.estado === 'enviada').length;
  const scheduled  = campanas.filter(c => c.estado === 'programada').length;
  const drafts     = campanas.filter(c => c.estado === 'borrador').length;
  const filteredSubs = suscriptores.filter(s =>
    s.email.toLowerCase().includes(searchSubs.toLowerCase()) ||
    (s.nombre && s.nombre.toLowerCase().includes(searchSubs.toLowerCase()))
  );

  // Calcular tasas de apertura y clicks
  const getOpenRate = (c: Campana): number | null => {
    if (c.total_enviados === 0) return null;
    return (c.total_abiertos / c.total_enviados) * 100;
  };

  const getClickRate = (c: Campana): number | null => {
    if (c.total_enviados === 0) return null;
    return (c.total_clicks / c.total_enviados) * 100;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Mail}
        title="Sistema de Mailing Avanzado"
        subtitle="Gestión completa de campañas, segmentación y analíticas · Powered by Resend"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('marketing') },
          { label: '+ Nueva Campaña', primary: true, onClick: () => setShowNewCampaign(true) },
        ]}
      />

      {/* Sticky tabs + stats bar */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 28px' }}>
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '14px 18px',
                border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                color: activeTab === id ? ORANGE : 'var(--m-text-muted)',
                fontWeight: activeTab === id ? '700' : '500',
                fontSize: '0.875rem',
                borderBottom: activeTab === id ? `2px solid ${ORANGE}` : '2px solid transparent',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        <div style={{ padding: '24px 28px', maxWidth: '1200px' }}>

          {/* ── CAMPAÑAS ── */}
          {activeTab === 'campanas' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--m-text-muted)' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p>Cargando campañas...</p>
                </div>
              ) : error ? (
                <div style={{ backgroundColor: 'var(--m-danger-bg)', borderRadius: '10px', border: '1px solid #FECACA', padding: '14px 18px', color: 'var(--m-danger-text)', marginBottom: '24px' }}>
                  <p style={{ margin: 0, fontWeight: '700' }}>⚠️ Error: {error}</p>
                </div>
              ) : (
                <>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Campañas', value: campanas.length, color: 'var(--m-text)' },
                  { label: 'Enviadas',        value: sent,      color: 'var(--m-success)' },
                  { label: 'Programadas',     value: scheduled, color: 'var(--m-purple)' },
                  { label: 'Borradores',      value: drafts,    color: 'var(--m-text-secondary)' },
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px 20px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Campaigns list */}
              <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--m-text)' }}>Gestión de Campañas</h3>
                  <button
                    onClick={() => setShowNewCampaign(true)}
                    style={{ padding: '9px 18px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} /> Nueva Campaña
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--m-surface-2)' }}>
                      {['Nombre / Asunto', 'Estado', 'Destinatarios', 'Apertura', 'Clics', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--m-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campanas.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--m-text-muted)' }}>
                          <p style={{ margin: 0 }}>No hay campañas aún</p>
                        </td>
                      </tr>
                    ) : (
                      campanas.map((c, i) => {
                        const s = STATUS_BADGE[c.estado] || STATUS_BADGE.borrador;
                        const openRate = getOpenRate(c);
                        const clickRate = getClickRate(c);
                        return (
                          <tr key={c.id} style={{ borderTop: '1px solid #F3F4F6', backgroundColor: i % 2 === 0 ? '#FFFFFF' : 'var(--m-surface-2)' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <p style={{ margin: 0, fontWeight: '600', color: 'var(--m-text)', fontSize: '0.875rem' }}>{c.nombre}</p>
                              <p style={{ margin: '2px 0 0', color: 'var(--m-text-muted)', fontSize: '0.75rem' }}>{c.asunto || 'Sin asunto'}</p>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: '700' }}>{s.label}</span>
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--m-text-secondary)', fontSize: '0.875rem' }}>{c.total_destinatarios > 0 ? c.total_destinatarios.toLocaleString() : '—'}</td>
                            <td style={{ padding: '14px 16px', color: openRate ? '#16A34A' : 'var(--m-text-muted)', fontSize: '0.875rem', fontWeight: openRate ? '700' : '400' }}>{openRate ? `${openRate.toFixed(1)}%` : '—'}</td>
                            <td style={{ padding: '14px 16px', color: clickRate ? '#2563EB' : 'var(--m-text-muted)', fontSize: '0.875rem', fontWeight: clickRate ? '700' : '400' }}>{clickRate ? `${clickRate.toFixed(1)}%` : '—'}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)', padding: '4px' }}><Eye size={15} /></button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)', padding: '4px' }}><Edit2 size={15} /></button>
                                {c.estado === 'borrador' && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: ORANGE, padding: '4px' }}><Send size={15} /></button>}
                                <button onClick={() => handleDeleteCampana(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-danger)', padding: '4px' }}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
                </>
              )}
            </>
          )}

          {/* ── SUSCRIPTORES ── */}
          {activeTab === 'suscriptores' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--m-text-muted)' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p>Cargando suscriptores...</p>
                </div>
              ) : error ? (
                <div style={{ backgroundColor: 'var(--m-danger-bg)', borderRadius: '10px', border: '1px solid #FECACA', padding: '14px 18px', color: 'var(--m-danger-text)', marginBottom: '20px' }}>
                  <p style={{ margin: 0, fontWeight: '700' }}>⚠️ Error: {error}</p>
                </div>
              ) : (
                <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--m-text)' }}>Suscriptores</h2>
                  <p style={{ margin: '3px 0 0', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>
                    {suscriptores.filter(s => s.estado === 'activo').length} activos · {suscriptores.filter(s => s.estado === 'inactivo' || s.estado === 'cancelado').length} inactivos
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ padding: '9px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: 'var(--m-surface)', color: 'var(--m-text-secondary)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={14} /> Importar CSV
                  </button>
                  <button style={{ padding: '9px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: 'var(--m-surface)', color: 'var(--m-text-secondary)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14} /> Exportar
                  </button>
                  <button onClick={handleCreateSuscriptor} style={{ padding: '9px 16px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={14} /> Agregar
                  </button>
                </div>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={15} color="#9CA3AF" />
                <input
                  type="text"
                  placeholder="Buscar por email o nombre..."
                  value={searchSubs}
                  onChange={e => setSearchSubs(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--m-surface-2)' }}>
                      {['Nombre', 'Email', 'Tags', 'Estado', 'Registrado', ''].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--m-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--m-text-muted)' }}>
                          <p style={{ margin: 0 }}>No hay suscriptores</p>
                        </td>
                      </tr>
                    ) : (
                      filteredSubs.map((s, i) => (
                        <tr key={s.id} style={{ borderTop: '1px solid #F3F4F6', backgroundColor: i % 2 === 0 ? '#FFFFFF' : 'var(--m-surface-2)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: ORANGE + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: ORANGE, fontSize: '0.8rem' }}>
                                {(s.nombre || s.email).charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: '600', color: 'var(--m-text)', fontSize: '0.875rem' }}>{s.nombre || s.email}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--m-text-secondary)', fontSize: '0.875rem' }}>{s.email}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {s.tags && s.tags.length > 0 ? s.tags.map(t => (
                                <span key={t} style={{ padding: '2px 8px', backgroundColor: 'var(--m-surface-2)', borderRadius: '12px', fontSize: '0.72rem', color: 'var(--m-text-secondary)', fontWeight: '600' }}>{t}</span>
                              )) : <span style={{ color: 'var(--m-text-muted)', fontSize: '0.72rem' }}>—</span>}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: s.estado === 'activo' ? '#16A34A' : 'var(--m-text-muted)', fontWeight: '600' }}>
                              {s.estado === 'activo' ? <CheckCircle2 size={13} /> : <CircleX size={13} />}
                              {s.estado === 'activo' ? 'Activo' : s.estado === 'cancelado' ? 'Cancelado' : 'Inactivo'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>{new Date(s.created_at).toLocaleDateString('es-ES')}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)' }}><Edit2 size={14} /></button>
                              <button onClick={() => handleDeleteSuscriptor(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-danger)' }}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
                </>
              )}
            </>
          )}

          {/* ── SEGMENTACIÓN ── */}
          {activeTab === 'segmentacion' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {[
                  { name: 'Clientes VIP', count: 312, color: 'var(--m-warning)', desc: 'Usuarios con tag VIP o +3 compras' },
                  { name: 'Electrónica',  count: 489, color: 'var(--m-info)', desc: 'Interesados en categoría Electrónica' },
                  { name: 'Moda',         count: 234, color: '#EC4899', desc: 'Interesados en categoría Moda' },
                  { name: 'Hogar',        count: 178, color: 'var(--m-success)', desc: 'Interesados en categoría Hogar' },
                  { name: 'Inactivos',    count: 97,  color: 'var(--m-text-muted)', desc: 'Sin actividad hace +60 días' },
                  { name: 'Nuevos',       count: 156, color: ORANGE,    desc: 'Registrados en los últimos 30 días' },
                ].map((seg, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--m-text)', fontSize: '0.95rem' }}>{seg.name}</h4>
                        <p style={{ margin: '3px 0 0', color: 'var(--m-text-muted)', fontSize: '0.78rem' }}>{seg.desc}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: seg.color }}>{seg.count}</p>
                        <p style={{ margin: 0, color: 'var(--m-text-muted)', fontSize: '0.72rem' }}>contactos</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ flex: 1, padding: '7px', border: `1px solid ${seg.color}`, borderRadius: '6px', backgroundColor: 'transparent', color: seg.color, fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}>
                        Enviar campaña
                      </button>
                      <button style={{ padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: 'var(--m-surface)', color: 'var(--m-text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}>
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button style={{ padding: '12px 20px', border: `2px dashed ${ORANGE}`, borderRadius: '10px', backgroundColor: 'var(--m-primary-10)', color: ORANGE, fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <Plus size={16} /> Crear nuevo segmento
              </button>
            </div>
          )}

          {/* ── A/B TESTING ── */}
          {activeTab === 'abtesting' && (
            <div>
              <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: '800', color: 'var(--m-text)', fontSize: '0.95rem' }}>Crear prueba A/B</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {['Variante A', 'Variante B'].map((v, i) => (
                    <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px' }}>
                      <p style={{ margin: '0 0 12px', fontWeight: '700', color: i === 0 ? '#3B82F6' : '#EC4899', fontSize: '0.85rem' }}>{v}</p>
                      {[{ label: 'Asunto', ph: 'Ej: 🔥 Oferta especial para vos' }, { label: 'Nombre del remitente', ph: 'Ej: Charlie Marketplace' }].map(({ label, ph }) => (
                        <div key={label} style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', color: 'var(--m-text-secondary)', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>{label}</label>
                          <input type="text" placeholder={ph} style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--m-text-secondary)', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>% de muestra</label>
                    <input type="number" defaultValue={20} style={{ width: '100px', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--m-text-secondary)', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>Métrica ganadora</label>
                    <select style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem', outline: 'none' }}>
                      <option>Tasa de apertura</option>
                      <option>Tasa de clics</option>
                      <option>Conversiones</option>
                    </select>
                  </div>
                  <button style={{ marginTop: '18px', padding: '10px 20px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Iniciar prueba
                  </button>
                </div>
              </div>
              {/* Empty state for active tests */}
              <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '40px', textAlign: 'center', color: 'var(--m-text-muted)' }}>
                <TestTube2 size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ margin: 0 }}>No hay pruebas A/B activas</p>
              </div>
            </div>
          )}

          {/* ── ANALÍTICAS ── */}
          {activeTab === 'analiticas' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Tasa de apertura',  value: '38.4%', sub: '+2.1% vs mes ant.', color: 'var(--m-success)' },
                  { label: 'Tasa de clics',     value: '9.7%',  sub: '+0.8% vs mes ant.', color: 'var(--m-info)' },
                  { label: 'Desuscriptos',      value: '0.3%',  sub: 'Bajo promedio',      color: 'var(--m-text-muted)' },
                  { label: 'Emails entregados', value: '98.9%', sub: 'Excelente',           color: ORANGE },
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '18px 20px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>{s.label}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: '800', color: s.color }}>{s.value}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{s.sub}</p>
                  </div>
                ))}
              </div>
              {/* Simple bar chart */}
              <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.95rem' }}>Rendimiento por campaña</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {campanas.filter(c => c.total_enviados > 0).map(c => {
                    const openRate = getOpenRate(c);
                    const clickRate = getClickRate(c);
                    return (
                      <div key={c.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--m-text-secondary)', fontWeight: '600' }}>{c.nombre}</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--m-text-muted)' }}>
                            {openRate ? `${openRate.toFixed(1)}%` : '—'} apertura · {clickRate ? `${clickRate.toFixed(1)}%` : '—'} clics
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {openRate && <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--m-success)', width: `${Math.min((openRate / 70) * 100, 100)}%`, transition: 'width 0.5s' }} />}
                          {clickRate && <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--m-info)', width: `${Math.min((clickRate / 70) * 100, 100)}%`, transition: 'width 0.5s' }} />}
                        </div>
                      </div>
                    );
                  })}
                  {campanas.filter(c => c.total_enviados > 0).length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>No hay campañas enviadas aún</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
                  {[{ color: 'var(--m-success)', label: 'Apertura' }, { color: 'var(--m-info)', label: 'Clics' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: l.color }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--m-text-muted)' }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowNewCampaign(false)}>
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '16px', padding: '28px', width: '560px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontWeight: '800', fontSize: '1.1rem', color: 'var(--m-text)' }}>✉️ Nueva Campaña</h2>
            {[
              { label: 'Nombre de la campaña', key: 'name' as const, ph: 'Ej: Newsletter Agosto 2025' },
              { label: 'Asunto del email', key: 'subject' as const, ph: 'Ej: 🔥 Ofertas imperdibles de la semana' },
            ].map(({ label, key, ph }) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--m-text-secondary)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px' }}>{label}</label>
                <input type="text" placeholder={ph} value={newCampaign[key]} onChange={e => setNewCampaign(prev => ({ ...prev, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--m-text-secondary)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px' }}>Contenido (HTML o texto)</label>
              <textarea rows={5} placeholder="Escribe el contenido de tu email aquí..." value={newCampaign.body} onChange={e => setNewCampaign(prev => ({ ...prev, body: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowNewCampaign(false)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'var(--m-surface)', color: 'var(--m-text-secondary)', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>Cancelar</button>
              <button onClick={() => handleCreateCampana('borrador')} style={{ flex: 1, padding: '11px', backgroundColor: 'var(--m-surface-2)', color: 'var(--m-text-secondary)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <FileText size={15} /> Guardar borrador
              </button>
              <button onClick={() => handleCreateCampana('programada')} style={{ flex: 1, padding: '11px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Send size={15} /> Programar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}