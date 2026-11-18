import React, { useState } from 'react'
import { useApp, TabType } from '../context/AppContext'
import {
  Home,
  Wrench,
  Users,
  Wallet,
  MoreHorizontal,
  CalendarDays,
  DollarSign,
  Package,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp()
  const [moreOpen, setMoreOpen] = useState(false)

  const mainTabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'os', label: 'OS', icon: Wrench },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'fiado', label: 'A Prazo', icon: Wallet },
  ]

  const extraTabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'atendimentos', label: 'Agendamentos', icon: CalendarDays },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ]

  const isExtraActive = extraTabs.some(t => t.id === activeTab)

  return (
    <>
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {moreOpen && (
        <div className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl border border-wr-border bg-wr-surface p-3 shadow-elevated lg:hidden animate-fadeIn">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-wr-border mb-2">
            <span className="text-xs font-bold text-wr-text">Mais opções</span>
            <button onClick={() => setMoreOpen(false)} className="text-wr-muted hover:text-wr-text">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {extraTabs.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMoreOpen(false)
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-[11px] font-semibold transition-colors ${
                    active
                      ? 'bg-wr-orange text-white dark:text-[#0B0C10]'
                      : 'bg-wr-elevated text-wr-muted hover:text-wr-text'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-wr-border bg-wr-surface/95 backdrop-blur-md py-2 px-2 lg:hidden">
        {mainTabs.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setMoreOpen(false)
              }}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                active ? 'text-wr-orange' : 'text-wr-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}

        <button
          onClick={() => setMoreOpen(prev => !prev)}
          className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-colors ${
            isExtraActive || moreOpen ? 'text-wr-orange' : 'text-wr-muted'
          }`}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span>Mais</span>
        </button>
      </nav>
    </>
  )
}
