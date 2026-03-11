/**
 * 📱 Integraciones Redes Sociales
 * Meta, Instagram, WhatsApp, TikTok, Pinterest — catálogos y shopping
 */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { ExternalLink, Settings2, CheckCircle2, AlertCircle, Clock, Zap, ShoppingBag } from 'lucide-react';
import { Smartphone } from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }
const ORANGE = '#FF6835';
type Status = 'connected' | 'sandbox' | 'pending' | 'coming-soon';

interface SocialPlatform {
  id: string; emoji: string; name: string;
  description: string; color: string; bg: string;
  status: Status; features: string[];
  badge?: string; requires?: string;
  docsUrl?: string;
}

const PLATFORMS: SocialPlatform[] = [
  {
    id: 'meta', emoji: '📘', name: 'Meta Business Suite',
    description: 'Centro de control para todas las integraciones Meta. Se necesita para Instagram, WhatsApp y Facebook. App ID + App Secret.',
    color: '#1877F2', bg: 'var(--m-info-bg)',
    status: 'pending', features: ['App ID', 'Pixel', 'Catálogo', 'Commerce Manager'],
    badge: 'Requerido para las demás', docsUrl: 'https://developers.facebook.com',
  },
  {
    id: 'instagram', emoji: '📸', name: 'Instagram Shopping',
    description: 'Publicá y etiquetá productos en posts y stories. Catálogo sincronizado automáticamente.',
    color: '#E1306C', bg: 'var(--m-danger-bg)',
    status: 'pending', features: ['Catálogo', 'Tags en posts', 'Stories', 'Shop tab'],
    requires: 'Requiere Meta Business Suite', docsUrl: 'https://developers.facebook.com/docs/instagram',
  },
  {
    id: 'whatsapp', emoji: '💬', name: 'WhatsApp Business',
    description: 'Catálogo de productos en WhatsApp. Notificaciones de pedidos y atención al cliente.',
    color: '#25D366', bg: 'var(--m-success-bg)',
    status: 'pending', features: ['Catálogo WA', 'Mensajes', 'Pedidos', 'Notificaciones'],
    requires: 'Requiere Meta Business Suite', docsUrl: 'https://developers.facebook.com/docs/whatsapp',
  },
  {
    id: 'facebook', emoji: '📗', name: 'Facebook Shops',
    description: 'Tienda completa dentro de Facebook. Sincronización de catálogo y gestión de pedidos.',
    color: '#1877F2', bg: 'var(--m-info-bg)',
    status: 'pending', features: ['Facebook Shop', 'Catálogo', 'Marketplace', 'Ads'],
    requires: 'Requiere Meta Business Suite', docsUrl: 'https://developers.facebook.com',
  },
  {
    id: 'tiktok', emoji: '🎵', name: 'TikTok Shop',
    description: 'Integración con TikTok for Business para catálogo y compras dentro de la app.',
    color: '#000000', bg: 'var(--m-surface-2)',
    status: 'coming-soon', features: ['Catálogo TikTok', 'TikTok Ads', 'Shop', 'Live Shopping'],
    badge: 'Próximamente', docsUrl: 'https://developers.tiktok.com',
  },
  {
    id: 'pinterest', emoji: '📌', name: 'Pinterest Shopping',
    description: 'Product Pins y catálogo sincronizado para llegar a usuarios en modo descubrimiento.',
    color: '#E60023', bg: 'var(--m-danger-bg)',
    status: 'coming-soon', features: ['Product Pins', 'Catálogo', 'Ads', 'Collections'],
    badge: 'Próximamente', docsUrl: 'https://developers.pinterest.com',
  },
];

const STATUS_META: Record<Status, { label: string; color: string; bg: string; Icon: any }> = {
  connected:     { label: 'Conectada',   color: 'var(--m-success)', bg: 'var(--m-success-bg)', Icon: CheckCircle2 },
  sandbox:       { label: 'Sandbox',     color: 'var(--m-warning)', bg: 'var(--m-warning-bg)', Icon: AlertCircle  },
  pending:       { label: 'Sin conectar',color: 'var(--m-text-muted)', bg: 'var(--m-surface-2)', Icon: Clock        },
  'coming-soon': { label: 'Próximamente',color: 'var(--m-info)', bg: 'var(--m-info-border)', Icon: Zap          },
};

export function IntegracionesRRSSView({ onNavigate }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Smartphone}
        title="Redes Sociales"
        subtitle="Publicá tu catálogo en redes y vendé donde está tu audiencia"
        actions={[{ label: '← Integraciones', onClick: () => onNavigate('integraciones') }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: 'var(--m-bg)' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Plataformas',    value: PLATFORMS.length,                                         color: 'var(--m-text)' },
            { label: 'Disponibles',    value: PLATFORMS.filter(p => p.status !== 'coming-soon').length, color: '#EC4899' },
            { label: 'Próximamente',   value: PLATFORMS.filter(p => p.status === 'coming-soon').length, color: 'var(--m-info)' },
            { label: 'Conectadas',     value: PLATFORMS.filter(p => p.status === 'connected').length,   color: 'var(--m-success)' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, backgroundColor: 'var(--m-surface)', borderRadius: 10, padding: '12px 16px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Meta callout */}
        <div style={{ marginBottom: 20, padding: '12px 18px', backgroundColor: 'var(--m-info-bg)', border: '1.5px solid #BFDBFE', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>📘</span>
          <div>
            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--m-info-text)' }}>Meta Business Suite es el punto de partida</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--m-info-text)', marginLeft: 8 }}>
              Instagram, WhatsApp y Facebook Shops requieren que primero configures una app en Meta for Developers.
            </span>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {PLATFORMS.map(p => {
            const sm = STATUS_META[p.status];
            const SIcon = sm.Icon;
            const isExp = expandedId === p.id;
            return (
              <div key={p.id} style={{
                backgroundColor: 'var(--m-surface)', borderRadius: 14,
                border: p.id === 'meta' ? `1.5px solid ${p.color}55` : '1px solid #E5E7EB',
                overflow: 'hidden',
                opacity: p.status === 'coming-soon' ? 0.75 : 1,
              }}>
                <div style={{ height: 3, backgroundColor: p.color }} />
                <div style={{ padding: '16px 18px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                      {p.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: '800', color: 'var(--m-text)', fontSize: '0.95rem' }}>{p.name}</span>
                        {p.badge && <span style={{ padding: '2px 7px', backgroundColor: 'var(--m-surface-2)', color: 'var(--m-text-secondary)', borderRadius: 4, fontSize: '0.62rem', fontWeight: '700' }}>{p.badge}</span>}
                      </div>
                      {p.requires && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--m-text-muted)', fontStyle: 'italic' }}>{p.requires}</span>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: 'var(--m-text-muted)', lineHeight: 1.5 }}>{p.description}</p>

                  {/* Features */}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                    {p.features.map(f => (
                      <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', backgroundColor: p.bg, color: p.color, borderRadius: 4, fontSize: '0.68rem', fontWeight: '600' }}>
                        <ShoppingBag size={9} />{f}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', backgroundColor: sm.bg, color: sm.color, borderRadius: 20, fontSize: '0.7rem', fontWeight: '700' }}>
                      <SIcon size={11} /> {sm.label}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.docsUrl && (
                        <a href={p.docsUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: '1px solid #E5E7EB', backgroundColor: 'var(--m-surface-2)', color: 'var(--m-text-secondary)', fontSize: '0.72rem', fontWeight: '600', textDecoration: 'none' }}>
                          <ExternalLink size={11} /> Docs
                        </a>
                      )}
                      {p.status !== 'coming-soon' && (
                        <button onClick={() => setExpandedId(isExp ? null : p.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, border: 'none', backgroundColor: p.color, color: 'var(--m-surface)', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}>
                          <Settings2 size={11} /> Conectar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Config */}
                  {isExp && (
                    <div style={{ marginTop: 14, padding: '14px', backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text-secondary)' }}>Configuración — {p.name}</p>
                      {['App ID', 'App Secret', 'Access Token'].map((field, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--m-text-muted)', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field}</label>
                          <input type={i > 0 ? 'password' : 'text'} placeholder={field}
                            style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--m-surface)' }}
                            onFocus={e => (e.target.style.borderColor = p.color)}
                            onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                          />
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button style={{ flex: 1, padding: '8px', backgroundColor: p.color, color: 'var(--m-surface)', border: 'none', borderRadius: 7, fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                          Guardar y conectar
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
    </div>
  );
}