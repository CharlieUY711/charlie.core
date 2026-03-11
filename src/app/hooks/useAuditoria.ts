/**
 * useAuditoria.ts
 * Charlie Platform — Hook para leer y escribir auditoría C1-C8 + pasos por módulo
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase/client';

export type CriterioStatus = 'ok' | 'fail' | 'partial' | 'unknown';

export interface CriterioAuditoria {
  criterio_id: string;
  status:      CriterioStatus;
  detalle:     string;
}

export interface PasoModulo {
  id:          string;
  descripcion: string;
  estado:      'pendiente' | 'en_progreso' | 'completado';
  prioridad:   number;
}

export function useAuditoria(moduloId: string | null) {
  const [criterios, setCriterios] = useState<CriterioAuditoria[]>([]);
  const [pasos,     setPasos]     = useState<PasoModulo[]>([]);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (!moduloId) { setCriterios([]); setPasos([]); return; }
    setLoading(true);
    Promise.all([
      supabase.from('modulos_auditoria').select('criterio_id, status, detalle').eq('modulo_id', moduloId),
      supabase.from('modulos_pasos').select('id, descripcion, estado, prioridad').eq('modulo_id', moduloId).order('prioridad'),
    ]).then(([{ data: cData }, { data: pData }]) => {
      setCriterios(cData ?? []);
      setPasos(pData ?? []);
    }).finally(() => setLoading(false));
  }, [moduloId]);

  const saveCriterio = useCallback(async (criterio_id: string, status: CriterioStatus, detalle: string) => {
    if (!moduloId) return;
    console.log('[useAuditoria] guardando:', moduloId, criterio_id, status);
    const { error, data } = await supabase.from('modulos_auditoria').upsert(
      { modulo_id: moduloId, criterio_id, status, detalle, updated_at: new Date().toISOString() },
      { onConflict: 'modulo_id,criterio_id' }
    ).select();
    if (error) {
      console.error('[useAuditoria] saveCriterio error:', error);
      return;
    }
    console.log('[useAuditoria] guardado OK:', data);
    setCriterios(prev => {
      const idx = prev.findIndex(c => c.criterio_id === criterio_id);
      const updated = { criterio_id, status, detalle };
      return idx >= 0 ? prev.map((c, i) => i === idx ? updated : c) : [...prev, updated];
    });
  }, [moduloId]);

  const addPaso = useCallback(async (descripcion: string) => {
    if (!moduloId) return;
    const { data } = await supabase.from('modulos_pasos').insert({
      modulo_id: moduloId, descripcion, estado: 'pendiente', prioridad: pasos.length + 1,
    }).select().single();
    if (data) setPasos(prev => [...prev, data]);
  }, [moduloId, pasos.length]);

  const updatePaso = useCallback(async (id: string, estado: PasoModulo['estado']) => {
    await supabase.from('modulos_pasos').update({ estado, updated_at: new Date().toISOString() }).eq('id', id);
    setPasos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  }, []);

  const deletePaso = useCallback(async (id: string) => {
    await supabase.from('modulos_pasos').delete().eq('id', id);
    setPasos(prev => prev.filter(p => p.id !== id));
  }, []);

  return { criterios, pasos, loading, saveCriterio, addPaso, updatePaso, deletePaso };
}

