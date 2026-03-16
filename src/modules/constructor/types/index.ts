// types/index.ts — Tipos del módulo Constructor

// ── Wizard A→G ────────────────────────────────────────────────────────────────

export type FaseId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type FaseEstado = 'pendiente' | 'en-progreso' | 'completa' | 'error';

export interface FaseDef {
  id:          FaseId;
  nombre:      string;
  descripcion: string;
  tareas:      TareaDef[];
}

export interface TareaDef {
  id:        string;   // ej: 'A-carpetas'
  label:     string;
  descripcion: string;
  quien:     'Constructor' | 'Dev' | 'Checklist';
  criterios: string[]; // ej: ['C4', 'C6']
}

// ── Config del módulo a generar ───────────────────────────────────────────────

export interface ModuloConfig {
  id:           string;   // slug: ej 'clientes'
  nombre:       string;   // ej 'Clientes'
  familia:      string;   // ej 'negocio'
  descripcion:  string;
  props:        PropConfig[];
  dependencias: string[];
}

export interface PropConfig {
  id:        string;
  label:     string;
  tipo:      'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'text' | 'jsonb';
  requerido: boolean;
  default?:  string;
}

// ── Draft guardado en Supabase ────────────────────────────────────────────────

export type DraftEstado = 'borrador' | 'generando' | 'completo' | 'error';

export interface ConstructorDraft {
  id:           string;
  tenantId:     string;
  moduloId:     string;
  moduloNombre: string;
  config:       ModuloConfig;
  faseActual:   FaseId;
  fases:        Record<FaseId, FaseEstado>;
  archivos:     ArchivoGenerado[];
  estado:       DraftEstado;
  createdAt:    string;
  updatedAt:    string;
}

export interface ArchivoGenerado {
  path:      string;   // ej 'src/modules/clientes/module.config.ts'
  contenido: string;
  fase:      FaseId;
}

// ── Proyecto de negocio (Constructor existente migrado) ───────────────────────

export interface ProyectoConfig {
  id:          string;
  nombre:      string;
  tenantSlug:  string;
  modulosIds:  string[];
  proveedores: Record<string, string[]>;
  frontstore:  FrontstoreConfig;
  envVars:     string[];
  estado:      'borrador' | 'aplicado';
  createdAt:   string;
  updatedAt:   string;
}

export interface FrontstoreConfig {
  storeName:      string;
  storeTagline:   string;
  currency:       string;
  primaryColor:   string;
  secondaryColor: string;
  bgColor:        string;
  homeSections:   { id: string; enabled: boolean }[];
  pages:          { id: string; path: string; enabled: boolean }[];
}

// ── Historial ─────────────────────────────────────────────────────────────────

export interface ConstructorHistorial {
  id:          string;
  tenantId:    string;
  moduloId:    string;
  operacion:   'crear-modulo' | 'crear-componente' | 'reparar-criterio' | 'tenant-setup';
  outputFiles: string[];
  criteriosOk: string[];
  timestamp:   string;
}
