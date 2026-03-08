/* =====================================================
   PersonasView — Base de Personas (natural / juridica)
   Patron nuevo: DrawerShell + ActionBar + sin OrangeHeader
   ===================================================== */
import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterActions } from '../../shells/ActionBarContext';
import { toast } from 'sonner';
import { getPersonas, createPersona, updatePersona, deletePersona, type Persona } from '../../../services/personasApi';
import { GoogleAddressAutocomplete } from '../../ui/GoogleAddressAutocomplete';
import { getPlaceDetails } from '../../../../utils/google/places';
import { DrawerShell } from '../../shells/DrawerShell';
import type { SheetDef } from '../../shells/DrawerShell.types';
import {
  User, Building2, Mail, Phone,
  RefreshCw, Edit2, Trash2,
  CheckCircle, XCircle,
} from 'lucide-react';

const ORANGE = '#FF6835';
const DOC_TIPOS = ['CI', 'RUT', 'Pasaporte', 'DNI', 'Otro'];

const EMPTY: Omit<Persona, 'id' | 'created_at'> = {
  tipo: 'natural',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  documento_tipo: 'CI',
  documento_numero: '',
  fecha_nacimiento: '',
  genero: '',
  nacionalidad: '',
  direccion: { calle: '', ciudad: '', pais: '' },
  activo: true,
};

function buildSheets(tipo: string): SheetDef[] {
  return [
    {
      id: 'datos',
      title: 'Datos',
      subtitle: tipo === 'natural' ? 'Persona natural' : 'Persona juridica',
      fields: [
        {
          id: 'tipo',
          label: 'Tipo',
          type: 'select',
          required: true,
          options: [
            { value: 'natural', label: 'Persona Natural' },
            { value: 'juridica', label: 'Persona Juridica' },
          ],
        },
        { id: 'nombre', label: tipo === 'natural' ? 'Nombre' : 'Razon Social', type: 'text', required: true, placeholder: tipo === 'natural' ? 'Ej: Maria' : 'Ej: TechSur SA', row: 'nombre' },
        ...(tipo === 'natural' ? [{ id: 'apellido', label: 'Apellido', type: 'text' as const, placeholder: 'Ej: Garcia', row: 'nombre' }] : []),
        { id: 'email', label: 'Email', type: 'email' as const, placeholder: 'correo@ejemplo.com', row: 'contacto' },
        { id: 'telefono', label: 'Telefono', type: 'tel' as const, placeholder: '+598 99 123 456', row: 'contacto' },
        { id: 'documento_tipo', label: 'Tipo Documento', type: 'select' as const, options: DOC_TIPOS.map(d => ({ value: d, label: d })), row: 'doc' },
        { id: 'documento_numero', label: 'Nro. Documento', type: 'text' as const, placeholder: 'Ej: 1.234.567-8', row: 'doc' },
        ...(tipo === 'natural' ? [
          { id: 'fecha_nacimiento', label: 'Fecha de Nacimiento', type: 'date' as const, row: 'extra' },
          { id: 'genero', label: 'Genero', type: 'select' as const, options: [
            { value: '', label: 'Sin especificar' },
            { value: 'masculino', label: 'Masculino' },
            { value: 'femenino', label: 'Femenino' },
            { value: 'otro', label: 'Otro' },
            { value: 'prefiero no decir', label: 'Prefiero no decir' },
          ], row: 'extra' },
        ] : []),
        { id: 'nacionalidad', label: 'Nacionalidad', type: 'text' as const, placeholder: 'Ej: Uruguaya' },
        { id: 'activo', label: 'Persona activa en el sistema', type: 'toggle' as const },
      ],
    },
    {
      id: 'direccion',
      title: 'Direccion',
      subtitle: 'Ubicacion geografica',
      fields: [
        {
          id: 'direccion_calle',
          label: 'Direccion',
          type: 'custom',
          renderComponent: ({ value, onChange, onMultiChange }) => (
            <AddressPicker
              value={String(value || '')}
              onChange={onChange}
              onMultiChange={onMultiChange}
            />
          ),
        },
        { id: 'direccion_ciudad', label: 'Ciudad', type: 'text' as const, placeholder: 'Ej: Montevideo', row: 'geo' },
        { id: 'direccion_pais', label: 'Pais', type: 'text' as const, placeholder: 'Ej: Uruguay', row: 'geo' },
        { id: 'direccion_cp', label: 'Codigo Postal', type: 'text' as const, placeholder: 'Ej: 11300' },
      ],
    },
  ];
}

function AddressPicker({ value, onChange, onMultiChange }: {
  value: string;
  onChange: (v: unknown) => void;
  onMultiChange: (u: Record<string, unknown>) => void;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
        Direccion
      </label>
      <GoogleAddressAutocomplete
        value={value}
        onChange={v => onChange(v)}
        onSelect={async result => {
          try {
            if (result.place_id) {
              const details = await getPlaceDetails(result.place_id);
              if (details) {
                let ciudad = '';
                let pais = '';
                let cp = '';
                details.address_components.forEach((comp: any) => {
                  if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) ciudad = comp.long_name;
                  if (comp.types.includes('country')) pais = comp.long_name;
                  if (comp.types.includes('postal_code')) cp = comp.long_name;
                });
                onMultiChange({
                  direccion_calle: result.address,
                  direccion_ciudad: ciudad,
                  direccion_pais: pais,
                  direccion_cp: cp,
                });
                toast.success('Direccion completada automaticamente');
                return;
              }
            }
            onChange(result.address);
          } catch {
            onChange(result.address);
          }
        }}
        placeholder="Buscar direccion con Google Maps..."
      />
    </div>
  );
}

export function PersonasView() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editando, setEditando] = useState<Persona | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tipoForm, setTipoForm] = useState<string>('natural');

  const fetchPersonas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPersonas({
        tipo: filterTipo || undefined,
        activo: filterActivo !== '' ? filterActivo === 'true' : undefined,
        search: search || undefined,
      });
      setPersonas(data);
    } catch {
      toast.error('Error al cargar personas');
    } finally {
      setLoading(false);
    }
  }, [search, filterTipo, filterActivo]);

  useEffect(() => { fetchPersonas(); }, [fetchPersonas]);

  useRegisterActions({
    buttons: [
      { label: 'Actualizar', onClick: () => fetchPersonas() },
      { label: 'Nueva Persona', primary: true, onClick: () => { setEditando(null); setTipoForm('natural'); setDrawerOpen(true); } },
    ],
    searchPlaceholder: 'Buscar por nombre, apellido o email...',
    onSearch: q => setSearch(q),
  }, [fetchPersonas]);

  const initialData = editando ? {
    tipo: editando.tipo,
    nombre: editando.nombre,
    apellido: editando.apellido ?? '',
    email: editando.email ?? '',
    telefono: editando.telefono ?? '',
    documento_tipo: editando.documento_tipo ?? 'CI',
    documento_numero: editando.documento_numero ?? '',
    fecha_nacimiento: editando.fecha_nacimiento?.split('T')[0] ?? '',
    genero: editando.genero ?? '',
    nacionalidad: editando.nacionalidad ?? '',
    direccion_calle: (editando.direccion as any)?.calle ?? '',
    direccion_ciudad: (editando.direccion as any)?.ciudad ?? '',
    direccion_pais: (editando.direccion as any)?.pais ?? '',
    direccion_cp: (editando.direccion as any)?.cp ?? '',
    activo: editando.activo,
  } : { ...EMPTY, tipo: tipoForm };

  const handleSave = async (data: Record<string, unknown>) => {
    const body: Partial<Persona> = {
      tipo: data.tipo as 'natural' | 'juridica',
      nombre: String(data.nombre || ''),
      apellido: String(data.apellido || ''),
      email: String(data.email || ''),
      telefono: String(data.telefono || ''),
      documento_tipo: String(data.documento_tipo || 'CI'),
      documento_numero: String(data.documento_numero || ''),
      fecha_nacimiento: String(data.fecha_nacimiento || '') || undefined,
      genero: String(data.genero || ''),
      nacionalidad: String(data.nacionalidad || ''),
      direccion: {
        calle: String(data.direccion_calle || ''),
        ciudad: String(data.direccion_ciudad || ''),
        pais: String(data.direccion_pais || ''),
        cp: String(data.direccion_cp || ''),
      },
      activo: Boolean(data.activo ?? true),
    };
    if (!body.fecha_nacimiento) delete body.fecha_nacimiento;
    if (!body.nombre?.trim()) throw new Error('El nombre es requerido');

    if (editando) {
      await updatePersona(editando.id, body);
      toast.success('Persona actualizada');
    } else {
      await createPersona(body);
      toast.success('Persona creada');
    }
    fetchPersonas();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta persona? Esta accion no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      await deletePersona(id);
      toast.success('Persona eliminada');
      fetchPersonas();
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  const sheets = buildSheets(tipoForm);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

      {/* Tabla */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: '#9CA3AF' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} /> Cargando personas...
          </div>
        ) : personas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
            <User size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>No hay personas registradas</p>
            <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Crea la primera usando el boton "Nueva Persona"</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Persona', 'Tipo', 'Documento', 'Contacto', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {personas.map((p, i) => (
                  <tr key={p.id}
                    style={{ borderBottom: i < personas.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFAFA'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: p.tipo === 'natural' ? '#EFF6FF' : '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {p.tipo === 'natural' ? <User size={16} color="#3B82F6" /> : <Building2 size={16} color={ORANGE} />}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{p.nombre} {p.apellido ?? ''}</p>
                          {p.email && <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B7280' }}>{p.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, backgroundColor: p.tipo === 'natural' ? '#EFF6FF' : '#FFF7ED', color: p.tipo === 'natural' ? '#3B82F6' : ORANGE }}>
                        {p.tipo === 'natural' ? 'Natural' : 'Juridica'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>
                      {p.documento_tipo && p.documento_numero ? `${p.documento_tipo}: ${p.documento_numero}` : <span style={{ color: '#D1D5DB' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {p.email && <span style={{ color: '#6B7280', fontSize: '0.8rem' }}><Mail size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />{p.email}</span>}
                        {p.telefono && <span style={{ color: '#6B7280', fontSize: '0.8rem' }}><Phone size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />{p.telefono}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.activo
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}><CheckCircle size={14} />Activo</span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#EF4444', fontSize: '0.8rem', fontWeight: 600 }}><XCircle size={14} />Inactivo</span>
                      }
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => { setEditando(p); setTipoForm(p.tipo); setDrawerOpen(true); }}
                          style={{ padding: '6px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#374151' }}>
                          <Edit2 size={13} /> Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          style={{ padding: '6px 10px', borderRadius: 6, border: '1.5px solid #FEE2E2', background: '#FFF5F5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#EF4444' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DrawerShell
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        title={editando ? 'Editar Persona' : 'Nueva Persona'}
        icon={User}
        sheets={sheets}
        initialData={initialData}
        labels={{ save: editando ? 'Guardar cambios' : 'Crear persona' }}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  height: 34, border: '1.5px solid #E5E7EB', borderRadius: 8,
  padding: '0 10px', fontSize: '0.875rem', color: '#374151', cursor: 'pointer', outline: 'none',
};

