import React, { useState, useRef, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { Plus, Trash2, Settings, Save, BarChart2, RefreshCw, Loader2 } from 'lucide-react';
import {
  getSorteos, createSorteo, updateSorteo, girarSorteo, participarSorteo,
  type Sorteo, type Participante,
} from '../../../services/marketingApi';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE = '#FF6835';

interface Prize {
  id: string;
  label: string;
  type: 'discount_pct' | 'discount_fixed' | 'free_shipping' | 'gift' | 'no_prize';
  value: number;
  probability: number;
  color: string;
  email: boolean;
  whatsapp: boolean;
  checkStock: boolean;
  discountStock: boolean;
}

const SEGMENT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

interface WheelConfig {
  name: string;
  spinDuration: number;
  showConfetti: boolean;
  requireEmail: boolean;
  requireLogin: boolean;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  shareOnSocial: boolean;
  activeOnSite: boolean;
  maxSpinsUser: string;
  maxSpinsDay: string;
}

/* ─ Spinning Wheel SVG Component ─ */
function SpinWheel({ prizes, spinning, onSpinEnd }: { prizes: Prize[]; spinning: boolean; onSpinEnd: (prize: Prize) => void }) {
  const [rotation, setRotation] = useState(0);
  const animRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const startRotRef = useRef<number>(0);

  useEffect(() => {
    if (spinning) {
      const winnerIdx = Math.floor(Math.random() * prizes.length);
      const spins = 5 + Math.random() * 3;
      const segmentAngle = 360 / prizes.length;
      const winnerAngle = winnerIdx * segmentAngle + segmentAngle / 2;
      const target = rotation + 360 * spins + (360 - winnerAngle);
      startTimeRef.current = performance.now();
      startRotRef.current = rotation;
      const duration = 3000;

      const animate = (now: number) => {
        const elapsed = now - startTimeRef.current;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = startRotRef.current + (target - startRotRef.current) * eased;
        setRotation(current);
        if (t < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          setRotation(target);
          onSpinEnd(prizes[winnerIdx]);
        }
      };
      animRef.current = requestAnimationFrame(animate);
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }
  }, [spinning]);

  const cx = 150, cy = 150, r = 140;
  const n = prizes.length;

  const getSegmentPath = (index: number) => {
    const angle = 360 / n;
    const startAngle = (index * angle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * angle - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
  };

  const getTextTransform = (index: number) => {
    const angle = (360 / n) * index + (360 / n / 2) - 90;
    const rad = angle * (Math.PI / 180);
    const tx = cx + (r * 0.6) * Math.cos(rad);
    const ty = cy + (r * 0.6) * Math.sin(rad);
    return { x: tx, y: ty, angle };
  };

  if (n === 0) {
    return (
      <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-text-muted)' }}>
        <p>No hay premios configurados</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '300px', height: '300px' }}>
      <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '20px solid #333', margin: '0 auto' }} />
      </div>
      <svg width="300" height="300" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50% 50%', transition: 'none' }}>
        {prizes.map((prize, i) => {
          const { x, y, angle } = getTextTransform(i);
          return (
            <g key={prize.id}>
              <path d={getSegmentPath(i)} fill={prize.color} stroke="#FFFFFF" strokeWidth="2" />
              <text
                x={x} y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${angle}, ${x}, ${y})`}
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="700"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)', pointerEvents: 'none' }}
              >
                {prize.label}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="20" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="8" fill={ORANGE} />
      </svg>
    </div>
  );
}

export function RuedaSorteosView({ onNavigate }: Props) {
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [selectedSorteo, setSelectedSorteo] = useState<Sorteo | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WheelConfig>({
    name: 'Nueva Rueda',
    spinDuration: 3000,
    showConfetti: true,
    requireEmail: true,
    requireLogin: false,
    notifyEmail: true,
    notifyWhatsapp: false,
    shareOnSocial: true,
    activeOnSite: false,
    maxSpinsUser: '',
    maxSpinsDay: '',
  });

  // Cargar sorteos al montar
  useEffect(() => {
    loadSorteos();
  }, []);

  const loadSorteos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSorteos();
      setSorteos(data);
      if (data.length > 0 && !selectedSorteo) {
        setSelectedSorteo(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando sorteos');
      console.error('Error loading sorteos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSorteo = async () => {
    const nombre = prompt('Nombre del sorteo:');
    if (!nombre) return;
    const premio = prompt('Premio:') || null;
    try {
      const created = await createSorteo({
        nombre,
        premio,
        estado: 'borrador',
      });
      if (created) {
        setSorteos([...sorteos, created]);
        setSelectedSorteo(created);
      }
    } catch (err) {
      alert('Error creando sorteo: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleGirar = async () => {
    if (!selectedSorteo || spinning) return;
    if (selectedSorteo.estado !== 'activo') {
      alert('El sorteo debe estar activo para girar');
      return;
    }
    setWinner(null);
    setSpinning(true);
  };

  const handleSpinEnd = async (prize: Prize) => {
    setSpinning(false);
    setWinner(prize);
    
    // Llamar a la API para girar el sorteo
    if (selectedSorteo) {
      try {
        const result = await girarSorteo(selectedSorteo.id);
        if (result) {
          await loadSorteos();
          alert(`¡Ganador: ${result.ganador.email}!`);
        }
      } catch (err) {
        alert('Error girando sorteo: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  const updatePrize = (id: string, field: keyof Prize, value: unknown) => {
    setPrizes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addPrize = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      label: 'Nuevo Premio',
      type: 'discount_pct',
      value: 10,
      probability: 10,
      color: SEGMENT_COLORS[prizes.length % SEGMENT_COLORS.length],
      email: true, whatsapp: false, checkStock: false, discountStock: false,
    };
    setPrizes(prev => [...prev, newPrize]);
  };

  const totalProb = prizes.reduce((s, p) => s + p.probability, 0);

  // Premios por defecto si no hay sorteo seleccionado
  useEffect(() => {
    if (!selectedSorteo && prizes.length === 0) {
      setPrizes([
        { id: '1', label: '10% OFF', type: 'discount_pct', value: 10, probability: 30, color: SEGMENT_COLORS[0], email: true, whatsapp: true, checkStock: true, discountStock: false },
        { id: '2', label: '20% OFF', type: 'discount_pct', value: 20, probability: 20, color: SEGMENT_COLORS[1], email: true, whatsapp: true, checkStock: true, discountStock: false },
        { id: '3', label: 'Envío Gratis', type: 'free_shipping', value: 0, probability: 25, color: SEGMENT_COLORS[2], email: true, whatsapp: false, checkStock: false, discountStock: false },
        { id: '4', label: '5% OFF', type: 'discount_pct', value: 5, probability: 15, color: SEGMENT_COLORS[3], email: false, whatsapp: false, checkStock: false, discountStock: false },
        { id: '5', label: 'Premio Sorpresa', type: 'gift', value: 0, probability: 5, color: SEGMENT_COLORS[4], email: true, whatsapp: true, checkStock: false, discountStock: false },
        { id: '6', label: '30% OFF', type: 'discount_pct', value: 30, probability: 5, color: SEGMENT_COLORS[5], email: true, whatsapp: true, checkStock: true, discountStock: true },
      ]);
    }
  }, [selectedSorteo]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={RefreshCw}
        title="Rueda de Sorteos Integrada"
        subtitle="Sorteos interactivos para campañas y eventos"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('marketing') },
          { label: '+ Nueva Rueda', primary: true, onClick: handleCreateSorteo },
          { label: '📊 Estadísticas' },
        ]}
      />

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center', color: 'var(--m-text-muted)' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p>Cargando sorteos...</p>
            </div>
          </div>
        ) : error ? (
          <div style={{ padding: '24px 28px' }}>
            <div style={{ backgroundColor: 'var(--m-danger-bg)', borderRadius: '10px', border: '1px solid #FECACA', padding: '14px 18px', color: 'var(--m-danger-text)' }}>
              <p style={{ margin: 0, fontWeight: '700' }}>⚠️ Error: {error}</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%' }}>
            {/* Left panel — wheel preview */}
            <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: '800', color: 'var(--m-text)', fontSize: '0.95rem' }}>
                    {selectedSorteo?.nombre || config.name}
                  </h3>
                  <p style={{ margin: '3px 0 0', color: selectedSorteo?.estado === 'activo' ? '#16A34A' : 'var(--m-text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: selectedSorteo?.estado === 'activo' ? '#16A34A' : 'var(--m-text-muted)', display: 'inline-block' }} />
                    {selectedSorteo?.estado === 'activo' ? 'Activo' : selectedSorteo?.estado === 'finalizado' ? 'Finalizado' : 'Borrador'}
                  </p>
                </div>
                <button onClick={() => {}} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: 'var(--m-surface)', color: 'var(--m-text-secondary)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={14} /> Guardar
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
                <SpinWheel prizes={prizes} spinning={spinning} onSpinEnd={handleSpinEnd} />
                <button
                  onClick={handleGirar}
                  disabled={spinning || !selectedSorteo || selectedSorteo.estado !== 'activo'}
                  style={{ padding: '12px 32px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '1rem', cursor: spinning || !selectedSorteo || selectedSorteo.estado !== 'activo' ? 'not-allowed' : 'pointer', opacity: spinning || !selectedSorteo || selectedSorteo.estado !== 'activo' ? 0.7 : 1, transition: 'all 0.2s' }}
                >
                  {spinning ? 'Girando…' : '🎰 ¡Girar!'}
                </button>

                {winner && (
                  <div style={{ padding: '14px 22px', backgroundColor: winner.color + '20', border: `2px solid ${winner.color}`, borderRadius: '12px', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: '800', color: 'var(--m-text)', fontSize: '1rem' }}>🎉 ¡Ganaste!</p>
                    <p style={{ margin: 0, color: winner.color, fontWeight: '700', fontSize: '1.2rem' }}>{winner.label}</p>
                  </div>
                )}

                {selectedSorteo && (
                  <div style={{ width: '100%', backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px', marginTop: '20px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--m-text)' }}>Información del Sorteo</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
                      <div>
                        <p style={{ margin: '0 0 4px', color: 'var(--m-text-muted)' }}>Participantes</p>
                        <p style={{ margin: 0, fontWeight: '700', color: 'var(--m-text)' }}>{selectedSorteo.total_participantes}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px', color: 'var(--m-text-muted)' }}>Premio</p>
                        <p style={{ margin: 0, fontWeight: '700', color: 'var(--m-text)' }}>{selectedSorteo.premio || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right panel — sorteos list + prizes + config */}
            <div style={{ width: '360px', borderLeft: '1px solid #E5E7EB', backgroundColor: 'var(--m-surface)', overflowY: 'auto', padding: '20px', flexShrink: 0 }}>
              {/* Saved sorteos */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--m-text)' }}>Sorteos Guardados</h4>
                {sorteos.length === 0 ? (
                  <div style={{ padding: '20px', backgroundColor: 'var(--m-surface-2)', borderRadius: '8px', textAlign: 'center', color: 'var(--m-text-muted)', fontSize: '0.78rem' }}>
                    No hay sorteos guardados
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sorteos.map(s => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSorteo(s)}
                        style={{
                          padding: '12px',
                          backgroundColor: selectedSorteo?.id === s.id ? '#FFF4EC' : 'var(--m-surface-2)',
                          border: `1px solid ${selectedSorteo?.id === s.id ? ORANGE : 'var(--m-border)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <p style={{ margin: '0 0 4px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.82rem' }}>{s.nombre}</p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>
                          {s.estado} · {s.total_participantes} participantes
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prizes editor */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--m-text)' }}>Editar Premios</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: totalProb === 100 ? '#16A34A' : 'var(--m-danger)' }}>
                      Total probabilidad: {totalProb}%
                    </p>
                  </div>
                  <button onClick={addPrize} style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {prizes.map((prize) => (
                    <div key={prize.id} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px', borderLeft: `4px solid ${prize.color}` }}>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                        <input value={prize.label} onChange={e => updatePrize(prize.id, 'label', e.target.value)}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }} />
                        <input type="color" value={prize.color} onChange={e => updatePrize(prize.id, 'color', e.target.value)}
                          style={{ width: '32px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0 }} />
                        <button onClick={() => setPrizes(prev => prev.filter(p => p.id !== prize.id))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-danger)', padding: '4px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                        <select value={prize.type} onChange={e => updatePrize(prize.id, 'type', e.target.value)}
                          style={{ flex: 1, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.75rem', outline: 'none' }}>
                          <option value="discount_pct">Descuento %</option>
                          <option value="discount_fixed">Descuento $</option>
                          <option value="free_shipping">Envío Gratis</option>
                          <option value="gift">Regalo</option>
                          <option value="no_prize">Sin premio</option>
                        </select>
                        {(prize.type === 'discount_pct' || prize.type === 'discount_fixed') && (
                          <input type="number" value={prize.value} onChange={e => updatePrize(prize.id, 'value', +e.target.value)}
                            style={{ width: '54px', padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.75rem', outline: 'none' }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>Prob: {prize.probability}%</span>
                        <input type="range" min={1} max={100} value={prize.probability}
                          onChange={e => updatePrize(prize.id, 'probability', +e.target.value)}
                          style={{ flex: 1, margin: '0 8px', accentColor: ORANGE }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {[
                          { key: 'email', label: '✉️ Email' },
                          { key: 'whatsapp', label: '💬 WhatsApp' },
                          { key: 'checkStock', label: '📦 Verificar stock' },
                          { key: 'discountStock', label: '➖ Descontar stock' },
                        ].map(({ key, label }) => (
                          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--m-text-secondary)', cursor: 'pointer' }}>
                            <input type="checkbox" checked={prize[key as keyof Prize] as boolean}
                              onChange={e => updatePrize(prize.id, key as keyof Prize, e.target.checked)}
                              style={{ accentColor: ORANGE }} />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Config */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <Settings size={14} color="#6B7280" />
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--m-text)' }}>Configuración</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--m-text-secondary)', fontWeight: '600', marginBottom: '4px' }}>Nombre de la Rueda</label>
                    <input value={config.name} onChange={e => setConfig(p => ({ ...p, name: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--m-text-secondary)', fontWeight: '600', marginBottom: '4px' }}>Duración del giro (ms): {config.spinDuration}</label>
                    <input type="range" min={1000} max={6000} step={500} value={config.spinDuration}
                      onChange={e => setConfig(p => ({ ...p, spinDuration: +e.target.value }))}
                      style={{ width: '100%', accentColor: ORANGE }} />
                  </div>
                  {[
                    { key: 'showConfetti',  label: '🎉 Mostrar confetti' },
                    { key: 'requireEmail',  label: '📧 Requerir email' },
                    { key: 'requireLogin',  label: '🔐 Requerir login' },
                    { key: 'notifyEmail',   label: '✉️ Notificaciones por email' },
                    { key: 'notifyWhatsapp', label: '💬 Notificaciones por WhatsApp' },
                    { key: 'shareOnSocial', label: '📲 Compartir en redes sociales' },
                    { key: 'activeOnSite',  label: '🌐 Activar en el sitio web' },
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--m-text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={config[key as keyof WheelConfig] as boolean}
                        onChange={e => setConfig(p => ({ ...p, [key]: e.target.checked }))}
                        style={{ accentColor: ORANGE }} />
                      {label}
                    </label>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[{ key: 'maxSpinsUser', label: 'Máx giros/usuario' }, { key: 'maxSpinsDay', label: 'Máx giros/día' }].map(({ key, label }) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--m-text-secondary)', fontWeight: '600', marginBottom: '3px' }}>{label}</label>
                        <input type="text" placeholder="Sin límite" value={config[key as keyof WheelConfig] as string}
                          onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))}
                          style={{ width: '100%', padding: '7px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.75rem', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
