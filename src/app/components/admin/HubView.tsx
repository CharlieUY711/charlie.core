/* =====================================================
   HubView — Componente reutilizable para hubs
   Patrón: header blanco + grid de cards con gradiente
   + acordeón por sección (expandir/contraer)
   ===================================================== */
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ORANGE = '#FF6835';

/* ── Tipos públicos ────────────────────────────────── */

export interface HubCardDef {
  id:          string;
  icon:        React.ElementType;
  gradient:    string;
  color:       string;
  badge:       string;
  label:       string;
  description: string;
  stats:       { icon: React.ElementType; value: string; label: string }[];
  onClick:     () => void;
}

export interface HubSectionDef {
  label?:          string;
  count?:          string;
  subtitle?:       string;
  cards:           HubCardDef[];
  customFirstRow?: React.ReactNode;
  /** Si la sección arranca colapsada. Default: false (expandida) */
  defaultCollapsed?: boolean;
}

export interface HubQuickLink {
  label:   string;
  icon:    React.ElementType;
  color:   string;
  onClick: () => void;
}

export interface HubComingSoonItem {
  icon:  React.ElementType;
  label: string;
  desc?: string;
}

export interface HubViewProps {
  /* ── Header ── */
  hubIcon:  React.ElementType;
  title:    string;
  subtitle: string;

  /* ── Contenido ── */
  sections: HubSectionDef[];

  /* ── Extras opcionales ── */
  intro?:      React.ReactNode;
  afterCards?: React.ReactNode;
  quickLinks?: HubQuickLink[];

  /* ── Próximamente ── */
  comingSoon?:     HubComingSoonItem[];
  comingSoonText?: string;
  comingSoonIcon?: React.ElementType;

  /* ── Comportamiento ── */
  hideSeleccionar?: boolean;
}

/* ── Coming soon card ──────────────────────────────── */

function ComingSoonCard({
  items,
  text,
  icon: Icon,
}: {
  items: HubComingSoonItem[];
  text?: string;
  icon: React.ElementType;
}) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E9ECEF',
      borderRadius: 13, padding: 0, overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: '#F8F9FA', padding: '18px 19px',
        display: 'flex', alignItems: 'center', gap: 10,
        minHeight: 71, flexShrink: 0,
      }}>
        <div style={{
          width: 35, height: 35, borderRadius: 10,
          backgroundColor: '#E9ECEF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={18} color="#6C757D" strokeWidth={2} />
        </div>
        <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#1A1A2E', fontWeight: 800 }}>
          Próximamente
        </p>
      </div>
      <div style={{ padding: '14px 19px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        {text && (
          <p style={{ margin: '0 0 14px', fontSize: '0.67rem', color: '#6C757D', lineHeight: 1.5, flexShrink: 0 }}>
            {text}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 3 }}>
          {items.map((item, i) => (
            <div key={i} title={item.desc} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 8px', borderRadius: 5,
              backgroundColor: '#F8F9FA', border: '1px solid #E9ECEF',
              fontSize: '0.62rem', fontWeight: 600, color: '#495057',
            }}>
              <item.icon size={11} color="#6C757D" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── HubCard ───────────────────────────────────────── */

function HubCard({ card }: { card: HubCardDef }) {
  return (
    <button
      onClick={card.onClick}
      style={{
        background: '#fff', border: '1px solid #E9ECEF',
        borderRadius: 13, padding: 0, cursor: 'pointer',
        textAlign: 'left', transition: 'all 0.2s',
        overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        el.style.borderColor = card.color;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        el.style.borderColor = '#E9ECEF';
      }}
    >
      {/* Gradient header */}
      <div style={{
        background: card.gradient, padding: '18px 19px',
        display: 'flex', alignItems: 'center', gap: 10,
        minHeight: 71, flexShrink: 0,
      }}>
        <div style={{
          width: 35, height: 35, borderRadius: 10,
          backgroundColor: 'rgba(255,255,255,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <card.icon size={18} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.54rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            {card.badge}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#fff', fontWeight: 800 }}>
            {card.label}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 19px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <p style={{ margin: '0 0 14px', fontSize: '0.67rem', color: '#6C757D', lineHeight: 1.5, flexShrink: 0 }}>
          {card.description}
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8, paddingTop: 11, borderTop: '1px solid #F0F0F0', flexShrink: 0,
        }}>
          {card.stats.map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <stat.icon size={11} color={card.color} style={{ marginBottom: 3 }} />
              <p style={{ margin: 0, fontSize: '0.76rem', fontWeight: 800, color: '#1A1A2E' }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: '0.54rem', color: '#ADB5BD' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

/* ── HubCardGrid exportable ────────────────────────── */

export function HubCardGrid({ cards }: { cards: HubCardDef[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, calc((100vw - 200px - 32px - 32px) / 5))`,
      gridAutoRows: `calc((100vh - 88px - 16px - 16px - 16px) / 3)`,
      gap: 8, height: '100%', minHeight: 0,
    }}>
      {cards.map(card => (
        <div key={card.id} style={{ height: '100%', minHeight: 0, display: 'flex' }}>
          <HubCard card={card} />
        </div>
      ))}
    </div>
  );
}

/* ── Sección con acordeón ──────────────────────────── */

function HubSection({
  section,
  sectionIndex,
  isLast,
  comingSoon,
  comingSoonText,
  comingSoonIcon,
  hubIcon,
}: {
  section:         HubSectionDef;
  sectionIndex:    number;
  isLast:          boolean;
  comingSoon?:     HubComingSoonItem[];
  comingSoonText?: string;
  comingSoonIcon?: React.ElementType;
  hubIcon:         React.ElementType;
}) {
  const [collapsed, setCollapsed] = useState(section.defaultCollapsed ?? false);
  const hasComingSoon = isLast && comingSoon && comingSoon.length > 0;
  const hasLabel = !!section.label;

  return (
    <div style={{ marginBottom: sectionIndex < 99 ? 16 : 0 }}>

      {/* Header acordeón — solo si tiene label */}
      {hasLabel && (
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', marginBottom: collapsed ? 0 : 8,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 0', textAlign: 'left',
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: 4,
            background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s', flexShrink: 0,
          }}>
            {collapsed
              ? <ChevronRight size={11} color="#64748b" />
              : <ChevronDown  size={11} color="#64748b" />
            }
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {section.label}
          </p>
          {section.count && (
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{section.count}</span>
          )}
          {/* Badge con cantidad de cards */}
          <span style={{
            marginLeft: 4, fontSize: '0.65rem', fontWeight: 700,
            background: '#f1f5f9', color: '#64748b',
            padding: '1px 7px', borderRadius: 10,
          }}>
            {section.cards.length}
          </span>
        </button>
      )}

      {section.subtitle && !collapsed && (
        <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#6C757D' }}>
          {section.subtitle}
        </p>
      )}

      {/* Grid de cards — colapsable */}
      {!collapsed && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, calc((100vw - 200px - 32px - 32px) / 5))`,
          gridAutoRows: `calc((100vh - 88px - 16px - 16px - 16px) / 3)`,
          gap: 8,
        }}>
          {section.customFirstRow && (
            <div style={{ gridColumn: '1 / -1', height: '100%', minHeight: 0, display: 'flex' }}>
              {section.customFirstRow}
            </div>
          )}
          {section.cards.map(card => (
            <div key={card.id} style={{ height: '100%', minHeight: 0, display: 'flex' }}>
              <HubCard card={card} />
            </div>
          ))}
          {hasComingSoon && (
            <div style={{ height: '100%', minHeight: 0, display: 'flex' }}>
              <ComingSoonCard
                items={comingSoon!}
                text={comingSoonText}
                icon={comingSoonIcon ?? hubIcon}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Componente principal HubView ──────────────────── */

export function HubView({
  hubIcon: HubIcon,
  title,
  subtitle,
  sections,
  intro,
  afterCards,
  quickLinks,
  comingSoon,
  comingSoonText,
  comingSoonIcon,
  hideSeleccionar = false,
}: HubViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

      {/* ── Header blanco ── */}
      <div style={{
        padding: '0 32px', height: 88,
        backgroundColor: '#fff', borderBottom: '1px solid #E9ECEF',
        flexShrink: 0, display: 'flex', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${ORANGE} 0%, #ff8c42 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HubIcon size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1A1A2E' }}>
              {title}
            </h1>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6C757D' }}>
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Contenido scrollable ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {intro && <div style={{ marginBottom: 16 }}>{intro}</div>}

        {sections.map((section, si) => (
          <HubSection
            key={si}
            section={section}
            sectionIndex={si}
            isLast={si === sections.length - 1}
            comingSoon={comingSoon}
            comingSoonText={comingSoonText}
            comingSoonIcon={comingSoonIcon}
            hubIcon={HubIcon}
          />
        ))}

        {afterCards && <div style={{ marginTop: 32 }}>{afterCards}</div>}
      </div>
    </div>
  );
}
