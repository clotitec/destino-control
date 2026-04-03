-- ============================================
-- DESTINO CONTROL: Tablas de analítica
-- ============================================

CREATE TABLE IF NOT EXISTS metricas_diarias (
  id BIGSERIAL PRIMARY KEY,
  municipio_id UUID NOT NULL,
  fecha DATE NOT NULL,
  fuente TEXT NOT NULL,
  metrica TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(municipio_id, fecha, fuente, metrica)
);

CREATE INDEX IF NOT EXISTS idx_metricas_municipio_fecha ON metricas_diarias(municipio_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_metricas_fuente ON metricas_diarias(fuente);

CREATE TABLE IF NOT EXISTS informes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fin DATE NOT NULL,
  tipo TEXT DEFAULT 'mensual',
  datos_snapshot JSONB NOT NULL DEFAULT '{}',
  narrativa_ia TEXT,
  pdf_url TEXT,
  enviado BOOLEAN DEFAULT false,
  enviado_a TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  metrica TEXT NOT NULL,
  valor_actual NUMERIC,
  valor_anterior NUMERIC,
  delta_pct NUMERIC,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_municipio ON alertas(municipio_id, created_at DESC);

-- RLS
ALTER TABLE metricas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE informes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
