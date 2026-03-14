// auditEngine.ts — Motor de auditoría C1–C8
// Extrae la lógica de vite-plugin-audit.ts como código puro y testeble.
// No depende de Vite. No importa moduleManifest.ts (eliminado en sesión 3).
// Fuente de verdad: filesystem + Supabase via checklistRoadmapApi.ts

import type { CriterioId, CriterioEstado, AuditResult } from '../types';

// ─── Tipos internos ───────────────────────────────────────────────────────────

export interface CriterioResult {
  id: CriterioId;
  estado: CriterioEstado;
  detalle: string;
  deteccion: 'automatico' | 'asistido';
  evidencia?: string;
}

export interface AuditEngineResult {
  moduleId: string;
  viewFile: string;
  criterios: CriterioResult[];
  score: number; // 0–8
  timestamp: string;
}

// ─── Contrato del engine ──────────────────────────────────────────────────────
// auditEngine recibe el resultado crudo del endpoint /api/audit/:id
// y lo normaliza al formato AuditEngineResult tipado.
// La evaluación real de C1–C6 la hace el servidor (vite-plugin-audit).
// El engine normaliza, calcula score y prepara para persistir en Supabase.

export function normalizeAuditResult(raw: {
  moduloId: string;
  viewFile: string;
  criterios: Array<{
    id: string;
    status: string;
    detalle: string;
    auto: boolean;
    evidencia?: string;
  }>;
  score: number;
}): AuditEngineResult {
  const criterios: CriterioResult[] = raw.criterios.map(c => ({
    id: c.id as CriterioId,
    estado: mapStatus(c.status),
    detalle: c.detalle,
    deteccion: c.auto ? 'automatico' : 'asistido',
    evidencia: c.evidencia,
  }));

  return {
    moduleId: raw.moduloId,
    viewFile: raw.viewFile,
    criterios,
    score: criterios.filter(c => c.estado === 'ok').length,
    timestamp: new Date().toISOString(),
  };
}

// ─── Fetch desde el endpoint Vite ─────────────────────────────────────────────

export async function auditModulo(moduleId: string): Promise<AuditEngineResult | null> {
  try {
    const res = await fetch(`/api/audit/${moduleId}`);
    if (!res.ok) return null;
    const raw = await res.json();
    return normalizeAuditResult(raw);
  } catch {
    return null;
  }
}

export async function auditTodos(moduleIds: string[]): Promise<AuditEngineResult[]> {
  const results = await Promise.allSettled(moduleIds.map(id => auditModulo(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<AuditEngineResult> =>
      r.status === 'fulfilled' && r.value !== null
    )
    .map(r => r.value);
}

// ─── Conversión a AuditResult (formato Supabase) ──────────────────────────────

export function toAuditResult(result: AuditEngineResult): AuditResult {
  return {
    moduleId: result.moduleId,
    criterios: Object.fromEntries(
      result.criterios.map(c => [
        c.id,
        { estado: c.estado, detalle: c.detalle },
      ])
    ) as AuditResult['criterios'],
    timestamp: result.timestamp,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapStatus(status: string): CriterioEstado {
  switch (status) {
    case 'ok':      return 'ok';
    case 'fail':    return 'error';
    case 'partial': return 'warn';
    default:        return 'pending';
  }
}

export function calcularScoreColor(score: number): string {
  if (score === 8) return 'var(--m-success)';
  if (score >= 5)  return 'var(--m-warning)';
  return 'var(--m-danger)';
}

export function calcularScoreLabel(score: number): string {
  if (score === 8) return 'Cumple Estándar';
  if (score >= 5)  return 'Parcial';
  return 'Bloqueado';
}
