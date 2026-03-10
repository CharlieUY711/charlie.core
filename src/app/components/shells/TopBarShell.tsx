/**
 * TopBarShell.tsx
 * Charlie Platform — TopBar principal
 * 100px altura — título dinámico + ícono real desde visualRegistry
 */
import React from 'react';
import { Home, ArrowLeft, LogOut, Settings } from 'lucide-react';
import { useOrchestrator }       from '../../../shells/DashboardShell/app/providers/OrchestratorProvider';
import { useModules }            from '../../../shells/DashboardShell/app/hooks/useModules';
import { useAuth }               from '../../../shells/DashboardShell/app/providers/AuthProvider';
import { getVisual }             from '../../utils/visualRegistry';
import { SIDEBAR_HEADER_HEIGHT } from '../../../shells/SidebarShell/SidebarShell';

const ORANGE = '#FF6835';

interface Props {
  activeSection: string;
  onNavigate:   (s: string) => void;
}

function IconBtn({
  onClick, title: t, color, children,
}: {
  onClick?: () => void;
  title:    string;
  color:    string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      title={t}
      style={{
        width:           38,
        height:          38,
        borderRadius:    '50%',
        border:          `2px solid ${color}40`,
        backgroundColor: onClick ? `${color}08` : `${color}04`,
        opacity:         onClick ? 1 : 0.4,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        cursor:          onClick ? 'pointer' : 'not-allowed',
        transition:      'all 0.15s',
        flexShrink:      0,
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.backgroundColor = `${color}20`; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.backgroundColor = `${color}08`; }}
    >
      {children}
    </button>
  );
}

export function TopBarShell({ activeSection, onNavigate }: Props) {
  const { config }             = useOrchestrator();
  const { modulos, secciones } = useModules();
  const { signOut }            = useAuth();

  const colorPrimario = config?.theme?.primary ?? ORANGE;

  const seccion   = secciones.find(s => s.section === activeSection);
  const modulo    = modulos.find(m => m.view === activeSection);
  const titulo    = seccion?.nombre ?? modulo?.nombre ?? activeSection;
  const esSeccion = Boolean(seccion);

  // Ícono real desde visualRegistry
  const visual  = getVisual(activeSection);
  const ModIcon = visual.icon ?? Settings;

  // Sección padre para el botón Volver
  const seccionPadre = modulo?.section ?? 'dashboard';

  return (
    <header style={{
      backgroundColor: '#fff',
      borderBottom:    '1px solid #E9ECEF',
      padding:         '0 28px',
      height:          `${SIDEBAR_HEADER_HEIGHT}px`,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      gap:             '16px',
      flexShrink:      0,
    }}>

      {/* Ícono + título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div style={{
          width:          38,
          height:         38,
          borderRadius:   '10px',
          background:     visual.gradient ?? `linear-gradient(135deg, ${colorPrimario} 0%, #ff8c42 100%)`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
        }}>
          <ModIcon size={18} color="#fff" strokeWidth={2.2} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            margin:       0,
            fontSize:     '1.15rem',
            fontWeight:   800,
            color:        '#1A1A2E',
            lineHeight:   1.2,
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
          }}>
            {titulo}
          </h1>
          {visual.description && (
            <p style={{
              margin:       0,
              fontSize:     '0.72rem',
              color:        '#94A3B8',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
            }}>
              {visual.description}
            </p>
          )}
        </div>
      </div>

      {/* Botones de navegación */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <IconBtn
          onClick={() => onNavigate('dashboard')}
          title="Dashboard"
          color="#6366F1"
        >
          <Home size={17} color="#6366F1" strokeWidth={2.2} />
        </IconBtn>

        <IconBtn
          onClick={!esSeccion ? () => onNavigate(seccionPadre) : undefined}
          title="Volver a la sección"
          color="#64748B"
        >
          <ArrowLeft size={17} color="#64748B" strokeWidth={2.2} />
        </IconBtn>

        <IconBtn
          onClick={signOut}
          title="Cerrar sesión"
          color="#EF4444"
        >
          <LogOut size={17} color="#EF4444" strokeWidth={2.2} />
        </IconBtn>
      </div>
    </header>
  );
}
