import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronRight, Check, Loader2 } from 'lucide-react';
import type { DrawerShellProps, FieldDef, CustomFieldProps } from './DrawerShell.types';

function getPrimaryColor(): string {
  if (typeof window === 'undefined') return '#FF6835';
  const color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  return color || '#FF6835';
}

type StepState = 'done' | 'active' | 'pending';
function getStepState(i: number, current: number): StepState {
  if (i < current) return 'done';
  if (i === current) return 'active';
  return 'pending';
}

function FieldRenderer({ field, value, onChange, onMultiChange, formData, error, primaryColor }: {
  field: FieldDef; value: unknown; onChange: (v: unknown) => void;
  onMultiChange: (u: Record<string, unknown>) => void;
  formData: Record<string, unknown>; error?: string; primaryColor: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const baseInput: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'all 0.15s', backgroundColor: '#fff',
    border: `1px solid ${error ? '#ef4444' : isFocused ? primaryColor : '#e2e8f0'}`,
    boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : isFocused ? `0 0 0 3px ${primaryColor}1A` : 'none',
  };
  const Label = () => field.label ? (
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
      {field.label}{field.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
  ) : null;
  const Hint = () => field.hint ? <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>{field.hint}</p> : null;
  const Err = () => error ? <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{error}</p> : null;

  if (field.type === 'custom') {
    if (!field.renderComponent) return null;
    return <>{field.renderComponent({ value, onChange, onMultiChange, formData, error, field })}</>;
  }
  if (field.type === 'textarea') return (
    <div><Label />
      <textarea value={String(value || '')} onChange={e => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
        placeholder={field.placeholder} required={field.required} rows={4}
        style={{ ...baseInput, resize: 'vertical', fontFamily: 'inherit' }} />
      <Hint /><Err /></div>
  );
  if (field.type === 'select') return (
    <div><Label />
      <div style={{ position: 'relative' }}>
        <select value={String(value || '')} onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          required={field.required} style={{ ...baseInput, appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}>
          <option value="">Seleccionar...</option>
          {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronRight size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
      </div><Hint /><Err /></div>
  );
  if (field.type === 'toggle') {
    const checked = Boolean(value);
    return (
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div onClick={() => onChange(!checked)} style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: checked ? primaryColor : '#cbd5e1', display: 'flex', alignItems: 'center', padding: '2px', transition: 'all 0.2s', cursor: 'pointer' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', transform: checked ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{field.label}{field.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}</div>
            {field.helpText && <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>{field.helpText}</p>}
          </div>
        </label>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ display: 'none' }} />
        <Err />
      </div>
    );
  }
  if (field.type === 'multicheck') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div><Label />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {field.options?.map(o => {
            const active = selected.includes(o.value);
            return (
              <button key={o.value} type="button"
                onClick={() => onChange(active ? selected.filter(v => v !== o.value) : [...selected, o.value])}
                style={{ padding: '6px 12px', borderRadius: '20px', border: `1px solid ${active ? primaryColor : '#e2e8f0'}`, backgroundColor: active ? `${primaryColor}15` : '#fff', color: active ? primaryColor : '#475569', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', outline: 'none' }}>
                {o.label}
              </button>
            );
          })}
        </div><Hint /><Err /></div>
    );
  }
  if (field.type === 'image') {
    const [preview, setPreview] = useState<string | null>(typeof value === 'string' && value ? value : null);
    const fileRef = useRef<HTMLInputElement>(null);
    return (
      <div><Label />
        <div onClick={() => fileRef.current?.click()}
          style={{ border: '2px dashed #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', backgroundColor: preview ? '#f8fafc' : '#fff', transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = primaryColor; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0]; if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => { const r = reader.result as string; setPreview(r); onChange(r); };
              reader.readAsDataURL(file);
            }} />
          {preview ? (
            <div><img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '8px' }} />
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Click para cambiar</p></div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 4px', fontWeight: 600 }}>Arrastra una imagen o click para seleccionar</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{field.hint || 'JPG, PNG hasta 10MB'}</p>
            </div>
          )}
        </div><Err /></div>
    );
  }
  return (
    <div><Label />
      <input type={field.type} value={String(value || '')} onChange={e => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
        placeholder={field.placeholder} required={field.required} style={baseInput} />
      <Hint /><Err /></div>
  );
}

export function DrawerShell({ open, onClose, onSave, title, icon: Icon, sheets, initialData = {}, loading = false, labels = {} }: DrawerShellProps) {
  const L = { cancel: labels.cancel ?? 'Cancelar', prev: labels.prev ?? '← Ant.', next: labels.next ?? 'Sig. →', save: labels.save ?? 'Guardar', saving: labels.saving ?? 'Guardando...', pageOf: labels.pageOf ?? 'Página {current} de {total}' };
  const [currentSheet, setCurrentSheet] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#FF6835');
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPrimaryColor(getPrimaryColor()); }, []);
  useEffect(() => {
    if (open) { setCurrentSheet(0); setFormData(initialData); setErrors({}); setSaveError(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  useEffect(() => {
    if (!open || !drawerRef.current) return;
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    };
    document.addEventListener('keydown', onTab); first?.focus();
    return () => document.removeEventListener('keydown', onTab);
  }, [open, currentSheet]);

  const updateField = useCallback((id: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
  }, [errors]);

  const validateSheet = useCallback((index: number): boolean => {
    const sheet = sheets[index]; if (!sheet) return true;
    const newErrors: Record<string, string> = {};
    sheet.fields.forEach(f => {
      if (f.required) {
        const v = formData[f.id];
        if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0))
          newErrors[f.id] = `${f.label ?? f.id} es requerido`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [sheets, formData]);

  const goToSheet = useCallback((index: number) => {
    if (index < 0 || index >= sheets.length) return;
    if (index > currentSheet && !validateSheet(currentSheet)) return;
    setCurrentSheet(index);
  }, [currentSheet, sheets, validateSheet]);

  const handleSave = useCallback(async () => {
    if (!validateSheet(sheets.length - 1)) { setCurrentSheet(sheets.length - 1); return; }
    setSaving(true); setSaveError(null);
    try { await onSave(formData); onClose(); }
    catch (err) { setSaveError(err instanceof Error ? err.message : 'Error al guardar'); }
    finally { setSaving(false); }
  }, [formData, onSave, onClose, sheets, validateSheet]);

  if (!open) return null;

  const sheet = sheets[currentSheet];
  const isFirst = currentSheet === 0;
  const isLast = currentSheet === sheets.length - 1;
  const pageLabel = L.pageOf.replace('{current}', String(currentSheet + 1)).replace('{total}', String(sheets.length));

  const byRow: Record<string, FieldDef[]> = {};
  const standalone: FieldDef[] = [];
  sheet.fields.forEach(f => { if (f.row) { (byRow[f.row] ??= []).push(f); } else { standalone.push(f); } });

  const btnBase: React.CSSProperties = { padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '4px' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, right: '500px', backgroundColor: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)', zIndex: 9998, animation: 'fadeIn 0.3s ease' }} />
      <div ref={drawerRef} style={{ position: 'fixed', top: 0, right: 0, width: '500px', maxWidth: '100vw', height: '100vh', backgroundColor: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          {Icon && <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={20} color={primaryColor} /></div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>{title}</h2>
              {isFirst && <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', backgroundColor: '#FEE2E2', padding: '2px 6px', borderRadius: '4px' }}>* Obligatorios en pág. 1</span>}
            </div>
            {sheet.subtitle && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>{sheet.subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><X size={16} color="#475569" /></button>
        </div>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0, overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sheets.map((s, i) => {
              const state = getStepState(i, currentSheet);
              const clickable = i <= currentSheet + 1;
              return (
                <React.Fragment key={s.id}>
                  <button type="button" onClick={() => goToSheet(i)} disabled={!clickable}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', backgroundColor: 'transparent', cursor: clickable ? 'pointer' : 'not-allowed', padding: '4px 0', opacity: clickable ? 1 : 0.5 }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, backgroundColor: state === 'done' ? '#ECFDF5' : state === 'active' ? primaryColor : '#f1f5f9', color: state === 'done' ? '#059669' : state === 'active' ? '#fff' : '#94a3b8' }}>
                      {state === 'done' ? <Check size={12} /> : i + 1}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: state === 'active' ? 700 : 500, color: state === 'active' ? '#111827' : state === 'done' ? '#059669' : '#94a3b8', whiteSpace: 'nowrap' }}>{s.title}</span>
                  </button>
                  {i < sheets.length - 1 && <div style={{ width: '16px', height: '1px', backgroundColor: '#e2e8f0', flexShrink: 0 }} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {Object.entries(byRow).map(([rowId, rowFields]) => (
            <div key={rowId} style={{ display: 'flex', gap: '16px' }}>
              {rowFields.map(f => (
                <div key={f.id} style={{ flex: 1 }}>
                  <FieldRenderer field={f} value={formData[f.id]} onChange={v => updateField(f.id, v)} onMultiChange={u => setFormData(prev => ({ ...prev, ...u }))} formData={formData} error={errors[f.id]} primaryColor={primaryColor} />
                </div>
              ))}
            </div>
          ))}
          {standalone.map(f => (
            <FieldRenderer key={f.id} field={f} value={formData[f.id]} onChange={v => updateField(f.id, v)} onMultiChange={u => setFormData(prev => ({ ...prev, ...u }))} formData={formData} error={errors[f.id]} primaryColor={primaryColor} />
          ))}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', position: 'relative' }}>
          <button type="button" onClick={onClose} style={{ ...btnBase, border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#475569' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff'; }}>
            {L.cancel}
          </button>
          {!isFirst && (
            <button type="button" onClick={() => goToSheet(currentSheet - 1)} style={{ ...btnBase, border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#475569' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff'; }}>
              {L.prev}
            </button>
          )}
          <div style={{ flex: 1, textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>{pageLabel}</div>
          {!isLast && (
            <button type="button" onClick={() => goToSheet(currentSheet + 1)} style={{ ...btnBase, border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#475569' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff'; }}>
              {L.next}
            </button>
          )}
          {isLast && (
            <button type="button" onClick={handleSave} disabled={saving || loading}
              style={{ ...btnBase, border: 'none', backgroundColor: saving || loading ? '#cbd5e1' : primaryColor, color: '#fff', fontWeight: 700, cursor: saving || loading ? 'not-allowed' : 'pointer', padding: '8px 20px' }}>
              {saving || loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {L.saving}</> : <>{L.save}</>}
            </button>
          )}
          {saveError && (
            <div style={{ position: 'absolute', bottom: '60px', left: '24px', right: '24px', padding: '10px 14px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid #FECACA' }}>
              ⚠ {saveError}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
