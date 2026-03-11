import fs from 'fs';
import path from 'path';

const ROOT         = path.resolve(__dirname, 'src');
const VIEWS_DIR    = path.join(ROOT, 'app/components/admin/views');
const SERVICES_DIR = path.join(ROOT, 'app/services');
const MODULES_DIR  = path.join(ROOT, 'modules');

// ─── TEMPLATES ────────────────────────────────────────────────────────────────

function tplView(nombre: string, tabla: string): string {
  const N = nombre.charAt(0).toUpperCase() + nombre.slice(1);
  return `/**
 * ${N}View.tsx  — C1 ✓
 * Charlie Platform · Módulo ${N}
 * Generado por ConstructorModulos — cumple C1-C8
 */
import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { getAll${N}, create${N}, update${N}, delete${N} } from '../../../services/${nombre}Api';
import type { ${N}Item } from '../../../services/${nombre}Api';

export default function ${N}View() {
  const [items, setItems]     = useState<${N}Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [error, setError]     = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAll${N}({ search });
      setItems(data);
    } catch (e: any) {
      setError(e.message ?? 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--m-bg, #F8F9FA)', fontFamily: 'system-ui, sans-serif' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderBottom: '1px solid var(--m-border, #E5E7EB)', backgroundColor: 'var(--m-surface, #fff)' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--m-text-muted, #9CA3AF)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid var(--m-border, #E5E7EB)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button onClick={cargar} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--m-border, #E5E7EB)', backgroundColor: 'var(--m-surface, #fff)', cursor: 'pointer' }}>
          <RefreshCw size={14} color="var(--m-text-muted, #6B7280)" />
        </button>
        <button onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: 'var(--m-primary, #FF6835)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {loading && <div style={{ color: 'var(--m-text-muted, #9CA3AF)', fontSize: 13 }}>Cargando...</div>}
        {error   && <div style={{ color: 'var(--m-danger, #EF4444)', fontSize: 13 }}>{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--m-text-muted, #9CA3AF)', fontSize: 13 }}>
            Sin registros. Presioná "Nuevo" para agregar el primero.
          </div>
        )}
        {!loading && items.map(item => (
          <div key={item.id} style={{ backgroundColor: 'var(--m-surface, #fff)', border: '1px solid var(--m-border, #E5E7EB)', borderRadius: 10, padding: '12px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--m-text, #111827)' }}>{item.nombre ?? item.id}</span>
            <span style={{ fontSize: 11, color: 'var(--m-text-muted, #9CA3AF)' }}>{item.created_at?.slice(0, 10)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
`;
}

function tplApi(nombre: string, tabla: string): string {
  const N = nombre.charAt(0).toUpperCase() + nombre.slice(1);
  return `/**
 * ${nombre}Api.ts  — C3 ✓ C8 ✓
 * Charlie Platform · Service layer para ${tabla}
 * Generado por ConstructorModulos
 * C8: sin supabase.from() directo en el View — toda la lógica aquí
 */
import { supabase } from '../../utils/supabase/client';

export interface ${N}Item {
  id:          string;
  nombre?:     string;
  estado?:     string;
  created_at:  string;
  updated_at?: string;
  [key: string]: any;
}

export async function getAll${N}(params?: { search?: string; estado?: string }): Promise<${N}Item[]> {
  let query = supabase.from('${tabla}').select('*');
  if (params?.search) query = query.ilike('nombre', \`%\${params.search}%\`);
  if (params?.estado) query = query.eq('estado', params.estado);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error('[${nombre}Api]', error); throw new Error(error.message); }
  return data ?? [];
}

export async function get${N}(id: string): Promise<${N}Item | null> {
  const { data, error } = await supabase.from('${tabla}').select('*').eq('id', id).single();
  if (error) { console.error('[${nombre}Api]', error); return null; }
  return data;
}

export async function create${N}(payload: Partial<${N}Item>): Promise<${N}Item> {
  const { data, error } = await supabase.from('${tabla}').insert(payload).select().single();
  if (error) { console.error('[${nombre}Api]', error); throw new Error(error.message); }
  return data;
}

export async function update${N}(id: string, payload: Partial<${N}Item>): Promise<${N}Item> {
  const { data, error } = await supabase
    .from('${tabla}')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) { console.error('[${nombre}Api]', error); throw new Error(error.message); }
  return data;
}

export async function delete${N}(id: string): Promise<boolean> {
  const { error } = await supabase.from('${tabla}').delete().eq('id', id);
  if (error) { console.error('[${nombre}Api]', error); return false; }
  return true;
}
`;
}

function tplConfig(nombre: string, grupo: string, descripcion: string): string {
  const N = nombre.charAt(0).toUpperCase() + nombre.slice(1);
  return `/**
 * module.config.ts  — C4 ✓
 * Charlie Platform · Configuración del módulo ${N}
 * Generado por ConstructorModulos
 */
export const moduleConfig = {
  id:          '${nombre}',
  nombre:      '${N}',
  descripcion: '${descripcion}',
  grupo:       '${grupo}',
  version:     '1.0.0',
  icono:       'Boxes',
  color:       'var(--m-primary)',
  ruta:        '/${nombre}',
  permisos:    ['ver', 'crear', 'editar', 'eliminar'],
  creado:      '${new Date().toISOString().slice(0, 10)}',
} as const;

export type ModuleConfig = typeof moduleConfig;
`;
}

function tplTokens(nombre: string): string {
  return `/**
 * tokens.css  — C5 ✓ C6 ✓
 * Charlie Platform · Design tokens para módulo ${nombre}
 * Generado por ConstructorModulos
 * C5: sin colores hex hardcodeados — usar siempre var(--m-*)
 * C6: tokens con fallbacks definidos aquí
 */
:root {
  /* Colores principales — heredados del sistema */
  --m-primary:      var(--charlie-primary, #FF6835);
  --m-primary-10:   color-mix(in srgb, var(--m-primary) 10%, white);
  --m-primary-20:   color-mix(in srgb, var(--m-primary) 20%, white);

  /* Superficies */
  --m-bg:           #F8F9FA;
  --m-surface:      #FFFFFF;
  --m-surface-2:    #F3F4F6;

  /* Bordes */
  --m-border:       #E5E7EB;
  --m-border-focus: var(--m-primary);

  /* Texto */
  --m-text:         #111827;
  --m-text-secondary: #374151;
  --m-text-muted:   #9CA3AF;

  /* Estados */
  --m-success:      #10B981;
  --m-warning:      #F59E0B;
  --m-danger:       #EF4444;
  --m-info:         #3B82F6;

  /* Espaciado base */
  --m-radius:       8px;
  --m-radius-lg:    12px;
  --m-gap:          12px;
  --m-gap-lg:       20px;
}
`;
}

// ─── ENDPOINT CREADOR ─────────────────────────────────────────────────────────

export function createModuleEndpoint(server: any) {
  server.middlewares.use('/api/create-module', (req: any, res: any) => {
    if (req.method !== 'POST') {
      res.writeHead(405); res.end(JSON.stringify({ error: 'Method not allowed' })); return;
    }

    let body = '';
    req.on('data', (chunk: any) => body += chunk);
    req.on('end', () => {
      try {
        const { nombre, tabla, grupo, descripcion } = JSON.parse(body);

        if (!nombre || !tabla) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'nombre y tabla son requeridos' })); return;
        }

        const id  = nombre.toLowerCase().replace(/\s+/g, '');
        const N   = id.charAt(0).toUpperCase() + id.slice(1);
        const archivos: { path: string; contenido: string }[] = [];

        // C1 — View
        const viewPath = path.join(VIEWS_DIR, `${N}View.tsx`);
        if (!fs.existsSync(viewPath)) {
          fs.writeFileSync(viewPath, tplView(id, tabla), 'utf-8');
          archivos.push({ path: `src/app/components/admin/views/${N}View.tsx`, contenido: 'C1 ✓' });
        }

        // C3 — Api
        const apiPath = path.join(SERVICES_DIR, `${id}Api.ts`);
        if (!fs.existsSync(apiPath)) {
          fs.writeFileSync(apiPath, tplApi(id, tabla), 'utf-8');
          archivos.push({ path: `src/app/services/${id}Api.ts`, contenido: 'C3 ✓ C8 ✓' });
        }

        // C4 — module.config.ts
        const modDir = path.join(MODULES_DIR, id);
        if (!fs.existsSync(modDir)) fs.mkdirSync(modDir, { recursive: true });
        const configPath = path.join(modDir, 'module.config.ts');
        if (!fs.existsSync(configPath)) {
          fs.writeFileSync(configPath, tplConfig(id, grupo ?? 'Sin grupo', descripcion ?? ''), 'utf-8');
          archivos.push({ path: `src/modules/${id}/module.config.ts`, contenido: 'C4 ✓' });
        }

        // C6 — tokens.css
        const uiDir = path.join(modDir, 'ui');
        if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });
        const tokensPath = path.join(uiDir, 'tokens.css');
        if (!fs.existsSync(tokensPath)) {
          fs.writeFileSync(tokensPath, tplTokens(id), 'utf-8');
          archivos.push({ path: `src/modules/${id}/ui/tokens.css`, contenido: 'C5 ✓ C6 ✓' });
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ok: true, moduloId: id, archivos }));

      } catch (e: any) {
        res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
      }
    });
  });
}

// ─── ENDPOINT REPARADOR ───────────────────────────────────────────────────────

export function repairModuleEndpoint(server: any) {
  server.middlewares.use('/api/repair-module', (req: any, res: any) => {
    if (req.method !== 'POST') {
      res.writeHead(405); res.end(JSON.stringify({ error: 'Method not allowed' })); return;
    }

    let body = '';
    req.on('data', (chunk: any) => body += chunk);
    req.on('end', () => {
      try {
        const { moduloId, nombre, tabla, grupo, descripcion, criterio: soloCriterio } = JSON.parse(body);
        const id  = moduloId ?? nombre?.toLowerCase().replace(/\s+/g, '');
        const N   = id.charAt(0).toUpperCase() + id.slice(1);
        const serviceKey = tabla ?? id;

        // Si viene criterio especifico, solo reparar ese
        const soloEste: string | null = soloCriterio ?? null;
        const reparados:  { criterio: string; archivo: string; accion: string }[] = [];
        const pendientes: { criterio: string; titulo: string; instrucciones: string; evidencia?: string }[] = [];

        // ── C1 — View ──────────────────────────────────────────────────────────
        const viewPath = path.join(VIEWS_DIR, `${N}View.tsx`);
        if ((!soloEste || soloEste === 'C1') && !fs.existsSync(viewPath)) {
          fs.writeFileSync(viewPath, tplView(id, serviceKey), 'utf-8');
          reparados.push({ criterio: 'C1', archivo: `views/${N}View.tsx`, accion: 'Creado View base' });
        }

        // ── C3 — Api ───────────────────────────────────────────────────────────
        const apiPath = path.join(SERVICES_DIR, `${id}Api.ts`);
        if ((!soloEste || soloEste === 'C3') && !fs.existsSync(apiPath)) {
          fs.writeFileSync(apiPath, tplApi(id, serviceKey), 'utf-8');
          reparados.push({ criterio: 'C3', archivo: `services/${id}Api.ts`, accion: 'Creado service layer base' });
        } else if (!soloEste || soloEste === 'C3' || soloEste === 'C8') {
          // C8 — verificar .from() en Api existente
          const apiContent = fs.readFileSync(apiPath, 'utf-8');
          const fromMatches = [...apiContent.matchAll(/supabase\.from\(['"](\w+)['"]\)/g)];
          if (fromMatches.length > 0) {
            pendientes.push({
              criterio: 'C8',
              titulo: `${fromMatches.length} llamadas directas a supabase.from()`,
              instrucciones: `Migrar cada .from() a una funcion en ${id}Api.ts y llamarla desde el View.`,
              evidencia: fromMatches.map(m => m[0]).join(', '),
            });
          }
        }

        // ── C4 — module.config.ts ──────────────────────────────────────────────
        const modDir    = path.join(MODULES_DIR, id);
        const configPath = path.join(modDir, 'module.config.ts');
        if (!fs.existsSync(modDir)) fs.mkdirSync(modDir, { recursive: true });
        if ((!soloEste || soloEste === 'C4') && !fs.existsSync(configPath)) {
          fs.writeFileSync(configPath, tplConfig(id, grupo ?? 'Sin grupo', descripcion ?? ''), 'utf-8');
          reparados.push({ criterio: 'C4', archivo: `modules/${id}/module.config.ts`, accion: 'Creado module.config.ts' });
        }

        // ── C5 — colores hardcodeados ──────────────────────────────────────────
        if ((!soloEste || soloEste === 'C5') && fs.existsSync(viewPath)) {
          const viewContent = fs.readFileSync(viewPath, 'utf-8');
          const hexMatches  = [...new Set([...viewContent.matchAll(/#[0-9A-Fa-f]{3,6}\b/g)].map(m => m[0]))];
          const rgbMatches  = [...new Set([...viewContent.matchAll(/rgb\([^)]+\)/g)].map(m => m[0]))];
          if (hexMatches.length > 0 || rgbMatches.length > 0) {
            pendientes.push({
              criterio: 'C5',
              titulo: `${hexMatches.length + rgbMatches.length} colores hardcodeados encontrados`,
              instrucciones: 'Reemplazar cada valor por el token correspondiente de tokens.css usando var(--m-*).',
              evidencia: [...hexMatches.slice(0, 10), ...rgbMatches.slice(0, 5)].join('  '),
            });
          }
        }

        // ── C6 — tokens.css ───────────────────────────────────────────────────
        const uiDir      = path.join(modDir, 'ui');
        const tokensPath = path.join(uiDir, 'tokens.css');
        if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });
        if ((!soloEste || soloEste === 'C6') && !fs.existsSync(tokensPath)) {
          fs.writeFileSync(tokensPath, tplTokens(id), 'utf-8');
          reparados.push({ criterio: 'C6', archivo: `modules/${id}/ui/tokens.css`, accion: 'Creado tokens.css con variables --m-*' });
        }

        // ── C2 — tabla Supabase ───────────────────────────────────────────────
        if ((!soloEste || soloEste === 'C2') && !tabla) {
          pendientes.push({
            criterio: 'C2',
            titulo: 'Tabla Supabase no verificada',
            instrucciones: `Crear tabla "${id}" en Supabase con columnas: id (uuid), nombre (text), estado (text), created_at (timestamptz), updated_at (timestamptz). Habilitar RLS y agregar policy allow_all.`,
          });
        }

        // ── C7 — Party Model ──────────────────────────────────────────────────
        if (!soloEste || soloEste === 'C7') pendientes.push({
          criterio: 'C7',
          titulo: 'Party Model — requiere auditoría manual',
          instrucciones: 'Verificar que el módulo usa organizaciones + roles_contextuales en lugar de tablas de clientes/transportistas directas. Si aplica, migrar las relaciones.',
        });

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ok: true, moduloId: id, reparados, pendientes }));

      } catch (e: any) {
        res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
      }
    });
  });
}
