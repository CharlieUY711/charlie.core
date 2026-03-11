/**
 * TopBarShell.tsx
 * Charlie Platform — TopBar principal
 * 100px altura — titulo dinamico + iconos de navegacion
 */

import React from 'react';
import { Home, ArrowLeft, Lightbulb, MapPin, LogOut } from 'lucide-react';
import { useShell } from '../../context/ShellContext';

const TOPBAR_HEIGHT = 100;

interface Props {
  activeSection: string;
  onNavigate:   (s: string) => void;
}

export function TopBarShell({ activeSection, onNavigate }: Props) {
  const { colorPrimario, user, signOut, secciones, modulos, subtitulo } = useShell();

  const seccion   = secciones.find(s => s.section === activeSection);
  const modulo    = modulos.find(m => m.view === activeSection);
  const titulo    = seccion?.nombre ?? modulo?.nombre ?? activeSection;
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

  return (
    <header style={{
      backgroundColor: '#fff',
      borderBottom:    '1px solid #E9ECEF',
      padding:         '0 28px',
      height:          `${TOPBAR_HEIGHT}px`,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      gap:             '16px',
      flexShrink:      0,
    }}>

      {/* Badge + titulo + subtitulo */}
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
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
          {subtitulo && (
            <span style={{
              fontSize:   '12px',
              color:      '#6B7280',
              marginTop:  '2px',
              whiteSpace: 'nowrap',
              overflow:   'hidden',
              textOverflow: 'ellipsis',
            }}>
              {subtitulo}
            </span>
          )}
        </div>
      </div>

      {/* Iconos de navegacion */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <IconBtn onClick={() => onNavigate('dashboard')} title="Dashboard" color="#6366F1">
          <Home size={17} color="#6366F1" strokeWidth={2.2} />
        </IconBtn>
        <IconBtn
          onClick={!esSeccion ? () => onNavigate(modulo?.section ?? 'dashboard') : undefined}
          title="Volver a la seccion"
          color="#64748B"
        >
          <ArrowLeft size={17} color="#64748B" strokeWidth={2.2} />
        </IconBtn>
        <IconBtn title="Ideas (proximamente)" color={colorPrimario}>
          <Lightbulb size={17} color={colorPrimario} strokeWidth={2.2} />
        </IconBtn>
        <IconBtn title="Google Maps" color="#10B981" onClick={() => onNavigate('GoogleMapsTestView')}>
          <MapPin size={17} color="#10B981" strokeWidth={2.2} />
        </IconBtn>
        <IconBtn onClick={signOut} title="Cerrar sesion" color="#EF4444">
          <LogOut size={17} color="#EF4444" strokeWidth={2.2} />
        </IconBtn>
      </div>

    </header>
  );
}
