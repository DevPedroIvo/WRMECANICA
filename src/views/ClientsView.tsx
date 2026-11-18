import React, { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Client, Vehicle } from '../types'
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  ChevronRight,
  X,
  Car,
  Edit2,
  Trash2,
  Wrench,
  Gauge,
  Fuel,
  Calendar,
  MapPin,
  FileText,
  Wallet,
  Phone,
  ClipboardList,
} from 'lucide-react'

export const ClientsView: React.FC = () => {
  const {
    clients,
    vehicles,
    orders,
    deferredPayments,
    addClient,
    updateClient,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    sendWhatsApp,
    openNewOrderModal,
    setActiveTab,
    setSelectedOrderForModal,
    selectedClientId,
    setSelectedClientId,
    formatCurrency,
  } = useApp()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState<string>(selectedClientId || clients[0]?.id || '')

  // Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  // Client form state (com veículo inicial opcional no cadastro)
  const [cName, setCName] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cCpfCnpj, setCCpfCnpj] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cAddress, setCAddress] = useState('')
  const [cNotes, setCNotes] = useState('')
  const [includeFirstVehicle, setIncludeFirstVehicle] = useState(true)
  const [firstVBrand, setFirstVBrand] = useState('')
  const [firstVModel, setFirstVModel] = useState('')
  const [firstVPlate, setFirstVPlate] = useState('')
  const [firstVYear, setFirstVYear] = useState(new Date().getFullYear())

  // Vehicle form state
  const [vBrand, setVBrand] = useState('')
  const [vModel, setVModel] = useState('')
  const [vPlate, setVPlate] = useState('')
  const [vYear, setVYear] = useState(new Date().getFullYear())
  const [vColor, setVColor] = useState('')
  const [vMileage, setVMileage] = useState(0)
  const [vFuelType, setVFuelType] = useState<Vehicle['fuelType']>('Flex')

  // Sincroniza quando vem da busca global do Header
  useEffect(() => {
    if (selectedClientId) {
      setSelectedId(selectedClientId)
      setSelectedClientId(null)
    }
  }, [selectedClientId, setSelectedClientId])

  // Mapa rápido de veículos por cliente
  const vehiclesByClient = useMemo(() => {
    const map = new Map<string, Vehicle[]>()
    for (const v of vehicles) {
      const list = map.get(v.clientId) || []
      list.push(v)
      map.set(v.clientId, list)
    }
    return map
  }, [vehicles])

  // Busca por nome, telefone, CPF/CNPJ, placa ou modelo de qualquer veículo vinculado!
  const filteredClients = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return clients
    return clients.filter(c => {
      const clientVehicles = vehiclesByClient.get(c.id) || []
      const matchesClient =
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.cpfCnpj || '').toLowerCase().includes(q)
      const matchesVehicle = clientVehicles.some(
        v =>
          v.plate.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q)
      )
      return matchesClient || matchesVehicle
    })
  }, [clients, vehiclesByClient, searchTerm])

  const selectedClient =
    clients.find(c => c.id === selectedId) || filteredClients[0] || clients[0] || null

  const clientVehicles = selectedClient ? vehiclesByClient.get(selectedClient.id) || [] : []
  const clientOrders = selectedClient
    ? orders.filter(o => o.clientId === selectedClient.id)
    : []
  const clientOpenDeferred = selectedClient
    ? deferredPayments.filter(
        d => d.clientId === selectedClient.id && d.totalAmount - d.paidAmount > 0.01
      )
    : []
  const clientTotalDebt = clientOpenDeferred.reduce(
    (sum, d) => sum + (d.totalAmount - d.paidAmount),
    0
  )

  const openNewClientModal = () => {
    setEditingClient(null)
    setCName('')
    setCPhone('')
    setCCpfCnpj('')
    setCEmail('')
    setCAddress('')
    setCNotes('')
    setIncludeFirstVehicle(true)
    setFirstVBrand('')
    setFirstVModel('')
    setFirstVPlate('')
    setFirstVYear(new Date().getFullYear())
    setIsClientModalOpen(true)
  }

  const openEditClientModal = (client: Client) => {
    setEditingClient(client)
    setCName(client.name)
    setCPhone(client.phone)
    setCCpfCnpj(client.cpfCnpj || '')
    setCEmail(client.email || '')
    setCAddress(client.address || '')
    setCNotes(client.notes || '')
    setIncludeFirstVehicle(false)
    setIsClientModalOpen(true)
  }

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cName.trim() || !cPhone.trim()) return

    if (editingClient) {
      updateClient(editingClient.id, {
        name: cName.trim(),
        phone: cPhone.trim(),
        cpfCnpj: cCpfCnpj.trim() || undefined,
        email: cEmail.trim() || undefined,
        address: cAddress.trim() || undefined,
        notes: cNotes.trim() || undefined,
      })
    } else {
      const created = addClient({
        name: cName.trim(),
        phone: cPhone.trim(),
        cpfCnpj: cCpfCnpj.trim() || undefined,
        email: cEmail.trim() || undefined,
        address: cAddress.trim() || undefined,
        notes: cNotes.trim() || undefined,
      })
      setSelectedId(created.id)

      if (includeFirstVehicle && firstVModel.trim() && firstVPlate.trim()) {
        addVehicle({
          clientId: created.id,
          clientName: created.name,
          brand: firstVBrand.trim() || 'Veículo',
          model: firstVModel.trim(),
          plate: firstVPlate.toUpperCase().trim(),
          year: Number(firstVYear) || new Date().getFullYear(),
          currentMileage: 0,
          fuelType: 'Flex',
        })
      }
    }

    setIsClientModalOpen(false)
  }

  const openNewVehicleModal = () => {
    if (!selectedClient) return
    setEditingVehicle(null)
    setVBrand('')
    setVModel('')
    setVPlate('')
    setVYear(new Date().getFullYear())
    setVColor('')
    setVMileage(0)
    setVFuelType('Flex')
    setIsVehicleModalOpen(true)
  }

  const openEditVehicleModal = (v: Vehicle) => {
    setEditingVehicle(v)
    setVBrand(v.brand)
    setVModel(v.model)
    setVPlate(v.plate)
    setVYear(v.year)
    setVColor(v.color || '')
    setVMileage(v.currentMileage || 0)
    setVFuelType(v.fuelType || 'Flex')
    setIsVehicleModalOpen(true)
  }

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient || !vModel.trim() || !vPlate.trim()) return

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
        brand: vBrand.trim(),
        model: vModel.trim(),
        plate: vPlate.toUpperCase().trim(),
        year: Number(vYear),
        color: vColor.trim() || undefined,
        currentMileage: Number(vMileage) || 0,
        fuelType: vFuelType,
      })
    } else {
      addVehicle({
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        brand: vBrand.trim(),
        model: vModel.trim(),
        plate: vPlate.toUpperCase().trim(),
        year: Number(vYear),
        color: vColor.trim() || undefined,
        currentMileage: Number(vMileage) || 0,
        fuelType: vFuelType,
      })
    }

    setIsVehicleModalOpen(false)
    setEditingVehicle(null)
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  return (
    <div className="space-y-6 select-none">
      {/* Top Action & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-wr-border bg-wr-surface px-3.5 py-2 text-xs">
            <Users className="h-4 w-4 text-wr-orange" />
            <span className="text-wr-muted">Clientes:</span>
            <strong className="font-mono text-wr-text">{clients.length}</strong>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-wr-border bg-wr-surface px-3.5 py-2 text-xs">
            <Car className="h-4 w-4 text-wr-gold" />
            <span className="text-wr-muted">Veículos vinculados:</span>
            <strong className="font-mono text-wr-text">{vehicles.length}</strong>
          </div>
        </div>

        <button onClick={openNewClientModal} className="wr-btn-primary">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Cadastrar Cliente
        </button>
      </div>

      {/* Main Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Client & Plate Searchable Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wr-muted"
              strokeWidth={1.75}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone, placa ou carro..."
              className="wr-input pl-10"
            />
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredClients.length === 0 ? (
              <div className="wr-card p-8 text-center text-xs text-wr-muted">
                Nenhum cliente ou placa encontrado para "{searchTerm}".
              </div>
            ) : (
              filteredClients.map(client => {
                const isSelected = selectedClient?.id === client.id
                const cVehicles = vehiclesByClient.get(client.id) || []
                const hasDebt = deferredPayments.some(
                  d => d.clientId === client.id && d.totalAmount - d.paidAmount > 0.01
                )

                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedId(client.id)}
                    className={`w-full text-left flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-wr-orange bg-wr-surface shadow-card ring-1 ring-wr-orange/25'
                        : 'border-wr-border bg-wr-surface/70 hover:bg-wr-surface hover:border-wr-borderHover'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-wr-orange text-white dark:text-[#0B0C10]'
                            : 'bg-wr-elevated text-wr-orange border border-wr-border'
                        }`}
                      >
                        {getInitials(client.name)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-wr-text truncate">
                            {client.name}
                          </h4>
                          {hasDebt && (
                            <span
                              className="inline-flex items-center rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400"
                              title="Possui saldo em Pagar Depois"
                            >
                              A prazo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-wr-muted font-mono mt-0.5">
                          {client.phone}
                        </p>

                        {/* Placas vinculadas visíveis direto na lista */}
                        {cVehicles.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            {cVehicles.slice(0, 3).map(v => (
                              <span
                                key={v.id}
                                className="inline-flex items-center gap-1 rounded-md bg-wr-elevated border border-wr-border px-1.5 py-0.5 text-[10px] font-mono font-semibold text-wr-text"
                              >
                                <Car className="h-2.5 w-2.5 text-wr-orange" />
                                {v.plate}
                              </span>
                            ))}
                            {cVehicles.length > 3 && (
                              <span className="text-[10px] text-wr-muted">
                                +{cVehicles.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-wr-muted/70 italic block mt-1">
                            Nenhum veículo vinculado
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isSelected ? 'text-wr-orange translate-x-0.5' : 'text-wr-muted'
                      }`}
                    />
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right: Selected Client + Linked Vehicles + History (7 cols) */}
        {selectedClient ? (
          <div className="lg:col-span-7 space-y-5">
            {/* Client Summary Card */}
            <div className="wr-card p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wr-border">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-wr-orange/15 border border-wr-orange/30 flex items-center justify-center text-wr-orange font-extrabold text-base shrink-0">
                    {getInitials(selectedClient.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-wr-text leading-tight">
                      {selectedClient.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-wr-muted mt-1">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3 text-wr-orange" />
                        {selectedClient.phone}
                      </span>
                      {selectedClient.cpfCnpj && (
                        <span className="font-mono">CPF/CNPJ: {selectedClient.cpfCnpj}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditClientModal(selectedClient)}
                    className="wr-btn-secondary px-3 py-2"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      sendWhatsApp(
                        selectedClient.phone,
                        `Olá ${selectedClient.name}! Aqui é da WR Mecânica & Cia. Como podemos ajudar hoje?`
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Client Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="wr-surface-muted p-3 flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-wr-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-wr-muted block">
                      Endereço
                    </span>
                    <span className="text-wr-text">
                      {selectedClient.address || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="wr-surface-muted p-3 flex items-start gap-2.5">
                  <FileText className="h-4 w-4 text-wr-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-wr-muted block">
                      Observações
                    </span>
                    <span className="text-wr-text">
                      {selectedClient.notes || 'Sem observações cadastradas'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerta se o cliente tiver saldo em Pagar Depois */}
              {clientTotalDebt > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs">
                    <Wallet className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-bold text-wr-text">
                        Saldo em Pagar Depois:{' '}
                        <span className="font-mono text-amber-600 dark:text-amber-400">
                          {formatCurrency(clientTotalDebt)}
                        </span>
                      </span>
                      <span className="block text-[11px] text-wr-muted">
                        {clientOpenDeferred.length} conta(s) a prazo em aberto para este cliente
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('fiado')}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white dark:text-[#0B0C10] hover:brightness-110 transition"
                  >
                    Ver em Pagar Depois →
                  </button>
                </div>
              )}
            </div>

            {/* Linked Vehicles Section (ALL VEHICLES LIVE HERE!) */}
            <div className="wr-card p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-wr-border">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-wr-orange" />
                  <h4 className="text-sm font-bold text-wr-text">
                    Veículos Vinculados ({clientVehicles.length})
                  </h4>
                </div>
                <button onClick={openNewVehicleModal} className="wr-btn-primary px-3 py-1.5">
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  Adicionar Veículo
                </button>
              </div>

              {clientVehicles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-wr-border bg-wr-elevated/50 p-6 text-center space-y-2">
                  <Car className="h-7 w-7 text-wr-muted mx-auto" />
                  <p className="text-xs font-semibold text-wr-text">
                    Nenhum veículo cadastrado para {selectedClient.name}
                  </p>
                  <p className="text-[11px] text-wr-muted">
                    Adicione os veículos do cliente aqui para abrir ordens de serviço em 1 clique.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {clientVehicles.map(vehicle => (
                    <div
                      key={vehicle.id}
                      className="rounded-2xl border border-wr-border bg-wr-elevated p-4 flex flex-col justify-between gap-3 hover:border-wr-orange/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-wr-muted block">
                              {vehicle.brand}
                            </span>
                            <h5 className="text-sm font-bold text-wr-text leading-snug">
                              {vehicle.model}
                            </h5>
                          </div>
                          {/* Placa estilo destaque */}
                          <span className="rounded-lg border-2 border-wr-border bg-wr-surface px-2.5 py-1 font-mono text-xs font-extrabold text-wr-orange tracking-wider shrink-0">
                            {vehicle.plate}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-wr-muted pt-1">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {vehicle.year}
                          </span>
                          {vehicle.color && <span>• {vehicle.color}</span>}
                          {vehicle.fuelType && (
                            <span className="inline-flex items-center gap-1">
                              <Fuel className="h-3 w-3" /> {vehicle.fuelType}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Gauge className="h-3 w-3" />{' '}
                            {Number(vehicle.currentMileage || 0).toLocaleString('pt-BR')} km
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-wr-border">
                        <button
                          onClick={() =>
                            openNewOrderModal({
                              clientId: selectedClient.id,
                              vehicleId: vehicle.id,
                            })
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-wr-orange/15 hover:bg-wr-orange text-wr-orange hover:text-white dark:hover:text-[#0B0C10] py-2 text-[11px] font-bold transition-colors"
                        >
                          <Wrench className="h-3.5 w-3.5" />
                          Abrir OS
                        </button>
                        <button
                          onClick={() => openEditVehicleModal(vehicle)}
                          className="rounded-xl border border-wr-border bg-wr-surface p-2 text-wr-muted hover:text-wr-text hover:border-wr-borderHover transition-colors"
                          title="Editar veículo"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Remover ${vehicle.brand} ${vehicle.model} (${vehicle.plate}) deste cliente?`
                              )
                            ) {
                              deleteVehicle(vehicle.id)
                            }
                          }}
                          className="rounded-xl border border-wr-border bg-wr-surface p-2 text-wr-muted hover:text-rose-500 hover:border-rose-500/40 transition-colors"
                          title="Remover veículo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Orders History for this Client */}
            <div className="wr-card p-6 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-wr-border">
                <h4 className="text-sm font-bold text-wr-text flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-wr-orange" />
                  Histórico de Ordens de Serviço ({clientOrders.length})
                </h4>
              </div>

              {clientOrders.length === 0 ? (
                <p className="text-xs text-wr-muted py-3 text-center">
                  Nenhuma ordem de serviço registrada para este cliente ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {clientOrders.map(order => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        setSelectedOrderForModal(order)
                        setActiveTab('os')
                      }}
                      className="w-full text-left wr-surface-muted p-3.5 flex items-center justify-between gap-3 hover:border-wr-orange/50 transition-colors text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-wr-orange">
                            {order.number}
                          </span>
                          <span className="font-semibold text-wr-text truncate">
                            {order.vehicleModel} ({order.vehiclePlate})
                          </span>
                        </div>
                        <p className="text-[11px] text-wr-muted truncate mt-0.5">
                          {order.serviceDescription}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                          {formatCurrency(order.totalAmount)}
                        </span>
                        <span className="text-[10px] text-wr-muted">{order.date}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 wr-card p-12 text-center text-xs text-wr-muted">
            Selecione um cliente à esquerda ou cadastre o primeiro cliente.
          </div>
        )}
      </div>

      {/* Modal: Cadastrar / Editar Cliente */}
      {isClientModalOpen && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-lg animate-fadeIn">
            <div className="flex items-center justify-between pb-3.5 border-b border-wr-border">
              <h3 className="text-sm font-bold text-wr-text">
                {editingClient ? 'Editar Dados do Cliente' : 'Cadastrar Novo Cliente'}
              </h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="rounded-lg p-1 text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={cName}
                  onChange={e => setCName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="wr-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={cPhone}
                    onChange={e => setCPhone(e.target.value)}
                    placeholder="(63) 99234-5678"
                    className="wr-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">
                    CPF / CNPJ (opcional)
                  </label>
                  <input
                    type="text"
                    value={cCpfCnpj}
                    onChange={e => setCCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00"
                    className="wr-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Endereço (opcional)
                </label>
                <input
                  type="text"
                  value={cAddress}
                  onChange={e => setCAddress(e.target.value)}
                  placeholder="Rua, quadra, bairro..."
                  className="wr-input"
                />
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Observações (opcional)
                </label>
                <input
                  type="text"
                  value={cNotes}
                  onChange={e => setCNotes(e.target.value)}
                  placeholder="Ex: Cliente frotista, avisar antes de trocar peças..."
                  className="wr-input"
                />
              </div>

              {/* Opção prática: já vincular o 1º veículo no cadastro do cliente */}
              {!editingClient && (
                <div className="rounded-2xl border border-wr-border bg-wr-elevated p-3.5 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-wr-text">
                    <input
                      type="checkbox"
                      checked={includeFirstVehicle}
                      onChange={e => setIncludeFirstVehicle(e.target.checked)}
                      className="accent-wr-orange h-4 w-4 rounded"
                    />
                    Já vincular um veículo a este cliente
                  </label>

                  {includeFirstVehicle && (
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <input
                        type="text"
                        value={firstVBrand}
                        onChange={e => setFirstVBrand(e.target.value)}
                        placeholder="Marca (ex: Honda)"
                        className="wr-input bg-wr-surface"
                      />
                      <input
                        type="text"
                        value={firstVModel}
                        onChange={e => setFirstVModel(e.target.value)}
                        placeholder="Modelo (ex: Civic)"
                        className="wr-input bg-wr-surface"
                      />
                      <input
                        type="text"
                        value={firstVPlate}
                        onChange={e => setFirstVPlate(e.target.value)}
                        placeholder="Placa (ex: ABC1D23)"
                        className="wr-input bg-wr-surface font-mono uppercase"
                      />
                      <input
                        type="number"
                        value={firstVYear}
                        onChange={e => setFirstVYear(Number(e.target.value))}
                        placeholder="Ano"
                        className="wr-input bg-wr-surface font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-2">
                <button type="submit" className="wr-btn-primary flex-1 py-3">
                  {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="wr-btn-secondary py-3"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar / Editar Veículo Vinculado */}
      {isVehicleModalOpen && selectedClient && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-md animate-fadeIn">
            <div className="flex items-center justify-between pb-3.5 border-b border-wr-border">
              <div>
                <h3 className="text-sm font-bold text-wr-text">
                  {editingVehicle ? 'Editar Veículo' : 'Adicionar Veículo'}
                </h3>
                <p className="text-[11px] text-wr-muted mt-0.5">
                  Vinculado a: <strong className="text-wr-orange">{selectedClient.name}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsVehicleModalOpen(false)
                  setEditingVehicle(null)
                }}
                className="rounded-lg p-1 text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Marca *</label>
                  <input
                    type="text"
                    value={vBrand}
                    onChange={e => setVBrand(e.target.value)}
                    placeholder="Ex: Toyota"
                    className="wr-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Modelo *</label>
                  <input
                    type="text"
                    value={vModel}
                    onChange={e => setVModel(e.target.value)}
                    placeholder="Ex: Corolla XEi"
                    className="wr-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Placa *</label>
                  <input
                    type="text"
                    value={vPlate}
                    onChange={e => setVPlate(e.target.value)}
                    placeholder="ABC1D23"
                    className="wr-input font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Ano *</label>
                  <input
                    type="number"
                    value={vYear}
                    onChange={e => setVYear(Number(e.target.value))}
                    className="wr-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Cor</label>
                  <input
                    type="text"
                    value={vColor}
                    onChange={e => setVColor(e.target.value)}
                    placeholder="Prata"
                    className="wr-input"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Combustível</label>
                  <select
                    value={vFuelType}
                    onChange={e => setVFuelType(e.target.value as Vehicle['fuelType'])}
                    className="wr-input"
                  >
                    <option value="Flex">Flex</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Etanol">Etanol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Elétrico">Elétrico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">KM Atual</label>
                  <input
                    type="number"
                    value={vMileage}
                    onChange={e => setVMileage(Number(e.target.value))}
                    className="wr-input font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button type="submit" className="wr-btn-primary flex-1 py-3">
                  Salvar Veículo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVehicleModalOpen(false)
                    setEditingVehicle(null)
                  }}
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
