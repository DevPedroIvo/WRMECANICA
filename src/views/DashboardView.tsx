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
  ArrowRight,
  Plus,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp,
  Package,
  Bell,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react'

export const DashboardView: React.FC = () => {
  const {
    orders,
    clients,
    vehicles,
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

  const metrics = useMemo(() => {
    const inProgress = orders.filter(
      o => o.status === 'andamento' || o.status === 'aguardando' || o.status === 'pronto'
    ).length
    const completed = orders.filter(o => o.status === 'pago').length
    const paidRevenue = financial
      .filter(f => f.type === 'receita' && f.status === 'pago')
      .reduce((sum, f) => sum + f.amount, 0)
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
      completed,
      paidRevenue,
      deferredOpen,
      deferredOverdueCount,
      lowStock,
      pendingReminders,
    }
  }, [orders, financial, deferredPayments, stock, reminders, todayISO])

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
    <div className="space-y-6 select-none animate-fadeIn">
      {/* 🌟 HERO BANNER PREMIUM: Design Automotivo de Alto Impacto */}
      <div className="relative rounded-3xl border border-wr-border bg-gradient-to-br from-wr-surface via-wr-elevated/90 to-wr-surface p-6 sm:p-7 shadow-elevated overflow-hidden">
        {/* Glow de fundo automotivo */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-wr-orange/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-wr-gold/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Logo Oficial + Dados da Oficina */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-5 text-center sm:text-left">
            <div className="p-3 rounded-2xl bg-wr-surface/90 border border-wr-border shadow-md backdrop-blur-sm shrink-0">
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

          {/* Botões Rápidos de Ação */}
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

      {/* 📊 4 CARDS DE MÉTRICAS (KPIs) COM VISUAL MODERNO & REFINADO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ordens em Andamento */}
        <button
          type="button"
          onClick={() => setActiveTab('os')}
          className="group relative rounded-3xl border border-wr-border bg-wr-surface p-5 text-left transition-all duration-200 hover:border-wr-orange hover:shadow-card flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-wr-muted">
              OS em Andamento
            </span>
            <div className="h-11 w-11 rounded-2xl bg-wr-orange/15 text-wr-orange flex items-center justify-center transition-transform group-hover:scale-110">
              <Wrench className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 flex items-baseline justify-between w-full">
            <span className="text-4xl font-extrabold font-mono tracking-tight text-wr-text">
              {metrics.inProgress}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.completed} finalizadas
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-wr-border/60 flex items-center justify-between text-[11px] text-wr-muted">
            <span>Acompanhar oficina</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-wr-orange transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </button>

        {/* Card 2: Pagar Depois (Fiado a Receber) */}
        <button
          type="button"
          onClick={() => setActiveTab('fiado')}
          className="group relative rounded-3xl border border-wr-border bg-wr-surface p-5 text-left transition-all duration-200 hover:border-wr-orange hover:shadow-card flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-wr-muted">
              Pagar Depois (A Prazo)
            </span>
            <div className="h-11 w-11 rounded-2xl bg-wr-orange/15 text-wr-orange flex items-center justify-center transition-transform group-hover:scale-110">
              <Wallet className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 flex items-baseline justify-between w-full gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-wr-text truncate">
              {formatCurrency(metrics.deferredOpen)}
            </span>
            {metrics.deferredOverdueCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-500 shrink-0">
                <AlertTriangle className="h-3 w-3" /> {metrics.deferredOverdueCount} atrasado
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-500 shrink-0">
                Em dia
              </span>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-wr-border/60 flex items-center justify-between text-[11px] text-wr-muted">
            <span>Cobranças &amp; Extrato</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-wr-orange transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </button>

        {/* Card 3: Receita em Caixa */}
        <button
          type="button"
          onClick={() => setActiveTab('financeiro')}
          className="group relative rounded-3xl border border-wr-border bg-wr-surface p-5 text-left transition-all duration-200 hover:border-emerald-500 hover:shadow-card flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-wr-muted">
              Receita em Caixa
            </span>
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 flex items-baseline justify-between w-full">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
              {formatCurrency(metrics.paidRevenue)}
            </span>
            <span className="text-xs font-semibold text-wr-muted">Líquido</span>
          </div>

          <div className="mt-3 pt-3 border-t border-wr-border/60 flex items-center justify-between text-[11px] text-wr-muted">
            <span>Ver fluxo financeiro</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </button>

        {/* Card 4: Clientes & Veículos Vinculados */}
        <button
          type="button"
          onClick={() => setActiveTab('clientes')}
          className="group relative rounded-3xl border border-wr-border bg-wr-surface p-5 text-left transition-all duration-200 hover:border-wr-orange hover:shadow-card flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-wr-muted">
              Clientes &amp; Frotas
            </span>
            <div className="h-11 w-11 rounded-2xl bg-wr-orange/15 text-wr-orange flex items-center justify-center transition-transform group-hover:scale-110">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 flex items-baseline justify-between w-full">
            <span className="text-4xl font-extrabold font-mono tracking-tight text-wr-text">
              {clients.length}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-wr-muted">
              <Car className="h-3.5 w-3.5 text-wr-orange" /> {vehicles.length} veículos
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-wr-border/60 flex items-center justify-between text-[11px] text-wr-muted">
            <span>Gerenciar cadastros</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-wr-orange transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </button>
      </div>

      {/* 📈 SEÇÃO PRINCIPAL: Gráfico Semanal + Agenda de Atendimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Gráfico Semanal Dinâmico (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-wr-border bg-wr-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-wr-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-wr-orange/15 text-wr-orange border border-wr-orange/20">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-wr-text flex items-center gap-2">
                    Movimentação Semanal da Oficina
                  </h3>
                  <p className="text-[11px] text-wr-muted">
                    Volume de serviços e manutenções distribuídos pelos dias da semana
                  </p>
                </div>
              </div>

              {/* Tag com dia selecionado */}
              <div className="flex items-center gap-2 rounded-2xl bg-wr-elevated px-3.5 py-1.5 border border-wr-border text-xs">
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
            </div>

            {totalWeeklyServices === 0 ? (
              <div className="mt-8 h-60 w-full flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-wr-border bg-wr-elevated/40 space-y-3">
                <div className="p-3 rounded-2xl bg-wr-surface border border-wr-border text-wr-muted">
                  <BarChart3 className="h-8 w-8 opacity-60" />
                </div>
                <div>
                  <p className="text-sm font-bold text-wr-text">Nenhum serviço registrado nesta semana</p>
                  <p className="text-xs text-wr-muted max-w-md mt-1">
                    O sistema calcula a movimentação automaticamente em tempo real a partir das ordens de serviço cadastradas.
                  </p>
                </div>
                <button
                  onClick={() => openNewOrderModal()}
                  className="wr-btn-primary px-4 py-2 text-xs font-bold"
                >
                  <Plus className="h-3.5 w-3.5" /> Abrir Primeira OS
                </button>
              </div>
            ) : (
              <div className="mt-8 h-60 w-full flex items-end justify-between gap-3 px-2">
                {dailyServiceData.map((d, idx) => {
                  const isSelected = selectedDayIdx === idx
                  const barHeightPercent = Math.max(16, Math.round((d.services / maxVal) * 100))

                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => setSelectedDayIdx(idx)}
                      className="flex-1 flex flex-col items-center h-full justify-end group transition-transform focus:outline-none"
                    >
                      {/* Valor no topo da barra */}
                      <span
                        className={`mb-2 text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-wr-orange text-white dark:text-[#0B0C10] border-wr-orange shadow-sm scale-105'
                            : 'bg-wr-elevated text-wr-muted border-wr-border group-hover:text-wr-text group-hover:border-wr-borderHover'
                        }`}
                      >
                        {d.services}
                      </span>

                      {/* Barra Estilizada */}
                      <div className="w-full max-w-[48px] h-40 bg-wr-elevated rounded-2xl flex items-end p-1 border border-wr-border/80 group-hover:border-wr-orange/40 transition-colors">
                        <div
                          style={{ height: `${barHeightPercent}%` }}
                          className={`w-full rounded-xl transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-t from-wr-orangeDark to-wr-orange shadow-md'
                              : 'bg-wr-borderHover/70 group-hover:bg-wr-orange/60'
                          }`}
                        />
                      </div>

                      {/* Nome do Dia */}
                      <span
                        className={`mt-2 text-xs font-semibold flex items-center gap-1 ${
                          isSelected
                            ? 'text-wr-orange font-bold'
                            : 'text-wr-muted group-hover:text-wr-text'
                        }`}
                      >
                        {d.day}
                        {d.isToday && (
                          <span className="h-1.5 w-1.5 rounded-full bg-wr-orange" title="Hoje" />
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-wr-border flex flex-wrap items-center justify-between gap-3 text-xs text-wr-muted">
            <span className="font-medium">
              Média semanal: <strong className="text-wr-text font-mono font-bold">{otherDaysAvg} serviços/dia</strong>
            </span>
            <button
              onClick={() => openNewOrderModal()}
              className="inline-flex items-center gap-1.5 font-bold text-wr-orange hover:underline text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Abrir Nova OS
            </button>
          </div>
        </div>

        {/* Agenda do Dia & Agendamentos (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-wr-border bg-wr-surface p-6 shadow-card flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-wr-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-wr-orange/15 text-wr-orange">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-wr-text">Agenda do Dia</h3>
                  <p className="text-[11px] text-wr-muted">Atendimentos programados nos boxes</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-wr-orange bg-wr-orange/10 px-2 py-0.5 rounded-lg border border-wr-orange/20">
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
                    className="rounded-2xl border border-wr-border bg-wr-elevated p-3.5 flex items-center justify-between gap-3 hover:border-wr-borderHover transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-extrabold text-wr-orange bg-wr-surface px-2.5 py-1.5 rounded-xl border border-wr-border shrink-0">
                        {apt.time}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-wr-text truncate">{apt.clientName}</p>
                        <p className="text-[11px] text-wr-muted truncate flex items-center gap-1 mt-0.5">
                          <Car className="h-3 w-3 text-wr-orange shrink-0" />
                          {apt.vehicleModel} &bull; <span className="font-mono">{apt.vehiclePlate}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        sendWhatsApp(
                          apt.clientPhone,
                          `Olá ${apt.clientName}! Confirmamos seu atendimento às ${apt.time} na WR Mecânica & Cia.`
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
            onClick={() => setActiveTab('atendimentos')}
            className="wr-btn-secondary w-full justify-between py-2.5 text-xs font-bold"
          >
            <span>Ver Agenda Completa</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 🚗 ORDENS DE SERVIÇO RECENTES & STATUS OPERACIONAL */}
      <div className="rounded-3xl border border-wr-border bg-wr-surface p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-wr-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-wr-text">Ordens de Serviço Recentes</h3>
              <p className="text-[11px] text-wr-muted">Últimos veículos atendidos na oficina</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('os')}
            className="text-xs font-bold text-wr-orange hover:underline flex items-center gap-1"
          >
            Ver todas as ordens <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-wr-border bg-wr-elevated/40 p-10 text-center text-xs text-wr-muted space-y-3">
            <Wrench className="h-8 w-8 mx-auto text-wr-muted opacity-50" />
            <p className="font-semibold text-wr-text">Nenhuma ordem de serviço cadastrada</p>
            <p className="text-[11px] max-w-sm mx-auto">
              Abra uma nova ordem para lançar peças, mão de obra e comprovante para o cliente.
            </p>
            <button onClick={() => openNewOrderModal()} className="wr-btn-primary mx-auto">
              <Plus className="h-4 w-4" /> Abrir Primeira OS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {orders.slice(0, 4).map(order => {
              const statusColor =
                order.status === 'pago'
                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                  : order.status === 'pronto'
                  ? 'bg-blue-500/15 text-blue-500 border-blue-500/30'
                  : order.status === 'andamento'
                  ? 'bg-wr-orange/15 text-wr-orange border-wr-orange/30'
                  : 'bg-wr-orange/15 text-wr-orange border-wr-orange/30'

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setActiveTab('os')}
                  className="rounded-2xl border border-wr-border bg-wr-elevated p-4 text-left flex flex-col justify-between gap-3 hover:border-wr-orange/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-wr-orange">
                      {order.number}
                    </span>
                    <span className="text-[10px] font-mono text-wr-muted">{order.date}</span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-wr-text truncate group-hover:text-wr-orange transition-colors">
                      {order.clientName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-wr-muted truncate mt-0.5">
                      <span className="font-semibold">{order.vehicleModel}</span>
                      <span className="rounded bg-wr-surface border border-wr-border px-1 py-0.2 font-mono text-[10px] font-bold text-wr-text">
                        {order.vehiclePlate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-wr-border text-xs">
                    <span
                      className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${statusColor}`}
                    >
                      {order.status}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
