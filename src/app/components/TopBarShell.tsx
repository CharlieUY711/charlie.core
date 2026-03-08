/**
 * TopBarShell.tsx
 * Charlie Platform — TopBar dinámica
 *
 * - Título resuelto desde secciones o módulos activos
 * - Botones de acción registrados por cada vista via ActionBarContext
 * - Buscador del módulo activo (si lo registra)
 */

import React, { useState } from 'react';
import { Home, ArrowLeft, Lightbulb, MapPin, LogOut, Search } from 'lucide-react';
import { useOrchestrator }      from '../../shells/DashboardShell/app/providers/OrchestratorProvider';
import { useModules }           from '../../shells/DashboardShell/app/hooks/useModules';
import { useAuth }              from '../../shells/DashboardShell/app/providers/AuthProvider';
import { useActionBar }         from './ActionBarContext';
import { SIDEBAR_HEADER_HEIGHT } from '../../shells/SidebarShell/SidebarShell';

const ORANGE = '#FF6835';

interface Props {
  activeSection: string;
  onNavigate:   (s: string) => void;
}

export function TopBarShell({ activeSection, onNavigate }: Props) {
  const { config }             = useOrchestrator();
  const { modulos, secciones } = useModules();
  const { signOut }            = useAuth();
  const { state: actionBar }   = useActionBar();
  const [searchQuery, setSearchQuery] = useState('');

  const colorPrimario = config?.theme?.primary ?? ORANGE;

  // Resuelve título dinámico
  const seccion = secciones.find(s => s.section === activeSection);
  const modulo  = modulos.find(m => m.view === activeSection);
  const titulo  = seccion?.nombre ?? modulo?.nombre ?? activeSection;
  const esSeccion = Boolean(seccion);

  const IconBtn = ({
    onClick, title: t, color, children,
  }: {
    onClick?: () => void;
    title:    string;
    color:    string;
    children: React.ReactNode;
  }) => (
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

  const btnHeight = 34;
  const btnStyle = (primary?: boolean): React.CSSProperties => ({
    height:          btnHeight,
    padding:         '0 16px',
    borderRadius:    '8px',
    border:          primary ? 'none' : '1.5px solid #DEE2E6',
    backgroundColor: primary ? colorPrimario : '#F8F9FA',
    color:           primary ? '#fff' : '#495057',
    fontSize:        '0.82rem',
    fontWeight:      primary ? 700 : 600,
    cursor:          'pointer',
    transition:      'all 0.12s',
    whiteSpace:      'nowrap',
    display:         'flex',
    alignItems:      'center',
    gap:             6,
    flexShrink:      0,
  });

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

      {/* Badge + título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div style={{
          width:          38,
          height:         38,
          borderRadius:   '10px',
          background:     `linear-gradient(135deg, ${colorPrimario} 0%, #ff8c42 100%)`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
        }}>
          <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 800 }}>
            {titulo.charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 style={{
          margin:       0,
          fontSize:     '1.2rem',
          fontWeight:   800,
          color:        '#1A1A2E',
          lineHeight:   1.2,
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
        }}>
          {titulo}
        </h1>
      </div>

      {/* Centro: buscador del módulo activo */}
      {actionBar.onSearch && (
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          8,
          flex:         1,
          maxWidth:     340,
          background:   '#F3F4F6',
          borderRadius: 8,
          padding:      '0 12px',
          height:       btnHeight,
        }}>
          <Search size={14} color="#9CA3AF" />
          <input
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              actionBar.onSearch!(e.target.value);
            }}
            placeholder={actionBar.searchPlaceholder ?? 'Buscar...'}
            style={{
              border:     'none',
              background: 'transparent',
              outline:    'none',
              fontSize:   13,
              color:      '#374151',
              width:      '100%',
            }}
          />
        </div>
      )}

      {/* Derecha: íconos de nav + botones de acción */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>

        <IconBtn onClick={() => onNavigate('dashboard')} title="Dashboard" color="#6366F1">
          <Home size={17} color="#6366F1" strokeWidth={2.2} />
        </IconBtn>

        <IconBtn
          onClick={!esSeccion ? () => onNavigate(modulo?.section ?? 'dashboard') : undefined}
          title="Volver a la sección"
          color="#64748B"
        >
          <ArrowLeft size={17} color="#64748B" strokeWidth={2.2} />
        </IconBtn>

        <IconBtn title="Ideas (próximamente)" color={ORANGE}>
          <Lightbulb size={17} color={ORANGE} strokeWidth={2.2} />
        </IconBtn>

        <IconBtn title="Mapas (próximamente)" color="#10B981">
          <MapPin size={17} color="#10B981" strokeWidth={2.2} />
        </IconBtn>

        <IconBtn onClick={signOut} title="Cerrar sesión" color="#EF4444">
          <LogOut size={17} color="#EF4444" strokeWidth={2.2} />
        </IconBtn>

        {/* Separador si hay botones de acción */}
        {actionBar.buttons.length > 0 && (
          <div style={{ width: 1, height: 24, background: '#E5E7EB', margin: '0 4px' }} />
        )}

        {actionBar.buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            style={btnStyle(btn.primary)}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = btn.primary ? '#e04e20' : '#E9ECEF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = btn.primary ? colorPrimario : '#F8F9FA';
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

    </header>
  );
}
