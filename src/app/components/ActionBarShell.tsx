import { useState } from 'react';
import { Search } from 'lucide-react';
import { useActionBar } from './ActionBarContext';

export function ActionBarShell() {
  const { state } = useActionBar();
  const [query, setQuery] = useState('');

  const hasContent = state.buttons.length > 0 || !!state.onSearch;
  if (!hasContent) return null;

  return (
    <div style={{
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '10px',
      borderBottom: '1px solid #e5e7eb',
      background: '#fff',
    }}>
      {/* Buscador izquierda */}
      {state.onSearch && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 320,
          background: '#f3f4f6', borderRadius: 8, padding: '0 12px', height: 34 }}>
          <Search size={15} color="#9ca3af" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); state.onSearch!(e.target.value); }}
            placeholder={state.searchPlaceholder || 'Buscar...'}
            style={{ border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: '#374151', width: '100%' }}
          />
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Botones derecha */}
      {state.buttons.map((btn, i) => (
        <button
          key={i}
          onClick={btn.onClick}
          style={{
            height: 34, padding: '0 16px', borderRadius: 8, fontSize: 13,
            fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            border: btn.primary ? 'none' : '1px solid #d1d5db',
            background: btn.primary ? 'var(--color-primary, #FF6B35)' : '#fff',
            color: btn.primary ? '#fff' : '#374151',
          }}
        >
          {btn.icon && btn.icon}
          {btn.label}
        </button>
      ))}
    </div>
  );
}
