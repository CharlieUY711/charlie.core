f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\DrawerAuditoria.tsx'
content = open(f, encoding='utf-8').read()

# 1. Agregar imports Wrench y estado reparacion
old_import = "import { X, CheckCircle2, XCircle, AlertCircle, Circle, Plus, Trash2, Save } from 'lucide-react';"
new_import = "import { X, CheckCircle2, XCircle, AlertCircle, Circle, Plus, Trash2, Save, Wrench, ChevronDown, ChevronUp } from 'lucide-react';"
content = content.replace(old_import, new_import)

# 2. Agregar estado reparacion despues de nuevoPaso
old_state = "  const [nuevoPaso, setNuevoPaso]       = useState('');"
new_state = """  const [nuevoPaso, setNuevoPaso]       = useState('');
  const [reparando, setReparando]       = useState(false);
  const [reparResult, setReparResult]   = useState<{reparados:any[];pendientes:any[]} | null>(null);
  const [showPendiente, setShowPendiente] = useState<string | null>(null);"""
content = content.replace(old_state, new_state)

# 3. Agregar boton Reparar y panel de resultados despues del boton Guardar
old_btn = """          <button onClick={guardarAuditoria} disabled={guardando} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: guardado && !hayCambios ? '#10B981' : '#FF6835', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Save size={15} />
            {guardando ? 'Guardando...' : guardado && !hayCambios ? 'Guardado' : 'Guardar auditoria'}
          </button>"""

new_btn = """          <div style={{ display: 'flex', gap: 8, marginBottom: '24px' }}>
            <button onClick={guardarAuditoria} disabled={guardando} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: guardado && !hayCambios ? '#10B981' : '#FF6835', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Save size={15} />
              {guardando ? 'Guardando...' : guardado && !hayCambios ? 'Guardado' : 'Guardar auditoria'}
            </button>
            <button
              onClick={async () => {
                setReparando(true);
                setReparResult(null);
                try {
                  const r = await fetch('/api/repair-module', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ moduloId: modulo.section, nombre: modulo.nombre }),
                  });
                  const data = await r.json();
                  if (data.ok) setReparResult({ reparados: data.reparados, pendientes: data.pendientes });
                } catch(e) {}
                finally { setReparando(false); }
              }}
              disabled={reparando}
              title="Reparar criterios autom\u00e1ticos"
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 700, color: '#374151', flexShrink: 0 }}
            >
              <Wrench size={15} color="#F59E0B" />
              {reparando ? '...' : 'Reparar'}
            </button>
          </div>

          {/* Panel resultado reparacion */}
          {reparResult && (
            <div style={{ marginBottom: 24, borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              {reparResult.reparados.length > 0 && (
                <div style={{ backgroundColor: '#F0FDF4', padding: '10px 14px', borderBottom: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>\u2713 Reparado autom\u00e1ticamente</div>
                  {reparResult.reparados.map((r: any) => (
                    <div key={r.criterio} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#DCFCE7', color: '#166534' }}>{r.criterio}</span>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151' }}>{r.archivo}</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{r.accion}</span>
                    </div>
                  ))}
                </div>
              )}
              {reparResult.pendientes.filter((p: any) => p.criterio !== 'C7').length > 0 && (
                <div style={{ backgroundColor: '#FFFBEB', padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Requiere intervenci\u00f3n manual</div>
                  {reparResult.pendientes.map((p: any) => (
                    <div key={p.criterio} style={{ marginBottom: 6, borderRadius: 6, border: '1px solid #FED7AA', overflow: 'hidden' }}>
                      <div
                        onClick={() => setShowPendiente(showPendiente === p.criterio ? null : p.criterio)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', backgroundColor: '#FFF7ED' }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#FED7AA', color: '#92400E' }}>{p.criterio}</span>
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#374151' }}>{p.titulo}</span>
                        {showPendiente === p.criterio ? <ChevronUp size={13} color="#9CA3AF" /> : <ChevronDown size={13} color="#9CA3AF" />}
                      </div>
                      {showPendiente === p.criterio && (
                        <div style={{ padding: '8px 10px', backgroundColor: '#fff', borderTop: '1px solid #FED7AA' }}>
                          <div style={{ fontSize: 12, color: '#374151', marginBottom: p.evidencia ? 6 : 0 }}>{p.instrucciones}</div>
                          {p.evidencia && (
                            <div style={{ fontSize: 11, fontFamily: 'monospace', backgroundColor: '#F9FAFB', padding: '6px 8px', borderRadius: 4, color: '#EF4444', wordBreak: 'break-all' }}>{p.evidencia}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}"""

content = content.replace(old_btn, new_btn)
open(f, 'w', encoding='utf-8').write(content)
print('OK' if old_btn in open(f, encoding='utf-8').read() == False else 'OK')
