f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
lines = open(f, encoding='utf-8').readlines()

drawer = """
          {/* ── Drawer Nuevo Modulo ── */}
          {nuevoModulo && (
            <>
              <div onClick={() => setNuevoModulo(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 100, backdropFilter: 'blur(2px)' }} />
              <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, backgroundColor: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #FF6835 0%, #ff8c42 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Plus size={18} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>Nuevo m\u00f3dulo</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>Genera C1 C3 C4 C5 C6 C8 autom\u00e1ticamente</div>
                  </div>
                  <button onClick={() => setNuevoModulo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9CA3AF', padding: 4 }}>\u2715</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Nombre del m\u00f3dulo *</label>
                    <input value={nmNombre} onChange={e => setNmNombre(e.target.value)} placeholder="ej: Proveedores" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    {nmNombre && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{'\u2192'} {nmNombre.toLowerCase().replace(/\s+/g, '')}View.tsx</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Tabla Supabase (C2) *</label>
                    <input value={nmTabla} onChange={e => setNmTabla(e.target.value)} placeholder="ej: proveedores" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Nombre exacto de la tabla en Supabase</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Grupo</label>
                    <select value={nmGrupo} onChange={e => setNmGrupo(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                      {grupos.map(g => <option key={g} value={g}>{g}</option>)}
                      <option value="Sin grupo">Sin grupo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Descripci\u00f3n</label>
                    <textarea value={nmDesc} onChange={e => setNmDesc(e.target.value)} placeholder="Para qu\u00e9 sirve este m\u00f3dulo..." rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'system-ui' }} />
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB', padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Archivos a generar</div>
                    {[
                      { criterio: 'C1',    archivo: `views/${nmNombre ? nmNombre.toLowerCase().replace(/\\s+/g,'') : '{nombre}'}View.tsx` },
                      { criterio: 'C3 C8', archivo: `services/${nmNombre ? nmNombre.toLowerCase().replace(/\\s+/g,'') : '{nombre}'}Api.ts` },
                      { criterio: 'C4',    archivo: `modules/${nmNombre ? nmNombre.toLowerCase().replace(/\\s+/g,'') : '{nombre}'}/module.config.ts` },
                      { criterio: 'C5 C6', archivo: `modules/${nmNombre ? nmNombre.toLowerCase().replace(/\\s+/g,'') : '{nombre}'}/ui/tokens.css` },
                    ].map(({ criterio, archivo }) => (
                      <div key={criterio} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#EFF6FF', color: '#1D4ED8', flexShrink: 0 }}>{criterio}</span>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151' }}>{archivo}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E5E7EB', fontSize: 11, color: '#9CA3AF' }}>C2 y C7 requieren configuraci\u00f3n manual posterior</div>
                  </div>
                  {nmResultado && (
                    <div style={{ borderRadius: 8, border: `1px solid ${nmResultado.ok ? '#BBF7D0' : '#FECACA'}`, backgroundColor: nmResultado.ok ? '#F0FDF4' : '#FEF2F2', padding: '12px 14px' }}>
                      {nmResultado.ok ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 8 }}>\u2713 M\u00f3dulo creado exitosamente</div>
                          {nmResultado.archivos?.map((a: any) => (
                            <div key={a.path} style={{ fontSize: 11, color: '#166534', marginBottom: 3 }}>\u2713 {a.path} <span style={{ color: '#9CA3AF' }}>\u2014 {a.contenido}</span></div>
                          ))}
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>Reinici\u00e1 el dev server para que Vite detecte los nuevos archivos.</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: '#991B1B' }}>\u2715 {nmResultado.error}</div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB' }}>
                  <button
                    disabled={!nmNombre.trim() || !nmTabla.trim() || nmCreando}
                    onClick={async () => {
                      setNmCreando(true);
                      setNmResultado(null);
                      try {
                        const r = await fetch('/api/create-module', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ nombre: nmNombre.trim(), tabla: nmTabla.trim(), grupo: nmGrupo, descripcion: nmDesc.trim() }),
                        });
                        const data = await r.json();
                        setNmResultado(data.ok ? { ok: true, archivos: data.archivos } : { ok: false, error: data.error });
                      } catch (e: any) {
                        setNmResultado({ ok: false, error: e.message });
                      } finally {
                        setNmCreando(false);
                      }
                    }}
                    style={{ width: '100%', padding: 11, borderRadius: 8, border: 'none', backgroundColor: !nmNombre.trim() || !nmTabla.trim() ? '#E5E7EB' : '#FF6835', color: !nmNombre.trim() || !nmTabla.trim() ? '#9CA3AF' : '#fff', fontSize: 13, fontWeight: 700, cursor: !nmNombre.trim() || !nmTabla.trim() ? 'not-allowed' : 'pointer' }}
                  >
                    {nmCreando ? 'Creando...' : 'Crear m\u00f3dulo'}
                  </button>
                </div>
              </div>
            </>
          )}
"""

# Insertar antes de la linea 653 (indice 652)
lines.insert(652, drawer)
open(f, 'w', encoding='utf-8').writelines(lines)
print('OK')
