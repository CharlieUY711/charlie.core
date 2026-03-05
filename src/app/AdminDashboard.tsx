/**
 * AdminDashboard.tsx
 * Charlie Platform -- Shell principal del admin.
 * MainSection es ahora string -- ningun modulo hardcodeado.
 */
import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { OrchestratorShell } from './components/OrchestratorShell';
import { useOrchestrator } from '../shells/DashboardShell/app/providers/OrchestratorProvider';

export type MainSection = string;

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<string>('DashboardView');
  const { clienteNombre } = useOrchestrator();

  const nav = (s: string) => setActiveSection(s);

  useEffect(() => {
    if (clienteNombre) document.title = clienteNombre;
  }, [clienteNombre]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#F8F9FA',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <AdminSidebar activeSection={activeSection} onNavigate={nav} />
        <main style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <OrchestratorShell activeSection={activeSection} onNavigate={nav} />
        </main>
      </div>
    </>
  );
}
