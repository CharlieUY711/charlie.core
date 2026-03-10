/**
 * ActionBarContext.tsx
 * Contexto global para que cada vista registre sus acciones en el TopBarShell.
 * Uso en una vista:
 *   useRegisterActions({ buttons: [...], searchPlaceholder: '...', onSearch: ... }, [deps])
 */
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface ActionButton {
  label:    string;
  onClick:  () => void;
  primary?: boolean;
}

export interface ActionBarState {
  buttons:            ActionButton[];
  searchPlaceholder?: string;
  onSearch?:          (q: string) => void;
}

interface ActionBarContextType {
  state:    ActionBarState;
  register: (s: ActionBarState) => void;
  clear:    () => void;
}

const Ctx = createContext<ActionBarContextType | null>(null);

export function ActionBarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ActionBarState>({ buttons: [] });
  const register = useCallback((s: ActionBarState) => setState(s), []);
  const clear    = useCallback(() => setState({ buttons: [] }), []);
  return <Ctx.Provider value={{ state, register, clear }}>{children}</Ctx.Provider>;
}

export function useActionBar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useActionBar must be inside ActionBarProvider');
  return ctx;
}

/** Hook para que cada vista registre sus acciones al montarse */
export function useRegisterActions(config: ActionBarState, deps: unknown[]) {
  const { register, clear } = useActionBar();
  useEffect(() => {
    register(config);
    return () => clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
