import { supabase } from '../../utils/supabase/client';

/**
 * syncManifest.ts
 * Sincroniza modulos_disponibles → roadmap_modules.
 * Fuente de verdad: Supabase. Sin archivos estáticos.
 */
export async function syncManifestToRoadmap(): Promise<void> {
  try {
    const { data: disponibles, error: fetchError } = await supabase
      .from('modulos_disponibles')
      .select('section, view, nombre, grupo, is_real, has_supabase, view_file')
      .eq('activo', true);

    if (fetchError) {
      console.error('[SyncManifest] Error leyendo modulos_disponibles:', fetchError);
      return;
    }
    if (!disponibles || disponibles.length === 0) {
      console.warn('[SyncManifest] Sin modulos disponibles.');
      return;
    }

    const ids = disponibles.map(m => m.section);
    const { data: existentes } = await supabase
      .from('roadmap_modules')
      .select('id, status, prioridad')
      .in('id', ids);

    const existentesMap = new Map((existentes || []).map(m => [m.id, m]));

    const upsertData = disponibles.map((m, i) => {
      const existente = existentesMap.get(m.section);
      return {
        id:           m.section,
        tenant_id:    'charlie',
        nombre:       m.nombre,
        familia:      m.grupo ?? 'core',
        view_file:    m.view_file ?? m.view,
        is_real:      m.is_real,
        has_supabase: m.has_supabase,
        status:       existente?.status   ?? 'registrado',
        prioridad:    existente?.prioridad ?? (i + 1),
        criterios:    {},
      };
    });

    const { error: upsertError } = await supabase
      .from('roadmap_modules')
      .upsert(upsertData, { onConflict: 'id,tenant_id' });

    if (upsertError) {
      console.error('[SyncManifest] Error en upsert:', upsertError);
      return;
    }

    console.log(`[SyncManifest] ${upsertData.length} modulos sincronizados.`);
  } catch (error) {
    console.error('[SyncManifest] Error inesperado:', error);
  }
}