import React, { useState, useEffect } from 'react';
import { AdminSidebar }      from './components/admin/AdminSidebar';
import { OrchestratorShell } from './components/OrchestratorShell';
import { Toaster }           from 'sonner';
import { useOrchestrator }   from '../shells/DashboardShell/app/providers/OrchestratorProvider';

export type MainSection =
  // Sistema
  | 'dashboard' | 'sistema' | 'checklist' | 'ideas' | 'roadmap'
  | 'constructor' | 'departamentos' | 'diseno' | 'config-vistas'
  | 'documentacion' | 'dashboard-admin' | 'dashboard-usuario'
  | 'auth-registro' | 'metamap-config'
  // eCommerce
  | 'ecommerce' | 'pedidos' | 'pagos' | 'metodos-pago' | 'metodos-envio'
  | 'clientes' | 'personas' | 'organizaciones' | 'storefront' | 'secondhand' | 'pos'
  // Logística
  | 'logistica' | 'envios' | 'transportistas' | 'rutas' | 'vehiculos'
  | 'depositos' | 'inventario' | 'entregas' | 'fulfillment' | 'produccion'
  | 'abastecimiento' | 'mapa-envios' | 'tracking-publico'
  // Marketing
  | 'marketing' | 'google-ads' | 'mailing' | 'seo' | 'fidelizacion'
  | 'rueda-sorteos' | 'etiqueta-emotiva'
  // RRSS
  | 'rrss' | 'redes-sociales' | 'migracion-rrss' | 'meta-business'
  // Herramientas
  | 'herramientas' | 'biblioteca' | 'editor-imagenes' | 'gen-documentos'
  | 'gen-presupuestos' | 'ocr' | 'impresion' | 'qr-generator'
  | 'ideas-board' | 'carga-masiva' | 'unified-workspace'
  // Gestión
  | 'gestion' | 'erp-inventario' | 'erp-facturacion' | 'erp-compras'
  | 'erp-crm' | 'erp-contabilidad' | 'erp-rrhh' | 'proyectos'
  | 'auditoria' | 'auditoria-health' | 'auditoria-logs'
  // Integraciones
  | 'integraciones' | 'integraciones-pagos' | 'integraciones-logistica'
  | 'integraciones-tiendas' | 'integraciones-rrss' | 'integraciones-servicios'
  | 'integraciones-marketplace' | 'integraciones-comunicacion'
  | 'integraciones-identidad' | 'integraciones-api-keys'
  | 'integraciones-webhooks' | 'integraciones-apis' | 'google-maps-test';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<MainSection>('dashboard');
  const nav = (s: MainSection) => setActiveSection(s);
  const { clienteNombre } = useOrchestrator();

  useEffect(() => { if (clienteNombre) document.title = clienteNombre; }, [clienteNombre]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div style={{
        display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#F8F9FA',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}>
        <AdminSidebar activeSection={activeSection} onNavigate={nav} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <OrchestratorShell activeSection={activeSection} onNavigate={nav} />
        </main>
      </div>
    </>
  );
}
