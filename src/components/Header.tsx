import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { 
  Bell, 
  Search, 
  Plus, 
  User, 
  ChevronDown,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

export const Header: React.FC = () => {
  const { 
    setIsNewOrderModalOpen,
    orders,
    stock
  } = useApp()

  const [showNotifications, setShowNotifications] = useState(false)
  const lowStockCount = stock.filter(s => s.status === 'Baixo').length
  const activeOrdersCount = orders.filter(o => o.status === 'andamento').length

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#262626] bg-[#151515] px-8 select-none">
      {/* Left: User Welcome & Identification */}
      <div>
        <h1 className="text-base font-bold text-[#FFFFFF] tracking-tight">
          Olá, bem-vindo de volta!
        </h1>
        <p className="text-xs text-[#A5A5A5] mt-0.5">
          Painel de Gerenciamento da Oficina • WR Mecânica &amp; Cia
        </p>
      </div>

      {/* Middle: Fast Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A5A5A5]" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por placa, cliente, OS ou peça..."
            className="w-full rounded-xl border border-[#262626] bg-[#202020] py-2.5 pl-10 pr-4 text-xs text-[#FFFFFF] placeholder-[#A5A5A5] transition-all focus:border-[#FF8500] focus:outline-none"
          />
        </div>
      </div>

      {/* Right: Quick Action, Notifications, and Profile */}
      <div className="flex items-center gap-4">
        {/* Nova Ordem de Serviço Button */}
        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] px-4 py-2.5 text-xs font-bold text-[#080808] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" strokeWidth={2.5} />
          <span>Nova Ordem de Serviço</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-[#A5A5A5] hover:text-[#FFFFFF] hover:border-[#383838] transition-colors"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4 text-[#FF8500]" strokeWidth={1.75} />
            {(lowStockCount > 0 || activeOrdersCount > 0) && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FF8500]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-[#262626] bg-[#151515] p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF8500]">Notificações</span>
                <span className="text-[11px] text-[#A5A5A5]">Em tempo real</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                {lowStockCount > 0 && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-[#202020] p-3 border border-[#262626]">
                    <AlertTriangle className="h-4 w-4 text-[#FF8500] shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <p className="font-semibold text-[#FFFFFF]">Alerta de Estoque Baixo</p>
                      <p className="text-[#A5A5A5] text-[11px] mt-0.5">
                        {lowStockCount} produto(s) atingiram a quantidade mínima de reposição.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2.5 rounded-xl bg-[#202020] p-3 border border-[#262626]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div>
                    <p className="font-semibold text-[#FFFFFF]">{activeOrdersCount} Ordens em Andamento</p>
                    <p className="text-[#A5A5A5] text-[11px] mt-0.5">
                      Veículos na oficina aguardando conclusão e liberação.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#262626]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#202020] border border-[#262626] text-[#FF8500]">
            <User className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#FFFFFF] leading-tight">Administrador</p>
            <span className="text-[10px] text-[#A5A5A5]">Gerente Operacional</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[#A5A5A5]" strokeWidth={1.75} />
        </div>
      </div>
    </header>
  )
}
