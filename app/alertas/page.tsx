'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Bell, RefreshCw } from 'lucide-react'
import AlertBadge from '@/components/AlertBadge'

type Alerta = {
  tipo: string
  metrica: string
  valor_actual: number
  valor_anterior: number
  delta_pct: number
  mensaje: string
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  const loadAlertas = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/alertas')
      const data = await res.json()
      setAlertas(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { loadAlertas() }, [])

  const subidas = alertas.filter(a => a.tipo === 'subida')
  const bajadas = alertas.filter(a => a.tipo === 'bajada')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-500 mt-1">Variaciones superiores al 20% en la última semana</p>
        </div>
        <button
          onClick={loadAlertas}
          className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/30 rounded-xl text-sm text-gray-600 hover:bg-white/80 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : alertas.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Sin alertas activas</h3>
          <p className="text-sm text-gray-500 mt-2">No hay variaciones significativas esta semana</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {subidas.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Subidas ({subidas.length})
              </h2>
              <div className="space-y-3">
                {subidas.map((a, i) => (
                  <AlertBadge key={i} tipo={a.tipo} mensaje={a.mensaje} delta={a.delta_pct} />
                ))}
              </div>
            </div>
          )}

          {bajadas.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Bajadas ({bajadas.length})
              </h2>
              <div className="space-y-3">
                {bajadas.map((a, i) => (
                  <AlertBadge key={i} tipo={a.tipo} mensaje={a.mensaje} delta={a.delta_pct} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Config alertas */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de alertas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Umbral de variación</p>
              <p className="text-xs text-gray-500">Porcentaje mínimo para generar alerta</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">20%</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Periodo de comparación</p>
              <p className="text-xs text-gray-500">Ventana temporal para detectar cambios</p>
            </div>
            <span className="text-sm font-bold text-gray-900">7 días</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Notificaciones por email</p>
              <p className="text-xs text-gray-500">Enviar alertas al concejal</p>
            </div>
            <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
