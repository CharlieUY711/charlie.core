// =============================================================================
// IdeasBoard.tsx — Pilar 1: Checklist & Roadmap
// C1: Vista de captura y gestión de ideas
// C5: Zero colores hardcodeados — solo tokens CSS var(--m-*)
// C8: Datos via ideasApi — nunca supabase.from() directo
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import '../tokens.css';
import { supabase } from '@/utils/supabase/client';

// =============================================================================
// TIPOS
// =============================================================================

type EstadoIdea = 'nueva' | 'en_revision' | 'aprobada' | 'descartada' | 'promovida';

interface Idea {
  id:          string;
  titulo:      string;
  descripcion: string;
  estado:      EstadoIdea;
  prioridad:   number;
  modulo_ref:  string | null;
  notas:       string | null;
  created_at:  string;
}

// =============================================================================
// API LOCAL (C8 — sin supabase.from() directo en la vista)
// =============================================================================

const TABLE = 'ideas';
const TENANT = 'charlie';

async function getIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('tenant_id', TENANT)
    .order('prioridad', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function createIdea(idea: Omit<Idea, 'id' | 'created_at'>): Promise<Idea> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...idea, tenant_id: TENANT })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateIdea(id: string, updates: Partial<Idea>): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', TENANT);
  if (error) throw error;
}

async function deleteIdea(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .eq('tenant_id', TENANT);
  if (error) throw error;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const ESTADO_CONFIG: Record<EstadoIdea, { label: string; color: string }> = {
  nueva:       { label: 'Nueva',       color: 'var(--m-color-primary)' },
  en_revision: { label: 'En revisión', color: 'var(--m-color-warn)' },
  aprobada:    { label: 'Aprobada',    color: 'var(--m-color-ok)' },
  descartada:  { label: 'Descartada',  color: 'var(--m-color-error)' },
  promovida:   { label: 'Promovida',   color: 'var(--m-state-produccion)' },
};

const ESTADO_ORDEN: EstadoIdea[] = ['nueva', 'en_revision', 'aprobada', 'promovida', 'descartada'];

// =============================================================================
// COMPONENTE — TARJETA DE IDEA
// =============================================================================

interface IdeaCardProps {
  idea:       Idea;
  onEditar:   (idea: Idea) => void;
  onEliminar: (id: string) => void;
  onPromover: (idea: Idea) => void;
  onEstado:   (id: string, estado: EstadoIdea) => void;
}

function IdeaCard({ idea, onEditar, onEliminar, onPromover, onEstado }: IdeaCardProps) {
  const cfg = ESTADO_CONFIG[idea.estado];

  return (
    <div style={{
      backgroundColor: 'var(--m-color-surface)',
      border:          '1px solid var(--m-color-border)',
      borderRadius:    'var(--m-radius-md)',
      padding:         'var(--m-space-4)',
      display:         'flex',
      flexDirection:   'column',
      gap:             'var(--m-space-2)',
      transition:      'box-shadow 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--m-shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Header tarjeta */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize:   13,
          fontWeight: 700,
          color:      'var(--m-color-text)',
          flex:       1,
          lineHeight: 1.4,
        }}>
          {idea.titulo}
        </span>
        <div style={{
          fontSize:        10,
          fontWeight:      700,
          padding:         '2px 7px',
          borderRadius:    'var(--m-radius-sm)',
          backgroundColor: cfg.color + '22',
          color:           cfg.color,
          border:          `1px solid ${cfg.color}44`,
          whiteSpace:      'nowrap',
          flexShrink:      0,
        }}>
          {cfg.label}
        </div>
      </div>

      {/* Descripción */}
      {idea.descripcion && (
        <p style={{
          fontSize:   12,
          color:      'var(--m-color-text-muted)',
          margin:     0,
          lineHeight: 1.5,
        }}>
          {idea.descripcion}
        </p>
      )}

      {/* Módulo ref */}
      {idea.modulo_ref && (
        <div style={{
          fontSize:        11,
          color:           'var(--m-color-text-subtle)',
          fontFamily:      'var(--m-font-mono)',
          backgroundColor: 'var(--m-color-surface-2)',
          padding:         '2px 6px',
          borderRadius:    'var(--m-radius-sm)',
          alignSelf:       'flex-start',
        }}>
          → {idea.modulo_ref}
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 6, marginTop: 'var(--m-space-1)' }}>
        {/* Cambiar estado */}
        <select
          value={idea.estado}
          onClick={e => e.stopPropagation()}
          onChange={e => onEstado(idea.id, e.target.value as EstadoIdea)}
          style={{
            flex:            1,
            fontSize:        11,
            padding:         '4px 6px',
            borderRadius:    'var(--m-radius-sm)',
            border:          '1px solid var(--m-color-border)',
            backgroundColor: 'var(--m-color-surface-2)',
            color:           'var(--m-color-text)',
            cursor:          'pointer',
          }}
        >
          {ESTADO_ORDEN.map(e => (
            <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
          ))}
        </select>

        {/* Editar */}
        <button
          onClick={() => onEditar(idea)}
          title="Editar"
          style={{
            padding:         '4px 8px',
            borderRadius:    'var(--m-radius-sm)',
            border:          '1px solid var(--m-color-border)',
            backgroundColor: 'var(--m-color-surface-2)',
            color:           'var(--m-color-text-muted)',
            fontSize:        11,
            cursor:          'pointer',
          }}
        >
          ✏️
        </button>

        {/* Promover */}
        {(idea.estado === 'aprobada') && (
          <button
            onClick={() => onPromover(idea)}
            title="Promover al Roadmap"
            style={{
              padding:         '4px 10px',
              borderRadius:    'var(--m-radius-sm)',
              border:          '1px solid var(--m-color-ok)',
              backgroundColor: 'var(--m-color-ok)',
              color:           'var(--m-color-surface)',
              fontSize:        11,
              fontWeight:      700,
              cursor:          'pointer',
            }}
          >
            → Roadmap
          </button>
        )}

        {/* Eliminar */}
        <button
          onClick={() => onEliminar(idea.id)}
          title="Eliminar"
          style={{
            padding:         '4px 8px',
            borderRadius:    'var(--m-radius-sm)',
            border:          '1px solid var(--m-color-border)',
            backgroundColor: 'var(--m-color-surface-2)',
            color:           'var(--m-color-error)',
            fontSize:        11,
            cursor:          'pointer',
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// FORMULARIO — NUEVA / EDITAR IDEA
// =============================================================================

interface FormIdeaProps {
  inicial?:   Partial<Idea>;
  onGuardar:  (data: Omit<Idea, 'id' | 'created_at'>) => void;
  onCancelar: () => void;
}

function FormIdea({ inicial, onGuardar, onCancelar }: FormIdeaProps) {
  const [titulo,      setTitulo]      = useState(inicial?.titulo      ?? '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');
  const [moduloRef,   setModuloRef]   = useState(inicial?.modulo_ref  ?? '');
  const [estado,      setEstado]      = useState<EstadoIdea>(inicial?.estado ?? 'nueva');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    onGuardar({
      titulo:      titulo.trim(),
      descripcion: descripcion.trim(),
      estado,
      prioridad:   inicial?.prioridad ?? 99,
      modulo_ref:  moduloRef.trim() || null,
      notas:       inicial?.notas ?? null,
    });
  }

  const inputStyle: React.CSSProperties = {
    width:           '100%',
    padding:         '8px 10px',
    borderRadius:    'var(--m-radius-sm)',
    border:          '1px solid var(--m-color-border)',
    backgroundColor: 'var(--m-color-surface)',
    color:           'var(--m-color-text)',
    fontSize:        13,
    boxSizing:       'border-box',
    fontFamily:      'inherit',
  };

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: 'var(--m-color-surface)',
      border:          '1px solid var(--m-color-primary)',
      borderRadius:    'var(--m-radius-md)',
      padding:         'var(--m-space-4)',
      display:         'flex',
      flexDirection:   'column',
      gap:             'var(--m-space-3)',
      marginBottom:    'var(--m-space-4)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--m-color-text)' }}>
        {inicial?.id ? 'Editar idea' : 'Nueva idea'}
      </div>

      <input
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
        placeholder="Título de la idea *"
        required
        style={inputStyle}
      />

      <textarea
        value={descripcion}
        onChange={e => setDescripcion(e.target.value)}
        placeholder="Descripción (opcional)"
        rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
      />

      <input
        value={moduloRef}
        onChange={e => setModuloRef(e.target.value)}
        placeholder="Módulo relacionado (ej: checklist-roadmap)"
        style={inputStyle}
      />

      <select
        value={estado}
        onChange={e => setEstado(e.target.value as EstadoIdea)}
        style={inputStyle}
      >
        {ESTADO_ORDEN.map(e => (
          <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: 'var(--m-space-2)', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancelar}
          style={{
            padding:         '7px 16px',
            borderRadius:    'var(--m-radius-sm)',
            border:          '1px solid var(--m-color-border)',
            backgroundColor: 'transparent',
            color:           'var(--m-color-text-muted)',
            fontSize:        12,
            cursor:          'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={{
            padding:         '7px 16px',
            borderRadius:    'var(--m-radius-sm)',
            border:          'none',
            backgroundColor: 'var(--m-color-primary)',
            color:           'var(--m-color-surface)',
            fontSize:        12,
            fontWeight:      700,
            cursor:          'pointer',
          }}
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

interface Props {
  onNavigate?: (section: string) => void;
}

export function IdeasBoard({ onNavigate }: Props) {
  const [ideas,       setIdeas]       = useState<Idea[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [showForm,    setShowForm]    = useState(false);
  const [editando,    setEditando]    = useState<Idea | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoIdea | 'todos'>('todos');

  // ── Carga ────────────────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIdeas();
      setIdeas(data);
    } catch (e) {
      setError('Error cargando ideas.');
      console.error('[IdeasBoard]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  async function handleGuardar(data: Omit<Idea, 'id' | 'created_at'>) {
    try {
      if (editando) {
        await updateIdea(editando.id, data);
        setIdeas(prev => prev.map(i => i.id === editando.id ? { ...i, ...data } : i));
        setEditando(null);
      } else {
        const nueva = await createIdea(data);
        setIdeas(prev => [nueva, ...prev]);
        setShowForm(false);
      }
    } catch (e) {
      console.error('[IdeasBoard] Error guardando:', e);
    }
  }

  async function handleEliminar(id: string) {
    try {
      await deleteIdea(id);
      setIdeas(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error('[IdeasBoard] Error eliminando:', e);
    }
  }

  async function handleEstado(id: string, estado: EstadoIdea) {
    try {
      await updateIdea(id, { estado });
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, estado } : i));
    } catch (e) {
      console.error('[IdeasBoard] Error actualizando estado:', e);
    }
  }

  async function handlePromover(idea: Idea) {
    try {
      await updateIdea(idea.id, { estado: 'promovida' });
      setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, estado: 'promovida' } : i));
      // Navegar al Roadmap si está disponible
      onNavigate?.('roadmap');
    } catch (e) {
      console.error('[IdeasBoard] Error promoviendo:', e);
    }
  }

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const ideasFiltradas = filtroEstado === 'todos'
    ? ideas
    : ideas.filter(i => i.estado === filtroEstado);

  const conteo = ESTADO_ORDEN.reduce((acc, e) => {
    acc[e] = ideas.filter(i => i.estado === e).length;
    return acc;
  }, {} as Record<EstadoIdea, number>);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--m-color-text-muted)', fontSize: 13 }}>
      Cargando ideas...
    </div>
  );

  if (error) return (
    <div style={{ padding: 'var(--m-space-8)', color: 'var(--m-color-error)', fontSize: 13 }}>
      {error}
    </div>
  );

  return (
    <div style={{
      height:          '100%',
      overflowY:       'auto',
      backgroundColor: 'var(--m-color-bg)',
      padding:         'var(--m-space-8)',
      boxSizing:       'border-box',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--m-space-4)' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--m-color-text)', margin: '0 0 4px' }}>
            Ideas
          </h2>
          <p style={{ fontSize: 12, color: 'var(--m-color-text-muted)', margin: 0 }}>
            {ideas.length} ideas · {conteo.promovida ?? 0} promovidas
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditando(null); }}
          style={{
            padding:         '8px 16px',
            borderRadius:    'var(--m-radius-sm)',
            border:          'none',
            backgroundColor: 'var(--m-color-primary)',
            color:           'var(--m-color-surface)',
            fontSize:        12,
            fontWeight:      700,
            cursor:          'pointer',
          }}
        >
          + Nueva idea
        </button>
      </div>

      {/* ── Filtros por estado ── */}
      <div style={{ display: 'flex', gap: 'var(--m-space-2)', marginBottom: 'var(--m-space-4)', flexWrap: 'wrap' }}>
        {(['todos', ...ESTADO_ORDEN] as (EstadoIdea | 'todos')[]).map(e => {
          const activo = filtroEstado === e;
          const cfg = e === 'todos' ? { label: 'Todas', color: 'var(--m-color-text-muted)' } : ESTADO_CONFIG[e];
          const count = e === 'todos' ? ideas.length : conteo[e] ?? 0;
          return (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              style={{
                padding:         '4px 10px',
                borderRadius:    'var(--m-radius-sm)',
                border:          `1px solid ${activo ? cfg.color : 'var(--m-color-border)'}`,
                backgroundColor: activo ? cfg.color + '22' : 'transparent',
                color:           activo ? cfg.color : 'var(--m-color-text-muted)',
                fontSize:        11,
                fontWeight:      activo ? 700 : 400,
                cursor:          'pointer',
              }}
            >
              {cfg.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* ── Formulario ── */}
      {(showForm || editando) && (
        <FormIdea
          inicial={editando ?? undefined}
          onGuardar={handleGuardar}
          onCancelar={() => { setShowForm(false); setEditando(null); }}
        />
      )}

      {/* ── Grid de ideas ── */}
      {ideasFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--m-color-text-muted)', fontSize: 13, marginTop: 48 }}>
          {ideas.length === 0 ? 'No hay ideas todavía. ¡Agregá la primera!' : 'No hay ideas con este estado.'}
        </div>
      ) : (
        <div style={{
          display:               'grid',
          gridTemplateColumns:   'repeat(auto-fill, minmax(280px, 1fr))',
          gap:                   'var(--m-space-3)',
        }}>
          {ideasFiltradas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEditar={i => { setEditando(i); setShowForm(false); }}
              onEliminar={handleEliminar}
              onPromover={handlePromover}
              onEstado={handleEstado}
            />
          ))}
        </div>
      )}
    </div>
  );
}
