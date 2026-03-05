/**
 * MODULE MANIFEST — Charlie Platform
 * ═══════════════════════════════════════════════════════════════
 * Fuente única de verdad de módulos activos.
 */

import React from 'react';
import type { MainSection } from '../AdminDashboard';

export interface ManifestEntry {
  checklistIds: string[];
  section: MainSection;
  viewFile: string;
  component: React.ComponentType<{ onNavigate: (s: MainSection) => void }> | React.ComponentType<{}> | null;
  isReal: boolean;
  hasSupabase?: boolean;
  acceptsOnNavigate?: boolean;
  notes?: string;
}

export const MODULE_MANIFEST: ManifestEntry[] = [

  // ══════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════
  {
    checklistIds: [],
    section: 'dashboard',
    viewFile: 'DashboardView.tsx',
    component: React.lazy(() => import('../components/admin/views/DashboardView').then(m => ({ default: m.DashboardView }))),
    isReal: true,
    acceptsOnNavigate: true,
    notes: 'Dashboard principal — acceso a Logística y Sistema',
  },

  // ══════════════════════════════════════════════════════
  // LOGÍSTICA — Hub
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['logistics-hub'],
    section: 'logistica',
    viewFile: 'LogisticaView.tsx',
    component: React.lazy(() => import('../components/admin/views/LogisticaView').then(m => ({ default: m.LogisticaView }))),
    isReal: true,
    acceptsOnNavigate: true,
    notes: 'Hub de navegación logística — Envíos y Transportistas',
  },

  // ══════════════════════════════════════════════════════
  // ENVÍOS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['logistics-shipping'],
    section: 'envios',
    viewFile: 'EnviosView.tsx',
    component: React.lazy(() => import('../components/admin/views/EnviosView').then(m => ({ default: m.EnviosView }))),
    isReal: true,
    hasSupabase: true,
    acceptsOnNavigate: true,
    notes: 'Vista árbol PedidoMadre→EnvíosHijos · estados · multi-tramo · panel detalle + timeline',
  },

  // ══════════════════════════════════════════════════════
  // TRANSPORTISTAS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['logistics-carriers'],
    section: 'transportistas',
    viewFile: 'TransportistasView.tsx',
    component: React.lazy(() => import('../components/admin/views/TransportistasView').then(m => ({ default: m.TransportistasView }))),
    isReal: true,
    hasSupabase: true,
    acceptsOnNavigate: true,
    notes: 'Catálogo transportistas · tramos y zonas · simulador de tarifas',
  },

  // ══════════════════════════════════════════════════════
  // ORGANIZACIONES
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['logistics-carriers'],
    section: 'organizaciones',
    viewFile: 'OrganizacionesView.tsx',
    component: React.lazy(() => import('../components/admin/views/OrganizacionesView').then(m => ({ default: m.OrganizacionesView }))),
    isReal: true,
    hasSupabase: true,
    acceptsOnNavigate: true,
    notes: 'CRUD completo de organizaciones — vinculadas a transportistas',
  },

  // ══════════════════════════════════════════════════════
  // SISTEMA — Hub
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['sistema'],
    section: 'sistema',
    viewFile: 'SistemaView.tsx',
    component: React.lazy(() => import('../components/admin/views/SistemaView').then(m => ({ default: m.SistemaView }))),
    isReal: true,
    hasSupabase: false,
    acceptsOnNavigate: true,
    notes: 'Hub de sistema — Checklist & Roadmap, Ideas',
  },

  // ══════════════════════════════════════════════════════
  // CHECKLIST & ROADMAP
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['checklist'],
    section: 'checklist',
    viewFile: 'ChecklistView.tsx',
    component: React.lazy(() => import('../components/admin/views/ChecklistView').then(m => ({ default: m.ChecklistView }))),
    isReal: true,
    hasSupabase: false,
    acceptsOnNavigate: false,
    notes: 'Checklist C1–C8 por módulo · Roadmap de pendientes',
  },

  // ══════════════════════════════════════════════════════
  // IDEAS
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['ideas'],
    section: 'ideas',
    viewFile: 'IdeasView.tsx',
    component: React.lazy(() => import('../components/admin/views/IdeasView').then(m => ({ default: m.IdeasView }))),
    isReal: true,
    hasSupabase: false,
    acceptsOnNavigate: false,
    notes: 'Captura y evaluación de ideas con score de viabilidad',
  },

  // ══════════════════════════════════════════════════════
  // CONSTRUCCIÓN — Hub
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['construccion'],
    section: 'construccion',
    viewFile: 'ConstruccionView.tsx',
    component: React.lazy(() => import('../components/admin/views/ConstruccionView').then(m => ({ default: m.ConstruccionView }))),
    isReal: true,
    hasSupabase: false,
    acceptsOnNavigate: true,
    notes: 'Hub de construcción — Constructor de proyectos y Constructor de Módulos',
  },

  // ══════════════════════════════════════════════════════
  // CONSTRUCTOR — Proyectos / tenants
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['constructor'],
    section: 'constructor',
    viewFile: 'ConstructorView.tsx',
    component: React.lazy(() => import('../components/admin/views/ConstructorView').then(m => ({ default: m.ConstructorView }))),
    isReal: true,
    hasSupabase: false,
    acceptsOnNavigate: true,
    notes: 'Generador de proyectos Charlie — módulos, configuración, frontstore y output',
  },

  // ══════════════════════════════════════════════════════
  // CONSTRUCTOR MÓDULOS — Crear / editar / reparar módulos
  // ══════════════════════════════════════════════════════
  {
    checklistIds: ['constructor-modulos'],
    section: 'constructor-modulos',
    viewFile: 'ConstructorModulos.tsx',
    component: React.lazy(() => import('../components/admin/views/ConstructorModulos').then(m => ({ default: m.ConstructorModulos }))),
    isReal: true,
    hasSupabase: false,
    acceptsOnNavigate: true,
    notes: 'Constructor de módulos Charlie — crear, actualizar, reparar criterios C1–C8',
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Set de todos los checklistIds cubiertos por vistas reales */
export const REAL_CHECKLIST_IDS = new Set<string>(
  MODULE_MANIFEST.filter(e => e.isReal).flatMap(e => e.checklistIds)
);

/** Map sección → entry del manifest */
export const MANIFEST_BY_SECTION = new Map<MainSection, ManifestEntry>(
  MODULE_MANIFEST.map(e => [e.section, e])
);
