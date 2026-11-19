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
  Receipt,
  LogOut,
  Download,
} from 'lucide-react'
import { usePwaInstall } from '../hooks/usePwaInstall'

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, canAccess, logout, currentUserRole } = useApp()
  const { installApp } = usePwaInstall()
  const [moreOpen, setMoreOpen] = useState(false)

  const mainTabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'caixa', label: 'Caixa', icon: Receipt },
    { id: 'os', label: 'OS', icon: Wrench },
    { id: 'clientes', label: 'Clientes', icon: Users },
  ]

  const extraTabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'fiado', label: 'A Prazo', icon: Wallet },
    { id: 'atendimentos', label: 'Agendamentos', icon: CalendarDays },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ]

  const accessibleMain = mainTabs.filter(t => canAccess(t.id))
  const accessibleExtra = extraTabs.filter(t => canAccess(t.id))

  const isExtraActive = accessibleExtra.some(t => t.id === activeTab)

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
            {accessibleExtra.map(tab => {
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

          {/* Trocar de Usuário & Baixar App (Mobile) */}
          <div className="pt-2.5 mt-2.5 border-t border-wr-border flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false)
                void installApp()
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-wr-orange/15 text-wr-orange font-bold text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Baixar App
            </button>
            {currentUserRole && (
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false)
                  logout()
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Trocar Usuário
              </button>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-wr-border bg-wr-surface/95 backdrop-blur-md py-2 px-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] lg:hidden shadow-lg">
        {accessibleMain.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setMoreOpen(false)
              }}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-3 min-w-[56px] text-[11px] font-bold transition-all active:scale-95 ${
                active ? 'text-wr-orange bg-wr-orange/15 shadow-xs' : 'text-wr-muted hover:text-wr-text'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}

        <button
          onClick={() => setMoreOpen(prev => !prev)}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-3 min-w-[56px] text-[11px] font-bold transition-all active:scale-95 ${
            isExtraActive || moreOpen ? 'text-wr-orange bg-wr-orange/15 shadow-xs' : 'text-wr-muted hover:text-wr-text'
          }`}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span>Mais</span>
        </button>
      </nav>
    </>
  )
}
