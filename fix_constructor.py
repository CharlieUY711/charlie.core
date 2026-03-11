f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
content = open(f, encoding='utf-8').read()

# 1. Agregar import de Plus
old_import = "import React, { useState, useMemo, useEffect } from 'react';"
new_import = "import React, { useState, useMemo, useEffect } from 'react';\nimport { Plus } from 'lucide-react';"
content = content.replace(old_import, new_import)

# 2. Agregar estado del drawer nuevo modulo despues de moduloAuditado
old_state = "  const [moduloAuditado, setModuloAuditado]"
new_state = """  const [nuevoModulo, setNuevoModulo]       = React.useState(false);
  const [nmNombre, setNmNombre]             = React.useState('');
  const [nmTabla, setNmTabla]               = React.useState('');
  const [nmGrupo, setNmGrupo]               = React.useState('Sin grupo');
  const [nmDesc, setNmDesc]                 = React.useState('');
  const [nmCreando, setNmCreando]           = React.useState(false);
  const [nmResultado, setNmResultado]       = React.useState<{ok:boolean;archivos?:any[];error?:string} | null>(null);
  const [moduloAuditado, setModuloAuditado]"""
content = content.replace(old_state, new_state)

# 3. Agregar boton Nuevo modulo en toolbar, antes del span de contador
old_toolbar = '              <span style={{ fontSize: 12, color: \'#6B7280\', whiteSpace: \'nowrap\' }}>'
new_toolbar = """              <button
                onClick={() => { setNuevoModulo(true); setNmResultado(null); setNmNombre(''); setNmTabla(''); setNmDesc(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', backgroundColor: '#FF6835', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
              >
                <Plus size={13} /> Nuevo módulo
              </button>
              <span style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>"""
content = content.replace(old_toolbar, new_toolbar)

# 4. Agregar DrawerNuevoModulo antes del DrawerAuditoria
old_drawer = "          <DrawerAuditoria modulo={moduloAuditado}"
new_drawer = """          {/* ── Drawer Nuevo Módulo ── */}
          {nuevoModulo && (
            <>
              <div onClick={() => setNuevoModulo(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 100, backdropFilter: 'blur(2px)' }} />
              <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, backgroundColor: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>

                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #FF6835 0%, #ff8c42 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Plus size={18} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>Nuevo módulo</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>Genera C1 C3 C4 C5 C6 C8 automáticamente</div>
                  </div>
                  <button onClick={() => setNuevoModulo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 18, color: '#9CA3AF' }}>✕</button>
                </div>

                {/* Formulario */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Nombre */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Nombre del módulo *</label>
                    <input value={nmNombre} onChange={e => setNmNombre(e.target.value)} placeholder="ej: Proveedores" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    {nmNombre && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>→ {nmNombre.toLowerCase().replace(/\s+/g, '')}View.tsx · {nmNombre.toLowerCase().replace(/\s+/g, '')}Api.ts</div>}
                  </div>

                  {/* Tabla */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Tabla Supabase (C2) *</label>
                    <input value={nmTabla} onChange={e => setNmTabla(e.target.value)} placeholder="ej: proveedores" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Nombre exacto de la tabla en Supabase</div>
                  </div>

                  {/* Grupo */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Grupo</label>
                    <select value={nmGrupo} onChange={e => setNmGrupo(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                      {grupos.map(g => <option key={g} value={g}>{g}</option>)}
                      <option value="Sin grupo">Sin grupo</option>
                    </select>
                  </div>

                  {/* Descripcion */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Descripción</label>
                    <textarea value={nmDesc} onChange={e => setNmDesc(e.target.value)} placeholder="Para qué sirve este módulo..." rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'system-ui' }} />
                  </div>

                  {/* Preview archivos */}
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB', padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Archivos a generar</div>
                    {[
                      { criterio: 'C1', archivo: nmNombre ? `views/${nmNombre.toLowerCase().replace(/\s+/g,'')}View.tsx` : 'views/{Nombre}View.tsx' },
                      { criterio: 'C3 C8', archivo: nmNombre ? `services/${nmNombre.toLowerCase().replace(/\s+/g,'')}Api.ts` : 'services/{nombre}Api.ts' },
                      { criterio: 'C4', archivo: nmNombre ? `modules/${nmNombre.toLowerCase().replace(/\s+/g,'')}/module.config.ts` : 'modules/{nombre}/module.config.ts' },
                      { criterio: 'C5 C6', archivo: nmNombre ? `modules/${nmNombre.toLowerCase().replace(/\s+/g,'')}/ui/tokens.css` : 'modules/{nombre}/ui/tokens.css' },
                    ].map(({ criterio, archivo }) => (
                      <div key={criterio} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#EFF6FF', color: '#1D4ED8', flexShrink: 0 }}>{criterio}</span>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151' }}>{archivo}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E5E7EB', fontSize: 11, color: '#9CA3AF' }}>C2 C7 requieren configuración manual posterior</div>
                  </div>

                  {/* Resultado */}
                  {nmResultado && (
                    <div style={{ borderRadius: 8, border: `1px solid ${nmResultado.ok ? '#BBF7D0' : '#FECACA'}`, backgroundColor: nmResultado.ok ? '#F0FDF4' : '#FEF2F2', padding: '12px 14px' }}>
                      {nmResultado.ok ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 8 }}>✓ Módulo creado exitosamente</div>
                          {nmResultado.archivos?.map((a: any) => (
                            <div key={a.path} style={{ fontSize: 11, color: '#166534', marginBottom: 3 }}>✓ {a.path} <span style={{ color: '#9CA3AF' }}>— {a.contenido}</span></div>
                          ))}
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>Reiniciá el dev server para que Vite detecte los nuevos archivos.</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: '#991B1B' }}>✕ {nmResultado.error}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
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
                    style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', backgroundColor: !nmNombre.trim() || !nmTabla.trim() ? '#E5E7EB' : '#FF6835', color: !nmNombre.trim() || !nmTabla.trim() ? '#9CA3AF' : '#fff', fontSize: 13, fontWeight: 700, cursor: !nmNombre.trim() || !nmTabla.trim() ? 'not-allowed' : 'pointer' }}
                  >
                    {nmCreando ? 'Creando módulo...' : 'Crear módulo'}
                  </button>
                </div>
              </div>
            </>
          )}

          <DrawerAuditoria modulo={moduloAuditado}"""
content = content.replace(old_drawer, new_drawer)

open(f, 'w', encoding='utf-8').write(content)
print('OK')
