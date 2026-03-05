/**
 * useModules.ts
 * Charlie Platform -- Hook que resuelve los modulos activos del cliente.
 *
 * Flujo:
 *   1. Lee config.modulos (categorias activas) del Orquestador
 *   2. Si es ["*"] activa todos
 *   3. Consulta modulos_disponibles en Supabase filtrando por categoria
 *   4. Devuelve lista de ModuloActivo con slug y nombre
 */
import { useState, useEffect } from 'react';
import { supabase } from '../../../../utils/supabase/client';
import { useOrchestrator } from '../providers/OrchestratorProvider';

export interface ModuloActivo {
  slug:      string;
  nombre:    string;
  categoria: string;
}

interface UseModulesResult {
  modulos:  ModuloActivo[];
  loading:  boolean;
  error:    string | null;
}

export function useModules(): UseModulesResult {
  const { config, isReady } = useOrchestrator();
  const [modulos, setModulos]   = useState<ModuloActivo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    async function fetchModulos() {
      try {
        setLoading(true);
        const categoriasActivas = config?.modulos ?? [];

        let query = supabase
          .from('modulos_disponibles')
          .select('slug, nombre, categoria')
          .eq('activo', true)
          .order('categoria')
          .order('nombre');

        // ["*"] = todos los modulos activos
        if (!categoriasActivas.includes('*')) {
          query = query.in('categoria', categoriasActivas);
        }

        const { data, error: sbError } = await query;

        if (sbError) throw sbError;
        setModulos(data ?? []);
      } catch (err: any) {
        setError(err.message ?? 'Error cargando modulos');
        console.error('[useModules]', err);
      } finally {
        setLoading(false);
      }
    }

    fetchModulos();
  }, [isReady, config?.modulos]);

  return { modulos, loading, error };
}
