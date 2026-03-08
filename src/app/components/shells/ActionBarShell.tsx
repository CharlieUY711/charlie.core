/**
 * ActionBarShell.tsx
 * Charlie Platform - Barra de acciones del modulo activo
 *
 * 50px de alto. Aparece solo cuando el modulo registra botones o buscador.
 * Buscador a la izquierda, botones a la derecha.
 * Todos los botones tienen exactamente la misma altura y ancho minimo (34px x 120px).
 */
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useActionBar } from './ActionBarContext';
import { useOrchestrator } from '../../../shells/DashboardShell/app/providers/OrchestratorProvider';

const BTN_HEIGHT = 34;
const BTN_MIN_WIDTH = 120;

export function ActionBarShell() {
  const { state }  = useActionBar();
  const { config } = useOrchestrator();
  const [query, setQuery] = useState('');
  const colorPrimario = config?.theme?.primary ?? '#FF6835';
  const hasContent = state.buttons.length > 0 || !!state.onSearch;

  if (!hasContent) return null;

  return (
    <div style={{
      height:       50,
      minHeight:    50,
      display:      'flex',
      alignItems:   'center',
      padding:      '0 28px',
      gap:          12,
      borderBottom: '1px solid #E9ECEF',
      background:   '#FAFAFA',
      flexShrink:   0,
    }}>
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
          maxWidth:     340,
          flex:         1,
        }}>
          <Search size={14} color="#9CA3AF" strokeWidth={2} />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); state.onSearch!(e.target.value); }}
            placeholder={state.searchPlaceholder ?? 'Buscar...'}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#374151', width: '100%' }}
          />
        </div>
      )}

      <div style={{ flex: 1 }} />

      {state.buttons.map((btn, i) => (
        <button
          key={i}
          onClick={btn.onClick}
          style={{
            height:          BTN_HEIGHT,
            minWidth:        BTN_MIN_WIDTH,
            padding:         '0 18px',
            borderRadius:    8,
            border:          btn.primary ? 'none' : '1.5px solid #DEE2E6',
            backgroundColor: btn.primary ? colorPrimario : '#fff',
            color:           btn.primary ? '#fff' : '#495057',
            fontSize:        13,
            fontWeight:      btn.primary ? 700 : 600,
            cursor:          'pointer',
            whiteSpace:      'nowrap' as const,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            gap:             6,
            flexShrink:      0,
            transition:      'all 0.12s',
            boxSizing:       'border-box' as const,
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = btn.primary ? '#e04e20' : '#F3F4F6'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = btn.primary ? colorPrimario : '#fff'; }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
