/**
 * OrchestratorShell.tsx
 * Charlie Platform — Renderizador de vistas y hub de modulos
 *
 * Dos modos:
 *   1. View directo  → activeSection esta en COMPONENT_REGISTRY → renderiza el modulo
 *   2. Hub de seccion → activeSection es una seccion → muestra cards de modulos activos
 */

import React from 'react';
import { COMPONENT_REGISTRY } from '../../utils/componentRegistry';
import { useShell }           from '../../context/ShellContext';
import { TopBarShell }        from './TopBarShell';
import { ActionBarShell }     from './ActionBarShell';

interface Props {
  activeSection: string;
  onNavigate:   (s: string) => void;
}

const Fallback = (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: '#888', fontSize: '14px',
  }}>
    Cargando...
  </div>
);

export function OrchestratorShell({ activeSection, onNavigate }: Props) {
  const { colorPrimario, modulos } = useShell();

  const esViewDirecto    = COMPONENT_REGISTRY[activeSection] !== undefined;
  const modulosDeSeccion = modulos.filter(m => m.section === activeSection);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <TopBarShell activeSection={activeSection} onNavigate={onNavigate} />
      <ActionBarShell />

      <div style={{ flex: 1, overflow: 'hidden' }}>

        {esViewDirecto ? (
          <React.Suspense fallback={Fallback}>
            {React.createElement(
              COMPONENT_REGISTRY[activeSection] as React.ComponentType<{ onNavigate: (s: string) => void }>,
              { onNavigate }
            )}
          </React.Suspense>

        ) : (
          <div style={{
            backgroundColor: '#F8F9FA', padding: '32px',
            overflowY: 'auto', height: '100%', boxSizing: 'border-box',
          }}>
            {modulosDeSeccion.length === 0 ? (
              <div style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '48px', textAlign: 'center' }}>
                No hay modulos activos en esta seccion.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {modulosDeSeccion.map(({ view, nombre }) => (
                  <button
                    key={view}
                    onClick={() => onNavigate(view)}
                    style={{
                      width: '180px', height: '180px', borderRadius: '16px',
                      border: '1px solid #E5E7EB', cursor: 'pointer',
                      backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '12px',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
                      e.currentTarget.style.transform  = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                      e.currentTarget.style.transform  = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: '14px',
                      backgroundColor: colorPrimario,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>
                        {(nombre ?? view).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span style={{
                      color: '#1a1a1a', fontSize: '13px', fontWeight: 600,
                      textAlign: 'center', padding: '0 12px', lineHeight: 1.3,
                    }}>
                      {nombre ?? view}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
