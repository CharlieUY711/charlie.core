// module.config.ts — Contrato público del módulo Vistas y Shells
// C4: Este archivo es obligatorio y no debe modificarse el id una vez en producción.
export const moduleConfig = {
  id:     'vistas-shells',
  nombre: 'Vistas y Shells',
  familia: 'core',
  version: '1.0.0',
  criterios: [
    { id: 'C1', label: 'Tiene vista (UI)',           estado: 'pending' },
    { id: 'C2', label: 'Tiene backend (DB)',          estado: 'pending' },
    { id: 'C3', label: 'Tiene service layer',         estado: 'pending' },
    { id: 'C4', label: 'Tiene module.config.ts',      estado: 'ok'      },
    { id: 'C5', label: 'Sin colores hardcodeados',    estado: 'pending' },
    { id: 'C6', label: 'Tokens CSS definidos',        estado: 'pending' },
    { id: 'C7', label: 'Party Model',                 estado: 'ok'      },
    { id: 'C8', label: 'Data Zero (Conjuntos)',        estado: 'pending' },
  ],
  dependencias: ['checklist-roadmap'],
} as const;

export type ModuleConfig = typeof moduleConfig;