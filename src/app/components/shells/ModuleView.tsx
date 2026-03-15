/**
 * ModuleView.tsx
 * Charlie Platform — Contenedor estándar de vistas de módulos.
 *
 * Envuelve el contenido del módulo con scroll, padding y fondo estándar.
 * El módulo no gestiona su propio scroll ni padding — ModuleView lo hace.
 * Zero colores hardcodeados.
 */
import React from 'react';

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface ModuleViewProps {
  children:  React.ReactNode;
  padding?:  'normal' | 'compact' | 'none';
  scroll?:   'vertical' | 'hidden';
  fullHeight?: boolean;
}

// ── Padding por variante ──────────────────────────────────────────────────────

const PADDING_MAP = {
  normal:  'var(--m-space-8, 32px)',
  compact: 'var(--m-space-4, 16px)',
  none:    '0',
};

// ── Componente ────────────────────────────────────────────────────────────────

export function ModuleView({
  children,
  padding    = 'normal',
  scroll     = 'vertical',
  fullHeight = true,
}: ModuleViewProps) {
  return (
    <div style={{
      height:          fullHeight ? '100%' : 'auto',
      overflowY:       scroll === 'vertical' ? 'auto' : 'hidden',
      overflowX:       'hidden',
      backgroundColor: 'var(--m-color-bg, #F8F9FA)',
      padding:         PADDING_MAP[padding],
      boxSizing:       'border-box' as const,
      fontFamily:      'var(--m-font-sans, system-ui, sans-serif)',
    }}>
      {children}
    </div>
  );
}
