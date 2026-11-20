import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { AppointmentStatus } from '../types'
import { ClientAutocomplete } from '../components/ClientAutocomplete'
import { VehicleAutocomplete } from '../components/VehicleAutocomplete'
import {
  CalendarDays,
  Clock,
  Car,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Plus,
  Play,
  Check,
  X,
} from 'lucide-react'

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    clients,
    vehicles,
    addAppointment,
    updateAppointmentStatus,
    sendWhatsApp,
    mechanics,
    openNewOrderModal,
  } = useApp()

  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // New appointment form state
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '')
  const [clientName, setClientName] = useState(clients[0]?.name || '')
  const [clientPhone, setClientPhone] = useState(clients[0]?.phone || '')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [mechanicName, setMechanicName] = useState(mechanics[0] || 'Roberto Silva')
  const [time, setTime] = useState('09:00')
  const [box, setBox] = useState('Box 01 (Elevador)')

  const filteredAppointments = appointments.filter(a => {
    if (filterStatus === 'todos') return true
    if (filterStatus === 'aguardando') {
      return a.status === 'aguardando' || a.status === 'confirmado'
    }
    return a.status === filterStatus
  })

  const inProgressCount = appointments.filter(a => a.status === 'em_atendimento').length
  const waitingCount = appointments.filter(
    a => a.status === 'aguardando' || a.status === 'confirmado'
  ).length
  const completedCount = appointments.filter(a => a.status === 'concluido').length

  const openNewModal = () => {
    const first = clients[0]
    setSelectedClientId(first?.id || '')
    setClientName(first?.name || '')
    setClientPhone(first?.phone || '')
    const firstVeh = vehicles.find(v => v.clientId === first?.id)
    setVehicleModel(firstVeh ? `${firstVeh.brand} ${firstVeh.model}` : '')
    setVehiclePlate(firstVeh?.plate || '')
    setServiceDescription('')
    setTime('09:00')
    setBox('Box 01 (Elevador)')
    setIsNewModalOpen(true)
  }

  const handleClientPick = (cid: string) => {
    setSelectedClientId(cid)
    const c = clients.find(x => x.id === cid)
    if (c) {
      setClientName(c.name)
      setClientPhone(c.phone)
      const v = vehicles.find(veh => veh.clientId === cid)
      if (v) {
        setVehicleModel(`${v.brand} ${v.model}`)
        setVehiclePlate(v.plate)
      }
    }
  }

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !vehicleModel.trim() || !serviceDescription.trim()) return

    addAppointment({
      time,
      date: new Date().toLocaleDateString('pt-BR'),
      clientId: selectedClientId || undefined,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || '(63) 99999-0000',
      vehicleModel: vehicleModel.trim(),
      vehiclePlate: vehiclePlate.toUpperCase().trim() || 'SEM PLACA',
      serviceDescription: serviceDescription.trim(),
      mechanicName,
      box,
      status: 'confirmado',
      estimatedDuration: '1h',
    })

    setIsNewModalOpen(false)
  }

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'em_atendimento':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-wr-orange/15 px-2.5 py-1 text-[11px] font-bold text-wr-orange">
            <span className="h-2 w-2 rounded-full bg-wr-orange animate-pulse" />
            Em Atendimento
          </span>
        )
      case 'confirmado':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
            <Clock className="h-3 w-3" />
            Confirmado
          </span>
        )
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Finalizado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-wr-elevated border border-wr-border px-2.5 py-1 text-[11px] font-bold text-wr-muted">
            <AlertCircle className="h-3 w-3" />
            Aguardando
          </span>
        )
    }
  }

  const clientVehicles = vehicles.filter(v => v.clientId === selectedClientId)

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-wr-text flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-wr-orange" />
            Agendamentos &amp; Boxes
          </h2>
          <p className="text-xs text-wr-muted mt-0.5">
            Controle de horários, entrada de veículos e status dos elevadores
          </p>
        </div>

        <button onClick={openNewModal} className="wr-btn-primary">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Novo Agendamento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted">Em Atendimento</span>
            <span className="text-2xl font-extrabold font-mono text-wr-orange mt-1 block">
              {inProgressCount}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-wr-orange/15 text-wr-orange flex items-center justify-center">
            <Wrench className="h-5 w-5" />
          </div>
        </div>

        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted">Aguardando / Confirmados</span>
            <span className="text-2xl font-extrabold font-mono text-wr-text mt-1 block">
              {waitingCount}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted">Concluídos</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {completedCount}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-wr-border bg-wr-surface p-1 w-fit">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'em_atendimento', label: 'Em Atendimento' },
          { id: 'aguardando', label: 'Aguardando' },
          { id: 'concluido', label: 'Concluídos' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              filterStatus === tab.id
                ? 'bg-wr-orange text-white dark:text-[#0B0C10]'
                : 'text-wr-muted hover:text-wr-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredAppointments.map(apt => (
          <div
            key={apt.id}
            className="wr-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-wr-borderHover transition-colors"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex flex-col items-center justify-center rounded-xl bg-wr-elevated border border-wr-border h-14 w-16 shrink-0">
                <Clock className="h-3.5 w-3.5 text-wr-orange" />
                <span className="text-xs font-mono font-bold text-wr-text mt-0.5">{apt.time}</span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-wr-text">{apt.clientName}</h4>
                  {getStatusBadge(apt.status)}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-wr-muted">
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-wr-orange">
                    <Car className="h-3.5 w-3.5" />
                    {apt.vehicleModel} ({apt.vehiclePlate})
                  </span>
                  <span>•</span>
                  <span>{apt.serviceDescription}</span>
                  <span>•</span>
                  <span className="font-semibold text-wr-text">{apt.box}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() =>
                  sendWhatsApp(
                    apt.clientPhone,
                    `Olá ${apt.clientName}! Confirmamos seu atendimento às ${apt.time} na WR Mecânica & Cia.`
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </button>

              {(apt.status === 'aguardando' || apt.status === 'confirmado') && (
                <button
                  type="button"
                  onClick={() => {
                    updateAppointmentStatus(apt.id, 'em_atendimento')
                    openNewOrderModal({
                      clientId: apt.clientId,
                      clientName: apt.clientName,
                      clientPhone: apt.clientPhone,
                      vehicleId: apt.vehicleId,
                      vehicleModel: apt.vehicleModel,
                      vehiclePlate: apt.vehiclePlate,
                      serviceDescription: apt.serviceDescription,
                    })
                  }}
                  className="wr-btn-primary py-2 px-3.5 shadow-sm"
                  title="Iniciar serviço e abrir Ordem de Serviço correspondente"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Iniciar Serviço
                </button>
              )}

              {apt.status === 'em_atendimento' && (
                <button
                  onClick={() => updateAppointmentStatus(apt.id, 'concluido')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition-colors"
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  Finalizar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Novo Agendamento (agora funcional!) */}
      {isNewModalOpen && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-lg animate-fadeIn">
            <div className="flex items-center justify-between pb-3.5 border-b border-wr-border">
              <h3 className="text-sm font-bold text-wr-text">Novo Agendamento</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="rounded-lg p-1 text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Cliente (digite para buscar ou cadastrar) *
                </label>
                <ClientAutocomplete
                  value={clientName}
                  onChange={name => setClientName(name)}
                  onSelectClient={c => {
                    setSelectedClientId(c.id)
                    setClientName(c.name)
                    setClientPhone(c.phone)
                    const v = vehicles.find(veh => veh.clientId === c.id)
                    if (v) {
                      setVehicleModel(`${v.brand} ${v.model}`)
                      setVehiclePlate(v.plate)
                    }
                  }}
                  placeholder="Digite o nome do cliente..."
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">Telefone WhatsApp</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="(63) 99234-5678"
                  className="wr-input font-mono"
                />
              </div>

              {/* Veículo com Autocomplete vinculado ao dono */}
              <VehicleAutocomplete
                clientId={selectedClientId}
                modelValue={vehicleModel}
                plateValue={vehiclePlate}
                onModelChange={m => setVehicleModel(m)}
                onPlateChange={p => setVehiclePlate(p)}
                onSelectVehicle={v => {
                  setVehicleModel(`${v.brand} ${v.model}`)
                  setVehiclePlate(v.plate)
                }}
              />

              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Serviço Agendado *
                </label>
                <input
                  type="text"
                  required
                  value={serviceDescription}
                  onChange={e => setServiceDescription(e.target.value)}
                  placeholder="Ex: Revisão geral e alinhamento"
                  className="wr-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Horário</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Box</label>
                  <select value={box} onChange={e => setBox(e.target.value)} className="wr-input">
                    <option>Box 01 (Elevador)</option>
                    <option>Box 02 (Rampa)</option>
                    <option>Box 03 (Diagnóstico)</option>
                    <option>Box 04 (Rápido)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Mecânico Responsável</label>
                  <select
                    value={mechanicName}
                    onChange={e => setMechanicName(e.target.value)}
                    className="wr-input"
                  >
                    {mechanics.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button type="submit" className="wr-btn-primary flex-1 py-3">
                  Salvar Agendamento
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="wr-btn-secondary py-3"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
