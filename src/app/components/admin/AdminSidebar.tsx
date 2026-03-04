/* =====================================================
   AdminSidebar — Charlie Platform
   Nav: solo Logística
   ===================================================== */
import React from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import type { MainSection } from '../../AdminDashboard';
import { useOrchestrator } from '../../../shells/DashboardShell/app/providers/OrchestratorProvider';

const ACTIVE_BG = 'rgba(255,255,255,0.22)';
const HOVER_BG  = 'rgba(255,255,255,0.12)';

interface Props {
  activeSection: MainSection;
  onNavigate: (section: MainSection) => void;
}

export function AdminSidebar({ activeSection, onNavigate }: Props) {
  const { config } = useOrchestrator();

  const clienteNombre = config?.theme?.nombre ?? 'Charlie';
  const colorPrimario = config?.theme?.primary ?? '#FF6B35';

  const isLogisticaActive =
    activeSection === 'logistica' ||
    activeSection === 'envios' ||
    activeSection === 'transportistas';

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

      {/* ── Logo ── */}
      <div style={{
        height: '88px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        flexShrink: 0,
      }}>
        <span style={{
          color: '#000',
          fontWeight: '600',
          fontSize: '1.7rem',
          lineHeight: 1,
          textAlign: 'justify',
          textAlignLast: 'justify',
        }}>
          {clienteNombre}
        </span>
      </div>

      {/* ── User ── */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.18)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '800', fontSize: '0.78rem',
            flexShrink: 0, border: '2px solid rgba(255,255,255,0.4)',
          }}>
            CV
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontWeight: '700', fontSize: '0.82rem', margin: 0, whiteSpace: 'nowrap' }}>Carlos Varalla</p>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.68rem', margin: 0 }}>Administrador</p>
          </div>
        </div>
      </div>

      {/* ── Nav — solo Logística ── */}
      <nav style={{ flex: 1, padding: '6px 0', overflowY: 'auto' }}>
        <button
          onClick={() => onNavigate('logistica')}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '9px 16px',
            border: 'none',
            backgroundColor: isLogisticaActive ? ACTIVE_BG : 'transparent',
            color: '#fff',
            fontSize: '13px',
            fontWeight: isLogisticaActive ? 700 : 400,
            cursor: 'pointer',
            textAlign: 'left',
            borderRadius: '6px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => {
            if (!isLogisticaActive) (e.currentTarget as HTMLElement).style.backgroundColor = HOVER_BG;
          }}
          onMouseLeave={e => {
            if (!isLogisticaActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }}
        >
          Logística
        </button>
      </nav>

      {/* ── Tip ── */}
      <div style={{
        margin: '0 10px 10px',
        padding: '10px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '10px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
          <Sparkles size={12} color="#fff" />
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.72rem' }}>Logística</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.67rem', margin: 0, lineHeight: '1.4' }}>
          Gestioná envíos y transportistas desde un solo lugar
        </p>
      </div>

      {/* ── Ver Tienda ── */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          margin: '0 10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          padding: '9px 0',
          backgroundColor: '#fff',
          color: colorPrimario,
          borderRadius: '10px',
          textDecoration: 'none',
          fontSize: '0.8rem',
          fontWeight: '700',
          flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
      >
        <ExternalLink size={13} />
        Ver tienda
      </a>
    </aside>
  );
}
