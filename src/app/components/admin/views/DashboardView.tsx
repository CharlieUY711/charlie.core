/* =====================================================
   DashboardView — Panel principal
   Cards: solo Logística
   ===================================================== */
import React from 'react';
import type { MainSection } from '../../../AdminDashboard';
import { Truck, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useOrchestrator } from '../../../../shells/DashboardShell/app/providers/OrchestratorProvider';
import { OrangeHeader } from '../OrangeHeader';

interface Props { onNavigate: (s: MainSection) => void; }

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  border: '1px solid #E5E7EB',
  padding: '24px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  width: '300px',
};

export function DashboardView({ onNavigate }: Props) {
  const { clienteNombre } = useOrchestrator();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      <OrangeHeader
        icon={LayoutDashboard}
        title={`Bienvenido, ${clienteNombre}`}
        subtitle="Sistema de gestión logística · Módulos activos"
        onNavigate={onNavigate}
      />

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8F9FA', padding: '32px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div
            onClick={() => onNavigate('logistica')}
            style={CARD_STYLE}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Truck size={22} color="#fff" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: 0 }}>Logística</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px', lineHeight: '1.5' }}>
              Hub central de operaciones logísticas. Envíos, transportistas y seguimiento en tiempo real.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FF6835', fontSize: '13px', fontWeight: 700 }}>
              Ir al módulo <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
