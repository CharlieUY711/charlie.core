-- schema.sql — C2: Backend del módulo Checklist & Roadmap
-- Idempotente: puede ejecutarse múltiples veces sin error.
-- Incluye RLS y trigger de updated_at automático.
-- Ejecutar en el Supabase del tenant (no en Supabase Charlie).

-- ─── Tabla principal de módulos ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roadmap_modules (
  id            text        PRIMARY KEY,          -- section ID del manifest (kebab-case, inmutable)
  tenant_id     text        NOT NULL,             -- aislamiento multi-tenant
  nombre        text        NOT NULL,
  familia       text        NOT NULL DEFAULT 'sin-clasificar',
  view_file     text,
  is_real       boolean     NOT NULL DEFAULT false,
  has_supabase  boolean     NOT NULL DEFAULT false,
  status        text        NOT NULL DEFAULT 'registrado'
                            CHECK (status IN (
                              'no-registrado','registrado','bloqueado',
                              'en-progreso','ui-lista','cumple-estandar','produccion'
                            )),
  prioridad     integer     NOT NULL DEFAULT 100,
  criterios     jsonb       NOT NULL DEFAULT '{}',  -- {C1: 'ok'|'warn'|'error'|'pending', ...}
  notas         text,
  activo        boolean     NOT NULL DEFAULT true,  -- soft delete
  audited_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS roadmap_modules_tenant_idx  ON roadmap_modules (tenant_id);
CREATE INDEX IF NOT EXISTS roadmap_modules_familia_idx ON roadmap_modules (familia);
CREATE INDEX IF NOT EXISTS roadmap_modules_status_idx  ON roadmap_modules (status);

-- ─── Historial de cambios ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roadmap_historial (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       text        NOT NULL,
  module_id       text        NOT NULL REFERENCES roadmap_modules(id) ON DELETE CASCADE,
  criterio        text,                           -- 'C1'–'C8' o NULL si es cambio de status
  estado_antes    text        NOT NULL,
  estado_despues  text        NOT NULL,
  origen          text        NOT NULL DEFAULT 'manual'
                              CHECK (origen IN ('automatico','manual','auditoria')),
  resuelto_por    text,
  activo          boolean     NOT NULL DEFAULT true,
  timestamp       timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS roadmap_historial_module_idx ON roadmap_historial (module_id);
CREATE INDEX IF NOT EXISTS roadmap_historial_tenant_idx ON roadmap_historial (tenant_id);

-- ─── Trigger updated_at ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_roadmap_modules   ON roadmap_modules;
DROP TRIGGER IF EXISTS set_updated_at_roadmap_historial ON roadmap_historial;

CREATE TRIGGER set_updated_at_roadmap_modules
  BEFORE UPDATE ON roadmap_modules
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_roadmap_historial
  BEFORE UPDATE ON roadmap_historial
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE roadmap_modules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_historial ENABLE ROW LEVEL SECURITY;

-- Política: el tenant solo ve sus propios módulos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'roadmap_modules' AND policyname = 'roadmap_modules_tenant_policy'
  ) THEN
    CREATE POLICY roadmap_modules_tenant_policy ON roadmap_modules
      USING (tenant_id = current_setting('app.tenant_id', true));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'roadmap_historial' AND policyname = 'roadmap_historial_tenant_policy'
  ) THEN
    CREATE POLICY roadmap_historial_tenant_policy ON roadmap_historial
      USING (tenant_id = current_setting('app.tenant_id', true));
  END IF;
END $$;
