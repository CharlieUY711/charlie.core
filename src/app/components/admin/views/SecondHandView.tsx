/* =====================================================
   Second Hand View — Admin Panel
   Moderación, Estadísticas, Publicaciones y Mediación
   ===================================================== */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  CheckCircle2, CircleX, Clock, Eye, Package,
  TrendingUp, DollarSign, Users, Star, AlertTriangle,
  Search, MessageSquare, Scale, ShieldAlert, X,
  Send, ChevronRight, RotateCcw, CheckCheck, Ban,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

interface Props { onNavigate: (section: MainSection) => void; }

const PURPLE = '#7C3AED';
const ORANGE = '#FF6835';
const GREEN  = '#16A34A';
const RED    = '#DC2626';
const AMBER  = '#D97706';
const TEAL   = '#0D9488';

type TabType = 'estadisticas' | 'moderacion' | 'publicaciones' | 'mediacion';

/* ── Listings ── */
interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  seller: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  image: string;
}

// TODO: endpoint /api/productos/secondhand pendiente para cargar publicaciones
const MOCK_LISTINGS: Listing[] = [];

/* ── Disputes ── */
type DisputeStatus = 'abierta' | 'en-mediacion' | 'resuelta' | 'cerrada';
type MsgFrom = 'buyer' | 'seller' | 'admin';

interface DisputeMsg {
  id: string;
  from: MsgFrom;
  name: string;
  text: string;
  time: string;
}

interface Dispute {
  id: string;
  itemEmoji: string;
  itemTitle: string;
  itemPrice: number;
  buyer: string;
  seller: string;
  reason: string;
  status: DisputeStatus;
  openedAt: string;
  priority: 'alta' | 'media' | 'baja';
  messages: DisputeMsg[];
}

// TODO: endpoint /api/disputas pendiente
const MOCK_DISPUTES: Dispute[] = [];

/* ── Chart data ── */
// TODO: endpoint /api/estadisticas/secondhand pendiente para cargar datos de gráficos
const MONTHLY_DATA: Array<{ mes: string; publicaciones: number; aprobadas: number; rechazadas: number }> = [];

const CAT_DATA: Array<{ name: string; value: number; color: string }> = [];

/* ═══════════════════════════════ DISPUTE STATUS CONFIG ══════════════════════ */
const DISPUTE_STATUS: Record<DisputeStatus, { label: string; bg: string; color: string; Icon: React.ElementType }> = {
  'abierta':       { label: 'Abierta',       bg: 'var(--m-warning-bg)', color: AMBER,  Icon: AlertTriangle },
  'en-mediacion':  { label: 'En mediación',  bg: 'var(--m-purple-bg)', color: PURPLE, Icon: Scale         },
  'resuelta':      { label: 'Resuelta',      bg: 'var(--m-success-bg)', color: GREEN,  Icon: CheckCheck    },
  'cerrada':       { label: 'Cerrada',       bg: 'var(--m-surface-2)', color: 'var(--m-text-muted)', Icon: Ban         },
};

const PRIORITY_CFG: Record<string, { label: string; color: string }> = {
  alta:  { label: 'Alta',  color: RED   },
  media: { label: 'Media', color: AMBER },
  baja:  { label: 'Baja',  color: GREEN },
};

/* ═══════════════════════════════ MODERATION CARD ═══════════════════════════ */
function ModerationCard({ listing }: { listing: Listing }) {
  return (
    <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #FDE68A', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'var(--m-primary-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
        {listing.image}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 3px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.9rem' }}>{listing.title}</p>
        <p style={{ margin: 0, color: 'var(--m-text-muted)', fontSize: '0.78rem' }}>
          {listing.category} · {listing.seller} · ${listing.price}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button style={{ padding: '8px 16px', backgroundColor: 'var(--m-success-bg)', color: 'var(--m-success)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={13} /> Aprobar
        </button>
        <button style={{ padding: '8px 16px', backgroundColor: 'var(--m-danger-bg)', color: 'var(--m-danger)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CircleX size={13} /> Rechazar
        </button>
        <button style={{ padding: '8px 12px', backgroundColor: 'var(--m-surface-2)', color: 'var(--m-text-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
          <Eye size={14} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ DISPUTE DETAIL ════════════════════════════ */
function DisputeDetail({ dispute, onClose }: { dispute: Dispute; onClose: () => void }) {
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState<DisputeMsg[]>(dispute.messages);
  const [status, setStatus] = useState<DisputeStatus>(dispute.status);

  const cfg = DISPUTE_STATUS[status];

  const sendReply = () => {
    if (!reply.trim()) return;
    setMessages(prev => [...prev, {
      id: 'm' + Date.now(),
      from: 'admin',
      name: 'Admin',
      time: 'Ahora',
      text: reply.trim(),
    }]);
    setReply('');
  };

  const msgBg: Record<MsgFrom, { bg: string; align: 'flex-start' | 'flex-end'; nameColor: string }> = {
    buyer:  { bg: 'var(--m-info-bg)', align: 'flex-start', nameColor: 'var(--m-info)' },
    seller: { bg: 'var(--m-warning-bg)', align: 'flex-end',   nameColor: ORANGE    },
    admin:  { bg: 'var(--m-purple-bg)', align: 'flex-start', nameColor: PURPLE    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--m-surface)', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.3rem' }}>{dispute.itemEmoji}</span>
            <span style={{ fontWeight: '800', color: 'var(--m-text)', fontSize: '0.9rem' }}>{dispute.id}</span>
            <span style={{ padding: '2px 10px', borderRadius: '20px', backgroundColor: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <cfg.Icon size={10} /> {cfg.label}
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '20px', backgroundColor: PRIORITY_CFG[dispute.priority].color + '18', color: PRIORITY_CFG[dispute.priority].color, fontSize: '0.68rem', fontWeight: '700' }}>
              {PRIORITY_CFG[dispute.priority].label}
            </span>
          </div>
          <p style={{ margin: '0 0 4px', fontWeight: '600', color: 'var(--m-text-secondary)', fontSize: '0.82rem' }}>{dispute.itemTitle} — ${dispute.itemPrice}</p>
          <p style={{ margin: 0, color: 'var(--m-text-muted)', fontSize: '0.75rem' }}>
            🧑 Comprador: <b>{dispute.buyer}</b> · 🏪 Vendedor: <b>{dispute.seller}</b>
          </p>
          <p style={{ margin: '4px 0 0', color: 'var(--m-text-muted)', fontSize: '0.72rem' }}>Motivo: {dispute.reason}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)', padding: '4px', flexShrink: 0 }}>
          <X size={18} />
        </button>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
        <button
          onClick={() => setStatus('en-mediacion')}
          disabled={status === 'en-mediacion'}
          style={{ padding: '7px 14px', backgroundColor: status === 'en-mediacion' ? PURPLE : 'var(--m-purple-bg)', color: status === 'en-mediacion' ? '#fff' : PURPLE, border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', opacity: status === 'en-mediacion' ? 0.7 : 1 }}>
          <Scale size={12} /> Iniciar mediación
        </button>
        <button
          onClick={() => setStatus('resuelta')}
          disabled={status === 'resuelta' || status === 'cerrada'}
          style={{ padding: '7px 14px', backgroundColor: status === 'resuelta' ? GREEN : 'var(--m-success-bg)', color: status === 'resuelta' ? '#fff' : GREEN, border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', opacity: (status === 'resuelta' || status === 'cerrada') ? 0.6 : 1 }}>
          <CheckCheck size={12} /> Marcar resuelta
        </button>
        <button
          onClick={() => setStatus('cerrada')}
          disabled={status === 'cerrada'}
          style={{ padding: '7px 14px', backgroundColor: 'var(--m-surface-2)', color: 'var(--m-text-secondary)', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', opacity: status === 'cerrada' ? 0.6 : 1 }}>
          <Ban size={12} /> Cerrar disputa
        </button>
        <button
          onClick={() => setStatus('abierta')}
          style={{ padding: '7px 14px', backgroundColor: 'var(--m-warning-bg)', color: AMBER, border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <RotateCcw size={12} /> Reabrir
        </button>
      </div>

      {/* Messages thread */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map(msg => {
          const mc = msgBg[msg.from];
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mc.align }}>
              <div style={{ maxWidth: '85%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', justifyContent: mc.align }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: mc.nameColor }}>
                    {msg.from === 'admin' ? '🛡️ ' : msg.from === 'buyer' ? '🧑 ' : '🏪 '}{msg.name}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--m-text-muted)' }}>{msg.time}</span>
                </div>
                <div style={{ backgroundColor: mc.bg, borderRadius: '12px', padding: '10px 14px', fontSize: '0.82rem', color: 'var(--m-text-secondary)', lineHeight: 1.5 }}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply box */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Escribí un mensaje como mediador..."
            rows={2}
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '0.82rem', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
          />
          <button
            onClick={sendReply}
            disabled={!reply.trim()}
            style={{ padding: '10px 16px', backgroundColor: reply.trim() ? PURPLE : 'var(--m-border)', color: reply.trim() ? '#fff' : 'var(--m-text-muted)', border: 'none', borderRadius: '10px', cursor: reply.trim() ? 'pointer' : 'default', fontWeight: '700', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
            <Send size={13} /> Enviar
          </button>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '0.68rem', color: 'var(--m-text-muted)' }}>
          🛡️ Este mensaje será visible para comprador y vendedor como intervención del mediador
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ MAIN VIEW ═════════════════════════════ */
export function SecondHandView({ onNavigate }: Props) {
  const [tab, setTab]                   = useState<TabType>('estadisticas');
  const [filter, setFilter]             = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch]             = useState('');
  const [moderationOpen, setModerationOpen] = useState(true);
  const [disputeFilter, setDisputeFilter]   = useState<DisputeStatus | 'all'>('all');
  const [disputeSearch, setDisputeSearch]   = useState('');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const pending  = MOCK_LISTINGS.filter(l => l.status === 'pending').length;
  const approved = MOCK_LISTINGS.filter(l => l.status === 'approved').length;
  const rejected = MOCK_LISTINGS.filter(l => l.status === 'rejected').length;

  const filtered = MOCK_LISTINGS.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.seller.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredDisputes = MOCK_DISPUTES.filter(d => {
    if (disputeFilter !== 'all' && d.status !== disputeFilter) return false;
    if (disputeSearch && !d.itemTitle.toLowerCase().includes(disputeSearch.toLowerCase()) &&
        !d.buyer.toLowerCase().includes(disputeSearch.toLowerCase()) &&
        !d.seller.toLowerCase().includes(disputeSearch.toLowerCase())) return false;
    return true;
  });

  const openDisputes    = MOCK_DISPUTES.filter(d => d.status === 'abierta').length;
  const mediatingD      = MOCK_DISPUTES.filter(d => d.status === 'en-mediacion').length;
  const resolvedDisputes = MOCK_DISPUTES.filter(d => d.status === 'resuelta').length;

  const STATUS_CONFIG = {
    pending:  { label: 'Pendiente', bg: 'var(--m-warning-bg)', color: 'var(--m-warning-text)', Icon: Clock },
    approved: { label: 'Aprobada',  bg: 'var(--m-success-bg)', color: 'var(--m-success)', Icon: CheckCircle2 },
    rejected: { label: 'Rechazada', bg: 'var(--m-danger-bg)', color: 'var(--m-danger)', Icon: CircleX },
  };

  const TABS: { id: TabType; label: string }[] = [
    { id: 'estadisticas',  label: '📊 Estadísticas' },
    { id: 'moderacion',    label: '🛡️ Moderación' },
    { id: 'publicaciones', label: '📋 Publicaciones' },
    { id: 'mediacion',     label: '⚖️ Mediación' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={RefreshCw}
        title="Second Hand"
        subtitle="Marketplace de artículos usados — Moderación, estadísticas y mediación de disputas"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('gestion') },
          { label: 'Exportar Datos' },
        ]}
      />

      {/* Tabs */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ display: 'flex', padding: '0 28px' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedDispute(null); }}
              style={{ padding: '14px 18px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: tab === t.id ? PURPLE : 'var(--m-text-muted)', fontWeight: tab === t.id ? '700' : '500', fontSize: '0.875rem', borderBottom: tab === t.id ? `2px solid ${PURPLE}` : '2px solid transparent', position: 'relative' }}>
              {t.label}
              {t.id === 'mediacion' && (openDisputes + mediatingD) > 0 && (
                <span style={{ position: 'absolute', top: '10px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: RED, color: 'var(--m-surface)', fontSize: '0.6rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {openDisputes + mediatingD}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        <div style={{ padding: '24px 28px', maxWidth: '1200px' }}>

          {/* ── ESTADÍSTICAS ── */}
          {tab === 'estadisticas' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Publicaciones', value: MOCK_LISTINGS.length.toString(), Icon: Package,      color: PURPLE, sub: 'Cargando...' },
                  { label: 'Pendientes',           value: pending.toString(),             Icon: Clock,         color: AMBER,  sub: 'Requieren revisión' },
                  { label: 'Aprobadas',            value: approved.toString(),            Icon: CheckCircle2,  color: GREEN,  sub: MOCK_LISTINGS.length > 0 ? `${Math.round((approved / MOCK_LISTINGS.length) * 100)}% del total` : '0%' },
                  { label: 'Vendedores Activos',   value: '0',                           Icon: Users,         color: 'var(--m-info)', sub: 'Endpoint pendiente' },
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--m-surface)', border: `1px solid ${s.color}22`, borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>{s.label}</span>
                      <s.Icon size={16} color={s.color} />
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '1.7rem', fontWeight: '900', color: s.color }}>{s.value}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Valor Total Publicado', value: '$0', Icon: DollarSign, color: 'var(--m-success)', note: 'Endpoint pendiente' },
                  { label: 'Precio Promedio',        value: '$0',    Icon: TrendingUp,  color: ORANGE,   note: 'Endpoint pendiente' },
                  { label: 'Tasa de Aprobación',     value: '0%',     Icon: Star,        color: PURPLE,   note: 'Endpoint pendiente' },
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <s.Icon size={20} color={s.color} />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '0.75rem', color: 'var(--m-text-muted)' }}>{s.label}</p>
                      <p style={{ margin: '0 0 2px', fontSize: '1.4rem', fontWeight: '900', color: s.color }}>{s.value}</p>
                      <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--m-text-muted)' }}>{s.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {MONTHLY_DATA.length > 0 && CAT_DATA.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                  <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                    <h3 style={{ margin: '0 0 16px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.9rem' }}>Publicaciones por Mes</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--m-text-muted)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--m-text-muted)' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '0.75rem' }} />
                        <Bar dataKey="aprobadas"  fill="#10B981" radius={[3, 3, 0, 0]} name="Aprobadas" />
                        <Bar dataKey="rechazadas" fill="#EF4444" radius={[3, 3, 0, 0]} name="Rechazadas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                    <h3 style={{ margin: '0 0 16px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.9rem' }}>Por Categoría</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={CAT_DATA} cx="50%" cy="45%" outerRadius={70} dataKey="value" label={({ value }: { value: number }) => `${value}%`} labelLine={false} fontSize={9}>
                          {CAT_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '0.75rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '40px', textAlign: 'center', color: 'var(--m-text-muted)' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>📊 Gráficos disponibles cuando haya datos — endpoint /api/estadisticas/secondhand pendiente</p>
                </div>
              )}
            </>
          )}

          {/* ── MODERACIÓN ── */}
          {tab === 'moderacion' && (
            <>
              <div style={{ background: 'linear-gradient(135deg, #6D28D9, #7C3AED, #4F46E5)', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--m-surface)', fontWeight: '800', fontSize: '1rem' }}>Panel de Moderación</h3>
                    <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>Revisa y aprueba publicaciones de Second Hand</p>
                  </div>
                </div>
                <button onClick={() => setModerationOpen(!moderationOpen)} style={{ padding: '8px 18px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'var(--m-surface)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem' }}>
                  {moderationOpen ? 'Cerrar' : 'Abrir'}
                </button>
              </div>

              {moderationOpen && (
                pending === 0 ? (
                  <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '60px', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--m-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle2 size={32} color="#16A34A" />
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontWeight: '800', color: 'var(--m-text)', fontSize: '1rem' }}>¡Todo revisado!</h3>
                    <p style={{ margin: 0, color: 'var(--m-text-muted)', fontSize: '0.82rem' }}>No hay publicaciones pendientes de aprobación</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {MOCK_LISTINGS.filter(l => l.status === 'pending').map(listing => (
                      <ModerationCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                )
              )}
            </>
          )}

          {/* ── PUBLICACIONES ── */}
          {tab === 'publicaciones' && (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
                  <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} size={14} color="#9CA3AF" />
                  <input type="text" placeholder="Buscar publicación o vendedor..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${filter === f ? PURPLE : 'var(--m-border)'}`, backgroundColor: filter === f ? PURPLE : 'var(--m-surface)', color: filter === f ? '#FFF' : 'var(--m-text-secondary)', fontWeight: filter === f ? '700' : '500', cursor: 'pointer', fontSize: '0.78rem' }}>
                    {f === 'all' ? 'Todos' : f === 'pending' ? `Pendientes (${pending})` : f === 'approved' ? `Aprobadas (${approved})` : `Rechazadas (${rejected})`}
                  </button>
                ))}
              </div>

              <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--m-surface-2)' }}>
                      {['Artículo', 'Categoría', 'Precio', 'Vendedor', 'Estado', 'Fecha', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((listing, i) => {
                      const st = STATUS_CONFIG[listing.status];
                      return (
                        <tr key={listing.id} style={{ borderTop: '1px solid #F3F4F6', backgroundColor: i % 2 === 0 ? '#FFF' : 'var(--m-surface-2)' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '1.3rem' }}>{listing.image}</span>
                              <span style={{ fontWeight: '600', color: 'var(--m-text)', fontSize: '0.82rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>{listing.category}</td>
                          <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.875rem' }}>${listing.price}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--m-text-secondary)', fontSize: '0.8rem' }}>{listing.seller}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: st.bg, color: st.color, fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                              <st.Icon size={11} /> {st.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--m-text-muted)', fontSize: '0.78rem' }}>{listing.createdAt}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)' }}><Eye size={14} /></button>
                              {listing.status === 'pending' && (
                                <>
                                  <button style={{ padding: '3px 8px', backgroundColor: 'var(--m-success-bg)', color: 'var(--m-success)', border: 'none', borderRadius: '5px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>✓ Aprobar</button>
                                  <button style={{ padding: '3px 8px', backgroundColor: 'var(--m-danger-bg)', color: 'var(--m-danger)', border: 'none', borderRadius: '5px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>✕ Rechazar</button>
                                </>
                              )}
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

          {/* ── MEDIACIÓN ── */}
          {tab === 'mediacion' && (
            <>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
                {[
                  { label: 'Total disputas',   value: MOCK_DISPUTES.length, color: 'var(--m-text-secondary)',  bg: 'var(--m-surface-2)', Icon: MessageSquare },
                  { label: 'Abiertas',         value: openDisputes,         color: AMBER,      bg: 'var(--m-warning-bg)', Icon: AlertTriangle },
                  { label: 'En mediación',     value: mediatingD,           color: PURPLE,     bg: 'var(--m-purple-bg)', Icon: Scale         },
                  { label: 'Resueltas',        value: resolvedDisputes,     color: GREEN,      bg: 'var(--m-success-bg)', Icon: CheckCheck    },
                ].map((k, i) => (
                  <div key={i} style={{ backgroundColor: k.bg, border: `1px solid ${k.color}22`, borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <k.Icon size={18} color={k.color} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{k.label}</p>
                      <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: k.color }}>{k.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Split panel: list + detail */}
              <div style={{ display: 'grid', gridTemplateColumns: selectedDispute ? '380px 1fr' : '1fr', gap: '16px', alignItems: 'start' }}>

                {/* List */}
                <div>
                  {/* Filters */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }} size={13} color="#9CA3AF" />
                      <input type="text" placeholder="Buscar disputa..." value={disputeSearch} onChange={e => setDisputeSearch(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px 8px 28px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {(['all', 'abierta', 'en-mediacion', 'resuelta', 'cerrada'] as const).map(f => (
                      <button key={f} onClick={() => setDisputeFilter(f)}
                        style={{ padding: '5px 11px', borderRadius: '20px', border: `1px solid ${disputeFilter === f ? PURPLE : 'var(--m-border)'}`, backgroundColor: disputeFilter === f ? PURPLE : 'var(--m-surface)', color: disputeFilter === f ? '#FFF' : 'var(--m-text-secondary)', fontWeight: disputeFilter === f ? '700' : '400', cursor: 'pointer', fontSize: '0.72rem' }}>
                        {f === 'all' ? 'Todas' : DISPUTE_STATUS[f as DisputeStatus]?.label ?? f}
                      </button>
                    ))}
                  </div>

                  {/* Dispute cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredDisputes.length === 0 && (
                      <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center', color: 'var(--m-text-muted)', fontSize: '0.82rem' }}>
                        No hay disputas con ese filtro
                      </div>
                    )}
                    {filteredDisputes.map(d => {
                      const sc = DISPUTE_STATUS[d.status];
                      const selected = selectedDispute?.id === d.id;
                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDispute(selected ? null : d)}
                          style={{ backgroundColor: selected ? '#F5F3FF' : 'var(--m-surface)', border: `1px solid ${selected ? PURPLE : 'var(--m-border)'}`, borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.2rem' }}>{d.itemEmoji}</span>
                              <div>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.82rem', color: 'var(--m-text)' }}>{d.id}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--m-text-muted)' }}>{d.itemTitle}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '20px', backgroundColor: sc.bg, color: sc.color, fontSize: '0.65rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <sc.Icon size={9} /> {sc.label}
                              </span>
                              <span style={{ fontSize: '0.65rem', color: PRIORITY_CFG[d.priority].color, fontWeight: '700' }}>
                                ● {PRIORITY_CFG[d.priority].label}
                              </span>
                            </div>
                          </div>
                          <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: 'var(--m-text-secondary)' }}>
                            🧑 {d.buyer} → 🏪 {d.seller}
                          </p>
                          <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: 'var(--m-text-muted)', fontStyle: 'italic' }}>"{d.reason}"</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--m-text-muted)' }}>{d.openedAt} · {d.messages.length} mensajes</span>
                            <ChevronRight size={12} color={selected ? PURPLE : 'var(--m-text-muted)'} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detail panel */}
                {selectedDispute && (
                  <div style={{ position: 'sticky', top: '0', height: 'calc(100vh - 260px)', minHeight: '500px' }}>
                    <DisputeDetail
                      dispute={selectedDispute}
                      onClose={() => setSelectedDispute(null)}
                    />
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}