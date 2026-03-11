f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\hooks\useAuditoria.ts'
content = open(f, encoding='utf-8').read()

old = """  const saveCriterio = useCallback(async (criterio_id: string, status: CriterioStatus, detalle: string) => {
    if (!moduloId) return;
    await supabase.from('modulos_auditoria').upsert(
      { modulo_id: moduloId, criterio_id, status, detalle, updated_at: new Date().toISOString() },
      { onConflict: 'modulo_id,criterio_id' }
    );
    setCriterios(prev => {
      const idx = prev.findIndex(c => c.criterio_id === criterio_id);
      const updated = { criterio_id, status, detalle };
      return idx >= 0 ? prev.map((c, i) => i === idx ? updated : c) : [...prev, updated];
    });
  }, [moduloId]);"""

new = """  const saveCriterio = useCallback(async (criterio_id: string, status: CriterioStatus, detalle: string) => {
    if (!moduloId) return;
    const { error } = await supabase.from('modulos_auditoria').upsert(
      { modulo_id: moduloId, criterio_id, status, detalle, updated_at: new Date().toISOString() },
      { onConflict: 'modulo_id,criterio_id' }
    );
    if (error) {
      console.error('[useAuditoria] saveCriterio error:', error);
      return;
    }
    setCriterios(prev => {
      const idx = prev.findIndex(c => c.criterio_id === criterio_id);
      const updated = { criterio_id, status, detalle };
      return idx >= 0 ? prev.map((c, i) => i === idx ? updated : c) : [...prev, updated];
    });
  }, [moduloId]);"""

result = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old in content else 'NO MATCH')
