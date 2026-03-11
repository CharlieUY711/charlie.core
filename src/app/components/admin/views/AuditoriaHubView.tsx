import React from 'react';
import { HubView, HubCardDef, HubComingSoonItem } from '../HubView';
import type { MainSection } from '../../../AdminDashboard';
import {
  ShieldCheck, CheckSquare, Activity, ScrollText,
  Database, Server, Zap, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, BarChart2, Users, Eye, Package,
} from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }

export function AuditoriaHubView({ onNavigate }: Props) {
  const nav = (s: MainSection) => () => onNavigate(s);
  const now = new Date();

  const cards: HubCardDef[] = [
    {
      id: 'checklist', icon: CheckSquare, onClick: nav('checklist'),
      gradient: 'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)', color: 'var(--m-primary)',
      badge: 'Roadmap · Progreso', label: 'Checklist & Roadmap',
      description: 'Estado completo del proyecto — progreso por módulo, cola de ejecución y auditoría del manifest.',
      stats: [{ icon: CheckSquare, value: '—', label: 'Módulos' }, { icon: TrendingUp, value: '—', label: 'Progreso' }, { icon: Clock, value: '—', label: 'Pendientes' }],
    },
    {
      id: 'auditoria-health', icon: Activity, onClick: nav('auditoria-health'),
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'var(--m-success)',
      badge: 'Tiempo real', label: 'Health Monitor',
      description: 'Estado en tiempo real de todos los servicios — Supabase, APIs externas y edge functions.',
      stats: [{ icon: Database, value: 'OK', label: 'Supabase DB' }, { icon: Server, value: 'OK', label: 'Edge Functions' }, { icon: Zap, value: '99.9%', label: 'Uptime' }],
    },
    {
      id: 'auditoria-logs', icon: ScrollText, onClick: nav('auditoria-logs'),
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', color: 'var(--m-purple)',
      badge: 'Logs · Eventos', label: 'Logs del Sistema',
      description: 'Registro de actividad, errores y eventos del sistema con filtros por módulo y nivel.',
      stats: [{ icon: AlertTriangle, value: '0', label: 'Errores críticos' }, { icon: Activity, value: '—', label: 'Eventos hoy' }, { icon: BarChart2, value: '—', label: 'Advertencias' }],
    },
  ];

  const comingSoon: HubComingSoonItem[] = [
    { icon: AlertTriangle, label: 'Alertas proactivas',  desc: 'Alertas por email ante fallos'          },
    { icon: BarChart2,     label: 'Reportes automáticos',desc: 'Rendimiento semanal automatizado'        },
    { icon: ShieldCheck,   label: 'Auditoría por rol',   desc: 'Seguridad y permisos por rol'           },
    { icon: Clock,         label: 'Trazabilidad',        desc: 'Historial completo de cambios'          },
  ];

  /* Panel de diagnóstico rápido como afterCards */
  const STACK = [
    { label: 'Base de datos',  desc: 'PostgreSQL vía Supabase',   ok: true  },
    { label: 'Auth service',   desc: 'Supabase Auth activo',      ok: true  },
    { label: 'Storage',        desc: 'Storage Buckets',     ok: true  },
    { label: 'Edge Functions', desc: 'Hono server activo',        ok: true  },
    { label: 'KV Store',       desc: 'Tabla kv_store',   ok: true  },
    { label: 'APIs externas',  desc: 'Sin configurar aún',        ok: false },
  ] as const;

  // Calcular altura para que el diagnóstico ocupe exactamente el alto de 1 fila
  const cardHeight = `calc((100vh - 88px - 16px - 16px - 16px) / 3)`;

  // Estadísticas (datos mock - se pueden conectar a APIs reales)
  const estadisticas = {
    conexiones: 12, // Usuarios conectados
    accesosSemana: 1247,
    accesosMes: 5234,
    articuloMasVisto: 'Producto Premium XYZ',
    departamentoMasVisto: 'Electrónica',
  };

  const diagnostico = (
    <div style={{
      width: '100%',
      height: cardHeight,
      padding: '18px 22px',
      backgroundColor: 'var(--m-surface)',
      borderRadius: '13px',
      border: '1px solid #E9ECEF',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', gap: '12px', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Sección izquierda: Stack */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', flex: 1, overflow: 'hidden' }}>
            {STACK.map(item => (
              <div key={item.label} style={{ 
                backgroundColor: 'var(--m-surface-2)', 
                borderRadius: '8px', 
                padding: '10px 12px', 
                border: '1px solid #E5E7EB', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                minHeight: 0,
              }}>
                {item.ok
                  ? <CheckCircle2 size={13} color="#059669" />
                  : <Clock size={13} color="#F59E0B" />}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--m-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Línea vertical divisoria */}
        <div style={{ width: '1px', backgroundColor: 'var(--m-border)', flexShrink: 0 }} />

        {/* Sección derecha: Estadísticas */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', flex: 1, overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--m-surface-2)', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px', minHeight: 0 }}>
              <Users size={13} color="#3B82F6" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text)' }}>Conexiones</div>
                <div style={{ fontSize: '0.64rem', color: 'var(--m-text-muted)' }}>{estadisticas.conexiones} usuarios</div>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--m-surface-2)', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px', minHeight: 0 }}>
              <Eye size={13} color="#10B981" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text)' }}>Accesos semana</div>
                <div style={{ fontSize: '0.64rem', color: 'var(--m-text-muted)' }}>{estadisticas.accesosSemana.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--m-surface-2)', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px', minHeight: 0 }}>
              <BarChart2 size={13} color="#F59E0B" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text)' }}>Accesos mes</div>
                <div style={{ fontSize: '0.64rem', color: 'var(--m-text-muted)' }}>{estadisticas.accesosMes.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--m-surface-2)', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px', minHeight: 0 }}>
              <Package size={13} color="#8B5CF6" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text)' }}>Artículo más visto</div>
                <div style={{ fontSize: '0.64rem', color: 'var(--m-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{estadisticas.articuloMasVisto}</div>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--m-surface-2)', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px', minHeight: 0 }}>
              <TrendingUp size={13} color="#EC4899" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text)' }}>Departamento más visto</div>
                <div style={{ fontSize: '0.64rem', color: 'var(--m-text-muted)' }}>{estadisticas.departamentoMasVisto}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <HubView
      hubIcon={ShieldCheck}
      title="Auditoría & Diagnóstico"
      subtitle={`Centro de control · Salud del sistema · Logs · Roadmap · ${now.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}`}
      sections={[
        {
          cards: [],
          customFirstRow: diagnostico,
        },
        {
          cards,
        },
      ]}
      comingSoon={comingSoon}
      comingSoonText="Alertas proactivas por email, reportes de rendimiento automatizados, auditoría de seguridad por rol y trazabilidad completa de cambios."
    />
  );
}
