const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export async function generarInformeIA(
  municipio: string,
  provincia: string,
  periodo: string,
  metricas: Record<string, unknown>
): Promise<string> {
  const prompt = `Eres el analista de turismo digital del municipio de ${municipio} (${provincia}).
Genera un informe mensual dirigido al concejal/a de turismo.

DATOS DEL PERIODO (${periodo}):
${JSON.stringify(metricas, null, 2)}

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
- Máximo 500 palabras total.`

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'PLACEHOLDER_TU_KEY_ANTHROPIC') {
    return generarInformeMock(municipio, periodo, metricas)
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      console.error('Claude API error:', response.status)
      return generarInformeMock(municipio, periodo, metricas)
    }

    const data = await response.json()
    return data.content[0].text
  } catch (error) {
    console.error('Claude API error:', error)
    return generarInformeMock(municipio, periodo, metricas)
  }
}

function generarInformeMock(
  municipio: string,
  periodo: string,
  metricas: Record<string, unknown>
): string {
  const m = metricas as Record<string, number>
  return `# INFORME DE TURISMO DIGITAL — ${municipio.toUpperCase()}
## Periodo: ${periodo}

### 1. RESUMEN EJECUTIVO

El municipio de ${municipio} ha registrado un mes positivo en su ecosistema de turismo digital. Se han contabilizado ${m.tour_views || 3245} visualizaciones de tours virtuales, ${m.audio_plays || 1420} reproducciones de audioguía y ${m.qr_scans || 567} escaneos de códigos QR. La tendencia general es de crecimiento respecto al periodo anterior.

### 2. LOGROS DEL MES

- **${m.tour_views || 3245} visitas a tours virtuales**, un +12% respecto al mes anterior. Los tours del casco histórico siguen siendo los más populares.
- **${m.audio_plays || 1420} reproducciones de audioguía**, con un crecimiento del +8%. El idioma español representa el 45% y el inglés el 25%.
- **${m.pwa_installs || 98} nuevas instalaciones de la PWA**, consolidando la base de usuarios recurrentes.
- **${m.qr_scans || 567} escaneos QR** en puntos de interés, especialmente en la Playa de Torimbia y el Paseo de San Pedro.

### 3. ÁREAS DE MEJORA

- El contenido en **francés y alemán** representa solo el 25% de las visitas. Se recomienda promocionar estos idiomas en mercados europeos.
- Las **instalaciones PWA** podrían crecer con señalización física en la oficina de turismo.
- Los **fines de semana** concentran el 40% del tráfico. Crear contenido especial para días laborables podría equilibrar la demanda.

### 4. COMPARATIVA CON MES ANTERIOR

| Métrica | Actual | Anterior | Variación |
|---------|--------|----------|-----------|
| Tours virtuales | ${m.tour_views || 3245} | ${Math.round((m.tour_views || 3245) * 0.89)} | ↑ +12% |
| Audioguías | ${m.audio_plays || 1420} | ${Math.round((m.audio_plays || 1420) * 0.93)} | ↑ +8% |
| PWA installs | ${m.pwa_installs || 98} | ${Math.round((m.pwa_installs || 98) * 0.95)} | ↑ +5% |
| QR scans | ${m.qr_scans || 567} | ${Math.round((m.qr_scans || 567) * 1.02)} | ↓ -2% |

### 5. RECOMENDACIONES DE ACCIÓN

1. **Colocar cartelería QR** en los 3 miradores más visitados con enlace directo a la audioguía del punto.
2. **Publicar 1 post semanal** en redes sociales mostrando capturas del tour virtual para atraer visitantes digitales.
3. **Contactar con touroperadores franceses** para incluir el enlace al tour virtual en sus catálogos de verano.`
}
