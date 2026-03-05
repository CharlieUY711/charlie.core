/**
 * AdminSidebar.tsx
 * Charlie Platform -- Sidebar dinamico.
 * Lee modulos activos desde Supabase via useModules().
 * Zero hardcoding de secciones.
 */
import React from 'react';
import { useOrchestrator } from '../../../shells/DashboardShell/app/providers/OrchestratorProvider';
import { useModules } from '../../../shells/DashboardShell/app/hooks/useModules';

const ACTIVE_BG = 'rgba(255,255,255,0.22)';
const HOVER_BG  = 'rgba(255,255,255,0.12)';

interface Props {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function AdminSidebar({ activeSection, onNavigate }: Props) {
  const { config } = useOrchestrator();
  const { modulos, loading } = useModules();

  const clienteNombre = config?.theme?.nombre ?? 'Charlie';
  const colorPrimario = config?.theme?.primary ?? '#FF6B35';

  return (
    <aside style={{
      width: '200px',
      height: '100vh',
      backgroundColor: colorPrimario,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
    }}>

      {/* Logo */}
      <div style={{
        padding: '24px 16px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: '18px',
          letterSpacing: '-0.3px',
        }}>
          {clienteNombre}
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: '11px',
          marginTop: '2px',
        }}>
          Charlie Platform
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', padding: '8px 12px' }}>
            Cargando...
          </div>
        ) : (
          modulos.map(modulo => {
            const isActive = activeSection === modulo.slug;
            return (
              <button
                key={modulo.slug}
                onClick={() => onNavigate(modulo.slug)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? ACTIVE_BG : 'transparent',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  transition: 'background-color 0.15s',
                  marginBottom: '2px',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = HOVER_BG;
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
              >
                {modulo.nombre}
              </button>
            );
          })
        )}
      </nav>

    </aside>
  );
}
