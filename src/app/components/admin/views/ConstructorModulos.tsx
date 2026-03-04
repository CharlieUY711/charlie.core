import React, { useState, useCallback } from "react";
import type { MainSection } from "../../../AdminDashboard";

/* ─── Design tokens (idénticos al ConstructorView existente) ─── */
const C = {
  orange:      '#FF6835', orangeHover: '#F05520', orange10: '#FFF4F0', orange20: '#FFE8DF',
  gray50:      '#F8FAFC', gray100: '#F1F5F9', gray200: '#E2E8F0', gray300: '#CBD5E1',
  gray400:     '#94A3B8', gray500: '#64748B', gray600: '#475569', gray700: '#334155',
  gray900:     '#0F172A', white: '#FFFFFF',
  green:       '#10B981', green10: '#F0FDF4',
  amber:       '#F59E0B', amber10: '#FFFBEB',
  red:         '#EF4444', red10: '#FEF2F2',
  blue:        '#3B82F6', blue10: '#EFF6FF',
  purple:      '#8B5CF6', purple10: '#F5F3FF',
  teal:        '#0D9488', teal10: '#F0FDFA',
  code:        '#0D1117',
};

/* ─── Grupos funcionales (CAP_01) ─── */
const GRUPOS = [
  { id: 'core',          label: 'Core & Infraestructura', color: C.gray600   },
  { id: 'transaccional', label: 'Transaccional',           color: '#F59E0B'  },
  { id: 'logistica',     label: 'Operaciones & Logística', color: '#10B981'  },
  { id: 'erp',           label: 'ERP & CRM',               color: '#3B82F6'  },
  { id: 'marketing',     label: 'Marketing',               color: '#EC4899'  },
  { id: 'herramientas',  label: 'Herramientas',            color: C.teal     },
  { id: 'integraciones', label: 'Integraciones & API',     color: '#8B5CF6'  },
];

/* ─── Tipos de campo para el schema ─── */
const FIELD_TYPES = ['text','varchar','integer','bigint','boolean','uuid','timestamptz','jsonb','numeric','date'];

/* ─── Operaciones disponibles ─── */
const OPERACIONES = [
  { id: 'nuevo',    label: 'Módulo nuevo',           icon: '✦', desc: 'Genera estructura completa desde cero' },
  { id: 'config',   label: 'Actualizar config',      icon: '⚙', desc: 'Edita module.config.ts de un módulo existente' },
  { id: 'reparar',  label: 'Reparar criterios',      icon: '🔧', desc: 'Corrige C4–C8 detectados como rotos en Checklist' },
  { id: 'schema',   label: 'Editar schema.sql',      icon: '🗄', desc: 'Agrega o modifica campos en la tabla del módulo' },
  { id: 'tokens',   label: 'Regenerar tokens.css',   icon: '🎨', desc: 'Recrea el archivo de tokens CSS del módulo' },
];

/* ─── Criterios (CAP_03) ─── */
const CRITERIOS = [
  { id:'C1', label:'Vista (UI)',         auto:true,  desc:'Componente React exportado + isReal en manifest' },
  { id:'C2', label:'Backend (DB)',       auto:true,  desc:'hasSupabase en manifest + tabla accesible' },
  { id:'C3', label:'Service layer',      auto:true,  desc:'Existe {id}Api.ts con getAll/create/update/delete' },
  { id:'C4', label:'module.config.ts',  auto:true,  desc:'Existe src/modules/{id}/module.config.ts' },
  { id:'C5', label:'Sin hardcode',       auto:true,  desc:'Cero #HEX ni rgb() en el viewFile' },
  { id:'C6', label:'tokens.css',         auto:true,  desc:'Existe ui/tokens.css con fallbacks --m-*' },
  { id:'C7', label:'Party Model',        auto:false, desc:'Usa organizaciones + roles_contextuales, no tablas directas' },
  { id:'C8', label:'Data Zero',          auto:false, desc:'Usa useTable() con nombre semántico, no supabase.from() hardcodeado' },
];

/* ─── Template generators ─── */
function genModuleConfig(f) {
  const criteriosArr = CRITERIOS.map(c => `    { id: '${c.id}', label: '${c.label}', status: 'pending' }`).join(',\n');
  return `// module.config.ts — generado por Constructor v1.0
// ${new Date().toISOString().split('T')[0]}

export const moduleConfig = {
  id:           '${f.id}',
  nombre:       '${f.nombre}',
  familia:      '${f.grupo}',
  version:      '0.1.0',
  descripcion:  '${f.descripcion}',
  hasSupabase:  ${f.hasDB},
  isReal:       true,
  criterios: [
${criteriosArr}
  ],
  dependencias: [${f.dependencias ? f.dependencias.split(',').map(d=>`'${d.trim()}'`).join(', ') : ''}],
} as const;
`;
}

function genTokensCss(f) {
  const primary = f.colorPrimario || '#FF6835';
  return `/* tokens.css — ${f.id}
   Fallbacks para CSS Custom Properties.
   El Orquestador sobreescribe con los tokens del tenant. */

:root {
  /* Colores del módulo */
  --m-color-primary:     ${primary};
  --m-color-primary-10:  ${primary}1A;
  --m-color-secondary:   #111111;
  --m-color-bg:          #FFFFFF;
  --m-color-surface:     #F8FAFC;
  --m-color-border:      #E2E8F0;
  --m-color-text:        #0F172A;
  --m-color-text-muted:  #64748B;
  --m-color-success:     #10B981;
  --m-color-warning:     #F59E0B;
  --m-color-error:       #EF4444;

  /* Tipografía */
  --m-font-sans:         system-ui, -apple-system, sans-serif;
  --m-font-mono:         'SF Mono', 'Fira Mono', monospace;
  --m-font-size-xs:      0.68rem;
  --m-font-size-sm:      0.78rem;
  --m-font-size-base:    0.88rem;
  --m-font-size-lg:      1rem;
  --m-font-size-xl:      1.125rem;

  /* Espaciado */
  --m-space-1:  4px;
  --m-space-2:  8px;
  --m-space-3:  12px;
  --m-space-4:  16px;
  --m-space-6:  24px;
  --m-space-8:  32px;

  /* Bordes */
  --m-radius-sm:   4px;
  --m-radius-md:   8px;
  --m-radius-lg:   12px;
  --m-radius-full: 9999px;
  --m-border:      1px solid var(--m-color-border);

  /* Sombras */
  --m-shadow-sm:  0 1px 2px rgba(0,0,0,0.05);
  --m-shadow-md:  0 4px 12px rgba(0,0,0,0.08);
  --m-shadow-lg:  0 8px 32px rgba(0,0,0,0.12);
}
`;
}

function genSchemaSql(f) {
  const campos = f.campos || [];
  const lines = campos.map(c =>
    `  ${c.nombre.padEnd(24)} ${c.tipo}${c.notNull ? ' NOT NULL' : ''}${c.default ? ` DEFAULT ${c.default}` : ''},`
  );
  return `-- schema.sql — ${f.id}
-- Ejecutar con: supabase db push
-- Idempotente: usa IF NOT EXISTS

CREATE TABLE IF NOT EXISTS ${f.tabla || f.id.replace(/-/g,'_')} (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   text NOT NULL,
${lines.join('\n')}
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  activo      boolean NOT NULL DEFAULT true
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_${(f.tabla || f.id.replace(/-/g,'_'))}_tenant
  ON ${f.tabla || f.id.replace(/-/g,'_')} (tenant_id);

-- RLS
ALTER TABLE ${f.tabla || f.id.replace(/-/g,'_')} ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "${f.id}_tenant_isolation"
  ON ${f.tabla || f.id.replace(/-/g,'_')}
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_${(f.tabla || f.id.replace(/-/g,'_'))}_updated_at
  ON ${f.tabla || f.id.replace(/-/g,'_')};
CREATE TRIGGER trg_${(f.tabla || f.id.replace(/-/g,'_'))}_updated_at
  BEFORE UPDATE ON ${f.tabla || f.id.replace(/-/g,'_')}
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`;
}

function genServiceApi(f) {
  const t = f.tabla || f.id.replace(/-/g,'_');
  return `// ${f.id}Api.ts — service layer
// Usa useTable() — nunca supabase.from() directo (Data Zero)

import { useTable } from '@/hooks/useTable';
import type { ${f.nombre.replace(/\s/g,'')} } from '../types';

const TABLE = '${f.id}'; // nombre semántico → Conjuntos resuelve la tabla real

export function use${f.nombre.replace(/\s/g,'')}Api() {
  const table = useTable(TABLE);

  async function getAll(filters?: Partial<${f.nombre.replace(/\s/g,'')}>) {
    return table.select('*', filters);
  }

  async function getById(id: string) {
    return table.select('*', { id }).single();
  }

  async function create(payload: Omit<${f.nombre.replace(/\s/g,'')} , 'id' | 'created_at' | 'updated_at'>) {
    return table.insert(payload);
  }

  async function update(id: string, payload: Partial<${f.nombre.replace(/\s/g,'')}>) {
    return table.update(payload, { id });
  }

  async function remove(id: string) {
    // ⚠ Todo delete debe pasar por Eliminación Controlada cuando esté disponible
    return table.delete({ id });
  }

  return { getAll, getById, create, update, remove };
}
`;
}

function genManifestEntry(f) {
  return `// Agregar en moduleManifest.ts:
{
  section:     '${f.id}',
  label:       '${f.nombre}',
  viewFile:    'src/modules/${f.id}/ui/views/${f.nombre.replace(/\s/g,'')}View.tsx',
  component:   lazy(() => import('@/modules/${f.id}/ui/views/${f.nombre.replace(/\s/g,'')}View')),
  isReal:      ${!!f.hasUI},
  hasSupabase: ${!!f.hasDB},
  grupo:       '${f.grupo}',
  pendingImport: false,
  notes:       '${f.descripcion}',
},`;
}

/* ─── Micro componentes ─── */
function Btn({ children, onClick, variant='primary', disabled=false, small=false }) {
  const base = {
    display:'inline-flex', alignItems:'center', gap:'6px', borderRadius:'6px',
    fontWeight:'600', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: small ? '0.72rem' : '0.82rem',
    padding: small ? '5px 12px' : '8px 18px', border:'none', transition:'all 0.15s',
    opacity: disabled ? 0.5 : 1,
  };
  const styles = {
    primary: { backgroundColor: C.orange,  color: C.white  },
    ghost:   { backgroundColor: 'transparent', color: C.gray600, border:`1px solid ${C.gray200}`, backgroundColor: C.white },
    danger:  { backgroundColor: C.red10, color: C.red, border:`1px solid ${C.red}30` },
    success: { backgroundColor: C.green10, color: C.green, border:`1px solid ${C.green}30` },
  };
  return <button onClick={disabled ? undefined : onClick} style={{...base,...styles[variant]}}>{children}</button>;
}

function Tag({ label, color }) {
  return (
    <span style={{ fontSize:'0.64rem', fontWeight:'600', padding:'2px 7px', borderRadius:'4px',
      backgroundColor:`${color}18`, color, border:`1px solid ${color}30`, whiteSpace:'nowrap' }}>
      {label}
    </span>
  );
}

function Input({ label, value, onChange, placeholder, hint, mono=false, required=false }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
      {label && <label style={{ fontSize:'0.72rem', fontWeight:'500', color:C.gray600 }}>
        {label}{required && <span style={{color:C.orange}}> *</span>}
      </label>}
      <input
        value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{ padding:'7px 10px', borderRadius:'6px', border:`1px solid ${C.gray200}`,
          fontSize:'0.82rem', fontFamily: mono ? 'monospace' : 'inherit',
          outline:'none', color:C.gray900, backgroundColor:C.white, width:'100%', boxSizing:'border-box' }}
      />
      {hint && <span style={{ fontSize:'0.67rem', color:C.gray400, fontFamily:'monospace' }}>{hint}</span>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
      {label && <label style={{ fontSize:'0.72rem', fontWeight:'500', color:C.gray600 }}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ padding:'7px 10px', borderRadius:'6px', border:`1px solid ${C.gray200}`,
          fontSize:'0.82rem', color:C.gray900, backgroundColor:C.white, width:'100%', boxSizing:'border-box' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, value, onChange, hint }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${C.gray100}` }}>
      <div>
        <p style={{ margin:0, fontSize:'0.78rem', fontWeight:'500', color:C.gray700 }}>{label}</p>
        {hint && <p style={{ margin:'1px 0 0', fontSize:'0.68rem', color:C.gray400 }}>{hint}</p>}
      </div>
      <button onClick={()=>onChange(!value)} style={{
        width:'32px', height:'18px', borderRadius:'9px', border:'none', padding:0,
        backgroundColor: value ? C.orange : C.gray300, position:'relative', cursor:'pointer', transition:'background-color 0.15s', flexShrink:0,
      }}>
        <span style={{ display:'block', width:'12px', height:'12px', borderRadius:'50%',
          backgroundColor:C.white, position:'absolute', top:'3px',
          left: value ? '17px' : '3px', transition:'left 0.15s', boxShadow:'0 1px 2px rgba(0,0,0,0.15)' }} />
      </button>
    </div>
  );
}

function CodeBlock({ content, filename, onCopy, copied }) {
  return (
    <div style={{ borderRadius:'8px', border:`1px solid ${C.gray200}`, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 14px', backgroundColor:C.gray900, borderBottom:`1px solid #1e293b` }}>
        <span style={{ fontSize:'0.72rem', fontFamily:'monospace', color:'#94A3B8' }}>{filename}</span>
        <button onClick={onCopy} style={{ display:'inline-flex', alignItems:'center', gap:'4px',
          fontSize:'0.68rem', padding:'3px 8px', borderRadius:'4px',
          backgroundColor: copied ? '#10B98120' : '#ffffff15', border: copied ? `1px solid ${C.green}40` : '1px solid #ffffff20',
          color: copied ? C.green : '#94A3B8', cursor:'pointer', transition:'all 0.15s', fontWeight:'600' }}>
          {copied ? '✓ Copiado' : '⎘ Copiar'}
        </button>
      </div>
      <div style={{ backgroundColor:C.code, padding:'14px 16px', overflowX:'auto', maxHeight:'260px', overflowY:'auto' }}>
        <pre style={{ margin:0, fontSize:'0.72rem', lineHeight:'1.7', color:'#E2E8F0', fontFamily:'"SF Mono","Fira Mono",monospace', whiteSpace:'pre' }}>
          {content}
        </pre>
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
export function ConstructorModulos(_props: { onNavigate?: (s: MainSection) => void }) {
  const [operacion, setOperacion] = useState(null);
  const [step, setStep] = useState(1); // 1=identidad, 2=estructura, 3=campos, 4=output
  const [copiedFiles, setCopiedFiles] = useState({});

  /* Form state */
  const [form, setForm] = useState({
    id: '', nombre: '', descripcion: '', grupo: 'core',
    hasUI: true, hasDB: true, hasEdge: false,
    tabla: '', colorPrimario: '#FF6835', dependencias: '',
    campos: [],
    // reparar
    modIdReparar: '', criteriosRoto: new Set(),
    // schema
    modIdSchema: '',
  });

  const set = (key, val) => setForm(f => ({...f, [key]: val}));

  /* Campos helpers */
  const addCampo = () => set('campos', [...form.campos, { nombre:'', tipo:'text', notNull:false, default:'' }]);
  const updCampo = (i, k, v) => set('campos', form.campos.map((c,idx) => idx===i ? {...c,[k]:v} : c));
  const delCampo = (i) => set('campos', form.campos.filter((_,idx)=>idx!==i));

  /* Copy helper */
  const copyFile = useCallback((key, content) => {
    try { navigator.clipboard.writeText(content); } catch {}
    setCopiedFiles(p => ({...p,[key]:true}));
    setTimeout(() => setCopiedFiles(p => ({...p,[key]:false})), 2200);
  }, []);

  const idValido = form.id.match(/^[a-z][a-z0-9-]*$/);
  const canNext1 = form.id && form.nombre && idValido;
  const canNext2 = true;

  const outputFiles = form.id && form.nombre ? {
    config:    genModuleConfig(form),
    tokens:    genTokensCss(form),
    schema:    form.hasDB ? genSchemaSql(form) : null,
    service:   genServiceApi(form),
    manifest:  genManifestEntry(form),
  } : null;

  /* ─── Pantalla de selección de operación ─── */
  if (!operacion) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', backgroundColor:C.gray50 }}>

      {/* Top bar */}
      <div style={{ height:'48px', flexShrink:0, backgroundColor:C.white, borderBottom:`1px solid ${C.gray200}`,
        display:'flex', alignItems:'center', padding:'0 24px', gap:'12px' }}>
        <span style={{ fontSize:'1rem' }}>🔨</span>
        <span style={{ fontSize:'0.88rem', fontWeight:'600', color:C.gray900 }}>Constructor</span>
        <span style={{ width:'1px', height:'16px', backgroundColor:C.gray200 }} />
        <span style={{ fontSize:'0.75rem', color:C.gray400 }}>Módulos</span>
      </div>

      {/* Selector de operación */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px' }}>
        <div style={{ maxWidth:'640px', width:'100%' }}>

          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <h1 style={{ margin:'0 0 8px', fontSize:'1.25rem', fontWeight:'700', color:C.gray900 }}>
              Constructor de Módulos
            </h1>
            <p style={{ margin:0, fontSize:'0.82rem', color:C.gray400 }}>
              Generá, actualizá o reparás cualquier módulo Charlie con el estándar correcto
            </p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {OPERACIONES.map(op => (
              <button key={op.id} onClick={()=>{ setOperacion(op.id); setStep(1); }}
                style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px',
                  borderRadius:'10px', border:`1px solid ${C.gray200}`, backgroundColor:C.white,
                  cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                  boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.orange; e.currentTarget.style.boxShadow=`0 0 0 2px ${C.orange}18`; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.gray200; e.currentTarget.style.boxShadow='0 1px 2px rgba(0,0,0,0.04)'; }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'8px', backgroundColor:C.orange10,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.1rem' }}>
                  {op.icon}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:'0 0 2px', fontSize:'0.85rem', fontWeight:'600', color:C.gray900 }}>{op.label}</p>
                  <p style={{ margin:0, fontSize:'0.75rem', color:C.gray400 }}>{op.desc}</p>
                </div>
                <span style={{ color:C.gray300, fontSize:'1rem' }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── Operaciones especiales (reparar / schema / tokens) ─── */
  if (operacion === 'reparar') return (
    <ReparadorView form={form} set={set} onBack={()=>setOperacion(null)} copyFile={copyFile} copiedFiles={copiedFiles} />
  );
  if (operacion === 'tokens') return (
    <TokensView form={form} set={set} onBack={()=>setOperacion(null)} copyFile={copyFile} copiedFiles={copiedFiles} />
  );
  if (operacion === 'schema') return (
    <SchemaView form={form} set={set} onBack={()=>setOperacion(null)} copyFile={copyFile} copiedFiles={copiedFiles}
      addCampo={addCampo} updCampo={updCampo} delCampo={delCampo} />
  );
  if (operacion === 'config') return (
    <ConfigView form={form} set={set} onBack={()=>setOperacion(null)} copyFile={copyFile} copiedFiles={copiedFiles} outputFiles={outputFiles} />
  );

  /* ─── Flujo "Módulo nuevo" — wizard 4 pasos ─── */
  const opLabel = OPERACIONES.find(o=>o.id===operacion)?.label ?? '';
  const STEPS = ['Identidad','Estructura','Campos','Output'];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', backgroundColor:C.gray50 }}>

      {/* Top bar */}
      <div style={{ height:'48px', flexShrink:0, backgroundColor:C.white, borderBottom:`1px solid ${C.gray200}`,
        display:'flex', alignItems:'center', padding:'0 24px', gap:'12px' }}>
        <span style={{ fontSize:'1rem' }}>🔨</span>
        <span style={{ fontSize:'0.88rem', fontWeight:'600', color:C.gray900 }}>Constructor</span>
        <span style={{ width:'1px', height:'16px', backgroundColor:C.gray200 }} />
        <span style={{ fontSize:'0.75rem', color:C.gray400 }}>{opLabel}</span>
        {form.id && <Tag label={form.id} color={C.orange} />}
        <div style={{ flex:1 }} />
        <Btn variant="ghost" small onClick={()=>{ setOperacion(null); setStep(1); setForm(f=>({...f,id:'',nombre:'',descripcion:'',campos:[]})); }}>
          ← Volver
        </Btn>
      </div>

      {/* Step bar */}
      <div style={{ height:'48px', backgroundColor:C.white, borderBottom:`1px solid ${C.gray200}`,
        display:'flex', alignItems:'center', justifyContent:'center', gap:0, flexShrink:0 }}>
        {STEPS.map((s,i) => {
          const done = step > i+1, active = step === i+1;
          return (
            <span key={s} style={{ display:'flex', alignItems:'center', gap:0 }}>
              <button onClick={()=>{ if(step>i+1 || (i===0) || (i===1&&canNext1) || (i===2&&canNext1)) setStep(i+1); }}
                style={{ display:'flex', alignItems:'center', gap:'8px', padding:'0 4px', background:'none', border:'none', cursor:'pointer' }}>
                <div style={{ width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  backgroundColor: done||active ? C.orange : 'transparent',
                  border:`1.5px solid ${done||active ? C.orange : C.gray300}` }}>
                  {done
                    ? <span style={{fontSize:'0.65rem',color:C.white,fontWeight:'700'}}>✓</span>
                    : <span style={{ fontSize:'0.65rem', fontWeight:'700', color: active ? C.white : C.gray400 }}>{i+1}</span>}
                </div>
                <span style={{ fontSize:'0.78rem', fontWeight: active?'600':'400',
                  color: active ? C.gray900 : done ? C.gray500 : C.gray400 }}>{s}</span>
              </button>
              {i < STEPS.length-1 && (
                <div style={{ width:'40px', height:'1px', backgroundColor: step>i+1 ? C.orange : C.gray200, margin:'0 4px' }} />
              )}
            </span>
          );
        })}
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
        <div style={{ maxWidth:'680px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* ── Step 1: Identidad ── */}
          {step===1 && <>
            <Card title="Identidad del módulo">
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <Input label="ID (kebab-case)" required value={form.id}
                    onChange={v=>{ set('id',v.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')); set('tabla',''); }}
                    placeholder="ej: metodos-envio" hint="→ carpeta, section, Conjuntos"
                    mono />
                  <Input label="Nombre visible" required value={form.nombre}
                    onChange={v=>set('nombre',v)} placeholder="ej: Métodos de Envío" />
                </div>
                {form.id && !idValido && (
                  <div style={{ fontSize:'0.72rem', color:C.red, padding:'6px 10px', backgroundColor:C.red10, borderRadius:'5px' }}>
                    El ID solo puede contener letras minúsculas, números y guiones. Debe empezar por letra.
                  </div>
                )}
                <Input label="Descripción" value={form.descripcion}
                  onChange={v=>set('descripcion',v)} placeholder="ej: Gestión de transportistas y tarifas de envío" />
                <Select label="Grupo funcional" value={form.grupo} onChange={v=>set('grupo',v)}
                  options={GRUPOS.map(g=>({ value:g.id, label:g.label }))} />
                <Input label="Dependencias (opcional)" value={form.dependencias}
                  onChange={v=>set('dependencias',v)} placeholder="ej: auth-registro, organizaciones"
                  hint="IDs separados por coma" />
              </div>
            </Card>

            {/* Preview path */}
            {form.id && (
              <div style={{ backgroundColor:C.code, borderRadius:'8px', padding:'14px 16px', fontFamily:'monospace', fontSize:'0.72rem', lineHeight:'1.9' }}>
                <p style={{ margin:'0 0 6px', color:'#4B5563', fontSize:'0.65rem' }}># Estructura que se generará</p>
                {[
                  `src/modules/${form.id||'{id}'}/`,
                  `├── module.config.ts`,
                  `├── ui/`,
                  `│   ├── views/${(form.nombre||'{Nombre}').replace(/\s/g,'')}View.tsx`,
                  `│   └── tokens.css`,
                  `├── service/`,
                  `│   └── ${form.id||'{id}'}Api.ts`,
                  `├── types/`,
                  `│   └── index.ts`,
                  ...(form.hasEdge ? [`├── edge-function/`, `│   ├── index.ts`, `│   └── schema.sql`] : [`└── edge-function/`, `    └── schema.sql`]),
                ].map((l,i) => (
                  <p key={i} style={{ margin:0, color: l.startsWith('src') ? C.orange : l.includes('module.config') ? '#7EE787' : l.includes('tokens.css') ? '#F59E0B' : l.includes('Api.ts') ? '#79C0FF' : '#8B949E' }}>{l}</p>
                ))}
              </div>
            )}

            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <Btn onClick={()=>setStep(2)} disabled={!canNext1}>Siguiente →</Btn>
            </div>
          </>}

          {/* ── Step 2: Estructura ── */}
          {step===2 && <>
            <Card title="Contratos del módulo">
              <div style={{ display:'flex', flexDirection:'column' }}>
                <Toggle label="Tiene vista (UI)" hint="Genera View.tsx — C1" value={form.hasUI} onChange={v=>set('hasUI',v)} />
                <Toggle label="Tiene backend (DB)" hint="Genera schema.sql + service — C2 y C3" value={form.hasDB} onChange={v=>set('hasDB',v)} />
                <Toggle label="Tiene Edge Function" hint="Genera edge-function/index.ts con Deno + Hono" value={form.hasEdge} onChange={v=>set('hasEdge',v)} />
              </div>
            </Card>

            <Card title="Tabla de base de datos">
              <Input label="Nombre de tabla SQL" value={form.tabla}
                onChange={v=>set('tabla',v.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,''))}
                placeholder={form.id.replace(/-/g,'_') || 'nombre_tabla'}
                hint={`→ CREATE TABLE IF NOT EXISTS ${form.tabla || form.id.replace(/-/g,'_')}`}
                mono />
              <p style={{ margin:'8px 0 0', fontSize:'0.68rem', color:C.gray400 }}>
                Si el cliente tiene una tabla con otro nombre, Conjuntos resuelve el mapeo — el módulo siempre usa el nombre semántico.
              </p>
            </Card>

            <Card title="Theming">
              <div style={{ display:'flex', alignItems:'center', gap:'14px', padding:'10px 0' }}>
                <div style={{ position:'relative', width:'32px', height:'32px', borderRadius:'8px', overflow:'hidden',
                  border:`1px solid ${C.gray200}`, backgroundColor:form.colorPrimario }}>
                  <input type="color" value={form.colorPrimario} onChange={e=>set('colorPrimario',e.target.value)}
                    style={{ opacity:0, position:'absolute', inset:0, width:'100%', height:'100%', cursor:'pointer' }} />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:'0.78rem', fontWeight:'500', color:C.gray700 }}>Color primario del módulo</p>
                  <p style={{ margin:'1px 0 0', fontSize:'0.68rem', color:C.gray400 }}>Fallback en tokens.css — el tenant lo sobreescribe</p>
                </div>
                <span style={{ fontSize:'0.72rem', fontFamily:'monospace', color:C.gray500, backgroundColor:C.gray50,
                  padding:'2px 8px', borderRadius:'4px', border:`1px solid ${C.gray200}` }}>{form.colorPrimario}</span>
              </div>
            </Card>

            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <Btn variant="ghost" onClick={()=>setStep(1)}>← Volver</Btn>
              <Btn onClick={()=>setStep(3)}>Siguiente →</Btn>
            </div>
          </>}

          {/* ── Step 3: Campos ── */}
          {step===3 && <>
            <Card title={`Campos de ${form.tabla || form.id.replace(/-/g,'_')}`}
              action={<Btn small variant="ghost" onClick={addCampo}>+ Campo</Btn>}>
              <p style={{ margin:'0 0 12px', fontSize:'0.75rem', color:C.gray400 }}>
                Los campos <code style={{fontSize:'0.7rem',backgroundColor:C.gray100,padding:'1px 5px',borderRadius:'3px'}}>id</code>,{' '}
                <code style={{fontSize:'0.7rem',backgroundColor:C.gray100,padding:'1px 5px',borderRadius:'3px'}}>tenant_id</code>,{' '}
                <code style={{fontSize:'0.7rem',backgroundColor:C.gray100,padding:'1px 5px',borderRadius:'3px'}}>created_at</code>,{' '}
                <code style={{fontSize:'0.7rem',backgroundColor:C.gray100,padding:'1px 5px',borderRadius:'3px'}}>updated_at</code> y{' '}
                <code style={{fontSize:'0.7rem',backgroundColor:C.gray100,padding:'1px 5px',borderRadius:'3px'}}>activo</code> se agregan automáticamente.
              </p>

              {form.campos.length === 0 && (
                <div style={{ padding:'24px', textAlign:'center', border:`1.5px dashed ${C.gray200}`, borderRadius:'8px' }}>
                  <p style={{ margin:'0 0 8px', fontSize:'0.78rem', color:C.gray400 }}>Sin campos personalizados aún</p>
                  <Btn small onClick={addCampo}>+ Agregar primer campo</Btn>
                </div>
              )}

              {form.campos.map((c,i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr auto auto auto', gap:'8px',
                  alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${C.gray100}` }}>
                  <input value={c.nombre} onChange={e=>updCampo(i,'nombre',e.target.value.toLowerCase().replace(/\s+/g,'_'))}
                    placeholder="nombre_campo" style={{ padding:'6px 9px', borderRadius:'5px', border:`1px solid ${C.gray200}`,
                      fontSize:'0.78rem', fontFamily:'monospace', color:C.gray900, outline:'none' }} />
                  <select value={c.tipo} onChange={e=>updCampo(i,'tipo',e.target.value)}
                    style={{ padding:'6px 9px', borderRadius:'5px', border:`1px solid ${C.gray200}`,
                      fontSize:'0.78rem', color:C.gray900, backgroundColor:C.white }}>
                    {FIELD_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                  <label style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'0.72rem', color:C.gray500, cursor:'pointer', whiteSpace:'nowrap' }}>
                    <input type="checkbox" checked={c.notNull} onChange={e=>updCampo(i,'notNull',e.target.checked)} /> NOT NULL
                  </label>
                  <input value={c.default} onChange={e=>updCampo(i,'default',e.target.value)}
                    placeholder="DEFAULT" style={{ padding:'6px 9px', borderRadius:'5px', border:`1px solid ${C.gray200}`,
                      fontSize:'0.72rem', fontFamily:'monospace', color:C.gray500, outline:'none', width:'90px' }} />
                  <button onClick={()=>delCampo(i)} style={{ width:'24px', height:'24px', borderRadius:'4px',
                    border:`1px solid ${C.gray200}`, backgroundColor:'transparent', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', color:C.gray300, fontSize:'0.9rem' }}>×</button>
                </div>
              ))}
            </Card>

            {/* Preview SQL */}
            {form.campos.length > 0 && form.hasDB && (
              <div style={{ backgroundColor:C.code, borderRadius:'8px', padding:'12px 16px', fontFamily:'monospace', fontSize:'0.71rem', lineHeight:'1.7', color:'#8B949E', maxHeight:'180px', overflowY:'auto' }}>
                <p style={{ margin:'0 0 6px', color:'#4B5563' }}># Preview campos</p>
                {form.campos.filter(c=>c.nombre).map((c,i)=>(
                  <p key={i} style={{ margin:0 }}>
                    <span style={{ color:'#79C0FF' }}>{c.nombre.padEnd(22)}</span>
                    <span style={{ color:'#7EE787' }}>{c.tipo}</span>
                    {c.notNull && <span style={{ color:C.orange }}> NOT NULL</span>}
                    {c.default && <span style={{ color:'#F8D000' }}> DEFAULT {c.default}</span>}
                  </p>
                ))}
              </div>
            )}

            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <Btn variant="ghost" onClick={()=>setStep(2)}>← Volver</Btn>
              <Btn onClick={()=>setStep(4)}>Generar archivos →</Btn>
            </div>
          </>}

          {/* ── Step 4: Output ── */}
          {step===4 && outputFiles && <>
            {/* Header éxito */}
            <div style={{ backgroundColor:C.white, border:`1px solid ${C.gray200}`, borderRadius:'10px',
              padding:'22px 24px', textAlign:'center' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'50%', backgroundColor:C.orange10,
                border:`1px solid ${C.orange20}`, display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 12px', fontSize:'1.1rem' }}>🔨</div>
              <h2 style={{ margin:'0 0 6px', fontSize:'1rem', fontWeight:'700', color:C.gray900 }}>
                <span style={{ color:C.orange }}>{form.nombre}</span> generado
              </h2>
              <p style={{ margin:'0 0 12px', fontSize:'0.75rem', color:C.gray400 }}>
                {form.id} · {form.grupo} · {form.campos.length} campos custom
              </p>
              <div style={{ display:'inline-flex', flexWrap:'wrap', gap:'6px', justifyContent:'center' }}>
                {form.hasUI && <Tag label="UI ✓" color={C.green} />}
                {form.hasDB && <Tag label="DB ✓" color={C.blue} />}
                {form.hasEdge && <Tag label="Edge ✓" color={C.purple} />}
                <Tag label={form.grupo} color={GRUPOS.find(g=>g.id===form.grupo)?.color||C.gray500} />
              </div>
            </div>

            {/* Instrucciones */}
            <div style={{ backgroundColor:C.amber10, border:`1px solid #FDE68A`, borderRadius:'8px', padding:'12px 16px' }}>
              <p style={{ margin:'0 0 6px', fontSize:'0.75rem', fontWeight:'600', color:'#92400E' }}>Cómo usar estos archivos</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                {[
                  `1. Corré: npm run charlie:new-module ${form.id}`,
                  `2. Reemplazá module.config.ts con el generado abajo`,
                  `3. Copiá tokens.css a src/modules/${form.id}/ui/tokens.css`,
                  form.hasDB ? `4. Ejecutá schema.sql en tu Supabase` : null,
                  `5. Agregá la entrada al MODULE_MANIFEST (ver más abajo)`,
                  `6. El Checklist detectará C1–C6 automáticamente`,
                ].filter(Boolean).map((s,i)=>(
                  <p key={i} style={{ margin:0, fontSize:'0.73rem', color:'#78350F', fontFamily:'monospace' }}>{s}</p>
                ))}
              </div>
            </div>

            {/* Archivos generados */}
            <CodeBlock filename="module.config.ts" content={outputFiles.config}
              onCopy={()=>copyFile('config',outputFiles.config)} copied={copiedFiles.config} />

            <CodeBlock filename={`src/modules/${form.id}/ui/tokens.css`} content={outputFiles.tokens}
              onCopy={()=>copyFile('tokens',outputFiles.tokens)} copied={copiedFiles.tokens} />

            {form.hasDB && (
              <CodeBlock filename={`src/modules/${form.id}/edge-function/schema.sql`} content={outputFiles.schema}
                onCopy={()=>copyFile('schema',outputFiles.schema)} copied={copiedFiles.schema} />
            )}

            <CodeBlock filename={`src/modules/${form.id}/service/${form.id}Api.ts`} content={outputFiles.service}
              onCopy={()=>copyFile('service',outputFiles.service)} copied={copiedFiles.service} />

            <CodeBlock filename="moduleManifest.ts (entrada a agregar)" content={outputFiles.manifest}
              onCopy={()=>copyFile('manifest',outputFiles.manifest)} copied={copiedFiles.manifest} />

            {/* Criterios esperados */}
            <Card title="Criterios esperados tras implementar">
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {CRITERIOS.map(c => {
                  const cumple = (c.id==='C1'&&form.hasUI)||(c.id==='C2'&&form.hasDB)||(c.id==='C3'&&form.hasDB)||(c.id==='C4')||(c.id==='C5')||(c.id==='C6');
                  return (
                    <div key={c.id} style={{ display:'flex', alignItems:'flex-start', gap:'10px',
                      padding:'8px 10px', borderRadius:'6px', backgroundColor: cumple ? C.green10 : C.gray50,
                      border:`1px solid ${cumple ? C.green+'40' : C.gray200}` }}>
                      <span style={{ fontSize:'0.75rem', fontWeight:'700', color: cumple ? C.green : C.gray400,
                        minWidth:'24px', paddingTop:'1px' }}>{c.id}</span>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0, fontSize:'0.78rem', fontWeight:'600', color: cumple ? C.gray800 : C.gray500 }}>{c.label}</p>
                        <p style={{ margin:'1px 0 0', fontSize:'0.68rem', color:C.gray400 }}>{c.desc}</p>
                      </div>
                      <span style={{ fontSize:'0.7rem', fontWeight:'600', color: cumple ? C.green : C.gray400,
                        backgroundColor: cumple ? C.green10 : C.gray100, padding:'2px 6px', borderRadius:'4px',
                        border:`1px solid ${cumple ? C.green+'30' : C.gray200}`, flexShrink:0 }}>
                        {cumple ? (c.auto ? '✓ Auto' : '✓ Generado') : '⚠ Manual'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:'8px' }}>
              <Btn variant="ghost" onClick={()=>setStep(3)}>← Editar</Btn>
              <Btn variant="ghost" onClick={()=>{ setOperacion(null); setStep(1); setForm(f=>({...f,id:'',nombre:'',descripcion:'',campos:[]})); }}>
                + Nuevo módulo
              </Btn>
            </div>
          </>}

        </div>
      </div>
    </div>
  );
}

/* ─── Card helper ─── */
function Card({ title, children, action }) {
  return (
    <div style={{ backgroundColor:C.white, border:`1px solid ${C.gray200}`, borderRadius:'8px', padding:'18px 20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <p style={{ margin:0, fontSize:'0.8rem', fontWeight:'600', color:C.gray700 }}>{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ─── Vista: Reparar criterios ─── */
function ReparadorView({ form, set, onBack, copyFile, copiedFiles }) {
  const rotos = form.criteriosRoto;
  const toggle = id => set('criteriosRoto', new Set(rotos.has(id) ? [...rotos].filter(x=>x!==id) : [...rotos,id]));

  const instrucciones = {
    C4: `// Crear src/modules/${form.modIdReparar || '{id}'}/module.config.ts\n// Usar el template del Constructor → Módulo nuevo → output`,
    C5: `// Buscar en el viewFile:\ngrep -n '#[0-9A-Fa-f]\\{3,6\\}\\|rgb(' src/modules/${form.modIdReparar||'{id}'}/ui/views/*.tsx\n// Reemplazar cada valor hardcodeado por el token CSS:\n// '#FF6835'  →  var(--m-color-primary)\n// '#F8FAFC'  →  var(--m-color-surface)\n// '#E2E8F0'  →  var(--m-color-border)`,
    C6: `// Crear src/modules/${form.modIdReparar||'{id}'}/ui/tokens.css\n// Usar el template del Constructor → Regenerar tokens`,
    C7: `// Verificar que el módulo NO usa:\n// supabase.from('transportistas') — tabla directa\n// supabase.from('clientes') — tabla directa\n// Debe usar en cambio:\nimport { useTable } from '@/hooks/useTable';\nconst table = useTable('${form.modIdReparar||'{id}'}');\n// Y el rol correcto en roles_contextuales`,
    C8: `// Verificar que el service layer NO usa:\n// supabase.from('nombre_tabla_hardcodeado')\n// Debe usar:\nconst table = useTable('${form.modIdReparar||'{id}'}'); // nombre semántico\n// El sistema de Conjuntos resuelve la tabla real del cliente`,
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', backgroundColor:C.gray50 }}>
      <div style={{ height:'48px', flexShrink:0, backgroundColor:C.white, borderBottom:`1px solid ${C.gray200}`,
        display:'flex', alignItems:'center', padding:'0 24px', gap:'12px' }}>
        <span>🔧</span>
        <span style={{ fontSize:'0.88rem', fontWeight:'600', color:C.gray900 }}>Reparar criterios</span>
        <div style={{ flex:1 }} />
        <Btn small variant="ghost" onClick={onBack}>← Volver</Btn>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
        <div style={{ maxWidth:'680px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'16px' }}>

          <Card title="Módulo a reparar">
            <Input label="ID del módulo" value={form.modIdReparar} mono
              onChange={v=>set('modIdReparar',v.toLowerCase().replace(/\s/g,'-'))}
              placeholder="ej: metodos-envio" hint="El ID exacto del módulo en el Checklist" />
          </Card>

          <Card title="Criterios rotos — seleccioná los que fallan en el Checklist">
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {CRITERIOS.filter(c=>['C4','C5','C6','C7','C8'].includes(c.id)).map(c => {
                const sel = rotos.has(c.id);
                return (
                  <div key={c.id} onClick={()=>toggle(c.id)}
                    style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'10px 12px',
                      borderRadius:'7px', border:`1px solid ${sel ? C.orange : C.gray200}`,
                      backgroundColor: sel ? C.orange10 : C.white, cursor:'pointer', transition:'all 0.12s' }}>
                    <div style={{ width:'16px', height:'16px', borderRadius:'4px', flexShrink:0, marginTop:'1px',
                      border:`1.5px solid ${sel ? C.orange : C.gray300}`, backgroundColor: sel ? C.orange : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {sel && <span style={{ color:C.white, fontSize:'0.6rem', fontWeight:'900' }}>✓</span>}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontSize:'0.8rem', fontWeight:'600', color: sel ? C.gray900 : C.gray600 }}>
                        <span style={{ color: sel ? C.orange : C.gray400 }}>{c.id}</span> — {c.label}
                      </p>
                      <p style={{ margin:'2px 0 0', fontSize:'0.7rem', color:C.gray400 }}>{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {rotos.size > 0 && [...rotos].map(id => (
            <div key={id}>
              <p style={{ margin:'0 0 6px', fontSize:'0.75rem', fontWeight:'600', color:C.gray600 }}>
                Instrucción para {id}
              </p>
              <CodeBlock filename={`fix ${id}`} content={instrucciones[id] || ''}
                onCopy={()=>copyFile(`fix-${id}`, instrucciones[id])}
                copied={copiedFiles[`fix-${id}`]} />
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

/* ─── Vista: Regenerar tokens ─── */
function TokensView({ form, set, onBack, copyFile, copiedFiles }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', backgroundColor:C.gray50 }}>
      <div style={{ height:'48px', flexShrink:0, backgroundColor:C.white, borderBottom:`1px solid ${C.gray200}`,
        display:'flex', alignItems:'center', padding:'0 24px', gap:'12px' }}>
        <span>🎨</span>
        <span style={{ fontSize:'0.88rem', fontWeight:'600', color:C.gray900 }}>Regenerar tokens.css</span>
        <div style={{ flex:1 }} />
        <Btn small variant="ghost" onClick={onBack}>← Volver</Btn>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
        <div style={{ maxWidth:'640px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'16px' }}>
          <Card title="Configuración">
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <Input label="ID del módulo" value={form.id} mono onChange={v=>set('id',v)}
                placeholder="ej: metodos-envio" />
              <div style={{ display:'flex', alignItems:'center', gap:'14px', padding:'8px 0' }}>
                <div style={{ position:'relative', width:'32px', height:'32px', borderRadius:'8px',
                  overflow:'hidden', border:`1px solid ${C.gray200}`, backgroundColor:form.colorPrimario }}>
                  <input type="color" value={form.colorPrimario} onChange={e=>set('colorPrimario',e.target.value)}
                    style={{ opacity:0, position:'absolute', inset:0, width:'100%', height:'100%', cursor:'pointer' }} />
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'0.78rem', fontWeight:'500', color:C.gray700 }}>Color primario fallback</p>
                  <p style={{ margin:'1px 0 0', fontSize:'0.68rem', color:C.gray400 }}>El Orquestador lo sobreescribe con el del tenant</p>
                </div>
                <code style={{ marginLeft:'auto', fontSize:'0.72rem', color:C.gray500,
                  backgroundColor:C.gray50, padding:'2px 8px', borderRadius:'4px', border:`1px solid ${C.gray200}` }}>
                  {form.colorPrimario}
                </code>
              </div>
            </div>
          </Card>
          {form.id && (
            <CodeBlock filename={`src/modules/${form.id}/ui/tokens.css`}
              content={genTokensCss(form)}
              onCopy={()=>copyFile('tokens',genTokensCss(form))}
              copied={copiedFiles.tokens} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Vista: Schema SQL ─── */
function SchemaView({ form, set, onBack, copyFile, copiedFiles, addCampo, updCampo, delCampo }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', backgroundColor:C.gray50 }}>
      <div style={{ height:'48px', flexShrink:0, backgroundColor:C.white, borderBottom:`1px solid ${C.gray200}`,
        display:'flex', alignItems:'center', padding:'0 24px', gap:'12px' }}>
        <span>🗄</span>
        <span style={{ fontSize:'0.88rem', fontWeight:'600', color:C.gray900 }}>Editar schema.sql</span>
        <div style={{ flex:1 }} />
        <Btn small variant="ghost" onClick={onBack}>← Volver</Btn>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
        <div style={{ maxWidth:'680px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'16px' }}>
          <Card title="Módulo y tabla"
            action={<Btn small onClick={addCampo}>+ Campo</Btn>}>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <Input label="ID del módulo" value={form.id} mono onChange={v=>set('id',v)} placeholder="ej: metodos-envio" />
                <Input label="Nombre tabla SQL" value={form.tabla} mono
                  onChange={v=>set('tabla',v.toLowerCase().replace(/[^a-z0-9_]/g,''))}
                  placeholder={form.id.replace(/-/g,'_')||'nombre_tabla'} />
              </div>

              {form.campos.map((c,i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr auto auto auto', gap:'8px', alignItems:'center' }}>
                  <input value={c.nombre} onChange={e=>updCampo(i,'nombre',e.target.value.toLowerCase().replace(/\s+/g,'_'))}
                    placeholder="nombre_campo" style={{ padding:'6px 9px', borderRadius:'5px', border:`1px solid ${C.gray200}`,
                      fontSize:'0.78rem', fontFamily:'monospace', color:C.gray900, outline:'none' }} />
                  <select value={c.tipo} onChange={e=>updCampo(i,'tipo',e.target.value)}
                    style={{ padding:'6px 9px', borderRadius:'5px', border:`1px solid ${C.gray200}`,
                      fontSize:'0.78rem', color:C.gray900, backgroundColor:C.white }}>
                    {FIELD_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                  <label style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'0.72rem', color:C.gray500, cursor:'pointer', whiteSpace:'nowrap' }}>
                    <input type="checkbox" checked={c.notNull} onChange={e=>updCampo(i,'notNull',e.target.checked)} /> NOT NULL
                  </label>
                  <input value={c.default} onChange={e=>updCampo(i,'default',e.target.value)}
                    placeholder="DEFAULT" style={{ padding:'6px 9px', borderRadius:'5px', border:`1px solid ${C.gray200}`,
                      fontSize:'0.72rem', fontFamily:'monospace', color:C.gray500, outline:'none', width:'80px' }} />
                  <button onClick={()=>delCampo(i)} style={{ width:'24px', height:'24px', borderRadius:'4px',
                    border:`1px solid ${C.gray200}`, backgroundColor:'transparent', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', color:C.gray300 }}>×</button>
                </div>
              ))}

              {form.campos.length === 0 && (
                <div style={{ padding:'16px', textAlign:'center', border:`1.5px dashed ${C.gray200}`, borderRadius:'6px' }}>
                  <p style={{ margin:'0 0 8px', fontSize:'0.75rem', color:C.gray400 }}>Sin campos aún</p>
                  <Btn small onClick={addCampo}>+ Primer campo</Btn>
                </div>
              )}
            </div>
          </Card>

          {form.id && (
            <CodeBlock filename={`edge-function/schema.sql`}
              content={genSchemaSql(form)}
              onCopy={()=>copyFile('schema',genSchemaSql(form))}
              copied={copiedFiles.schema} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Vista: Actualizar config ─── */
function ConfigView({ form, set, onBack, copyFile, copiedFiles, outputFiles }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', backgroundColor:C.gray50 }}>
      <div style={{ height:'48px', flexShrink:0, backgroundColor:C.white, borderBottom:`1px solid ${C.gray200}`,
        display:'flex', alignItems:'center', padding:'0 24px', gap:'12px' }}>
        <span>⚙</span>
        <span style={{ fontSize:'0.88rem', fontWeight:'600', color:C.gray900 }}>Actualizar module.config.ts</span>
        <div style={{ flex:1 }} />
        <Btn small variant="ghost" onClick={onBack}>← Volver</Btn>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
        <div style={{ maxWidth:'680px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'16px' }}>
          <Card title="Datos del módulo">
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <Input label="ID del módulo" required value={form.id} mono
                  onChange={v=>set('id',v.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''))}
                  placeholder="ej: metodos-envio" />
                <Input label="Nombre visible" required value={form.nombre}
                  onChange={v=>set('nombre',v)} placeholder="ej: Métodos de Envío" />
              </div>
              <Input label="Descripción" value={form.descripcion} onChange={v=>set('descripcion',v)}
                placeholder="Descripción del módulo" />
              <Select label="Grupo funcional" value={form.grupo} onChange={v=>set('grupo',v)}
                options={GRUPOS.map(g=>({ value:g.id, label:g.label }))} />
              <Input label="Dependencias" value={form.dependencias} onChange={v=>set('dependencias',v)}
                placeholder="auth-registro, organizaciones" hint="IDs separados por coma" />
              <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                <Toggle label="hasSupabase" hint="Tiene tabla en la BD del tenant" value={form.hasDB} onChange={v=>set('hasDB',v)} />
                <Toggle label="isReal" hint="Tiene componente React real (no placeholder)" value={form.hasUI} onChange={v=>set('hasUI',v)} />
              </div>
            </div>
          </Card>

          {form.id && form.nombre && outputFiles && (
            <CodeBlock filename="module.config.ts" content={outputFiles.config}
              onCopy={()=>copyFile('config',outputFiles.config)}
              copied={copiedFiles.config} />
          )}
        </div>
      </div>
    </div>
  );
}
