import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Appointment, AppointmentStatus } from '../types'
import {
  CalendarDays,
  Clock,
  Car,
  User,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Plus,
  Play,
  Check,
  ChevronRight,
  X,
  Phone
} from 'lucide-react'

export const AppointmentsView: React.FC = () => {
  const { appointments, updateAppointmentStatus, sendWhatsApp, setActiveTab, setIsNewOrderModalOpen } = useApp()
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // New appointment form state
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [time, setTime] = useState('08:30')
  const [box, setBox] = useState('Elevador 1')

  const filteredAppointments = appointments.filter(a => {
    if (filterStatus === 'todos') return true
    return a.status === filterStatus
  })

  const inProgressCount = appointments.filter(a => a.status === 'em_atendimento').length
  const waitingCount = appointments.filter(a => a.status === 'aguardando' || a.status === 'confirmado').length
  const completedCount = appointments.filter(a => a.status === 'concluido').length

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'em_atendimento':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF8500]/15 border border-[#FF8500]/40 px-3 py-1 text-xs font-bold text-[#FF8500]">
            <span className="h-2 w-2 rounded-full bg-[#FF8500] animate-pulse" />
            Em Atendimento no Box
          </span>
        )
      case 'confirmado':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-400">
            <Clock className="h-3 w-3" strokeWidth={1.75} />
            Confirmado (Aguardando)
          </span>
        )
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />
            Finalizado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#202020] border border-[#262626] px-3 py-1 text-xs font-bold text-[#A5A5A5]">
            <AlertCircle className="h-3 w-3" strokeWidth={1.75} />
            Aguardando Chegada
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-[1440px] mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#FFFFFF] flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#FF8500]" strokeWidth={1.75} />
            Próximos Atendimentos &amp; Agendamentos
          </h2>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Controle de fluxo de entrada, agendamentos do dia e ocupação dos elevadores
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] px-4 py-2.5 text-xs font-bold text-[#080808] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" strokeWidth={2.5} />
          Novo Agendamento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-5">
        <div className="rounded-2xl border border-[#262626] bg-[#151515] p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#A5A5A5]">Em Atendimento nos Boxes</span>
            <span className="text-2xl font-bold text-[#FF8500] font-mono mt-1 block">{inProgressCount}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#202020] border border-[#262626] flex items-center justify-center text-[#FF8500]">
            <Wrench className="h-5 w-5" strokeWidth={1.75} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#151515] p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#A5A5A5]">Aguardando Entrada Hoje</span>
            <span className="text-2xl font-bold text-[#FFFFFF] font-mono mt-1 block">{waitingCount}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#202020] border border-[#262626] flex items-center justify-center text-blue-400">
            <Clock className="h-5 w-5" strokeWidth={1.75} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#151515] p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#A5A5A5]">Serviços Concluídos Hoje</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">{completedCount}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#202020] border border-[#262626] flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#151515] p-1.5 rounded-xl w-fit border border-[#262626]">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'em_atendimento', label: 'Em Atendimento' },
          { id: 'aguardando', label: 'Aguardando' },
          { id: 'concluido', label: 'Concluídos' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${
              filterStatus === tab.id
                ? 'bg-[#FF8500] text-[#080808] shadow-sm'
                : 'text-[#A5A5A5] hover:text-[#FFFFFF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.map(apt => (
          <div
            key={apt.id}
            className="rounded-2xl border border-[#262626] bg-[#151515] p-5 shadow-lg flex items-center justify-between hover:border-[#383838] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center rounded-xl bg-[#202020] border border-[#262626] h-14 w-16 text-center">
                <Clock className="h-3.5 w-3.5 text-[#FF8500]" strokeWidth={1.75} />
                <span className="text-xs font-mono font-bold text-[#FFFFFF] mt-0.5">{apt.time}</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-[#FFFFFF]">{apt.clientName}</h4>
                  {getStatusBadge(apt.status)}
                </div>
                <div className="flex items-center gap-4 text-xs text-[#A5A5A5]">
                  <span className="flex items-center gap-1 font-mono text-[#E5A51B]">
                    <Car className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {apt.vehicleModel} ({apt.vehiclePlate})
                  </span>
                  <span>•</span>
                  <span>{apt.serviceDescription}</span>
                  <span>•</span>
                  <span className="text-[#FFFFFF]">{apt.box}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => sendWhatsApp(apt.clientPhone, `Olá ${apt.clientName}! Confirmamos seu atendimento na WR Mecânica & Cia.`)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                WhatsApp
              </button>

              {apt.status === 'aguardando' && (
                <button
                  onClick={() => updateAppointmentStatus(apt.id, 'em_atendimento')}
                  className="flex items-center gap-1.5 rounded-xl bg-[#FF8500] px-4 py-2 text-xs font-bold text-[#080808] hover:bg-[#D96A00] transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Iniciar
                </button>
              )}

              {apt.status === 'em_atendimento' && (
                <button
                  onClick={() => updateAppointmentStatus(apt.id, 'concluido')}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition-colors"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  Finalizar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
