/* =====================================================
   ConstruccionView — Charlie Platform
   Hub de construcción: Constructor + Constructor Módulos
   ===================================================== */
import React from 'react';
import { Blocks, Hammer } from 'lucide-react';
import { HubView }        from '../HubView';
import type { HubCardDef } from '../HubView';
import { TopBar }         from '../TopBar';
import type { MainSection } from '../../../AdminDashboard';

interface Props { onNavigate: (s: MainSection) => void; }

export function ConstruccionView({ onNavigate }: Props) {
  const nav = (s: MainSection) => () => onNavigate(s);

  const cards: HubCardDef[] = [
    {
      id: 'constructor',
      icon: Blocks,
      onClick: nav('constructor'),
      gradient: 'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
      color: '#FF6835',
      badge: 'Proyectos · Tenants',
      label: 'Constructor',
      description: 'Generador de proyectos Charlie. Seleccioná módulos, configurá el frontstore y exportá el proyecto listo para deployar.',
      stats: [
        { icon: Blocks, value: '60+', label: 'Módulos' },
        { icon: Blocks, value: '3',   label: 'Pasos'   },
        { icon: Blocks, value: '2',   label: 'Outputs' },
      ],
    },
    {
      id: 'constructor-modulos',
      icon: Hammer,
      onClick: nav('constructor-modulos'),
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      color: '#8B5CF6',
      badge: 'Código · Estándar',
      label: 'Constructor Módulos',
      description: 'Crear, actualizar y reparar módulos Charlie. Genera código Charlie-compliant con C1–C8 cumplidos desde el primer commit.',
      stats: [
        { icon: Hammer, value: '5',    label: 'Operaciones' },
        { icon: Hammer, value: 'C1–C8', label: 'Criterios' },
        { icon: Hammer, value: '5',    label: 'Archivos'    },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TopBar
        icon={Hammer}
        iconBg="#FF6835"
        title="Construcción"
        subtitle="Constructor de proyectos y módulos Charlie"
        breadcrumb={{ label: 'Dashboard', onClick: () => onNavigate('dashboard') }}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <HubView
          hubIcon={Hammer}
          title="Construcción"
          subtitle="Constructor de proyectos y módulos"
          sections={[{ cards }]}
        />
      </div>
    </div>
  );
}
