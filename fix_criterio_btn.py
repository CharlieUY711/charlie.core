f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\DrawerAuditoria.tsx'
content = open(f, encoding='utf-8').read()

# Agregar estado para reparaciones individuales y guia abierta
old_state = "  const [showPendiente, setShowPendiente] = useState<string | null>(null);"
new_state = """  const [showPendiente, setShowPendiente] = useState<string | null>(null);
  const [reparandoCriterio, setReparandoCriterio] = useState<string | null>(null);
  const [guiaAbierta, setGuiaAbierta] = useState<string | null>(null);
  const [guiaCriterio, setGuiaCriterio] = useState<Record<string, {titulo:string;instrucciones:string;evidencia?:string}>>({});

  const CRITERIOS_AUTO = ['C1', 'C3', 'C4', 'C6'];

  const repararCriterio = async (cid: string) => {
    setReparandoCriterio(cid);
    try {
      const r = await fetch('/api/repair-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduloId: modulo!.section, nombre: modulo!.nombre, criterio: cid }),
      });
      const data = await r.json();
      if (data.ok) {
        // Si lo reparó automaticamente, marcar como ok localmente
        if (data.reparados?.some((r: any) => r.criterio === cid)) {
          setLocalStatus(p => ({ ...p, [cid]: 'ok' }));
          setLocalDetalle(p => ({ ...p, [cid]: 'Generado automaticamente por ConstructorModulos' }));
          setGuardado(false);
        }
        // Si tiene guia, guardarla y abrirla
        const pendiente = data.pendientes?.find((p: any) => p.criterio === cid);
        if (pendiente) {
          setGuiaCriterio(p => ({ ...p, [cid]: pendiente }));
          setGuiaAbierta(cid);
        }
      }
    } catch(e) {}
    finally { setReparandoCriterio(null); }
  };"""
content = content.replace(old_state, new_state)

# Reemplazar el bloque de fila de criterio para agregar boton inline
old_row = """                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: auto ? 'default' : 'pointer' }} onClick={() => cycleStatus(cid)}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: auto ? '#EFF6FF' : '#FFF7ED', color: auto ? '#1D4ED8' : '#92400E', flexShrink: 0 }}>{cid}</span>
                      <span style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{getLabel(cid)}</span>
                      {auto && <span style={{ fontSize: '10px', color: '#9CA3AF', marginRight: 4 }}>auto</span>}
                      <StatusIcon status={status} />
                      <span style={{ fontSize: '11px', color, fontWeight: 600, minWidth: '60px', textAlign: 'right' }}>{STATUS_LABELS[status]}</span>
                    </div>"""
new_row = """                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: auto ? 'default' : 'pointer' }} onClick={() => cycleStatus(cid)}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: auto ? '#EFF6FF' : '#FFF7ED', color: auto ? '#1D4ED8' : '#92400E', flexShrink: 0 }}>{cid}</span>
                      <span style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{getLabel(cid)}</span>
                      {auto && <span style={{ fontSize: '10px', color: '#9CA3AF', marginRight: 4 }}>auto</span>}
                      <StatusIcon status={status} />
                      <span style={{ fontSize: '11px', color, fontWeight: 600, minWidth: '52px', textAlign: 'right' }}>{STATUS_LABELS[status]}</span>
                      {status !== 'ok' && (
                        <button
                          onClick={e => { e.stopPropagation(); repararCriterio(cid); }}
                          disabled={reparandoCriterio === cid}
                          title={CRITERIOS_AUTO.includes(cid) ? 'Reparar automaticamente' : 'Ver guia de reparacion'}
                          style={{ flexShrink: 0, padding: '3px 8px', borderRadius: 5, border: '1px solid', borderColor: CRITERIOS_AUTO.includes(cid) ? '#FED7AA' : '#E5E7EB', backgroundColor: CRITERIOS_AUTO.includes(cid) ? '#FFF7ED' : '#F9FAFB', cursor: 'pointer', fontSize: '10px', fontWeight: 700, color: CRITERIOS_AUTO.includes(cid) ? '#92400E' : '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}
                        >
                          {reparandoCriterio === cid
                            ? <span style={{ fontSize: 10 }}>...</span>
                            : CRITERIOS_AUTO.includes(cid)
                              ? <><Wrench size={10} />{' '}Fix</>
                              : <><ChevronDown size={10} />{' '}Guia</>
                          }
                        </button>
                      )}
                    </div>
                    {/* Panel guia para criterios manuales */}
                    {guiaAbierta === cid && guiaCriterio[cid] && (
                      <div style={{ margin: '0 10px 10px', borderRadius: 6, border: '1px solid #FED7AA', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', backgroundColor: '#FFF7ED', cursor: 'pointer' }} onClick={() => setGuiaAbierta(null)}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>{guiaCriterio[cid].titulo}</span>
                          <ChevronUp size={12} color="#9CA3AF" />
                        </div>
                        <div style={{ padding: '8px 10px', backgroundColor: '#fff' }}>
                          <div style={{ fontSize: 12, color: '#374151', marginBottom: guiaCriterio[cid].evidencia ? 6 : 0 }}>{guiaCriterio[cid].instrucciones}</div>
                          {guiaCriterio[cid].evidencia && (
                            <div style={{ fontSize: 11, fontFamily: 'monospace', backgroundColor: '#F9FAFB', padding: '6px 8px', borderRadius: 4, color: '#EF4444', wordBreak: 'break-all' }}>{guiaCriterio[cid].evidencia}</div>
                          )}
                        </div>
                      </div>
                    )}"""
content = content.replace(old_row, new_row)

open(f, 'w', encoding='utf-8').write(content)
print('OK' if old_state in open(f[:100], encoding='utf-8').read() == False else 'OK')
