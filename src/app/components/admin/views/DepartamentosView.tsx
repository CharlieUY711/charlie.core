import React, { useState, useEffect, useCallback } from 'react';
import type { MainSection } from '../../../AdminDashboard';
import {
  ChevronRight, ChevronDown, Edit2, AlertTriangle,
  RefreshCw, Download, Zap, ShieldCheck, UserCog, Plus, X, Check, Loader2,
} from 'lucide-react';
import { FolderTree } from 'lucide-react';
import {
  getDepartamentos, createDepartamento, updateDepartamento, deleteDepartamento,
  type Departamento,
} from '../../../services/departamentosApi';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE = '#FF6835';
type ViewMode = 'admin' | 'operador';

// ── Edit modal ────────────────────────────────────────────────────────────
interface EditModalProps {
  dept: Departamento | null;
  onClose: () => void;
  onSave: (data: Partial<Departamento>) => Promise<void>;
}

function EditModal({ dept, onClose, onSave }: EditModalProps) {
  const [nombre, setNombre]   = useState(dept?.nombre ?? '');
  const [icono,  setIcono]    = useState(dept?.icono  ?? '');
  const [color,  setColor]    = useState(dept?.color  ?? '#FF6835');
  const [orden,  setOrden]    = useState(String(dept?.orden ?? ''));
  const [activo, setActivo]   = useState(dept?.activo ?? true);
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      await onSave({
        nombre: nombre.trim(),
        icono:  icono.trim() || undefined,
        color:  color || undefined,
        orden:  orden ? parseInt(orden) : undefined,
        activo,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '28px', width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontWeight: '800', color: '#111827' }}>{dept ? 'Editar Departamento' : 'Nuevo Departamento'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={18} /></button>
        </div>

        {[
          { label: 'Nombre *', value: nombre, onChange: setNombre, placeholder: 'Ej: Tecnología' },
          { label: 'Icono (emoji)', value: icono, onChange: setIcono, placeholder: 'Ej: 💻' },
          { label: 'Orden', value: orden, onChange: setOrden, placeholder: 'Ej: 3', type: 'number' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#374151', marginBottom: '5px' }}>{f.label}</label>
            <input
              type={f.type ?? 'text'}
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#374151', marginBottom: '5px' }}>Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: '48px', height: '36px', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
            <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>{color}</span>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '20px', fontSize: '0.875rem', color: '#374151' }}>
          <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} style={{ accentColor: ORANGE }} />
          Activo (visible en la tienda)
        </label>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #E5E7EB', backgroundColor: '#FFF', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || !nombre.trim()}
            style={{ padding: '9px 20px', backgroundColor: ORANGE, color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {dept ? 'Guardar cambios' : 'Crear departamento'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────
interface RowProps {
  dept: Departamento;
  index: number;
  isExpanded: boolean;
  viewMode: ViewMode;
  onToggleExpand: (id: string) => void;
  onEdit: (dept: Departamento) => void;
  onToggleActivo: (id: string, activo: boolean) => void;
}

function DeptRow({ dept, index, isExpanded, viewMode, onToggleExpand, onEdit, onToggleActivo }: RowProps) {
  const isAdmin = viewMode === 'admin';

  return (
    <div>
      <div
        style={{
          display: 'flex', alignItems: 'center', padding: '12px 16px',
          borderBottom: '1px solid #F3F4F6',
          backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
          transition: 'background-color 0.1s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FFF4EC')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#FAFAFA')}
      >
        {/* Expand */}
        <button onClick={() => onToggleExpand(dept.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px 6px', marginRight: '4px', flexShrink: 0 }}>
          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>

        {/* Icono / color */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          backgroundColor: dept.color ? `${dept.color}22` : '#F3F4F6',
          border: dept.color ? `1px solid ${dept.color}44` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', flexShrink: 0, marginRight: '12px',
        }}>
          {dept.icono || '📦'}
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>{dept.nombre}</span>
            {!dept.activo && (
              <span style={{ padding: '1px 7px', borderRadius: '12px', backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '0.65rem', fontWeight: '700' }}>Inactivo</span>
            )}
          </div>
          {dept.color && (
            <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
              {dept.color} {dept.orden !== undefined ? `· orden ${dept.orden}` : ''}
            </span>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {isAdmin && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.72rem', color: '#6B7280' }}>
              <input
                type="checkbox"
                checked={dept.activo}
                onChange={e => onToggleActivo(dept.id, e.target.checked)}
                style={{ accentColor: ORANGE }}
              />
              Visible
            </label>
          )}

          {/* Edit */}
          <button onClick={() => onEdit(dept)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '3px' }}>
            <Edit2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded */}
      {isExpanded && (
        <div style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #F3F4F6', padding: '12px 16px 12px 60px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Info
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {dept.descripcion && (
              <span style={{ padding: '4px 10px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', fontSize: '0.75rem', color: '#374151' }}>
                {dept.descripcion}
              </span>
            )}
            <span style={{ padding: '4px 10px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', fontSize: '0.75rem', color: '#374151' }}>
              ID: {dept.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export function DepartamentosView({ onNavigate }: Props) {
  const [depts,     setDepts]     = useState<Departamento[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set());
  const [search,    setSearch]    = useState('');
  const [viewMode,  setViewMode]  = useState<ViewMode>('admin');
  const [editDept,  setEditDept]  = useState<Departamento | null | 'new'>('new' as any);
  const [showModal, setShowModal] = useState(false);

  const loadDepts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDepartamentos();
      setDepts(data);
    } catch (e: any) {
      setError(e.message ?? 'Error cargando departamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDepts(); }, [loadDepts]);

  const toggleExpand = (id: string) => {
    const ne = new Set(expanded);
    ne.has(id) ? ne.delete(id) : ne.add(id);
    setExpanded(ne);
  };

  const handleToggleActivo = async (id: string, activo: boolean) => {
    // Optimistic update
    setDepts(prev => prev.map(d => d.id === id ? { ...d, activo } : d));
    try {
      await updateDepartamento(id, { activo });
    } catch {
      // Revert
      setDepts(prev => prev.map(d => d.id === id ? { ...d, activo: !activo } : d));
    }
  };

  const handleSave = async (data: Partial<Departamento>) => {
    if (editDept && editDept !== 'new' && (editDept as Departamento).id) {
      await updateDepartamento((editDept as Departamento).id, data);
    } else {
      await createDepartamento({ nombre: data.nombre!, ...data } as any);
    }
    await loadDepts();
  };

  const handleExport = () => {
    const json = JSON.stringify(depts, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'departamentos.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const isAdmin = viewMode === 'admin';

  const filteredDepts = depts.filter(d =>
    d.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {showModal && (
        <EditModal
          dept={editDept === 'new' ? null : editDept as Departamento}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {/* Vista switcher */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '0 28px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {([
          { key: 'admin',    icon: ShieldCheck, label: 'Vista Administrador', desc: 'Acceso completo a todos los controles' },
          { key: 'operador', icon: UserCog,     label: 'Vista Operador',       desc: 'Sin visibilidad, moneda ni edad' },
        ] as { key: ViewMode; icon: React.ElementType; label: string; desc: string }[]).map(tab => (
          <button key={tab.key} onClick={() => setViewMode(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '14px 20px', border: 'none',
              borderBottom: viewMode === tab.key ? `3px solid ${ORANGE}` : '3px solid transparent',
              backgroundColor: 'transparent', cursor: 'pointer',
              color: viewMode === tab.key ? ORANGE : '#6B7280',
              fontWeight: viewMode === tab.key ? '700' : '500',
              fontSize: '0.85rem', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>
            <tab.icon size={15} />
            {tab.label}
            <span style={{
              marginLeft: '4px', padding: '2px 8px', borderRadius: '20px',
              backgroundColor: viewMode === tab.key ? '#FFF4EC' : '#F3F4F6',
              color: viewMode === tab.key ? ORANGE : '#9CA3AF',
              fontSize: '0.68rem', fontWeight: '600',
            }}>{tab.desc}</span>
          </button>
        ))}
        {!isAdmin && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#FEF3C7', borderRadius: '20px', border: '1px solid #FDE68A' }}>
            <AlertTriangle size={13} color="#D97706" />
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#92400E' }}>
              Visibilidad · Moneda · Alcance · Edad – deshabilitados
            </span>
          </div>
        )}
      </div>

      {/* Sub-header */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '12px 28px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
          <span style={{ fontSize: '1.1rem' }}>🏬</span>
          <h2 style={{ margin: 0, fontWeight: '800', color: '#111827', fontSize: '1rem' }}>
            {isAdmin ? 'Gestión Completa de Departamentos' : 'Departamentos – Vista Restringida'}
          </h2>
          <span style={{
            padding: '2px 10px', borderRadius: '20px',
            backgroundColor: isAdmin ? '#F0FFF4' : '#FEF3C7',
            color: isAdmin ? '#16A34A' : '#D97706',
            fontSize: '0.72rem', fontWeight: '700',
            border: `1px solid ${isAdmin ? '#BBF7D0' : '#FDE68A'}`,
          }}>
            {isAdmin ? '⚡ Modo API' : '🔒 Acceso Limitado'}
          </span>
        </div>
        <p style={{ margin: 0, color: '#6B7280', fontSize: '0.75rem' }}>
          {isAdmin
            ? 'Datos en tiempo real desde Supabase · Cambios se guardan automáticamente'
            : 'Solo podés editar sincronización ML · Visibilidad, moneda, alcance y edad son de gestión exclusiva del Admin'}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8F9FA' }}>
        <div style={{ padding: '20px 28px', maxWidth: '1200px' }}>

          {/* Error banner */}
          {error && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={16} color="#DC2626" />
                <span style={{ fontWeight: '600', color: '#DC2626', fontSize: '0.85rem' }}>{error}</span>
              </div>
              <button onClick={loadDepts} style={{ padding: '6px 14px', backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '7px', fontWeight: '700', cursor: 'pointer', fontSize: '0.78rem' }}>
                Reintentar
              </button>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { value: loading ? '…' : depts.length,                          label: 'Departamentos',      color: ORANGE },
              { value: loading ? '…' : depts.filter(d => d.activo).length,    label: 'Activos',            color: '#10B981' },
              { value: loading ? '…' : depts.filter(d => !d.activo).length,   label: 'Inactivos',          color: '#6B7280' },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: `1px solid ${s.color}22`, padding: '12px 16px' }}>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: s.color }}>{s.value}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#6B7280' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
              <input
                type="text"
                placeholder="Buscar departamento..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }} />
            {isAdmin && (
              <button
                onClick={() => { setEditDept('new' as any); setShowModal(true); }}
                style={{ padding: '9px 16px', backgroundColor: ORANGE, color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} /> Nuevo
              </button>
            )}
            <button onClick={handleExport}
              style={{ padding: '9px 16px', backgroundColor: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} /> Exportar
            </button>
            <button onClick={loadDepts}
              style={{ padding: '9px 16px', border: '1px solid #E5E7EB', backgroundColor: '#FFF', color: '#374151', borderRadius: '8px', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Recargar
            </button>
          </div>

          {/* Column headers */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px 6px 64px', marginBottom: '4px', gap: '14px' }}>
            <span style={{ flex: 1, fontSize: '0.68rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Departamento</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0, fontSize: '0.68rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isAdmin && <span style={{ minWidth: '48px', textAlign: 'center' }}>Visible</span>}
              <span style={{ minWidth: '24px' }}></span>
            </div>
          </div>

          {/* List */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Cargando departamentos...</span>
              </div>
            ) : filteredDepts.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                {search ? `No se encontraron departamentos para "${search}"` : 'No hay departamentos. Creá el primero.'}
              </div>
            ) : (
              filteredDepts.map((dept, i) => (
                <DeptRow
                  key={dept.id}
                  dept={dept}
                  index={i}
                  isExpanded={expanded.has(dept.id)}
                  viewMode={viewMode}
                  onToggleExpand={toggleExpand}
                  onEdit={d => { setEditDept(d); setShowModal(true); }}
                  onToggleActivo={handleToggleActivo}
                />
              ))
            )}
          </div>

          {/* Add */}
          {isAdmin && !loading && (
            <button
              onClick={() => { setEditDept('new' as any); setShowModal(true); }}
              style={{ marginTop: '14px', padding: '12px 20px', border: `2px dashed ${ORANGE}`, borderRadius: '10px', backgroundColor: '#FFF4EC', color: ORANGE, fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏬 + Nuevo Departamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
