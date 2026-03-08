/* =====================================================
   Charlie Platform - AdminDashboard
   Shell principal - usa SidebarShell dinamico
   ===================================================== */
import React, { useState, useEffect } from 'react';
import { SidebarShell }      from '../shells/SidebarShell/SidebarShell';
import { OrchestratorShell } from './components/OrchestratorShell';
import { Toaster }           from 'sonner';
import { useOrchestrator }   from '../shells/DashboardShell/app/providers/OrchestratorProvider';
import { useModules }        from '../shells/DashboardShell/app/hooks/useModules';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<string>('');
  const { config }             = useOrchestrator();
  const { secciones, modulos, loading } = useModules();

  // Toma la primera seccion disponible cuando cargan los modulos
  useEffect(() => {
    if (!loading && secciones.length > 0 && activeSection === '') {
      const dashboard = secciones.find(s => s.section === 'Dashboard');
      setActiveSection(dashboard ? dashboard.section : secciones[0].section);
    }
  }, [loading, secciones]);

  useEffect(() => {
    const nombre = config?.theme?.nombre;
    if (nombre) document.title = nombre;
  }, [config?.theme?.nombre]);

  const nav = (s: string) => setActiveSection(s);

  if (loading || activeSection === '') {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#F8F9FA',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#9CA3AF', fontSize: 14,
      }}>
        Cargando...
      </div>
    );
  }

  if (secciones.length === 0) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#F8F9FA',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#9CA3AF', fontSize: 14,
      }}>
        No hay modulos activos configurados.
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <div style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        backgroundColor: '#F8F9FA',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}>
        <SidebarShell activeSection={activeSection} onNavigate={nav} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <OrchestratorShell
            activeSection={activeSection}
            onNavigate={nav}
            modulos={modulos}
          />
        </main>
      </div>
    </>
  );
}
