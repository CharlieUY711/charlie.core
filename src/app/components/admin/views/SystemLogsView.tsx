/**
 * System Logs — Registro de actividad y eventos del sistema
 */
import React, { useState, useMemo } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Search, Filter, Download, RefreshCw, ChevronDown, ChevronRight,
  Info, AlertTriangle, XCircle, CheckCircle2, Clock, Cpu, Database,
  Globe, Server, Shield, Zap, Activity, ScrollText,
} from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }

type LogLevel   = 'info' | 'warn' | 'error' | 'success' | 'debug';
type LogModule  = 'system' | 'auth' | 'database' | 'api' | 'edge' | 'storage' | 'roadmap' | 'integraciones' | 'herramientas' | 'ecommerce';

interface LogEntry {
  id: string;
  ts: Date;
  level: LogLevel;
  module: LogModule;
  message: string;
  detail?: string;
  duration?: number;
}

const LEVEL_META: Record<LogLevel, { label: string; color: string; bg: string; border: string; icon: any }> = {
  info:    { label: 'INFO',    color: 'var(--m-info)', bg: 'var(--m-info-bg)', border: 'var(--m-info-bg)', icon: Info        },
  warn:    { label: 'WARN',    color: 'var(--m-warning)', bg: 'var(--m-warning-bg)', border: 'var(--m-warning-bg)', icon: AlertTriangle },
  error:   { label: 'ERROR',   color: 'var(--m-danger)', bg: 'var(--m-danger-bg)', border: 'var(--m-danger-border)', icon: XCircle      },
  success: { label: 'OK',      color: 'var(--m-success)', bg: 'var(--m-success-bg)', border: 'var(--m-success-bg)', icon: CheckCircle2 },
  debug:   { label: 'DEBUG',   color: 'var(--m-text-muted)', bg: 'var(--m-surface-2)', border: 'var(--m-border)', icon: Cpu          },
};

const MODULE_META: Record<LogModule, { label: string; color: string; icon: any }> = {
  system:        { label: 'Sistema',       color: 'var(--m-text-muted)', icon: Server     },
  auth:          { label: 'Auth',          color: 'var(--m-purple)', icon: Shield     },
  database:      { label: 'Database',      color: 'var(--m-success)', icon: Database   },
  api:           { label: 'API',           color: 'var(--m-info)', icon: Globe      },
  edge:          { label: 'Edge',          color: 'var(--m-primary)', icon: Zap        },
  storage:       { label: 'Storage',       color: 'var(--m-warning)', icon: Cpu        },
  roadmap:       { label: 'Roadmap',       color: 'var(--m-purple)', icon: CheckCircle2 },
  integraciones: { label: 'Integraciones', color: '#EC4899', icon: Globe      },
  herramientas:  { label: 'Herramientas',  color: 'var(--m-success)', icon: Activity   },
  ecommerce:     { label: 'eCommerce',     color: 'var(--m-primary)', icon: Activity   },
};

// ─── Mock log data ────────────────────────────────────────────────────────────
const now = Date.now();
const mins = (m: number) => new Date(now - m * 60_000);

const LOGS: LogEntry[] = [
  // recent
  { id: 'l001', ts: mins(1),   level: 'success', module: 'edge',          message: '[Edge] Hono server respondió correctamente',                         duration: 42  },
  { id: 'l002', ts: mins(1),   level: 'info',    module: 'roadmap',       message: '[Roadmap] GET /modules → 67 módulos cargados desde KV',              duration: 38  },
  { id: 'l003', ts: mins(2),   level: 'success', module: 'database',      message: '[DB] kv_store — lectura OK',                                duration: 18  },
  { id: 'l004', ts: mins(3),   level: 'info',    module: 'system',        message: '[System] Módulo Checklist sincronizado — 6 herramientas workspace actualizadas a ui-only', detail: 'applyBuiltStatus() detectó diff entre manifest y KV — resync automático ejecutado' },
  { id: 'l005', ts: mins(5),   level: 'info',    module: 'roadmap',       message: '[Roadmap] POST /modules-bulk → 67 módulos guardados',                duration: 95  },
  { id: 'l006', ts: mins(7),   level: 'success', module: 'storage',       message: '[Storage] Bucket module-files — acceso OK',            duration: 55  },
  { id: 'l007', ts: mins(8),   level: 'warn',    module: 'api',           message: '[API] Plexo UV — sin credenciales (PLEXO_API_KEY no configurado)',     detail: 'Variables de entorno requeridas: PLEXO_API_KEY, PLEXO_MERCHANT_ID' },
  { id: 'l008', ts: mins(9),   level: 'warn',    module: 'api',           message: '[API] MercadoPago — MP_ACCESS_TOKEN no encontrado',                   detail: 'Configurar en Supabase → Edge Functions → Secrets' },
  { id: 'l009', ts: mins(10),  level: 'warn',    module: 'api',           message: '[API] Twilio — TWILIO_ACCOUNT_SID no configurado',                   },
  { id: 'l010', ts: mins(12),  level: 'info',    module: 'auth',          message: '[Auth] Sesión verificada — usuario admin',                           duration: 12  },
  { id: 'l011', ts: mins(15),  level: 'success', module: 'roadmap',       message: '[Roadmap] Resync manifest completado — 6 nuevas entradas detectadas',  detail: 'tools-library, tools-image-editor, tools-documents, tools-quotes, tools-ocr, tools-print → ui-only' },
  { id: 'l012', ts: mins(20),  level: 'info',    module: 'herramientas',  message: '[Herramientas] BibliotecaWorkspace montado — listo para uso',         },
  { id: 'l013', ts: mins(22),  level: 'info',    module: 'herramientas',  message: '[Herramientas] EditorImagenesWorkspace montado',                      },
  { id: 'l014', ts: mins(24),  level: 'info',    module: 'herramientas',  message: '[Herramientas] OCRWorkspace montado — Tesseract.js disponible',       },
  { id: 'l015', ts: mins(30),  level: 'info',    module: 'ecommerce',     message: '[eCommerce] PedidosView: 12 pedidos cargados desde Supabase',          duration: 124 },
  { id: 'l016', ts: mins(35),  level: 'info',    module: 'database',      message: '[DB] pedidos — query completada en 124ms',                   duration: 124 },
  { id: 'l017', ts: mins(40),  level: 'success', module: 'integraciones', message: '[Integraciones] Hub cargado — 5 módulos + Repositorio de APIs',       },
  { id: 'l018', ts: mins(45),  level: 'debug',   module: 'system',        message: '[System] APP_INIT — AdminDashboard montado correctamente',            duration: 210 },
  { id: 'l019', ts: mins(48),  level: 'debug',   module: 'system',        message: '[System] moduleRegistry compilado — 56 secciones registradas',        },
  { id: 'l020', ts: mins(60),  level: 'info',    module: 'storage',       message: '[Storage] Bucket etiquetas — bucket verificado',        duration: 67  },
  { id: 'l021', ts: mins(65),  level: 'warn',    module: 'api',           message: '[API] Resend — RESEND_API_KEY no configurado, emails transaccionales deshabilitados' },
  { id: 'l022', ts: mins(70),  level: 'info',    module: 'edge',          message: '[Edge] Ruta /etiquetas registrada — 5 endpoints activos',             },
  { id: 'l023', ts: mins(75),  level: 'info',    module: 'edge',          message: '[Edge] Ruta /roadmap registrada — 6 endpoints activos',               },
  { id: 'l024', ts: mins(80),  level: 'info',    module: 'edge',          message: '[Edge] Ruta /ideas-board registrada',                                 },
  { id: 'l025', ts: mins(90),  level: 'success', module: 'database',      message: '[DB] ideas — tabla verificada, 0 canvases activos',          duration: 31  },
];

function fmt(d: Date) {
  return d.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
         ' ' + d.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' });
}

export function SystemLogsView({ onNavigate }: Props) {
  const [search, setSearch]         = useState('');
  const [levelFilter, setLevel]     = useState<LogLevel | 'all'>('all');
  const [moduleFilter, setModule]   = useState<LogModule | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefresh]    = useState(0);

  const filtered = useMemo(() => LOGS.filter(l => {
    if (levelFilter  !== 'all' && l.level  !== levelFilter)  return false;
    if (moduleFilter !== 'all' && l.module !== moduleFilter) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase()) &&
        !l.detail?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [search, levelFilter, moduleFilter, refreshKey]);

  const counts = {
    error:   LOGS.filter(l => l.level === 'error').length,
    warn:    LOGS.filter(l => l.level === 'warn').length,
    info:    LOGS.filter(l => l.level === 'info' || l.level === 'success').length,
    debug:   LOGS.filter(l => l.level === 'debug').length,
  };

  const handleExport = () => {
    const txt = LOGS.map(l => `[${fmt(l.ts)}] [${l.level.toUpperCase()}] [${l.module}] ${l.message}${l.detail ? '\n  → ' + l.detail : ''}`).join('\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `charlie-logs-${new Date().toISOString().slice(0,10)}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={ScrollText}
        title="Logs del Sistema"
        subtitle="Registro de actividad y eventos del sistema"
        actions={[
          { label: '← Auditoría', onClick: () => onNavigate('auditoria') },
          { label: '↓ Exportar TXT', onClick: handleExport },
        ]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: 'var(--m-bg)' }}>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Errores',         value: counts.error, color: 'var(--m-danger)', icon: XCircle      },
            { label: 'Advertencias',    value: counts.warn,  color: 'var(--m-warning)', icon: AlertTriangle },
            { label: 'Info / Success',  value: counts.info,  color: 'var(--m-success)', icon: CheckCircle2 },
            { label: 'Debug',           value: counts.debug, color: 'var(--m-text-muted)', icon: Cpu          },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ backgroundColor: 'var(--m-surface)', borderRadius: 12, padding: '14px 18px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--m-text)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--m-text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={13} color="#9CA3AF" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar en logs..."
              style={{ width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: '0.8rem', outline: 'none', backgroundColor: 'var(--m-surface)', boxSizing: 'border-box' }} />
          </div>
          <select value={levelFilter} onChange={e => setLevel(e.target.value as any)}
            style={{ padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: '0.8rem', outline: 'none', backgroundColor: 'var(--m-surface)', cursor: 'pointer' }}>
            <option value="all">Todos los niveles</option>
            {Object.entries(LEVEL_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={moduleFilter} onChange={e => setModule(e.target.value as any)}
            style={{ padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: '0.8rem', outline: 'none', backgroundColor: 'var(--m-surface)', cursor: 'pointer' }}>
            <option value="all">Todos los módulos</option>
            {Object.entries(MODULE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={() => { setSearch(''); setLevel('all'); setModule('all'); setRefresh(r => r+1); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, backgroundColor: 'var(--m-surface)', fontSize: '0.8rem', color: 'var(--m-text-muted)', cursor: 'pointer' }}>
            <RefreshCw size={12} /> Limpiar
          </button>
          <span style={{ fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>{filtered.length} entradas</span>
        </div>

        {/* Log list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' }}>
          {filtered.map(log => {
            const lm     = LEVEL_META[log.level];
            const mm     = MODULE_META[log.module];
            const isExp  = expandedId === log.id;
            const LIcon  = lm.icon;
            const MIcon  = mm.icon;

            return (
              <div key={log.id} style={{ backgroundColor: 'var(--m-surface)', borderRadius: 8, border: `1px solid ${log.level === 'error' ? '#FECACA' : log.level === 'warn' ? '#FDE68A' : 'var(--m-border)'}`, overflow: 'hidden' }}>
                <button
                  onClick={() => log.detail ? setExpandedId(isExp ? null : log.id) : null}
                  style={{ width: '100%', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: log.detail ? 'pointer' : 'default', textAlign: 'left' }}>

                  {/* Level badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, backgroundColor: lm.bg, border: `1px solid ${lm.border}`, flexShrink: 0, minWidth: 68 }}>
                    <LIcon size={10} color={lm.color} />
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: lm.color, letterSpacing: '0.04em' }}>{lm.label}</span>
                  </div>

                  {/* Timestamp */}
                  <span style={{ fontSize: '0.68rem', color: 'var(--m-text-muted)', flexShrink: 0, minWidth: 110 }}>{fmt(log.ts)}</span>

                  {/* Module badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <MIcon size={10} color={mm.color} />
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: mm.color, minWidth: 80 }}>{mm.label}</span>
                  </div>

                  {/* Message */}
                  <span style={{ flex: 1, fontSize: '0.76rem', color: 'var(--m-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.message}</span>

                  {/* Duration */}
                  {log.duration && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--m-text-muted)', flexShrink: 0 }}>{log.duration}ms</span>
                  )}

                  {/* Expand if detail */}
                  {log.detail && (
                    isExp ? <ChevronDown size={12} color="#9CA3AF" style={{ flexShrink: 0 }} />
                           : <ChevronRight size={12} color="#9CA3AF" style={{ flexShrink: 0 }} />
                  )}
                </button>

                {/* Detail */}
                {isExp && log.detail && (
                  <div style={{ borderTop: `1px dashed ${lm.border}`, padding: '8px 12px 10px 12px', backgroundColor: lm.bg }}>
                    <pre style={{ margin: 0, fontSize: '0.72rem', color: 'var(--m-text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>{log.detail}</pre>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--m-text-muted)' }}>
              <Activity size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p style={{ margin: 0, fontWeight: '600' }}>No hay logs que coincidan con los filtros</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, padding: '10px 14px', backgroundColor: 'var(--m-surface-2)', border: '1px solid #E5E7EB', borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--m-text-muted)' }}>
            💡 Logs simulados para demostración. En producción se integraría con <strong>Supabase Logs</strong> o un servicio como <strong>Logflare / Logtail</strong>.
          </p>
        </div>

      </div>
    </div>
  );
}