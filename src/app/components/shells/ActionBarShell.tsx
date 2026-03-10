/**
 * ActionBarShell.tsx
 * Charlie Platform — Barra de acciones del módulo activo
 *
 * 50px de alto. Aparece solo cuando el módulo registra count o buscador.
 * Botones fijos: Actualizar, Importar, Exportar, Editar, Eliminar, Nuevo
 * Habilitados automáticamente según count y permisos.
 */
import React from 'react';
import {
  RefreshCw, Upload, Download, Pencil,
  Trash2, Plus, Search,
} from 'lucide-react';
import { useActionBar } from './ActionBarContext';
import { useOrchestrator } from '../../../shells/DashboardShell/app/providers/OrchestratorProvider';

const BTN_HEIGHT = 34;

interface BtnConfig {
  icon:     React.ElementType;
  label:    string;
  color:    string;
  bg:       string;
  border:   string;
  enabled:  boolean;
  primary?: boolean;
  onClick?: () => void;
}

export function ActionBarShell() {
  const { state }  = useActionBar();
  const { config } = useOrchestrator();

  const colorPrimario = config?.theme?.primary ?? '#FF6835';
  const count = state.count ?? 0;
  const hasContent = state.count !== undefined || !!state.onSearch;

  if (!hasContent) return null;

  const buttons: BtnConfig[] = [
    {
      icon:    RefreshCw,
      label:   'Actualizar',
      color:   '#475569',
      bg:      '#fff',
      border:  '#DEE2E6',
      enabled: true,
      onClick: state.onRefresh,
    },
    {
      icon:    Upload,
      label:   'Importar',
      color:   '#0EA5E9',
      bg:      '#fff',
      border:  '#BAE6FD',
      enabled: false,
      onClick: state.onImport,
    },
    {
      icon:    Download,
      label:   'Exportar',
      color:   '#0EA5E9',
      bg:      '#fff',
      border:  '#BAE6FD',
      enabled: count > 0,
      onClick: state.onExport,
    },
    {
      icon:    Pencil,
      label:   'Editar',
      color:   '#475569',
      bg:      '#fff',
      border:  '#DEE2E6',
      enabled: count > 0,
      onClick: state.onEdit,
    },
    {
      icon:    Trash2,
      label:   'Eliminar',
      color:   '#EF4444',
      bg:      '#fff',
      border:  '#FECACA',
      enabled: false,
      onClick: state.onDelete,
    },
    {
      icon:    Plus,
      label:   'Nuevo',
      color:   '#fff',
      bg:      colorPrimario,
      border:  colorPrimario,
      enabled: true,
      primary: true,
      onClick: state.onNew,
    },
  ];

  return (
    <div style={{
      height:       50,
      minHeight:    50,
      display:      'flex',
      alignItems:   'center',
      padding:      '0 28px',
      gap:          8,
      borderBottom: '1px solid #E9ECEF',
      background:   '#FAFAFA',
      flexShrink:   0,
    }}>

      {/* Buscador */}
      {state.onSearch && (
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          8,
          background:   '#fff',
          border:       '1px solid #E5E7EB',
          borderRadius: 8,
          padding:      '0 12px',
          height:       BTN_HEIGHT,
          minWidth:     220,
          maxWidth:     320,
        }}>
          <Search size={14} color="#9CA3AF" strokeWidth={2} />
          <input
            placeholder={state.searchPlaceholder ?? 'Buscar...'}
            onChange={e => state.onSearch!(e.target.value)}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: '#374151', width: '100%',
            }}
          />
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Botones fijos */}
      {buttons.map((btn, i) => {
        const Icon = btn.icon;
        const disabled = !btn.enabled;
        return (
          <button
            key={i}
            onClick={btn.enabled && btn.onClick ? btn.onClick : undefined}
            disabled={disabled}
            title={btn.label}
            style={{
              height:          BTN_HEIGHT,
              padding:         '0 14px',
              borderRadius:    8,
              border:          `1.5px solid ${disabled ? '#E9ECEF' : btn.border}`,
              backgroundColor: disabled ? '#F8FAFC' : btn.bg,
              color:           disabled ? '#CBD5E1' : btn.color,
              fontSize:        13,
              fontWeight:      btn.primary ? 700 : 600,
              cursor:          disabled ? 'not-allowed' : 'pointer',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              gap:             6,
              flexShrink:      0,
              opacity:         disabled ? 0.5 : 1,
              transition:      'all 0.12s',
            }}
            onMouseEnter={e => {
              if (disabled) return;
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseLeave={e => {
              if (disabled) return;
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Icon size={14} strokeWidth={2.2} />
            <span>{btn.label}</span>
          </button>
        );
      })}
    </div>
  );
}
