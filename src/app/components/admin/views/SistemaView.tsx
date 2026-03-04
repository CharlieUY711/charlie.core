import React from 'react';
import type { MainSection } from '../../../AdminDashboard';
import { ClipboardList, Lightbulb, ArrowRight } from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB',
  padding: '24px', cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)', width: '300px',
};

const CARDS = [
  {
    id: 'checklist' as MainSection,
    icon: ClipboardList,
    label: 'Checklist & Roadmap',
    description: 'Estado de módulos Charlie con criterios C1–C8. Árbol por grupo, detección automática, toggles manuales.',
    color: '#475569',
    gradient: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
  },
  {
    id: 'ideas' as MainSection,
    icon: Lightbulb,
    label: 'Ideas',
    description: 'Capturá ideas, evaluá viabilidad con 4 criterios y decidí si promoverlas a módulo.',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
  },
];

export function SistemaView({ onNavigate }: Props) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8F9FA', padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Sistema</h1>
        <p style={{ fontSize: '15px', color: '#6B7280', margin: 0 }}>Checklist · Ideas · Roadmap</p>
      </div>
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
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', background: card.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
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
  );
}
