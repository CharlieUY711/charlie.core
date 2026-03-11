/**
 * ⚙️ Integraciones Servicios
 * Comunicaciones, email, analytics y automatización
 */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { ExternalLink, Settings2, CheckCircle2, AlertCircle, Clock, Zap, Send, BarChart2, GitBranch, Shield } from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }
const ORANGE = '#FF6835';
type Status = 'connected' | 'sandbox' | 'pending' | 'coming-soon';
type Category = 'messaging' | 'email' | 'analytics' | 'automation' | 'identity';

interface Service {
  id: string; emoji: string; name: string;
  description: string; color: string; bg: string;
  category: Category; status: Status; features: string[];
  badge?: string; docsUrl?: string;
  configFields?: { label: string; type: 'text' | 'password' | 'tel' }[];
  navigateTo?: MainSection;   // ← abre panel dedicado en lugar de expandir inline
}

const SERVICES: Service[] = [
  // ── Mensajería ──────────────────────────────────
  {
    id: 'twilio', emoji: '📞', name: 'Twilio',
    description: 'SMS, llamadas y WhatsApp Business API. El estándar de la industria para comunicaciones programables.',
    color: '#F22F46', bg: 'var(--m-danger-bg)',
    category: 'messaging', status: 'pending',
    features: ['SMS', 'WhatsApp', 'Voz', 'Verify OTP'],
    docsUrl: 'https://www.twilio.com/docs',
    configFields: [
      { label: 'Account SID', type: 'text' },
      { label: 'Auth Token', type: 'password' },
      { label: 'Número SMS', type: 'tel' },
      { label: 'Número WhatsApp', type: 'tel' },
    ],
  },
  // ── Email ──────────────────────────────────────
  {
    id: 'resend', emoji: '📨', name: 'Resend',
    description: 'Email transaccional moderno. API simple, alta deliverabilidad y analytics integrados.',
    color: '#000000', bg: 'var(--m-surface-2)',
    category: 'email', status: 'pending',
    features: ['Transaccional', 'Templates', 'Analytics', 'Webhooks'],
    docsUrl: 'https://resend.com/docs',
    configFields: [{ label: 'API Key', type: 'password' }],
    badge: 'Recomendado',
  },
  {
    id: 'sendgrid', emoji: '📧', name: 'SendGrid / Twilio Email',
    description: 'Plataforma de email transaccional y marketing de Twilio. Alta escala y deliverabilidad.',
    color: '#1A82E2', bg: 'var(--m-info-bg)',
    category: 'email', status: 'pending',
    features: ['Transaccional', 'Bulk', 'Templates', 'Analytics'],
    docsUrl: 'https://docs.sendgrid.com',
    configFields: [{ label: 'API Key', type: 'password' }],
  },
  // ── Analytics ──────────────────────────────────
  {
    id: 'ga4', emoji: '📊', name: 'Google Analytics 4',
    description: 'Seguimiento de eventos, conversiones y comportamiento de usuarios. Integración vía GTM o snippet directo.',
    color: '#E37400', bg: 'var(--m-warning-bg)',
    category: 'analytics', status: 'pending',
    features: ['Eventos', 'Ecommerce', 'Funnels', 'Audiences'],
    docsUrl: 'https://developers.google.com/analytics',
    configFields: [{ label: 'Measurement ID (G-XXXXXXXX)', type: 'text' }],
  },
  {
    id: 'gtm', emoji: '🏷️', name: 'Google Tag Manager',
    description: 'Gestión centralizada de scripts y píxeles sin tocar el código. Snippet de contenedor.',
    color: '#4285F4', bg: 'var(--m-info-bg)',
    category: 'analytics', status: 'pending',
    features: ['Tags', 'Triggers', 'Variables', 'Preview'],
    docsUrl: 'https://tagmanager.google.com',
    configFields: [{ label: 'Container ID (GTM-XXXXXXX)', type: 'text' }],
  },
  {
    id: 'hotjar', emoji: '🔥', name: 'Hotjar',
    description: 'Mapas de calor, grabaciones de sesiones y encuestas para entender el comportamiento.',
    color: '#FD3A5C', bg: 'var(--m-danger-bg)',
    category: 'analytics', status: 'coming-soon',
    features: ['Heatmaps', 'Recordings', 'Surveys', 'Funnels'],
    docsUrl: 'https://help.hotjar.com',
  },
  // ── Automatización ──────────────────────────────
  {
    id: 'zapier', emoji: '⚡', name: 'Zapier',
    description: 'Conecta Charlie con más de 5,000 apps sin código. Automatizaciones por eventos del sistema.',
    color: '#FF4A00', bg: 'var(--m-primary-10)',
    category: 'automation', status: 'pending',
    features: ['Triggers', 'Actions', '5000+ apps', 'Multi-step'],
    docsUrl: 'https://zapier.com/developer',
    configFields: [{ label: 'Webhook URL de Zapier', type: 'text' }],
  },
  {
    id: 'n8n', emoji: '🔀', name: 'n8n',
    description: 'Automatización open-source self-hosted. Alternativa más potente y económica que Zapier para uso técnico.',
    color: '#EA4B71', bg: 'var(--m-danger-bg)',
    category: 'automation', status: 'coming-soon',
    features: ['Visual flows', 'Self-hosted', 'Open-source', '400+ nodes'],
    docsUrl: 'https://docs.n8n.io',
  },
  // ── Identidad & KYC ─────────────────────────────
  {
    id: 'metamap', emoji: '🛡️', name: 'MetaMap',
    description: 'KYC y verificación de identidad: documento + selfie + liveness detection. Se activa automáticamente al comprar productos con restricción de edad (+18).',
    color: 'var(--m-text)', bg: 'var(--m-surface-2)',
    category: 'identity', status: 'pending',
    features: ['Documento ID', 'Selfie + Liveness', 'Verificación de edad', '6 países LATAM'],
    badge: 'Edad +18',
    docsUrl: 'https://docs.metamap.com',
    navigateTo: 'metamap-config',
  },
];

const STATUS_META: Record<Status, { label: string; color: string; bg: string; Icon: any }> = {
  connected:     { label: 'Conectado',   color: 'var(--m-success)', bg: 'var(--m-success-bg)', Icon: CheckCircle2 },
  sandbox:       { label: 'Sandbox',     color: 'var(--m-warning)', bg: 'var(--m-warning-bg)', Icon: AlertCircle  },
  pending:       { label: 'Sin conectar',color: 'var(--m-text-muted)', bg: 'var(--m-surface-2)', Icon: Clock        },
  'coming-soon': { label: 'Próximamente',color: 'var(--m-info)', bg: 'var(--m-info-border)', Icon: Zap          },
};

const CAT_META: Record<Category, { label: string; icon: React.ReactNode; color: string }> = {
  messaging:  { label: 'Mensajería',     icon: <Send size={13} />,      color: '#F22F46' },
  email:      { label: 'Email',          icon: <Send size={13} />,      color: '#1A82E2' },
  analytics:  { label: 'Analytics',     icon: <BarChart2 size={13} />, color: '#E37400' },
  automation: { label: 'Automatización', icon: <GitBranch size={13} />, color: '#EA4B71' },
  identity:   { label: 'Identidad & KYC', icon: <Shield size={13} />,  color: 'var(--m-text)' },
};

type CatFilter = 'all' | Category;

export function IntegracionesServiciosView({ onNavigate }: Props) {
  const [catFilter, setCatFilter]   = useState<CatFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});

  const filtered = SERVICES.filter(s => catFilter === 'all' || s.category === catFilter);

  const handleFieldChange = (serviceId: string, fieldLabel: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] ?? {}), [fieldLabel]: value },
    }));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Settings2}
        title="Servicios"
        subtitle="Comunicaciones, analytics y automatizaciones transversales"
        actions={[{ label: '← Integraciones', onClick: () => onNavigate('integraciones') }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: 'var(--m-bg)' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Servicios',      value: SERVICES.length,                                          color: 'var(--m-text)' },
            { label: 'Mensajería',     value: SERVICES.filter(s => s.category === 'messaging').length,  color: '#F22F46' },
            { label: 'Email',          value: SERVICES.filter(s => s.category === 'email').length,      color: '#1A82E2' },
            { label: 'Automatización', value: SERVICES.filter(s => s.category === 'automation').length, color: '#EA4B71' },
            { label: 'Identidad',      value: SERVICES.filter(s => s.category === 'identity').length,   color: 'var(--m-text)' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, backgroundColor: 'var(--m-surface)', borderRadius: 10, padding: '12px 16px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {(['all', 'messaging', 'email', 'analytics', 'automation', 'identity'] as CatFilter[]).map(f => (
            <button key={f} onClick={() => setCatFilter(f)}
              style={{
                padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
                backgroundColor: catFilter === f ? '#8B5CF6' : 'var(--m-surface)',
                color: catFilter === f ? '#fff' : 'var(--m-text-secondary)',
                fontSize: '0.78rem', fontWeight: '600',
                border: `1.5px solid ${catFilter === f ? '#8B5CF6' : 'var(--m-border)'}`,
              }}>
              {f === 'all' ? 'Todos' : CAT_META[f as Category].label}
            </button>
          ))}
        </div>

        {/* Cards grouped by category */}
        {(['messaging', 'email', 'analytics', 'automation', 'identity'] as Category[]).map(cat => {
          const items = filtered.filter(s => s.category === cat);
          if (!items.length) return null;
          const cm = CAT_META[cat];
          return (
            <div key={cat} style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--m-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, backgroundColor: cm.color + '22', color: cm.color }}>
                  {cm.icon}
                </span>
                {cm.label}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {items.map(s => {
                  const sm = STATUS_META[s.status];
                  const SIcon = sm.Icon;
                  const isExp = expandedId === s.id;
                  return (
                    <div key={s.id} style={{
                      backgroundColor: 'var(--m-surface)', borderRadius: 14,
                      border: s.badge === 'Recomendado' ? `1.5px solid ${s.color}66` : '1px solid #E5E7EB',
                      overflow: 'hidden',
                      opacity: s.status === 'coming-soon' ? 0.75 : 1,
                    }}>
                      <div style={{ height: 3, backgroundColor: s.color }} />
                      <div style={{ padding: '16px 18px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                            {s.emoji}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                              <span style={{ fontWeight: '800', color: 'var(--m-text)', fontSize: '0.95rem' }}>{s.name}</span>
                              {s.badge && <span style={{ padding: '2px 7px', backgroundColor: s.bg, color: s.color, borderRadius: 4, fontSize: '0.62rem', fontWeight: '700' }}>{s.badge}</span>}
                            </div>
                          </div>
                        </div>

                        <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: 'var(--m-text-muted)', lineHeight: 1.5 }}>{s.description}</p>

                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                          {s.features.map(f => (
                            <span key={f} style={{ padding: '2px 8px', backgroundColor: s.bg, color: s.color, borderRadius: 4, fontSize: '0.68rem', fontWeight: '600' }}>{f}</span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', backgroundColor: sm.bg, color: sm.color, borderRadius: 20, fontSize: '0.7rem', fontWeight: '700' }}>
                            <SIcon size={11} /> {sm.label}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {s.docsUrl && (
                              <a href={s.docsUrl} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: '1px solid #E5E7EB', backgroundColor: 'var(--m-surface-2)', color: 'var(--m-text-secondary)', fontSize: '0.72rem', fontWeight: '600', textDecoration: 'none' }}>
                                <ExternalLink size={11} /> Docs
                              </a>
                            )}
                            {s.status !== 'coming-soon' && s.configFields && !s.navigateTo && (
                              <button onClick={() => setExpandedId(isExp ? null : s.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, border: 'none', backgroundColor: s.color, color: 'var(--m-surface)', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}>
                                <Settings2 size={11} /> Configurar
                              </button>
                            )}
                            {s.status !== 'coming-soon' && s.navigateTo && (
                              <button onClick={() => onNavigate(s.navigateTo!)}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, border: 'none', backgroundColor: s.color, color: 'var(--m-surface)', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}>
                                <Shield size={11} /> Abrir panel
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Config */}
                        {isExp && s.configFields && (
                          <div style={{ marginTop: 14, padding: '14px', backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB' }}>
                            <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text-secondary)' }}>Configuración — {s.name}</p>
                            {s.configFields.map((field, i) => (
                              <div key={i} style={{ marginBottom: 8 }}>
                                <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--m-text-muted)', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</label>
                                <input
                                  type={field.type}
                                  value={formValues[s.id]?.[field.label] ?? ''}
                                  onChange={e => handleFieldChange(s.id, field.label, e.target.value)}
                                  placeholder={field.label}
                                  style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--m-surface)' }}
                                  onFocus={e => (e.target.style.borderColor = s.color)}
                                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                                />
                              </div>
                            ))}
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <button style={{ flex: 1, padding: '8px', backgroundColor: s.color, color: 'var(--m-surface)', border: 'none', borderRadius: 7, fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                                Guardar y probar conexión
                              </button>
                              <button onClick={() => setExpandedId(null)}
                                style={{ padding: '8px 12px', backgroundColor: 'var(--m-surface)', color: 'var(--m-text-muted)', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: '0.78rem', cursor: 'pointer' }}>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}