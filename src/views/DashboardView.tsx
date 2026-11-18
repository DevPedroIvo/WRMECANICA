import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Car,
  CheckCircle2,
  DollarSign,
  Users,
  ArrowUpRight,
  Calendar,
  MessageCircle,
  Clock,
  Wrench,
  TrendingUp,
  BarChart3,
  ChevronRight
} from 'lucide-react'

export const DashboardView: React.FC = () => {
  const { 
    orders, 
    clients, 
    appointments, 
    formatCurrency, 
    setActiveTab, 
    sendWhatsApp,
    updateAppointmentStatus 
  } = useApp()

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(4) // Default Sexta-feira (Hoje)

  const inProgressOrders = orders.filter(o => o.status === 'andamento').length
  const completedOrders = orders.filter(o => o.status === 'pronto').length
  const totalBilled = 18750.00

  // Bar Chart Data: Daily comparison of completed services
  const dailyServiceData = [
    { day: 'Seg', name: 'Segunda-feira', services: 14, quotes: 18, isToday: false },
    { day: 'Ter', name: 'Terça-feira', services: 18, quotes: 22, isToday: false },
    { day: 'Qua', name: 'Quarta-feira', services: 12, quotes: 16, isToday: false },
    { day: 'Qui', name: 'Quinta-feira', services: 22, quotes: 26, isToday: false },
    { day: 'Sex', name: 'Sexta-feira', services: 28, quotes: 30, isToday: true },
    { day: 'Sáb', name: 'Sábado', services: 20, quotes: 24, isToday: false },
    { day: 'Dom', name: 'Domingo', services: 6, quotes: 8, isToday: false },
  ]

  const maxVal = 32
  const selectedDay = dailyServiceData[selectedDayIdx]
  const otherDaysAvg = Math.round(
    dailyServiceData
      .filter((_, idx) => idx !== selectedDayIdx)
      .reduce((acc, d) => acc + d.services, 0) / (dailyServiceData.length - 1)
  )
  const diffPercent = Math.round(((selectedDay.services - otherDaysAvg) / otherDaysAvg) * 100)

  // Recent Activities
  const recentActivities = [
    {
      id: 'act-1',
      title: 'Ordem de Serviço #1024 em andamento',
      subtitle: 'Troca de pastilhas de freio • Honda Civic (QWE1A23)',
      time: 'Há 15 min',
      icon: Wrench,
      iconColor: 'text-[#FF8500]'
    },
    {
      id: 'act-2',
      title: 'Quitação recebida via Pix',
      subtitle: 'R$ 600,00 recebido de Marcos Oliveira (OS #0987)',
      time: 'Há 45 min',
      icon: DollarSign,
      iconColor: 'text-emerald-400'
    },
    {
      id: 'act-3',
      title: 'Baixa de estoque efetuada',
      subtitle: 'Pastilha de Freio Dianteira (Cod: PB-002) - 1 un.',
      time: 'Há 1 hora',
      icon: CheckCircle2,
      iconColor: 'text-[#E5A51B]'
    },
    {
      id: 'act-4',
      title: 'Novo cliente cadastrado',
      subtitle: 'Mariana Costa • Hyundai HB20',
      time: 'Há 2 horas',
      icon: Users,
      iconColor: 'text-sky-400'
    }
  ]

  return (
    <div className="space-y-6 pb-12 select-none max-w-[1440px] mx-auto">
      
      {/* Main Grid matching Laptop Mockup */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): 3 Indicator Cards + Bar Chart */}
        <div className="col-span-8 space-y-6">
          
          {/* Row of 3 Indicator Cards */}
          <div className="grid grid-cols-3 gap-5">
            {/* Card 1: Ordens em andamento */}
            <div 
              onClick={() => setActiveTab('os')}
              className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-5 cursor-pointer hover:border-[#FF8500]/50 transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A5A5A5]">Ordens em andamento</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#202020] text-[#FF8500] border border-[#262626]">
                  <Car className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <h2 className="text-3xl font-bold text-[#FFFFFF] font-mono leading-none">
                  {inProgressOrders || 12}
                </h2>
                <span className="flex items-center text-xs font-semibold text-emerald-400">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +2 hoje
                </span>
              </div>
            </div>

            {/* Card 2: Serviços concluídos */}
            <div 
              onClick={() => setActiveTab('os')}
              className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-5 cursor-pointer hover:border-emerald-500/50 transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A5A5A5]">Serviços concluídos</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <h2 className="text-3xl font-bold text-[#FFFFFF] font-mono leading-none">
                  {completedOrders + 26 || 28}
                </h2>
                <span className="flex items-center text-xs font-semibold text-emerald-400">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +5 no mês
                </span>
              </div>
            </div>

            {/* Card 3: Faturamento do mês */}
            <div 
              onClick={() => setActiveTab('financeiro')}
              className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-5 cursor-pointer hover:border-[#E5A51B]/50 transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A5A5A5]">Faturamento do mês</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#202020] text-[#E5A51B] border border-[#262626]">
                  <DollarSign className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <h2 className="text-xl font-bold text-[#FFFFFF] font-mono leading-none">
                  {formatCurrency(totalBilled)}
                </h2>
                <span className="flex items-center text-xs font-semibold text-emerald-400">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +12%
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico de Barras de Movimentação da Oficina */}
          <div className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#202020] border border-[#262626] text-[#FF8500]">
                    <BarChart3 className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#FFFFFF]">
                      Movimentação da Oficina • Serviços Realizados por Dia
                    </h3>
                    <p className="text-[11px] text-[#A5A5A5]">
                      Comparativo de volume de serviços finalizados entre os dias da semana
                    </p>
                  </div>
                </div>

                {/* Comparative Pill */}
                <div className="flex items-center gap-2 rounded-xl bg-[#202020] px-3 py-1.5 border border-[#262626] text-xs">
                  <span className="text-[#A5A5A5]">{selectedDay.name}:</span>
                  <span className="text-[#FFFFFF] font-bold font-mono">{selectedDay.services} serviços</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    diffPercent >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {diffPercent >= 0 ? `+${diffPercent}%` : `${diffPercent}%`} vs média
                  </span>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="mt-6">
                <div className="h-56 w-full flex items-end justify-between gap-3 px-2">
                  {dailyServiceData.map((d, idx) => {
                    const isSelected = selectedDayIdx === idx
                    const barHeightPercent = Math.max(12, Math.round((d.services / maxVal) * 100))

                    return (
                      <div
                        key={d.day}
                        onClick={() => setSelectedDayIdx(idx)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      >
                        {/* Number of services badge on hover or if selected */}
                        <div className="mb-2 transition-all">
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-[#FF8500] text-[#080808] border-[#FF8500] shadow-[0_0_12px_rgba(255,133,0,0.5)]'
                              : 'bg-[#202020] text-[#A5A5A5] border-[#262626] group-hover:text-[#FFFFFF]'
                          }`}>
                            {d.services}
                          </span>
                        </div>

                        {/* Bar Body with track background */}
                        <div className="w-full max-w-[46px] h-40 bg-[#202020] rounded-xl relative flex items-end overflow-hidden border border-[#262626]/80 group-hover:border-[#383838]">
                          <div
                            style={{ height: `${barHeightPercent}%` }}
                            className={`w-full rounded-t-lg transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-t from-[#D96A00] to-[#FF8500] shadow-[0_0_15px_rgba(255,133,0,0.4)]'
                                : 'bg-[#2a2d36] group-hover:bg-[#353945]'
                            }`}
                          />
                        </div>

                        {/* Day label */}
                        <div className="mt-2.5 text-center">
                          <span className={`text-xs font-semibold block transition-colors ${
                            isSelected ? 'text-[#FF8500] font-bold' : 'text-[#A5A5A5] group-hover:text-[#FFFFFF]'
                          }`}>
                            {d.day}
                          </span>
                          {d.isToday && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF8500] block mt-0.5">
                              Hoje
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom summary bar */}
            <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between text-xs text-[#A5A5A5]">
              <span>Média da oficina: <strong className="text-[#FFFFFF] font-mono">{otherDaysAvg} serviços/dia</strong></span>
              <span className="text-[#FF8500] font-semibold">Pico de movimentação: Sexta-feira (28 serviços concluídos)</span>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Clientes Cadastrados Card + Próximos Atendimentos */}
        <div className="col-span-4 space-y-6 flex flex-col">
          
          {/* Card: Clientes cadastrados (843) */}
          <div 
            onClick={() => setActiveTab('clientes')}
            className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-5 cursor-pointer hover:border-[#FF8500]/50 transition-all shadow-lg flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-[#A5A5A5]">Clientes cadastrados</span>
              <h2 className="text-3xl font-bold text-[#FFFFFF] font-mono mt-2 leading-none">
                843
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#202020] text-[#FFFFFF] border border-[#262626]">
              <Calendar className="h-5 w-5 text-[#FF8500]" strokeWidth={1.75} />
            </div>
          </div>

          {/* Card: Próximos atendimentos */}
          <div className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-6 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
                <h3 className="text-sm font-bold text-[#FFFFFF]">Próximos atendimentos</h3>
                <span className="text-xs text-[#A5A5A5]">Hoje</span>
              </div>

              {/* Three items matching the mockup list */}
              <div className="mt-4 space-y-3">
                {[
                  { time: '09:00', client: 'Marcos Oliveira', vehicle: 'Honda Civic • QWE1A23', phone: '(63) 99234-5678', box: 'Box 01' },
                  { time: '10:30', client: 'Ana Paula', vehicle: 'Toyota Corolla • BRA2E19', phone: '(63) 98112-3344', box: 'Box 02' },
                  { time: '14:00', client: 'Carlos Mendes', vehicle: 'Jeep Compass • JPK8821', phone: '(63) 98455-6677', box: 'Box 03' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#262626] bg-[#202020]/70 p-3.5 hover:border-[#383838] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#FF8500] bg-[#151515] px-2.5 py-1 rounded-lg border border-[#262626]">
                          {item.time}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[#FFFFFF]">{item.client}</p>
                          <p className="text-[11px] text-[#A5A5A5] mt-0.5">{item.vehicle}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          sendWhatsApp(item.phone, `Olá ${item.client}! Confirmamos seu atendimento às ${item.time} na WR Mecânica & Cia.`)
                        }}
                        className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('atendimentos')}
              className="w-full mt-4 rounded-xl border border-[#262626] bg-[#202020] py-2.5 text-xs font-semibold text-[#A5A5A5] hover:text-[#FFFFFF] hover:border-[#383838] transition-colors text-center"
            >
              Ver todos os agendamentos →
            </button>
          </div>

        </div>

      </div>

      {/* Bottom Section: Atividades Recentes da Oficina */}
      <div className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#FF8500]" strokeWidth={1.75} />
            <h3 className="text-sm font-bold text-[#FFFFFF]">Atividades Recentes da Oficina</h3>
          </div>
          <span className="text-xs text-[#A5A5A5]">Atualizado em tempo real</span>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          {recentActivities.map(act => {
            const Icon = act.icon
            return (
              <div 
                key={act.id}
                className="rounded-xl border border-[#262626] bg-[#202020] p-4 flex flex-col justify-between hover:border-[#383838] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`p-2 rounded-lg bg-[#151515] border border-[#262626] ${act.iconColor}`}>
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="text-[10px] text-[#A5A5A5]">{act.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#FFFFFF] mt-3 leading-snug">{act.title}</h4>
                  <p className="text-[11px] text-[#A5A5A5] mt-1 line-clamp-2">{act.subtitle}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
