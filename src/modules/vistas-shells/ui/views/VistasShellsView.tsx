/**
 * VistasShellsView.tsx
 * Charlie Platform — Módulo Vistas y Shells · Fase VS-F
 *
 * Vista principal del módulo. Tabs: Catálogo · Editor · Generador.
 * Punto de entrada registrado en componentRegistry.ts.
 *
 * C5: Zero colores hardcodeados — solo var(--m-*)
 * C8: No contiene supabase.from() — delega en vistasShellsApi
 */
import React, { useState } from 'react';
import { ModuleView } from '../../../../app/components/shells/ModuleView';
import { CatalogoView } from './CatalogoView';
import { EditorShell }  from './EditorShell';
import { GeneradorView } from './GeneradorView';
import type { ShellEntry } from '../../types';

// ── Tabs ──────────────────────────────────────────────────────────────────────

type TabId = 'catalogo' | 'generador';

const TABS: Array<{ id: TabId; label: string; descripcion: string }> = [
  { id: 'catalogo',  label: 'Catálogo',   descripcion: 'Shells y vistas disponibles' },
  { id: 'generador', label: 'Generador',  descripcion: 'Genera código Charlie-compliant' },
];

// ── Componente ────────────────────────────────────────────────────────────────

export function VistasShellsView() {
  const [tabActiva,      setTabActiva]      = useState<TabId>('catalogo');
  const [shellSeleccionado, setShellSeleccionado] = useState<ShellEntry | null>(null);
  const [editorAbierto,  setEditorAbierto]  = useState(false);

  const handleSelectShell = (shell: ShellEntry) => {
    setShellSeleccionado(shell);
    setEditorAbierto(true);
  };

  const handleEditorClose = () => {
    setEditorAbierto(false);
  };

  const handleEditorSaved = () => {
    setEditorAbierto(false);
  };

  return (
    <ModuleView padding="normal" scroll="vertical">
      <div style={{
        display:       'flex',
        flexDirection: 'column' as const,
        gap:           'var(--m-space-4)',
        minHeight:     '100%',
      }}>

        {/* ── Header del módulo ── */}
        <div style={{
          display:         'flex',
          alignItems:      'flex-start',
          justifyContent:  'space-between',
          paddingBottom:   'var(--m-space-4)',
          borderBottom:    '1px solid var(--m-color-border)',
          flexShrink:      0,
        }}>
          <div>
            <h1 style={{
              margin:     0,
              fontSize:   22,
              fontWeight: 800,
              color:      'var(--m-color-text)',
              letterSpacing: '-0.02em',
            }}>
              Vistas y Shells
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--m-color-text-muted)' }}>
              Catálogo de la capa de presentación Charlie · {TABS.find(t => t.id === tabActiva)?.descripcion}
            </p>
          </div>

          {/* Badge versión */}
          <span style={{
            fontSize:        11,
            fontWeight:      700,
            padding:         '3px 10px',
            borderRadius:    'var(--m-radius-sm)',
            backgroundColor: 'var(--m-color-surface-2)',
            color:           'var(--m-color-text-muted)',
            border:          '1px solid var(--m-color-border)',
            fontFamily:      'var(--m-font-mono)',
          }}>
            v0.1.0
          </span>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display:      'flex',
          gap:          'var(--m-space-1)',
          borderBottom: '1px solid var(--m-color-border)',
          flexShrink:   0,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              style={{
                fontSize:        13,
                fontWeight:      600,
                padding:         '8px 16px',
                border:          'none',
                borderBottom:    tabActiva === tab.id
                  ? '2px solid var(--m-color-primary)'
                  : '2px solid transparent',
                backgroundColor: 'transparent',
                color:           tabActiva === tab.id
                  ? 'var(--m-color-primary)'
                  : 'var(--m-color-text-muted)',
                cursor:          'pointer',
                transition:      'all 0.12s',
                whiteSpace:      'nowrap' as const,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Contenido de la tab activa ── */}
        <div style={{ flex: 1, minHeight: 0 }}>
          {tabActiva === 'catalogo' && (
            <CatalogoView
              onSelectShell={handleSelectShell}
              selectedShellId={shellSeleccionado?.id}
            />
          )}
          {tabActiva === 'generador' && (
            <GeneradorView />
          )}
        </div>

      </div>

      {/* ── EditorShell (drawer) — fuera del flujo, siempre montado ── */}
      <EditorShell
        shell={shellSeleccionado}
        open={editorAbierto}
        onClose={handleEditorClose}
        onSaved={handleEditorSaved}
      />

    </ModuleView>
  );
}
