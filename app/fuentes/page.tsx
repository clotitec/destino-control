'use client'

import { Globe, BarChart3, Headphones, QrCode, Star, MapPin } from 'lucide-react'

const FUENTES = [
  { id: 'municipio360', name: 'Municipio 360°', icon: Globe, color: 'from-blue-500 to-blue-600', metricas: ['tour_views', 'qr_scans', 'gpx_downloads'], estado: 'activa' },
  { id: 'ga4', name: 'Google Analytics 4', icon: BarChart3, color: 'from-amber-500 to-amber-600', metricas: ['page_views', 'pwa_installs'], estado: 'activa' },
  { id: 'elevenlabs', name: 'ElevenLabs Audio', icon: Headphones, color: 'from-violet-500 to-violet-600', metricas: ['audio_plays'], estado: 'activa' },
  { id: 'google_business', name: 'Google Business', icon: Star, color: 'from-emerald-500 to-emerald-600', metricas: ['resenas'], estado: 'activa' },
  { id: 'social', name: 'Redes sociales', icon: MapPin, color: 'from-pink-500 to-pink-600', metricas: ['checkins'], estado: 'pendiente' },
]

export default function FuentesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fuentes de datos</h1>
        <p className="text-gray-500 mt-1">Plataformas conectadas al dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FUENTES.map(f => (
          <div key={f.id} className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                f.estado === 'activa' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {f.estado}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{f.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {f.metricas.map(m => (
                <span key={m} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                  {m.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
