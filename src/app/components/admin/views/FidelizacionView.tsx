import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, Gift, DollarSign, TrendingUp, Star, Edit2, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  getMiembros, getNiveles, getMiembro, addPuntos, updateMiembro,
  type Miembro, type Nivel, type MiembroDetalle,
} from '../../../services/marketingApi';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE = '#FF6835';

interface PointsConfig {
  pointsPerDollar: number;
  dollarPerPoints: number;
}

export function FidelizacionView({ onNavigate }: Props) {
  const [pointsConfig, setPointsConfig] = useState<PointsConfig>({ pointsPerDollar: 10, dollarPerPoints: 100 });
  const [editingConfig, setEditingConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'rewards'>('overview');
  
  // Estados para datos reales
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [selectedMiembro, setSelectedMiembro] = useState<MiembroDetalle | null>(null);
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
      const [miembrosData, nivelesData] = await Promise.all([
        getMiembros(),
        getNiveles(),
      ]);
      setMiembros(miembrosData);
      setNiveles(nivelesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
      console.error('Error loading fidelizacion data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMiembro = async (id: string) => {
    try {
      const detalle = await getMiembro(id);
      setSelectedMiembro(detalle);
    } catch (err) {
      alert('Error cargando detalle del miembro');
    }
  };

  const handleAddPuntos = async (miembroId: string) => {
    const puntos = prompt('Puntos a agregar (negativo para restar):');
    if (!puntos) return;
    const descripcion = prompt('Descripción:') || 'Ajuste manual';
    try {
      const success = await addPuntos(miembroId, parseInt(puntos, 10), descripcion);
      if (success) {
        await loadData();
        if (selectedMiembro && selectedMiembro.id === miembroId) {
          const updated = await getMiembro(miembroId);
          setSelectedMiembro(updated);
        }
      }
    } catch (err) {
      alert('Error actualizando puntos');
    }
  };

  // Calcular distribución por niveles
  const levelDistribution = niveles.map(nivel => ({
    nivel: nivel.nombre,
    count: miembros.filter(m => m.nivel_id === nivel.id).length,
  }));

  // Calcular stats
  const totalMiembros = miembros.length;
  const totalPuntosCanjeados = miembros.reduce((sum, m) => sum + (m.puntos_historicos - m.puntos_actuales), 0);
  const totalPuntosActivos = miembros.reduce((sum, m) => sum + m.puntos_actuales, 0);

  const TIER_COLORS: Record<string, string> = {
    Platino: 'var(--m-purple)',
    Oro: 'var(--m-warning)',
    Plata: 'var(--m-text-muted)',
    Bronce: 'var(--m-warning)',
  };

  // Preparar niveles para mostrar (desde API o default)
  const TIERS = niveles.length > 0 ? niveles.map(n => ({
    name: n.nombre,
    from: n.puntos_minimos,
    gradient: `linear-gradient(135deg, ${n.color}, ${n.color}88)`,
    features: n.beneficios,
  })) : [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Star}
        title="Programa de Fidelización"
        subtitle="Recompensa a tus clientes más leales"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('marketing') },
          { label: 'Configurar', primary: true },
        ]}
      />

      {/* Sticky tabs */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ display: 'flex', padding: '0 28px' }}>
          {[
            { id: 'overview' as const, label: 'Resumen' },
            { id: 'members' as const, label: 'Miembros' },
            { id: 'rewards' as const, label: 'Recompensas' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '14px 18px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: activeTab === t.id ? ORANGE : 'var(--m-text-muted)', fontWeight: activeTab === t.id ? '700' : '500', fontSize: '0.875rem', borderBottom: activeTab === t.id ? `2px solid ${ORANGE}` : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        <div style={{ padding: '24px 28px', maxWidth: '1200px' }}>

          {activeTab === 'overview' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--m-text-muted)' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p>Cargando datos...</p>
                </div>
              ) : error ? (
                <div style={{ backgroundColor: 'var(--m-danger-bg)', borderRadius: '10px', border: '1px solid #FECACA', padding: '14px 18px', color: 'var(--m-danger-text)', marginBottom: '24px' }}>
                  <p style={{ margin: 0, fontWeight: '700' }}>⚠️ Error: {error}</p>
                </div>
              ) : (
                <>
              {/* Top stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', borderRadius: '12px', padding: '20px', color: 'var(--m-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Users size={18} color="rgba(255,255,255,0.85)" />
                    <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>Miembros activos</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: '900' }}>{totalMiembros.toLocaleString()}</p>
                </div>
                {[
                  { label: 'Puntos canjeados',  value: totalPuntosCanjeados.toLocaleString(), Icon: Gift,        color: 'var(--m-warning)' },
                  { label: 'Puntos activos', value: totalPuntosActivos.toLocaleString(),  Icon: DollarSign,  color: 'var(--m-success)' },
                  { label: 'Niveles configurados', value: niveles.length.toString(),   Icon: TrendingUp,  color: 'var(--m-purple)' },
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <s.Icon size={18} color={s.color} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>{s.label}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '1.7rem', fontWeight: '900', color: 'var(--m-text)' }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Two columns: config + chart */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Points config */}
                <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontWeight: '700', color: 'var(--m-text)', fontSize: '0.95rem' }}>Configuración de Puntos</h3>
                    <button onClick={() => setEditingConfig(!editingConfig)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: editingConfig ? ORANGE : 'var(--m-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '600' }}>
                      {editingConfig ? <><Save size={13} /> Guardar</> : <><Edit2 size={13} /> Editar</>}
                    </button>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--m-text-secondary)', fontWeight: '600' }}>Puntos por dólar gastado:</label>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--m-text)' }}>{pointsConfig.pointsPerDollar}</span>
                    </div>
                    <input type="range" min={1} max={50} value={pointsConfig.pointsPerDollar}
                      disabled={!editingConfig}
                      onChange={e => setPointsConfig(p => ({ ...p, pointsPerDollar: +e.target.value }))}
                      style={{ width: '100%', accentColor: ORANGE }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--m-text-secondary)', fontWeight: '600' }}>Puntos por $1 de descuento:</label>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--m-text)' }}>{pointsConfig.dollarPerPoints}</span>
                    </div>
                    <input type="range" min={10} max={500} step={10} value={pointsConfig.dollarPerPoints}
                      disabled={!editingConfig}
                      onChange={e => setPointsConfig(p => ({ ...p, dollarPerPoints: +e.target.value }))}
                      style={{ width: '100%', accentColor: ORANGE }} />
                  </div>
                  <div style={{ padding: '12px 16px', backgroundColor: 'var(--m-info-bg)', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--m-info)' }}>
                      💡 <strong>Ejemplo:</strong> Un cliente que compra por $100 recibe {pointsConfig.pointsPerDollar * 100} puntos.
                      Al juntar {pointsConfig.dollarPerPoints} puntos podrá canjearlos por $1 de descuento.
                    </p>
                  </div>
                </div>

                {/* Distribution chart */}
                <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ margin: '0 0 20px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.95rem' }}>Distribución por Niveles</h3>
                  {levelDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={levelDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="nivel" tick={{ fontSize: 11, fill: 'var(--m-text-muted)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--m-text-muted)' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.78rem' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}
                          fill="#8B5CF6"
                          label={{ position: 'top', fontSize: 10, fill: 'var(--m-text-muted)' }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p style={{ textAlign: 'center', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>No hay datos</p>
                  )}
                </div>
              </div>

              {/* Membership tiers */}
              <div>
                <h3 style={{ margin: '0 0 16px', fontWeight: '800', color: 'var(--m-text)', fontSize: '0.95rem' }}>Niveles de Membresía</h3>
                {TIERS.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {TIERS.map((tier) => (
                      <div key={tier.name} style={{ background: tier.gradient, borderRadius: '14px', padding: '20px', color: 'var(--m-surface)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                          <Star size={16} fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.6)" />
                        </div>
                        <h4 style={{ margin: '0 0 4px', fontWeight: '900', fontSize: '1.05rem' }}>{tier.name}</h4>
                        <p style={{ margin: '0 0 14px', fontSize: '0.75rem', opacity: 0.85 }}>
                          Desde {tier.from === 0 ? '0 puntos' : `${tier.from.toLocaleString()} puntos`}
                        </p>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {tier.features.map((f, i) => (
                            <li key={i} style={{ fontSize: '0.78rem', opacity: 0.9, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ opacity: 0.7 }}>•</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>No hay niveles configurados</p>
                )}
              </div>
                </>
              )}
            </>
          )}

          {activeTab === 'members' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--m-text-muted)' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p>Cargando miembros...</p>
                </div>
              ) : error ? (
                <div style={{ backgroundColor: 'var(--m-danger-bg)', borderRadius: '10px', border: '1px solid #FECACA', padding: '14px 18px', color: 'var(--m-danger-text)', marginBottom: '20px' }}>
                  <p style={{ margin: 0, fontWeight: '700' }}>⚠️ Error: {error}</p>
                </div>
              ) : (
                <>
              {selectedMiembro ? (
                <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--m-text)' }}>
                      {selectedMiembro.nombre || selectedMiembro.email}
                    </h3>
                    <button onClick={() => setSelectedMiembro(null)} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: 'var(--m-surface)', color: 'var(--m-text-secondary)', fontSize: '0.82rem', cursor: 'pointer' }}>
                      ← Volver
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>Email</p>
                      <p style={{ margin: 0, fontWeight: '600', color: 'var(--m-text)' }}>{selectedMiembro.email}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>Puntos actuales</p>
                      <p style={{ margin: 0, fontWeight: '800', color: ORANGE, fontSize: '1.2rem' }}>{selectedMiembro.puntos_actuales.toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleAddPuntos(selectedMiembro.id)} style={{ padding: '10px 20px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '20px' }}>
                    <Plus size={14} style={{ display: 'inline', marginRight: '6px' }} /> Ajustar Puntos
                  </button>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--m-text)' }}>Historial de Movimientos</h4>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedMiembro.movimientos && selectedMiembro.movimientos.length > 0 ? (
                      selectedMiembro.movimientos.map(mov => (
                        <div key={mov.id} style={{ padding: '12px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--m-text)', fontSize: '0.875rem' }}>{mov.descripcion || 'Movimiento'}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{new Date(mov.created_at).toLocaleString('es-ES')}</p>
                          </div>
                          <span style={{ fontWeight: '700', color: mov.tipo === 'suma' ? '#16A34A' : 'var(--m-danger)', fontSize: '0.875rem' }}>
                            {mov.tipo === 'suma' ? '+' : '-'}{mov.puntos}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p style={{ textAlign: 'center', color: 'var(--m-text-muted)', fontSize: '0.8rem', padding: '20px' }}>No hay movimientos</p>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--m-text)' }}>Miembros del Programa</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--m-text-muted)' }}>{miembros.length} miembros</span>
                  </div>
                  {miembros.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--m-text-muted)' }}>
                      <p style={{ margin: 0 }}>No hay miembros aún</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--m-surface-2)' }}>
                          {['Miembro', 'Email', 'Nivel', 'Puntos', 'Acciones'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {miembros.map((m, i) => {
                          const nivelNombre = m.nivel?.nombre || 'Sin nivel';
                          const nivelColor = TIER_COLORS[nivelNombre] || '#6B7280';
                          return (
                            <tr key={m.id} style={{ borderTop: '1px solid #F3F4F6', backgroundColor: i % 2 === 0 ? '#FFF' : 'var(--m-surface-2)' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${nivelColor}, ${nivelColor}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-surface)', fontWeight: '700', fontSize: '0.8rem' }}>
                                    {(m.nombre || m.email).charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: '600', color: 'var(--m-text)', fontSize: '0.875rem' }}>{m.nombre || m.email}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>{m.email}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: nivelColor + '20', color: nivelColor, fontSize: '0.75rem', fontWeight: '700' }}>
                                  ⭐ {nivelNombre}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: '700', color: ORANGE, fontSize: '0.875rem' }}>{m.puntos_actuales.toLocaleString()} pts</td>
                              <td style={{ padding: '12px 16px' }}>
                                <button onClick={() => handleViewMiembro(m.id)} style={{ padding: '6px 12px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                                  Ver
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
                </>
              )}
            </>
          )}

          {activeTab === 'rewards' && (
            <div>
              <p style={{ textAlign: 'center', color: 'var(--m-text-muted)', fontSize: '0.8rem', padding: '40px' }}>
                Las recompensas se configuran desde el sistema de puntos. Próximamente: catálogo de recompensas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
