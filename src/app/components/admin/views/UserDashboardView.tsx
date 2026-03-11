/* =====================================================
   UserDashboardView — Dashboard personalizado por rol
   Charlie Marketplace Builder v1.5
   Vista: Sistema → Dashboard de Usuario
   ===================================================== */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Megaphone,
  Truck, Wrench, Settings, Star, Clock, TrendingUp, Bell,
  CheckCircle, FileText, DollarSign, BarChart2, Eye, Zap,
  MessageSquare, Heart, Calendar, Award,
} from 'lucide-react';

const ORANGE = '#FF6835';
interface Props { onNavigate: (s: MainSection) => void; }

/* ── Configuración por rol ── */
type RolKey = 'Cliente' | 'Colaborador' | 'Editor' | 'Administrador' | 'SuperAdmin';

const ROLE_CONFIG: Record<RolKey, {
  color: string;
  bg: string;
  greeting: string;
  tagline: string;
  kpis: { icon: React.ElementType; label: string; value: string; color: string }[];
  modules: { id: MainSection; icon: React.ElementType; label: string; desc: string; color: string }[];
  activity: { icon: React.ElementType; text: string; time: string }[];
}> = {
  Cliente: {
    color: 'var(--m-text-muted)',
    bg: 'var(--m-surface-2)',
    greeting: '¡Hola, Luis!',
    tagline: 'Tus pedidos y compras en un solo lugar',
    kpis: [
      { icon: ShoppingCart, label: 'Mis pedidos',     value: '12',    color: ORANGE      },
      { icon: Package,      label: 'En camino',        value: '2',     color: 'var(--m-info)'   },
      { icon: Star,         label: 'Puntos acumulados',value: '1.240', color: 'var(--m-warning)'   },
      { icon: Heart,        label: 'Favoritos',        value: '8',     color: '#EC4899'   },
    ],
    modules: [
      { id: 'pedidos',   icon: ShoppingCart, label: 'Mis Pedidos',   desc: 'Estado de tus compras',       color: ORANGE    },
      { id: 'ecommerce', icon: Package,      label: 'Catálogo',      desc: 'Explorar productos',           color: 'var(--m-info)' },
      { id: 'pagos',     icon: DollarSign,   label: 'Mis Pagos',     desc: 'Historial de pagos',           color: 'var(--m-success)' },
      { id: 'envios',    icon: Truck,        label: 'Mis Envíos',    desc: 'Seguimiento de pedidos',       color: 'var(--m-purple)' },
    ],
    activity: [
      { icon: Package,      text: 'Pedido #8834 enviado — ETA mañana',  time: 'Hoy 10:30'   },
      { icon: DollarSign,   text: 'Pago confirmado — $2.340',           time: 'Ayer 14:20'  },
      { icon: Star,         text: '120 puntos acumulados',              time: 'Hace 3 días' },
    ],
  },

  Colaborador: {
    color: 'var(--m-success)',
    bg: 'var(--m-success-bg)',
    greeting: '¡Hola, Ana!',
    tagline: 'Tu espacio de trabajo colaborativo',
    kpis: [
      { icon: CheckCircle,  label: 'Tareas completadas', value: '28',    color: 'var(--m-success)' },
      { icon: Clock,        label: 'Tareas pendientes',  value: '5',     color: 'var(--m-warning)' },
      { icon: FileText,     label: 'Documentos creados', value: '14',    color: 'var(--m-info)' },
      { icon: MessageSquare,label: 'Mensajes hoy',       value: '7',     color: ORANGE    },
    ],
    modules: [
      { id: 'pedidos',       icon: ShoppingCart, label: 'Pedidos',        desc: 'Gestión de órdenes',        color: ORANGE    },
      { id: 'clientes',      icon: Users,        label: 'Clientes',       desc: 'Base de clientes',          color: 'var(--m-info)' },
      { id: 'herramientas',  icon: Wrench,       label: 'Herramientas',   desc: 'Suite de trabajo',          color: 'var(--m-purple)' },
      { id: 'gen-documentos',icon: FileText,     label: 'Documentos',     desc: 'Generar documentos',        color: 'var(--m-success)' },
    ],
    activity: [
      { icon: CheckCircle,  text: 'Tarea "Actualizar catálogo" completada', time: 'Hoy 11:00'   },
      { icon: FileText,     text: 'Documento "Cotización #112" generado',   time: 'Hoy 09:30'   },
      { icon: Users,        text: 'Cliente García actualizado',             time: 'Ayer 16:45'  },
    ],
  },

  Editor: {
    color: 'var(--m-info)',
    bg: 'var(--m-info-bg)',
    greeting: '¡Hola, Diego!',
    tagline: 'Tu panel de edición y contenido',
    kpis: [
      { icon: FileText,    label: 'Contenidos publicados', value: '43',  color: 'var(--m-info)' },
      { icon: Eye,         label: 'Vistas totales',        value: '8.2k',color: ORANGE    },
      { icon: Megaphone,   label: 'Campañas activas',      value: '3',   color: '#EC4899' },
      { icon: TrendingUp,  label: 'CTR promedio',          value: '4.2%',color: 'var(--m-success)' },
    ],
    modules: [
      { id: 'marketing',     icon: Megaphone,  label: 'Marketing',       desc: 'Campañas y contenido',      color: '#EC4899' },
      { id: 'rrss',          icon: Star,       label: 'RRSS',            desc: 'Redes sociales',            color: '#E1306C' },
      { id: 'seo',           icon: TrendingUp, label: 'SEO',             desc: 'Posicionamiento web',       color: 'var(--m-success)' },
      { id: 'mailing',       icon: Zap,        label: 'Mailing',         desc: 'Email marketing',           color: 'var(--m-info)' },
      { id: 'herramientas',  icon: Wrench,     label: 'Herramientas',    desc: 'Suite de trabajo',          color: 'var(--m-purple)' },
      { id: 'storefront',    icon: Eye,        label: 'Storefront',      desc: 'Vista pública',             color: ORANGE    },
    ],
    activity: [
      { icon: Megaphone,  text: 'Campaña "Verano 2026" programada',    time: 'Hoy 10:15'   },
      { icon: Eye,        text: '1.240 visitas al storefront hoy',     time: 'Hoy 09:00'   },
      { icon: Star,       text: 'Post de Instagram publicado',         time: 'Ayer 18:30'  },
    ],
  },

  Administrador: {
    color: ORANGE,
    bg: 'var(--m-warning-bg)',
    greeting: '¡Hola, María!',
    tagline: 'Panel de administración del sistema',
    kpis: [
      { icon: Users,        label: 'Usuarios activos', value: '153',   color: 'var(--m-purple)' },
      { icon: BarChart2,    label: 'Ventas del mes',   value: '$67k',  color: 'var(--m-success)' },
      { icon: Zap,          label: 'Módulos activos',  value: '68',    color: ORANGE    },
      { icon: CheckCircle,  label: 'Uptime',           value: '99.9%', color: 'var(--m-info)' },
    ],
    modules: [
      { id: 'ecommerce',     icon: ShoppingCart, label: 'eCommerce',   desc: 'Gestión completa',          color: ORANGE    },
      { id: 'gestion',       icon: BarChart2,    label: 'Gestión ERP', desc: 'ERP completo',              color: 'var(--m-info)' },
      { id: 'personas',      icon: Users,        label: 'Usuarios',    desc: 'Gestión de personas',       color: 'var(--m-purple)' },
      { id: 'integraciones', icon: Zap,          label: 'Integraciones','desc': 'Conectores activos',     color: 'var(--m-success)' },
      { id: 'sistema',       icon: Settings,     label: 'Sistema',     desc: 'Configuración',             color: 'var(--m-text-muted)' },
      { id: 'auditoria',     icon: Eye,          label: 'Auditoría',   desc: 'Logs y diagnóstico',        color: 'var(--m-warning)' },
    ],
    activity: [
      { icon: Users,    text: '2 nuevos usuarios registrados hoy',  time: 'Hoy 08:30'   },
      { icon: Settings, text: 'Config. de pasarela MP actualizada', time: 'Ayer 16:00'  },
      { icon: BarChart2,text: 'Reporte mensual generado',           time: 'Hace 2 días' },
    ],
  },

  SuperAdmin: {
    color: 'var(--m-purple)',
    bg: 'var(--m-purple-bg)',
    greeting: '¡Hola, Carlos!',
    tagline: 'Control total del sistema Charlie v1.5',
    kpis: [
      { icon: Users,      label: 'Total usuarios',    value: '153',   color: 'var(--m-purple)' },
      { icon: BarChart2,  label: 'Ventas del mes',    value: '$67k',  color: ORANGE    },
      { icon: Award,      label: 'Módulos totales',   value: '68',    color: 'var(--m-info)' },
      { icon: Calendar,   label: 'Días de uptime',    value: '342',   color: 'var(--m-success)' },
    ],
    modules: [
      { id: 'sistema',       icon: Settings,     label: 'Sistema',       desc: 'Config. global',          color: ORANGE    },
      { id: 'constructor',   icon: Zap,          label: 'Constructor',   desc: 'Builder de módulos',      color: 'var(--m-purple)' },
      { id: 'auditoria',     icon: Eye,          label: 'Auditoría',     desc: 'Control total',           color: 'var(--m-warning)' },
      { id: 'integraciones', icon: Package,      label: 'Integraciones', desc: 'Todos los conectores',    color: 'var(--m-success)' },
      { id: 'config-vistas', icon: Users,        label: 'Config. Vistas','desc': 'Permisos por rol',     color: '#EC4899' },
      { id: 'documentacion', icon: FileText,     label: 'Documentación', desc: 'Docs técnicas y usuario', color: 'var(--m-text-muted)' },
    ],
    activity: [
      { icon: Award,    text: 'Deploy v1.5 completado sin errores',  time: 'Hoy 02:00'   },
      { icon: Settings, text: 'Backup automático ejecutado',         time: 'Hoy 03:00'   },
      { icon: Users,    text: 'Sesión activa en 2 dispositivos',     time: 'Ahora'       },
    ],
  },
};

const ROLES: RolKey[] = ['Cliente', 'Colaborador', 'Editor', 'Administrador', 'SuperAdmin'];

/* ── Componente principal ── */
export function UserDashboardView({ onNavigate }: Props) {
  const [activeRole, setActiveRole] = useState<RolKey>('Administrador');
  const cfg = ROLE_CONFIG[activeRole];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: 'var(--m-bg)' }}>

      <OrangeHeader
        icon={LayoutDashboard}
        title="Dashboard de Usuario"
        subtitle="Vista personalizada por rol · Datos de ejemplo"
        rightSlot={
          <span style={{ fontSize: '0.75rem', color: 'var(--m-text-muted)', fontWeight: '500', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 11px', backgroundColor: 'var(--m-surface)' }}>
            Simulador de rol activo
          </span>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

        {/* ── Selector de Rol ── */}
        <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 14, border: '1px solid #E5E7EB', padding: '18px 22px', marginBottom: 24 }}>
          <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: '800', color: 'var(--m-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Simular vista como rol →
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ROLES.map(role => {
              const active = role === activeRole;
              const color  = ROLE_CONFIG[role].color;
              return (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  style={{
                    padding: '8px 18px', borderRadius: 9,
                    border: `2px solid ${active ? color : color + '30'}`,
                    backgroundColor: active ? color : `${color}08`,
                    color: active ? '#fff' : color,
                    fontSize: '0.82rem', fontWeight: '700',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Welcome banner ── */}
        <div style={{
          borderRadius: 16, marginBottom: 24,
          background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}cc 100%)`,
          padding: '28px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: `0 8px 32px ${cfg.color}40`,
        }}>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: '900', color: 'var(--m-surface)' }}>
              {cfg.greeting}
            </p>
            <p style={{ margin: 0, fontSize: '1rem', color: 'rgba(255,255,255,0.85)' }}>
              {cfg.tagline}
            </p>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14,
            padding: '10px 20px', textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Rol activo
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: '900', color: 'var(--m-surface)' }}>
              {activeRole}
            </p>
          </div>
        </div>

        {/* ── KPIs de rol ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {cfg.kpis.map((kpi, i) => (
            <div key={i} style={{ backgroundColor: 'var(--m-surface)', borderRadius: 14, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <kpi.icon size={16} color={kpi.color} strokeWidth={2.2} />
              </div>
              <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: 'var(--m-text-muted)' }}>{kpi.label}</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--m-text)', lineHeight: 1 }}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* ── Módulos disponibles + Actividad ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>

          {/* Módulos accesibles para este rol */}
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 14, border: '1px solid #E5E7EB', padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--m-text)' }}>
                Módulos disponibles
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--m-text-muted)', fontWeight: '600' }}>
                {cfg.modules.length} módulos
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {cfg.modules.map(mod => (
                <button
                  key={mod.id}
                  onClick={() => onNavigate(mod.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 12,
                    border: `1.5px solid ${mod.color}25`,
                    backgroundColor: `${mod.color}06`,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = `${mod.color}12`;
                    el.style.borderColor = `${mod.color}60`;
                    el.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = `${mod.color}06`;
                    el.style.borderColor = `${mod.color}25`;
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: `${mod.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <mod.icon size={16} color={mod.color} strokeWidth={2.2} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '700', color: 'var(--m-text)' }}>{mod.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--m-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mod.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actividad reciente de este rol */}
          <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: 14, border: '1px solid #E5E7EB', padding: '22px 24px' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--m-text)' }}>
              Actividad reciente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cfg.activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <a.icon size={13} color={cfg.color} />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: '0.78rem', color: 'var(--m-text-secondary)', lineHeight: 1.4 }}>{a.text}</p>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--m-text-muted)' }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Notificaciones */}
            <div style={{ marginTop: 24, padding: '14px', borderRadius: 10, backgroundColor: `${cfg.color}08`, border: `1.5px solid ${cfg.color}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <Bell size={13} color={cfg.color} />
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: cfg.color }}>Notificaciones</p>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--m-text-muted)', lineHeight: 1.5 }}>
                {activeRole === 'Cliente'       && '1 pedido en camino · Tus puntos vencen en 30 días'}
                {activeRole === 'Colaborador'   && '5 tareas pendientes hoy · 2 comentarios sin leer'}
                {activeRole === 'Editor'        && '3 campañas activas · Reporte semanal disponible'}
                {activeRole === 'Administrador' && '2 alertas del sistema · 3 nuevos registros'}
                {activeRole === 'SuperAdmin'    && 'Sistema funcionando al 99.9% · Deploy v1.5 exitoso'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
