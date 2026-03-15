/**
 * ModuleDetail.tsx
 * Módulo: checklist-roadmap
 * Drawer de detalle y edición de un módulo del Checklist.
 *
 * C1: Componente React exportado, registrado en ChecklistRoadmapView
 * C5: Zero colores hardcodeados — solo var(--m-*)
 * C8: Sin supabase.from() directo — usa updateCriterio() de checklistRoadmapApi
 */

import React from 'react';
import { DrawerShell } from '@/app/components/shells/DrawerShell';
import type { SheetDef } from '@/app/components/shells/DrawerShell.types';
import { updateCriterio, updateModuleStatus } from '../service/checklistRoadmapApi';
import type { RoadmapModule, CriterioId, CriterioEstado, ModuleStatus } from '../types';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  modulo:   RoadmapModule;
  onClose:  () => void;
  onUpdate: (modulo: RoadmapModule) => void;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const CRITERIOS: { id: CriterioId; label: string; descripcion: string }[] = [
  { id: 'C1', label: 'Vista (UI)',            descripcion: 'isReal: true + componente React exportado' },
  { id: 'C2', label: 'Backend (DB)',           descripcion: 'hasSupabase: true + tabla en Supabase del tenant' },
  { id: 'C3', label: 'Service layer',          descripcion: 'Existe {id}Api.ts con getAll/getById/create/update/delete' },
  { id: 'C4', label: 'module.config.ts',       descripcion: 'Existe src/modules/{id}/module.config.ts' },
  { id: 'C5', label: 'Sin hardcode',           descripcion: 'grep #HEX y rgb() en view file = 0 ocurrencias' },
  { id: 'C6', label: 'Tokens CSS',             descripcion: 'Existe ui/tokens.css con fallbacks --m-*' },
  { id: 'C7', label: 'Party Model',            descripcion: 'Usa organizaciones + roles_contextuales, no tablas directas' },
  { id: 'C8', label: 'Data Zero (Conjuntos)',  descripcion: 'useTable(nombre-semantico), nunca supabase.from() en view' },
];

const ESTADO_OPTS: { value: CriterioEstado; label: string }[] = [
  { value: 'ok',      label: '✅ OK' },
  { value: 'warn',    label: '⚠️ Parcial' },
  { value: 'error',   label: '❌ Error' },
  { value: 'pending', label: '○ Pendiente' },
];

const STATUS_OPTS: { value: ModuleStatus; label: string }[] = [
  { value: 'no-registrado',   label: 'No registrado' },
  { value: 'registrado',      label: 'Registrado' },
  { value: 'bloqueado',       label: 'Bloqueado' },
  { value: 'en-progreso',     label: 'En progreso' },
  { value: 'ui-lista',        label: 'UI lista' },
  { value: 'cumple-estandar', label: 'Cumple estándar' },
  { value: 'produccion',      label: 'Producción' },
];

// ── Componente ────────────────────────────────────────────────────────────────

export function ModuleDetail({ modulo, onClose, onUpdate }: Props) {

  // ── SheetDef — hoja de criterios ──────────────────────────────────────────
  const sheetCriterios: SheetDef = {
    id:       'criterios',
    title:    'Criterios C1–C8',
    subtitle: 'Estado de cumplimiento del estándar Charlie',
    fields:   CRITERIOS.map(c => ({
      id:    c.id,
      label: `${c.id} — ${c.label}`,
      type:  'select' as const,
      hint:  c.descripcion,
      options: ESTADO_OPTS,
    })),
  };

  // ── SheetDef — hoja de información general ────────────────────────────────
  const sheetInfo: SheetDef = {
    id:       'info',
    title:    'Información general',
    subtitle: 'Datos del módulo y estado en el roadmap',
    fields: [
      {
        id:      'nombre',
        label:   'Nombre',
        type:    'text',
        hint:    'Nombre visible del módulo en el Checklist',
      },
      {
        id:      'familia',
        label:   'Familia',
        type:    'text',
        hint:    'Grupo funcional: core, logistica, transaccional, etc.',
      },
      {
        id:      'status',
        label:   'Estado en Roadmap',
        type:    'select',
        options: STATUS_OPTS,
      },
      {
        id:      'notas',
        label:   'Notas',
        type:    'textarea',
        hint:    'Observaciones, contexto o próximos pasos',
      },
    ],
  };

  // ── Valores iniciales ─────────────────────────────────────────────────────
  const initialData: Record<string, unknown> = {
    // Criterios
    C1: modulo.criterios?.C1 ?? 'pending',
    C2: modulo.criterios?.C2 ?? 'pending',
    C3: modulo.criterios?.C3 ?? 'pending',
    C4: modulo.criterios?.C4 ?? 'pending',
    C5: modulo.criterios?.C5 ?? 'pending',
    C6: modulo.criterios?.C6 ?? 'pending',
    C7: modulo.criterios?.C7 ?? 'pending',
    C8: modulo.criterios?.C8 ?? 'pending',
    // Info
    nombre:   modulo.nombre,
    familia:  modulo.familia,
    status:   modulo.status,
    notas:    modulo.notas ?? '',
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(data: Record<string, unknown>) {
    // Actualizar cada criterio que cambió
    const criterioIds: CriterioId[] = ['C1','C2','C3','C4','C5','C6','C7','C8'];
    for (const cid of criterioIds) {
      const nuevo = data[cid] as CriterioEstado;
      if (nuevo && nuevo !== modulo.criterios?.[cid]) {
        await updateCriterio(modulo.id, cid, nuevo);
      }
    }

    // Actualizar status si cambió
    const nuevoStatus = data['status'] as ModuleStatus;
    if (nuevoStatus && nuevoStatus !== modulo.status) {
      await updateModuleStatus(modulo.id, nuevoStatus);
    }

    // Notificar al padre con el módulo actualizado
    onUpdate({
      ...modulo,
      criterios: {
        C1: data['C1'] as CriterioEstado,
        C2: data['C2'] as CriterioEstado,
        C3: data['C3'] as CriterioEstado,
        C4: data['C4'] as CriterioEstado,
        C5: data['C5'] as CriterioEstado,
        C6: data['C6'] as CriterioEstado,
        C7: data['C7'] as CriterioEstado,
        C8: data['C8'] as CriterioEstado,
      },
      status:  nuevoStatus ?? modulo.status,
      notas:   data['notas'] as string,
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DrawerShell
      isOpen={true}
      onClose={onClose}
      title={modulo.nombre}
      subtitle={`${modulo.familia} · ${modulo.id}`}
      mode="edit"
      sheets={[sheetInfo, sheetCriterios]}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitLabel="Guardar cambios"
    />
  );
}
