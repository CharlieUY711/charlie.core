/* =====================================================
   SistemaView — Hub de Sistema
   Cards: Checklist & Roadmap
   ===================================================== */
import React from 'react';
import type { MainSection } from '../../../AdminDashboard';
import { ClipboardList, ArrowRight } from 'lucide-react';

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

export function SistemaView({ onNavigate }: Props) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8F9FA', padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Sistema</h1>
        <p style={{ fontSize: '15px', color: '#6B7280', margin: 0 }}>Checklist & Roadmap · Orquestador · Constructor</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div
          onClick={() => onNavigate('checklist')}
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
              background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ClipboardList size={22} color="#fff" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: 0 }}>Checklist & Roadmap</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px', lineHeight: '1.5' }}>
            Estado de módulos Charlie con criterios C1–C8. Árbol por grupo, detección automática, toggles manuales.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '13px', fontWeight: 700 }}>
            Ir al módulo <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
