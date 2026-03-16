// =============================================================================
// constructorApi.ts
// Módulo: constructor · Fase F2-B
// C3: toda la lógica Supabase centralizada aquí
// C8: ningún supabase.from() fuera de este archivo
// =============================================================================

import { supabase } from '@/utils/supabase/client';
import type {
  ConstructorDraft,
  ArchivoGenerado,
  ConstructorHistorial,
  ProyectoConfig,
  FaseId,
  FaseEstado,
} from '../types';

const TENANT_ID = 'charlie';

// ─── Mappers ──────────────────────────────────────────────────────────────────

function rowToDraft(row: Record<string, unknown>): ConstructorDraft {
  return {
    id:           row.id as string,
    tenantId:     row.tenant_id as string,
    moduloId:     row.modulo_id as string,
    moduloNombre: row.modulo_nombre as string,
    config:       (row.config ?? {}) as ConstructorDraft['config'],
    faseActual:   row.fase_actual as FaseId,
    fases:        (row.fases ?? {}) as Record<FaseId, FaseEstado>,
    archivos:     [],
    estado:       row.estado as ConstructorDraft['estado'],
    createdAt:    row.created_at as string,
    updatedAt:    row.updated_at as string,
  };
}

function rowToArchivo(row: Record<string, unknown>): ArchivoGenerado {
  return {
    path:      row.path as string,
    contenido: row.contenido as string,
    fase:      row.fase as FaseId,
  };
}

function rowToHistorial(row: Record<string, unknown>): ConstructorHistorial {
  return {
    id:          row.id as string,
    tenantId:    row.tenant_id as string,
    moduloId:    row.modulo_id as string,
    operacion:   row.operacion as ConstructorHistorial['operacion'],
    outputFiles: (row.output_files ?? []) as string[],
    criteriosOk: (row.criterios_ok ?? []) as string[],
    timestamp:   row.timestamp as string,
  };
}

function rowToProyecto(row: Record<string, unknown>): ProyectoConfig {
  return {
    id:          row.id as string,
    nombre:      row.nombre as string,
    tenantSlug:  row.tenant_slug as string,
    modulosIds:  (row.modulos_ids ?? []) as string[],
    proveedores: (row.proveedores ?? {}) as Record<string, string[]>,
    frontstore:  (row.frontstore ?? {}) as ProyectoConfig['frontstore'],
    envVars:     (row.env_vars ?? []) as string[],
    estado:      row.estado as ProyectoConfig['estado'],
    createdAt:   row.created_at as string,
    updatedAt:   row.updated_at as string,
  };
}

// ─── constructor_drafts ───────────────────────────────────────────────────────

export async function getDrafts(tenantId = TENANT_ID): Promise<ConstructorDraft[]> {
  const { data, error } = await supabase
    .from('constructor_drafts')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`getDrafts: ${error.message}`);
  return (data ?? []).map(rowToDraft);
}

export async function getDraftById(
  id: string,
  tenantId = TENANT_ID
): Promise<ConstructorDraft | null> {
  const { data: draft, error: draftError } = await supabase
    .from('constructor_drafts')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();

  if (draftError && draftError.code !== 'PGRST116')
    throw new Error(`getDraftById: ${draftError.message}`);
  if (!draft) return null;

  const { data: archivos } = await supabase
    .from('constructor_archivos')
    .select('*')
    .eq('draft_id', id)
    .order('created_at', { ascending: true });

  const result = rowToDraft(draft);
  result.archivos = (archivos ?? []).map(rowToArchivo);
  return result;
}

export async function createDraft(
  draft: Pick<ConstructorDraft, 'moduloId' | 'moduloNombre' | 'config'>,
  tenantId = TENANT_ID
): Promise<ConstructorDraft> {
  const fasesInit: Record<FaseId, FaseEstado> = {
    A: 'pendiente', B: 'pendiente', C: 'pendiente', D: 'pendiente',
    E: 'pendiente', F: 'pendiente', G: 'pendiente',
  };

  const { data, error } = await supabase
    .from('constructor_drafts')
    .insert({
      tenant_id:     tenantId,
      modulo_id:     draft.moduloId,
      modulo_nombre: draft.moduloNombre,
      config:        draft.config,
      fase_actual:   'A',
      fases:         fasesInit,
      estado:        'borrador',
    })
    .select()
    .single();

  if (error) throw new Error(`createDraft: ${error.message}`);
  return rowToDraft(data);
}

export async function updateDraft(
  id: string,
  updates: Partial<Pick<ConstructorDraft, 'config' | 'faseActual' | 'fases' | 'estado'>>,
  tenantId = TENANT_ID
): Promise<ConstructorDraft> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.config)     payload.config      = updates.config;
  if (updates.faseActual) payload.fase_actual  = updates.faseActual;
  if (updates.fases)      payload.fases        = updates.fases;
  if (updates.estado)     payload.estado       = updates.estado;

  const { data, error } = await supabase
    .from('constructor_drafts')
    .update(payload)
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) throw new Error(`updateDraft: ${error.message}`);
  return rowToDraft(data);
}

export async function deleteDraft(id: string, tenantId = TENANT_ID): Promise<void> {
  const { error } = await supabase
    .from('constructor_drafts')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) throw new Error(`deleteDraft: ${error.message}`);
}

// ─── constructor_archivos ─────────────────────────────────────────────────────

export async function saveArchivos(
  draftId: string,
  archivos: ArchivoGenerado[],
  tenantId = TENANT_ID
): Promise<void> {
  if (archivos.length === 0) return;

  const rows = archivos.map(a => ({
    draft_id:  draftId,
    tenant_id: tenantId,
    path:      a.path,
    contenido: a.contenido,
    fase:      a.fase,
  }));

  const { error } = await supabase
    .from('constructor_archivos')
    .upsert(rows, { onConflict: 'draft_id,path' });

  if (error) throw new Error(`saveArchivos: ${error.message}`);
}

export async function getArchivos(draftId: string): Promise<ArchivoGenerado[]> {
  const { data, error } = await supabase
    .from('constructor_archivos')
    .select('*')
    .eq('draft_id', draftId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`getArchivos: ${error.message}`);
  return (data ?? []).map(rowToArchivo);
}

// ─── constructor_history ──────────────────────────────────────────────────────

export async function getHistorial(tenantId = TENANT_ID): Promise<ConstructorHistorial[]> {
  const { data, error } = await supabase
    .from('constructor_history')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) throw new Error(`getHistorial: ${error.message}`);
  return (data ?? []).map(rowToHistorial);
}

export async function addHistorial(
  entry: Pick<ConstructorHistorial, 'moduloId' | 'operacion' | 'outputFiles' | 'criteriosOk'>,
  tenantId = TENANT_ID
): Promise<ConstructorHistorial> {
  const { data, error } = await supabase
    .from('constructor_history')
    .insert({
      tenant_id:    tenantId,
      modulo_id:    entry.moduloId,
      operacion:    entry.operacion,
      output_files: entry.outputFiles,
      criterios_ok: entry.criteriosOk,
    })
    .select()
    .single();

  if (error) throw new Error(`addHistorial: ${error.message}`);
  return rowToHistorial(data);
}

// ─── constructor_proyectos ────────────────────────────────────────────────────

export async function getProyectos(tenantId = TENANT_ID): Promise<ProyectoConfig[]> {
  const { data, error } = await supabase
    .from('constructor_proyectos')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`getProyectos: ${error.message}`);
  return (data ?? []).map(rowToProyecto);
}

export async function upsertProyecto(
  proyecto: Omit<ProyectoConfig, 'createdAt' | 'updatedAt'>,
  tenantId = TENANT_ID
): Promise<ProyectoConfig> {
  const payload = {
    id:           proyecto.id || undefined,
    tenant_id:    tenantId,
    nombre:       proyecto.nombre,
    tenant_slug:  proyecto.tenantSlug,
    modulos_ids:  proyecto.modulosIds,
    proveedores:  proyecto.proveedores,
    frontstore:   proyecto.frontstore,
    env_vars:     proyecto.envVars,
    estado:       proyecto.estado,
    updated_at:   new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('constructor_proyectos')
    .upsert(payload)
    .select()
    .single();

  if (error) throw new Error(`upsertProyecto: ${error.message}`);
  return rowToProyecto(data);
}

export async function deleteProyecto(id: string, tenantId = TENANT_ID): Promise<void> {
  const { error } = await supabase
    .from('constructor_proyectos')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) throw new Error(`deleteProyecto: ${error.message}`);
}
