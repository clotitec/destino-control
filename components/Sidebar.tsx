'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, GitCompareArrows, FileText, Bell,
  Settings, Globe, BarChart3
} from 'lucide-react'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/comparativa', label: 'Comparativa', icon: GitCompareArrows },
  { href: '/informes', label: 'Informes', icon: FileText },
  { href: '/alertas', label: 'Alertas', icon: Bell },
  { href: '/config', label: 'Configuración', icon: Settings },
  { href: '/widget', label: 'Widget', icon: Globe },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/60 backdrop-blur-xl border-r border-white/30 z-50 flex flex-col">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">Destino</h1>
            <p className="text-xs text-gray-500">Control Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-500/10 text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/20">
        <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
          <p className="text-xs font-medium text-blue-700">Llanes, Asturias</p>
          <p className="text-[10px] text-blue-500 mt-0.5">Destino Control v1.0</p>
        </div>
      </div>
    </aside>
  )
}
