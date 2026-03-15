/**
 * ShellPreview.tsx
 * Charlie Platform — Módulo Vistas y Shells · Fase VS-C
 *
 * Renderer genérico de preview para cualquier ShellEntry.
 * Aplica los tokens CSS del shell y renderiza un layout visual
 * representativo del tipo (shell / vista / componente).
 *
 * C5: Zero colores hardcodeados — solo var(--m-*) y var(--shell-*)
 * C8: No importa ningún shell real — trabaja solo con ShellEntry
 */
import React, { useMemo } from 'react';
import type { ShellEntry } from '../../types';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface ShellPreviewProps {
  shell:     ShellEntry;
  varianteId?: string;   // si no se pasa, usa valorDefault de cada prop
  height?:   number;     // default: 160
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildCssVars(
  shell:     ShellEntry,
  varianteId?: string
): React.CSSProperties {
  const variante = shell.variantes.find(v => v.id === varianteId);
  const vars: Record<string, string> = {};

  for (const prop of shell.props) {
    const valor = variante?.props[prop.id] ?? prop.valorDefault;
    vars[prop.token] = valor;
  }

  return vars as React.CSSProperties;
}

// ── Layouts por tipo ──────────────────────────────────────────────────────────

function PreviewShell({ shellId }: { shellId: string }) {
  // Representa visualmente el tipo de shell según su id
  const isActionBar  = shellId === 'actionbar-shell';
  const isTopBar     = shellId === 'topbar-shell';
  const isDrawer     = shellId === 'drawer-shell';
  const isOrchestrator = shellId === 'orchestrator-shell';

  if (isActionBar) return (
    <div style={{
      display:         'flex',
      flexDirection:   'column' as const,
      height:          '100%',
      backgroundColor: 'var(--m-color-bg)',
    }}>
      {/* Área de contenido simulada */}
      <div style={{ flex: 1, padding: 'var(--m-space-4)', display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-2)' }}>
        {[80, 60, 70].map((w, i) => (
          <div key={i} style={{ height: 8, width: `${w}%`, backgroundColor: 'var(--m-color-surface-2)', borderRadius: 'var(--m-radius-sm)' }} />
        ))}
      </div>
      {/* ActionBar simulada */}
      <div style={{
        height:          44,
        backgroundColor: 'var(--shell-actionbar-bg)',
        borderTop:       '1px solid var(--m-color-border)',
        display:         'flex',
        alignItems:      'center',
        padding:         '0 var(--m-space-4)',
        gap:             'var(--m-space-2)',
      }}>
        <div style={{ height: 26, width: 70, backgroundColor: 'var(--shell-primary)', borderRadius: 'var(--m-radius-sm)', opacity: 0.9 }} />
        {[50, 55, 48].map((w, i) => (
          <div key={i} style={{ height: 26, width: w, backgroundColor: 'var(--shell-topbar-bg)', border: '1px solid var(--m-color-border)', borderRadius: 'var(--m-radius-sm)' }} />
        ))}
      </div>
    </div>
  );

  if (isTopBar) return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, height: '100%', backgroundColor: 'var(--m-color-bg)' }}>
      {/* TopBar simulada */}
      <div style={{
        height:          44,
        backgroundColor: 'var(--shell-topbar-bg)',
        borderBottom:    '1px solid var(--m-color-border)',
        display:         'flex',
        alignItems:      'center',
        padding:         '0 var(--m-space-4)',
        gap:             'var(--m-space-3)',
      }}>
        <div style={{ height: 20, width: 20, borderRadius: '50%', backgroundColor: 'var(--shell-primary)' }} />
        <div style={{ height: 8, width: 80, backgroundColor: 'var(--m-color-surface-2)', borderRadius: 'var(--m-radius-sm)' }} />
        <div style={{ flex: 1 }} />
        <div style={{ height: 26, width: 26, borderRadius: '50%', backgroundColor: 'var(--m-color-surface-2)' }} />
      </div>
      {/* Contenido simulado */}
      <div style={{ flex: 1, padding: 'var(--m-space-4)', display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-2)' }}>
        {[70, 50, 65].map((w, i) => (
          <div key={i} style={{ height: 8, width: `${w}%`, backgroundColor: 'var(--m-color-surface-2)', borderRadius: 'var(--m-radius-sm)' }} />
        ))}
      </div>
    </div>
  );

  if (isDrawer) return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: 'var(--m-color-bg)' }}>
      {/* Fondo oscurecido */}
      <div style={{ flex: 1, backgroundColor: 'var(--m-color-bg)', opacity: 0.6 }} />
      {/* Panel drawer */}
      <div style={{
        width:           '60%',
        backgroundColor: 'var(--shell-topbar-bg, var(--m-color-surface))',
        borderLeft:      '1px solid var(--m-color-border)',
        padding:         'var(--m-space-4)',
        display:         'flex',
        flexDirection:   'column' as const,
        gap:             'var(--m-space-3)',
      }}>
        <div style={{ height: 10, width: '70%', backgroundColor: 'var(--m-color-surface-2)', borderRadius: 'var(--m-radius-sm)' }} />
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 32, backgroundColor: 'var(--m-color-surface)', border: '1px solid var(--m-color-border)', borderRadius: 'var(--m-radius-md)' }} />
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ height: 32, backgroundColor: 'var(--shell-primary)', borderRadius: 'var(--m-radius-md)', opacity: 0.9 }} />
      </div>
    </div>
  );

  if (isOrchestrator) return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Sidebar */}
      <div style={{
        width:           36,
        backgroundColor: 'var(--shell-bg)',
        borderRight:     '1px solid var(--m-color-border)',
        display:         'flex',
        flexDirection:   'column' as const,
        alignItems:      'center',
        padding:         'var(--m-space-3) 0',
        gap:             'var(--m-space-3)',
      }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--shell-primary)' }} />
        {[1,2,3,4].map(i => (
          <div key={i} style={{ width: 18, height: 18, borderRadius: 'var(--m-radius-sm)', backgroundColor: 'var(--m-color-surface-2)' }} />
        ))}
      </div>
      {/* Contenido */}
      <div style={{ flex: 1, backgroundColor: 'var(--m-color-bg)', padding: 'var(--m-space-3)', display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-2)' }}>
        {[70, 50, 65, 45].map((w, i) => (
          <div key={i} style={{ height: 7, width: `${w}%`, backgroundColor: 'var(--m-color-surface-2)', borderRadius: 'var(--m-radius-sm)' }} />
        ))}
      </div>
    </div>
  );

  return null;
}

function PreviewVista({ shellId }: { shellId: string }) {
  const isHub = shellId === 'hub-view';

  if (isHub) return (
    <div style={{
      height:          '100%',
      backgroundColor: 'var(--shell-actionbar-bg)',
      padding:         'var(--m-space-4)',
      display:         'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap:             'var(--m-space-2)',
      alignContent:    'start',
    }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} style={{
          height:          48,
          backgroundColor: 'var(--m-color-surface)',
          borderRadius:    'var(--m-radius-lg)',
          border:          '1px solid var(--m-color-border)',
        }} />
      ))}
    </div>
  );

  // ModuleView
  return (
    <div style={{
      height:          '100%',
      backgroundColor: 'var(--shell-bg)',
      padding:         'var(--m-space-4)',
      display:         'flex',
      flexDirection:   'column' as const,
      gap:             'var(--m-space-3)',
    }}>
      <div style={{ height: 12, width: '40%', backgroundColor: 'var(--m-color-surface-2)', borderRadius: 'var(--m-radius-sm)' }} />
      <div style={{ flex: 1, backgroundColor: 'var(--m-color-surface)', borderRadius: 'var(--m-radius-lg)', border: '1px solid var(--m-color-border)' }} />
    </div>
  );
}

function PreviewComponente() {
  // ChecklistShell preview
  return (
    <div style={{
      height:          '100%',
      backgroundColor: 'var(--m-color-bg)',
      padding:         'var(--m-space-3)',
      display:         'flex',
      flexDirection:   'column' as const,
      gap:             'var(--m-space-2)',
    }}>
      {/* Header score */}
      <div style={{
        display:         'flex',
        alignItems:      'center',
        gap:             'var(--m-space-2)',
        padding:         'var(--m-space-2) var(--m-space-3)',
        backgroundColor: 'var(--m-color-surface)',
        borderRadius:    'var(--m-radius-md)',
        border:          '1px solid var(--m-color-border)',
      }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--m-color-ok)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--m-color-ok)' }}>8/8</span>
        </div>
        <div style={{ flex: 1, height: 6, backgroundColor: 'var(--m-color-ok)', borderRadius: 3, opacity: 0.7 }} />
      </div>
      {/* Criterios simulados */}
      {[
        'var(--m-color-ok)',
        'var(--m-color-ok)',
        'var(--m-color-warn)',
        'var(--m-color-pending)',
      ].map((color, i) => (
        <div key={i} style={{
          height:          20,
          backgroundColor: 'var(--m-color-surface)',
          borderRadius:    'var(--m-radius-sm)',
          borderLeft:      `3px solid ${color}`,
          border:          `1px solid var(--m-color-border)`,
        }} />
      ))}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ShellPreview({ shell, varianteId, height = 160 }: ShellPreviewProps) {
  const cssVars = useMemo(
    () => buildCssVars(shell, varianteId),
    [shell, varianteId]
  );

  return (
    <div style={{
      ...cssVars,
      height,
      borderRadius:  'var(--m-radius-md)',
      overflow:      'hidden',
      border:        '1px solid var(--m-color-border)',
      position:      'relative' as const,
      flexShrink:    0,
    }}>
      {shell.tipo === 'shell'      && <PreviewShell      shellId={shell.id} />}
      {shell.tipo === 'vista'      && <PreviewVista      shellId={shell.id} />}
      {shell.tipo === 'componente' && <PreviewComponente />}
    </div>
  );
}
