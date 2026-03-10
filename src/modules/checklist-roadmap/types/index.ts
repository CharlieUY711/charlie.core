// types/index.ts — Tipos TypeScript exportables del módulo Checklist & Roadmap

export type CriterioId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8';

export type CriterioEstado = 'ok' | 'warn' | 'error' | 'pending';

export interface Criterio {
  id: CriterioId;
  label: string;
  descripcion: string;
  deteccion: 'automatico' | 'parcial' | 'manual';
  estado: CriterioEstado;
  howToFix?: string;
}

export type ModuleStatus =
  | 'no-registrado'
  | 'registrado'
  | 'bloqueado'
  | 'en-progreso'
  | 'ui-lista'
  | 'cumple-estandar'
  | 'produccion';

export interface RoadmapModule {
  id: string;
  section: string;
  nombre: string;
  familia: string;
  viewFile: string;
  isReal: boolean;
  hasSupabase: boolean;
  status: ModuleStatus;
  prioridad: number;
  notas?: string;
  criterios: Record<CriterioId, CriterioEstado>;
  createdAt?: string;
  updatedAt?: string;
  auditedAt?: string;
}

export interface RoadmapHistorial {
  id: string;
  moduleId: string;
  criterio?: CriterioId;
  estadoAntes: ModuleStatus;
  estadoDespues: ModuleStatus;
  origen: 'automatico' | 'manual' | 'auditoria';
  resueltoPor?: string;
  timestamp: string;
}

export interface FamiliaGroup {
  nombre: string;
  modulos: RoadmapModule[];
  porcentajeCumplimiento: number;
}

export interface AuditResult {
  moduleId: string;
  criterios: Record<CriterioId, { estado: CriterioEstado; detalle?: string }>;
  timestamp: string;
}
