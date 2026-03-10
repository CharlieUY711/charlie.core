/**
 * visualRegistry.ts
 * Charlie Platform — Datos visuales por módulo
 * ═══════════════════════════════════════════════════════════════
 * Fuente única de verdad de colores, íconos, badges y stats.
 * Indexado por viewFile (ej: 'EnviosView').
 * Supabase define qué módulos están activos — este archivo los hace lindos.
 */

import {
  Package, Truck, Map, Car, Warehouse,
  BarChart2, CheckCircle, Activity, Clock, TrendingUp,
  ShoppingCart, CreditCard, Box, Layers, ArrowDownUp,
  Users, Building2, FolderTree, ShoppingBag,
  Settings, CheckSquare, Lightbulb, Hammer, Wrench, PuzzleIcon,
  Globe, Zap, Shield, Bell, Key, Webhook,
  Image, FileText, Printer, QrCode, ScanLine, BookOpen,
  LayoutDashboard, MapPin, Target, Megaphone, Mail, Search,
  Trophy, Star, RefreshCw, AlertTriangle, Heart,
  Factory, PackageCheck, Boxes, ShoppingBasket,
} from 'lucide-react';

export interface VisualEntry {
  icon:        React.ElementType;
  color:       string;
  gradient:    string;
  badge:       string;
  description: string;
  stats:       { icon: React.ElementType; label: string }[];
}

import React from 'react';

export const VISUAL_REGISTRY: Record<string, VisualEntry> = {

  // ── Logística ──────────────────────────────────────────────────────────────

  'EnviosView': {
    icon:        Package,
    color:       '#FF6835',
    gradient:    'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
    badge:       'OPERATIVO',
    description: 'Tracking operativo árbol pedido madre → envíos hijos. Acuse de recibo por transportista o destinatario.',
    stats:       [
      { icon: Activity,    label: 'Activos' },
      { icon: Clock,       label: 'En tránsito' },
      { icon: CheckCircle, label: 'Entregados' },
    ],
  },

  'TransportistasView': {
    icon:        Truck,
    color:       '#0EA5E9',
    gradient:    'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
    badge:       'CARRIERS',
    description: 'Catálogo de carriers, tramos, tarifas multi-carrier local, intercity e internacional. Simulador de tarifas.',
    stats:       [
      { icon: Truck,       label: 'Carriers' },
      { icon: MapPin,      label: 'Tramos' },
      { icon: BarChart2,   label: 'Zonas activas' },
    ],
  },

  'RutasView': {
    icon:        Map,
    color:       '#8B5CF6',
    gradient:    'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    badge:       'PLANIFICACIÓN',
    description: 'Gestión de rutas standard y personalizadas por proyecto. Mapa de paradas y progreso de entrega.',
    stats:       [
      { icon: Map,         label: 'Rutas' },
      { icon: MapPin,      label: 'Paradas' },
      { icon: CheckCircle, label: 'Completadas' },
    ],
  },

  'VehiculosView': {
    icon:        Car,
    color:       '#F59E0B',
    gradient:    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    badge:       'FLOTA',
    description: 'Flota de vehículos · asignación a rutas · estado y mantenimiento.',
    stats:       [
      { icon: Car,         label: 'Vehículos' },
      { icon: CheckCircle, label: 'Disponibles' },
      { icon: Wrench,      label: 'Mantenimiento' },
    ],
  },

  'DepositosView': {
    icon:        Warehouse,
    color:       '#10B981',
    gradient:    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    badge:       'ALMACENES',
    description: 'Almacenes propios, terceros y cross-docking.',
    stats:       [
      { icon: Warehouse,   label: 'Depósitos' },
      { icon: MapPin,      label: 'Ubicaciones' },
      { icon: BarChart2,   label: 'Capacidad' },
    ],
  },

  'InventarioView': {
    icon:        Boxes,
    color:       '#FF6835',
    gradient:    'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
    badge:       'STOCK',
    description: 'Stock por depósito · alertas de mínimo · movimientos entrada/salida.',
    stats:       [
      { icon: ShoppingBag, label: 'Artículos' },
      { icon: AlertTriangle, label: 'Alertas' },
      { icon: ArrowDownUp, label: 'Movimientos' },
    ],
  },

  'EntregasView': {
    icon:        PackageCheck,
    color:       '#22C55E',
    gradient:    'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    badge:       'CONFIRMACIÓN',
    description: 'Confirmaciones de entrega · firma · fotos · motivos de no entrega.',
    stats:       [
      { icon: PackageCheck, label: 'Entregadas' },
      { icon: CheckCircle,  label: 'Confirmadas' },
      { icon: Clock,        label: 'Pendientes' },
    ],
  },

  'FulfillmentView': {
    icon:        Layers,
    color:       '#6366F1',
    gradient:    'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    badge:       'DEPÓSITO',
    description: 'Wave picking, lotes de pedidos, empaque y procesamiento de órdenes en el depósito.',
    stats:       [
      { icon: Layers,      label: 'Lotes' },
      { icon: CheckCircle, label: 'Empacados' },
      { icon: Clock,       label: 'Pendientes' },
    ],
  },

  'ProduccionView': {
    icon:        Factory,
    color:       '#EC4899',
    gradient:    'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    badge:       'ARMADO · BOM',
    description: 'Órdenes de armado orientadas a ruta. BOM para kits, canastas y combos.',
    stats:       [
      { icon: Factory,     label: 'OA' },
      { icon: Clock,       label: 'Sin iniciar' },
      { icon: CheckCircle, label: 'Completadas' },
    ],
  },

  'AbastecimientoView': {
    icon:        ShoppingBasket,
    color:       '#F97316',
    gradient:    'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
    badge:       'MRP · OC',
    description: 'OC automáticas por faltantes de stock. MRP para cálculo de componentes necesarios por proyecto.',
    stats:       [
      { icon: AlertTriangle, label: 'Alertas' },
      { icon: ShoppingBasket, label: 'OC' },
      { icon: TrendingUp,   label: 'Valor a reponer' },
    ],
  },

  'MapaEnviosView': {
    icon:        MapPin,
    color:       '#0EA5E9',
    gradient:    'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
    badge:       'MAPA',
    description: 'Visualización geográfica de envíos activos con filtros por estado.',
    stats:       [
      { icon: MapPin,      label: 'Puntos activos' },
      { icon: Activity,    label: 'En movimiento' },
      { icon: CheckCircle, label: 'Entregados' },
    ],
  },

  'TrackingPublicoView': {
    icon:        Search,
    color:       '#64748B',
    gradient:    'linear-gradient(135deg, #64748B 0%, #475569 100%)',
    badge:       'TRACKING',
    description: 'Búsqueda por número de envío · timeline de estados · link público para destinatarios.',
    stats:       [
      { icon: Search,      label: 'Consultas' },
      { icon: Activity,    label: 'En tránsito' },
      { icon: CheckCircle, label: 'Entregados' },
    ],
  },

  'GoogleMapsTestView': {
    icon:        MapPin,
    color:       '#10B981',
    gradient:    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    badge:       'GOOGLE MAPS',
    description: 'Visualización de envíos sobre Google Maps en tiempo real.',
    stats:       [
      { icon: MapPin,      label: 'Marcadores' },
      { icon: Activity,    label: 'Activos' },
      { icon: BarChart2,   label: 'Zonas' },
    ],
  },

  // ── eCommerce ──────────────────────────────────────────────────────────────

  'PedidosView': {
    icon:        ShoppingCart,
    color:       '#FF6835',
    gradient:    'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
    badge:       'PEDIDOS',
    description: 'CRUD de pedidos con estados, filtros y árbol madre/hijos.',
    stats:       [
      { icon: ShoppingCart, label: 'Pedidos' },
      { icon: Clock,        label: 'Pendientes' },
      { icon: CheckCircle,  label: 'Completados' },
    ],
  },

  'PagosView': {
    icon:        CreditCard,
    color:       '#6366F1',
    gradient:    'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    badge:       'PAGOS',
    description: 'Transacciones y estados de pago operativos.',
    stats:       [
      { icon: CreditCard,  label: 'Transacciones' },
      { icon: CheckCircle, label: 'Aprobados' },
      { icon: AlertTriangle, label: 'Rechazados' },
    ],
  },

  'MetodosPagoView': {
    icon:        CreditCard,
    color:       '#8B5CF6',
    gradient:    'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    badge:       'CONFIGURACIÓN',
    description: 'Configuración de pasarelas y métodos de pago.',
    stats:       [
      { icon: CreditCard,  label: 'Métodos' },
      { icon: CheckCircle, label: 'Activos' },
      { icon: Shield,      label: 'Seguros' },
    ],
  },

  'MetodosEnvioView': {
    icon:        Truck,
    color:       '#0EA5E9',
    gradient:    'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
    badge:       'CONFIGURACIÓN',
    description: 'Configuración de métodos de envío y tarifas.',
    stats:       [
      { icon: Truck,       label: 'Métodos' },
      { icon: CheckCircle, label: 'Activos' },
      { icon: BarChart2,   label: 'Tarifas' },
    ],
  },

  // ── ERP / CRM ──────────────────────────────────────────────────────────────

  'PersonasView': {
    icon:        Users,
    color:       '#0EA5E9',
    gradient:    'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
    badge:       'PERSONAS',
    description: 'CRUD completo de personas físicas y jurídicas.',
    stats:       [
      { icon: Users,       label: 'Personas' },
      { icon: Building2,   label: 'Jurídicas' },
      { icon: Activity,    label: 'Activas' },
    ],
  },

  'OrganizacionesView': {
    icon:        Building2,
    color:       '#6366F1',
    gradient:    'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    badge:       'ORGANIZACIONES',
    description: 'CRUD completo de empresas y organizaciones.',
    stats:       [
      { icon: Building2,   label: 'Organizaciones' },
      { icon: Activity,    label: 'Activas' },
      { icon: Users,       label: 'Contactos' },
    ],
  },

  'DepartamentosView': {
    icon:        FolderTree,
    color:       '#F59E0B',
    gradient:    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    badge:       'ESTRUCTURA',
    description: 'Estructura de departamentos y áreas de la organización.',
    stats:       [
      { icon: FolderTree,  label: 'Departamentos' },
      { icon: Users,       label: 'Personas' },
      { icon: Activity,    label: 'Activos' },
    ],
  },

  'ArticulosView': {
    icon:        ShoppingBag,
    color:       '#10B981',
    gradient:    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    badge:       'CATÁLOGO',
    description: 'CRUD completo de artículos con control de stock mínimo.',
    stats:       [
      { icon: ShoppingBag, label: 'Artículos' },
      { icon: AlertTriangle, label: 'Stock bajo' },
      { icon: BarChart2,   label: 'Categorías' },
    ],
  },

  // ── Sistema ────────────────────────────────────────────────────────────────

  'ChecklistView': {
    icon:        CheckSquare,
    color:       '#475569',
    gradient:    'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
    badge:       'SISTEMA',
    description: 'Checklist C1-C8 por módulo · Roadmap de pendientes.',
    stats:       [
      { icon: CheckCircle, label: 'Completados' },
      { icon: Clock,       label: 'Pendientes' },
      { icon: TrendingUp,  label: 'Progreso' },
    ],
  },

  'IdeasView': {
    icon:        Lightbulb,
    color:       '#7C3AED',
    gradient:    'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    badge:       'IDEAS',
    description: 'Captura y evaluación de ideas con score de viabilidad.',
    stats:       [
      { icon: Lightbulb,   label: 'Capturadas' },
      { icon: TrendingUp,  label: 'En evaluación' },
      { icon: CheckCircle, label: 'Promovidas' },
    ],
  },

  // ── Constructor ────────────────────────────────────────────────────────────

  'ConstructorView': {
    icon:        Wrench,
    color:       '#FF6835',
    gradient:    'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
    badge:       'PROYECTOS',
    description: 'Generador de proyectos Charlie — módulos, configuración, frontstore y output.',
    stats:       [
      { icon: Activity,    label: 'Proyectos' },
      { icon: CheckCircle, label: 'Activos' },
      { icon: Package,     label: 'Módulos' },
    ],
  },

  'ConstructorModulos': {
    icon:        PuzzleIcon,
    color:       '#8B5CF6',
    gradient:    'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    badge:       'MÓDULOS',
    description: 'Constructor de módulos Charlie — crear, actualizar, reparar criterios C1-C8.',
    stats:       [
      { icon: PuzzleIcon,  label: 'Módulos' },
      { icon: CheckCircle, label: 'C8 OK' },
      { icon: Wrench,      label: 'En reparación' },
    ],
  },

  // ── Marketing ──────────────────────────────────────────────────────────────

  'GoogleAdsView': {
    icon:        Target,
    color:       '#FF6835',
    gradient:    'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
    badge:       'GOOGLE ADS',
    description: 'Dashboard Google Ads con KPIs, charts y tabla de campañas.',
    stats:       [
      { icon: Target,      label: 'Campañas' },
      { icon: TrendingUp,  label: 'Conversiones' },
      { icon: BarChart2,   label: 'Impresiones' },
    ],
  },

  'MailingView': {
    icon:        Mail,
    color:       '#0EA5E9',
    gradient:    'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
    badge:       'EMAIL',
    description: 'Campañas de email, suscriptores, segmentación, A/B testing y analíticas.',
    stats:       [
      { icon: Mail,        label: 'Campañas' },
      { icon: Users,       label: 'Suscriptores' },
      { icon: TrendingUp,  label: 'Apertura' },
    ],
  },

  'SEOView': {
    icon:        Search,
    color:       '#10B981',
    gradient:    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    badge:       'SEO',
    description: 'Keywords, rankings, análisis on-page, backlinks y salud SEO.',
    stats:       [
      { icon: Search,      label: 'Keywords' },
      { icon: TrendingUp,  label: 'Rankings' },
      { icon: Activity,    label: 'Salud' },
    ],
  },

  'RedesSocialesView': {
    icon:        Megaphone,
    color:       '#EC4899',
    gradient:    'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    badge:       'RRSS',
    description: 'Centro Operativo RRSS — métricas, programación de posts y análisis de audiencia.',
    stats:       [
      { icon: Megaphone,   label: 'Posts' },
      { icon: Heart,       label: 'Engagement' },
      { icon: Users,       label: 'Seguidores' },
    ],
  },

  // ── Herramientas ───────────────────────────────────────────────────────────

  'BibliotecaWorkspace': {
    icon:        BookOpen,
    color:       '#6366F1',
    gradient:    'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    badge:       'BIBLIOTECA',
    description: 'Assets, colecciones, tags, grid/lista y export.',
    stats:       [
      { icon: BookOpen,    label: 'Assets' },
      { icon: FolderTree,  label: 'Colecciones' },
      { icon: BarChart2,   label: 'Tamaño' },
    ],
  },

  'EditorImagenesWorkspace': {
    icon:        Image,
    color:       '#F59E0B',
    gradient:    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    badge:       'EDITOR',
    description: 'Filtros CSS, rotación, flip, 8 presets, export PNG/JPG.',
    stats:       [
      { icon: Image,       label: 'Imágenes' },
      { icon: RefreshCw,   label: 'Editadas' },
      { icon: CheckCircle, label: 'Exportadas' },
    ],
  },

  'GenDocumentosWorkspace': {
    icon:        FileText,
    color:       '#0EA5E9',
    gradient:    'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
    badge:       'DOCUMENTOS',
    description: 'Generador WYSIWYG con 8 tipos de bloque, A4, export PDF.',
    stats:       [
      { icon: FileText,    label: 'Documentos' },
      { icon: CheckCircle, label: 'Exportados' },
      { icon: Clock,       label: 'Borradores' },
    ],
  },

  'ImpresionWorkspace': {
    icon:        Printer,
    color:       '#64748B',
    gradient:    'linear-gradient(135deg, #64748B 0%, #475569 100%)',
    badge:       'IMPRESIÓN',
    description: 'Cola de trabajos, A4 preview, papel/orientación/color/calidad.',
    stats:       [
      { icon: Printer,     label: 'Trabajos' },
      { icon: CheckCircle, label: 'Completados' },
      { icon: Clock,       label: 'En cola' },
    ],
  },

  'QrGeneratorView': {
    icon:        QrCode,
    color:       '#1A1A2E',
    gradient:    'linear-gradient(135deg, #1A1A2E 0%, #374151 100%)',
    badge:       'QR',
    description: 'Generador QR sin APIs externas — PNG y SVG vectorial.',
    stats:       [
      { icon: QrCode,      label: 'Generados' },
      { icon: CheckCircle, label: 'Exportados' },
      { icon: Activity,    label: 'Activos' },
    ],
  },

  'OCRWorkspace': {
    icon:        ScanLine,
    color:       '#8B5CF6',
    gradient:    'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    badge:       'OCR',
    description: 'OCR 100% browser con Tesseract.js — Español/Inglés/PT, export TXT.',
    stats:       [
      { icon: ScanLine,    label: 'Documentos' },
      { icon: CheckCircle, label: 'Procesados' },
      { icon: Activity,    label: 'En proceso' },
    ],
  },

  // ── Dashboard ──────────────────────────────────────────────────────────────

  'DashboardView': {
    icon:        LayoutDashboard,
    color:       '#FF6835',
    gradient:    'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)',
    badge:       'DASHBOARD',
    description: 'Panel principal con métricas, charts y navegación rápida.',
    stats:       [
      { icon: Activity,    label: 'Módulos activos' },
      { icon: CheckCircle, label: 'Operativos' },
      { icon: TrendingUp,  label: 'Rendimiento' },
    ],
  },

};

/** Devuelve los datos visuales de un view, o defaults grises si no existe */
export function getVisual(viewName: string): VisualEntry {
  return VISUAL_REGISTRY[viewName] ?? {
    icon:        Settings,
    color:       '#6B7280',
    gradient:    'linear-gradient(135deg, #6B7280 0%, #374151 100%)',
    badge:       viewName.replace('View', '').toUpperCase(),
    description: '',
    stats:       [],
  };
}
