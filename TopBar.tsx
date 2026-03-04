/* =====================================================
   TopBar — Charlie Platform
   Barra superior universal — se adapta por vista
   ===================================================== */
import React from 'react';

interface Action {
  label: string;
  onClick?: () => void;
  primary?: boolean;
  icon?: React.ElementType;
  ghost?: boolean;
}

interface TopBarProps {
  /** Icono izquierdo dentro de un box con color */
  icon?: React.ElementType;
  iconBg?: string;
  /** Título principal */
  title: string;
  /** Subtítulo / stats */
  subtitle?: string;
  /** Botón de breadcrumb / volver */
  breadcrumb?: { label: string; onClick: () => void };
  /** Elementos extra entre breadcrumb y acciones */
  extras?: React.ReactNode;
  /** Botones de acción (derecha) */
  actions?: Action[];
}

export function TopBar({
  icon: Icon,
  iconBg = '#FF6835',
  title,
  subtitle,
  breadcrumb,
  extras,
  actions = [],
}: TopBarProps) {
  return (
    <div style={{
      height: '56px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '12px',
      flexShrink: 0,
    }}>

      {/* Icono */}
      {Icon && (
        <div style={{
          width: '34px', height: '34px', borderRadius: '8px',
          backgroundColor: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} color="#fff" />
        </div>
      )}

      {/* Título + subtítulo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#0F172A', lineHeight: 1.2 }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8', marginTop: '1px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Extras */}
      {extras}

      {/* Breadcrumb */}
      {breadcrumb && (
        <button
          onClick={breadcrumb.onClick}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '6px 12px', borderRadius: '6px',
            border: '1px solid #E2E8F0', backgroundColor: '#fff',
            color: '#64748B', fontSize: '0.78rem', fontWeight: '500',
            cursor: 'pointer', transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
        >
          ← {breadcrumb.label}
        </button>
      )}

      {/* Acciones */}
      {actions.map((action, i) => {
        const ActionIcon = action.icon;
        return (
          <button
            key={i}
            onClick={action.onClick}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '6px',
              border: action.primary ? 'none' : '1px solid #E2E8F0',
              backgroundColor: action.primary ? '#FF6835' : '#fff',
              color: action.primary ? '#fff' : '#475569',
              fontSize: '0.78rem', fontWeight: '600',
              cursor: 'pointer', transition: 'opacity 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {ActionIcon && <ActionIcon size={13} />}
            {action.label}
          </button>
        );
      })}

    </div>
  );
}
