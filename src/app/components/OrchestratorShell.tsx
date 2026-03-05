/**
 * OrchestratorShell.tsx
 * Charlie Platform -- Shell principal de renderizado de modulos.
 */
import React from 'react';
import { OrangeHeader } from './admin/OrangeHeader';
import { COMPONENT_REGISTRY } from '../utils/componentRegistry';
import { useModules } from '../../shells/DashboardShell/app/hooks/useModules';

interface OrchestratorShellProps {
  activeSection: string;
  onNavigate: (s: string) => void;
}

const SuspenseFallback = (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: '#888', fontSize: '14px',
  }}>
    Cargando...
  </div>
);

export function OrchestratorShell({ activeSection, onNavigate }: OrchestratorShellProps) {
  const { modulos } = useModules();

  const modulo = modulos.find(m => m.slug === activeSection);
  const Component = COMPONENT_REGISTRY[activeSection];

  if (!Component) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', flexDirection: 'column', gap: '12px',
        color: '#888', fontFamily: 'inherit',
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Modulo <strong>{activeSection}</strong> no encontrado.
        </p>
      </div>
    );
  }

  const ComponentWithProps = Component as React.ComponentType<{ onNavigate: (s: string) => void }>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <OrangeHeader
        title={modulo?.nombre ?? activeSection}
        onNavigate={onNavigate}
        onHomeClick={() => onNavigate('DashboardView')}
        onBackClick={() => onNavigate('DashboardView')}
      />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <React.Suspense fallback={SuspenseFallback}>
          <ComponentWithProps onNavigate={onNavigate} />
        </React.Suspense>
      </div>
    </div>
  );
}