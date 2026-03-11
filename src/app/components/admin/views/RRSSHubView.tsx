/* =====================================================
   RRSSHubView — Hub Central de Redes Sociales
   Centro de comando completo para Meta Business Suite
   Charlie Marketplace Builder v1.5
   ===================================================== */
import React, { useState, useEffect } from 'react';
import { HubView, HubCardDef, HubComingSoonItem } from '../HubView';
import type { MainSection } from '../../../AdminDashboard';
import {
  Share2, BarChart2, ArrowLeftRight, Zap, Calendar,
  BookOpen, CheckCircle,
  Facebook, Instagram, MessageCircle, Wrench,
  AlertCircle,
} from 'lucide-react';
import { getStatus, type AllStatus, type PlatformStatus } from '../../../services/rrssApi';

const ORANGE   = '#FF6835';
const FB_BLUE  = '#1877F2';
const IG_PINK  = '#E1306C';
const WA_GREEN = '#25D366';

interface Props { onNavigate: (s: MainSection) => void; }

/* ── Platform status chip ── */
function PlatformChip({ icon: Icon, platform, status, statusColor, onClick }: {
  icon: React.ElementType; platform: string; status: string; statusColor: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        flex: 1, padding: '12px 16px', borderRadius: '10px',
        backgroundColor: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)', cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s', textAlign: 'left',
      }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)')}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.12)')}
    >
      <Icon size={16} color='#fff' />
      <div>
        <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>{platform}</p>
        <p style={{ margin: '3px 0 0', fontSize: '0.82rem', fontWeight: '800', color: 'var(--m-surface)', lineHeight: 1 }}>{status}</p>
      </div>
    </button>
  );
}

/* ── Main export ── */
export function RRSSHubView({ onNavigate }: Props) {
  const [platformStatus, setPlatformStatus] = useState<AllStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingStatus(true);
    getStatus().then(s => {
      if (!cancelled) { setPlatformStatus(s); setLoadingStatus(false); }
    });
    return () => { cancelled = true; };
  }, []);

  /* Derive chip props from real status */
  function chipProps(p: PlatformStatus | undefined): { status: string; dot: string } {
    if (!p) return { status: 'Cargando…', dot: 'rgba(255,255,255,0.5)' };
    if (p.status === 'connected')    return { status: `✓ ${p.accountName ?? 'Conectado'}`, dot: 'var(--m-success)' };
    if (p.status === 'pending')      return { status: 'Sin verificar', dot: 'var(--m-warning)' };
    if (p.status === 'coming_soon')  return { status: 'Próximamente', dot: 'var(--m-text-muted)' };
    return { status: 'Sin credenciales', dot: 'var(--m-danger-bg)' };
  }

  const igChip = chipProps(platformStatus?.instagram);
  const fbChip = chipProps(platformStatus?.facebook);

  // Convertir herramientas a formato HubCardDef
  const mainCards: HubCardDef[] = [
    {
      id: 'meta-business',
      icon: BarChart2,
      onClick: () => onNavigate('meta-business'),
      gradient: `linear-gradient(135deg, ${ORANGE} 0%, #e04e20 100%)`,
      color: ORANGE,
      badge: 'RRSS · Dashboard',
      label: 'Dashboard Unificado',
      description: 'Monitoreo en tiempo real de todas tus redes sociales. Monitor de tokens en vivo, estadísticas centralizadas, renovación automática y verificación de permisos.',
      stats: [
        { icon: CheckCircle, value: 'Activo', label: 'Estado' },
        { icon: Zap, value: 'RT', label: 'Tiempo real' },
        { icon: BarChart2, value: '—', label: 'Métricas' },
      ],
    },
    {
      id: 'migracion-rrss',
      icon: ArrowLeftRight,
      onClick: () => onNavigate('migracion-rrss'),
      gradient: `linear-gradient(135deg, ${FB_BLUE} 0%, #1565C0 100%)`,
      color: FB_BLUE,
      badge: 'RRSS · Migración',
      label: 'Migración RRSS',
      description: 'Backup, eliminación y rebranding completo. Backup completo de contenido, eliminación masiva segura, rebranding automático y export de datos.',
      stats: [
        { icon: CheckCircle, value: 'Activo', label: 'Estado' },
        { icon: ArrowLeftRight, value: '—', label: 'Backups' },
        { icon: Zap, value: 'Auto', label: 'Proceso' },
      ],
    },
    {
      id: 'redes-sociales',
      icon: Share2,
      onClick: () => onNavigate('redes-sociales'),
      gradient: `linear-gradient(135deg, ${IG_PINK} 0%, #C13584 100%)`,
      color: IG_PINK,
      badge: 'RRSS · Centro',
      label: 'Centro Operativo',
      description: 'Gestión unificada de Facebook, Instagram y WhatsApp. Panel unificado de gestión, calendario de contenido, gestión por plataforma y vista consolidada.',
      stats: [
        { icon: CheckCircle, value: 'Activo', label: 'Estado' },
        { icon: Calendar, value: '—', label: 'Posts' },
        { icon: Share2, value: '3', label: 'Plataformas' },
      ],
    },
  ];

  const additionalCards: HubCardDef[] = [
    {
      id: 'publicador-unificado',
      icon: Zap,
      onClick: () => {},
      gradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
      color: 'var(--m-info)',
      badge: 'RRSS · Próximamente',
      label: 'Publicador Unificado',
      description: 'Publicá en Instagram y Facebook simultáneamente',
      stats: [
        { icon: Zap, value: '⏳', label: 'Próximamente' },
        { icon: Share2, value: '2', label: 'Plataformas' },
        { icon: CheckCircle, value: '—', label: 'Estado' },
      ],
    },
    {
      id: 'analytics',
      icon: BarChart2,
      onClick: () => {},
      gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
      color: 'var(--m-warning)',
      badge: 'RRSS · Próximamente',
      label: 'Analytics',
      description: 'Estadísticas avanzadas y reportes',
      stats: [
        { icon: BarChart2, value: '⏳', label: 'Próximamente' },
        { icon: Zap, value: '—', label: 'Reportes' },
        { icon: CheckCircle, value: '—', label: 'Estado' },
      ],
    },
    {
      id: 'calendario-social',
      icon: Calendar,
      onClick: () => onNavigate('redes-sociales'),
      gradient: 'linear-gradient(135deg, #C026D3 0%, #A21CAF 100%)',
      color: 'var(--m-purple)',
      badge: 'RRSS · Centro',
      label: 'Calendario Social',
      description: 'Planificación y programación de contenido',
      stats: [
        { icon: Calendar, value: '↗', label: 'En Centro' },
        { icon: CheckCircle, value: '—', label: 'Posts' },
        { icon: Zap, value: '—', label: 'Programados' },
      ],
    },
    {
      id: 'documentacion',
      icon: BookOpen,
      onClick: () => onNavigate('documentacion'),
      gradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
      color: 'var(--m-info)',
      badge: 'RRSS · Docs',
      label: 'Documentación',
      description: 'Guías completas y tutoriales',
      stats: [
        { icon: CheckCircle, value: '✓', label: 'Disponible' },
        { icon: BookOpen, value: '—', label: 'Guías' },
        { icon: Zap, value: '—', label: 'Tutoriales' },
      ],
    },
  ];

  const comingSoon: HubComingSoonItem[] = [
    { icon: Zap, label: 'Publicador Unificado', desc: 'Publicá en Instagram y Facebook simultáneamente' },
    { icon: BarChart2, label: 'Analytics', desc: 'Estadísticas avanzadas y reportes' },
  ];

  // Combinar todas las tarjetas
  const allCards = [...mainCards, ...additionalCards];

  // Banner de estado de plataformas como intro
  const platformBanner = (
    <div style={{ background: 'linear-gradient(135deg, #5B21B6 0%, #1D4ED8 60%, #1877F2 100%)', padding: '16px 32px', marginBottom: '16px', borderRadius: '13px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <PlatformChip icon={Facebook} platform="Facebook" status={loadingStatus ? '…' : fbChip.status} statusColor={FB_BLUE} onClick={() => onNavigate('migracion-rrss')} />
        <PlatformChip icon={Instagram} platform="Instagram" status={loadingStatus ? '…' : igChip.status} statusColor={IG_PINK} onClick={() => onNavigate('migracion-rrss')} />
        <PlatformChip icon={MessageCircle} platform="WhatsApp" status="Próximamente" statusColor={WA_GREEN} />
        <PlatformChip icon={Wrench} platform="Herramientas" status="6 disponibles" statusColor='#fff' />
      </div>
      {!loadingStatus && platformStatus && (
        platformStatus.instagram.status !== 'connected' || platformStatus.facebook.status !== 'connected'
      ) && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.3)' }}>
          <AlertCircle size={14} color="#FCD34D" />
          <span style={{ fontSize: '12px', color: 'var(--m-warning)', fontWeight: 600 }}>
            Credenciales pendientes — configurá tu API en{' '}
            <button onClick={() => onNavigate('migracion-rrss')}
              style={{ background: 'none', border: 'none', color: 'var(--m-warning)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '12px' }}>
              Migración RRSS → Configuración
            </button>
          </span>
        </div>
      )}
    </div>
  );

  return (
    <HubView
      hubIcon={Share2}
      title="Redes Sociales"
      subtitle="Gestión y administración"
      sections={[
        {
          cards: allCards,
        },
      ]}
      hideSeleccionar
      intro={platformBanner}
      comingSoon={comingSoon}
      comingSoonText="Publicador Unificado para Instagram y Facebook, y Analytics avanzado con reportes detallados."
    />
  );
}