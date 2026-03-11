/**
 * module.config.ts  — C4 ✓
 * Charlie Platform · Configuración del módulo Departamentos
 * Generado por ConstructorModulos
 */
export const moduleConfig = {
  id:          'departamentos',
  nombre:      'Departamentos',
  descripcion: '',
  grupo:       'Sin grupo',
  version:     '1.0.0',
  icono:       'Boxes',
  color:       'var(--m-primary)',
  ruta:        '/departamentos',
  permisos:    ['ver', 'crear', 'editar', 'eliminar'],
  creado:      '2026-03-11',
} as const;

export type ModuleConfig = typeof moduleConfig;
