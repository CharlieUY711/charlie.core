/**
 * configLoader.ts
 * Carga la configuración del cliente desde Supabase (infraestructura Charlie).
 *
 * Detecta el cliente por:
 *   1. Query param ?slug=testing  (override manual)
 *   2. window.location.hostname   (producción)
 *   3. VITE_DEFAULT_TENANT        (desarrollo local)
 */

import { supabaseUrl, publicAnonKey } from '@/utils/supabase/info';

const CHARLIE_URL = supabaseUrl;
const CHARLIE_KEY = publicAnonKey;

// tipo 'modulo_activo' — muestra el nombre de la sección activa (sin texto extra)
// tipo 'promo'         — título + texto para anunciar algo próximo
// tipo 'mensaje'       — mensaje directo al usuario (puede cambiar a menudo)
// tipo 'oculto'        — la zona 4 no renderiza
export type InfoBlockTipo = 'modulo_activo' | 'promo' | 'mensaje' | 'oculto';

export interface SidebarInfoBlock {
  tipo:    InfoBlockTipo;
  titulo?: string;
  texto?:  string;
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
export interface SidebarCta {
  label: string;
  url?:  string;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export interface SidebarConfig {
  infoBlock?: SidebarInfoBlock | null;
  cta?:       SidebarCta       | null;
}

// ─── Conjunto ────────────────────────────────────────────────────────────────
export interface Conjunto {
  tabla:   string;
  filtro?: Record<string, unknown>;
  campos?: Record<string, string>;
}

// ─── RemoteConfig ─────────────────────────────────────────────────────────────
export interface RemoteConfig {
  tenantId:      string;
  tenantNombre:  string;
  clienteNombre: string;
  shell:         string;
  theme: {
    primary:    string;
    secondary?: string;
    nombre?:    string;
    sistema?:   string;
    logo?:      string;
  };
  sidebar:  SidebarConfig;
  modulos:  string[];
  backend: {
    tipo:        string;
    url:         string;
    anon_key:    string;
    supabaseUrl: string;
    supabaseKey: string;
  };
  conjuntos: Record<string, Conjunto>;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────
async function charlieFetch(path: string) {
  const res = await fetch(`${CHARLIE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey':        CHARLIE_KEY,
      'Authorization': `Bearer ${CHARLIE_KEY}`,
      'Content-Type':  'application/json',
    },
  });
  if (!res.ok) throw new Error(`Charlie API error: ${res.status}`);
  return res.json();
}

function detectTenantIdentifier(): string | null {
  const params    = new URLSearchParams(window.location.search);
  const slugParam = params.get('slug');
  if (slugParam) return slugParam;

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return (import.meta as any).env?.VITE_DEFAULT_TENANT ?? null;
  }
  return hostname;
}

// ─── Loader ───────────────────────────────────────────────────────────────────
export async function loadRemoteConfig(): Promise<RemoteConfig | null> {
  try {
    const identifier = detectTenantIdentifier();
    if (!identifier) {
      console.warn('[ConfigLoader] No se detectó tenant.');
      return null;
    }

    let rows: any[] = await charlieFetch(
      `tenant_config?dominio=eq.${encodeURIComponent(identifier)}&activo=eq.true&limit=1`
    );

    if (!rows || rows.length === 0) {
      rows = await charlieFetch(
        `tenant_config?tenant_id=eq.${encodeURIComponent(identifier)}&activo=eq.true&limit=1`
      );
    }

    if (!rows || rows.length === 0) {
      console.warn(`[ConfigLoader] Tenant "${identifier}" no encontrado.`);
      return null;
    }

    const cfg = rows[0];
    return {
      tenantId:      cfg.tenant_id,
      tenantNombre:  cfg.nombre,
      clienteNombre: cfg.nombre,
      shell:         cfg.shell    || 'DashboardShell',
      theme: {
        primary:   cfg.theme?.primary   || '#FF6B35',
        secondary: cfg.theme?.secondary,
        nombre:    cfg.theme?.nombre,
        sistema:   cfg.theme?.sistema,
        logo:      cfg.theme?.logo,
      },
      sidebar: {
        infoBlock: cfg.sidebar?.infoBlock ?? { tipo: 'modulo_activo' },
        cta:       cfg.sidebar?.cta       ?? null,
      },
      modulos:  cfg.modulos  || [],
      backend: {
        tipo:        cfg.backend?.tipo     || 'supabase',
        url:         cfg.backend?.url      || '',
        anon_key:    cfg.backend?.anon_key || '',
        supabaseUrl: cfg.backend?.url      || '',
        supabaseKey: cfg.backend?.anon_key || '',
      },
      conjuntos: cfg.conjuntos || {},
    };
  } catch (error) {
    console.error('[ConfigLoader] Error:', error);
    return null;
  }
}
