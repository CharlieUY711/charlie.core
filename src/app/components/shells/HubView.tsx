/**
 * HubView.tsx
 * Charlie Platform — Vista genérica de hub.
 * Zero colores hardcodeados.
 */
import React from 'react';

export interface HubModulo {
  view:    string;
  nombre:  string;
  isReal?: boolean;
}

export interface HubViewProps {
  section:      string;
  modulos:      HubModulo[];
  onNavigate:   (view: string) => void;
  titulo?:      string;
  descripcion?: string;
}

export function HubView({ modulos, onNavigate }: HubViewProps) {
  if (modulos.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', backgroundColor: 'var(--shell-actionbar-bg, #F8F9FA)',
      }}>
        <div style={{ fontSize: 13, color: 'var(--m-color-text-muted, #9CA3AF)' }}>
          No hay módulos activos en esta sección.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto' as const,
      backgroundColor: 'var(--shell-actionbar-bg, #F8F9FA)',
      padding: 'var(--m-space-8, 32px)', boxSizing: 'border-box' as const,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 'var(--m-space-4, 16px)', maxWidth: 900,
      }}>
        {modulos.map(({ view, nombre, isReal }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            style={{
              aspectRatio: '1', borderRadius: 'var(--m-radius-xl, 16px)',
              border: '1px solid var(--m-color-border, #E5E7EB)', cursor: 'pointer',
              backgroundColor: 'var(--shell-topbar-bg, #FFFFFF)',
              boxShadow: 'var(--m-shadow-sm, 0 1px 4px rgba(0,0,0,0.06))',
              display: 'flex', flexDirection: 'column' as const,
              alignItems: 'center', justifyContent: 'center',
              gap: 'var(--m-space-3, 12px)', padding: 'var(--m-space-4, 16px)',
              transition: 'box-shadow 0.15s, transform 0.15s',
              position: 'relative' as const,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = 'var(--m-shadow-md, 0 4px 16px rgba(0,0,0,0.10))';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'var(--m-shadow-sm, 0 1px 4px rgba(0,0,0,0.06))';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {!isReal && (
              <div style={{
                position: 'absolute' as const, top: 8, right: 8,
                fontSize: 9, fontWeight: 700, padding: '2px 5px',
                borderRadius: 'var(--m-radius-sm, 4px)',
                backgroundColor: 'var(--m-color-warn-soft, rgba(245,158,11,0.1))',
                color: 'var(--m-color-warn, #F59E0B)',
                border: '1px solid var(--m-color-warn, #F59E0B)',
              }}>
                WIP
              </div>
            )}
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--m-radius-lg, 14px)',
              backgroundColor: 'var(--shell-primary, #FF6835)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'var(--shell-topbar-bg, #FFFFFF)', fontSize: 20, fontWeight: 800 }}>
                {nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{
              color: 'var(--m-color-text, #1a1a1a)', fontSize: 13, fontWeight: 600,
              textAlign: 'center' as const, lineHeight: 1.3,
            }}>
              {nombre}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}