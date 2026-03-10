/**
 * ModuleView.tsx
 * Charlie Platform — Wrapper universal para módulos
 *
 * Provee el layout estándar para cualquier módulo:
 *   - Fondo gris claro
 *   - Scroll interno
 *   - Padding consistente
 *
 * Uso: cada componente de módulo simplemente retorna su contenido
 * y el OrchestratorShell lo envuelve en ModuleView automáticamente.
 *
 * No tiene lógica propia — es solo el contenedor visual.
 */
import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Padding interno. Default: 0 (el módulo maneja su propio padding) */
  padding?: number | string;
  /** Color de fondo. Default: #F8F9FA */
  background?: string;
  /** Habilitar scroll vertical. Default: true */
  scrollable?: boolean;
}

export function ModuleView({
  children,
  padding    = 0,
  background = '#F8F9FA',
  scrollable = true,
}: Props) {
  return (
    <div style={{
      flex:       1,
      display:    'flex',
      flexDirection: 'column',
      height:     '100%',
      minHeight:  0,
      background,
      overflow:   scrollable ? 'auto' : 'hidden',
      padding,
    }}>
      {children}
    </div>
  );
}

/**
 * ModuleContent — área de contenido con padding estándar
 * Usar dentro de ModuleView cuando el módulo necesita padding consistente.
 */
export function ModuleContent({
  children,
  padding = '20px 28px',
}: {
  children: React.ReactNode;
  padding?: string | number;
}) {
  return (
    <div style={{ padding, flex: 1, minHeight: 0 }}>
      {children}
    </div>
  );
}
