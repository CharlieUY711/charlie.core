/**
 * ChecklistShell.tsx
 * Charlie Platform — Séptimo elemento de la capa de presentación.
 *
 * Muestra el estado de cumplimiento C1–C8 de cualquier módulo.
 * Reutilizable: Constructor, Checklist & Roadmap, auto-auditoría de módulos.
 *
 * C5: Zero colores hardcodeados — solo var(--m-*)
 */
import React from 'react';
import type { CriterioId, CriterioEstado } from '../types';

// ── Constantes ────────────────────────────────────────────────────────────────

const CRITERIOS_META: Array<{
  id:          CriterioId;
  label:       string;
  descripcion: string;
  howToFix:    string;
}> = [
  { id: 'C1', label: 'Vista (UI)',            descripcion: 'Componente React exportado con isReal: true',            howToFix: 'Crear el componente y registrarlo en componentRegistry.ts' },
  { id: 'C2', label: 'Backend (DB)',           descripcion: 'Tabla accesible en Supabase del tenant',                howToFix: 'Crear schema.sql idempotente y ejecutarlo en el tenant' },
  { id: 'C3', label: 'Service layer',          descripcion: 'Existe {id}Api.ts con getAll/getById/create/update/remove', howToFix: 'Crear el service layer con las 5 funciones base' },
  { id: 'C4', label: 'module.config.ts',       descripcion: 'Existe src/modules/{id}/module.config.ts',             howToFix: 'Crear module.config.ts siguiendo el template oficial' },
  { id: 'C5', label: 'Sin hardcode',           descripcion: 'grep #HEX y rgb() en viewFile = 0 ocurrencias',        howToFix: 'Reemplazar cada valor por el token CSS --m-* correspondiente' },
  { id: 'C6', label: 'Tokens CSS',             descripcion: 'Existe ui/tokens.css con fallbacks --m-*',             howToFix: 'Crear tokens.css con los fallbacks del estándar' },
  { id: 'C7', label: 'Party Model',            descripcion: 'Usa organizaciones + roles_contextuales',              howToFix: 'Migrar drawer a búsqueda en organizaciones primero' },
  { id: 'C8', label: 'Data Zero (Conjuntos)',  descripcion: 'useTable() con nombre semántico, nunca supabase.from() en view', howToFix: 'Mover toda lógica Supabase al {id}Api.ts' },
];

const ESTADO_COLOR: Record<CriterioEstado, string> = {
  ok:      'var(--m-color-ok)',
  warn:    'var(--m-color-warn)',
  error:   'var(--m-color-error)',
  pending: 'var(--m-color-pending)',
};

const ESTADO_SYMBOL: Record<CriterioEstado, string> = {
  ok: '✓', warn: '●', error: '✕', pending: '○',
};

const ESTADO_LABEL: Record<CriterioEstado, string> = {
  ok: 'OK', warn: 'Parcial', error: 'Error', pending: 'Pendiente',
};

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface ChecklistShellProps {
  moduleId:   string;
  moduleName: string;
  criterios:  Partial<Record<CriterioId, CriterioEstado>>;
  onUpdate?:  (id: CriterioId, estado: CriterioEstado) => void;
  readonly?:  boolean;
  compact?:   boolean;
}

// ── Modo compacto — fila de badges ────────────────────────────────────────────

function ChecklistCompact({ criterios }: { criterios: Partial<Record<CriterioId, CriterioEstado>> }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--m-space-1)', flexWrap: 'wrap' as const }}>
      {CRITERIOS_META.map(c => {
        const estado = criterios[c.id] ?? 'pending';
        const color  = ESTADO_COLOR[estado];
        return (
          <span
            key={c.id}
            title={`${c.id} — ${c.label}: ${ESTADO_LABEL[estado]}`}
            style={{
              fontSize:   10,
              fontWeight: 700,
              color,
            }}
          >
            {c.id} {ESTADO_SYMBOL[estado]}
          </span>
        );
      })}
    </div>
  );
}

// ── Modo completo — tabla de criterios ────────────────────────────────────────

function ChecklistCompleto({
  criterios,
  onUpdate,
  readonly,
}: {
  criterios: Partial<Record<CriterioId, CriterioEstado>>;
  onUpdate?: (id: CriterioId, estado: CriterioEstado) => void;
  readonly?: boolean;
}) {
  const ESTADO_OPTS: CriterioEstado[] = ['ok', 'warn', 'error', 'pending'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-2)' }}>
      {CRITERIOS_META.map(c => {
        const estado = criterios[c.id] ?? 'pending';
        const color  = ESTADO_COLOR[estado];

        return (
          <div
            key={c.id}
            style={{
              display:         'flex',
              alignItems:      'flex-start',
              gap:             'var(--m-space-3)',
              padding:         'var(--m-space-3) var(--m-space-4)',
              backgroundColor: 'var(--m-color-surface)',
              border:          `1px solid ${estado === 'error' ? 'var(--m-color-error)' : 'var(--m-color-border)'}`,
              borderRadius:    'var(--m-radius-md)',
              borderLeft:      `3px solid ${color}`,
            }}
          >
            {/* ID */}
            <span style={{
              fontSize:   11,
              fontWeight: 800,
              color,
              minWidth:   24,
              paddingTop: 1,
              flexShrink: 0,
            }}>
              {c.id}
            </span>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--m-color-text)', marginBottom: 2 }}>
                {c.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--m-color-text-muted)', lineHeight: 1.4 }}>
                {c.descripcion}
              </div>
              {estado === 'error' && (
                <div style={{
                  fontSize:        11,
                  color:           'var(--m-color-error)',
                  marginTop:       'var(--m-space-1)',
                  padding:         '4px 8px',
                  backgroundColor: 'var(--m-color-error-soft)',
                  borderRadius:    'var(--m-radius-sm)',
                }}>
                  💡 {c.howToFix}
                </div>
              )}
            </div>

            {/* Estado selector o badge */}
            {!readonly && onUpdate ? (
              <select
                value={estado}
                onChange={e => onUpdate(c.id, e.target.value as CriterioEstado)}
                onClick={e => e.stopPropagation()}
                style={{
                  fontSize:        11,
                  fontWeight:      700,
                  padding:         '3px 6px',
                  borderRadius:    'var(--m-radius-sm)',
                  border:          `1px solid ${color}`,
                  backgroundColor: color + '22',
                  color,
                  cursor:          'pointer',
                  flexShrink:      0,
                }}
              >
                {ESTADO_OPTS.map(e => (
                  <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
                ))}
              </select>
            ) : (
              <span style={{
                fontSize:        10,
                fontWeight:      700,
                padding:         '3px 8px',
                borderRadius:    'var(--m-radius-sm)',
                backgroundColor: color + '22',
                color,
                border:          `1px solid ${color}44`,
                flexShrink:      0,
                whiteSpace:      'nowrap' as const,
              }}>
                {ESTADO_SYMBOL[estado]} {ESTADO_LABEL[estado]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ChecklistShell({
  moduleId,
  moduleName,
  criterios,
  onUpdate,
  readonly  = false,
  compact   = false,
}: ChecklistShellProps) {

  const score     = Object.values(criterios).filter(v => v === 'ok').length;
  const scoreColor = score >= 8
    ? 'var(--m-color-ok)'
    : score >= 4
    ? 'var(--m-color-warn)'
    : 'var(--m-color-error)';

  if (compact) {
    return <ChecklistCompact criterios={criterios} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-4)' }}>

      {/* Header */}
      <div style={{
        display:         'flex',
        alignItems:      'center',
        gap:             'var(--m-space-3)',
        padding:         'var(--m-space-3) var(--m-space-4)',
        backgroundColor: 'var(--m-color-surface)',
        border:          '1px solid var(--m-color-border)',
        borderRadius:    'var(--m-radius-md)',
      }}>
        {/* Score */}
        <div style={{
          width:           40,
          height:          40,
          borderRadius:    '50%',
          border:          `3px solid ${scoreColor}`,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          fontSize:        14,
          fontWeight:      800,
          color:           scoreColor,
          flexShrink:      0,
        }}>
          {score}/8
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--m-color-text)' }}>
            {moduleName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--m-color-text-muted)', fontFamily: 'var(--m-font-mono)' }}>
            {moduleId}
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ width: 120 }}>
          <div style={{ fontSize: 10, color: 'var(--m-color-text-muted)', marginBottom: 4, textAlign: 'right' as const }}>
            {Math.round(score / 8 * 100)}% completo
          </div>
          <div style={{ height: 6, backgroundColor: 'var(--m-color-surface-2)', borderRadius: 3 }}>
            <div style={{
              height:          '100%',
              width:           `${score / 8 * 100}%`,
              backgroundColor: scoreColor,
              borderRadius:    3,
              transition:      'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Criterios */}
      <ChecklistCompleto
        criterios={criterios}
        onUpdate={onUpdate}
        readonly={readonly}
      />
    </div>
  );
}
