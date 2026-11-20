import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { WrLogo } from '../components/WrLogo'
import {
  Car,
  CheckCircle2,
  DollarSign,
  Users,
  Wallet,
  MessageCircle,
  Clock,
  Wrench,
  BarChart3,
  AlertTriangle,
  Plus,
  MapPin,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ChevronRight,
  Flame,
  Calendar,
} from 'lucide-react'

export const DashboardView: React.FC = () => {
  const {
    orders,
    appointments,
    financial,
    deferredPayments,
    stock,
    activeShift,
    reminders,
    formatCurrency,
    setActiveTab,
    sendWhatsApp,
    openNewOrderModal,
    setSelectedOrderForModal,
  } = useApp()

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() => {
    const day = new Date().getDay()
    // Map Sunday (0) to 6, Mon-Sat (1-6) to 0-5
    return day === 0 ? 6 : day - 1
  })

  const todayISO = new Date().toISOString().slice(0, 10)

  // Data formatada elegante para o cabeçalho
  const formattedToday = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [])

  // Métricas financeiras e operacionais consolidadas
  const metrics = useMemo(() => {
    const inProgress = orders.filter(
      o => o.status === 'andamento' || o.status === 'aguardando' || o.status === 'pronto'
    ).length
    const openOrders = orders.filter(o => o.status === 'aguardando').length
    const executingOrders = orders.filter(o => o.status === 'andamento').length
    const readyOrders = orders.filter(o => o.status === 'pronto').length
    const completed = orders.filter(o => o.status === 'pago').length

    const paidRevenue = financial
      .filter(f => f.type === 'receita' && f.status === 'pago')
      .reduce((sum, f) => sum + f.amount, 0)
    const paidExpenses = financial
      .filter(f => f.type === 'despesa' && f.status === 'pago')
      .reduce((sum, f) => sum + f.amount, 0)
    const netBalance = paidRevenue - paidExpenses

    const deferredOpen = deferredPayments.reduce(
      (sum, d) => sum + Math.max(0, d.totalAmount - d.paidAmount),
      0
    )
    const deferredOverdueCount = deferredPayments.filter(
      d => d.totalAmount - d.paidAmount > 0.01 && d.dueDate < todayISO
    ).length
    const lowStock = stock.filter(s => s.status === 'Baixo').length
    const pendingReminders = reminders.filter(r => !r.done).length

    return {
      inProgress,
      openOrders,
      executingOrders,
      readyOrders,
      completed,
      paidRevenue,
      paidExpenses,
      netBalance,
      deferredOpen,
      deferredOverdueCount,
      lowStock,
      pendingReminders,
    }
  }, [orders, financial, deferredPayments, stock, reminders, todayISO])

  // Ranking dos serviços mais realizados
  const topServices = useMemo(() => {
    const counts: Record<string, { count: number; totalValue: number }> = {}
    orders.forEach(o => {
      if (o.items && o.items.length > 0) {
        o.items.forEach(it => {
          const name = it.serviceDescription.trim()
          if (name) {
            if (!counts[name]) counts[name] = { count: 0, totalValue: 0 }
            counts[name].count += 1
            counts[name].totalValue += (it.laborCost || 0) + (it.partsCost || 0)
          }
        })
      } else if (o.serviceDescription) {
        const name = o.serviceDescription.trim()
        if (!counts[name]) counts[name] = { count: 0, totalValue: 0 }
        counts[name].count += 1
        counts[name].totalValue += o.totalAmount || 0
      }
    })
    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [orders])

  // Veículos atualmente no pátio / em manutenção
  const vehiclesInShop = useMemo(() => {
    return orders
      .filter(o => o.status === 'andamento' || o.status === 'aguardando' || o.status === 'pronto')
      .slice(0, 4)
  }, [orders])

  // Movimentação semanal real calculada das ordens
  const dailyServiceData = useMemo(() => {
    const daysConfig = [
      { day: 'Seg', name: 'Segunda-feira', dayOfWeek: 1 },
      { day: 'Ter', name: 'Terça-feira', dayOfWeek: 2 },
      { day: 'Qua', name: 'Quarta-feira', dayOfWeek: 3 },
      { day: 'Qui', name: 'Quinta-feira', dayOfWeek: 4 },
      { day: 'Sex', name: 'Sexta-feira', dayOfWeek: 5 },
      { day: 'Sáb', name: 'Sábado', dayOfWeek: 6 },
      { day: 'Dom', name: 'Domingo', dayOfWeek: 0 },
    ]

    const todayDayOfWeek = new Date().getDay()

    return daysConfig.map(dc => {
      const count = orders.filter(o => {
        if (!o.date) return false
        const parts = o.date.split('/')
        if (parts.length === 3) {
          const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
          return d.getDay() === dc.dayOfWeek
        }
        return false
      }).length

      return {
        day: dc.day,
        name: dc.name,
        services: count,
        isToday: dc.dayOfWeek === todayDayOfWeek,
      }
    })
  }, [orders])

  const totalWeeklyServices = dailyServiceData.reduce((acc, d) => acc + d.services, 0)
  const maxVal = Math.max(1, ...dailyServiceData.map(d => d.services))
  const selectedDay = dailyServiceData[selectedDayIdx] || dailyServiceData[0]

  const peakDay = useMemo(() => {
    return dailyServiceData.reduce(
      (max, d) => (d.services > max.services ? d : max),
      dailyServiceData[0] || { day: 'Seg', name: 'Segunda-feira', services: 0 }
    )
  }, [dailyServiceData])

  const otherDaysAvg =
    dailyServiceData.length > 1
      ? Math.round(
          dailyServiceData
            .filter((_, idx) => idx !== selectedDayIdx)
            .reduce((acc, d) => acc + d.services, 0) /
            (dailyServiceData.length - 1)
        )
      : 0

  const diffPercent =
    otherDaysAvg > 0
      ? Math.round(((selectedDay.services - otherDaysAvg) / otherDaysAvg) * 100)
      : selectedDay.services > 0
      ? 100
      : 0

  return (
    <div className="space-y-6 select-none animate-fadeIn pb-14">
      {/* 🌟 1. HERO BANNER PRINCIPAL */}
      <div className="relative rounded-3xl border border-wr-border bg-gradient-to-br from-wr-surface via-wr-elevated/80 to-wr-surface p-6 sm:p-7 shadow-card overflow-hidden">
        {/* Glow de fundo automotivo */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-wr-orange/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-wr-orangeDark/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Logo Oficial + Dados da Oficina */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-5 text-center sm:text-left">
            <div className="p-3.5 rounded-2xl bg-wr-surface/90 border border-wr-border shadow-sm backdrop-blur-sm shrink-0">
              <WrLogo size="lg" showSubtitle={true} />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Oficina Operando
                </span>
                <span className="capitalize text-xs font-medium text-wr-muted font-sans">
                  {formattedToday}
                </span>
              </div>
              <p className="text-xs text-wr-muted flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <MapPin className="h-3.5 w-3.5 text-wr-orange shrink-0" />
                Rodovia TO-080, KM 12 &bull; Luzimangues / Porto Nacional - TO
              </p>
            </div>
          </div>

          {/* Botões Principais de Ação */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('caixa')}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                activeShift
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-wr-border bg-wr-surface text-wr-muted hover:text-wr-text hover:border-wr-borderHover'
              }`}
            >
              <Wallet className="h-4 w-4" />
              <span>{activeShift ? 'Caixa Aberto' : 'Abrir Caixa'}</span>
            </button>

            <button
              type="button"
              onClick={() => openNewOrderModal()}
              className="wr-btn-primary px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-wr-orange/20"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Nova Ordem de Serviço</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📊 2. CARDS EXECUTIVOS DE MÉTRICAS (KPIs) FINANCEIRAS & OPERACIONAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Faturamento Pago */}
        <button
          type="button"
          onClick={() => setActiveTab('financeiro')}
          className="group relative rounded-3xl border border-wr-border bg-wr-surface p-5 text-left transition-all duration-200 hover:border-emerald-500/60 hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-wr-muted">
              Faturamento Pago
            </span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex flex-col w-full">
            <span className="text-2xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(metrics.paidRevenue)}
            </span>
            <span className="text-[11px] font-semibold text-wr-muted mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              {metrics.completed} ordens liquidadas
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-wr-border/70 flex items-center justify-between text-[11px] text-wr-muted font-medium">
            <span>Fluxo de receitas</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </button>

        {/* Card 2: Despesas Pagas */}
        <button
          type="button"
          onClick={() => setActiveTab('financeiro')}
          className="group relative rounded-3xl border border-wr-border bg-wr-surface p-5 text-left transition-all duration-200 hover:border-rose-500/60 hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-wr-muted">
              Despesas Pagas
            </span>
            <div className="h-10 w-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex flex-col w-full">
            <span className="text-2xl font-black font-mono tracking-tight text-rose-500">
              {formatCurrency(metrics.paidExpenses)}
            </span>
            <span className="text-[11px] font-semibold text-wr-muted mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
              Custos &amp; fornecedores
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-wr-border/70 flex items-center justify-between text-[11px] text-wr-muted font-medium">
            <span>Ver despesas</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-rose-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </button>

        {/* Card 3: Saldo Líquido */}
        <button
          type="button"
          onClick={() => setActiveTab('financeiro')}
          className="group relative rounded-3xl border border-wr-border bg-wr-surface p-5 text-left transition-all duration-200 hover:border-wr-orange/60 hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-wr-muted">
              Saldo Líquido
            </span>
            <div className="h-10 w-10 rounded-2xl bg-wr-orange/15 text-wr-orange flex items-center justify-center transition-transform group-hover:scale-110">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex flex-col w-full">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                metrics.netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {formatCurrency(metrics.netBalance)}
            </span>
            <span className="text-[11px] font-semibold text-wr-muted mt-1 flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full inline-block ${
                  metrics.netBalance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              Margem operacional líquida
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-wr-border/70 flex items-center justify-between text-[11px] text-wr-muted font-medium">
            <span>DRE da oficina</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-wr-orange transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </button>

        {/* Card 4: OS em Execução */}
        <button
          type="button"
          onClick={() => setActiveTab('os')}
          className="group relative rounded-3xl border border-wr-border bg-wr-surface p-5 text-left transition-all duration-200 hover:border-wr-orange/60 hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-wr-muted">
              OS em Execução
            </span>
            <div className="h-10 w-10 rounded-2xl bg-wr-orange/15 text-wr-orange flex items-center justify-center transition-transform group-hover:scale-110">
              <Wrench className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between w-full">
            <span className="text-3xl font-black font-mono tracking-tight text-wr-text">
              {metrics.inProgress}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-wr-orange/15 px-2.5 py-0.5 text-xs font-bold text-wr-orange border border-wr-orange/30">
              {metrics.readyOrders} prontos
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-wr-border/70 flex items-center justify-between text-[11px] text-wr-muted font-medium">
            <span>Painel da Oficina</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-wr-orange transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </button>

        {/* Card 5: Pagar Depois (Fiado a Receber) */}
        <button
          type="button"
          onClick={() => setActiveTab('fiado')}
          className="group relative rounded-3xl border border-wr-border bg-wr-surface p-5 text-left transition-all duration-200 hover:border-wr-orange/60 hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-wr-muted">
              Pagar Depois (A Prazo)
            </span>
            <div className="h-10 w-10 rounded-2xl bg-wr-orange/15 text-wr-orange flex items-center justify-center transition-transform group-hover:scale-110">
              <Wallet className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex flex-col w-full">
            <span className="text-2xl font-black font-mono tracking-tight text-wr-text">
              {formatCurrency(metrics.deferredOpen)}
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              {metrics.deferredOverdueCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                  <AlertTriangle className="h-3 w-3" /> {metrics.deferredOverdueCount} atrasado(s)
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                  Todas parcelas em dia
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-wr-border/70 flex items-center justify-between text-[11px] text-wr-muted font-medium">
            <span>Cobranças &amp; Extrato</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-wr-orange transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </button>
      </div>

      {/* 🛠️ 3. SEÇÃO INTERMEDIÁRIA 1: Veículos em Manutenção no Pátio + Agenda do Dia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Veículos em Manutenção no Pátio (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-wr-border bg-wr-surface p-6 sm:p-7 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-wr-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-wr-orange/15 text-wr-orange">
                  <Car className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-wr-text">Veículos em Manutenção no Pátio</h3>
                  <p className="text-[11px] text-wr-muted">Ordens ativas atualmente em execução ou diagnóstico</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('os')}
                className="text-xs font-bold text-wr-orange hover:underline flex items-center gap-1"
              >
                Ver todas <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {vehiclesInShop.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-wr-border bg-wr-elevated/40 p-8 text-center text-xs text-wr-muted space-y-2">
                <Car className="h-8 w-8 mx-auto text-wr-muted opacity-50" />
                <p className="font-semibold text-wr-text">Nenhum veículo em manutenção no momento</p>
                <p className="text-[11px] max-w-sm mx-auto">
                  Todos os veículos em atendimento foram concluídos ou entregues aos clientes.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {vehiclesInShop.map(o => {
                  const statusLabel =
                    o.status === 'pronto'
                      ? 'Pronto para Retirada'
                      : o.status === 'andamento'
                      ? 'Em Manutenção'
                      : 'Aguardando Início'

                  const statusColor =
                    o.status === 'pronto'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      : o.status === 'andamento'
                      ? 'bg-wr-orange/15 text-wr-orange border-wr-orange/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'

                  return (
                    <div
                      key={o.id}
                      className="rounded-2xl border border-wr-border bg-wr-elevated p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-wr-orange/40 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Placa Mercosul Autêntica */}
                        <div className="inline-flex flex-col border border-neutral-700/40 rounded-lg bg-white overflow-hidden shadow-2xs shrink-0 select-none">
                          <div className="bg-[#003399] text-white text-[7px] font-black tracking-widest px-2 py-0.2 text-center uppercase leading-tight">
                            BRASIL
                          </div>
                          <div className="px-2 py-0.5 text-center font-mono font-black text-xs text-neutral-900 tracking-wider leading-none">
                            {o.vehiclePlate}
                          </div>
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-xs sm:text-sm font-bold text-wr-text truncate group-hover:text-wr-orange transition-colors">
                              {o.vehicleModel}
                            </p>
                            <span className="font-mono text-[10px] text-wr-muted font-bold">
                              #{o.number}
                            </span>
                          </div>
                          <p className="text-[11px] text-wr-muted truncate flex items-center gap-2">
                            <span>Cliente: <strong className="text-wr-text">{o.clientName}</strong></span>
                            <span>&bull;</span>
                            <span className="text-wr-orange font-medium">Mecânico: {o.mechanicAssigned || 'Geral'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-wr-border shrink-0">
                        <div className="text-left sm:text-right">
                          <span className={`inline-block text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border mb-0.5 ${statusColor}`}>
                            {statusLabel}
                          </span>
                          <span className="text-xs sm:text-sm font-mono font-black text-wr-text block">
                            {formatCurrency(o.totalAmount)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForModal(o)
                            setActiveTab('os')
                          }}
                          className="px-3 py-1.5 rounded-xl bg-wr-surface border border-wr-border hover:border-wr-orange text-xs font-bold text-wr-orange transition-colors shrink-0 shadow-2xs"
                        >
                          Abrir OS
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-wr-border flex items-center justify-between text-xs text-wr-muted">
            <span>Pátio com capacidade para múltiplos boxes simultâneos</span>
            <button
              type="button"
              onClick={() => setActiveTab('os')}
              className="text-wr-orange font-bold hover:underline"
            >
              Abrir Quadro da Oficina
            </button>
          </div>
        </div>

        {/* Agenda do Dia & Boxes (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-wr-border bg-wr-surface p-6 sm:p-7 shadow-card flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-wr-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-wr-orange/15 text-wr-orange">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-wr-text">Agenda do Dia</h3>
                  <p className="text-[11px] text-wr-muted">Atendimentos programados nos boxes</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-wr-orange bg-wr-orange/10 px-2.5 py-1 rounded-lg border border-wr-orange/20">
                {appointments.length}
              </span>
            </div>

            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-wr-border bg-wr-elevated/40 p-6 text-center space-y-2">
                  <Clock className="h-6 w-6 text-wr-muted mx-auto opacity-60" />
                  <p className="text-xs font-semibold text-wr-text">Nenhum agendamento para hoje</p>
                  <p className="text-[11px] text-wr-muted">
                    Marque revisões e atendimentos prévios pela aba de Agendamentos.
                  </p>
                </div>
              ) : (
                appointments.slice(0, 4).map(apt => (
                  <div
                    key={apt.id}
                    className="rounded-2xl border border-wr-border bg-wr-elevated p-3.5 flex items-center justify-between gap-3 hover:border-wr-orange/40 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-black text-wr-orange bg-wr-surface px-2.5 py-1.5 rounded-xl border border-wr-border shrink-0 shadow-2xs">
                        {apt.time}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-wr-text truncate">{apt.clientName}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-wr-muted truncate mt-0.5">
                          <span className="truncate">{apt.vehicleModel}</span>
                          <span className="inline-flex flex-col border border-neutral-700/40 rounded bg-white overflow-hidden shadow-2xs shrink-0 select-none">
                            <span className="bg-[#003399] text-white text-[6px] font-black px-1 text-center uppercase leading-tight">
                              BRASIL
                            </span>
                            <span className="px-1 py-0.2 text-center font-mono font-black text-[9px] text-neutral-900 tracking-wider leading-none">
                              {apt.vehiclePlate}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        sendWhatsApp(
                          apt.clientPhone,
                          `Olá ${apt.clientName}! Confirmamos o seu atendimento agendado para às ${apt.time} na WR Mecânica & Cia referente ao ${apt.vehicleModel}.`
                        )
                      }
                      className="rounded-xl p-2 text-emerald-500 hover:bg-emerald-500/15 border border-emerald-500/25 shrink-0 transition-colors"
                      title="Enviar confirmação no WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('atendimentos')}
            className="wr-btn-secondary w-full justify-between py-2.5 text-xs font-bold"
          >
            <span>Ver Agenda Completa</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 🚗 4. SEÇÃO INTERMEDIÁRIA 2: Ordens de Serviço Recentes + Serviços Mais Realizados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Ordens de Serviço Recentes (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-wr-border bg-wr-surface p-6 sm:p-7 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-wr-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-wr-text">Ordens de Serviço Recentes</h3>
                  <p className="text-[11px] text-wr-muted">Últimos veículos e ordens cadastradas no sistema</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('os')}
                className="text-xs font-bold text-wr-orange hover:underline flex items-center gap-1"
              >
                Ver todas as ordens <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-wr-border bg-wr-elevated/40 p-10 text-center text-xs text-wr-muted space-y-3">
                <Wrench className="h-8 w-8 mx-auto text-wr-muted opacity-50" />
                <p className="font-semibold text-wr-text">Nenhuma ordem de serviço cadastrada</p>
                <p className="text-[11px] max-w-sm mx-auto">
                  Abra uma nova ordem para lançar peças, mão de obra e emitir notas para os clientes.
                </p>
                <button
                  type="button"
                  onClick={() => openNewOrderModal()}
                  className="wr-btn-primary mx-auto"
                >
                  <Plus className="h-4 w-4" /> Abrir Primeira OS
                </button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {orders.slice(0, 4).map(order => {
                  const statusColor =
                    order.status === 'pago'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : order.status === 'pronto'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      : order.status === 'andamento'
                      ? 'bg-wr-orange/15 text-wr-orange border-wr-orange/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'

                  const statusText =
                    order.status === 'pago'
                      ? 'Quitada'
                      : order.status === 'pronto'
                      ? 'Pronta'
                      : order.status === 'andamento'
                      ? 'Em Andamento'
                      : 'Aguardando'

                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        setSelectedOrderForModal(order)
                        setActiveTab('os')
                      }}
                      className="rounded-2xl border border-wr-border bg-wr-elevated p-3.5 sm:p-4 text-left flex flex-col justify-between gap-3 hover:border-wr-orange/50 hover:shadow-card hover:-translate-y-0.5 transition-all group"
                    >
                      {/* Cabeçalho do Card */}
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-xs font-black text-wr-orange bg-wr-surface px-2 py-0.5 rounded-lg border border-wr-border">
                          {order.number}
                        </span>
                        <span className="text-[10px] font-mono text-wr-muted font-medium">
                          {order.date}
                        </span>
                      </div>

                      {/* Informações do Veículo com Placa Mercosul */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="inline-flex flex-col border border-neutral-700/40 rounded bg-white overflow-hidden shadow-2xs shrink-0 select-none">
                            <div className="bg-[#003399] text-white text-[6px] font-black px-1.5 text-center uppercase leading-tight">
                              BRASIL
                            </div>
                            <div className="px-1.5 py-0.2 text-center font-mono font-black text-[10px] text-neutral-900 tracking-wider leading-none">
                              {order.vehiclePlate}
                            </div>
                          </div>
                          <p className="text-xs font-bold text-wr-text truncate group-hover:text-wr-orange transition-colors">
                            {order.vehicleModel}
                          </p>
                        </div>

                        <p className="text-[11px] text-wr-muted truncate">
                          Cliente: <span className="font-semibold text-wr-text">{order.clientName}</span>
                        </p>
                      </div>

                      {/* Rodapé do Card com Status e Valor */}
                      <div className="flex items-center justify-between pt-2 border-t border-wr-border/70 text-xs w-full">
                        <span
                          className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${statusColor}`}
                        >
                          {statusText}
                        </span>
                        <span className="font-mono font-black text-sm text-wr-text group-hover:text-wr-orange transition-colors">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-wr-border flex items-center justify-between text-xs text-wr-muted">
            <span>Ordens com histórico completo e notas emitidas</span>
            <button
              type="button"
              onClick={() => setActiveTab('os')}
              className="text-wr-orange font-bold hover:underline"
            >
              Abrir Todas as OS
            </button>
          </div>
        </div>

        {/* Serviços Mais Realizados (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-wr-border bg-wr-surface p-6 sm:p-7 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-wr-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-wr-orange/15 text-wr-orange">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-wr-text">Serviços Mais Realizados</h3>
                  <p className="text-[11px] text-wr-muted">Ranking de demandas na oficina</p>
                </div>
              </div>
            </div>

            {topServices.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-wr-border bg-wr-elevated/40 p-8 text-center text-xs text-wr-muted">
                Nenhum serviço computado ainda
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {topServices.map((srv, idx) => {
                  const maxCount = topServices[0]?.count || 1
                  const pct = Math.round((srv.count / maxCount) * 100)

                  return (
                    <div key={srv.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-wr-text truncate pr-2 flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-wr-orange w-5 text-center px-1 py-0.5 rounded bg-wr-orange/10 border border-wr-orange/20">
                            #{idx + 1}
                          </span>
                          <span className="truncate">{srv.name}</span>
                        </span>
                        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                          <span className="text-wr-muted font-bold">{srv.count}x</span>
                          <span className="text-emerald-500 font-bold">
                            {formatCurrency(srv.totalValue)}
                          </span>
                        </div>
                      </div>

                      <div className="h-2 w-full bg-wr-elevated rounded-full overflow-hidden border border-wr-border">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-wr-orangeDark to-wr-orange rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-wr-border flex items-center justify-between text-xs text-wr-muted">
            <span>Baseado no histórico de ordens cadastradas</span>
            <button
              type="button"
              onClick={() => setActiveTab('estoque')}
              className="text-wr-orange font-bold hover:underline"
            >
              Predefinições
            </button>
          </div>
        </div>
      </div>

      {/* 📈 5. GRÁFICO EM BARRAS DA OFICINA (LOCALIZADO EM BAIXO, LARGURA TOTAL) */}
      <div className="rounded-3xl border border-wr-border bg-wr-surface p-6 sm:p-8 shadow-card space-y-6">
        {/* Cabeçalho do Gráfico com Indicadores */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wr-border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-wr-orange/15 text-wr-orange border border-wr-orange/20 shrink-0">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-wr-text flex items-center gap-2">
                Movimentação Semanal da Oficina
                <span className="text-xs font-mono font-bold text-wr-orange bg-wr-orange/10 px-2.5 py-0.5 rounded-full border border-wr-orange/20">
                  {totalWeeklyServices} manutenções
                </span>
              </h3>
              <p className="text-xs text-wr-muted">
                Volume de veículos atendidos e serviços executados por dia da semana
              </p>
            </div>
          </div>

          {/* Badges de Destaque no Cabeçalho */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-2xl bg-wr-elevated px-4 py-2 border border-wr-border text-xs">
              <span className="text-wr-muted font-medium">{selectedDay.name}:</span>
              <span className="text-wr-text font-bold font-mono">
                {selectedDay.services} serviço(s)
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  diffPercent >= 0
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 text-rose-500'
                }`}
              >
                {diffPercent >= 0 ? `+${diffPercent}%` : `${diffPercent}%`}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 font-bold">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>Pico: {peakDay.name} ({peakDay.services})</span>
            </div>
          </div>
        </div>

        {/* Área Visual do Gráfico em Barras */}
        {totalWeeklyServices === 0 ? (
          <div className="h-64 w-full flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-wr-border bg-wr-elevated/40 space-y-3">
            <div className="p-3 rounded-2xl bg-wr-surface border border-wr-border text-wr-muted">
              <BarChart3 className="h-8 w-8 opacity-60" />
            </div>
            <div>
              <p className="text-sm font-bold text-wr-text">Nenhum serviço registrado nesta semana</p>
              <p className="text-xs text-wr-muted max-w-md mt-1">
                O sistema calcula as barras automaticamente em tempo real conforme ordens de serviço forem cadastradas na semana.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openNewOrderModal()}
              className="wr-btn-primary px-4 py-2 text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5" /> Abrir Primeira OS
            </button>
          </div>
        ) : (
          <div className="relative pt-6 pb-2">
            {/* Linhas de grade sutis no fundo */}
            <div className="absolute inset-x-0 top-12 bottom-12 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-dashed border-wr-text w-full" />
              <div className="border-b border-dashed border-wr-text w-full" />
              <div className="border-b border-dashed border-wr-text w-full" />
            </div>

            {/* Container das Barras Verticais */}
            <div className="h-72 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6 relative z-10">
              {dailyServiceData.map((d, idx) => {
                const isSelected = selectedDayIdx === idx
                const barHeightPercent = Math.max(14, Math.round((d.services / maxVal) * 100))

                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group transition-all duration-200 focus:outline-none"
                  >
                    {/* Badge do Valor no Topo da Barra */}
                    <span
                      className={`mb-2 text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-wr-orange text-white dark:text-[#0C1017] border-wr-orange shadow-md scale-110'
                          : 'bg-wr-elevated text-wr-muted border-wr-border group-hover:text-wr-text group-hover:border-wr-borderHover group-hover:scale-105'
                      }`}
                    >
                      {d.services}
                    </span>

                    {/* Barra Estilizada com Gradiente e Borda */}
                    <div className="w-full max-w-[68px] sm:max-w-[80px] h-48 bg-wr-elevated rounded-2xl flex items-end p-1.5 border border-wr-border/80 group-hover:border-wr-orange/50 transition-colors shadow-2xs">
                      <div
                        style={{ height: `${barHeightPercent}%` }}
                        className={`w-full rounded-xl transition-all duration-500 ${
                          isSelected
                            ? 'bg-gradient-to-t from-wr-orangeDark via-wr-orange to-wr-orangeLight shadow-lg'
                            : 'bg-wr-borderHover/60 group-hover:bg-gradient-to-t group-hover:from-wr-orangeDark/80 group-hover:to-wr-orange'
                        }`}
                      />
                    </div>

                    {/* Nome do Dia & Indicador Hoje */}
                    <div className="mt-3 text-center">
                      <span
                        className={`text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          isSelected
                            ? 'text-wr-orange'
                            : 'text-wr-muted group-hover:text-wr-text'
                        }`}
                      >
                        <span className="hidden sm:inline">{d.name.split('-')[0]}</span>
                        <span className="sm:hidden">{d.day}</span>
                        {d.isToday && (
                          <span className="h-2 w-2 rounded-full bg-wr-orange animate-pulse" title="Hoje" />
                        )}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Rodapé Consolidado com Estatísticas da Oficina */}
        <div className="pt-5 border-t border-wr-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-wr-muted">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Semanal</span>
              <strong className="text-wr-text font-mono font-bold text-sm">{totalWeeklyServices} serviços</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Média Diária</span>
              <strong className="text-wr-text font-mono font-bold text-sm">{otherDaysAvg} serviços/dia</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Dia de Maior Movimento</span>
              <strong className="text-wr-orange font-bold text-sm">{peakDay.name}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openNewOrderModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-wr-orange text-white dark:text-[#0C1017] font-bold text-xs shadow-xs hover:brightness-110 transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Abrir Nova OS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('relatorios')}
              className="wr-btn-secondary px-3.5 py-2 text-xs font-bold"
            >
              <span>Ver Relatórios</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
