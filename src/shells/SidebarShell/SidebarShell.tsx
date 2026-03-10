/**
 * SidebarShell.tsx
 * Charlie Platform — Sidebar dinamico · 5 zonas configurables
 *
 * Zona 1 — Header:    nombre empresa + nombre sistema
 * Zona 2 — Usuario:   avatar + nombre + email
 * Zona 3 — Menu:      secciones activas ordenadas
 * Zona 4 — Info:      modulo activo
 * Zona 5 — CTA:       boton configurable o ausente
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useShell } from '../../app/context/ShellContext';

export const SIDEBAR_HEADER_HEIGHT = 100;

interface Props {
  activeSection: string;
  onNavigate:   (section: string) => void;
  nombreEmpresa?: string;
  nombreSistema?: string;
  infoBlock?:    { tipo: string; titulo?: string; texto?: string } | null;
  cta?:          { label: string; url?: string } | null;
}

function getInicial(nombre?: string | null, email?: string | null): string {
  if (nombre) return nombre.charAt(0).toUpperCase();
  if (email)  return email.charAt(0).toUpperCase();
  return '?';
}

export function SidebarShell({
  activeSection,
  onNavigate,
  nombreEmpresa = 'Charlie',
  nombreSistema = 'Charlie Platform',
  infoBlock     = { tipo: 'modulo_activo' },
  cta           = null,
}: Props) {
  const { colorPrimario, user, secciones, loadingModulos } = useShell();

  const seccionActiva = secciones.find(s => s.section === activeSection);

  return (
    <aside style={{
      width:           '210px',
      height:          '100vh',
      backgroundColor: colorPrimario,
      display:         'flex',
      flexDirection:   'column',
      flexShrink:      0,
      position:        'sticky',
      top:             0,
      overflow:        'hidden',
    }}>

      {/* ZONA 1 — HEADER */}
      <div style={{
        height:         `${SIDEBAR_HEADER_HEIGHT}px`,
        boxSizing:      'border-box',
        padding:        '0 16px',
        borderBottom:   '1px solid rgba(255,255,255,0.15)',
        flexShrink:     0,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
      }}>
        <div style={{
          color: '#fff', fontWeight: 400, fontSize: '28px',
          letterSpacing: '-0.3px', lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {nombreEmpresa}
        </div>
        <div style={{ color: '#fff', fontSize: '17px', marginTop: '2px', letterSpacing: '0.3px' }}>
          {nombreSistema}
        </div>
      </div>

      {/* ZONA 2 — USUARIO */}
      {user && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.10)', flexShrink: 0,
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.20)',
            border: '1.5px solid rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: '13px', fontWeight: 700, color: '#fff', overflow: 'hidden',
          }}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover' }} />
            ) : (
              getInicial(user.nombre, user.email)
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: '#fff', fontSize: '17.5px', fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3,
            }}>
              {user.nombre ?? '—'}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.55)', fontSize: '14px', marginTop: '2px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.email ?? ''}
            </div>
          </div>
        </div>
      )}

      {/* ZONA 3 — MENU */}
      <nav style={{ flex: 1, padding: '8px', paddingTop: '30px', overflowY: 'auto' }}>
        {loadingModulos ? (
          <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: '13px', padding: '10px 12px', fontStyle: 'italic' }}>
            Cargando modulos...
          </div>
        ) : (
          [...secciones]
            .sort((a, b) => {
              if (a.section === 'dashboard') return -1;
              if (b.section === 'dashboard') return 1;
              return (a.nombre ?? a.section).localeCompare(b.nombre ?? b.section);
            })
            .map(({ section, nombre }) => {
              const esActivo = activeSection === section;
              return (
                <button
                  key={section}
                  onClick={() => onNavigate(section)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    padding: '9px 12px', border: 'none', borderRadius: '0',
                    cursor: 'pointer', backgroundColor: 'transparent',
                    color: esActivo ? '#000' : '#fff',
                    fontSize: '14px', fontWeight: esActivo ? 700 : 400,
                    textAlign: 'left', marginBottom: '1px', transition: 'color 0.12s',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!esActivo) e.currentTarget.style.color = 'rgba(0,0,0,0.50)'; }}
                  onMouseLeave={e => { if (!esActivo) e.currentTarget.style.color = '#fff'; }}
                >
                  {nombre}
                </button>
              );
            })
        )}
      </nav>

      {/* ZONA 4 — INFO BLOCK */}
      {infoBlock && infoBlock.tipo !== 'oculto' && (
        <div style={{
          margin: '0 8px 6px', padding: '10px 12px', borderRadius: '10px',
          backgroundColor: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.10)', flexShrink: 0,
        }}>
          {infoBlock.tipo === 'modulo_activo' ? (
            <>
              <div style={{
                color: 'rgba(255,255,255,0.55)', fontSize: '9px', fontWeight: 600,
                letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '3px',
              }}>
                Modulo activo
              </div>
              <div style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                {seccionActiva?.nombre ?? activeSection}
              </div>
            </>
          ) : (
            <>
              {infoBlock.titulo && (
                <div style={{ color: '#fff', fontSize: '11px', fontWeight: 700, marginBottom: '4px', lineHeight: 1.3 }}>
                  {infoBlock.titulo}
                </div>
              )}
              {infoBlock.texto && (
                <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: '10.5px', lineHeight: 1.5 }}>
                  {infoBlock.texto}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ZONA 5 — CTA */}
      {cta && (
        <div style={{ padding: '0 8px 16px', flexShrink: 0 }}>
          <button
            onClick={() => cta.url ? window.open(cta.url, '_blank') : undefined}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '7px', padding: '10px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', backgroundColor: '#fff', color: colorPrimario,
              fontSize: '12px', fontWeight: 700, transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            <ExternalLink size={13} />
            {cta.label}
          </button>
        </div>
      )}

    </aside>
  );
}
