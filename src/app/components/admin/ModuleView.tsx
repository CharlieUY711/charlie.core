/**
 * ModuleView.tsx
 * Charlie Platform — Contenedor base para vistas de modulos
 *
 * Envuelve cualquier vista con el layout estandar Charlie:
 * scroll, padding, altura correcta, fondo consistente.
 *
 * Uso:
 *   <ModuleView>
 *     <MiVistaDeModulo />
 *   </ModuleView>
 */

import React from 'react';

interface ModuleViewProps {
  children:    React.ReactNode;
  padding?:    string | number;
  background?: string;
  scrollable?: boolean;
}

export function ModuleView({
  children,
  padding    = '28px',
  background = '#F8F9FA',
  scrollable = true,
}: ModuleViewProps) {
  return (
    <div style={{
      flex:       1,
      height:     '100%',
      background,
      overflowY:  scrollable ? 'auto' : 'hidden',
      overflowX:  'hidden',
      boxSizing:  'border-box',
      padding,
    }}>
      {children}
    </div>
  );
}
