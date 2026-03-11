/**
 * module.config.ts  — C4 ✓
 * Charlie Platform · Configuración del módulo Cargamasiva
 * Generado por ConstructorModulos
 */
export const moduleConfig = {
  id:          'cargamasiva',
  nombre:      'Cargamasiva',
  descripcion: '',
  grupo:       'Sin grupo',
  version:     '1.0.0',
  icono:       'Boxes',
  color:       'var(--m-primary)',
  ruta:        '/cargamasiva',
  permisos:    ['ver', 'crear', 'editar', 'eliminar'],
  creado:      '2026-03-11',
} as const;

export type ModuleConfig = typeof moduleConfig;
