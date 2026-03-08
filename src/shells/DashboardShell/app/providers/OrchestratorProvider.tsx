/**
 * OrchestratorProvider.tsx
 * Orquestador Charlie Platform — Capa 2
 *
 * Responsabilidades:
 *   1. Carga la config remota del cliente desde Supabase de Charlie
 *   2. Inyecta los tokens CSS del tema del cliente en :root
 *   3. Expone la config vía contexto (useOrchestrator)
 *   4. Provee el cliente Supabase del cliente (su backend propio)
 *
 * Principio Data Zero:
 *   - Config del shell  → Supabase Charlie (qhnmxvexkizcsmivfuam)
 *   - Datos del cliente → Supabase del cliente (backend.supabaseUrl)
 *   - Nunca se mezclan
 *
 * isReady = true cuando la config terminó de cargar (ready | static | error)
 * El sistema nunca queda bloqueado por falta de config de cliente.
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import type { RemoteConfig } from '../../config/configLoader';

// ── Contexto ──────────────────────────────────────────────────────────────────

interface OrchestratorContextValue {
  config:        RemoteConfig | null;
  isReady:       boolean;
  clienteNombre: string;
}

const OrchestratorContext = createContext<OrchestratorContextValue>({
  config:        null,
  isReady:       false,
  clienteNombre: 'Charlie Platform',
});

export const useOrchestrator = () => useContext(OrchestratorContext);

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyThemeTokens(theme: RemoteConfig['theme']) {
  const root = document.documentElement;
  if (theme.primary)   root.style.setProperty('--shell-primary',      theme.primary);
  if (theme.primary)   root.style.setProperty('--shell-border-focus',  theme.primary);
  if (theme.secondary) root.style.setProperty('--shell-secondary',    theme.secondary);
  console.info('[Orchestrator] Tokens CSS aplicados:', theme);
}

function removeThemeTokens() {
  const root = document.documentElement;
  root.style.removeProperty('--shell-primary');
  root.style.removeProperty('--shell-border-focus');
  root.style.removeProperty('--shell-secondary');
}

// ── Componente ────────────────────────────────────────────────────────────────

interface OrchestratorProviderProps {
  children:        React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?:   React.ReactNode;
}

export function OrchestratorProvider({
  children,
  loadingFallback,
}: OrchestratorProviderProps) {
  const configState = useRemoteConfig();

  // Aplicar tokens CSS cuando la config del cliente está disponible
  useEffect(() => {
    if (configState.status === 'ready') {
      applyThemeTokens(configState.config.theme);
      return () => removeThemeTokens();
    }
  }, [configState.status]);

  // ── Sólo bloqueamos en 'loading' ──────────────────────────────────────────
  // 'static' y 'error' son estados válidos — el sistema funciona sin config de cliente
  if (configState.status === 'loading') {
    return loadingFallback ? (
      <>{loadingFallback}</>
    ) : (
      <div style={{
        height:      '100vh',
        display:     'flex',
        alignItems:  'center',
        justifyContent: 'center',
        background:  '#F4F5F7',
        fontFamily:  'system-ui, sans-serif',
        color:       '#9CA3AF',
        fontSize:    14,
        gap:         10,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--shell-primary, #FF6B35)',
          animation:  'pulse 1.2s ease-in-out infinite',
        }} />
        Iniciando Charlie Platform...
      </div>
    );
  }

  // ── Ready | Static | Error → todos son "listos" ───────────────────────────
  const config = configState.status === 'ready' ? configState.config : null;

  if (configState.status === 'error') {
    console.error('[Orchestrator] Error cargando config:', configState.error);
  }
  if (configState.status === 'static') {
    console.info('[Orchestrator] Sin config de cliente — modo desarrollo');
  }

  return (
    <OrchestratorContext.Provider value={{
      config,
      isReady:       true,   // ← siempre true una vez que terminó de cargar
      clienteNombre: config?.clienteNombre ?? 'Charlie Platform',
    }}>
      {children}
    </OrchestratorContext.Provider>
  );
}
