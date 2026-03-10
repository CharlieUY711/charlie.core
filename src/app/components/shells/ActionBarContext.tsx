/**
 * ActionBarContext.tsx
 * Charlie Platform — Contexto de la barra de acciones
 *
 * Cada módulo registra su count y handlers opcionales.
 * ActionBarShell usa count para habilitar/deshabilitar botones automáticamente.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ActionBarState {
  count?:             number;
  onSearch?:          (q: string) => void;
  searchPlaceholder?: string;
  onRefresh?:         () => void;
  onNew?:             () => void;
  onEdit?:            () => void;
  onDelete?:          () => void;
  onExport?:          () => void;
  onImport?:          () => void;
}

interface ActionBarContextValue {
  state:    ActionBarState;
  register: (s: ActionBarState) => void;
  clear:    () => void;
}

const DEFAULT: ActionBarState = {};

const ActionBarContext = createContext<ActionBarContextValue>({
  state:    DEFAULT,
  register: () => {},
  clear:    () => {},
});

export function ActionBarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ActionBarState>(DEFAULT);

  const register = useCallback((s: ActionBarState) => {
    setState(s);
  }, []);

  const clear = useCallback(() => {
    setState(DEFAULT);
  }, []);

  return (
    <ActionBarContext.Provider value={{ state, register, clear }}>
      {children}
    </ActionBarContext.Provider>
  );
}

export function useActionBar() {
  return useContext(ActionBarContext);
}

/**
 * useRegisterActions — hook para que cada módulo registre su estado.
 * Uso mínimo: useRegisterActions({ count: items.length }, [items.length])
 */
export function useRegisterActions(s: ActionBarState, deps: React.DependencyList = []) {
  const { register, clear } = useActionBar();

  React.useEffect(() => {
    register(s);
    return () => clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
