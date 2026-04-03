'use client'

import { useState } from 'react'
import { Code, Copy, Check } from 'lucide-react'
import WidgetEmbed from '@/components/WidgetEmbed'

export default function WidgetPage() {
  const [copied, setCopied] = useState(false)

  const embedCode = `<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : 'https://destino-control.vercel.app'}/widget/embed"
  width="380"
  height="240"
  frameborder="0"
  style="border-radius: 16px; overflow: hidden;"
></iframe>`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Widget embebible</h1>
        <p className="text-gray-500 mt-1">Mini-dashboard para incrustar en otras webs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista previa</h3>
          <div className="p-8 bg-gradient-to-br from-slate-100 to-blue-50 rounded-2xl flex items-center justify-center">
            <WidgetEmbed />
          </div>
        </div>

        {/* Embed code */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Código de inserción</h3>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">HTML</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
          </div>

          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-800 font-medium">Instrucciones</p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>1. Copia el código HTML de arriba</li>
              <li>2. Pégalo en cualquier página web donde quieras mostrar los KPIs</li>
              <li>3. El widget se actualiza automáticamente con datos en tiempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
