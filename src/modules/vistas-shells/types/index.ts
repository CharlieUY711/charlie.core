// types/index.ts — Tipos del módulo Vistas y Shells

import type { CriterioId, CriterioEstado } from '../../checklist-roadmap/types';

// Re-exportar para uso interno
export type { CriterioId, CriterioEstado };

// ── Catálogo de shells ────────────────────────────────────────────────────────

export type ShellTipo =
  | 'shell'       // SidebarShell, TopBarShell, ActionBarShell, DrawerShell
  | 'vista'       // HubView, ModuleView
  | 'componente'; // ChecklistShell y otros reutilizables

export interface PropDef {
  id:           string;
  label:        string;
  tipo:         'color' | 'spacing' | 'radius' | 'font' | 'boolean' | 'text';
  token:        string;       // var(--m-color-primary) etc.
  valorDefault: string;
  descripcion?: string;
}

export interface VarianteDef {
  id:     string;
  label:  string;
  props:  Record<string, string>; // prop id → valor
}

export interface ShellEntry {
  id:          string;
  nombre:      string;
  tipo:        ShellTipo;
  descripcion: string;
  archivo:     string;           // path relativo al src/
  props:       PropDef[];
  variantes:   VarianteDef[];
  shellId?:    string;
  shellId?:     string;
  isReal:      boolean;
  createdAt?:  string;
  updatedAt?:  string;
}

// ── Editor ────────────────────────────────────────────────────────────────────

export interface ShellEdit {
  id:        string;
  shellId:   string;
  tenantId:  string;
  propId:    string;
  valor:     string;
  createdAt: string;
}

export interface EditorConfig {
  shellId:  string;
  edits:    Record<string, string>; // propId → valor editado
}

// ── Generador ─────────────────────────────────────────────────────────────────

export interface GeneradorOutput {
  shellId:   string;
  codigo:    string;
  hexCount:  number;   // C5 — debe ser 0
  warnings:  string[];
}
