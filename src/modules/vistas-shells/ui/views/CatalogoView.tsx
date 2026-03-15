/**
 * CatalogoView.tsx
 * Charlie Platform — Módulo Vistas y Shells · Fase VS-C
 *
 * Grilla del catálogo de shells. Carga datos desde Supabase via getShells().
 * Filtra por tipo. Permite seleccionar un shell para editar (VS-D).
 *
 * C5: Zero colores hardcodeados — solo var(--m-*)
 * C8: No contiene supabase.from() — delega en vistasShellsApi
 */
import React, { useEffect, useState, useCallback } from 'react';
import type { ShellEntry, ShellTipo } from '../../types';
import { getShells } from '../../service/vistasShellsApi';
import { ShellCard } from './ShellCard';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface CatalogoViewProps {
  onSelectShell?: (shell: ShellEntry) => void;
  selectedShellId?: string;
}

// ── Filtros ───────────────────────────────────────────────────────────────────

type FiltroTipo = 'todos' | ShellTipo;

const FILTROS: Array<{ id: FiltroTipo; label: string }> = [
  { id: 'todos',       label: 'Todos'       },
  { id: 'shell',       label: 'Shells'      },
  { id: 'vista',       label: 'Vistas'      },
  { id: 'componente',  label: 'Componentes' },
];

// ── Componente ────────────────────────────────────────────────────────────────

export function CatalogoView({ onSelectShell, selectedShellId }: CatalogoViewProps) {
  const [shells,   setShells]   = useState<ShellEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filtro,   setFiltro]   = useState<FiltroTipo>('todos');

  // ── Carga de datos ──────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShells();
      setShells(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar shells');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Filtrado ────────────────────────────────────────────────────────────────

  const shellsFiltrados = filtro === 'todos'
    ? shells
    : shells.filter(s => s.tipo === filtro);

  // ── Estados de carga / error ────────────────────────────────────────────────

  if (loading) return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      height:         '100%',
      color:          'var(--m-color-text-muted)',
      fontSize:       13,
      gap:            'var(--m-space-2)',
    }}>
      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
      Cargando catálogo...
    </div>
  );

  if (error) return (
    <div style={{
      display:        'flex',
      flexDirection:  'column' as const,
      alignItems:     'center',
      justifyContent: 'center',
      height:         '100%',
      gap:            'var(--m-space-3)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--m-color-error)' }}>⚠ {error}</span>
      <button
        onClick={cargar}
        style={{
          fontSize:        12,
          fontWeight:      600,
          padding:         '6px 16px',
          borderRadius:    'var(--m-radius-sm)',
          border:          '1px solid var(--m-color-border)',
          backgroundColor: 'var(--m-color-surface)',
          color:           'var(--m-color-text)',
          cursor:          'pointer',
        }}
      >
        Reintentar
      </button>
    </div>
  );

  // ── Vista principal ─────────────────────────────────────────────────────────

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column' as const,
      height:        '100%',
      gap:           'var(--m-space-4)',
    }}>

      {/* ── Header + filtros ── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexShrink:     0,
      }}>

        {/* Título + count */}
        <div>
          <h2 style={{
            margin:     0,
            fontSize:   18,
            fontWeight: 700,
            color:      'var(--m-color-text)',
          }}>
            Catálogo de Shells
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--m-color-text-muted)' }}>
            {shellsFiltrados.length} elemento{shellsFiltrados.length !== 1 ? 's' : ''}
            {filtro !== 'todos' ? ` · ${FILTROS.find(f => f.id === filtro)?.label}` : ''}
          </p>
        </div>

        {/* Filtros por tipo */}
        <div style={{ display: 'flex', gap: 'var(--m-space-1)' }}>
          {FILTROS.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              style={{
                fontSize:        12,
                fontWeight:      600,
                padding:         '5px 12px',
                borderRadius:    'var(--m-radius-sm)',
                border:          `1px solid ${filtro === f.id ? 'var(--m-color-primary)' : 'var(--m-color-border)'}`,
                backgroundColor: filtro === f.id ? 'var(--m-color-primary-soft)' : 'transparent',
                color:           filtro === f.id ? 'var(--m-color-primary)' : 'var(--m-color-text-muted)',
                cursor:          'pointer',
                transition:      'all 0.12s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grilla ── */}
      {shellsFiltrados.length === 0 ? (
        <div style={{
          flex:           1,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          color:          'var(--m-color-text-muted)',
          fontSize:       13,
        }}>
          No hay elementos en esta categoría.
        </div>
      ) : (
        <div style={{
          display:               'grid',
          gridTemplateColumns:   'repeat(auto-fill, minmax(280px, 1fr))',
          gap:                   'var(--m-space-4)',
          overflowY:             'auto' as const,
          flex:                  1,
          alignContent:          'start',
          paddingBottom:         'var(--m-space-4)',
        }}>
          {shellsFiltrados.map(shell => (
            <ShellCard
              key={shell.id}
              shell={shell}
              selected={shell.id === selectedShellId}
              onSelect={onSelectShell}
            />
          ))}
        </div>
      )}

    </div>
  );
}
