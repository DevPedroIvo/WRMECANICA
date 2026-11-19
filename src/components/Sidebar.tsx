import React from 'react'
import { useApp, TabType } from '../context/AppContext'
import { WrLogo } from './WrLogo'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  Wallet,
  Package,
  DollarSign,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    orders,
    appointments,
    deferredPayments,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useApp()

  const pendingOrdersCount = orders.filter(
    o => o.status === 'andamento' || o.status === 'aguardando'
  ).length
  const todayAppointmentsCount = appointments.filter(
    a => a.status === 'em_atendimento' || a.status === 'aguardando' || a.status === 'confirmado'
  ).length

  const todayISO = new Date().toISOString().slice(0, 10)
  const openDeferredCount = deferredPayments.filter(d => d.totalAmount - d.paidAmount > 0.01).length
  const overdueDeferredCount = deferredPayments.filter(
    d => d.totalAmount - d.paidAmount > 0.01 && d.dueDate < todayISO
  ).length

  const menuGroups: {
    label: string
    items: {
      id: TabType
      label: string
      icon: React.FC<{ className?: string; strokeWidth?: number }>
      badge?: number
      badgeDanger?: boolean
    }[]
  }[] = [
    {
      label: 'Operação',
      items: [
        { id: 'inicio', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'os', label: 'Ordens de Serviço', icon: ClipboardList, badge: pendingOrdersCount },
        { id: 'atendimentos', label: 'Agendamentos', icon: CalendarDays, badge: todayAppointmentsCount },
        { id: 'clientes', label: 'Clientes', icon: Users },
      ],
    },
    {
      label: 'Gestão & Caixa',
      items: [
        {
          id: 'fiado',
          label: 'Pagar Depois',
          icon: Wallet,
          badge: openDeferredCount,
          badgeDanger: overdueDeferredCount > 0,
        },
        { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
        { id: 'estoque', label: 'Estoque', icon: Package },
        { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
      ],
    },
    {
      label: 'Sistema',
      items: [{ id: 'configuracoes', label: 'Configurações', icon: Settings }],
    },
  ]

  const handleNavClick = (id: TabType) => {
    setActiveTab(id)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Backdrop mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-wr-border bg-wr-sidebar select-none transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-elevated' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="relative flex flex-col items-center justify-center border-b border-wr-border py-5 px-4">
          <WrLogo size="md" showSubtitle={true} />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-wr-muted hover:bg-wr-elevated hover:text-wr-text lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 space-y-5 px-3 py-5 overflow-y-auto">
          {menuGroups.map(group => (
            <div key={group.label} className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-wr-muted/80">
                {group.label}
              </span>
              <div className="space-y-1 pt-1">
                {group.items.map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-wr-orange text-white dark:text-[#0B0C10] font-bold shadow-sm'
                          : 'text-wr-muted hover:bg-wr-elevated hover:text-wr-text'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive
                              ? 'text-white dark:text-[#0B0C10]'
                              : 'text-wr-muted group-hover:text-wr-orange'
                          }`}
                          strokeWidth={isActive ? 2.25 : 1.75}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? 'bg-black/20 text-white dark:bg-[#0B0C10]/85 dark:text-wr-orange'
                              : item.badgeDanger
                              ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400'
                              : 'bg-wr-elevated text-wr-muted border border-wr-border'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Rodapé institucional limpo */}
        <div className="p-4 border-t border-wr-border text-center">
          <p className="text-[10px] font-semibold text-wr-muted uppercase tracking-wider">
            WR Mecânica &amp; Cia
          </p>
          <p className="text-[9px] text-wr-muted/70">
            Luzimangues • Porto Nacional/TO
          </p>
        </div>
      </aside>
    </>
  )
}
