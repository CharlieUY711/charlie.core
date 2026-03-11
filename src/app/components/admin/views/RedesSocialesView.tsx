import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import { RRSSBanner }   from '../RRSSBanner';
import type { MainSection } from '../../../AdminDashboard';
import {
  BarChart2, Users, Heart, Eye, Send, MessageCircle,
  Image, Calendar, ChevronLeft, ChevronRight, Plus,
  Share2, ShoppingBag, Zap, Loader2,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getMetricas, getPosts, type RRSSMetrica, type RRSSPost } from '../../../services/rrssApi';

interface Props { onNavigate: (section: MainSection) => void; }

type Tab = 'panel' | 'facebook' | 'instagram' | 'whatsapp' | 'calendario';
type FBTab = 'publicaciones' | 'mensajes';

const ORANGE = '#FF6835';

const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E1306C',
  whatsapp: '#25D366',
};

export function RedesSocialesView({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('panel');
  const [fbTab, setFbTab] = useState<FBTab>('publicaciones');
  const [calMonth] = useState({ year: 2026, month: 2 });
  const [metricas, setMetricas] = useState<RRSSMetrica[]>([]);
  const [posts, setPosts] = useState<RRSSPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricasData, postsData] = await Promise.all([
        getMetricas(undefined, 7),
        getPosts({ estado: 'publicado' }),
      ]);
      setMetricas(metricasData);
      setPosts(postsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
      console.error('Error loading RRSS data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const getLatestMetrica = (platform: string): RRSSMetrica | null => {
    return metricas.filter(m => m.platform === platform).sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )[0] || null;
  };

  const formatNumber = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  // Prepare line chart data from metrics
  const lineData = metricas.reduce((acc, m) => {
    const date = new Date(m.fecha);
    const dayKey = `${date.getDate()} ${date.toLocaleDateString('es-ES', { month: 'short' })}`;
    if (!acc[dayKey]) acc[dayKey] = { day: dayKey, facebook: 0, instagram: 0, whatsapp: 0 };
    acc[dayKey][m.platform] = m.alcance;
    return acc;
  }, {} as Record<string, { day: string; facebook: number; instagram: number; whatsapp: number }>);
  const LINE_DATA = Object.values(lineData).sort((a, b) => a.day.localeCompare(b.day));

  // Calculate pie chart data from total engagement
  const totalEngagement = metricas.reduce((acc, m) => {
    acc[m.platform] = (acc[m.platform] || 0) + m.engagement;
    return acc;
  }, {} as Record<string, number>);
  const total = Object.values(totalEngagement).reduce((a, b) => a + b, 0);
  const PIE_DATA = Object.entries(totalEngagement).map(([platform, value]) => ({
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    value: total > 0 ? Math.round((value / total) * 100) : 0,
    color: PLATFORM_COLORS[platform] || '#6B7280',
  }));

  // Prepare calendar events from scheduled posts
  const CAL_EVENTS: Record<number, { label: string; color: string }[]> = {};
  posts.filter(p => p.estado === 'programado' && p.programado_para).forEach(post => {
    const date = new Date(post.programado_para!);
    const day = date.getDate();
    if (!CAL_EVENTS[day]) CAL_EVENTS[day] = [];
    CAL_EVENTS[day].push({
      label: post.contenido?.slice(0, 30) || 'Post programado',
      color: PLATFORM_COLORS[post.platform] || '#6B7280',
    });
  });

  const TABS: { id: Tab; label: string; icon?: any }[] = [
    { id: 'panel',      label: '⊞ Panel Unificado' },
    { id: 'facebook',   label: '🔵 Facebook' },
    { id: 'instagram',  label: '📸 Instagram' },
    { id: 'whatsapp',   label: '💬 WhatsApp' },
    { id: 'calendario', label: '📅 Calendario' },
  ];

  /* ─ Stat chip ─ */
  const Stat = ({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) => (
    <div style={{ padding: '14px 20px', borderRadius: '8px', border: highlight ? `1.5px solid ${ORANGE}33` : '1px solid #E5E7EB', backgroundColor: highlight ? `${ORANGE}08` : 'var(--m-surface)', minWidth: '110px' }}>
      <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: highlight ? ORANGE : 'var(--m-text)' }}>{value}</p>
      <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{label}</p>
    </div>
  );

  /* ─ Platform action cards ─ */
  const ActionCard = ({ icon: Icon, label, desc, color }: { icon: any; label: string; desc: string; color: string }) => (
    <div style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s', backgroundColor: 'var(--m-surface)' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E7EB')}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
        <Icon size={18} color={color} />
      </div>
      <p style={{ margin: '0 0 3px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.85rem' }}>{label}</p>
      <p style={{ margin: 0, color: 'var(--m-text-muted)', fontSize: '0.72rem' }}>{desc}</p>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Share2}
        title="Redes Sociales"
        subtitle="Gestión y administración"
        actions={[
          { label: '← Volver', onClick: () => onNavigate('rrss') },
          { label: 'Volver a la tienda' },
        ]}
      />

      <RRSSBanner onNavigate={onNavigate} active="redes-sociales" />

      {/* Sub-header: Centro Operativo title + tabs */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ padding: '16px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Share2 size={16} color={ORANGE} />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--m-text)' }}>Centro Operativo de Redes Sociales</h2>
          </div>
          <p style={{ margin: '0 0 12px', color: 'var(--m-text-muted)', fontSize: '0.78rem' }}>
            Meta Business Suite · Gestión unificada de Facebook, Instagram y WhatsApp
          </p>
          <div style={{ display: 'flex', gap: '0' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding: '10px 16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: activeTab === t.id ? ORANGE : 'var(--m-text-muted)', fontWeight: activeTab === t.id ? '700' : '500', fontSize: '0.82rem', borderBottom: activeTab === t.id ? `2px solid ${ORANGE}` : '2px solid transparent', whiteSpace: 'nowrap' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        <div style={{ padding: '20px 28px', maxWidth: '1200px' }}>

          {/* ── PANEL UNIFICADO ── */}
          {activeTab === 'panel' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--m-text-muted)' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p>Cargando datos...</p>
                </div>
              ) : error ? (
                <div style={{ backgroundColor: 'var(--m-danger-bg)', borderRadius: '10px', border: '1px solid #FECACA', padding: '14px 18px', color: 'var(--m-danger-text)' }}>
                  <p style={{ margin: 0, fontWeight: '700' }}>⚠️ Error: {error}</p>
                </div>
              ) : (
                <>
              {/* Platform stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { 
                    platform: 'Facebook', 
                    color: '#1877F2', 
                    bg: 'var(--m-info-bg)', 
                    stats: [
                      { v: formatNumber(getLatestMetrica('facebook')?.seguidores || 0), l: 'Seguidores' },
                      { v: formatNumber(getLatestMetrica('facebook')?.alcance || 0), l: 'Alcance hoy' },
                      { v: posts.filter(p => p.platform === 'facebook').length.toString(), l: 'Posts' }
                    ] 
                  },
                  { 
                    platform: 'Instagram', 
                    color: '#E1306C', 
                    bg: '#FFF0F6', 
                    stats: [
                      { v: formatNumber(getLatestMetrica('instagram')?.seguidores || 0), l: 'Seguidores' },
                      { v: `${getLatestMetrica('instagram')?.engagement.toFixed(1) || 0}%`, l: 'Engagement' },
                      { v: posts.filter(p => p.platform === 'instagram').length.toString(), l: 'Posts' }
                    ] 
                  },
                  { 
                    platform: 'WhatsApp', 
                    color: '#25D366', 
                    bg: 'var(--m-success-bg)', 
                    stats: [
                      { v: formatNumber(getLatestMetrica('whatsapp')?.seguidores || 0), l: 'Contactos' },
                      { v: posts.filter(p => p.platform === 'whatsapp').length.toString(), l: 'Posts' },
                      { v: `${getLatestMetrica('whatsapp')?.engagement.toFixed(1) || 0}%`, l: 'Engagement' }
                    ] 
                  },
                  { 
                    platform: 'Programadas', 
                    color: 'var(--m-purple)', 
                    bg: 'var(--m-purple-bg)', 
                    stats: [
                      { v: posts.filter(p => p.estado === 'programado').length.toString(), l: 'Posts programados' },
                      { v: posts.filter(p => p.estado === 'borrador').length.toString(), l: 'Pendientes' },
                      { v: posts.filter(p => {
                        if (!p.programado_para) return false;
                        const date = new Date(p.programado_para);
                        const weekFromNow = new Date();
                        weekFromNow.setDate(weekFromNow.getDate() + 7);
                        return date <= weekFromNow;
                      }).length.toString(), l: 'Esta semana' }
                    ] 
                  },
                ].map((p, i) => (
                  <div key={i} style={{ backgroundColor: p.bg, borderRadius: '12px', border: `1px solid ${p.color}22`, padding: '16px 18px' }}>
                    <p style={{ margin: '0 0 10px', fontWeight: '700', color: p.color, fontSize: '0.85rem' }}>{p.platform}</p>
                    {p.stats.map((s, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{s.l}</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--m-text)' }}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                  <h3 style={{ margin: '0 0 16px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.88rem' }}>Resumen Métricas — 7 días</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={LINE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--m-text-muted)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--m-text-muted)' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '0.75rem' }} />
                      <Line type="monotone" dataKey="facebook"  stroke="#1877F2" strokeWidth={2} dot={false} name="Facebook" />
                      <Line type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2} dot={false} name="Instagram" />
                      <Line type="monotone" dataKey="whatsapp"  stroke="#25D366" strokeWidth={2} dot={false} name="WhatsApp" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                  <h3 style={{ margin: '0 0 16px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.88rem' }}>Distribución Engagement</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, value }) => `${value}%`} labelLine={false} fontSize={10}>
                        {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent publications */}
              <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px 20px', marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.88rem' }}>Publicaciones en Meta Business</h3>
                {posts.slice(0, 5).length === 0 ? (
                  <p style={{ color: 'var(--m-text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>No hay publicaciones aún</p>
                ) : (
                  posts.slice(0, 5).map((p, i) => {
                    const date = p.publicado_en ? new Date(p.publicado_en) : new Date(p.created_at);
                    const icon = p.platform === 'facebook' ? '🔵' : p.platform === 'instagram' ? '📸' : '💬';
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < posts.slice(0, 5).length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--m-text)', fontWeight: '600' }}>{p.contenido || 'Sin contenido'}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>
                              {p.platform} · {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', color: 'var(--m-text-muted)' }}>
                          <span>❤️ {p.likes}</span>
                          <span>👁 {formatNumber(p.alcance)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pending tasks */}
              <div style={{ backgroundColor: 'var(--m-warning-bg)', borderRadius: '10px', border: '1px solid #FDE68A', padding: '14px 18px' }}>
                <p style={{ margin: '0 0 6px', fontWeight: '700', color: 'var(--m-warning-text)', fontSize: '0.85rem' }}>⚠️ Tareas Pendientes</p>
                <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--m-warning-text)', fontSize: '0.78rem', lineHeight: '1.8' }}>
                  {posts.filter(p => p.estado === 'borrador').length > 0 && (
                    <li>{posts.filter(p => p.estado === 'borrador').length} publicación(es) en borrador</li>
                  )}
                  {posts.filter(p => p.estado === 'programado').length > 0 && (
                    <li>{posts.filter(p => p.estado === 'programado').length} publicación(es) programada(s)</li>
                  )}
                  {metricas.length === 0 && (
                    <li>No hay métricas registradas. Configura las credenciales para comenzar a medir.</li>
                  )}
                </ul>
              </div>
                </>
              )}
            </>
          )}

          {/* ── FACEBOOK ── */}
          {activeTab === 'facebook' && (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Stat value={formatNumber(getLatestMetrica('facebook')?.seguidores || 0)} label="Seguidores" highlight />
                <Stat value={posts.filter(p => p.platform === 'facebook').reduce((sum, p) => sum + p.likes, 0).toString()} label="Total Likes" />
                <Stat value={formatNumber(getLatestMetrica('facebook')?.alcance || 0)} label="Alcance" />
                <Stat value={posts.filter(p => p.platform === 'facebook' && p.estado === 'programado').length.toString()} label="Programadas" />
                <Stat value={posts.filter(p => p.platform === 'facebook' && p.estado === 'borrador').length.toString()} label="Borradores" />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {(['publicaciones', 'mensajes'] as FBTab[]).map(t => (
                  <button key={t} onClick={() => setFbTab(t)}
                    style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: fbTab === t ? '#1877F2' : 'var(--m-surface)', color: fbTab === t ? '#FFF' : 'var(--m-text-secondary)', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {t === 'publicaciones' ? <Image size={13} /> : <MessageCircle size={13} />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
                <button style={{ marginLeft: 'auto', padding: '8px 18px', backgroundColor: '#1877F2', color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> Nueva Publicación
                </button>
              </div>
              <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '40px', textAlign: 'center', color: 'var(--m-text-muted)' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1877F222', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Image size={22} color="#1877F2" />
                </div>
                <p style={{ margin: 0, fontWeight: '600', color: 'var(--m-text-secondary)' }}>No hay publicaciones</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Crea tu primera publicación para comenzar</p>
              </div>
            </>
          )}

          {/* ── INSTAGRAM ── */}
          {activeTab === 'instagram' && (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <Stat value={formatNumber(getLatestMetrica('instagram')?.seguidores || 0)} label="Seguidores" highlight />
                <Stat value={`${getLatestMetrica('instagram')?.engagement.toFixed(1) || 0}%`} label="Engagement" />
                <Stat value={posts.filter(p => p.platform === 'instagram').reduce((sum, p) => sum + p.comentarios, 0).toString()} label="Comentarios" />
                <Stat value={posts.filter(p => p.platform === 'instagram').length.toString()} label="Posts" />
              </div>
              <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #405DE6, #E1306C, #FD1D1D)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span style={{ fontSize: '1.6rem' }}>📸</span>
                </div>
                <h3 style={{ margin: '0 0 8px', fontWeight: '800', color: 'var(--m-text)', fontSize: '1.1rem' }}>Instagram Management</h3>
                <p style={{ margin: '0 0 24px', color: 'var(--m-text-muted)', fontSize: '0.8rem', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
                  Gestión completa de Instagram incluyendo feed, stories, reels, mensajes directos y shopping tag
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[
                    { icon: Image,         label: 'Feed & Stories',      desc: 'Publicar y programar contenido',  color: '#E1306C' },
                    { icon: MessageCircle, label: 'Mensajes Directos',    desc: 'Gestionar DMs y respuestas',      color: '#405DE6' },
                    { icon: ShoppingBag,   label: 'Instagram Shopping',   desc: 'Etiquetar productos y ventas',    color: '#25D366' },
                  ].map((card, i) => <ActionCard key={i} {...card} />)}
                </div>
              </div>
            </>
          )}

          {/* ── WHATSAPP ── */}
          {activeTab === 'whatsapp' && (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <Stat value={formatNumber(getLatestMetrica('whatsapp')?.seguidores || 0)} label="Contactos" highlight />
                <Stat value={posts.filter(p => p.platform === 'whatsapp').length.toString()} label="Posts" />
                <Stat value={`${getLatestMetrica('whatsapp')?.engagement.toFixed(1) || 0}%`} label="Engagement" />
                <Stat value={formatNumber(getLatestMetrica('whatsapp')?.alcance || 0)} label="Alcance" />
              </div>
              <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#25D36622', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <MessageCircle size={30} color="#25D366" />
                </div>
                <h3 style={{ margin: '0 0 8px', fontWeight: '800', color: 'var(--m-text)', fontSize: '1.1rem' }}>WhatsApp Business API</h3>
                <p style={{ margin: '0 0 24px', color: 'var(--m-text-muted)', fontSize: '0.8rem', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
                  Gestión profesional de WhatsApp Business con mensajería masiva, chatbot y catálogo de productos
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[
                    { icon: Send,        label: 'Mensajería',    desc: 'Chats y broadcasts',         color: '#25D366' },
                    { icon: ShoppingBag, label: 'Catálogo',      desc: 'Productos y ventas',          color: 'var(--m-success)' },
                    { icon: Zap,         label: 'Automatización', desc: 'Respuestas automáticas',    color: 'var(--m-primary)' },
                  ].map((card, i) => <ActionCard key={i} {...card} />)}
                </div>
              </div>
            </>
          )}

          {/* ── CALENDARIO ── */}
          {activeTab === 'calendario' && <ContentCalendar events={CAL_EVENTS} />}
        </div>
      </div>
    </div>
  );
}

/* ─ Content Calendar Component ─ */
function ContentCalendar({ events }: { events: Record<number, { label: string; color: string }[]> }) {
  // Feb 2026: starts Sunday, 28 days
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const startDow = 0; // Sunday
  const today = 19;
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontWeight: '800', color: 'var(--m-text)', fontSize: '1rem' }}>Calendario de Contenido</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', padding: '5px 8px' }}><ChevronLeft size={14} /></button>
          <span style={{ fontWeight: '700', color: 'var(--m-text)', fontSize: '0.9rem' }}>Febrero 2026</span>
          <button style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', padding: '5px 8px' }}><ChevronRight size={14} /></button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '2px' }}>
        {weekDays.map(d => (
          <div key={d} style={{ textAlign: 'center', padding: '8px', color: 'var(--m-text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: 'var(--m-surface-2)' }}>
        {/* Empty cells for start day */}
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`e${i}`} style={{ backgroundColor: 'var(--m-surface-2)', minHeight: '80px', padding: '6px' }} />
        ))}
        {days.map(day => {
          const isToday = day === today;
          const dayEvents = events[day] || [];
          return (
            <div key={day} style={{ backgroundColor: isToday ? '#FFF4EC' : 'var(--m-surface)', minHeight: '80px', padding: '6px', borderLeft: isToday ? `2px solid ${ORANGE}` : '1px solid transparent' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: isToday ? ORANGE : 'transparent', color: isToday ? '#FFF' : 'var(--m-text-secondary)', fontSize: '0.78rem', fontWeight: isToday ? '700' : '400', marginBottom: '4px' }}>
                {day}
              </span>
              {dayEvents.map((ev, i) => (
                <div key={i} style={{ padding: '2px 5px', borderRadius: '3px', backgroundColor: ev.color + '20', borderLeft: `2px solid ${ev.color}`, marginBottom: '2px', fontSize: '0.65rem', color: ev.color, fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.label}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
        {[{ color: '#1877F2', label: 'Facebook' }, { color: '#E1306C', label: 'Instagram' }, { color: '#25D366', label: 'WhatsApp' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: l.color }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}