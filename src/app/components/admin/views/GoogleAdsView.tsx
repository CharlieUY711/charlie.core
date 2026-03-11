import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Plus, ExternalLink, TrendingUp, Eye, MousePointer, DollarSign, BarChart2 } from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }

const BLUE = '#4285F4';

const CHART_DATA = [
  { date: '1 Feb', impresiones: 1280, clics: 24, costo: 3.20 },
  { date: '2 Feb', impresiones: 1420, clics: 31, costo: 4.10 },
  { date: '3 Feb', impresiones: 1780, clics: 28, costo: 3.75 },
  { date: '4 Feb', impresiones: 1230, clics: 19, costo: 2.50 },
  { date: '5 Feb', impresiones: 2340, clics: 42, costo: 5.60 },
  { date: '6 Feb', impresiones: 1980, clics: 38, costo: 5.10 },
  { date: '7 Feb', impresiones: 2560, clics: 55, costo: 7.30 },
];

type CampaignStatus = 'active' | 'paused' | 'draft';
interface AdCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  type: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
}

const MOCK_CAMPAIGNS: AdCampaign[] = [
  { id: '1', name: 'Electrónica - Search',    status: 'active', type: 'Búsqueda',  budget: 50,  spent: 32.40, impressions: 8420,  clicks: 312,  ctr: 3.7,  conversions: 18 },
  { id: '2', name: 'Moda - Display',          status: 'active', type: 'Display',   budget: 30,  spent: 21.80, impressions: 34200, clicks: 189,  ctr: 0.55, conversions: 7  },
  { id: '3', name: 'Brand Awareness',         status: 'paused', type: 'Búsqueda',  budget: 20,  spent: 0,     impressions: 0,     clicks: 0,    ctr: 0,    conversions: 0  },
  { id: '4', name: 'Remarketing General',     status: 'draft',  type: 'Remarketing', budget: 40, spent: 0,    impressions: 0,     clicks: 0,    ctr: 0,    conversions: 0  },
];

const STATUS_CONFIG: Record<CampaignStatus, { label: string; bg: string; color: string }> = {
  active: { label: 'Activa',  bg: 'var(--m-success-bg)', color: 'var(--m-success)' },
  paused: { label: 'Pausada', bg: 'var(--m-warning-bg)', color: 'var(--m-warning-text)' },
  draft:  { label: 'Borrador', bg: 'var(--m-surface-2)', color: 'var(--m-text-secondary)' },
};

export function GoogleAdsView({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<'campanas' | 'analiticas' | 'audiencias'>('campanas');

  const totalSpent = MOCK_CAMPAIGNS.reduce((s, c) => s + c.spent, 0);
  const totalImpressions = MOCK_CAMPAIGNS.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = MOCK_CAMPAIGNS.reduce((s, c) => s + c.clicks, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const totalConversions = MOCK_CAMPAIGNS.reduce((s, c) => s + c.conversions, 0);
  const roas = totalSpent > 0 ? (totalConversions * 35 / totalSpent).toFixed(1) : '0.0';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={TrendingUp}
        title="Google Ads Manager"
        subtitle="Gestiona tus campañas publicitarias"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('marketing') },
          { label: '+ Nueva Campaña', primary: true },
        ]}
      />

      {/* Sticky tabs */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ display: 'flex', padding: '0 28px' }}>
          {[
            { id: 'campanas' as const, label: 'Campañas' },
            { id: 'analiticas' as const, label: 'Analíticas' },
            { id: 'audiencias' as const, label: 'Audiencias' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '14px 18px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: activeTab === t.id ? BLUE : 'var(--m-text-muted)', fontWeight: activeTab === t.id ? '700' : '500', fontSize: '0.875rem', borderBottom: activeTab === t.id ? `2px solid ${BLUE}` : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        <div style={{ padding: '24px 28px', maxWidth: '1200px' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Gastado', value: `$${totalSpent.toFixed(2)}`, sub: `vs $0.00 mes anterior`, Icon: DollarSign, color: 'var(--m-text)' },
              { label: 'Impresiones', value: totalImpressions.toLocaleString(), sub: `+FCR vs mes anterior`, Icon: Eye, color: 'var(--m-success)' },
              { label: 'Clics', value: totalClicks.toLocaleString(), sub: `CTR: ${avgCTR}%`, Icon: MousePointer, color: 'var(--m-danger)' },
              { label: 'ROAS', value: `${roas}x`, sub: 'Excelente rendimiento', Icon: BarChart2, color: 'var(--m-purple)' },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>{s.label}</p>
                  <s.Icon size={16} color={s.color} />
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {activeTab === 'campanas' && (
            <>
              {/* Chart */}
              <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 20px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.95rem' }}>Rendimiento Últimos 7 Días</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={CHART_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--m-text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--m-text-muted)' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.8rem' }} />
                    <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                    <Line type="monotone" dataKey="impresiones" stroke={BLUE} strokeWidth={2} dot={false} name="Impresiones" />
                    <Line type="monotone" dataKey="clics" stroke="#10B981" strokeWidth={2} dot={false} name="Clics" />
                    <Line type="monotone" dataKey="costo" stroke="#F59E0B" strokeWidth={2} dot={false} name="Costo ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Campaigns table */}
              <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--m-text)' }}>Campañas Activas</h3>
                  <button style={{ padding: '9px 18px', backgroundColor: BLUE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={15} /> Crear Campaña
                  </button>
                </div>
                {MOCK_CAMPAIGNS.filter(c => c.status !== 'draft').length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--m-surface-2)' }}>
                        {['Nombre', 'Estado', 'Tipo', 'Presupuesto', 'Gastado', 'Impresiones', 'Clics', 'CTR', 'Conversiones'].map(h => (
                          <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_CAMPAIGNS.map((c, i) => {
                        const st = STATUS_CONFIG[c.status];
                        return (
                          <tr key={c.id} style={{ borderTop: '1px solid #F3F4F6', backgroundColor: i % 2 === 0 ? '#FFF' : 'var(--m-surface-2)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--m-text)', fontSize: '0.875rem' }}>{c.name}</td>
                            <td style={{ padding: '12px 14px' }}><span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: st.bg, color: st.color, fontSize: '0.72rem', fontWeight: '700' }}>{st.label}</span></td>
                            <td style={{ padding: '12px 14px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>{c.type}</td>
                            <td style={{ padding: '12px 14px', color: 'var(--m-text-secondary)', fontSize: '0.8rem' }}>${c.budget}/día</td>
                            <td style={{ padding: '12px 14px', color: 'var(--m-text-secondary)', fontSize: '0.8rem' }}>${c.spent.toFixed(2)}</td>
                            <td style={{ padding: '12px 14px', color: 'var(--m-text-secondary)', fontSize: '0.8rem' }}>{c.impressions.toLocaleString()}</td>
                            <td style={{ padding: '12px 14px', color: 'var(--m-text-secondary)', fontSize: '0.8rem' }}>{c.clicks}</td>
                            <td style={{ padding: '12px 14px', color: 'var(--m-text-secondary)', fontSize: '0.8rem' }}>{c.ctr}%</td>
                            <td style={{ padding: '12px 14px', color: 'var(--m-text-secondary)', fontSize: '0.8rem' }}>{c.conversions}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '50px', textAlign: 'center', color: 'var(--m-text-muted)' }}>
                    <TrendingUp size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p style={{ margin: '0 0 14px', fontWeight: '600' }}>No hay campañas</p>
                    <button style={{ padding: '10px 22px', backgroundColor: BLUE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem' }}>
                      Crear Campaña
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'analiticas' && (
            <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.95rem' }}>Rendimiento 30 días</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={[...CHART_DATA, ...CHART_DATA.map(d => ({ ...d, date: d.date.replace('Feb', 'Feb+'), impresiones: d.impresiones * 1.2, clics: d.clics * 1.15 }))]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--m-text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--m-text-muted)' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.8rem' }} />
                  <Line type="monotone" dataKey="impresiones" stroke={BLUE} strokeWidth={2} dot={false} name="Impresiones" />
                  <Line type="monotone" dataKey="clics" stroke="#10B981" strokeWidth={2} dot={false} name="Clics" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'audiencias' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {['Visitantes del sitio (30 días)', 'Compradores anteriores', 'Interesados en electrónica', 'Lookalike - VIP'].map((aud, i) => (
                <div key={i} style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--m-text)', fontSize: '0.875rem' }}>{aud}</p>
                    <p style={{ margin: '4px 0 0', color: 'var(--m-text-muted)', fontSize: '0.78rem' }}>Lista de remarketing</p>
                  </div>
                  <button style={{ padding: '7px 14px', border: `1px solid ${BLUE}`, borderRadius: '7px', backgroundColor: 'transparent', color: BLUE, fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}>
                    Usar en campaña
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Connect CTA */}
          <div style={{ backgroundColor: BLUE + '10', border: `1px solid ${BLUE}33`, borderRadius: '12px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={18} color="#FFF" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: '700', color: 'var(--m-text)', fontSize: '0.9rem' }}>Conecta tu cuenta de Google Ads</p>
              <p style={{ margin: '2px 0 0', color: 'var(--m-text-muted)', fontSize: '0.78rem' }}>Para ver y gestionar tus campañas reales, conecta tu cuenta de Google Ads usando la API oficial.</p>
            </div>
            <button style={{ padding: '10px 18px', backgroundColor: BLUE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              Ir a Google Ads <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}