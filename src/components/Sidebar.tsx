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
      label: 'Visão Geral',
      items: [
        { id: 'inicio', label: 'Painel Geral', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Operação da Oficina',
      items: [
        { id: 'os', label: 'Ordens de Serviço', icon: ClipboardList, badge: pendingOrdersCount },
        { id: 'atendimentos', label: 'Agendamentos & Boxes', icon: CalendarDays, badge: todayAppointmentsCount },
        {
          id: 'caixa',
          label: 'Caixa Diário',
          icon: Receipt,
          customBadge: activeShift ? 'Aberto' : undefined,
        },
      ],
    },
    {
      label: 'Relacionamento',
      items: [
        { id: 'clientes', label: 'Clientes & Veículos', icon: Users },
        {
          id: 'fiado',
          label: 'Pagar Depois (A Prazo)',
          icon: Wallet,
          badge: openDeferredCount,
          badgeDanger: overdueDeferredCount > 0,
        },
      ],
    },
    {
      label: 'Gestão & Financeiro',
      items: [
        { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
        { id: 'estoque', label: 'Estoque de Peças', icon: Package },
        { id: 'relatorios', label: 'Relatórios Gerenciais', icon: BarChart3 },
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#332D32] bg-[#1F1B1E] text-neutral-100 select-none transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-elevated' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="relative flex flex-col items-center justify-center border-b border-[#332D32] py-5 px-4">
          <WrLogo size="md" variant="dark" showSubtitle={true} />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-[#989999] hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 space-y-6 px-3 py-5 overflow-y-auto">
          {menuGroups
            .map(group => ({
              ...group,
              items: group.items.filter(it => canAccess(it.id)),
            }))
            .filter(group => group.items.length > 0)
            .map(group => (
              <div key={group.label} className="space-y-1.5">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#989999]/80">
                  {group.label}
                </span>
                <div className="space-y-1 pt-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#F04D07] text-white font-bold shadow-sm shadow-[#F04D07]/25'
                            : 'text-neutral-300 hover:bg-[#2B262A] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-4 w-4 transition-colors ${
                              isActive
                                ? 'text-white'
                                : 'text-[#989999] group-hover:text-[#F04D07]'
                            }`}
                            strokeWidth={isActive ? 2.25 : 1.75}
                          />
                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isActive
                                ? 'bg-black/20 text-white'
                                : item.badgeDanger
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-[#F04D07]/20 text-[#F04D07] border border-[#F04D07]/30'
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
          <div className="p-3 mx-3 mb-2 rounded-2xl bg-[#282327] border border-[#3B3439]">
            <div className="flex items-center justify-between gap-2.5 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F04D07]/20 border border-[#F04D07]/30 text-white font-bold text-xs">
                  {currentUserRole === 'dono' ? 'AD' : 'EQ'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white uppercase tracking-wider truncate">
                    {currentUserRole === 'dono' ? 'Administrador' : 'Equipe WR'}
                  </p>
                  <p className="text-[10px] text-[#989999] flex items-center gap-1.5 truncate">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        activeShift ? 'bg-emerald-400' : 'bg-[#989999]'
                      }`}
                    />
                    {activeShift ? 'Caixa Aberto' : 'Caixa Fechado'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sair / Trocar de Usuário"
                className="rounded-lg p-1.5 text-[#989999] hover:bg-white/10 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Rodapé institucional limpo */}
        <div className="p-3.5 border-t border-[#332D32] text-center">
          <p className="text-[10px] font-semibold text-[#989999] uppercase tracking-wider">
            WR Mecânica &amp; Cia
          </p>
          <p className="text-[9px] text-[#989999]/70">
            Luzimangues • Porto Nacional/TO
          </p>
        </div>
      </aside>
    </>
  )
}
