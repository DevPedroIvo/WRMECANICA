import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
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
    formatCurrency,
    setActiveTab,
    sendWhatsApp,
    openNewOrderModal,
  } = useApp()

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(4)

  const todayISO = new Date().toISOString().slice(0, 10)

  const metrics = useMemo(() => {
    const inProgress = orders.filter(
      o => o.status === 'andamento' || o.status === 'aguardando'
    ).length
    const completed = orders.filter(o => o.status === 'pronto').length
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

    return { inProgress, completed, paidRevenue, deferredOpen, deferredOverdueCount, lowStock }
  }, [orders, financial, deferredPayments, stock, todayISO])

  const dailyServiceData = [
    { day: 'Seg', name: 'Segunda-feira', services: 14, isToday: false },
    { day: 'Ter', name: 'Terça-feira', services: 18, isToday: false },
    { day: 'Qua', name: 'Quarta-feira', services: 12, isToday: false },
    { day: 'Qui', name: 'Quinta-feira', services: 22, isToday: false },
    { day: 'Sex', name: 'Sexta-feira', services: 28, isToday: true },
    { day: 'Sáb', name: 'Sábado', services: 20, isToday: false },
    { day: 'Dom', name: 'Domingo', services: 6, isToday: false },
  ]

  const maxVal = 32
  const selectedDay = dailyServiceData[selectedDayIdx]
  const otherDaysAvg = Math.round(
    dailyServiceData
      .filter((_, idx) => idx !== selectedDayIdx)
      .reduce((acc, d) => acc + d.services, 0) /
      (dailyServiceData.length - 1)
  )
  const diffPercent = Math.round(((selectedDay.services - otherDaysAvg) / otherDaysAvg) * 100)

  return (
    <div className="space-y-6 select-none">
      {/* Top 4 Intuitive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('os')}
          className="wr-card-interactive p-5 text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-wr-muted">OS Abertas / Andamento</span>
            <div className="h-9 w-9 rounded-xl bg-wr-orange/15 text-wr-orange flex items-center justify-center">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between w-full">
            <span className="text-3xl font-extrabold font-mono text-wr-text leading-none">
              {metrics.inProgress}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {metrics.completed} pronta(s)
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fiado')}
          className="wr-card-interactive p-5 text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-wr-muted">Pagar Depois (A Receber)</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between w-full gap-2">
            <span className="text-2xl font-extrabold font-mono text-wr-text leading-none">
              {formatCurrency(metrics.deferredOpen)}
            </span>
            {metrics.deferredOverdueCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                <AlertTriangle className="h-3 w-3" /> {metrics.deferredOverdueCount} atraso
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-500">Em dia</span>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('financeiro')}
          className="wr-card-interactive p-5 text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-wr-muted">Receita Recebida</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between w-full">
            <span className="text-2xl font-extrabold font-mono text-wr-text leading-none">
              {formatCurrency(metrics.paidRevenue)}
            </span>
            <span className="text-[11px] font-semibold text-wr-muted">Ver caixa →</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clientes')}
          className="wr-card-interactive p-5 text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-wr-muted">Clientes &amp; Veículos</span>
            <div className="h-9 w-9 rounded-xl bg-wr-elevated border border-wr-border text-wr-gold flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between w-full">
            <span className="text-3xl font-extrabold font-mono text-wr-text leading-none">
              {clients.length}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-wr-muted">
              <Car className="h-3.5 w-3.5 text-wr-orange" /> {vehicles.length} veículos
            </span>
          </div>
        </button>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weekly Activity Bar Chart (8 cols) */}
        <div className="lg:col-span-8 wr-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-wr-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-wr-elevated border border-wr-border text-wr-orange">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-wr-text">
                    Movimentação Semanal da Oficina
                  </h3>
                  <p className="text-[11px] text-wr-muted">
                    Clique em um dia para comparar o volume de serviços
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-wr-elevated px-3 py-1.5 border border-wr-border text-xs">
                <span className="text-wr-muted">{selectedDay.name}:</span>
                <span className="text-wr-text font-bold font-mono">
                  {selectedDay.services} serviços
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    diffPercent >= 0
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/15 text-rose-500'
                  }`}
                >
                  {diffPercent >= 0 ? `+${diffPercent}%` : `${diffPercent}%`}
                </span>
              </div>
            </div>

            <div className="mt-6 h-56 w-full flex items-end justify-between gap-2 sm:gap-3 px-1">
              {dailyServiceData.map((d, idx) => {
                const isSelected = selectedDayIdx === idx
                const barHeightPercent = Math.max(14, Math.round((d.services / maxVal) * 100))

                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group"
                  >
                    <span
                      className={`mb-2 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-wr-orange text-white dark:text-[#0B0C10] border-wr-orange'
                          : 'bg-wr-elevated text-wr-muted border-wr-border group-hover:text-wr-text'
                      }`}
                    >
                      {d.services}
                    </span>

                    <div className="w-full max-w-[44px] h-36 bg-wr-elevated rounded-xl flex items-end overflow-hidden border border-wr-border">
                      <div
                        style={{ height: `${barHeightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-t from-wr-orangeDark to-wr-orange'
                            : 'bg-wr-borderHover/70 group-hover:bg-wr-orange/50'
                        }`}
                      />
                    </div>

                    <span
                      className={`mt-2 text-xs font-semibold ${
                        isSelected ? 'text-wr-orange font-bold' : 'text-wr-muted'
                      }`}
                    >
                      {d.day}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-wr-border flex flex-wrap items-center justify-between gap-2 text-xs text-wr-muted">
            <span>
              Média diária: <strong className="text-wr-text font-mono">{otherDaysAvg} serviços</strong>
            </span>
            <button
              onClick={() => openNewOrderModal()}
              className="inline-flex items-center gap-1 font-bold text-wr-orange hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Abrir Nova OS agora
            </button>
          </div>
        </div>

        {/* Right: Upcoming Appointments (4 cols) */}
        <div className="lg:col-span-4 wr-card p-6 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <h3 className="text-sm font-bold text-wr-text flex items-center gap-2">
                <Clock className="h-4 w-4 text-wr-orange" />
                Agenda do Dia
              </h3>
              <span className="text-xs font-mono text-wr-muted">
                {appointments.length} item(ns)
              </span>
            </div>

            <div className="space-y-2.5">
              {appointments.slice(0, 4).map(apt => (
                <div
                  key={apt.id}
                  className="wr-surface-muted p-3 flex items-center justify-between gap-2 hover:border-wr-borderHover transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-wr-orange bg-wr-surface px-2 py-1 rounded-lg border border-wr-border shrink-0">
                      {apt.time}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-wr-text truncate">{apt.clientName}</p>
                      <p className="text-[11px] text-wr-muted truncate">
                        {apt.vehicleModel} • {apt.vehiclePlate}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      sendWhatsApp(
                        apt.clientPhone,
                        `Olá ${apt.clientName}! Confirmamos seu atendimento às ${apt.time} na WR Mecânica & Cia.`
                      )
                    }
                    className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/25 shrink-0"
                    title="Confirmar no WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('atendimentos')}
            className="wr-btn-secondary w-full justify-between"
          >
            <span>Ver todos os agendamentos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom: Quick Operational Shortcuts & Recent Orders */}
      <div className="wr-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-wr-border">
          <h3 className="text-sm font-bold text-wr-text flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-wr-orange" />
            Ordens de Serviço Recentes
          </h3>
          <button
            onClick={() => setActiveTab('os')}
            className="text-xs font-bold text-wr-orange hover:underline"
          >
            Ver todas →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {orders.slice(0, 4).map(order => (
            <button
              key={order.id}
              type="button"
              onClick={() => setActiveTab('os')}
              className="wr-surface-muted p-4 text-left flex flex-col justify-between gap-2 hover:border-wr-orange/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-wr-orange">{order.number}</span>
                <span className="text-[10px] font-mono text-wr-muted">{order.date}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-wr-text truncate">{order.clientName}</p>
                <p className="text-[11px] text-wr-muted truncate">
                  {order.vehicleModel} ({order.vehiclePlate})
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-wr-border text-xs">
                <span className="text-[10px] uppercase font-bold text-wr-muted">
                  {order.status}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
