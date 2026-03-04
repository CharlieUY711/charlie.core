/* =====================================================
   DashboardView — Charlie Platform
   Landing del sistema — acceso a las 3 áreas
   ===================================================== */
import React from 'react';
import { Truck, Settings, Hammer } from 'lucide-react';
import { TopBar } from '../TopBar';
import type { MainSection } from '../../../AdminDashboard';

interface Props { onNavigate: (s: MainSection) => void; }

interface SectionCard {
  id: MainSection;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  items: string[];
}

const SECTIONS: SectionCard[] = [
  {
    id: 'logistica',
    label: 'Logística',
    description: 'Operaciones de envío y gestión de transportistas.',
    icon: Truck,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    items: ['Envíos', 'Transportistas', 'Organizaciones'],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    description: 'Configuración, integraciones y control de acceso.',
    icon: Settings,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    items: ['Diseño', 'Integraciones', 'Checklist', 'Ideas'],
  },
  {
    id: 'construccion',
    label: 'Construcción',
    description: 'Generador de proyectos y módulos Charlie.',
    icon: Hammer,
    color: '#FF6835',
    gradient: 'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
    items: ['Constructor', 'Constructor Módulos'],
  },
];

export function DashboardView({ onNavigate }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      <TopBar
        title="Dashboard"
        subtitle="Charlie Platform · Acceso rápido a todas las áreas"
      />

      <div style={{
        flex: 1, overflowY: 'auto',
        backgroundColor: '#F8F9FA',
        padding: '40px 32px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          maxWidth: '860px',
        }}>
          {SECTIONS.map(section => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                onClick={() => onNavigate(section.id)}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = `0 6px 24px ${section.color}22`;
                  el.style.transform = 'translateY(-3px)';
                  el.style.borderColor = `${section.color}40`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = 'none';
                  el.style.transform = 'translateY(0)';
                  el.style.borderColor = '#E2E8F0';
                }}
              >
                {/* Header con gradiente */}
                <div style={{
                  background: section.gradient,
                  padding: '22px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}>
                  <div style={{
                    width: '42px', height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={20} color="#fff" />
                  </div>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                    {section.label}
                  </p>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 18px' }}>
                  <p style={{
                    margin: '0 0 14px',
                    fontSize: '0.78rem', color: '#64748B', lineHeight: '1.5',
                  }}>
                    {section.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {section.items.map(item => (
                      <div key={item} style={{
                        display: 'flex', alignItems: 'center',
                        gap: '7px', fontSize: '0.75rem', color: '#94A3B8',
                      }}>
                        <span style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          backgroundColor: section.color, flexShrink: 0,
                        }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer CTA */}
                <div style={{
                  padding: '10px 18px 14px',
                  borderTop: '1px solid #F1F5F9',
                }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: '600', color: section.color,
                  }}>
                    Ir a {section.label} →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
