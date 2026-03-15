/**
 * OrchestratorShell.tsx
 * Charlie Platform — Renderizador de vistas y hub de módulos.
 *
 * Dos modos:
 *   1. View directo  → activeSection está en COMPONENT_REGISTRY → renderiza el módulo
 *   2. Hub de sección → activeSection no está en el registry → muestra HubView
 *
 * Zero colores hardcodeados. Usa HubView para todos los hubs.
 */
import React from 'react';
import { COMPONENT_REGISTRY } from '../../utils/componentRegistry';
import { useShell }           from '../../context/ShellContext';
import { TopBarShell }        from './TopBarShell';
import { ActionBarShell }     from './ActionBarShell';
import { HubView }            from './HubView';

interface Props {
  activeSection: string;
  onNavigate:    (s: string) => void;
}

const Fallback = (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: 'var(--m-color-text-muted, #888)', fontSize: 14,
  }}>
    Cargando...
  </div>
);

export function OrchestratorShell({ activeSection, onNavigate }: Props) {
  const { modulos } = useShell();

  const esViewDirecto    = COMPONENT_REGISTRY[activeSection] !== undefined;
  const modulosDeSeccion = modulos
    .filter(m => m.section === activeSection)
    .map(m => ({ view: m.view, nombre: m.nombre ?? m.view, isReal: m.isReal }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, height: '100%' }}>
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
          <HubView
            section={activeSection}
            modulos={modulosDeSeccion}
            onNavigate={onNavigate}
          />
        )}
      </div>
    </div>
  );
}