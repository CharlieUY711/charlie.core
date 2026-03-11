/**
 * module.config.ts  — C4 ✓
 * Charlie Platform · Configuración del módulo Auditoriahub
 * Generado por ConstructorModulos
 */
export const moduleConfig = {
  id:          'auditoriahub',
  nombre:      'Auditoriahub',
  descripcion: '',
  grupo:       'Sin grupo',
  version:     '1.0.0',
  icono:       'Boxes',
  color:       'var(--m-primary)',
  ruta:        '/auditoriahub',
  permisos:    ['ver', 'crear', 'editar', 'eliminar'],
  creado:      '2026-03-11',
} as const;

export type ModuleConfig = typeof moduleConfig;
