/**
 * ActionBarContext.tsx
 * Charlie Platform — Contrato estándar de la barra de acciones.
 *
 * Botonera estándar: Nuevo · Editar · Guardar · Exportar · Importar · Eliminar · Tools
 * Cada módulo declara qué acciones necesita. Las no declaradas no se renderizan.
 *
 * Uso en una vista:
 *   useRegisterActions({
 *     searchPlaceholder: 'Buscar módulos...',
 *     onNuevo:    () => setDrawerOpen(true),
 *     onExportar: () => exportCSV(),
 *   }, []);
 */
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface ToolDef {
  id:      string;
  label:   string;
  icon?:   React.ComponentType<{ size?: number }>;
  onClick: () => void;
}

export interface ActionBarConfig {
  searchPlaceholder?: string;
  onSearch?:          (query: string) => void;
  onNuevo?:           () => void;
  onEditar?:          () => void;
  onGuardar?:         () => void;
  onExportar?:        () => void;
  onImportar?:        () => void;
  onEliminar?:        () => void;
  tools?:             ToolDef[];
  // Estado de habilitación
  puedeEditar?:       boolean;
  puedeGuardar?:      boolean;
  puedeEliminar?:     boolean;
}

interface ActionBarContextType {
  config:   ActionBarConfig;
  query:    string;
  setQuery: (q: string) => void;
  register: (c: ActionBarConfig) => void;
  clear:    () => void;
}

// ── Contexto ──────────────────────────────────────────────────────────────────

const Ctx = createContext<ActionBarContextType | null>(null);

export function ActionBarProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ActionBarConfig>({});
  const [query,  setQueryState] = useState('');

  const register = useCallback((c: ActionBarConfig) => {
    setConfig(c);
    setQueryState('');
  }, []);

  const clear = useCallback(() => {
    setConfig({});
    setQueryState('');
  }, []);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    config.onSearch?.(q);
  }, [config]);

  return (
    <Ctx.Provider value={{ config, query, setQuery, register, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useActionBar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useActionBar debe estar dentro de ActionBarProvider');
  return ctx;
}

/**
 * Hook para que cada vista registre sus acciones al montarse.
 * Se limpia automáticamente al desmontar.
 */
export function useRegisterActions(config: ActionBarConfig, deps: unknown[]) {
  const { register, clear } = useActionBar();
  useEffect(() => {
    register(config);
    return () => clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
