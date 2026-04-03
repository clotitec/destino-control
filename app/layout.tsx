import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Destino Control — Dashboard Turístico",
  description: "Dashboard de analítica turística municipal con informes IA",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.className} h-full`}>
      <body className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
        <Sidebar />
        <main className="ml-64 min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  )
}
