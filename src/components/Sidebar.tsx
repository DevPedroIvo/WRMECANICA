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
  Receipt,
  LogOut,
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
    activeShift,
    currentUserRole,
    currentUserName,
    canAccess,
    logout,
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
      customBadge?: string
    }[]
  }[] = [
    {
      label: 'Operação',
      items: [
        { id: 'inicio', label: 'Visão Geral', icon: LayoutDashboard },
        {
          id: 'caixa',
          label: 'Caixa Diário',
          icon: Receipt,
          customBadge: activeShift ? 'Aberto' : undefined,
        },
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#1F2E47] bg-[#111B2B] text-slate-100 select-none transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-elevated' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="relative flex flex-col items-center justify-center border-b border-[#1F2E47] py-5 px-4">
          <WrLogo size="md" variant="dark" showSubtitle={true} />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 space-y-5 px-3 py-5 overflow-y-auto">
          {menuGroups
            .map(group => ({
              ...group,
              items: group.items.filter(it => canAccess(it.id)),
            }))
            .filter(group => group.items.length > 0)
            .map(group => (
              <div key={group.label} className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/90">
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
                            ? 'bg-[#F97316] hover:bg-[#EA580C] text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-4 w-4 transition-colors ${
                              isActive
                                ? 'text-white'
                                : 'text-slate-400 group-hover:text-[#F97316]'
                            }`}
                            strokeWidth={isActive ? 2.25 : 1.75}
                          />
                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isActive
                                ? 'bg-black/25 text-white'
                                : item.badgeDanger
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.customBadge && (
                          <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/30">
                            {item.customBadge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
        </nav>

        {/* Operador Ativo */}
        {currentUserRole && (
          <div className="p-3 mx-3 mb-2 rounded-2xl bg-[#162238] border border-[#1F2E47]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  currentUserRole === 'dono' ? 'bg-[#F97316] animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white uppercase tracking-wider truncate">
                  {currentUserRole === 'dono' ? 'Dono (Administrador)' : 'Equipe (Wr_mecanica)'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {activeShift ? 'Caixa Aberto' : 'Caixa Fechado'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé institucional limpo */}
        <div className="p-4 border-t border-[#1F2E47] text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            WR Mecânica &amp; Cia
          </p>
          <p className="text-[9px] text-slate-500">
            Luzimangues • Porto Nacional/TO
          </p>
        </div>
      </aside>
    </>
  )
}
