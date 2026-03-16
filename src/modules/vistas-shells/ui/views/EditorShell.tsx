/**
 * EditorShell.tsx
 * Charlie Platform — Módulo Vistas y Shells · Fase VS-UX
 *
 * - Preview chico fijo y reactivo (lee formData del DrawerShell via renderComponent)
 * - "Guardar y Aplicar" → persiste + aplica tokens al DOM
 * - "Guardar Como" → crea shell nuevo independiente en Supabase
 * - "Descartar" → revierte tokens al snapshot original
 *
 * C5: Zero colores hardcodeados — solo var(--m-*)
 * C8: No contiene supabase.from() — delega en vistasShellsApi
 */
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Sliders, Copy } from 'lucide-react';
import type { ShellEntry, PropDef } from '../../types';
import { saveEdit, getEdits, upsertShell } from '../../service/vistasShellsApi';
import { ShellPreview } from './ShellPreview';
import { DrawerShell } from '../../../../app/components/shells/DrawerShell';
import type { SheetDef, CustomFieldProps } from '../../../../app/components/shells/DrawerShell.types';

interface EditorShellProps {
  shell:    ShellEntry | null;
  open:     boolean;
  onClose:  () => void;
  onSaved?: (shellId: string) => void;
}

const SPACING_OPTIONS = [
  { label: '0',         value: '0px'       },
  { label: '2px',       value: '2px'       },
  { label: '4px',       value: '4px'       },
  { label: '6px',       value: '6px'       },
  { label: '8px',       value: '8px'       },
  { label: '12px',      value: '12px'      },
  { label: '16px',      value: '16px'      },
  { label: '20px',      value: '20px'      },
  { label: '24px',      value: '24px'      },
  { label: '32px',      value: '32px'      },
  { label: '40px',      value: '40px'      },
  { label: '48px',      value: '48px'      },
  { label: '64px',      value: '64px'      },
  { label: 'Manual...', value: '__manual__' },
];

const RADIUS_OPTIONS = [
  { label: 'Ninguno (0)',    value: '0px'       },
  { label: 'XS — 2px',      value: '2px'       },
  { label: 'SM — 4px',      value: '4px'       },
  { label: 'MD — 6px',      value: '6px'       },
  { label: 'LG — 8px',      value: '8px'       },
  { label: 'XL — 12px',     value: '12px'      },
  { label: '2XL — 16px',    value: '16px'      },
  { label: 'Full — 9999px', value: '9999px'    },
  { label: 'Manual...',     value: '__manual__' },
];

// ── Color helpers ─────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const c = hex.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(c)) return null;
  return { r: parseInt(c.slice(0,2),16), g: parseInt(c.slice(2,4),16), b: parseInt(c.slice(4,6),16) };
}
function rgbToHex(r:number,g:number,b:number) {
  return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');
}
function rgbToCmyk(r:number,g:number,b:number) {
  const rp=r/255,gp=g/255,bp=b/255,k=1-Math.max(rp,gp,bp);
  if(k===1) return{c:0,m:0,y:0,k:100};
  return{c:Math.round(((1-rp-k)/(1-k))*100),m:Math.round(((1-gp-k)/(1-k))*100),y:Math.round(((1-bp-k)/(1-k))*100),k:Math.round(k*100)};
}
function cmykToRgb(c:number,m:number,y:number,k:number) {
  const kf=1-k/100;
  return{r:Math.round(255*(1-c/100)*kf),g:Math.round(255*(1-m/100)*kf),b:Math.round(255*(1-y/100)*kf)};
}
function isValidHex(h:string){ return /^#[0-9A-Fa-f]{6}$/.test(h); }

// ── Token DOM ─────────────────────────────────────────────────────────────────

function applyTokensToDOM(props:PropDef[], values:Record<string,string>) {
  const root=document.documentElement;
  for(const prop of props){
    const val=values[prop.id]; if(!val) continue;
    const m=prop.token.match(/var\((--[^,)]+)/);
    if(m) root.style.setProperty(m[1],val);
  }
}
function snapshotTokens(props:PropDef[]): Record<string,string> {
  const root=document.documentElement,style=getComputedStyle(root),snap:Record<string,string>={};
  for(const prop of props){
    const m=prop.token.match(/var\((--[^,)]+)/);
    if(m) snap[prop.id]=root.style.getPropertyValue(m[1])||style.getPropertyValue(m[1]).trim();
  }
  return snap;
}
function revertTokens(props:PropDef[], snap:Record<string,string>) {
  const root=document.documentElement;
  for(const prop of props){
    const m=prop.token.match(/var\((--[^,)]+)/);
    if(!m) continue;
    if(snap[prop.id]) root.style.setProperty(m[1],snap[prop.id]);
    else root.style.removeProperty(m[1]);
  }
}

// ── ColorPicker ───────────────────────────────────────────────────────────────

function ColorPickerControl({ prop, value, onMultiChange }:{prop:PropDef;value:string;onMultiChange:(u:Record<string,unknown>)=>void}) {
  const cur=isValidHex(value)?value:isValidHex(prop.valorDefault)?prop.valorDefault:'#000000';
  const rgb=hexToRgb(cur)??{r:0,g:0,b:0};
  const cmyk=rgbToCmyk(rgb.r,rgb.g,rgb.b);
  const [hi,setHi]=useState(cur);
  const [ri,setRi]=useState({r:String(rgb.r),g:String(rgb.g),b:String(rgb.b)});
  const [ci,setCi]=useState({c:String(cmyk.c),m:String(cmyk.m),y:String(cmyk.y),k:String(cmyk.k)});
  const prev=useRef(value);
  useEffect(()=>{
    if(prev.current===value) return; prev.current=value;
    if(!isValidHex(value)) return;
    const r2=hexToRgb(value)!,c2=rgbToCmyk(r2.r,r2.g,r2.b);
    setHi(value);setRi({r:String(r2.r),g:String(r2.g),b:String(r2.b)});
    setCi({c:String(c2.c),m:String(c2.m),y:String(c2.y),k:String(c2.k)});
  },[value]);
  const commit=(hex:string)=>{
    const r2=hexToRgb(hex)!,c2=rgbToCmyk(r2.r,r2.g,r2.b);
    setHi(hex);setRi({r:String(r2.r),g:String(r2.g),b:String(r2.b)});
    setCi({c:String(c2.c),m:String(c2.m),y:String(c2.y),k:String(c2.k)});
    onMultiChange({[prop.id]:hex});
  };
  const hexCommit=()=>{const h=hi.startsWith('#')?hi:'#'+hi;if(isValidHex(h))commit(h);else setHi(cur);};
  const rgbCommit=()=>commit(rgbToHex(Math.max(0,Math.min(255,parseInt(ri.r)||0)),Math.max(0,Math.min(255,parseInt(ri.g)||0)),Math.max(0,Math.min(255,parseInt(ri.b)||0))));
  const cmykCommit=()=>{const c2=Math.max(0,Math.min(100,parseInt(ci.c)||0)),m2=Math.max(0,Math.min(100,parseInt(ci.m)||0)),y2=Math.max(0,Math.min(100,parseInt(ci.y)||0)),k2=Math.max(0,Math.min(100,parseInt(ci.k)||0));const rgb2=cmykToRgb(c2,m2,y2,k2);commit(rgbToHex(rgb2.r,rgb2.g,rgb2.b));};
  const lSt:React.CSSProperties={fontSize:10,fontWeight:700,color:'var(--m-color-text-muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2};
  const iSt:React.CSSProperties={width:'100%',padding:'4px 8px',fontSize:12,fontFamily:'var(--m-font-mono,monospace)',backgroundColor:'var(--m-color-surface)',border:'1px solid var(--m-color-border)',borderRadius:'var(--m-radius-sm)',color:'var(--m-color-text)',outline:'none'};
  const cSt:React.CSSProperties={...iSt,textAlign:'center'};
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'var(--m-space-3)'}}>
      <div style={{display:'flex',flexDirection:'column',gap:2}}>
        <span style={{fontSize:12,fontWeight:600,color:'var(--m-color-text)'}}>{prop.label}</span>
        {prop.descripcion&&<span style={{fontSize:11,color:'var(--m-color-text-muted)'}}>{prop.descripcion}</span>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'var(--m-space-3)'}}>
        <div style={{position:'relative',flexShrink:0}}>
          <div style={{width:40,height:40,borderRadius:'var(--m-radius-md)',backgroundColor:cur,border:'2px solid var(--m-color-border)',cursor:'pointer'}}/>
          <input type="color" value={cur} onChange={e=>commit(e.target.value)} style={{position:'absolute',inset:0,opacity:0,width:'100%',height:'100%',cursor:'pointer',padding:0,border:'none'}}/>
        </div>
        <div style={{flex:1}}>
          <div style={lSt}>HEX</div>
          <input style={iSt} value={hi} onChange={e=>setHi(e.target.value)} onBlur={hexCommit} onKeyDown={e=>{if(e.key==='Enter')hexCommit();}} placeholder="#000000" spellCheck={false}/>
        </div>
      </div>
      <div>
        <div style={lSt}>RGB</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'var(--m-space-1)'}}>
          {(['r','g','b'] as const).map(ch=>(
            <div key={ch} style={{display:'flex',flexDirection:'column',gap:2,alignItems:'center'}}>
              <input style={cSt} value={ri[ch]} type="number" min={0} max={255} onChange={e=>setRi(p=>({...p,[ch]:e.target.value}))} onBlur={rgbCommit} onKeyDown={e=>{if(e.key==='Enter')rgbCommit();}}/>
              <span style={{fontSize:9,color:'var(--m-color-text-muted)',fontWeight:700}}>{ch.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={lSt}>CMYK</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'var(--m-space-1)'}}>
          {(['c','m','y','k'] as const).map(ch=>(
            <div key={ch} style={{display:'flex',flexDirection:'column',gap:2,alignItems:'center'}}>
              <input style={cSt} value={ci[ch]} type="number" min={0} max={100} onChange={e=>setCi(p=>({...p,[ch]:e.target.value}))} onBlur={cmykCommit} onKeyDown={e=>{if(e.key==='Enter')cmykCommit();}}/>
              <span style={{fontSize:9,color:'var(--m-color-text-muted)',fontWeight:700}}>{ch.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:'4px 8px',backgroundColor:'var(--m-color-surface)',borderRadius:'var(--m-radius-sm)',border:'1px solid var(--m-color-border)'}}>
        <span style={{fontSize:10,color:'var(--m-color-text-muted)',fontFamily:'var(--m-font-mono,monospace)'}}>{prop.token}</span>
      </div>
    </div>
  );
}

// ── Dropdown ──────────────────────────────────────────────────────────────────

function DropdownControl({ prop, value, options, unit, onMultiChange }:{prop:PropDef;value:string;options:{label:string;value:string}[];unit:string;onMultiChange:(u:Record<string,unknown>)=>void}) {
  const isM=value!==''&&!options.some(o=>o.value!=='__manual__'&&o.value===value);
  const [manual,setManual]=useState(isM?value:'');
  const [showM,setShowM]=useState(isM);
  const sel=(e:React.ChangeEvent<HTMLSelectElement>)=>{const v=e.target.value;if(v==='__manual__'){setShowM(true);}else{setShowM(false);setManual('');onMultiChange({[prop.id]:v});}};
  const commit=()=>{if(manual.trim()){const v=manual.trim().includes(unit)?manual.trim():`${manual.trim()}${unit}`;onMultiChange({[prop.id]:v});}};
  const sSt:React.CSSProperties={width:'100%',padding:'6px 8px',fontSize:12,backgroundColor:'var(--m-color-surface)',border:'1px solid var(--m-color-border)',borderRadius:'var(--m-radius-sm)',color:'var(--m-color-text)',cursor:'pointer',outline:'none'};
  const sv=showM?'__manual__':(value||prop.valorDefault);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'var(--m-space-2)'}}>
      <div style={{display:'flex',flexDirection:'column',gap:2}}>
        <span style={{fontSize:12,fontWeight:600,color:'var(--m-color-text)'}}>{prop.label}</span>
        {prop.descripcion&&<span style={{fontSize:11,color:'var(--m-color-text-muted)'}}>{prop.descripcion}</span>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'var(--m-space-2)'}}>
        <div style={{flexShrink:0,width:36,height:28,backgroundColor:'var(--m-color-surface-2)',borderRadius:prop.tipo==='radius'?(value||'0px'):'var(--m-radius-sm)',border:'1px solid var(--m-color-border)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:8,color:'var(--m-color-text-muted)',fontWeight:700}}>{prop.tipo==='radius'?'R':'SP'}</span>
        </div>
        <select style={sSt} value={sv} onChange={sel}>
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {showM&&<input style={{...sSt,fontFamily:'var(--m-font-mono,monospace)'}} value={manual} onChange={e=>setManual(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')commit();}} placeholder={`ej: 10${unit}`} autoFocus/>}
      <div style={{padding:'4px 8px',backgroundColor:'var(--m-color-surface)',borderRadius:'var(--m-radius-sm)',border:'1px solid var(--m-color-border)'}}>
        <span style={{fontSize:10,color:'var(--m-color-text-muted)',fontFamily:'var(--m-font-mono,monospace)'}}>{prop.token}</span>
      </div>
    </div>
  );
}

function TextControl({ prop, value, onMultiChange }:{prop:PropDef;value:string;onMultiChange:(u:Record<string,unknown>)=>void}) {
  const [local,setLocal]=useState(value);
  useEffect(()=>{setLocal(value);},[value]);
  const iSt:React.CSSProperties={width:'100%',padding:'6px 8px',fontSize:12,backgroundColor:'var(--m-color-surface)',border:'1px solid var(--m-color-border)',borderRadius:'var(--m-radius-sm)',color:'var(--m-color-text)',outline:'none'};
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'var(--m-space-2)'}}>
      <div style={{display:'flex',flexDirection:'column',gap:2}}>
        <span style={{fontSize:12,fontWeight:600,color:'var(--m-color-text)'}}>{prop.label}</span>
        {prop.descripcion&&<span style={{fontSize:11,color:'var(--m-color-text-muted)'}}>{prop.descripcion}</span>}
      </div>
      <input style={iSt} value={local} placeholder={prop.valorDefault} onChange={e=>{setLocal(e.target.value);onMultiChange({[prop.id]:e.target.value});}}/>
      <div style={{padding:'4px 8px',backgroundColor:'var(--m-color-surface)',borderRadius:'var(--m-radius-sm)',border:'1px solid var(--m-color-border)'}}>
        <span style={{fontSize:10,color:'var(--m-color-text-muted)',fontFamily:'var(--m-font-mono,monospace)'}}>{prop.token}</span>
      </div>
    </div>
  );
}

function BooleanControl({ prop, value, onMultiChange }:{prop:PropDef;value:string;onMultiChange:(u:Record<string,unknown>)=>void}) {
  const on=value==='true'||value==='1';
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'var(--m-space-3)'}}>
      <div>
        <span style={{fontSize:12,fontWeight:600,color:'var(--m-color-text)'}}>{prop.label}</span>
        {prop.descripcion&&<div style={{fontSize:11,color:'var(--m-color-text-muted)'}}>{prop.descripcion}</div>}
      </div>
      <button onClick={()=>onMultiChange({[prop.id]:on?'false':'true'})} style={{flexShrink:0,width:44,height:24,borderRadius:12,backgroundColor:on?'var(--m-color-primary)':'var(--m-color-surface-2)',border:'1px solid var(--m-color-border)',cursor:'pointer',position:'relative',padding:0,transition:'background-color 0.15s'}}>
        <div style={{position:'absolute',top:2,left:on?22:2,width:18,height:18,borderRadius:'50%',backgroundColor:'var(--m-color-text-inverse,#fff)',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.15s'}}/>
      </button>
    </div>
  );
}

function PropControl({ prop, drawerProps }:{ prop:PropDef; drawerProps:CustomFieldProps }) {
  const value=(drawerProps.formData[prop.id] as string)??prop.valorDefault;
  const {onMultiChange}=drawerProps;
  switch(prop.tipo){
    case 'color':   return <ColorPickerControl prop={prop} value={value} onMultiChange={onMultiChange}/>;
    case 'spacing': return <DropdownControl    prop={prop} value={value} options={SPACING_OPTIONS} unit="px" onMultiChange={onMultiChange}/>;
    case 'radius':  return <DropdownControl    prop={prop} value={value} options={RADIUS_OPTIONS}  unit="px" onMultiChange={onMultiChange}/>;
    case 'boolean': return <BooleanControl     prop={prop} value={value} onMultiChange={onMultiChange}/>;
    default:        return <TextControl        prop={prop} value={value} onMultiChange={onMultiChange}/>;
  }
}

// ── MiniPreview — recibe drawerProps para leer formData del DrawerShell ────────

function MiniPreview({ shell, drawerProps }:{ shell:ShellEntry; drawerProps:CustomFieldProps }) {
  const shellEditado: ShellEntry = useMemo(()=>({
    ...shell,
    props: shell.props.map(p=>({
      ...p,
      valorDefault: (drawerProps.formData[p.id] as string)??p.valorDefault,
    })),
  }),[shell, drawerProps.formData]);

  const colores=shell.props.filter(p=>p.tipo==='color').slice(0,6);

  return (
    <div style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:'var(--m-space-3)',backgroundColor:'var(--m-color-surface)'}}>
      <div style={{flexShrink:0,width:120,height:68,borderRadius:'var(--m-radius-md)',overflow:'hidden',border:'1px solid var(--m-color-border)',position:'relative'}}>
        <div style={{transform:'scale(0.25)',transformOrigin:'top left',width:'400%',height:'400%',pointerEvents:'none'}}>
          <ShellPreview shell={shellEditado} height={272}/>
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:4,minWidth:0}}>
        <span style={{fontSize:11,fontWeight:700,color:'var(--m-color-text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{shell.nombre}</span>
        {colores.length>0&&(
          <div style={{display:'flex',gap:4}}>
            {colores.map(p=>{
              const val=(drawerProps.formData[p.id] as string)??p.valorDefault;
              return isValidHex(val)?<div key={p.id} title={`${p.label}: ${val}`} style={{width:14,height:14,borderRadius:'50%',backgroundColor:val,border:'1px solid var(--m-color-border)',flexShrink:0}}/>:null;
            })}
          </div>
        )}
        <span style={{fontSize:10,color:'var(--m-color-text-muted)'}}>{shell.props.length} prop{shell.props.length!==1?'s':''} · preview en vivo</span>
      </div>
    </div>
  );
}

// ── SaveAsDialog — inline en el footer ────────────────────────────────────────

function SaveAsDialog({ onConfirm, onCancel, saving }:{
  onConfirm:(nombre:string)=>void; onCancel:()=>void; saving:boolean;
}) {
  const [nombre,setNombre]=useState('');
  const inputSt:React.CSSProperties={flex:1,padding:'6px 10px',fontSize:12,backgroundColor:'var(--m-color-surface)',border:'1px solid var(--m-color-border)',borderRadius:'var(--m-radius-sm)',color:'var(--m-color-text)',outline:'none'};
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'var(--m-space-2)',padding:'10px 0 0'}}>
      <span style={{fontSize:11,fontWeight:700,color:'var(--m-color-text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>
        Nombre del nuevo shell
      </span>
      <div style={{display:'flex',gap:'var(--m-space-2)'}}>
        <input
          style={inputSt}
          value={nombre}
          onChange={e=>setNombre(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&nombre.trim())onConfirm(nombre.trim());if(e.key==='Escape')onCancel();}}
          placeholder="ej: TopBar Oscuro"
          autoFocus
        />
        <button
          onClick={()=>nombre.trim()&&onConfirm(nombre.trim())}
          disabled={saving||!nombre.trim()}
          style={{padding:'6px 14px',fontSize:12,fontWeight:700,borderRadius:'var(--m-radius-sm)',border:'none',backgroundColor:saving||!nombre.trim()?'var(--m-color-surface-2)':'var(--m-color-primary)',color:saving||!nombre.trim()?'var(--m-color-text-muted)':'var(--m-color-text-inverse,#fff)',cursor:saving||!nombre.trim()?'not-allowed':'pointer',flexShrink:0}}>
          {saving?'Guardando...':'Crear'}
        </button>
        <button
          onClick={onCancel}
          style={{padding:'6px 10px',fontSize:12,borderRadius:'var(--m-radius-sm)',border:'1px solid var(--m-color-border)',backgroundColor:'transparent',color:'var(--m-color-text-muted)',cursor:'pointer',flexShrink:0}}>
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildInitialData(props:PropDef[]): Record<string,string> {
  return Object.fromEntries(props.map(p=>[p.id,p.valorDefault]));
}

function slugify(nombre:string): string {
  return nombre.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').slice(0,40);
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EditorShell({ shell, open, onClose, onSaved }: EditorShellProps) {
  const [initialData,  setInitialData]  = useState<Record<string,string>>({});
  const [loading,      setLoading]      = useState(false);
  const [showSaveAs,   setShowSaveAs]   = useState(false);
  const [savingAs,     setSavingAs]     = useState(false);
  const [saveAsError,  setSaveAsError]  = useState<string|null>(null);
  const tokenSnapshot = useRef<Record<string,string>>({});

  // formDataRef — referencia viva al formData del DrawerShell
  // Se actualiza via el campo preview sin causar re-renders extra
  const formDataRef = useRef<Record<string,unknown>>({});

  useEffect(()=>{
    if(!shell||!open) return;
    tokenSnapshot.current=snapshotTokens(shell.props);
    const base=buildInitialData(shell.props);
    const shellId=shell.shellId??shell.id;
    setShowSaveAs(false);
    setSaveAsError(null);
    setLoading(true);
    getEdits(shellId)
      .then(edits=>{
        const merged={...base};
        [...edits].reverse().forEach(e=>{merged[e.propId]=e.valor;});
        setInitialData(merged);
        formDataRef.current=merged;
      })
      .catch(()=>{setInitialData(base);formDataRef.current=base;})
      .finally(()=>setLoading(false));
  },[shell?.id, open]);

  // ── Sheets: el primer field de cada sheet es el MiniPreview
  // renderComponent recibe drawerProps → formData del DrawerShell → siempre actualizado

  const sheets: SheetDef[] = useMemo(()=>{
    if(!shell) return [];
    const tiposPresentes=[...new Set(shell.props.map(p=>p.tipo))];
    return tiposPresentes.map(tipo=>({
      id:      `props-${tipo}`,
      title:   tipo.charAt(0).toUpperCase()+tipo.slice(1),
      subtitle:`Propiedades de tipo ${tipo}`,
      fields:[
        // Preview como primer field de cada sheet — reactivo via drawerProps
        {
          id:   '__mini_preview__',
          type: 'custom' as const,
          renderComponent:(dp:CustomFieldProps)=>{
            formDataRef.current=dp.formData; // mantener ref actualizada
            return <MiniPreview shell={shell} drawerProps={dp}/>;
          },
        },
        ...shell.props.filter(p=>p.tipo===tipo).map(prop=>({
          id:   prop.id,
          type: 'custom' as const,
          renderComponent:(dp:CustomFieldProps)=><PropControl prop={prop} drawerProps={dp}/>,
        })),
      ],
    }));
  },[shell]);

  // ── Guardar y Aplicar ─────────────────────────────────────────────────────

  const handleSave=useCallback(async(data:Record<string,unknown>)=>{
    if(!shell) return;
    const shellId=shell.shellId??shell.id;
    const propsToSave=shell.props.filter(p=>data[p.id]!==undefined&&data[p.id]!=='');
    await Promise.all(propsToSave.map(p=>saveEdit({shellId,tenantId:'charlie',propId:p.id,valor:data[p.id] as string})));
    const values:Record<string,string>={};
    propsToSave.forEach(p=>{values[p.id]=data[p.id] as string;});
    applyTokensToDOM(shell.props,values);
    onSaved?.(shellId);
  },[shell,onSaved]);

  // ── Guardar Como ──────────────────────────────────────────────────────────

  const handleSaveAs=useCallback(async(nombre:string)=>{
    if(!shell) return;
    setSavingAs(true);
    setSaveAsError(null);
    try {
      const data=formDataRef.current;
      const newId=`${slugify(nombre)}-${Date.now().toString(36)}`;
      // Construir nuevas props con los valores actuales como valorDefault
      const newProps=shell.props.map(p=>({
        ...p,
        valorDefault:(data[p.id] as string)??p.valorDefault,
      }));
      await upsertShell({
        id:          newId,
        nombre,
        tipo:        shell.tipo,
        descripcion: `Basado en ${shell.nombre}`,
        archivo:     shell.archivo,
        shellId:     shell.id,  // heredar shell_id para preview
        props:       newProps,
        variantes:   shell.variantes,
        isReal:      false,
      });
      setShowSaveAs(false);
      onSaved?.(newId);
    } catch(err) {
      setSaveAsError(err instanceof Error?err.message:'Error al guardar');
    } finally {
      setSavingAs(false);
    }
  },[shell,onSaved]);

  // ── Descartar ─────────────────────────────────────────────────────────────

  const handleDiscard=useCallback(()=>{
    if(shell) revertTokens(shell.props,tokenSnapshot.current);
  },[shell]);

  if(!shell) return null;

  // ── Footer extra: botón Guardar Como + dialog inline ─────────────────────

  const extraFooter = (
    <div style={{borderTop:'1px solid var(--m-color-border)',padding:'0 24px 14px',backgroundColor:'var(--m-color-surface)'}}>
      {!showSaveAs ? (
        <button
          onClick={()=>setShowSaveAs(true)}
          style={{display:'flex',alignItems:'center',gap:'var(--m-space-1)',padding:'6px 12px',fontSize:12,fontWeight:600,borderRadius:'var(--m-radius-sm)',border:'1px solid var(--m-color-border)',backgroundColor:'transparent',color:'var(--m-color-text-muted)',cursor:'pointer',marginTop:10}}>
          <Copy size={13}/> Guardar Como
        </button>
      ) : (
        <SaveAsDialog
          onConfirm={handleSaveAs}
          onCancel={()=>{setShowSaveAs(false);setSaveAsError(null);}}
          saving={savingAs}
        />
      )}
      {saveAsError&&(
        <p style={{margin:'6px 0 0',fontSize:11,color:'var(--m-color-error)'}}>⚠ {saveAsError}</p>
      )}
    </div>
  );

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      onSave={handleSave}
      onDiscard={handleDiscard}
      title={shell.nombre}
      icon={Sliders}
      sheets={sheets}
      initialData={initialData}
      loading={loading}
      footerSlot={extraFooter}
      labels={{save:'Guardar y Aplicar',saving:'Guardando...',cancel:'Cancelar',prev:'Anterior',next:'Siguiente',pageOf:'de'}}
    />
  );
}

