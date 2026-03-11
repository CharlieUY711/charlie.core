f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\hooks\useAuditoria.ts'
content = open(f, encoding='utf-8').read()

old = """    const { error } = await supabase.from('modulos_auditoria').upsert(
      { modulo_id: moduloId, criterio_id, status, detalle, updated_at: new Date().toISOString() },
      { onConflict: 'modulo_id,criterio_id' }
    );
    if (error) {
      console.error('[useAuditoria] saveCriterio error:', error);
      return;
    }"""

new = """    console.log('[useAuditoria] guardando:', moduloId, criterio_id, status);
    const { error, data } = await supabase.from('modulos_auditoria').upsert(
      { modulo_id: moduloId, criterio_id, status, detalle, updated_at: new Date().toISOString() },
      { onConflict: 'modulo_id,criterio_id' }
    ).select();
    if (error) {
      console.error('[useAuditoria] saveCriterio error:', error);
      return;
    }
    console.log('[useAuditoria] guardado OK:', data);"""

result = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old in content else 'NO MATCH')
