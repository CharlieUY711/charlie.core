/* =====================================================
   DashboardView -- Panel principal
   ===================================================== */
import React from 'react';
import { Truck, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useOrchestrator } from '../../../../shells/DashboardShell/app/providers/OrchestratorProvider';
import { useModules } from '../../../../shells/DashboardShell/app/hooks/useModules';

interface Props { onNavigate: (s: string) => void; }

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

const ICON_COLORS: Record<string, string> = {
  logistica:     'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
  ecommerce:     'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  marketing:     'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
  sistema:       'linear-gradient(135deg, #64748B 0%, #475569 100%)',
  herramientas:  'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  gestion:       'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  integraciones: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  pagos:         'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
  erp:           'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
  crm:           'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
};

export function DashboardView({ onNavigate }: Props) {
  const { clienteNombre } = useOrchestrator();
  const { modulos, loading } = useModules();

  // Mostrar un hub card por categoria
  const categorias = [...new Set(modulos.map(m => m.categoria))];

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8F9FA', padding: '32px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '8px' }}>
        Bienvenido, {clienteNombre}
      </h2>
      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '32px' }}>
        {loading ? 'Cargando modulos...' : `${modulos.length} modulos activos`}
      </p>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {categorias.map(cat => (
          <div
            key={cat}
            onClick={() => {
              const first = modulos.find(m => m.categoria === cat);
              if (first) onNavigate(first.slug);
            }}
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
                background: ICON_COLORS[cat] ?? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Truck size={22} color="#fff" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: 0, textTransform: 'capitalize' }}>
                {cat}
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px', lineHeight: '1.5' }}>
              {modulos.filter(m => m.categoria === cat).length} modulos disponibles
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FF6835', fontSize: '13px', fontWeight: 700 }}>
              Ver modulos <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}