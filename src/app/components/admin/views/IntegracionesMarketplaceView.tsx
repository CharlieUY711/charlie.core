/**
 * 🏪 Integraciones Marketplace
 * Mercado Libre, MercadoPago (marketplace)
 */
import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { ExternalLink, Settings2, CheckCircle2, AlertCircle, Clock, Zap, Store, RefreshCw } from 'lucide-react';
import { getIntegraciones, updateIntegracion, pingIntegracion, getIntegracionLogs, type Integracion, type IntegracionLog } from '../../../services/integracionesApi';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE = '#FF6835';

const STATUS_META: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  activo: { label: 'Activo', color: 'var(--m-success)', bg: 'var(--m-success-bg)', Icon: CheckCircle2 },
  inactivo: { label: 'Inactivo', color: 'var(--m-text-muted)', bg: 'var(--m-surface-2)', Icon: Clock },
  error: { label: 'Error', color: 'var(--m-danger)', bg: 'var(--m-danger-bg)', Icon: AlertCircle },
  configurando: { label: 'Configurando', color: 'var(--m-warning)', bg: 'var(--m-warning-bg)', Icon: Zap },
};

// Campos específicos por proveedor
const PROVIDER_FIELDS: Record<string, Array<{ key: string; label: string; type: string; placeholder?: string }>> = {
  mercadolibre: [
    { key: 'clientId', label: 'Client ID', type: 'text', placeholder: '...' },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: '...' },
    { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: '...' },
    { key: 'refreshToken', label: 'Refresh Token', type: 'password', placeholder: '...' },
  ],
  mercadopago: [
    { key: 'publicKey', label: 'Public Key', type: 'text', placeholder: 'APP_USR-...' },
    { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' },
    { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: '...' },
  ],
};

export function IntegracionesMarketplaceView({ onNavigate }: Props) {
  const [integraciones, setIntegraciones] = useState<Integracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, Record<string, string>>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [logs, setLogs] = useState<Record<string, IntegracionLog[]>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getIntegraciones({ tipo: 'marketplace' });
        setIntegraciones(data);
        const initialConfig: Record<string, Record<string, string>> = {};
        data.forEach(int => {
          if (int.config && typeof int.config === 'object') {
            initialConfig[int.id] = int.config as Record<string, string>;
          }
        });
        setConfigValues(initialConfig);
      } catch (err) {
        console.error('Error cargando integraciones de marketplace:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (integracion: Integracion) => {
    try {
      const config = configValues[integracion.id] || {};
      await updateIntegracion(integracion.id, {
        config,
        estado: 'configurando',
      });
      const data = await getIntegraciones({ tipo: 'marketplace' });
      setIntegraciones(data);
      setExpandedId(null);
    } catch (err) {
      console.error('Error guardando configuración:', err);
      alert('Error al guardar la configuración');
    }
  };

  const handlePing = async (integracion: Integracion) => {
    setTestingId(integracion.id);
    try {
      await pingIntegracion(integracion.id);
      const data = await getIntegraciones({ tipo: 'marketplace' });
      setIntegraciones(data);
      loadLogs(integracion.id);
    } catch (err) {
      console.error('Error en ping:', err);
      alert('Error al probar la conexión');
    } finally {
      setTestingId(null);
    }
  };

  const handleSync = async (integracion: Integracion) => {
    setSyncingId(integracion.id);
    try {
      // TODO: implementar sincronización real
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Sincronización iniciada');
      loadLogs(integracion.id);
    } catch (err) {
      console.error('Error en sincronización:', err);
      alert('Error al sincronizar');
    } finally {
      setSyncingId(null);
    }
  };

  const loadLogs = async (id: string) => {
    try {
      const data = await getIntegracionLogs(id, 10);
      setLogs(p => ({ ...p, [id]: data }));
    } catch (err) {
      console.error('Error cargando logs:', err);
    }
  };

  const getFields = (nombre: string) => PROVIDER_FIELDS[nombre] || [];

  const activeCount = integraciones.filter(i => i.estado === 'activo').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Store}
        title="Marketplace"
        subtitle="Mercado Libre, MercadoPago — Sincronización bidireccional de productos y pedidos"
        actions={[{ label: '← Integraciones', onClick: () => onNavigate('integraciones') }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: 'var(--m-bg)' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Marketplaces', value: loading ? '...' : integraciones.length, color: 'var(--m-text)' },
            { label: 'Conectados', value: loading ? '...' : activeCount, color: 'var(--m-success)' },
            { label: 'Inactivos', value: loading ? '...' : integraciones.filter(i => i.estado === 'inactivo').length, color: 'var(--m-text-muted)' },
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

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {integraciones.map(integracion => {
            const sm = STATUS_META[integracion.estado] || STATUS_META.inactivo;
            const SIcon = sm.Icon;
            const isExp = expandedId === integracion.id;
            const fields = getFields(integracion.nombre);
            const config = configValues[integracion.id] || {};
            const integracionLogs = logs[integracion.id] || [];

            return (
              <div key={integracion.id} style={{
                backgroundColor: 'var(--m-surface)', borderRadius: 14,
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
              }}>
                <div style={{ height: 3, backgroundColor: sm.color }} />

                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      backgroundColor: 'var(--m-surface-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem', flexShrink: 0,
                    }}>
                      {integracion.nombre === 'mercadolibre' ? '🏪' : '💙'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '800', color: 'var(--m-text)', fontSize: '0.95rem', marginBottom: 4 }}>
                        {integracion.proveedor}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--m-text-muted)' }}>{integracion.nombre}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', backgroundColor: sm.bg, color: sm.color, borderRadius: 20, fontSize: '0.7rem', fontWeight: '700' }}>
                      <SIcon size={11} /> {sm.label}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setExpandedId(isExp ? null : integracion.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, border: 'none', backgroundColor: ORANGE, color: 'var(--m-surface)', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        <Settings2 size={11} /> {isExp ? 'Cerrar' : 'Configurar'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded config */}
                  {isExp && (
                    <div style={{ marginTop: 14, padding: '14px', backgroundColor: 'var(--m-surface-2)', borderRadius: 10, border: '1px solid #E5E7EB' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text-secondary)' }}>
                        Credenciales OAuth — {integracion.proveedor}
                      </p>

                      {fields.map(field => (
                        <div key={field.key} style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--m-text-muted)', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            value={config[field.key] || ''}
                            onChange={e => setConfigValues(p => ({
                              ...p,
                              [integracion.id]: { ...(p[integracion.id] || {}), [field.key]: e.target.value },
                            }))}
                            placeholder={field.placeholder || `${field.label}...`}
                            style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--m-surface)' }}
                            onFocus={e => (e.target.style.borderColor = ORANGE)}
                            onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                          />
                        </div>
                      ))}

                      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleSave(integracion)}
                          style={{ flex: 1, minWidth: 120, padding: '8px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: 7, fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => handlePing(integracion)}
                          disabled={testingId === integracion.id}
                          style={{ flex: 1, minWidth: 120, padding: '8px', backgroundColor: testingId === integracion.id ? '#E5E7EB' : 'var(--m-success)', color: testingId === integracion.id ? '#9CA3AF' : 'var(--m-surface)', border: 'none', borderRadius: 7, fontSize: '0.78rem', fontWeight: '700', cursor: testingId === integracion.id ? 'not-allowed' : 'pointer' }}
                        >
                          {testingId === integracion.id ? 'Probando...' : 'Test conexión'}
                        </button>
                        <button
                          onClick={() => handleSync(integracion)}
                          disabled={syncingId === integracion.id || integracion.estado !== 'activo'}
                          style={{ flex: 1, minWidth: 120, padding: '8px', backgroundColor: syncingId === integracion.id || integracion.estado !== 'activo' ? '#E5E7EB' : 'var(--m-info)', color: syncingId === integracion.id || integracion.estado !== 'activo' ? '#9CA3AF' : 'var(--m-surface)', border: 'none', borderRadius: 7, fontSize: '0.78rem', fontWeight: '700', cursor: syncingId === integracion.id || integracion.estado !== 'activo' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        >
                          <RefreshCw size={12} style={{ opacity: syncingId === integracion.id ? 0.5 : 1 }} />
                          {syncingId === integracion.id ? 'Sincronizando...' : 'Sincronizar'}
                        </button>
                      </div>

                      {/* Logs */}
                      {integracionLogs.length > 0 && (
                        <div style={{ marginTop: 14, padding: '10px', backgroundColor: 'var(--m-surface)', borderRadius: 7, border: '1px solid #E5E7EB' }}>
                          <p style={{ margin: '0 0 8px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--m-text-secondary)' }}>Últimos eventos</p>
                          <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                            {integracionLogs.map(log => (
                              <div key={log.id} style={{ padding: '4px 0', fontSize: '0.68rem', color: 'var(--m-text-muted)', borderBottom: '1px solid #F3F4F6' }}>
                                <span style={{ fontWeight: '600' }}>{new Date(log.created_at).toLocaleString()}</span>
                                {' — '}
                                <span style={{ color: log.nivel === 'error' ? '#EF4444' : log.nivel === 'warning' ? '#F59E0B' : 'var(--m-text-muted)' }}>
                                  {log.mensaje}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {integraciones.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--m-text-muted)' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>🏪</p>
            <p style={{ fontWeight: '600' }}>No hay integraciones de marketplace configuradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
