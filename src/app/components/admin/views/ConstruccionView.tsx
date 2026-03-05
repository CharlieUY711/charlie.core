/* =====================================================
   ConstruccionView — Hub de Construcción
   Cards: Constructor · Constructor Módulos
   ===================================================== */
import React from 'react';
import type { MainSection } from '../../../AdminDashboard';
import { Blocks, Hammer, ArrowRight } from 'lucide-react';
import { OrangeHeader } from '../OrangeHeader';

interface Props { onNavigate: (s: MainSection) => void; }

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB',
  padding: '24px', cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)', width: '300px',
};

const CARDS = [
  {
    id: 'constructor' as MainSection,
    icon: Blocks,
    label: 'Constructor',
    description: 'Generador de proyectos Charlie. Seleccioná módulos, configurá el frontstore y exportá el proyecto listo para deployar.',
    color: '#FF6835',
    gradient: 'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
  },
  {
    id: 'constructor-modulos' as MainSection,
    icon: Hammer,
    label: 'Constructor Módulos',
    description: 'Crear, actualizar y reparar módulos Charlie. Genera código Charlie-compliant con C1–C8 cumplidos desde el primer commit.',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  },
];

export function ConstruccionView({ onNavigate }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      <OrangeHeader
        icon={Hammer}
        title="Construcción"
        subtitle="Constructor de proyectos y módulos Charlie"
        onNavigate={onNavigate}
        onBackClick={() => onNavigate('dashboard')}
      />

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8F9FA', padding: '32px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {CARDS.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.id} onClick={() => onNavigate(card.id)} style={CARD_STYLE}
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
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: 0 }}>{card.label}</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px', lineHeight: '1.5' }}>
                  {card.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: card.color, fontSize: '13px', fontWeight: 700 }}>
                  Ir al módulo <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
