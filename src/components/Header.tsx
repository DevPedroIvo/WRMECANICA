import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import {
  Bell,
  Search,
  Plus,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle2,
  Menu,
  Users,
  Car,
  ClipboardList,
  Package,
  Wallet,
  X,
  LogOut,
} from 'lucide-react'

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  inicio: { title: 'Visão Geral', subtitle: 'Resumo operacional da oficina em tempo real' },
  caixa: { title: 'Caixa Diário', subtitle: 'Abertura, fechamento e controle de gaveta' },
  os: { title: 'Ordens de Serviço', subtitle: 'Atendimentos, checklist visual e emissão de NFS-e' },
  atendimentos: { title: 'Agendamentos', subtitle: 'Agenda do dia e controle dos boxes' },
  clientes: { title: 'Clientes & Veículos', subtitle: 'Cadastro de pessoas e todos os veículos vinculados' },
  fiado: { title: 'Pagar Depois', subtitle: 'Controle de clientes com pagamento a prazo' },
  estoque: { title: 'Estoque de Peças', subtitle: 'Peças em almoxarifado e alertas de reposição' },
  financeiro: { title: 'Financeiro', subtitle: 'Receitas, despesas e fluxo de caixa' },
  relatorios: { title: 'Relatórios', subtitle: 'Indicadores de desempenho e faturamento' },
  configuracoes: { title: 'Configurações', subtitle: 'Dados cadastrais da oficina, NFS-e e preferências' },
}

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    setMobileMenuOpen,
    openNewOrderModal,
    orders,
    stock,
    clients,
    vehicles,
    deferredPayments,
    setSelectedClientId,
    setSelectedOrderForModal,
    formatCurrency,
    currentUserRole,
    logout,
  } = useApp()

  const [showNotifications, setShowNotifications] = useState(false)
  const [globalQuery, setGlobalQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const todayISO = new Date().toISOString().slice(0, 10)
  const lowStockCount = stock.filter(s => s.status === 'Baixo').length
  const activeOrdersCount = orders.filter(o => o.status === 'andamento').length
  const overdueAccounts = deferredPayments.filter(
    d => d.totalAmount - d.paidAmount > 0.01 && d.dueDate < todayISO
  )

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase()
    if (q.length < 2) return null

    const matchedClients = clients
      .filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.cpfCnpj || '').includes(q))
      .slice(0, 4)

    const matchedVehicles = vehicles
      .filter(
        v =>
          v.plate.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q)
      )
      .slice(0, 4)

    const matchedOrders = orders
      .filter(
        o =>
          o.number.toLowerCase().includes(q) ||
          o.clientName.toLowerCase().includes(q) ||
          o.vehiclePlate.toLowerCase().includes(q) ||
          o.serviceDescription.toLowerCase().includes(q)
      )
      .slice(0, 4)

    const matchedStock = stock
      .filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
      .slice(0, 3)

    const total =
      matchedClients.length + matchedVehicles.length + matchedOrders.length + matchedStock.length

    return { matchedClients, matchedVehicles, matchedOrders, matchedStock, total }
  }, [globalQuery, clients, vehicles, orders, stock])

  const pageMeta = TAB_TITLES[activeTab] || TAB_TITLES.inicio
  const notifCount =
    (lowStockCount > 0 ? 1 : 0) + (overdueAccounts.length > 0 ? 1 : 0) + (activeOrdersCount > 0 ? 1 : 0)

  return (
    <header className="sticky top-0 z-30 flex h-18 min-h-[72px] items-center justify-between gap-4 border-b border-wr-border bg-wr-surface/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 select-none">
      {/* Left: Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-wr-text tracking-tight truncate">
            {pageMeta.title}
          </h1>
          <p className="text-[11px] text-wr-muted truncate hidden sm:block">
            {pageMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Middle: Functional Global Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
        <Search
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wr-muted pointer-events-none"
          strokeWidth={1.75}
        />
        <input
          type="text"
          value={globalQuery}
          onFocus={() => setSearchFocused(true)}
          onChange={e => setGlobalQuery(e.target.value)}
          placeholder="Buscar cliente, placa, OS ou peça..."
          className="wr-input pl-10 pr-8"
        />
        {globalQuery && (
          <button
            onClick={() => setGlobalQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-wr-muted hover:text-wr-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {searchFocused && searchResults && (
          <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-wr-border bg-wr-surface p-3 shadow-elevated z-50 max-h-[420px] overflow-y-auto space-y-3 animate-fadeIn">
            {searchResults.total === 0 ? (
              <p className="py-4 text-center text-xs text-wr-muted">
                Nenhum resultado encontrado para "{globalQuery}".
              </p>
            ) : (
              <>
                {searchResults.matchedClients.length > 0 && (
                  <div className="space-y-1">
                    <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-wr-muted">
                      Clientes
                    </span>
                    {searchResults.matchedClients.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedClientId(c.id)
                          setActiveTab('clientes')
                          setGlobalQuery('')
                          setSearchFocused(false)
                        }}
                        className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs hover:bg-wr-elevated transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="h-3.5 w-3.5 text-wr-orange" />
                          <span className="font-semibold text-wr-text">{c.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-wr-muted">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.matchedVehicles.length > 0 && (
                  <div className="space-y-1">
                    <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-wr-muted">
                      Veículos (abre no cadastro do cliente)
                    </span>
                    {searchResults.matchedVehicles.map(v => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedClientId(v.clientId)
                          setActiveTab('clientes')
                          setGlobalQuery('')
                          setSearchFocused(false)
                        }}
                        className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs hover:bg-wr-elevated transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Car className="h-3.5 w-3.5 text-wr-gold" />
                          <span className="font-semibold text-wr-text">
                            {v.brand} {v.model}
                          </span>
                        </div>
                        <span className="rounded bg-wr-elevated border border-wr-border px-1.5 py-0.5 text-[10px] font-mono font-bold text-wr-orange">
                          {v.plate}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.matchedOrders.length > 0 && (
                  <div className="space-y-1">
                    <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-wr-muted">
                      Ordens de Serviço
                    </span>
                    {searchResults.matchedOrders.map(o => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSelectedOrderForModal(o)
                          setActiveTab('os')
                          setGlobalQuery('')
                          setSearchFocused(false)
                        }}
                        className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs hover:bg-wr-elevated transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ClipboardList className="h-3.5 w-3.5 text-wr-orange shrink-0" />
                          <span className="font-semibold text-wr-text truncate">
                            {o.number} • {o.clientName}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-emerald-500">
                          {formatCurrency(o.totalAmount)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.matchedStock.length > 0 && (
                  <div className="space-y-1">
                    <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-wr-muted">
                      Estoque
                    </span>
                    {searchResults.matchedStock.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveTab('estoque')
                          setGlobalQuery('')
                          setSearchFocused(false)
                        }}
                        className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs hover:bg-wr-elevated transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="h-3.5 w-3.5 text-wr-muted" />
                          <span className="font-semibold text-wr-text">{s.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-wr-muted">
                          {s.quantity} un.
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions, Theme Toggle & Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Nova OS (funciona de qualquer aba!) */}
        <button
          onClick={() => openNewOrderModal()}
          className="wr-btn-primary px-3.5 py-2"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Nova OS</span>
        </button>

        {/* Theme Switcher (Modo Claro / Escuro) */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 rounded-xl border border-wr-border bg-wr-elevated px-3 py-2 text-xs font-semibold text-wr-text hover:border-wr-orange/60 transition-colors"
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          aria-label="Alternar tema claro e escuro"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" strokeWidth={2} />
              <span className="hidden xl:inline">Claro</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-slate-700" strokeWidth={2} />
              <span className="hidden xl:inline">Escuro</span>
            </>
          )}
        </button>

        {/* Operator Badge */}
        {currentUserRole && (
          <div className="flex items-center gap-1.5 rounded-xl border border-wr-border bg-wr-elevated px-2.5 py-1.5 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                currentUserRole === 'dono' ? 'bg-wr-orange animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="font-bold text-wr-text uppercase tracking-wider text-[11px]">
              {currentUserRole === 'dono' ? 'Dono' : 'Caixa'}
            </span>
            <button
              onClick={logout}
              title="Trocar Operador / Bloquear"
              className="ml-1 text-wr-muted hover:text-rose-500 transition-colors p-0.5"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative rounded-xl border border-wr-border bg-wr-elevated p-2 text-wr-muted hover:text-wr-text hover:border-wr-borderHover transition-colors"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4 text-wr-orange" strokeWidth={1.85} />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-wr-orange text-[9px] font-bold text-white dark:text-[#0B0C10]">
                {notifCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-wr-border bg-wr-surface p-4 shadow-elevated z-50 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-wr-border pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-wr-orange">
                  Alertas da Oficina
                </span>
                <span className="text-[11px] text-wr-muted">Agora</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                {overdueAccounts.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveTab('fiado')
                      setShowNotifications(false)
                    }}
                    className="w-full text-left flex items-start gap-2.5 rounded-xl bg-rose-500/10 p-3 border border-rose-500/25 hover:border-rose-500/50 transition-colors"
                  >
                    <Wallet className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-500">
                        {overdueAccounts.length} conta(s) a prazo em atraso
                      </p>
                      <p className="text-wr-muted text-[11px] mt-0.5">
                        Clique para ver na aba Pagar Depois e enviar lembrete.
                      </p>
                    </div>
                  </button>
                )}

                {lowStockCount > 0 && (
                  <button
                    onClick={() => {
                      setActiveTab('estoque')
                      setShowNotifications(false)
                    }}
                    className="w-full text-left flex items-start gap-2.5 rounded-xl bg-wr-elevated p-3 border border-wr-border hover:border-wr-orange/40 transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4 text-wr-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-wr-text">Estoque Baixo</p>
                      <p className="text-wr-muted text-[11px] mt-0.5">
                        {lowStockCount} peça(s) abaixo da quantidade mínima.
                      </p>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveTab('os')
                    setShowNotifications(false)
                  }}
                  className="w-full text-left flex items-start gap-2.5 rounded-xl bg-wr-elevated p-3 border border-wr-border hover:border-emerald-500/40 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-wr-text">
                      {activeOrdersCount} Ordem(ns) em Andamento
                    </p>
                    <p className="text-wr-muted text-[11px] mt-0.5">
                      Veículos em execução na oficina no momento.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
