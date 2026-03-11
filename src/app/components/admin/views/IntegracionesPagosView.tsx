/**
 * 💳 Pasarela de Pagos
 * Procesadores locales Uruguay + Latam/Global
 */
import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { ExternalLink, Settings2, CheckCircle2, AlertCircle, Clock, Zap, Star, CreditCard } from 'lucide-react';
import { getIntegraciones, type Integracion } from '../../../services/integracionesApi';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE = '#FF6835';

type Status = 'connected' | 'sandbox' | 'pending' | 'coming-soon';
type Region = 'uy' | 'latam' | 'global';
type ApiMode = 'api' | 'no-api' | 'redirect';

interface Provider {
  id: string; emoji: string; name: string;
  description: string; countries: string[];
  region: Region; apiMode: ApiMode; status: Status;
  badge?: string; category?: string;
  docsUrl?: string; recommended?: boolean;
}

// Mapeo de metadatos visuales por nombre de integración
const PROVIDER_METADATA: Record<string, Partial<Provider>> = {
  'plexo': { emoji: '🔵', countries: ['🇺🇾'], region: 'uy', apiMode: 'api', recommended: true },
  'mercadopago': { emoji: '💙', countries: ['🇺🇾', '🇦🇷', '🇧🇷', '🇨🇱'], region: 'latam', apiMode: 'api' },
};

// Helper para convertir Integracion a Provider
function integracionToProvider(integracion: Integracion): Provider {
  const metadata = PROVIDER_METADATA[integracion.nombre] || {};
  const config = integracion.config as any;
  
  // Mapear estado
  let status: Status = 'pending';
  if (integracion.estado === 'activo') status = 'connected';
  else if (integracion.estado === 'error') status = 'pending';
  else if (integracion.estado === 'configurando') status = 'sandbox';
  
  return {
    id: integracion.id,
    emoji: metadata.emoji || '💳',
    name: integracion.proveedor,
    description: `${integracion.proveedor} - ${integracion.nombre}`,
    countries: metadata.countries || ['🌎'],
    region: metadata.region || 'global',
    apiMode: metadata.apiMode || 'api',
    status,
    badge: config.badge,
    category: config.category,
    docsUrl: config.docsUrl,
    recommended: metadata.recommended || config.recommended || false,
  };
}

const STATUS_META: Record<Status, { label: string; color: string; bg: string; Icon: any }> = {
  connected:    { label: 'Conectada',   color: 'var(--m-success)', bg: 'var(--m-success-bg)', Icon: CheckCircle2 },
  sandbox:      { label: 'Sandbox',     color: 'var(--m-warning)', bg: 'var(--m-warning-bg)', Icon: AlertCircle  },
  pending:      { label: 'Sin conectar',color: 'var(--m-text-muted)', bg: 'var(--m-surface-2)', Icon: Clock        },
  'coming-soon':{ label: 'Próximamente',color: 'var(--m-info)', bg: 'var(--m-info-border)', Icon: Zap          },
};

const API_LABEL: Record<ApiMode, { label: string; color: string; bg: string }> = {
  api:      { label: 'Con API',       color: 'var(--m-success)', bg: 'var(--m-success-bg)' },
  'no-api': { label: 'Vía pasarela',  color: 'var(--m-purple)', bg: 'var(--m-purple-bg)' },
  redirect: { label: 'Redirección',   color: 'var(--m-warning)', bg: 'var(--m-warning-bg)' },
};

type Filter = 'all' | 'uy' | 'latam' | 'global';
type ApiFilter = 'all' | 'api' | 'no-api';

export function IntegracionesPagosView({ onNavigate }: Props) {
  const [regionFilter, setRegionFilter] = useState<Filter>('all');
  const [apiFilter, setApiFilter]       = useState<ApiFilter>('all');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [integraciones, setIntegraciones] = useState<Integracion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getIntegraciones({ tipo: 'pagos' });
        setIntegraciones(data);
      } catch (err) {
        console.error('Error cargando integraciones de pagos:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const PROVIDERS: Provider[] = integraciones.map(integracionToProvider);

  const filtered = PROVIDERS.filter(p => {
    const regionOk = regionFilter === 'all' || p.region === regionFilter || (regionFilter === 'latam' && p.region === 'global');
    const apiOk    = apiFilter === 'all' || (apiFilter === 'api' ? p.apiMode === 'api' : p.apiMode !== 'api');
    return regionOk && apiOk;
  });

  const connected = PROVIDERS.filter(p => p.status === 'connected').length;
  const sandbox   = PROVIDERS.filter(p => p.status === 'sandbox').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={CreditCard}
        title="Pasarela de Pagos"
        subtitle="Cobros online — Uruguay first, expansión Latam progresiva"
        actions={[{ label: '← Integraciones', onClick: () => onNavigate('integraciones') }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: 'var(--m-bg)' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Proveedores', value: loading ? '...' : PROVIDERS.length, color: 'var(--m-text)' },
            { label: 'Conectadas',  value: loading ? '...' : connected, color: 'var(--m-success)' },
            { label: 'Sandbox',     value: loading ? '...' : sandbox,   color: 'var(--m-warning)' },
            { label: 'Uruguay 🇺🇾',  value: loading ? '...' : PROVIDERS.filter(p => p.region === 'uy').length, color: ORANGE },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, backgroundColor: 'var(--m-surface)', borderRadius: 10, padding: '12px 16px',
              border: '1px solid #E5E7EB', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--m-text-muted)', alignSelf: 'center', marginRight: 4 }}>Región:</span>
          {(['all','uy','latam','global'] as Filter[]).map(f => (
            <button key={f} onClick={() => setRegionFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                backgroundColor: regionFilter === f ? ORANGE : 'var(--m-surface)',
                color: regionFilter === f ? '#fff' : 'var(--m-text-secondary)',
                fontSize: '0.78rem', fontWeight: '600',
                border: `1.5px solid ${regionFilter === f ? ORANGE : 'var(--m-border)'}`,
              }}
            >
              {{ all: 'Todos', uy: '🇺🇾 Uruguay', latam: '🌎 Latam', global: '🌐 Global' }[f]}
            </button>
          ))}
          <div style={{ width: 1, height: 28, backgroundColor: 'var(--m-border)', alignSelf: 'center', margin: '0 4px' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--m-text-muted)', alignSelf: 'center', marginRight: 4 }}>Integración:</span>
          {(['all','api','no-api'] as ApiFilter[]).map(f => (
            <button key={f} onClick={() => setApiFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                backgroundColor: apiFilter === f ? '#1F2937' : 'var(--m-surface)',
                color: apiFilter === f ? '#fff' : 'var(--m-text-secondary)',
                fontSize: '0.78rem', fontWeight: '600',
                border: `1.5px solid ${apiFilter === f ? '#1F2937' : 'var(--m-border)'}`,
              }}
            >
              {{ all: 'Todos', api: '⚡ Con API', 'no-api': '🔗 Sin API directo' }[f]}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map(p => {
            const sm = STATUS_META[p.status];
            const am = API_LABEL[p.apiMode];
            const SIcon = sm.Icon;
            const isExp = expandedId === p.id;
            return (
              <div key={p.id} style={{
                backgroundColor: 'var(--m-surface)', borderRadius: 14,
                border: p.recommended ? `1.5px solid ${ORANGE}` : '1px solid #E5E7EB',
                overflow: 'hidden', transition: 'box-shadow 0.15s',
                boxShadow: p.recommended ? `0 0 0 4px ${ORANGE}12` : 'none',
              }}>
                {/* accent */}
                <div style={{ height: 3, backgroundColor: sm.color }} />

                <div style={{ padding: '16px 18px' }}>
                  {/* header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      backgroundColor: 'var(--m-surface-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem', flexShrink: 0,
                    }}>
                      {p.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', color: 'var(--m-text)', fontSize: '0.95rem' }}>{p.name}</span>
                        {p.recommended && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', backgroundColor: `${ORANGE}18`, color: ORANGE, borderRadius: 4, fontSize: '0.62rem', fontWeight: '700' }}>
                            <Star size={9} fill={ORANGE} /> Recomendado UY
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                        {p.countries.map((c, i) => <span key={i} style={{ fontSize: '0.75rem' }}>{c}</span>)}
                        <span style={{ padding: '1px 7px', borderRadius: 4, fontSize: '0.62rem', fontWeight: '700', backgroundColor: am.bg, color: am.color }}>{am.label}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: 'var(--m-text-muted)', lineHeight: 1.5 }}>{p.description}</p>

                  {p.badge && p.apiMode !== 'api' && (
                    <div style={{ marginBottom: 10, padding: '6px 10px', backgroundColor: 'var(--m-surface-2)', borderRadius: 7, fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>
                      ℹ️ {p.badge}
                    </div>
                  )}

                  {/* Bottom row */}
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
                      {p.status !== 'coming-soon' && p.apiMode === 'api' && (
                        <button onClick={() => setExpandedId(isExp ? null : p.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, border: 'none', backgroundColor: p.status === 'connected' ? '#F3F4F6' : ORANGE, color: p.status === 'connected' ? '#374151' : 'var(--m-surface)', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}>
                          <Settings2 size={11} /> {p.status === 'connected' ? 'Config' : 'Conectar'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded config */}
                  {isExp && (
                    <div style={{ marginTop: 14, padding: '14px', backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text-secondary)' }}>Credenciales API — {p.name}</p>
                      {['Public Key / Client ID', 'Secret Key / Access Token'].map((field, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--m-text-muted)', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field}</label>
                          <input type={i === 1 ? 'password' : 'text'} placeholder={`${field}...`}
                            style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--m-surface)' }}
                            onFocus={e => (e.target.style.borderColor = ORANGE)}
                            onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                          />
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button style={{ flex: 1, padding: '8px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: 7, fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
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

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--m-text-muted)' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>🔍</p>
            <p style={{ fontWeight: '600' }}>Sin resultados para ese filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}