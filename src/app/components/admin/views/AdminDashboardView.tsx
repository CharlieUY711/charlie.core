/* =====================================================
   AdminDashboardView — Dashboard de Administración
   Charlie Marketplace Builder v1.5
   Vista: Sistema → Dashboard Admin
   ===================================================== */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { useOrchestrator } from '../../../../shells/DashboardShell/app/providers/OrchestratorProvider';
import {
  Shield, Users, Activity, AlertTriangle, CheckCircle,
  Server, Clock, TrendingUp, Settings, Zap, Database,
  RefreshCw, Eye, Lock, UserCheck, Bell, ChevronRight,
  Package, BarChart2, Cpu, Wifi, HardDrive, Globe,
} from 'lucide-react';

const ORANGE = '#FF6835';
interface Props { onNavigate: (s: MainSection) => void; }

/* ── Data de ejemplo ── */
const ROLES_COLORS: Record<string, string> = {
  SuperAdmin: 'var(--m-purple)',
  Administrador: 'var(--m-primary)',
  Editor: 'var(--m-info)',
  Colaborador: 'var(--m-success)',
  Cliente: 'var(--m-text-muted)',
};

const users = [
  { id: 1, name: 'Carlos Méndez',   role: 'SuperAdmin',    email: 'carlos@charlie.io',  last: 'Hace 5 min',   status: 'online'  },
  { id: 2, name: 'María García',    role: 'Administrador', email: 'maria@empresa.com',   last: 'Hace 18 min',  status: 'online'  },
  { id: 3, name: 'Diego López',     role: 'Editor',        email: 'diego@empresa.com',   last: 'Hace 1 hora',  status: 'away'    },
  { id: 4, name: 'Ana Fernández',   role: 'Colaborador',   email: 'ana@empresa.com',     last: 'Hace 2 horas', status: 'offline' },
  { id: 5, name: 'Luis Torres',     role: 'Cliente',       email: 'luis@cliente.com',    last: 'Hace 3 horas', status: 'offline' },
  { id: 6, name: 'Sofía Martínez',  role: 'Editor',        email: 'sofia@empresa.com',   last: 'Hace 4 horas', status: 'offline' },
];

const alerts = [
  { level: 'warn',  icon: AlertTriangle, msg: 'Certificado SSL vence en 14 días',         time: 'Hoy 09:42'     },
  { level: 'info',  icon: Bell,          msg: 'Backup automático completado exitosamente', time: 'Hoy 03:00'     },
  { level: 'warn',  icon: Package,       msg: 'Stock bajo: 3 productos bajo mínimo',       time: 'Ayer 18:30'    },
  { level: 'ok',    icon: CheckCircle,   msg: 'Deploy v1.5 aplicado sin errores',          time: 'Ayer 14:15'    },
  { level: 'info',  icon: Users,         msg: '2 nuevos usuarios registrados',             time: 'Ayer 11:00'    },
];

const adminActivity = [
  { icon: Lock,      text: 'Permisos actualizados — Rol Editor',    who: 'Carlos M.',  time: 'Hace 10 min' },
  { icon: UserCheck, text: 'Nuevo usuario aprobado — Ana Fernández', who: 'María G.',   time: 'Hace 25 min' },
  { icon: Settings,  text: 'Config. de módulo Facturación editada', who: 'Carlos M.',  time: 'Hace 1 hora' },
  { icon: Database,  text: 'Backup manual ejecutado',               who: 'Sistema',    time: 'Hace 3 horas'},
  { icon: Globe,     text: 'Dominio personalizado conectado',        who: 'María G.',   time: 'Ayer'        },
];

const services = [
  { name: 'API Principal',    status: 'ok',   latency: '42ms',  uptime: '99.98%', icon: Zap      },
  { name: 'Base de Datos',    status: 'ok',   latency: '8ms',   uptime: '100%',   icon: Database },
  { name: 'Supabase Auth',    status: 'ok',   latency: '65ms',  uptime: '99.95%', icon: Lock     },
  { name: 'Storage',          status: 'ok',   latency: '120ms', uptime: '99.92%', icon: HardDrive},
  { name: 'Edge Functions',   status: 'warn', latency: '310ms', uptime: '98.70%', icon: Cpu      },
  { name: 'CDN / Vite Build', status: 'ok',   latency: '18ms',  uptime: '100%',   icon: Wifi     },
];

const roleDist = [
  { role: 'SuperAdmin',    count: 1  },
  { role: 'Administrador', count: 3  },
  { role: 'Editor',        count: 8  },
  { role: 'Colaborador',   count: 14 },
  { role: 'Cliente',       count: 127},
];

/* ── Sub-componentes ── */
function Stat({ icon: Icon, label, value, change, color }: { icon: React.ElementType; label: string; value: string; change: string; color: string }) {
  const up = change.startsWith('+');
  return (
    <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} strokeWidth={2.2} />
        </div>
        <span style={{ fontSize: '0.74rem', fontWeight: '700', color: up ? '#10B981' : 'var(--m-danger)', backgroundColor: up ? '#D1FAE5' : 'var(--m-danger-bg)', padding: '3px 8px', borderRadius: '6px' }}>
          {change}
        </span>
      </div>
      <p style={{ margin: '0 0 2px', fontSize: '0.75rem', color: 'var(--m-text-muted)' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--m-text)', lineHeight: 1 }}>{value}</p>
    </div>
  );
}

function ServiceRow({ svc }: { svc: typeof services[0] }) {
  const color = svc.status === 'ok' ? '#10B981' : svc.status === 'warn' ? '#F59E0B' : 'var(--m-danger)';
  const bg    = svc.status === 'ok' ? '#D1FAE5' : svc.status === 'warn' ? '#FEF3C7' : 'var(--m-danger-bg)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svc.icon size={15} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '600', color: 'var(--m-text)' }}>{svc.name}</p>
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--m-text-muted)' }}>Uptime {svc.uptime} · {svc.latency}</p>
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: '700', color, backgroundColor: bg, padding: '3px 9px', borderRadius: '6px' }}>
        {svc.status === 'ok' ? 'Operativo' : svc.status === 'warn' ? 'Degradado' : 'Error'}
      </span>
    </div>
  );
}

/* ── Componente principal ── */
export function AdminDashboardView({ onNavigate }: Props) {
  const { config, clienteNombre } = useOrchestrator();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const totalUsers = roleDist.reduce((a, b) => a + b.count, 0);
  const maxCount   = Math.max(...roleDist.map(r => r.count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: 'var(--m-bg)' }}>

      <OrangeHeader
        icon={Shield}
        title="Dashboard de Administración"
        subtitle={`${clienteNombre} · Sistema de Gestión`}
        actions={[
          {
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
                Actualizar
              </span>
            ),
            onClick: handleRefresh,
          },
          {
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Settings size={13} /> Sistema
              </span>
            ),
            primary: true,
            onClick: () => onNavigate('sistema'),
          },
        ]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

        {/* ── KPIs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <Stat icon={Users}      label="Usuarios totales"   value={String(totalUsers)} change="+5.2%"  color="#7C3AED" />
          <Stat icon={Activity}   label="Módulos activos"    value="68"                 change="+3"     color={ORANGE}  />
          <Stat icon={TrendingUp} label="Uptime del sistema" value="99.9%"              change="+0.1%"  color="#10B981" />
          <Stat icon={AlertTriangle} label="Alertas activas" value="2"                  change="-1"     color="#F59E0B" />
        </div>

        {/* ── Row: Usuarios + Sistema ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Usuarios por rol */}
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 14, border: '1px solid #E5E7EB', padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--m-text)' }}>Distribución por Rol</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--m-text-muted)', fontWeight: '600' }}>{totalUsers} usuarios</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {roleDist.map(r => (
                <div key={r.role}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: ROLES_COLORS[r.role] }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--m-text-secondary)' }}>{r.role}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--m-text-muted)', fontWeight: '600' }}>{r.count}</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: 'var(--m-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(r.count / maxCount) * 100}%`, height: '100%', backgroundColor: ROLES_COLORS[r.role], borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estado de servicios */}
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 14, border: '1px solid #E5E7EB', padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--m-text)' }}>Estado de Servicios</h3>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-success)', backgroundColor: 'var(--m-success-bg)', padding: '3px 9px', borderRadius: 6 }}>
                5/6 OK
              </span>
            </div>
            <div>
              {services.map(svc => <ServiceRow key={svc.name} svc={svc} />)}
            </div>
          </div>
        </div>

        {/* ── Row: Usuarios activos + Alertas + Actividad admin ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Lista de usuarios */}
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 14, border: '1px solid #E5E7EB', padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--m-text)' }}>Usuarios Recientes</h3>
              <button
                style={{ fontSize: '0.75rem', color: ORANGE, fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                onClick={() => onNavigate('personas')}
              >
                Ver todos <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {users.map(u => {
                const statusColor = u.status === 'online' ? '#10B981' : u.status === 'away' ? '#F59E0B' : 'var(--m-border)';
                const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: `${ROLES_COLORS[u.role]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: ROLES_COLORS[u.role] }}>{initials}</span>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', backgroundColor: statusColor, border: '2px solid #fff' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', color: 'var(--m-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--m-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: '700', color: ROLES_COLORS[u.role], backgroundColor: `${ROLES_COLORS[u.role]}15`, padding: '2px 7px', borderRadius: 5 }}>
                        {u.role}
                      </span>
                      <p style={{ margin: '3px 0 0', fontSize: '0.65rem', color: 'var(--m-border)' }}>{u.last}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alertas */}
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 14, border: '1px solid #E5E7EB', padding: '22px 24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--m-text)' }}>Alertas del Sistema</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.map((a, i) => {
                const color = a.level === 'warn' ? '#F59E0B' : a.level === 'ok' ? '#10B981' : 'var(--m-text-muted)';
                const bg    = a.level === 'warn' ? '#FFFBEB' : a.level === 'ok' ? '#F0FDF4' : 'var(--m-surface-2)';
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px', borderRadius: 10, backgroundColor: bg }}>
                    <a.icon size={15} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '0.76rem', color: 'var(--m-text-secondary)', lineHeight: 1.4 }}>{a.msg}</p>
                      <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--m-text-muted)' }}>{a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actividad de admin */}
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 14, border: '1px solid #E5E7EB', padding: '22px 24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--m-text)' }}>Actividad de Admin</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {adminActivity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${ORANGE}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <a.icon size={13} color={ORANGE} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '0.77rem', color: 'var(--m-text-secondary)', lineHeight: 1.3 }}>{a.text}</p>
                    <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--m-text-muted)' }}>{a.who} · {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Accesos rápidos de admin ── */}
        <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
          <p style={{ margin: '0 0 14px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--m-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Acciones rápidas de administración
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Gestionar Usuarios',   icon: Users,     color: 'var(--m-purple)', section: 'personas'      as MainSection },
              { label: 'Config. de Vistas',    icon: Eye,       color: ORANGE,    section: 'config-vistas' as MainSection },
              { label: 'Logs del Sistema',     icon: BarChart2, color: 'var(--m-info)', section: 'auditoria-logs'as MainSection },
              { label: 'Health Monitor',       icon: Activity,  color: 'var(--m-success)', section: 'auditoria-health'as MainSection},
              { label: 'Integraciones',        icon: Zap,       color: 'var(--m-success)', section: 'integraciones' as MainSection },
              { label: 'Documentación',        icon: Server,    color: 'var(--m-text-muted)', section: 'documentacion' as MainSection },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={() => onNavigate(btn.section)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 16px', borderRadius: 9,
                  border: `1.5px solid ${btn.color}30`,
                  backgroundColor: `${btn.color}08`,
                  color: btn.color, cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: '700',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${btn.color}18`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${btn.color}08`; }}
              >
                <btn.icon size={13} />
                {btn.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
