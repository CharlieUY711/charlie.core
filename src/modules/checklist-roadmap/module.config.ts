// module.config.ts — Contrato público del módulo Checklist & Roadmap
// C4: Este archivo es obligatorio y no debe modificarse el id una vez en producción.

export const moduleConfig = {
  id: 'checklist-roadmap',
  nombre: 'Checklist & Roadmap',
  familia: 'core', // Grupo funcional: Core & Infraestructura
  version: '1.0.0', // Cumple C1–C8
  criterios: [
    { id: 'C1', label: 'Tiene vista (UI)',           estado: 'ok' },
    { id: 'C2', label: 'Tiene backend (DB)',          estado: 'ok' },
    { id: 'C3', label: 'Tiene service layer',         estado: 'ok' },
    { id: 'C4', label: 'Tiene module.config.ts',      estado: 'ok' },
    { id: 'C5', label: 'Sin colores hardcodeados',    estado: 'ok' },
    { id: 'C6', label: 'Tokens CSS definidos',        estado: 'ok' },
    { id: 'C7', label: 'Party Model',                 estado: 'ok' },
    { id: 'C8', label: 'Data Zero (Conjuntos)',        estado: 'ok' },
  ],
  dependencias: [], // Módulo autónomo
} as const;

export type ModuleConfig = typeof moduleConfig;
