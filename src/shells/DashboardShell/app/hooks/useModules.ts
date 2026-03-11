/**
 * useModules.ts
 * Carga las secciones y módulos activos desde Supabase.
 *
 * Campos en modulos_disponibles:
 *   section      text      — nombre legible de la sección (ej: 'Logística')
 *   view         text      — nombre del componente (ej: 'EnviosView')
 *   nombre       text      — label legible del módulo (ej: 'Envíos')
 *   orden        integer   — orden en el sidebar (default 99)
 *   activo       boolean
 *   grupo        text      — agrupación (ej: 'logistica')
 *   is_real      boolean   — si el módulo está implementado
 *   has_supabase boolean   — si tiene integración con Supabase
 *   view_file    text      — nombre del archivo de vista
 */
import { useState, useEffect } from 'react';
import { supabase } from '../../../../utils/supabase/client';
import { useOrchestrator } from '../providers/OrchestratorProvider';

export interface ModuloActivo {
  section:     string;
  view:        string;
  nombre:      string;
  orden:       number;
  grupo:       string | null;
  isReal:      boolean;
  hasSupabase: boolean;
  viewFile:    string | null;
}

export interface SeccionActiva {
  section: string;
  nombre:  string;
  orden:   number;
}

interface UseModulesResult {
  secciones: SeccionActiva[];
  modulos:   ModuloActivo[];
  loading:   boolean;
  error:     string | null;
}

export function useModules(): UseModulesResult {
  const { isReady } = useOrchestrator();
  const [modulos, setModulos] = useState<ModuloActivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    async function fetchModulos() {
      try {
        setLoading(true);
        const { data, error: sbError } = await supabase
          .from('modulos_disponibles')
          .select('section, view, nombre, orden, grupo, is_real, has_supabase, view_file')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (sbError) throw sbError;

        const rows = (data ?? []).map((row: any) => ({
          section:     row.section      as string,
          view:        row.view         as string,
          nombre:      row.nombre       as string,
          orden:       row.orden        ?? 99,
          grupo:       row.grupo        ?? null,
          isReal:      row.is_real      ?? false,
          hasSupabase: row.has_supabase ?? false,
          viewFile:    row.view_file    ?? null,
        }));

        setModulos(rows);
      } catch (err: any) {
        setError(err.message ?? 'Error cargando módulos');
        console.error('[useModules]', err);
      } finally {
        setLoading(false);
      }
    }

    fetchModulos();
  }, [isReady]);

  const seccionesMap = new Map<string, SeccionActiva>();
  for (const m of modulos) {
    if (!seccionesMap.has(m.section)) {
      seccionesMap.set(m.section, {
        section: m.section,
        nombre:  m.section,
        orden:   m.orden,
      });
    }
  }

  const secciones = [...seccionesMap.values()].sort((a, b) => {
    if (a.section === 'Dashboard') return -1;
    if (b.section === 'Dashboard') return 1;
    return a.nombre.localeCompare(b.nombre);
  });

  return { secciones, modulos, loading, error };
}
