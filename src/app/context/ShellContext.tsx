/**
 * ShellContext.tsx
 * Charlie Platform — Contexto propio de los shells
 *
 * PROPÓSITO:
 *   Proveer a todos los shells (TopBar, Sidebar, Orchestrator, ActionBar)
 *   los datos que necesitan sin depender directamente de DashboardShell.
 *
 * FLUJO:
 *   OrchestratorProvider + useModules() + useAuth()
 *       ↓ (solo en AdminDashboard)
 *   ShellContext.Provider
 *       ↓ (en cualquier shell)
 *   useShell()
 *
 * REGLA:
 *   Solo AdminDashboard instancia este Provider.
 *   Los shells solo consumen useShell() — sin imports de DashboardShell.
 */
import React, { createContext, useContext, useState } from 'react';
import type { ModuloActivo, SeccionActiva } from '../../shells/DashboardShell/app/hooks/useModules';

export interface ShellUser {
  email:     string | null;
  nombre:    string | null;
  avatarUrl: string | null;
}

export interface ShellContextValue {
  colorPrimario:  string;
  user:           ShellUser | null;
  signOut:        () => Promise<void>;
  secciones:      SeccionActiva[];
  modulos:        ModuloActivo[];
  loadingModulos: boolean;
  subtitulo:      string | null;
  setSubtitulo:   (s: string | null) => void;
}

const defaultValue: ShellContextValue = {
  colorPrimario:  '#FF6835',
  user:           null,
  signOut:        async () => {},
  secciones:      [],
  modulos:        [],
  loadingModulos: true,
  subtitulo:      null,
  setSubtitulo:   () => {},
};

const ShellContext = createContext<ShellContextValue>(defaultValue);

interface ShellProviderProps {
  children: React.ReactNode;
  value:    Omit<ShellContextValue, 'subtitulo' | 'setSubtitulo'>;
}

export function ShellProvider({ children, value }: ShellProviderProps) {
  const [subtitulo, setSubtitulo] = useState<string | null>(null);
  return (
    <ShellContext.Provider value={{ ...value, subtitulo, setSubtitulo }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell(): ShellContextValue {
  return useContext(ShellContext);
}
