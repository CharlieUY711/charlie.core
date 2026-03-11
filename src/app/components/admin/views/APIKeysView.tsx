/**
 * 🔑 API Keys
 * Gestión de API keys para dar acceso a terceros
 */
import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { Key, Plus, Trash2, Copy, Check, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { getApiKeys, createApiKey, deleteApiKey, type ApiKey } from '../../../services/integracionesApi';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE = '#FF6835';

const PERMISOS_DISPONIBLES = [
  { id: 'read:pedidos', label: 'Leer pedidos' },
  { id: 'write:pedidos', label: 'Escribir pedidos' },
  { id: 'read:productos', label: 'Leer productos' },
  { id: 'write:productos', label: 'Escribir productos' },
  { id: 'read:personas', label: 'Leer personas' },
  { id: 'webhook:eventos', label: 'Webhook eventos' },
];

export function APIKeysView({ onNavigate }: Props) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState<{ nombre: string; descripcion: string; permisos: string[]; expira_en?: string }>({
    nombre: '',
    descripcion: '',
    permisos: [],
  });
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const data = await getApiKeys();
      setApiKeys(data);
    } catch (err) {
      console.error('Error cargando API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKey.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    try {
      const result = await createApiKey(newKey);
      setCreatedKey(result.key || null);
      setNewKey({ nombre: '', descripcion: '', permisos: [] });
      await loadKeys();
    } catch (err) {
      console.error('Error creando API key:', err);
      alert('Error al crear la API key');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de revocar esta API key? No se podrá usar más.')) return;
    setDeletingId(id);
    try {
      await deleteApiKey(id);
      await loadKeys();
    } catch (err) {
      console.error('Error revocando API key:', err);
      alert('Error al revocar la API key');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const activeCount = apiKeys.filter(k => k.estado === 'activo').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Key}
        title="API Keys"
        subtitle="Gestioná las API keys para dar acceso a terceros a tu plataforma"
        actions={[{ label: '← Integraciones', onClick: () => onNavigate('integraciones') }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: 'var(--m-bg)' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'API Keys', value: loading ? '...' : apiKeys.length, color: 'var(--m-text)' },
            { label: 'Activas', value: loading ? '...' : activeCount, color: 'var(--m-success)' },
            { label: 'Revocadas', value: loading ? '...' : apiKeys.filter(k => k.estado === 'revocado').length, color: 'var(--m-text-muted)' },
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

        {/* Botón Nueva API Key */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 8,
              backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none',
              fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Nueva API Key
          </button>
        </div>

        {/* Lista de API Keys */}
        <div style={{ display: 'grid', gap: 12 }}>
          {apiKeys.map(key => (
            <div key={key.id} style={{
              backgroundColor: 'var(--m-surface)', borderRadius: 12,
              border: '1px solid #E5E7EB',
              padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: '800', color: 'var(--m-text)', fontSize: '0.95rem' }}>{key.nombre}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: '0.65rem', fontWeight: '700',
                      backgroundColor: key.estado === 'activo' ? '#D1FAE5' : 'var(--m-surface-2)',
                      color: key.estado === 'activo' ? '#10B981' : 'var(--m-text-muted)',
                    }}>
                      {key.estado === 'activo' ? 'Activa' : 'Revocada'}
                    </span>
                  </div>
                  {key.descripcion && (
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>{key.descripcion}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(key.id)}
                  disabled={deletingId === key.id || key.estado === 'revocado'}
                  style={{
                    padding: '6px 10px', borderRadius: 6, border: 'none',
                    backgroundColor: deletingId === key.id || key.estado === 'revocado' ? '#F3F4F6' : 'var(--m-danger-bg)',
                    color: deletingId === key.id || key.estado === 'revocado' ? '#9CA3AF' : 'var(--m-danger)',
                    cursor: deletingId === key.id || key.estado === 'revocado' ? 'not-allowed' : 'pointer',
                    fontSize: '0.72rem', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Trash2 size={12} /> {deletingId === key.id ? 'Revocando...' : 'Revocar'}
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: '0 0 auto' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)', fontWeight: '700' }}>Prefijo: </span>
                  <code style={{
                    padding: '3px 8px', borderRadius: 4, backgroundColor: 'var(--m-surface-2)',
                    border: '1px solid #E5E7EB', fontSize: '0.75rem', fontFamily: 'monospace',
                    color: 'var(--m-text-secondary)',
                  }}>
                    {key.key_prefix}...
                  </code>
                </div>
                {key.ultimo_uso && (
                  <div style={{ flex: '0 0 auto' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)', fontWeight: '700' }}>Último uso: </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)' }}>
                      {new Date(key.ultimo_uso).toLocaleString()}
                    </span>
                  </div>
                )}
                <div style={{ flex: '0 0 auto' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)', fontWeight: '700' }}>Usos totales: </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)', fontWeight: '600' }}>{key.usos_totales}</span>
                </div>
              </div>

              {/* Permisos */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)', fontWeight: '700' }}>Permisos: </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {key.permisos.length > 0 ? (
                    key.permisos.map(perm => (
                      <span key={perm} style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: '600',
                        backgroundColor: 'var(--m-info-bg)', color: 'var(--m-info)',
                      }}>
                        {PERMISOS_DISPONIBLES.find(p => p.id === perm)?.label || perm}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: 'var(--m-text-muted)', fontStyle: 'italic' }}>Sin permisos</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {apiKeys.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--m-text-muted)' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>🔑</p>
            <p style={{ fontWeight: '600' }}>No hay API keys creadas</p>
          </div>
        )}
      </div>

      {/* Modal crear API Key */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--m-surface)', borderRadius: 12, padding: '24px',
            width: '90%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
          }}>
            {createdKey ? (
              <>
                <div style={{ marginBottom: 16, padding: '12px', backgroundColor: 'var(--m-warning-bg)', borderRadius: 8, border: '1.5px solid #F59E0B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <AlertTriangle size={16} color="#F59E0B" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--m-warning-text)' }}>
                      ¡Importante! Esta key solo se mostrará UNA VEZ
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--m-warning-text)' }}>
                    Copiá la key ahora. No podrás verla de nuevo después de cerrar este modal.
                  </p>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--m-text-muted)', display: 'block', marginBottom: 6 }}>
                    Tu API Key
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <code style={{
                      flex: 1, padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--m-surface-2)',
                      border: '1.5px solid #E5E7EB', fontSize: '0.85rem', fontFamily: 'monospace',
                      color: 'var(--m-text-secondary)', wordBreak: 'break-all',
                    }}>
                      {createdKey}
                    </code>
                    <button
                      onClick={() => handleCopy(createdKey, 'new')}
                      style={{
                        padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
                        backgroundColor: 'var(--m-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                      }}
                    >
                      {copiedId === 'new' ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCreatedKey(null);
                  }}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 8,
                    backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none',
                    fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                  }}
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: '800', color: 'var(--m-text)' }}>
                  Nueva API Key
                </h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--m-text-muted)', display: 'block', marginBottom: 6 }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={newKey.nombre}
                    onChange={e => setNewKey(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Ej: App móvil"
                    style={{
                      width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8,
                      fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = ORANGE)}
                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--m-text-muted)', display: 'block', marginBottom: 6 }}>
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={newKey.descripcion}
                    onChange={e => setNewKey(p => ({ ...p, descripcion: e.target.value }))}
                    placeholder="Descripción opcional"
                    style={{
                      width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8,
                      fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = ORANGE)}
                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--m-text-muted)', display: 'block', marginBottom: 8 }}>
                    Permisos
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {PERMISOS_DISPONIBLES.map(perm => (
                      <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newKey.permisos.includes(perm.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setNewKey(p => ({ ...p, permisos: [...p.permisos, perm.id] }));
                            } else {
                              setNewKey(p => ({ ...p, permisos: p.permisos.filter(id => id !== perm.id) }));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--m-text-secondary)' }}>{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleCreate}
                    disabled={!newKey.nombre.trim()}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 8,
                      backgroundColor: newKey.nombre.trim() ? ORANGE : 'var(--m-border)',
                      color: newKey.nombre.trim() ? '#fff' : 'var(--m-text-muted)',
                      border: 'none', fontSize: '0.85rem', fontWeight: '700',
                      cursor: newKey.nombre.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Crear API Key
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '10px 16px', borderRadius: 8, border: '1px solid #E5E7EB',
                      backgroundColor: 'var(--m-surface)', color: 'var(--m-text-muted)', fontSize: '0.85rem', fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
