/**
 * OrchestratorShell.tsx
 * Charlie Platform — Renderizador de vistas y hub de módulos
 *
 * Recibe modulos como prop desde AdminDashboard — no llama useModules() propio.
 * Dos modos:
 *   1. View directo  → activeSection está en COMPONENT_REGISTRY → renderiza el módulo
 *   2. Hub de sección → activeSection es una sección → muestra cards de módulos activos
 */

import React from 'react';
import { COMPONENT_REGISTRY } from '../utils/componentRegistry';
import { useOrchestrator }    from '../../shells/DashboardShell/app/providers/OrchestratorProvider';
import { TopBarShell }        from './TopBarShell';
import type { ModuloActivo }  from '../../shells/DashboardShell/app/hooks/useModules';

interface Props {
  activeSection: string;
  onNavigate:   (s: string) => void;
  modulos:      ModuloActivo[];
}

const Fallback = (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: '#888', fontSize: '14px',
  }}>
    Cargando...
  </div>
);

export function OrchestratorShell({ activeSection, onNavigate, modulos }: Props) {
  const { config }    = useOrchestrator();
  const colorPrimario = config?.theme?.primary ?? '#FF6B35';

  const esViewDirecto      = COMPONENT_REGISTRY[activeSection] !== undefined;
  const modulosDeSeccion   = modulos.filter(m => m.section === activeSection);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <TopBarShell activeSection={activeSection} onNavigate={onNavigate} />

      <div style={{ flex: 1, overflow: 'hidden' }}>

        {esViewDirecto ? (
          // Modo 1: Modulo directo
          <React.Suspense fallback={Fallback}>
            {React.createElement(
              COMPONENT_REGISTRY[activeSection] as React.ComponentType<{ onNavigate: (s: string) => void }>,
              { onNavigate }
            )}
          </React.Suspense>

        ) : (
          // Modo 2: Hub de seccion
          <div style={{
            backgroundColor: '#F8F9FA',
            padding:         '32px',
            overflowY:       'auto',
            height:          '100%',
            boxSizing:       'border-box' as const,
          }}>
            {modulosDeSeccion.length === 0 ? (
              <div style={{
                color:     '#9CA3AF',
                fontSize:  '14px',
                marginTop: '48px',
                textAlign: 'center' as const,
              }}>
                No hay modulos activos en esta seccion.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {modulosDeSeccion.map(({ view, nombre }) => (
                  <button
                    key={view}
                    onClick={() => onNavigate(view)}
                    style={{
                      width:           '180px',
                      height:          '180px',
                      borderRadius:    '16px',
                      border:          '1px solid #E5E7EB',
                      cursor:          'pointer',
                      backgroundColor: '#fff',
                      boxShadow:       '0 1px 4px rgba(0,0,0,0.06)',
                      display:         'flex',
                      flexDirection:   'column',
                      alignItems:      'center',
                      justifyContent:  'center',
                      gap:             '12px',
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
                      width:           52,
                      height:          52,
                      borderRadius:    '14px',
                      backgroundColor: colorPrimario,
                      display:         'flex',
                      alignItems:      'center',
                      justifyContent:  'center',
                    }}>
                      <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>
                        {(nombre ?? view).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span style={{
                      color:      '#1a1a1a',
                      fontSize:   '13px',
                      fontWeight: 600,
                      textAlign:  'center' as const,
                      padding:    '0 12px',
                      lineHeight: 1.3,
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
