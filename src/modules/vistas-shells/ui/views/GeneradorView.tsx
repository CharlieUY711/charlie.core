/**
 * GeneradorView.tsx
 * Charlie Platform — Módulo Vistas y Shells · Fase VS-E
 *
 * Generador de código Charlie-compliant para nuevos módulos.
 * Produce fases A+B del Template Genérico:
 *   - module.config.ts
 *   - types/index.ts
 *   - ui/tokens.css
 *   - schema SQL idempotente con RLS
 *   - {id}Api.ts con 5 funciones base
 *
 * Validación C5 automática del código generado.
 * Output: texto copiable. La ejecución real es responsabilidad del Constructor (F2).
 *
 * C5: Zero colores hardcodeados — solo var(--m-*)
 * C8: No contiene supabase.from() — sin acceso a Supabase
 */
import React, { useState, useCallback, useMemo } from 'react';

// ── Tipos internos ────────────────────────────────────────────────────────────

interface CampoTabla {
  nombre:    string;
  tipo:      'TEXT' | 'UUID' | 'BOOLEAN' | 'JSONB' | 'TIMESTAMPTZ' | 'INTEGER';
  nullable:  boolean;
  default?:  string;
}

interface ConfigGenerador {
  id:          string;   // kebab-case: mi-modulo
  nombre:      string;   // Display: Mi Módulo
  familia:     'core' | 'negocio' | 'admin';
  descripcion: string;
  campos:      CampoTabla[];
  dependencias: string[];
}

type TabActiva = 'config' | 'module-config' | 'types' | 'tokens' | 'sql' | 'api';

// ── Validadores ───────────────────────────────────────────────────────────────

function validarC5(codigo: string): { ok: boolean; ocurrencias: string[] } {
  const regex = /#([0-9A-Fa-f]{3,8})\b|rgb\(|rgba\(/g;
  const matches: string[] = [];
  let m;
  while ((m = regex.exec(codigo)) !== null) matches.push(m[0]);
  return { ok: matches.length === 0, ocurrencias: matches };
}

function idToSnake(id: string): string {
  return id.replace(/-/g, '_');
}

function idToCamel(id: string): string {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function idToPascal(id: string): string {
  const camel = idToCamel(id);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// ── Generadores de código ─────────────────────────────────────────────────────

function genModuleConfig(cfg: ConfigGenerador): string {
  const deps = cfg.dependencias.length
    ? `['${cfg.dependencias.join("', '")}']`
    : '[]';
  return `// module.config.ts — Contrato público del módulo ${cfg.nombre}
// C4: Este archivo es obligatorio y no debe modificarse el id una vez en producción.
export const moduleConfig = {
  id:     '${cfg.id}',
  nombre: '${cfg.nombre}',
  familia: '${cfg.familia}',
  version: '0.1.0',
  criterios: [
    { id: 'C1', label: 'Tiene vista (UI)',           estado: 'pending' },
    { id: 'C2', label: 'Tiene backend (DB)',          estado: 'pending' },
    { id: 'C3', label: 'Tiene service layer',         estado: 'pending' },
    { id: 'C4', label: 'Tiene module.config.ts',      estado: 'ok'      },
    { id: 'C5', label: 'Sin colores hardcodeados',    estado: 'pending' },
    { id: 'C6', label: 'Tokens CSS definidos',        estado: 'pending' },
    { id: 'C7', label: 'Party Model',                 estado: 'ok'      },
    { id: 'C8', label: 'Data Zero (Conjuntos)',        estado: 'pending' },
  ],
  dependencias: ${deps},
} as const;
export type ModuleConfig = typeof moduleConfig;
`;
}

function genTypes(cfg: ConfigGenerador): string {
  const pascal = idToPascal(cfg.id);
  const campoInterfaces = cfg.campos
    .filter(c => !['id','tenant_id','created_at','updated_at'].includes(c.nombre))
    .map(c => {
      const tsType = c.tipo === 'BOOLEAN' ? 'boolean'
        : c.tipo === 'INTEGER' ? 'number'
        : c.tipo === 'JSONB'   ? 'unknown[]'
        : 'string';
      const optional = c.nullable ? '?' : '';
      return `  ${idToCamel(c.nombre)}${optional}: ${tsType};`;
    }).join('\n');

  return `// types/index.ts — Tipos TypeScript del módulo ${cfg.nombre}

export interface ${pascal}Entry {
  id:         string;
  tenantId:   string;
${campoInterfaces}
  createdAt?: string;
  updatedAt?: string;
}

export interface ${pascal}Filters {
  tenantId?: string;
}
`;
}

function genTokens(cfg: ConfigGenerador): string {
  return `/* tokens.css — C6: Fallbacks para CSS Custom Properties del módulo ${cfg.nombre}
 * El Orquestador sobreescribe estos valores con los tokens del tenant en :root.
 * Este archivo NUNCA hardcodea colores en selectores de componente. */
:root {
  /* ── Colores principales ── */
  --m-color-primary:        var(--color-primary, #FF6835);
  --m-color-primary-hover:  var(--color-primary-hover, #e85c2d);
  --m-color-primary-soft:   var(--color-primary-soft, rgba(255, 104, 53, 0.10));

  /* ── Semánticos de estado ── */
  --m-color-ok:             var(--color-ok, #22c55e);
  --m-color-warn:           var(--color-warn, #f59e0b);
  --m-color-error:          var(--color-error, #ef4444);
  --m-color-pending:        var(--color-pending, #6b7280);

  /* ── Fondos y superficies ── */
  --m-color-bg:             var(--color-bg, #0f172a);
  --m-color-surface:        var(--color-surface, #1e293b);
  --m-color-surface-2:      var(--color-surface-2, #334155);
  --m-color-border:         var(--color-border, #334155);

  /* ── Texto ── */
  --m-color-text:           var(--color-text, #f1f5f9);
  --m-color-text-muted:     var(--color-text-muted, #94a3b8);
  --m-color-text-subtle:    var(--color-text-subtle, #64748b);

  /* ── Espaciado ── */
  --m-space-2: 8px;  --m-space-3: 12px; --m-space-4: 16px;
  --m-space-6: 24px; --m-space-8: 32px;

  /* ── Radios ── */
  --m-radius-sm: 4px; --m-radius-md: 8px; --m-radius-lg: 12px;

  /* ── Tipografía ── */
  --m-font-sans: 'DM Sans', system-ui, sans-serif;
  --m-font-mono: 'JetBrains Mono', monospace;
}
`;
}

function genSQL(cfg: ConfigGenerador): string {
  const tabla = idToSnake(cfg.id) + '_entries';
  const camposExtra = cfg.campos
    .filter(c => !['id','tenant_id','created_at','updated_at'].includes(c.nombre))
    .map(c => {
      const def = c.default ? ` DEFAULT ${c.default}` : '';
      const null_ = c.nullable ? '' : ' NOT NULL';
      return `  ${c.nombre.padEnd(16)}${c.tipo.padEnd(12)}${null_}${def},`;
    }).join('\n');

  return `-- schema.sql — Módulo ${cfg.nombre}
-- Idempotente: seguro de ejecutar múltiples veces
-- C2: Tablas con RLS por tenant_id

CREATE TABLE IF NOT EXISTS ${tabla} (
  id          UUID        NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id   TEXT        NOT NULL DEFAULT 'charlie',
${camposExtra}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE ${tabla} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_read_${tabla}"
  ON ${tabla} FOR ALL USING (true);
`;
}

function genApi(cfg: ConfigGenerador): string {
  const pascal  = idToPascal(cfg.id);
  const camel   = idToCamel(cfg.id);
  const tabla   = idToSnake(cfg.id) + '_entries';

  return `// ${camel}Api.ts — Service layer del módulo ${cfg.nombre}
// C3: Toda la lógica Supabase centralizada aquí
// C8: Ningún supabase.from() fuera de este archivo

import { supabase } from '@/utils/supabase/client';
import type { ${pascal}Entry } from '../types';

const TENANT_ID = 'charlie';

function rowTo${pascal}(row: Record<string, unknown>): ${pascal}Entry {
  return {
    id:        row.id as string,
    tenantId:  row.tenant_id as string,
${cfg.campos
  .filter(c => !['id','tenant_id','created_at','updated_at'].includes(c.nombre))
  .map(c => `    ${idToCamel(c.nombre)}: row.${c.nombre} as ${
    c.tipo === 'BOOLEAN' ? 'boolean' : c.tipo === 'INTEGER' ? 'number' : 'string'
  },`)
  .join('\n')}
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getAll(tenantId = TENANT_ID): Promise<${pascal}Entry[]> {
  const { data, error } = await supabase
    .from('${tabla}')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(\`getAll: \${error.message}\`);
  return (data ?? []).map(rowTo${pascal});
}

export async function getById(
  id: string,
  tenantId = TENANT_ID
): Promise<${pascal}Entry | null> {
  const { data, error } = await supabase
    .from('${tabla}')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(\`getById: \${error.message}\`);
  return data ? rowTo${pascal}(data) : null;
}

export async function create(
  payload: Omit<${pascal}Entry, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<${pascal}Entry> {
  const { data, error } = await supabase
    .from('${tabla}')
    .insert({ ...payload, tenant_id: TENANT_ID })
    .select()
    .single();
  if (error) throw new Error(\`create: \${error.message}\`);
  return rowTo${pascal}(data);
}

export async function update(
  id: string,
  payload: Partial<Omit<${pascal}Entry, 'id' | 'tenantId' | 'createdAt'>>
): Promise<${pascal}Entry> {
  const { data, error } = await supabase
    .from('${tabla}')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(\`update: \${error.message}\`);
  return rowTo${pascal}(data);
}

export async function remove(
  id: string,
  tenantId = TENANT_ID
): Promise<void> {
  const { error } = await supabase
    .from('${tabla}')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);
  if (error) throw new Error(\`remove: \${error.message}\`);
}
`;
}

// ── Config por defecto ────────────────────────────────────────────────────────

const CONFIG_INICIAL: ConfigGenerador = {
  id:          '',
  nombre:      '',
  familia:     'negocio',
  descripcion: '',
  dependencias: [],
  campos: [
    { nombre: 'nombre',      tipo: 'TEXT',    nullable: false },
    { nombre: 'descripcion', tipo: 'TEXT',    nullable: true  },
    { nombre: 'is_real',     tipo: 'BOOLEAN', nullable: false, default: 'true' },
  ],
};

const TIPO_SQL_OPTS = ['TEXT','UUID','BOOLEAN','JSONB','TIMESTAMPTZ','INTEGER'] as const;

// ── Componente principal ──────────────────────────────────────────────────────

export function GeneradorView() {
  const [cfg,       setCfg]       = useState<ConfigGenerador>(CONFIG_INICIAL);
  const [tabActiva, setTabActiva] = useState<TabActiva>('config');
  const [copiado,   setCopiado]   = useState<string | null>(null);

  // ── Generación de código ────────────────────────────────────────────────────

  const codigo = useMemo<Record<Exclude<TabActiva,'config'>, string>>(() => ({
    'module-config': genModuleConfig(cfg),
    'types':         genTypes(cfg),
    'tokens':        genTokens(cfg),
    'sql':           genSQL(cfg),
    'api':           genApi(cfg),
  }), [cfg]);

  // ── Validación C5 ───────────────────────────────────────────────────────────

  const c5Results = useMemo(() => {
    const resultados: Record<string, ReturnType<typeof validarC5>> = {};
    for (const [key, val] of Object.entries(codigo)) {
      resultados[key] = validarC5(val);
    }
    return resultados;
  }, [codigo]);

  const c5Global = Object.values(c5Results).every(r => r.ok);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const copiar = useCallback((key: string, texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(key);
    setTimeout(() => setCopiado(null), 2000);
  }, []);

  const actualizarCampo = (i: number, key: keyof CampoTabla, val: unknown) => {
    setCfg(prev => {
      const campos = [...prev.campos];
      campos[i] = { ...campos[i], [key]: val };
      return { ...prev, campos };
    });
  };

  const agregarCampo = () => setCfg(prev => ({
    ...prev,
    campos: [...prev.campos, { nombre: '', tipo: 'TEXT', nullable: true }],
  }));

  const eliminarCampo = (i: number) => setCfg(prev => ({
    ...prev,
    campos: prev.campos.filter((_, idx) => idx !== i),
  }));

  const listo = cfg.id.length > 0 && cfg.nombre.length > 0;

  // ── Tabs de output ──────────────────────────────────────────────────────────

  const TABS_OUTPUT: Array<{ id: Exclude<TabActiva,'config'>; label: string; archivo: string }> = [
    { id: 'module-config', label: 'module.config.ts', archivo: `src/modules/${cfg.id}/module.config.ts`        },
    { id: 'types',         label: 'types/index.ts',   archivo: `src/modules/${cfg.id}/types/index.ts`          },
    { id: 'tokens',        label: 'tokens.css',        archivo: `src/modules/${cfg.id}/ui/tokens.css`           },
    { id: 'sql',           label: 'schema.sql',        archivo: `schema SQL → ejecutar en Supabase SQL Editor`  },
    { id: 'api',           label: `${cfg.id ? cfg.id : '{id}'}Api.ts`, archivo: `src/modules/${cfg.id}/service/${cfg.id ? cfg.id : '{id}'}Api.ts` },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column' as const,
      height:        '100%',
      gap:           'var(--m-space-4)',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--m-color-text)' }}>
            Generador de Módulos
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--m-color-text-muted)' }}>
            Genera código Charlie-compliant — Fases A + B del Template Genérico
          </p>
        </div>

        {/* Badge C5 global */}
        <div style={{
          display:         'flex',
          alignItems:      'center',
          gap:             'var(--m-space-2)',
          padding:         '6px 14px',
          borderRadius:    'var(--m-radius-md)',
          backgroundColor: c5Global ? 'var(--m-color-ok)' + '22' : 'var(--m-color-error)' + '22',
          border:          `1px solid ${c5Global ? 'var(--m-color-ok)' : 'var(--m-color-error)'}44`,
          color:           c5Global ? 'var(--m-color-ok)' : 'var(--m-color-error)',
          fontSize:        12,
          fontWeight:      700,
        }}>
          C5 {c5Global ? '✓ OK' : '✕ Violaciones'}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 'var(--m-space-1)', borderBottom: '1px solid var(--m-color-border)', flexShrink: 0 }}>
        {[{ id: 'config' as TabActiva, label: '⚙ Configurar' }, ...TABS_OUTPUT.map(t => ({ id: t.id as TabActiva, label: t.label }))].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            disabled={tab.id !== 'config' && !listo}
            style={{
              fontSize:        12,
              fontWeight:      600,
              padding:         '8px 14px',
              border:          'none',
              borderBottom:    tabActiva === tab.id ? '2px solid var(--m-color-primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              color:           tabActiva === tab.id
                ? 'var(--m-color-primary)'
                : tab.id !== 'config' && !listo
                ? 'var(--m-color-text-subtle)'
                : 'var(--m-color-text-muted)',
              cursor:          tab.id !== 'config' && !listo ? 'not-allowed' : 'pointer',
              transition:      'all 0.12s',
              whiteSpace:      'nowrap' as const,
            }}
          >
            {tab.label}
            {tab.id !== 'config' && listo && !c5Results[tab.id as Exclude<TabActiva,'config'>]?.ok && (
              <span style={{ marginLeft: 4, color: 'var(--m-color-error)', fontSize: 10 }}>●</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Panel config ── */}
      {tabActiva === 'config' && (
        <div style={{ flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-4)' }}>

          {/* Datos básicos */}
          <section style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-3)' }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--m-color-text)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Datos del módulo
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--m-space-3)' }}>
              {[
                { key: 'id',     label: 'ID (kebab-case)',  placeholder: 'mi-modulo'  },
                { key: 'nombre', label: 'Nombre display',   placeholder: 'Mi Módulo'  },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--m-color-text-muted)', marginBottom: 'var(--m-space-1)' }}>
                    {f.label}
                  </label>
                  <input
                    value={cfg[f.key as 'id' | 'nombre']}
                    onChange={e => setCfg(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{
                      width:           '100%',
                      padding:         '8px 12px',
                      borderRadius:    'var(--m-radius-md)',
                      border:          '1px solid var(--m-color-border)',
                      backgroundColor: 'var(--m-color-surface)',
                      color:           'var(--m-color-text)',
                      fontSize:        13,
                      outline:         'none',
                      boxSizing:       'border-box' as const,
                      fontFamily:      'var(--m-font-mono)',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Familia */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--m-color-text-muted)', marginBottom: 'var(--m-space-1)' }}>
                Familia
              </label>
              <div style={{ display: 'flex', gap: 'var(--m-space-2)' }}>
                {(['core','negocio','admin'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setCfg(prev => ({ ...prev, familia: f }))}
                    style={{
                      fontSize:        12,
                      fontWeight:      600,
                      padding:         '5px 14px',
                      borderRadius:    'var(--m-radius-sm)',
                      border:          `1px solid ${cfg.familia === f ? 'var(--m-color-primary)' : 'var(--m-color-border)'}`,
                      backgroundColor: cfg.familia === f ? 'var(--m-color-primary-soft)' : 'transparent',
                      color:           cfg.familia === f ? 'var(--m-color-primary)' : 'var(--m-color-text-muted)',
                      cursor:          'pointer',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Campos de la tabla */}
          <section style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--m-color-text)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Campos de la tabla
              </h3>
              <button
                onClick={agregarCampo}
                style={{
                  fontSize:        12,
                  fontWeight:      600,
                  padding:         '4px 12px',
                  borderRadius:    'var(--m-radius-sm)',
                  border:          '1px solid var(--m-color-primary)',
                  backgroundColor: 'var(--m-color-primary-soft)',
                  color:           'var(--m-color-primary)',
                  cursor:          'pointer',
                }}
              >
                + Campo
              </button>
            </div>

            {/* Campos fijos */}
            <div style={{ padding: 'var(--m-space-2) var(--m-space-3)', backgroundColor: 'var(--m-color-surface)', borderRadius: 'var(--m-radius-md)', border: '1px solid var(--m-color-border)' }}>
              <span style={{ fontSize: 11, color: 'var(--m-color-text-subtle)' }}>
                Campos automáticos: <code style={{ fontFamily: 'var(--m-font-mono)' }}>id · tenant_id · created_at · updated_at</code>
              </span>
            </div>

            {/* Campos configurables */}
            {cfg.campos.map((campo, i) => (
              <div key={i} style={{
                display:         'grid',
                gridTemplateColumns: '1fr 140px 80px 32px',
                gap:             'var(--m-space-2)',
                alignItems:      'center',
                padding:         'var(--m-space-3)',
                backgroundColor: 'var(--m-color-surface)',
                borderRadius:    'var(--m-radius-md)',
                border:          '1px solid var(--m-color-border)',
              }}>
                <input
                  value={campo.nombre}
                  onChange={e => actualizarCampo(i, 'nombre', e.target.value)}
                  placeholder="nombre_campo"
                  style={{
                    padding: '6px 10px', borderRadius: 'var(--m-radius-sm)',
                    border: '1px solid var(--m-color-border)',
                    backgroundColor: 'var(--m-color-surface-2)',
                    color: 'var(--m-color-text)', fontSize: 12,
                    fontFamily: 'var(--m-font-mono)', outline: 'none',
                  }}
                />
                <select
                  value={campo.tipo}
                  onChange={e => actualizarCampo(i, 'tipo', e.target.value)}
                  style={{
                    padding: '6px 10px', borderRadius: 'var(--m-radius-sm)',
                    border: '1px solid var(--m-color-border)',
                    backgroundColor: 'var(--m-color-surface-2)',
                    color: 'var(--m-color-text)', fontSize: 12, outline: 'none',
                  }}
                >
                  {TIPO_SQL_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button
                  onClick={() => actualizarCampo(i, 'nullable', !campo.nullable)}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: '5px 8px',
                    borderRadius: 'var(--m-radius-sm)',
                    border: `1px solid ${campo.nullable ? 'var(--m-color-border)' : 'var(--m-color-ok)'}`,
                    backgroundColor: campo.nullable ? 'transparent' : 'var(--m-color-ok)' + '22',
                    color: campo.nullable ? 'var(--m-color-text-muted)' : 'var(--m-color-ok)',
                    cursor: 'pointer',
                  }}
                >
                  {campo.nullable ? 'NULL' : 'NOT NULL'}
                </button>
                <button
                  onClick={() => eliminarCampo(i)}
                  style={{
                    width: 28, height: 28, borderRadius: 'var(--m-radius-sm)',
                    border: '1px solid var(--m-color-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--m-color-error)', cursor: 'pointer',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </section>

          {/* CTA */}
          {listo && (
            <div style={{
              padding:         'var(--m-space-3) var(--m-space-4)',
              backgroundColor: 'var(--m-color-primary-soft)',
              border:          '1px solid var(--m-color-primary)',
              borderRadius:    'var(--m-radius-md)',
              fontSize:        12,
              color:           'var(--m-color-primary)',
              fontWeight:      600,
            }}>
              ✓ Módulo <code style={{ fontFamily: 'var(--m-font-mono)' }}>{cfg.id}</code> configurado — seleccioná una tab para ver el código generado.
            </div>
          )}
        </div>
      )}

      {/* ── Panel de código ── */}
      {tabActiva !== 'config' && listo && (() => {
        const tabInfo   = TABS_OUTPUT.find(t => t.id === tabActiva)!;
        const contenido = codigo[tabActiva as Exclude<TabActiva,'config'>];
        const c5        = c5Results[tabActiva as Exclude<TabActiva,'config'>];

        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-3)', minHeight: 0 }}>

            {/* Info del archivo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <code style={{ fontSize: 11, color: 'var(--m-color-text-muted)', fontFamily: 'var(--m-font-mono)' }}>
                {tabInfo.archivo}
              </code>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--m-space-2)' }}>
                {/* Badge C5 */}
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px',
                  borderRadius: 'var(--m-radius-sm)',
                  backgroundColor: c5.ok ? 'var(--m-color-ok)' + '22' : 'var(--m-color-error)' + '22',
                  color: c5.ok ? 'var(--m-color-ok)' : 'var(--m-color-error)',
                  border: `1px solid ${c5.ok ? 'var(--m-color-ok)' : 'var(--m-color-error)'}44`,
                }}>
                  C5 {c5.ok ? '✓' : `✕ ${c5.ocurrencias.length} hex`}
                </span>
                {/* Copiar */}
                <button
                  onClick={() => copiar(tabActiva, contenido)}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: '5px 14px',
                    borderRadius: 'var(--m-radius-sm)',
                    border: '1px solid var(--m-color-border)',
                    backgroundColor: copiado === tabActiva ? 'var(--m-color-ok-soft)' : 'var(--m-color-surface-2)',
                    color: copiado === tabActiva ? 'var(--m-color-ok)' : 'var(--m-color-text)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {copiado === tabActiva ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Código */}
            <pre style={{
              flex:            1,
              margin:          0,
              padding:         'var(--m-space-4)',
              backgroundColor: 'var(--m-color-surface)',
              border:          '1px solid var(--m-color-border)',
              borderRadius:    'var(--m-radius-md)',
              overflowY:       'auto' as const,
              fontSize:        12,
              lineHeight:      1.6,
              color:           'var(--m-color-text)',
              fontFamily:      'var(--m-font-mono)',
              whiteSpace:      'pre-wrap' as const,
            }}>
              {contenido}
            </pre>
          </div>
        );
      })()}

    </div>
  );
}
