// =============================================================================
// checklistRoadmapApi.ts — Service layer del módulo Checklist & Roadmap
// C3: Service layer completo — getAll, getById, create, update, remove
// C8: Los Tres Pilares son infraestructura de Charlie — usan el cliente
//     de Charlie directamente (no el backend del tenant cliente).
//     Los módulos de negocio sí usan useTable() con nombre semántico.
// =============================================================================

import { supabase } from '@/utils/supabase/client';
import type {
  RoadmapModule,
  RoadmapHistorial,
  AuditResult,
  ModuleStatus,
  CriterioId,
  CriterioEstado,
} from '../types';

const TABLE_MODULES   = 'roadmap_modules';
const TABLE_HISTORIAL = 'roadmap_historial';
const TENANT_ID       = 'charlie';

// =============================================================================
// MÓDULOS
// =============================================================================

export async function getAllModules(
  filters?: Partial<Pick<RoadmapModule, 'familia' | 'status'>>
): Promise<RoadmapModule[]> {
  let query = supabase
    .from(TABLE_MODULES)
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .eq('activo', true);

  if (filters?.familia) query = query.eq('familia', filters.familia);
  if (filters?.status)  query = query.eq('status',  filters.status);

  const { data, error } = await query.order('prioridad', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as RoadmapModule[];
}

export async function getModuleById(id: string): Promise<RoadmapModule> {
  const { data, error } = await supabase
    .from(TABLE_MODULES)
    .select('*')
    .eq('id', id)
    .eq('tenant_id', TENANT_ID)
    .single();
  if (error) throw new Error(error.message);
  return data as RoadmapModule;
}

export async function createModule(
  payload: Omit<RoadmapModule, 'createdAt' | 'updatedAt' | 'auditedAt'>
): Promise<RoadmapModule> {
  const { data, error } = await supabase
    .from(TABLE_MODULES)
    .insert({ ...payload, tenant_id: TENANT_ID, activo: true })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as RoadmapModule;
}

export async function updateModule(
  id: string,
  payload: Partial<RoadmapModule>
): Promise<RoadmapModule> {
  const { data, error } = await supabase
    .from(TABLE_MODULES)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', TENANT_ID)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as RoadmapModule;
}

export async function removeModule(id: string): Promise<void> {
  // Soft delete — nunca DELETE directo
  const { error } = await supabase
    .from(TABLE_MODULES)
    .update({ activo: false })
    .eq('id', id)
    .eq('tenant_id', TENANT_ID);
  if (error) throw new Error(error.message);
}

// =============================================================================
// STATUS Y CRITERIOS
// =============================================================================

export async function updateModuleStatus(
  id: string,
  status: ModuleStatus
): Promise<RoadmapModule> {
  return updateModule(id, { status });
}

export async function updateCriterio(
  moduleId: string,
  criterioId: CriterioId,
  estado: CriterioEstado
): Promise<RoadmapModule> {
  const mod = await getModuleById(moduleId);
  const criterios = { ...mod.criterios, [criterioId]: estado };
  const nuevoStatus = calcularStatus(criterios, mod.status);
  return updateModule(moduleId, {
    criterios,
    status: nuevoStatus,
    auditedAt: new Date().toISOString(),
  });
}

// =============================================================================
// HISTORIAL
// =============================================================================

export async function getHistorialByModule(moduleId: string): Promise<RoadmapHistorial[]> {
  const { data, error } = await supabase
    .from(TABLE_HISTORIAL)
    .select('*')
    .eq('module_id', moduleId)
    .eq('tenant_id', TENANT_ID)
    .order('timestamp', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as RoadmapHistorial[];
}

export async function addHistorialEntry(
  entry: Omit<RoadmapHistorial, 'id'>
): Promise<RoadmapHistorial> {
  const { data, error } = await supabase
    .from(TABLE_HISTORIAL)
    .insert({ ...entry, tenant_id: TENANT_ID })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as RoadmapHistorial;
}

// =============================================================================
// AUDITORÍA
// =============================================================================

export async function saveAuditResult(
  moduleId: string,
  result: AuditResult
): Promise<RoadmapModule> {
  const criterios = Object.fromEntries(
    Object.entries(result.criterios).map(([k, v]) => [k, v.estado])
  ) as Record<CriterioId, CriterioEstado>;

  return updateModule(moduleId, {
    criterios,
    status: calcularStatus(criterios, 'registrado'),
    auditedAt: result.timestamp,
  });
}

// =============================================================================
// HELPERS INTERNOS
// =============================================================================

function calcularStatus(
  criterios: Record<CriterioId, CriterioEstado>,
  estadoActual: ModuleStatus
): ModuleStatus {
  const vals    = Object.values(criterios);
  const todosOk = vals.every(v => v === 'ok');
  const hayError = vals.some(v => v === 'error');
  const c1ok    = criterios['C1'] === 'ok';
  const c3ok    = criterios['C3'] === 'ok';

  if (hayError && (estadoActual === 'produccion' || estadoActual === 'cumple-estandar')) return 'bloqueado';
  if (todosOk && estadoActual === 'produccion') return 'produccion';
  if (todosOk) return 'cumple-estandar';
  if (c1ok && c3ok) return 'ui-lista';
  if (c1ok) return 'en-progreso';
  return 'registrado';
}
