import React from 'react'
import { useApp, TabType } from '../context/AppContext'
import { WrLogo } from './WrLogo'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  Car,
  Package,
  DollarSign,
  BarChart3,
  Settings,
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, orders, appointments } = useApp()

  const pendingOrdersCount = orders.filter(o => o.status === 'andamento' || o.status === 'aguardando').length
  const todayAppointmentsCount = appointments.filter(a => a.status === 'em_atendimento' || a.status === 'aguardando').length

  const menuItems: { id: TabType; label: string; icon: React.FC<{ className?: string; strokeWidth?: number }>; badge?: number }[] = [
    { id: 'inicio', label: 'Visão geral', icon: LayoutDashboard },
    { id: 'os', label: 'Ordens de serviço', icon: ClipboardList, badge: pendingOrdersCount },
    { id: 'atendimentos', label: 'Agendamentos', icon: CalendarDays, badge: todayAppointmentsCount },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'veiculos', label: 'Veículos', icon: Car },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#262626] bg-[#121316] select-none shadow-2xl">
      {/* Logo WR Mecânica & Cia */}
      <div className="flex flex-col items-center justify-center border-b border-[#262626] py-5 px-4 bg-[#0d0e12]">
        <WrLogo size="md" showSubtitle={true} />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 px-3 py-5 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#FF8500] text-[#080808] font-bold shadow-[0_4px_16px_rgba(255,133,0,0.35)] scale-[1.02]'
                  : 'text-[#A5A5A5] hover:bg-[#202020] hover:text-[#FFFFFF]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-[#080808] stroke-[2.2]' : 'text-[#A5A5A5] group-hover:text-[#FF8500]'
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.75}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-[#080808] text-[#FF8500]'
                    : 'bg-[#202020] text-[#A5A5A5] group-hover:bg-[#262626]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Status Footer */}
      <div className="p-4 border-t border-[#262626] bg-[#0d0e12]">
        <div className="flex items-center justify-between rounded-xl bg-[#1b1d24] px-3.5 py-2.5 text-xs border border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-[#A5A5A5]">Sistema Online</span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-[#FF8500]">DESKTOP</span>
        </div>
      </div>
    </aside>
  )
}
