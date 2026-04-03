# Destino Control

Dashboard de analítica turística municipal con generación de informes por IA.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Supabase** para base de datos y autenticación
- **Recharts** para gráficos interactivos
- **Claude API** para informes narrativos con IA
- **@react-pdf/renderer** para exportar informes en PDF
- **Diseño**: Apple Liquid Glass (glassmorphism)

## Inicio rápido

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Crear `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
ANTHROPIC_API_KEY=tu-api-key (opcional, usa mock si no está)
MUNICIPIO_ID=uuid-del-municipio
MUNICIPIO_NOMBRE=Llanes
MUNICIPIO_PROVINCIA=Asturias
```

## Base de datos

Ejecutar la migración en Supabase:

```
supabase/migrations/003_destino_control.sql
```

## Seed de datos

Pulsar "Generar datos demo" en el dashboard, o:

```bash
curl -X POST http://localhost:3000/api/seed
```

Genera 90 días de métricas realistas para Llanes.

## Funcionalidades

- **Dashboard**: 4 KPIs principales, gráfico evolución 30d, top idiomas
- **Comparativa**: Mes actual vs anterior, ranking POIs con sparklines
- **Informes**: Generación IA, preview, descarga PDF
- **Alertas**: Detección automática variaciones >20%
- **Widget**: Mini-dashboard embebible en cualquier web
- **Config**: Fuentes de datos y configuración

## Desarrollado por

CLOTITEC SLU
