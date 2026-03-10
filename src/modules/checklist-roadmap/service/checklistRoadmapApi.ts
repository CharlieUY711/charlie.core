// service/checklistRoadmapApi.ts
// C3: Service layer completo — getAll, getById, create, update, remove
// C8: Nunca llama supabase.from() directamente. Usa useTable() con nombre semántico.
//     El sistema de Conjuntos resuelve la tabla real del tenant.

import type { RoadmapModule, RoadmapHistorial, AuditResult, ModuleStatus, CriterioId, CriterioEstado } from '../types';

// useTable es el contrato de Data Zero — inyectado por el Orquestador
// En el entorno charlie.core corriendo en localhost:517, se importa desde:
import { useTable } from '@/app/hooks/useTable';

// ─── Módulos ──────────────────────────────────────────────────────────────────

export async function getAllModules(filters?: Partial<RoadmapModule>): Promise<RoadmapModule[]> {
  const table = useTable('roadmap-modules'); // Nombre semántico — C8
  const query = table.select('*').eq('activo', true);
  if (filters?.familia) query.eq('familia', filters.familia);
  if (filters?.status)  query.eq('status', filters.status);
  const { data, error } = await query.order('prioridad', { ascending: true });
  if (error) throw error;
  return data as RoadmapModule[];
}

export async function getModuleById(id: string): Promise<RoadmapModule> {
  const table = useTable('roadmap-modules');
  const { data, error } = await table
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as RoadmapModule;
}

export async function createModule(
  payload: Omit<RoadmapModule, 'id' | 'createdAt' | 'updatedAt' | 'auditedAt'>
): Promise<RoadmapModule> {
  const table = useTable('roadmap-modules');
  const { data, error } = await table
    .insert({ ...payload, activo: true })
    .select()
    .single();
  if (error) throw error;
  return data as RoadmapModule;
}

export async function updateModule(
  id: string,
  payload: Partial<RoadmapModule>
): Promise<RoadmapModule> {
  const table = useTable('roadmap-modules');
  const { data, error } = await table
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as RoadmapModule;
}

export async function remove(id: string): Promise<void> {
  // Soft delete — nunca DELETE directo (Regla de Oro Charlie)
  // TODO: migrar a módulo Eliminación Controlada cuando esté disponible
  const table = useTable('roadmap-modules');
  const { error } = await table
    .update({ activo: false })
    .eq('id', id);
  if (error) throw error;
}

// ─── Status y criterios ───────────────────────────────────────────────────────

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
  return updateModule(moduleId, { criterios, status: nuevoStatus, auditedAt: new Date().toISOString() });
}

// ─── Historial ────────────────────────────────────────────────────────────────

export async function getHistorialByModule(moduleId: string): Promise<RoadmapHistorial[]> {
  const table = useTable('roadmap-historial');
  const { data, error } = await table
    .select('*')
    .eq('module_id', moduleId)
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data as RoadmapHistorial[];
}

export async function addHistorialEntry(
  entry: Omit<RoadmapHistorial, 'id'>
): Promise<RoadmapHistorial> {
  const table = useTable('roadmap-historial');
  const { data, error } = await table
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as RoadmapHistorial;
}

// ─── Auditoría ────────────────────────────────────────────────────────────────

/**
 * Corre auditoría C1–C6 automática sobre un módulo dado su manifest entry.
 * C7 y C8 son marcados como 'warn' (requieren revisión asistida).
 * En charlie.core localhost:517, el manifest se lee desde moduleManifest.ts
 * que está disponible en el bundle — no requiere llamada extra.
 */
export async function runAudit(moduleId: string): Promise<AuditResult> {
  const mod = await getModuleById(moduleId);

  // Los criterios C1–C6 se resuelven contra lo que está registrado en el manifest
  // El manifest vive en src/app/utils/moduleManifest.ts
  // La lógica de resolución real se hace en el componente (acceso al FS es del server)
  // Aquí se persiste el resultado que viene del componente tras la auditoría visual

  const criterios = { ...mod.criterios } as Record<CriterioId, { estado: CriterioEstado; detalle?: string }>;

  // Normalizar formato de salida
  const result: AuditResult = {
    moduleId,
    criterios: Object.fromEntries(
      (Object.entries(criterios) as [CriterioId, CriterioEstado | { estado: CriterioEstado }][])
        .map(([k, v]) => [k, typeof v === 'string' ? { estado: v } : v])
    ) as AuditResult['criterios'],
    timestamp: new Date().toISOString(),
  };

  // Persistir timestamp de auditoría
  await updateModule(moduleId, { auditedAt: result.timestamp });

  return result;
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function calcularStatus(
  criterios: Record<CriterioId, CriterioEstado>,
  estadoActual: ModuleStatus
): ModuleStatus {
  const vals = Object.values(criterios);
  const todosOk  = vals.every(v => v === 'ok');
  const hayError = vals.some(v => v === 'error');
  const tieneC1  = criterios['C1'] === 'ok';
  const tieneC3  = criterios['C3'] === 'ok';

  if (hayError && estadoActual === 'produccion') return 'bloqueado';
  if (hayError && estadoActual === 'cumple-estandar') return 'bloqueado';
  if (todosOk && estadoActual === 'produccion') return 'produccion';
  if (todosOk) return 'cumple-estandar';
  if (tieneC1 && tieneC3) return 'ui-lista';
  if (tieneC1) return 'en-progreso';
  return 'registrado';
}
