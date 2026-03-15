/**
 * ShellCard.tsx
 * Charlie Platform — Módulo Vistas y Shells · Fase VS-C
 *
 * Tarjeta de un ShellEntry en el catálogo.
 * Muestra: preview visual, nombre, tipo, descripción, props count, variantes.
 *
 * C5: Zero colores hardcodeados — solo var(--m-*)
 * C8: No accede a Supabase — recibe ShellEntry por props
 */
import React, { useState } from 'react';
import type { ShellEntry } from '../../types';
import { ShellPreview } from './ShellPreview';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface ShellCardProps {
  shell:     ShellEntry;
  onSelect?: (shell: ShellEntry) => void;
  selected?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<ShellEntry['tipo'], string> = {
  shell:       'Shell',
  vista:       'Vista',
  componente:  'Componente',
};

const TIPO_COLOR: Record<ShellEntry['tipo'], string> = {
  shell:       'var(--m-color-primary)',
  vista:       'var(--m-state-ui-lista)',
  componente:  'var(--m-state-registrado)',
};

// ── Componente ────────────────────────────────────────────────────────────────

export function ShellCard({ shell, onSelect, selected = false }: ShellCardProps) {
  const [varianteId, setVarianteId] = useState<string>(
    shell.variantes[0]?.id ?? ''
  );
  const [hovered, setHovered] = useState(false);

  const tipoColor = TIPO_COLOR[shell.tipo];

  return (
    <div
      onClick={() => onSelect?.(shell)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:         'flex',
        flexDirection:   'column' as const,
        backgroundColor: 'var(--m-color-surface)',
        border:          `1px solid ${selected ? 'var(--m-color-primary)' : hovered ? 'var(--m-color-surface-2)' : 'var(--m-color-border)'}`,
        borderRadius:    'var(--m-radius-lg)',
        overflow:        'hidden',
        cursor:          onSelect ? 'pointer' : 'default',
        transition:      'border-color 0.15s, box-shadow 0.15s',
        boxShadow:       selected
          ? '0 0 0 2px var(--m-color-primary)'
          : hovered
          ? 'var(--m-shadow-md)'
          : 'var(--m-shadow-sm)',
      }}
    >
      {/* ── Preview visual ── */}
      <ShellPreview shell={shell} varianteId={varianteId} height={148} />

      {/* ── Info ── */}
      <div style={{ padding: 'var(--m-space-3) var(--m-space-4)', display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-2)' }}>

        {/* Nombre + tipo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--m-color-text)' }}>
            {shell.nombre}
          </span>
          <span style={{
            fontSize:        10,
            fontWeight:      700,
            padding:         '2px 8px',
            borderRadius:    'var(--m-radius-sm)',
            backgroundColor: tipoColor + '22',
            color:           tipoColor,
            border:          `1px solid ${tipoColor}44`,
            textTransform:   'uppercase' as const,
            letterSpacing:   '0.05em',
          }}>
            {TIPO_LABEL[shell.tipo]}
          </span>
        </div>

        {/* Descripción */}
        <p style={{
          fontSize:   12,
          color:      'var(--m-color-text-muted)',
          lineHeight: 1.4,
          margin:     0,
          display:    '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow:   'hidden',
        }}>
          {shell.descripcion}
        </p>

        {/* Footer: props count + selector de variante */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--m-space-1)' }}>

          {/* Props count */}
          <span style={{ fontSize: 11, color: 'var(--m-color-text-subtle)' }}>
            {shell.props.length} prop{shell.props.length !== 1 ? 's' : ''}
          </span>

          {/* Selector de variante */}
          {shell.variantes.length > 1 && (
            <div style={{ display: 'flex', gap: 'var(--m-space-1)' }}>
              {shell.variantes.map(v => (
                <button
                  key={v.id}
                  onClick={e => { e.stopPropagation(); setVarianteId(v.id); }}
                  style={{
                    fontSize:        10,
                    fontWeight:      600,
                    padding:         '2px 8px',
                    borderRadius:    'var(--m-radius-sm)',
                    border:          `1px solid ${varianteId === v.id ? 'var(--m-color-primary)' : 'var(--m-color-border)'}`,
                    backgroundColor: varianteId === v.id ? 'var(--m-color-primary-soft)' : 'transparent',
                    color:           varianteId === v.id ? 'var(--m-color-primary)' : 'var(--m-color-text-muted)',
                    cursor:          'pointer',
                    transition:      'all 0.12s',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
