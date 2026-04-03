'use client'

import { Settings, Database, Key, Globe, Bell } from 'lucide-react'

export default function ConfigPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Ajustes del dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Municipio */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Municipio</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Nombre</label>
              <input type="text" defaultValue="Llanes" className="w-full mt-1 px-3 py-2 bg-white/60 border border-gray-200 rounded-lg text-sm" readOnly />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Provincia</label>
              <input type="text" defaultValue="Asturias" className="w-full mt-1 px-3 py-2 bg-white/60 border border-gray-200 rounded-lg text-sm" readOnly />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">ID Municipio</label>
              <input type="text" defaultValue="550e8400-e29b-41d4-a716-446655440000" className="w-full mt-1 px-3 py-2 bg-white/60 border border-gray-200 rounded-lg text-xs font-mono" readOnly />
            </div>
          </div>
        </div>

        {/* Base de datos */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Base de datos</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Estado</span>
              <span className="text-sm font-medium text-emerald-600">Conectado</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Proveedor</span>
              <span className="text-sm font-medium text-gray-900">Supabase</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Tablas</span>
              <span className="text-sm font-medium text-gray-900">metricas_diarias, informes, alertas</span>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Supabase</span>
              <span className="text-sm font-medium text-emerald-600">Configurada</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Claude API</span>
              <span className="text-sm font-medium text-amber-600">Placeholder</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">MapTiler</span>
              <span className="text-sm font-medium text-emerald-600">Configurada</span>
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-lg shadow-black/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Umbral</span>
              <span className="text-sm font-medium text-gray-900">±20%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Periodo</span>
              <span className="text-sm font-medium text-gray-900">Semanal</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Email alertas</span>
              <span className="text-sm font-medium text-gray-400">No configurado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
