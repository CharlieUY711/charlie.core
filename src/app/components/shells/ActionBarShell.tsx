/**
 * ActionBarShell.tsx
 * Charlie Platform — Barra de acciones estándar.
 *
 * Botonera fija: Nuevo · Editar · Guardar · Exportar · Importar · Eliminar · Tools
 * Solo se renderizan los botones que el módulo declaró en useRegisterActions().
 * Zero colores hardcodeados — solo var(--shell-*) y var(--m-*).
 *
 * Visibilidad: solo aparece cuando hay al menos una acción registrada.
 */
import React, { useState } from 'react';
import { Search, Plus, Pencil, Save, Download, Upload, Trash2 } from 'lucide-react';
import { useActionBar } from './ActionBarContext';

// ── Definición de la botonera estándar ────────────────────────────────────────

interface BtnDef {
  key:      string;
  label:    string;
  icon:     React.ComponentType<{ size?: number; strokeWidth?: number }>;
  primary?: boolean;
  danger?:  boolean;
  action:   keyof Pick<ReturnType<typeof useActionBar>['config'],
    'onNuevo' | 'onEditar' | 'onGuardar' | 'onExportar' | 'onImportar' | 'onEliminar'>;
  enabled?: keyof Pick<ReturnType<typeof useActionBar>['config'],
    'puedeEditar' | 'puedeGuardar' | 'puedeEliminar'>;
}

const BOTONES_ESTANDAR: BtnDef[] = [
  { key: 'nuevo',    label: 'Nuevo',    icon: Plus,     primary: true,  action: 'onNuevo'    },
  { key: 'editar',   label: 'Editar',   icon: Pencil,                   action: 'onEditar',   enabled: 'puedeEditar'   },
  { key: 'guardar',  label: 'Guardar',  icon: Save,                     action: 'onGuardar',  enabled: 'puedeGuardar'  },
  { key: 'exportar', label: 'Exportar', icon: Download,                 action: 'onExportar'  },
  { key: 'importar', label: 'Importar', icon: Upload,                   action: 'onImportar'  },
  { key: 'eliminar', label: 'Eliminar', icon: Trash2,   danger: true,   action: 'onEliminar', enabled: 'puedeEliminar' },
];

// ── Componente ────────────────────────────────────────────────────────────────

export function ActionBarShell() {
  const { config, query, setQuery } = useActionBar();

  // Filtrar solo los botones que el módulo declaró
  const botonesActivos = BOTONES_ESTANDAR.filter(b => !!config[b.action]);
  const tieneTools     = config.tools && config.tools.length > 0;
  const tieneBuscador  = !!config.onSearch;
  const hasContent     = botonesActivos.length > 0 || tieneTools || tieneBuscador;

  if (!hasContent) return null;

  return (
    <div style={{
      height:       50,
      minHeight:    50,
      display:      'flex',
      alignItems:   'center',
      padding:      '0 var(--m-space-6, 24px)',
      gap:          'var(--m-space-2, 8px)',
      borderBottom: '1px solid var(--shell-actionbar-border, var(--m-color-border, #E5E7EB))',
      backgroundColor: 'var(--shell-actionbar-bg, #F8F9FA)',
      flexShrink:   0,
      boxSizing:    'border-box' as const,
    }}>

      {/* ── Buscador ── */}
      {tieneBuscador && (
        <div style={{
          display:         'flex',
          alignItems:      'center',
          gap:             'var(--m-space-2, 8px)',
          backgroundColor: 'var(--shell-topbar-bg, #FFFFFF)',
          border:          '1px solid var(--shell-actionbar-border, var(--m-color-border, #E5E7EB))',
          borderRadius:    'var(--m-radius-md, 8px)',
          padding:         '0 var(--m-space-3, 12px)',
          height:          34,
          minWidth:        220,
          maxWidth:        340,
          flex:            1,
        }}>
          <Search size={14} color="var(--m-color-text-muted, #9CA3AF)" strokeWidth={2} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={config.searchPlaceholder ?? 'Buscar...'}
            style={{
              border:     'none',
              background: 'transparent',
              outline:    'none',
              fontSize:   13,
              color:      'var(--m-color-text, #374151)',
              width:      '100%',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                border:          'none',
                background:      'transparent',
                cursor:          'pointer',
                color:           'var(--m-color-text-muted, #9CA3AF)',
                fontSize:        14,
                lineHeight:      1,
                padding:         0,
                flexShrink:      0,
              }}
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* ── Tools (zona de herramientas opcionales) ── */}
      {tieneTools && config.tools!.map(tool => (
        <button
          key={tool.id}
          onClick={tool.onClick}
          title={tool.label}
          style={{
            height:          34,
            padding:         '0 var(--m-space-3, 12px)',
            borderRadius:    'var(--m-radius-sm, 6px)',
            border:          '1px solid var(--shell-actionbar-border, var(--m-color-border, #E5E7EB))',
            backgroundColor: 'var(--shell-topbar-bg, #FFFFFF)',
            color:           'var(--m-color-text-muted, #6B7280)',
            fontSize:        12,
            fontWeight:      600,
            cursor:          'pointer',
            display:         'flex',
            alignItems:      'center',
            gap:             'var(--m-space-1, 4px)',
            flexShrink:      0,
            transition:      'background-color 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--m-color-surface-2, #F3F4F6)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--shell-topbar-bg, #FFFFFF)'}
        >
          {tool.icon && React.createElement(tool.icon, { size: 14 })}
          {tool.label}
        </button>
      ))}

      {/* ── Botonera estándar ── */}
      {botonesActivos.map(btn => {
        const handler  = config[btn.action] as (() => void) | undefined;
        const habilitado = btn.enabled ? (config[btn.enabled] !== false) : true;
        const Icon = btn.icon;

        return (
          <button
            key={btn.key}
            onClick={handler}
            disabled={!habilitado}
            title={btn.label}
            style={{
              height:          34,
              padding:         '0 var(--m-space-4, 16px)',
              borderRadius:    'var(--m-radius-sm, 6px)',
              border:          btn.primary
                ? 'none'
                : btn.danger
                ? '1px solid var(--m-color-error, #EF4444)'
                : '1px solid var(--shell-actionbar-border, var(--m-color-border, #E5E7EB))',
              backgroundColor: btn.primary
                ? 'var(--shell-primary, #FF6835)'
                : btn.danger
                ? 'transparent'
                : 'var(--shell-topbar-bg, #FFFFFF)',
              color: btn.primary
                ? 'var(--shell-topbar-bg, #FFFFFF)'
                : btn.danger
                ? 'var(--m-color-error, #EF4444)'
                : 'var(--m-color-text-muted, #6B7280)',
              fontSize:        13,
              fontWeight:      btn.primary ? 700 : 600,
              cursor:          habilitado ? 'pointer' : 'not-allowed',
              opacity:         habilitado ? 1 : 0.4,
              display:         'flex',
              alignItems:      'center',
              gap:             'var(--m-space-1, 4px)',
              flexShrink:      0,
              whiteSpace:      'nowrap' as const,
              transition:      'all 0.12s',
              boxSizing:       'border-box' as const,
            }}
            onMouseEnter={e => {
              if (!habilitado) return;
              if (btn.primary) e.currentTarget.style.opacity = '0.85';
              else if (btn.danger) e.currentTarget.style.backgroundColor = 'var(--m-color-error, #EF4444)', e.currentTarget.style.color = 'var(--shell-topbar-bg, #FFFFFF)';
              else e.currentTarget.style.backgroundColor = 'var(--m-color-surface-2, #F3F4F6)';
            }}
            onMouseLeave={e => {
              if (!habilitado) return;
              if (btn.primary) e.currentTarget.style.opacity = '1';
              else if (btn.danger) e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = 'var(--m-color-error, #EF4444)';
              else e.currentTarget.style.backgroundColor = 'var(--shell-topbar-bg, #FFFFFF)';
            }}
          >
            <Icon size={14} strokeWidth={2} />
            {btn.label}
          </button>
        );
      })}

    </div>
  );
}
