import React, { useState } from 'react'
import { useApp, TabType } from '../context/AppContext'
import {
  Home,
  Wrench,
  Users,
  DollarSign,
  Menu,
  Car,
  Package,
  BarChart3,
  Settings,
  CalendarDays,
  X
} from 'lucide-react'

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp()
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const navItems = [
    { id: 'inicio' as TabType, label: 'Início', icon: Home },
    { id: 'atendimentos' as TabType, label: 'Agenda', icon: CalendarDays },
    { id: 'os' as TabType, label: 'OS', icon: Wrench },
    { id: 'financeiro' as TabType, label: 'Financeiro', icon: DollarSign },
  ]

  const moreItems = [
    { id: 'clientes' as TabType, label: 'Clientes', icon: Users },
    { id: 'veiculos' as TabType, label: 'Veículos', icon: Car },
    { id: 'estoque' as TabType, label: 'Estoque', icon: Package },
    { id: 'relatorios' as TabType, label: 'Relatórios', icon: BarChart3 },
    { id: 'configuracoes' as TabType, label: 'Configurações', icon: Settings },
  ]

  return (
    <>
      {showMoreMenu && (
        <div 
          onClick={() => setShowMoreMenu(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 pb-20"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#141820] p-5 shadow-2xl shadow-black animate-in fade-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-bold uppercase tracking-wider text-amber-400">Outros Recursos</span>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              {moreItems.map(item => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setShowMoreMenu(false)
                    }}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                      isActive
                        ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                        : 'border-white/5 bg-[#181d26] text-slate-300 hover:border-amber-500/30'
                    }`}
                  >
                    <Icon className="h-6 w-6 text-amber-400" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0d0f14]/95 backdrop-blur-xl px-2 py-1.5 lg:hidden">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-amber-500/15 text-amber-400' : ''
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
              </button>
            )
          })}

          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
              ['clientes', 'veiculos', 'estoque', 'relatorios', 'configuracoes'].includes(activeTab)
                ? 'text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              ['clientes', 'veiculos', 'estoque', 'relatorios', 'configuracoes'].includes(activeTab)
                ? 'bg-amber-500/15 text-amber-400'
                : ''
            }`}>
              <Menu className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium tracking-tight">Mais</span>
          </button>
        </div>
      </nav>
    </>
  )
}
