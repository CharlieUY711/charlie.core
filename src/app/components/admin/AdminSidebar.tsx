/* =====================================================
   AdminSidebar — Charlie Platform
   Entradas: Dashboard · Logística · Envíos · Transportistas
   ===================================================== */
import React from 'react';
import type { MainSection } from '../../AdminDashboard';
import { useOrchestrator } from '../../../shells/DashboardShell/app/providers/OrchestratorProvider';

const ACTIVE_BG = 'rgba(255,255,255,0.22)';
const HOVER_BG  = 'rgba(255,255,255,0.12)';

interface NavItem {
  id: MainSection;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',      label: 'Dashboard'      },
  { id: 'logistica',      label: 'Logística'      },
  { id: 'envios',         label: 'Envíos'         },
  { id: 'transportistas', label: 'Transportistas' },
];

interface Props {
  activeSection: MainSection;
  onNavigate: (section: MainSection) => void;
}

export function AdminSidebar({ activeSection, onNavigate }: Props) {
  const { config } = useOrchestrator();

  const clienteNombre = config?.theme?.nombre ?? 'Charlie';
  const colorPrimario = config?.theme?.primary ?? '#FF6B35';

  return (
    <aside
      style={{
        width: '200px',
        height: '100vh',
        backgroundColor: colorPrimario,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── Logo ── */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        flexShrink: 0,
      }}>
        <span style={{
          color: '#fff',
          fontWeight: '700',
          fontSize: '1.2rem',
          letterSpacing: '-0.02em',
        }}>
          {clienteNombre}
        </span>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: isActive ? ACTIVE_BG : 'transparent',
                color: '#fff',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '6px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = HOVER_BG;
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
