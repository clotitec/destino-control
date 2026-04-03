# CLAUDE.md — Destino Control

## Quién eres y qué construyes

Eres el desarrollador de **Destino Control**, un dashboard de analítica turística municipal con generación de informes por IA. Lo construye **CLOTITEC SLU**.

Destino Control agrega métricas de todos los productos digitales de un municipio (tours 360°, audioguías, PWA, gamificación, Google Business) y genera informes mensuales automáticos con narrativa IA para que el concejal de turismo justifique la inversión.

**NO hagas preguntas. Decide y continúa.**

---

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (misma instancia que Municipio360)
- Recharts para gráficos
- Claude API para informes narrativos
- @react-pdf/renderer para exportar informes PDF
- Diseño: Apple Liquid Glass (glassmorphism)

---

## Estructura

```
destino-control/
├── app/
│   ├── layout.tsx              # Auth guard + sidebar
│   ├── page.tsx                # Dashboard principal con KPIs
│   ├── comparativa/page.tsx    # Comparativa temporal
│   ├── informes/
│   │   ├── page.tsx            # Lista de informes
│   │   └── [id]/page.tsx       # Detalle/preview informe
│   ├── alertas/page.tsx        # Alertas automáticas
│   ├── fuentes/page.tsx        # Config fuentes de datos
│   ├── config/page.tsx         # Configuración general
│   ├── widget/page.tsx         # Preview widget embebible
│   └── api/
│       ├── metricas/route.ts       # GET métricas con filtros fecha
│       ├── ingest/route.ts         # POST agrega eventos en métricas diarias
│       ├── informe/generate/route.ts # POST genera informe con Claude
│       ├── informe/pdf/route.ts    # GET genera PDF del informe
│       ├── alertas/route.ts        # GET alertas activas
│       └── seed/route.ts           # POST genera datos mock (desarrollo)
│
├── components/
│   ├── KPICard.tsx             # Card grande con número + trend arrow
│   ├── TrendChart.tsx          # Gráfico líneas Recharts
│   ├── HeatMap.tsx             # Mini mapa calor POIs (MapLibre circles)
│   ├── BarRanking.tsx          # Barras horizontales para rankings
│   ├── CompareCard.tsx         # Métrica actual vs anterior con delta %
│   ├── AlertBadge.tsx          # Badge alerta (subida verde, bajada roja)
│   ├── InformePreview.tsx      # Vista preview del informe generado
│   ├── InformePDF.tsx          # Template PDF con @react-pdf/renderer
│   ├── Sidebar.tsx             # Navegación lateral
│   ├── DateRangePicker.tsx     # Selector de rango de fechas
│   └── WidgetEmbed.tsx         # Widget mini-dashboard embebible
│
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── metricas.ts             # Queries agregadas de métricas
│   ├── claude.ts               # Client Claude API para informes
│   ├── seed.ts                 # Generador de datos mock realistas
│   └── alertas.ts              # Lógica de detección de alertas
│
└── supabase/migrations/
    └── 003_destino_control.sql
```

---

## Schema SQL

```sql
-- ============================================
-- DESTINO CONTROL: Tablas de analítica
-- ============================================

CREATE TABLE metricas_diarias (
  id BIGSERIAL PRIMARY KEY,
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  fuente TEXT NOT NULL,  -- 'municipio360' | 'gothru' | 'google_business' | 'ga4' | 'elevenlabs' | 'social'
  metrica TEXT NOT NULL, -- 'tour_views' | 'audio_plays' | 'pwa_installs' | 'page_views' | 'qr_scans' | 'gpx_downloads' | 'resenas' | 'checkins'
  valor NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Datos adicionales: {por_idioma: {es: 50, en: 30}, por_poi: {...}}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(municipio_id, fecha, fuente, metrica)
);

CREATE INDEX idx_metricas_municipio_fecha ON metricas_diarias(municipio_id, fecha DESC);
CREATE INDEX idx_metricas_fuente ON metricas_diarias(fuente);

CREATE TABLE informes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  periodo_inicio DATE NOT NULL,
  periodo_fin DATE NOT NULL,
  tipo TEXT DEFAULT 'mensual', -- 'mensual' | 'trimestral' | 'anual'
  datos_snapshot JSONB NOT NULL DEFAULT '{}',  -- Snapshot completo de métricas del periodo
  narrativa_ia TEXT,           -- Informe narrativo generado
  pdf_url TEXT,
  enviado BOOLEAN DEFAULT false,
  enviado_a TEXT,              -- Email de destino
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,          -- 'subida' | 'bajada' | 'info' | 'warning'
  metrica TEXT NOT NULL,
  valor_actual NUMERIC,
  valor_anterior NUMERIC,
  delta_pct NUMERIC,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alertas_municipio ON alertas(municipio_id, created_at DESC);

-- RLS
ALTER TABLE metricas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE informes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "metricas_auth" ON metricas_diarias FOR ALL USING (
  municipio_id IN (SELECT municipio_id FROM admin_users WHERE id = auth.uid())
);
CREATE POLICY "informes_auth" ON informes FOR ALL USING (
  municipio_id IN (SELECT municipio_id FROM admin_users WHERE id = auth.uid())
);
CREATE POLICY "alertas_auth" ON alertas FOR ALL USING (
  municipio_id IN (SELECT municipio_id FROM admin_users WHERE id = auth.uid())
);
```

---

## Seed de datos mock

Genera 90 días de métricas para Llanes con esta lógica:
- Base diaria: tour_views ~80-150, audio_plays ~30-60, page_views ~200-400, pwa_installs ~2-5, qr_scans ~10-25
- Fines de semana: +40%
- Tendencia mensual: +5% cada mes (crecimiento)
- Variación aleatoria: ±20%
- Distribuir por idiomas: es 45%, en 25%, fr 15%, de 10%, otros 5%
- Top POIs: los primeros 5 POIs acumulan el 60% de las visitas

---

## Prompt para informes IA

```
Eres el analista de turismo digital del municipio de {nombre_municipio} ({provincia}).
Genera un informe mensual dirigido al concejal/a de turismo.

DATOS DEL PERIODO ({periodo}):
{json_metricas}

FORMATO DEL INFORME:
1. RESUMEN EJECUTIVO (3 frases máximo)
2. LOGROS DEL MES (3-4 puntos con datos concretos)
3. ÁREAS DE MEJORA (2-3 puntos con recomendaciones)
4. COMPARATIVA CON MES ANTERIOR (tabla simple con flechas ↑↓)
5. RECOMENDACIONES DE ACCIÓN (3 acciones concretas y realizables)

REGLAS:
- Lenguaje claro, no técnico. El concejal no es informático.
- Usa números concretos siempre.
- Sé positivo pero honesto.
- Las recomendaciones deben ser accionables y de bajo coste.
- Máximo 500 palabras total.
```
