/* =====================================================
   QR Generator — Herramienta interna de Charlie
   Sin APIs externas · Genera PNG y SVG localmente
   ===================================================== */
import React, { useState, useCallback } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import { QrCodeDisplay, downloadQrPng, downloadQrSvg } from '../QrCodeDisplay';
import type { QrCodeOptions } from '../QrCodeDisplay';
import type { MainSection } from '../../../AdminDashboard';
import { toast } from 'sonner';
import {
  Download, Copy, RefreshCw, Link, Type, Palette,
  Settings2, Maximize2, CheckCircle, QrCode,
} from 'lucide-react';

interface Props { onNavigate?: (section: MainSection) => void; }

const ORANGE = '#FF6835';

const CORRECTION_LEVELS = [
  { id: 'L', label: 'L — Baja (7%)',    desc: 'Más compacto' },
  { id: 'M', label: 'M — Media (15%)',  desc: 'Recomendado'  },
  { id: 'Q', label: 'Q — Alta (25%)',   desc: 'Más robusto'  },
  { id: 'H', label: 'H — Máxima (30%)', desc: 'Logos encima' },
] as const;

const PRESETS = [
  { label: 'Negro clásico',     dark: '#000000', light: 'var(--m-surface)' },
  { label: 'Charlie Naranja',   dark: 'var(--m-primary)', light: 'var(--m-surface)' },
  { label: 'Dark mode',         dark: 'var(--m-surface)', light: 'var(--m-text)' },
  { label: 'Verde natural',     dark: 'var(--m-success-text)', light: 'var(--m-success-bg)' },
  { label: 'Azul corporativo',  dark: 'var(--m-info-text)', light: 'var(--m-info-bg)' },
  { label: 'Dorado premium',    dark: 'var(--m-warning-text)', light: 'var(--m-warning-bg)' },
];

const SIZES = [128, 180, 256, 400, 512, 600];

const EJEMPLOS = [
  { label: 'URL Web',       value: 'https://charlie.market' },
  { label: 'WhatsApp',      value: 'https://wa.me/59899123456?text=Hola' },
  { label: 'Email',         value: 'mailto:hola@charlie.market' },
  { label: 'Texto libre',   value: 'Gracias por tu compra — Charlie Marketplace' },
  { label: 'vCard',         value: 'BEGIN:VCARD\nVERSION:3.0\nFN:Charlie Market\nTEL:+59899000000\nEND:VCARD' },
  { label: 'WiFi',          value: 'WIFI:T:WPA;S:MiRed;P:contraseña;;' },
];

export function QrGeneratorView({ onNavigate }: Props) {
  const [valor,      setValor]      = useState('https://charlie.market');
  const [opciones,   setOpciones]   = useState<QrCodeOptions>({
    size:            256,
    darkColor:       '#000000',
    lightColor:      'var(--m-surface)',
    errorCorrection: 'M',
    margin:          2,
  });
  const [dataUrl,    setDataUrl]    = useState('');
  const [copiado,    setCopiado]    = useState(false);
  const [pestana,    setPestana]    = useState<'contenido' | 'diseno' | 'avanzado'>('contenido');

  const setOpt = (key: keyof QrCodeOptions, val: any) =>
    setOpciones(prev => ({ ...prev, [key]: val }));

  const handleCopiarDataUrl = useCallback(async () => {
    if (!dataUrl) return;
    await navigator.clipboard.writeText(dataUrl);
    setCopiado(true);
    toast.success('Data URL copiado al portapapeles');
    setTimeout(() => setCopiado(false), 2000);
  }, [dataUrl]);

  const handleCopiarValor = useCallback(() => {
    navigator.clipboard.writeText(valor);
    toast.success('Contenido copiado');
  }, [valor]);

  const handleDescargaPng = () => {
    if (!valor) return;
    const nombre = valor.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) || 'qrcode';
    downloadQrPng(valor, `charlie_qr_${nombre}`, { ...opciones, size: Math.max(opciones.size ?? 256, 600) });
    toast.success('Descargando PNG alta resolución...');
  };

  const handleDescargaSvg = () => {
    if (!valor) return;
    const nombre = valor.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) || 'qrcode';
    downloadQrSvg(valor, `charlie_qr_${nombre}`, opciones);
    toast.success('Descargando SVG vectorial...');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={QrCode}
        title="Generador de QR"
        subtitle="Genera códigos QR internamente — sin APIs externas, sin límites"
        actions={onNavigate ? [{ label: '← Herramientas', onClick: () => onNavigate('herramientas') }] : []}
      />

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)', padding: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>

          {/* ── Panel izquierdo: configuración ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Tabs config */}
            <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                {([
                  { id: 'contenido', icon: Type,     label: 'Contenido' },
                  { id: 'diseno',    icon: Palette,  label: 'Diseño'    },
                  { id: 'avanzado',  icon: Settings2, label: 'Avanzado' },
                ] as const).map(t => {
                  const active = pestana === t.id;
                  return (
                    <button key={t.id} onClick={() => setPestana(t.id)} style={{ flex: 1, padding: '14px 8px', border: 'none', borderBottom: `3px solid ${active ? ORANGE : 'transparent'}`, backgroundColor: active ? '#FFF8F5' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '13px', fontWeight: active ? 700 : 500, color: active ? ORANGE : 'var(--m-text-muted)' }}>
                      <t.icon size={14} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ padding: '24px' }}>

                {/* ── Contenido ── */}
                {pestana === 'contenido' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--m-text-secondary)', marginBottom: '8px' }}>Contenido del QR</label>
                      <div style={{ position: 'relative' }}>
                        <textarea
                          value={valor}
                          onChange={e => setValor(e.target.value)}
                          placeholder="URL, texto, vCard, WiFi, email..."
                          rows={4}
                          style={{ width: '100%', padding: '12px 40px 12px 14px', border: `1.5px solid ${valor ? ORANGE : 'var(--m-border)'}`, borderRadius: '12px', fontSize: '14px', color: 'var(--m-text)', resize: 'vertical', outline: 'none', fontFamily: 'monospace', lineHeight: '1.5', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                        />
                        {valor && (
                          <button onClick={handleCopiarValor} title="Copiar contenido" style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--m-text-muted)' }}>
                            <Copy size={15} />
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--m-text-muted)', marginTop: '4px', textAlign: 'right' }}>{valor.length} caracteres</div>
                    </div>

                    {/* Ejemplos rápidos */}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--m-text-secondary)', marginBottom: '10px' }}>Ejemplos rápidos</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {EJEMPLOS.map(e => (
                          <button key={e.label} onClick={() => setValor(e.value)} style={{ padding: '6px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', backgroundColor: valor === e.value ? '#FFF4EC' : 'var(--m-surface-2)', color: valor === e.value ? ORANGE : 'var(--m-text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s', borderColor: valor === e.value ? ORANGE : 'var(--m-border)' }}>
                            {e.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Diseño ── */}
                {pestana === 'diseno' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Colores presets */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--m-text-secondary)', marginBottom: '10px' }}>Presets de color</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {PRESETS.map(p => {
                          const active = opciones.darkColor === p.dark && opciones.lightColor === p.light;
                          return (
                            <button key={p.label} onClick={() => { setOpt('darkColor', p.dark); setOpt('lightColor', p.light); }} style={{ padding: '10px', border: `2px solid ${active ? ORANGE : 'var(--m-border)'}`, borderRadius: '10px', backgroundColor: active ? '#FFF4EC' : 'var(--m-surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E5E7EB', background: `linear-gradient(135deg, ${p.dark} 50%, ${p.light} 50%)`, flexShrink: 0 }} />
                              <span style={{ fontSize: '11px', fontWeight: active ? 700 : 500, color: active ? ORANGE : 'var(--m-text-muted)', textAlign: 'left', lineHeight: 1.2 }}>{p.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Color custom */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <ColorPicker label="Color oscuro" value={opciones.darkColor || '#000000'} onChange={v => setOpt('darkColor', v)} />
                      <ColorPicker label="Color fondo"  value={opciones.lightColor || '#FFFFFF'} onChange={v => setOpt('lightColor', v)} />
                    </div>

                    {/* Tamaño */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--m-text-secondary)', marginBottom: '8px' }}>
                        Tamaño preview: {opciones.size}px
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {SIZES.map(s => (
                          <button key={s} onClick={() => setOpt('size', s)} style={{ padding: '6px 14px', border: `1.5px solid ${opciones.size === s ? ORANGE : 'var(--m-border)'}`, borderRadius: '8px', backgroundColor: opciones.size === s ? '#FFF4EC' : 'var(--m-surface-2)', color: opciones.size === s ? ORANGE : 'var(--m-text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: opciones.size === s ? 700 : 500 }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Avanzado ── */}
                {pestana === 'avanzado' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Error correction */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--m-text-secondary)', marginBottom: '8px' }}>
                        Nivel de corrección de errores
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {CORRECTION_LEVELS.map(l => {
                          const active = opciones.errorCorrection === l.id;
                          return (
                            <button key={l.id} onClick={() => setOpt('errorCorrection', l.id)} style={{ padding: '12px 14px', border: `1.5px solid ${active ? ORANGE : 'var(--m-border)'}`, borderRadius: '10px', backgroundColor: active ? '#FFF4EC' : 'var(--m-surface-2)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s' }}>
                              <span style={{ fontSize: '13px', fontWeight: active ? 700 : 500, color: active ? ORANGE : 'var(--m-text-secondary)' }}>{l.label}</span>
                              <span style={{ fontSize: '11px', color: 'var(--m-text-muted)' }}>{l.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: 'var(--m-info-bg)', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '12px', color: 'var(--m-info)' }}>
                        💡 Usá <strong>H (Máxima)</strong> si vas a superponer el logo de la empresa sobre el QR
                      </div>
                    </div>

                    {/* Margen */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--m-text-secondary)', marginBottom: '8px' }}>
                        Margen: {opciones.margin} módulos
                      </label>
                      <input type="range" min={0} max={6} value={opciones.margin ?? 2} onChange={e => setOpt('margin', Number(e.target.value))}
                        style={{ width: '100%', accentColor: ORANGE }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--m-text-muted)' }}>
                        <span>Sin margen</span><span>Margen máximo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info técnica */}
            <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--m-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Generado con</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { label: 'Motor',        value: 'qrcode@1.5 (local)'        },
                  { label: 'APIs externas', value: 'Ninguna ✅'               },
                  { label: 'Corrección',   value: `${opciones.errorCorrection} — ${CORRECTION_LEVELS.find(l => l.id === opciones.errorCorrection)?.desc}` },
                  { label: 'Tamaño',       value: `${opciones.size}px preview · 600px export` },
                ].map(r => (
                  <div key={r.label} style={{ padding: '8px 12px', backgroundColor: 'var(--m-surface-2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--m-text-muted)', marginBottom: '2px' }}>{r.label}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--m-text-secondary)' }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Panel derecho: preview y descarga ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Preview */}
            <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--m-text-secondary)', alignSelf: 'flex-start' }}>Vista previa</div>

              <div style={{ padding: '16px', backgroundColor: opciones.lightColor || '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {valor ? (
                  <QrCodeDisplay
                    value={valor}
                    options={{ ...opciones, size: Math.min(opciones.size ?? 256, 280) }}
                    onGenerated={setDataUrl}
                  />
                ) : (
                  <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--m-border)', flexDirection: 'column', gap: '8px' }}>
                    <QrCode size={48} strokeWidth={1} />
                    <span style={{ fontSize: '12px' }}>Ingresá un valor</span>
                  </div>
                )}
              </div>

              {/* Dimensiones del QR */}
              {valor && (
                <div style={{ fontSize: '12px', color: 'var(--m-text-muted)' }}>
                  Preview {Math.min(opciones.size ?? 256, 280)}px · Export 600px
                </div>
              )}
            </div>

            {/* Acciones de descarga */}
            <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--m-text-secondary)', marginBottom: '4px' }}>Descargar</div>

              <button onClick={handleDescargaPng} disabled={!valor} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', border: 'none', borderRadius: '10px', backgroundColor: valor ? ORANGE : 'var(--m-border)', color: valor ? '#fff' : 'var(--m-text-muted)', cursor: valor ? 'pointer' : 'default', fontSize: '14px', fontWeight: 700, width: '100%', justifyContent: 'center', transition: 'all 0.15s' }}>
                <Download size={16} /> Descargar PNG (alta res.)
              </button>

              <button onClick={handleDescargaSvg} disabled={!valor} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', border: `1.5px solid ${valor ? ORANGE : 'var(--m-border)'}`, borderRadius: '10px', backgroundColor: 'var(--m-surface)', color: valor ? ORANGE : 'var(--m-text-muted)', cursor: valor ? 'pointer' : 'default', fontSize: '14px', fontWeight: 700, width: '100%', justifyContent: 'center', transition: 'all 0.15s' }}>
                <Download size={16} /> Descargar SVG (vectorial)
              </button>

              <button onClick={handleCopiarDataUrl} disabled={!dataUrl} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', border: '1.5px solid #E5E7EB', borderRadius: '10px', backgroundColor: 'var(--m-surface-2)', color: copiado ? '#059669' : 'var(--m-text-muted)', cursor: dataUrl ? 'pointer' : 'default', fontSize: '13px', fontWeight: 600, width: '100%', justifyContent: 'center', transition: 'all 0.15s' }}>
                {copiado ? <><CheckCircle size={15} /> Copiado</> : <><Copy size={15} /> Copiar como Data URL</>}
              </button>
            </div>

            {/* Tip uso en Etiqueta Emotiva */}
            <div style={{ padding: '16px', backgroundColor: 'var(--m-warning-bg)', borderRadius: '12px', border: '1px solid #FDDCCC' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: ORANGE, marginBottom: '6px' }}>💡 Integrado en Etiqueta Emotiva</div>
              <div style={{ fontSize: '12px', color: 'var(--m-warning-text)', lineHeight: '1.5' }}>
                Los QR de las etiquetas se generan con este mismo motor interno.
                Sin llamadas externas, sin límites de uso.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Color Picker helper ── */
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--m-text-secondary)', marginBottom: '8px' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', backgroundColor: 'var(--m-surface-2)' }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '0', backgroundColor: 'transparent' }} />
        <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--m-text-secondary)', fontWeight: 600 }}>{value.toUpperCase()}</span>
      </div>
    </div>
  );
}