-- =============================================================================
-- charlie-core · Schema v1.0
-- Proyecto Supabase: charlie-core (svuwgjreuvutbnxrtria)
-- Creado: Marzo 2026
-- =============================================================================
-- Idempotente: se puede ejecutar múltiples veces sin error.
-- RLS habilitado en todas las tablas.
-- =============================================================================


-- ─── EXTENSIONES ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- INFRAESTRUCTURA — ORQUESTADOR
-- =============================================================================

-- ─── tenant_config ────────────────────────────────────────────────────────────
-- Configuración de cada tenant del sistema.

CREATE TABLE IF NOT EXISTS tenant_config (
  id         UUID        NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id  TEXT        NOT NULL UNIQUE,
  dominio    TEXT,
  nombre     TEXT        NOT NULL,
  activo     BOOLEAN     NOT NULL DEFAULT true,
  shell      TEXT        NOT NULL DEFAULT 'DashboardShell',
  theme      JSONB       NOT NULL DEFAULT '{}',
  sidebar    JSONB       NOT NULL DEFAULT '{}',
  modulos    TEXT[]      NOT NULL DEFAULT '{}',
  backend    JSONB       NOT NULL DEFAULT '{}',
  conjuntos  JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE tenant_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_tenant_config" ON tenant_config;
CREATE POLICY "public_read_tenant_config"
  ON tenant_config FOR SELECT USING (true);


-- ─── modulos_disponibles ──────────────────────────────────────────────────────
-- Registro de módulos activos del sistema — fuente de verdad del sidebar.

CREATE TABLE IF NOT EXISTS modulos_disponibles (
  id           UUID        NOT NULL DEFAULT uuid_generate_v4(),
  section      TEXT        NOT NULL UNIQUE,
  view         TEXT        NOT NULL,
  nombre       TEXT        NOT NULL,
  orden        INTEGER     NOT NULL DEFAULT 99,
  grupo        TEXT        NOT NULL DEFAULT 'Sin grupo',
  is_real      BOOLEAN     NOT NULL DEFAULT false,
  has_supabase BOOLEAN     NOT NULL DEFAULT false,
  view_file    TEXT,
  service_file TEXT,
  activo       BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE modulos_disponibles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_modulos_disponibles" ON modulos_disponibles;
CREATE POLICY "public_read_modulos_disponibles"
  ON modulos_disponibles FOR SELECT USING (true);


-- =============================================================================
-- PILAR 1 — CHECKLIST & ROADMAP
-- =============================================================================

-- ─── roadmap_modules ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roadmap_modules (
  id           TEXT        NOT NULL,
  tenant_id    TEXT        NOT NULL DEFAULT 'charlie',
  nombre       TEXT        NOT NULL,
  familia      TEXT        NOT NULL DEFAULT 'Sin grupo',
  view_file    TEXT,
  is_real      BOOLEAN     NOT NULL DEFAULT false,
  has_supabase BOOLEAN     NOT NULL DEFAULT false,
  status       TEXT        NOT NULL DEFAULT 'registrado'
               CHECK (status IN (
                 'no-registrado','registrado','bloqueado',
                 'en-progreso','ui-lista','cumple-estandar','produccion'
               )),
  prioridad    INTEGER     NOT NULL DEFAULT 99,
  notas        TEXT,
  criterios    JSONB       NOT NULL DEFAULT '{}',
  activo       BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  audited_at   TIMESTAMPTZ,
  PRIMARY KEY (id, tenant_id)
);

ALTER TABLE roadmap_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_roadmap_modules" ON roadmap_modules;
CREATE POLICY "tenant_isolation_roadmap_modules"
  ON roadmap_modules FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE INDEX IF NOT EXISTS idx_roadmap_modules_tenant  ON roadmap_modules (tenant_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_modules_status  ON roadmap_modules (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_roadmap_modules_familia ON roadmap_modules (tenant_id, familia);


-- ─── roadmap_historial ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roadmap_historial (
  id             UUID        NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id      TEXT        NOT NULL DEFAULT 'charlie',
  module_id      TEXT        NOT NULL,
  criterio_id    TEXT        CHECK (criterio_id IN ('C1','C2','C3','C4','C5','C6','C7','C8')),
  estado_antes   TEXT,
  estado_despues TEXT,
  origen         TEXT        NOT NULL DEFAULT 'manual'
                 CHECK (origen IN ('automatico','manual','auditoria')),
  resuelto_por   TEXT,
  detalle        TEXT,
  timestamp      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE roadmap_historial ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_roadmap_historial" ON roadmap_historial;
CREATE POLICY "tenant_isolation_roadmap_historial"
  ON roadmap_historial FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE INDEX IF NOT EXISTS idx_roadmap_historial_tenant    ON roadmap_historial (tenant_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_historial_module    ON roadmap_historial (tenant_id, module_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_historial_timestamp ON roadmap_historial (tenant_id, timestamp DESC);


-- =============================================================================
-- PILAR 2 — CONSTRUCTOR
-- =============================================================================

CREATE TABLE IF NOT EXISTS constructor_history (
  id           UUID        NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id    TEXT        NOT NULL DEFAULT 'charlie',
  modulo_id    TEXT        NOT NULL,
  operacion    TEXT        NOT NULL
               CHECK (operacion IN (
                 'crear-modulo','crear-componente','reparar-criterio','tenant-setup'
               )),
  output_files JSONB       NOT NULL DEFAULT '[]',
  criterios_ok TEXT[]      NOT NULL DEFAULT '{}',
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE constructor_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_constructor_history" ON constructor_history;
CREATE POLICY "tenant_isolation_constructor_history"
  ON constructor_history FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE INDEX IF NOT EXISTS idx_constructor_history_tenant ON constructor_history (tenant_id);
CREATE INDEX IF NOT EXISTS idx_constructor_history_modulo ON constructor_history (tenant_id, modulo_id);


-- =============================================================================
-- PILAR 3 — ORQUESTADOR
-- =============================================================================

CREATE TABLE IF NOT EXISTS clientes (
  id         UUID        NOT NULL DEFAULT uuid_generate_v4(),
  slug       TEXT        NOT NULL UNIQUE,
  nombre     TEXT        NOT NULL,
  activo     BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_only_clientes" ON clientes;
CREATE POLICY "service_role_only_clientes"
  ON clientes FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS cliente_config (
  id          UUID        NOT NULL DEFAULT uuid_generate_v4(),
  cliente_id  UUID        NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  theme       JSONB       NOT NULL DEFAULT '{}',
  modulos     TEXT[]      NOT NULL DEFAULT '{}',
  conjuntos   JSONB       NOT NULL DEFAULT '{}',
  backend_url TEXT,
  backend_key TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE (cliente_id)
);

ALTER TABLE cliente_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_only_cliente_config" ON cliente_config;
CREATE POLICY "service_role_only_cliente_config"
  ON cliente_config FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_cliente_config_cliente ON cliente_config (cliente_id);


-- =============================================================================
-- DATOS INICIALES
-- =============================================================================

INSERT INTO clientes (slug, nombre)
  VALUES ('charlie', 'Charlie Platform')
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO tenant_config (tenant_id, dominio, nombre, shell, theme, modulos)
  VALUES (
    'charlie', 'localhost', 'Charlie', 'DashboardShell',
    '{"primary": "#FF6835", "nombre": "Charlie", "sistema": "Charlie Platform"}',
    '{}'
  )
  ON CONFLICT (tenant_id) DO NOTHING;

INSERT INTO modulos_disponibles (section, view, nombre, orden, grupo, is_real, has_supabase, view_file, service_file)
  VALUES
    ('admin',             'AdminView',            'Admin',               1, 'core', true,  false, 'AdminView',            null),
    ('checklist-roadmap', 'ChecklistRoadmapView', 'Checklist & Roadmap', 2, 'core', true,  true,  'ChecklistRoadmapView', 'checklistRoadmapApi'),
    ('constructor',       'ConstructorView',      'Constructor',          3, 'core', true,  false, 'ConstructorView',      null),
    ('orquestador',       'OrchestratorView',     'Orquestador',          4, 'core', false, false, 'OrchestratorView',     null)
  ON CONFLICT (section) DO NOTHING;


-- =============================================================================
-- FIN — charlie-core schema v1.0
-- =============================================================================
