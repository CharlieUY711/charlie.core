/**
 * MODULE MANIFEST — Charlie Marketplace Builder
 * ═══════════════════════════════════════════════════
 * REGLA: Solo entran módulos 100% OK en Testing.
 *
 * Campos nuevos:
 *   group    — agrupa módulos en el Checklist (árbol colapsable)
 *   serviceFile — nombre del archivo en /services/ para detección C3
 *   viewFile    — nombre del archivo en /views/ para detección C1/C5/C8
 */

import React from 'react';
import type { MainSection } from '../AdminDashboard';

export type ModuleGroup =
  | 'Logística'
  | 'Sistema';

export interface ManifestEntry {
  checklistIds:    string[];
  section:         MainSection;
  group:           ModuleGroup;
  label:           string;
  viewFile:        string;
  serviceFile?:    string;       // para detección C3
  component:       React.ComponentType<{ onNavigate: (s: MainSection) => void }> | React.ComponentType<{}> | null;
  isReal:          boolean;      // C1 — tiene UI
  hasSupabase?:    boolean;      // C2 — tiene backend
  acceptsOnNavigate?: boolean;
  notes?:          string;
}

export const MODULE_MANIFEST: ManifestEntry[] = [

  // ══════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section:      'dashboard',
    group:        'Sistema',
    label:        'Dashboard',
    viewFile:     'DashboardView.tsx',
    component:    React.lazy(() => import('../components/admin/views/DashboardView').then(m => ({ default: m.DashboardView }))),
    isReal:       true,
    notes:        'Dashboard principal',
  },

  // ══════════════════════════════════════════════════════
  // LOGÍSTICA — Hub
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['logistics-hub'],
    section:      'logistica',
    group:        'Logística',
    label:        'Logística Hub',
    viewFile:     'LogisticaView.tsx',
    component:    React.lazy(() => import('../components/admin/views/LogisticaView').then(m => ({ default: m.LogisticaView }))),
    isReal:       false,
    notes:        'Hub de navegación logística',
  },

  // ══════════════════════════════════════════════════════
  // ENVÍOS ✅
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['logistics-shipping'],
    section:      'envios',
    group:        'Logística',
    label:        'Envíos',
    viewFile:     'EnviosView.tsx',
    serviceFile:  'enviosApi.ts',
    component:    React.lazy(() => import('../components/admin/views/EnviosView').then(m => ({ default: m.EnviosView }))),
    isReal:       true,
    hasSupabase:  true,
    notes:        'Vista árbol PedidoMadre→EnvíosHijos · estados · multi-tramo · panel detalle + timeline',
  },

  // ══════════════════════════════════════════════════════
  // TRANSPORTISTAS ✅
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['logistics-carriers'],
    section:      'transportistas',
    group:        'Logística',
    label:        'Transportistas',
    viewFile:     'TransportistasView.tsx',
    serviceFile:  'transportistasApi.ts',
    component:    React.lazy(() => import('../components/admin/views/TransportistasView').then(m => ({ default: m.TransportistasView }))),
    isReal:       true,
    hasSupabase:  true,
    notes:        'Catálogo carriers · tramos y zonas · simulador de tarifas',
  },

  // ══════════════════════════════════════════════════════
  // SISTEMA — Checklist ✅
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['system-checklist'],
    section:      'sistema',
    group:        'Sistema',
    label:        'Sistema',
    viewFile:     'SistemaView.tsx',
    component:    React.lazy(() => import('../components/admin/views/SistemaView').then(m => ({ default: m.SistemaView }))),
    isReal:       true,
    notes:        'Hub de sistema — Checklist & Roadmap',
  },

  {
    checklistIds: ['system-checklist'],
    section:      'checklist',
    group:        'Sistema',
    label:        'Checklist & Roadmap',
    viewFile:     'ChecklistView.tsx',
    component:    React.lazy(() => import('../components/admin/views/ChecklistView').then(m => ({ default: m.ChecklistView }))),
    isReal:       true,
    notes:        'Árbol de módulos con criterios C1-C8 automáticos',
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const REAL_CHECKLIST_IDS = new Set<string>(
  MODULE_MANIFEST.filter(e => e.isReal).flatMap(e => e.checklistIds)
);

export const MANIFEST_BY_SECTION = new Map<MainSection, ManifestEntry>(
  MODULE_MANIFEST.map(e => [e.section, e])
);

/** Módulos agrupados para el árbol del Checklist */
export const MANIFEST_BY_GROUP = MODULE_MANIFEST.reduce<Record<ModuleGroup, ManifestEntry[]>>(
  (acc, e) => {
    if (!acc[e.group]) acc[e.group] = [];
    acc[e.group].push(e);
    return acc;
  },
  {} as Record<ModuleGroup, ManifestEntry[]>
);
