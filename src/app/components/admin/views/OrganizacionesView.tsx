/* =====================================================
   OrganizacionesView — Empresas y Organizaciones
   ===================================================== */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRegisterActions } from '../../shells/ActionBarContext';
import { DrawerShell } from '../../shells/DrawerShell';
import type { SheetDef } from '../../shells/DrawerShell.types';
import {
  getOrganizaciones, createOrganizacion, updateOrganizacion, deleteOrganizacion,
  type Organizacion,
} from '../../../services/organizacionesApi';
import {
  Building2, Mail, Phone, Globe, RefreshCw, Edit2, Trash2, MapPin, Plus,
} from 'lucide-react';

const ORANGE = '#FF6835';

const TIPOS_ORG = ['empresa', 'cooperativa', 'fundacion', 'gobierno', 'otro'];
const INDUSTRIAS = [
  'Tecnología', 'Retail', 'Agro', 'Construcción', 'Salud',
  'Educación', 'Finanzas', 'Logística', 'Manufactura', 'Servicios', 'Otro',
];

const colorPorTipo: Record<string, string> = {
  empresa: 'var(--m-info)', cooperativa: 'var(--m-success)', fundacion: 'var(--m-purple)',
  gobierno: 'var(--m-warning)', otro: 'var(--m-text-muted)',
};

const EMPTY: Omit<Organizacion, 'id' | 'created_at'> = {
  nombre: '', tipo: '', industria: '', email: '', telefono: '',
  sitio_web: '', direccion: { calle: '', ciudad: '', pais: '', cp: '' }, activo: true,
};

const sheets: SheetDef[] = [
  {
    id: 'general',
    title: 'Información general',
    fields: [
      { id: 'nombre',    label: 'Nombre / Razón Social', type: 'text',   required: true, placeholder: 'Ej: TechSur SA' },
      { id: 'tipo',      label: 'Tipo',                  type: 'select', row: 'row1',
        options: TIPOS_ORG.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })) },
      { id: 'industria', label: 'Industria',             type: 'select', row: 'row1',
        options: INDUSTRIAS.map(i => ({ value: i, label: i })) },
      { id: 'email',     label: 'Email',                 type: 'email',  row: 'row2', placeholder: 'contacto@empresa.com' },
      { id: 'telefono',  label: 'Teléfono',              type: 'tel',    row: 'row2', placeholder: '+598 2 123 4567' },
      { id: 'sitio_web', label: 'Sitio Web',             type: 'url',    placeholder: 'https://www.empresa.com' },
      { id: 'activo',    label: 'Organización activa',   type: 'toggle' },
    ],
  },
  {
    id: 'direccion',
    title: 'Dirección',
    fields: [
      { id: 'direccion_calle',  label: 'Calle y número', type: 'text', placeholder: 'Av. 18 de Julio 1234' },
      { id: 'direccion_ciudad', label: 'Ciudad',         type: 'text', row: 'rowDir', placeholder: 'Montevideo' },
      { id: 'direccion_pais',   label: 'País',           type: 'text', row: 'rowDir', placeholder: 'Uruguay' },
      { id: 'direccion_cp',     label: 'Código postal',  type: 'text', placeholder: '11300' },
    ],
  },
];

export function OrganizacionesView() {
  const [orgs, setOrgs]             = useState<Organizacion[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editando, setEditando]     = useState<Organizacion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrganizaciones({
        search: search || undefined,
        tipo: filterTipo || undefined,
        activo: filterActivo !== '' ? filterActivo === 'true' : undefined,
      });
      setOrgs(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar organizaciones');
    } finally {
      setLoading(false);
    }
  }, [search, filterTipo, filterActivo]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  useRegisterActions({
    buttons: [
      { label: 'Actualizar', onClick: () => fetchOrgs() },
      { label: 'Nueva Organización', primary: true, onClick: () => { setEditando(null); setDrawerOpen(true); } },
    ],
    searchPlaceholder: 'Buscar por nombre o email...',
    onSearch: q => setSearch(q),
  }, [fetchOrgs]);

  const initialData = editando
    ? {
        nombre:           editando.nombre,
        tipo:             editando.tipo ?? '',
        industria:        editando.industria ?? '',
        email:            editando.email ?? '',
        telefono:         editando.telefono ?? '',
        sitio_web:        editando.sitio_web ?? '',
        activo:           editando.activo,
        direccion_calle:  editando.direccion?.calle  ?? '',
        direccion_ciudad: editando.direccion?.ciudad ?? '',
        direccion_pais:   editando.direccion?.pais   ?? '',
        direccion_cp:     editando.direccion?.cp     ?? '',
      }
    : { ...EMPTY, activo: true };

  const handleSave = async (data: Record<string, unknown>) => {
    const body: Partial<Organizacion> = {
      nombre:    String(data.nombre   || ''),
      tipo:      String(data.tipo     || ''),
      industria: String(data.industria || ''),
      email:     String(data.email    || ''),
      telefono:  String(data.telefono || ''),
      sitio_web: String(data.sitio_web || ''),
      activo:    Boolean(data.activo ?? true),
      direccion: {
        calle:  String(data.direccion_calle  || ''),
        ciudad: String(data.direccion_ciudad || ''),
        pais:   String(data.direccion_pais   || ''),
        cp:     String(data.direccion_cp     || ''),
      },
    };
    if (!body.nombre?.trim()) throw new Error('El nombre es requerido');

    if (editando) {
      await updateOrganizacion(editando.id, body);
      toast.success('Organización actualizada');
    } else {
      await createOrganizacion(body);
      toast.success('Organización creada');
    }
    fetchOrgs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta organización? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      await deleteOrganizacion(id);
      toast.success('Organización eliminada');
      fetchOrgs();
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: 'var(--m-bg)' }}>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: 'var(--m-text-muted)' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} /> Cargando organizaciones...
          </div>
        ) : orgs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--m-text-muted)' }}>
            <Building2 size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>No hay organizaciones registradas</p>
            <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Creá la primera usando el botón "+ Nueva Organización"</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {orgs.map(o => {
              const tipoColor = colorPorTipo[o.tipo ?? ''] ?? '#6B7280';
              return (
                <div key={o.id}
                  style={{ backgroundColor: 'var(--m-surface)', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}
                >
                  <div style={{ height: 4, backgroundColor: tipoColor }} />
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: tipoColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={20} color={tipoColor} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: 'var(--m-text)', fontSize: '0.9rem' }}>{o.nombre}</p>
                          {o.tipo && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: tipoColor, backgroundColor: tipoColor + '15', padding: '2px 7px', borderRadius: 20 }}>
                              {o.tipo.charAt(0).toUpperCase() + o.tipo.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: o.activo ? '#10B981' : 'var(--m-danger)', backgroundColor: o.activo ? '#D1FAE5' : 'var(--m-danger-bg)', padding: '2px 8px', borderRadius: 20 }}>
                        {o.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    {o.industria && (
                      <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--m-text-muted)' }}>🏭 {o.industria}</p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                      {o.email    && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--m-text-muted)' }}><Mail  size={13} />{o.email}</div>}
                      {o.telefono && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--m-text-muted)' }}><Phone size={13} />{o.telefono}</div>}
                      {o.sitio_web && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--m-info)' }}>
                          <Globe size={13} />
                          <a href={o.sitio_web} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--m-info)', textDecoration: 'none' }}>{o.sitio_web}</a>
                        </div>
                      )}
                      {o.direccion?.ciudad && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--m-text-muted)' }}>
                          <MapPin size={13} />{o.direccion.ciudad}{o.direccion.pais ? `, ${o.direccion.pais}` : ''}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
                      <button
                        onClick={() => { setEditando(o); setDrawerOpen(true); }}
                        style={{ flex: 1, padding: '7px', borderRadius: 7, border: '1.5px solid #E5E7EB', background: 'var(--m-surface)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--m-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <Edit2 size={13} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        disabled={deletingId === o.id}
                        style={{ padding: '7px 12px', borderRadius: 7, border: '1.5px solid #FEE2E2', background: 'var(--m-danger-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--m-danger)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DrawerShell
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        title={editando ? 'Editar Organización' : 'Nueva Organización'}
        icon={Building2}
        sheets={sheets}
        initialData={initialData}
        labels={{ save: editando ? 'Guardar cambios' : 'Crear organización' }}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
