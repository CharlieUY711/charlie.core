/**
 * componentRegistry.ts
 * Charlie Platform — Registro de componentes.
 *
 * REGLA: la clave es el valor exacto de la columna `view`
 * en la tabla modulos_disponibles de Supabase.
 */
import React from 'react';

export const COMPONENT_REGISTRY: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {

    // ── Tres Pilares (infraestructura Charlie) ────────────────────────────────
  'ChecklistRoadmapView':       React.lazy(() => import('../../modules/checklist-roadmap/ui/views/ChecklistRoadmapView').then(m => ({ default: m.ChecklistRoadmapView }))),
  'VistasShellsView':           React.lazy(() => import('../../modules/vistas-shells/ui/views/VistasShellsView').then(m => ({ default: m.VistasShellsView }))), 
  // ── Core ──────────────────────────────────────────────────────────────────
  'DashboardView':              React.lazy(() => import('../components/admin/views/DashboardView').then(m => ({ default: m.DashboardView }))),
  'SistemaView':                React.lazy(() => import('../components/admin/views/SistemaView').then(m => ({ default: m.SistemaView }))),
  'ConstruccionView':           React.lazy(() => import('../components/admin/views/ConstruccionView').then(m => ({ default: m.ConstruccionView }))),
  'ConstructorView':            React.lazy(() => import('../components/admin/views/ConstructorView').then(m => ({ default: m.ConstructorView }))),
  'ConstructorModulos':         React.lazy(() => import('../components/admin/views/ConstructorModulos').then(m => ({ default: m.ConstructorModulos }))),
  'ChecklistView':              React.lazy(() => import('../components/admin/views/ChecklistView').then(m => ({ default: m.ChecklistView }))),
  'AuditoriaHubView':           React.lazy(() => import('../components/admin/views/AuditoriaHubView').then(m => ({ default: m.AuditoriaHubView }))),
  'DocumentacionView':          React.lazy(() => import('../components/admin/views/DocumentacionView').then(m => ({ default: m.DocumentacionView }))),
  'APIKeysView':                React.lazy(() => import('../components/admin/views/APIKeysView').then(m => ({ default: m.APIKeysView }))),
  'WebhooksView':               React.lazy(() => import('../components/admin/views/WebhooksView').then(m => ({ default: m.WebhooksView }))),
  'SystemLogsView':             React.lazy(() => import('../components/admin/views/SystemLogsView').then(m => ({ default: m.SystemLogsView }))),
  'HealthMonitorView':          React.lazy(() => import('../components/admin/views/HealthMonitorView').then(m => ({ default: m.HealthMonitorView }))),
  'DisenoView':                 React.lazy(() => import('../components/admin/views/DisenoView').then(m => ({ default: m.DisenoView }))),
  'ConfigVistasPorRolView':     React.lazy(() => import('../components/admin/views/ConfigVistasPorRolView').then(m => ({ default: m.ConfigVistasPorRolView }))),
  'IntegracionesView':          React.lazy(() => import('../components/admin/views/IntegracionesView').then(m => ({ default: m.IntegracionesView }))),
  'IntegracionesPagosView':     React.lazy(() => import('../components/admin/views/IntegracionesPagosView').then(m => ({ default: m.IntegracionesPagosView }))),
  'IntegracionesLogisticaView': React.lazy(() => import('../components/admin/views/IntegracionesLogisticaView').then(m => ({ default: m.IntegracionesLogisticaView }))),
  'IntegracionesIdentidadView': React.lazy(() => import('../components/admin/views/IntegracionesIdentidadView').then(m => ({ default: m.IntegracionesIdentidadView }))),
  'IntegracionesMarketplaceView': React.lazy(() => import('../components/admin/views/IntegracionesMarketplaceView').then(m => ({ default: m.IntegracionesMarketplaceView }))),
  'IntegracionesComunicacionView': React.lazy(() => import('../components/admin/views/IntegracionesComunicacionView').then(m => ({ default: m.IntegracionesComunicacionView }))),
  'IntegracionesRRSSView':      React.lazy(() => import('../components/admin/views/IntegracionesRRSSView').then(m => ({ default: m.IntegracionesRRSSView }))),
  'IntegracionesServiciosView': React.lazy(() => import('../components/admin/views/IntegracionesServiciosView').then(m => ({ default: m.IntegracionesServiciosView }))),
  'IntegracionesTiendasView':   React.lazy(() => import('../components/admin/views/IntegracionesTiendasView').then(m => ({ default: m.IntegracionesTiendasView }))),
  'RepositorioAPIsView':        React.lazy(() => import('../components/admin/views/RepositorioAPIsView').then(m => ({ default: m.RepositorioAPIsView }))),
  'AuthRegistroView':           React.lazy(() => import('../components/admin/views/AuthRegistroView').then(m => ({ default: m.AuthRegistroView }))),
  'AdminDashboardView':         React.lazy(() => import('../components/admin/views/AdminDashboardView').then(m => ({ default: m.AdminDashboardView }))),
  'RepositorioView':            React.lazy(() => import('../components/admin/views/RepositorioView').then(m => ({ default: m.RepositorioView }))),
  'UserDashboardView':          React.lazy(() => import('../components/admin/views/UserDashboardView').then(m => ({ default: m.UserDashboardView }))),

  // ── Logística ─────────────────────────────────────────────────────────────
  'LogisticaView':              React.lazy(() => import('../components/admin/views/LogisticaView').then(m => ({ default: m.LogisticaView }))),
  'EnviosView':                 React.lazy(() => import('../components/admin/views/EnviosView').then(m => ({ default: m.EnviosView }))),
  'TransportistasView':         React.lazy(() => import('../components/admin/views/TransportistasView').then(m => ({ default: m.TransportistasView }))),
  'OrganizacionesView':         React.lazy(() => import('../components/admin/views/OrganizacionesView').then(m => ({ default: m.OrganizacionesView }))),
  'RutasView':                  React.lazy(() => import('../components/admin/views/RutasView').then(m => ({ default: m.RutasView }))),
  'EntregasView':               React.lazy(() => import('../components/admin/views/EntregasView').then(m => ({ default: m.EntregasView }))),
  'FulfillmentView':            React.lazy(() => import('../components/admin/views/FulfillmentView').then(m => ({ default: m.FulfillmentView }))),
  'MapaEnviosView':             React.lazy(() => import('../components/admin/views/MapaEnviosView').then(m => ({ default: m.MapaEnviosView }))),
  'TrackingPublicoView':        React.lazy(() => import('../components/admin/views/TrackingPublicoView').then(m => ({ default: m.TrackingPublicoView }))),
  'AbastecimientoView':         React.lazy(() => import('../components/admin/views/AbastecimientoView').then(m => ({ default: m.AbastecimientoView }))),
  'ProduccionView':             React.lazy(() => import('../components/admin/views/ProduccionView').then(m => ({ default: m.ProduccionView }))),
  'DepositosView':              React.lazy(() => import('../components/admin/views/DepositosView').then(m => ({ default: m.DepositosView }))),
  'VehiculosView':              React.lazy(() => import('../components/admin/views/VehiculosView').then(m => ({ default: m.VehiculosView }))),
  'MetodosEnvioView':           React.lazy(() => import('../components/admin/views/MetodosEnvioView').then(m => ({ default: m.MetodosEnvioView }))),
  'GoogleMapsTestView':         React.lazy(() => import('../components/admin/views/GoogleMapsTestView').then(m => ({ default: m.GoogleMapsTestView }))),

  // ── Transaccional ─────────────────────────────────────────────────────────
  'EcommerceView':              React.lazy(() => import('../components/admin/views/EcommerceView').then(m => ({ default: m.EcommerceView }))),
  'PedidosView':                React.lazy(() => import('../components/admin/views/PedidosView').then(m => ({ default: m.PedidosView }))),
  'PagosView':                  React.lazy(() => import('../components/admin/views/PagosView').then(m => ({ default: m.PagosView }))),
  'MetodosPagoView':            React.lazy(() => import('../components/admin/views/MetodosPagoView').then(m => ({ default: m.MetodosPagoView }))),
  'POSView':                    React.lazy(() => import('../components/admin/views/POSView').then(m => ({ default: m.POSView }))),
  'CargaMasivaView':            React.lazy(() => import('../components/admin/views/CargaMasivaView').then(m => ({ default: m.CargaMasivaView }))),
  'InventarioView':             React.lazy(() => import('../components/admin/views/InventarioView').then(m => ({ default: m.InventarioView }))),

  // ── ERP & CRM ─────────────────────────────────────────────────────────────
  'PersonasView':               React.lazy(() => import('../components/admin/views/PersonasView').then(m => ({ default: m.PersonasView }))),
  'ClientesView':               React.lazy(() => import('../components/admin/views/ClientesView').then(m => ({ default: m.ClientesView }))),
  'DepartamentosView':          React.lazy(() => import('../components/admin/views/DepartamentosView').then(m => ({ default: m.DepartamentosView }))),
  'ERPCRMView':                 React.lazy(() => import('../components/admin/views/ERPCRMView').then(m => ({ default: m.ERPCRMView }))),
  'ERPInventarioView':          React.lazy(() => import('../components/admin/views/ERPInventarioView').then(m => ({ default: m.ERPInventarioView }))),
  'ERPFacturacionView':         React.lazy(() => import('../components/admin/views/ERPFacturacionView').then(m => ({ default: m.ERPFacturacionView }))),
  'ERPComprasView':             React.lazy(() => import('../components/admin/views/ERPComprasView').then(m => ({ default: m.ERPComprasView }))),
  'ERPContabilidadView':        React.lazy(() => import('../components/admin/views/ERPContabilidadView').then(m => ({ default: m.ERPContabilidadView }))),
  'ERPRRHHView':                React.lazy(() => import('../components/admin/views/ERPRRHHView').then(m => ({ default: m.ERPRRHHView }))),
  'ProyectosView':              React.lazy(() => import('../components/admin/views/ProyectosView').then(m => ({ default: m.ProyectosView }))),
  'FidelizacionView':           React.lazy(() => import('../components/admin/views/FidelizacionView').then(m => ({ default: m.FidelizacionView }))),
  'SecondHandView':             React.lazy(() => import('../components/admin/views/SecondHandView').then(m => ({ default: m.SecondHandView }))),
  'GestionView':                React.lazy(() => import('../components/admin/views/GestionView').then(m => ({ default: m.GestionView }))),

  // ── Marketing ─────────────────────────────────────────────────────────────
  'MarketingView':              React.lazy(() => import('../components/admin/views/MarketingView').then(m => ({ default: m.MarketingView }))),
  'GoogleAdsView':              React.lazy(() => import('../components/admin/views/GoogleAdsView').then(m => ({ default: m.GoogleAdsView }))),
  'MailingView':                React.lazy(() => import('../components/admin/views/MailingView').then(m => ({ default: m.MailingView }))),
  'SEOView':                    React.lazy(() => import('../components/admin/views/SEOView').then(m => ({ default: m.SEOView }))),
  'RedesSocialesView':          React.lazy(() => import('../components/admin/views/RedesSocialesView').then(m => ({ default: m.RedesSocialesView }))),
  'RRSSHubView':                React.lazy(() => import('../components/admin/views/RRSSHubView').then(m => ({ default: m.RRSSHubView }))),
  'MigracionRRSSView':          React.lazy(() => import('../components/admin/views/MigracionRRSSView').then(m => ({ default: m.MigracionRRSSView }))),
  'MetaBusinessView':           React.lazy(() => import('../components/admin/views/MetaBusinessView').then(m => ({ default: m.MetaBusinessView }))),
  'MetaMapView':                React.lazy(() => import('../components/admin/views/MetaMapView').then(m => ({ default: m.MetaMapView }))),
  'EtiquetaEmotivaView':        React.lazy(() => import('../components/admin/views/EtiquetaEmotivaView').then(m => ({ default: m.EtiquetaEmotivaView }))),
  'RuedaSorteosView':           React.lazy(() => import('../components/admin/views/RuedaSorteosView').then(m => ({ default: m.RuedaSorteosView }))),

  // ── Herramientas ──────────────────────────────────────────────────────────
  'HerramientasView':           React.lazy(() => import('../components/admin/views/HerramientasView').then(m => ({ default: m.HerramientasView }))),
  'BibliotecaWorkspace':        React.lazy(() => import('../components/admin/views/BibliotecaWorkspace').then(m => ({ default: m.BibliotecaWorkspace }))),
  'EditorImagenesWorkspace':    React.lazy(() => import('../components/admin/views/EditorImagenesWorkspace').then(m => ({ default: m.EditorImagenesWorkspace }))),
  'GenDocumentosWorkspace':     React.lazy(() => import('../components/admin/views/GenDocumentosWorkspace').then(m => ({ default: m.GenDocumentosWorkspace }))),
  'GenPresupuestosWorkspace':   React.lazy(() => import('../components/admin/views/GenPresupuestosWorkspace').then(m => ({ default: m.GenPresupuestosWorkspace }))),
  'ImpresionWorkspace':         React.lazy(() => import('../components/admin/views/ImpresionWorkspace').then(m => ({ default: m.ImpresionWorkspace }))),
  'OCRWorkspace':               React.lazy(() => import('../components/admin/views/OCRWorkspace').then(m => ({ default: m.OCRWorkspace }))),
  'QrGeneratorView':            React.lazy(() => import('../components/admin/views/QrGeneratorView').then(m => ({ default: m.QrGeneratorView }))),

};



