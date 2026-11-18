import React, { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import {
  ServiceOrder,
  FuelStatus,
  TireCondition,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  VehicleInspectionChecklist,
  VisualItemStatus,
} from '../types'
import { generateOsCanvas, DEFAULT_WORKSHOP_INFO } from '../utils/osImageGenerator'
import { DanfseModal } from '../components/DanfseModal'
import {
  ClipboardList,
  Search,
  Plus,
  Car,
  User,
  Gauge,
  Fuel,
  CheckCircle2,
  Clock,
  MessageCircle,
  FileText,
  Printer,
  X,
  Trash2,
  Download,
  Copy,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  FileCheck2,
  Wallet,
  Eye,
} from 'lucide-react'

const PRE_REGISTERED_SERVICES = [
  { name: 'Troca de Óleo e Filtros', partsCost: 180, laborCost: 120 },
  { name: 'Troca de Pastilhas de Freio Dianteiras', partsCost: 185, laborCost: 150 },
  { name: 'Troca de Pastilhas de Freio Traseiras', partsCost: 160, laborCost: 140 },
  { name: 'Alinhamento 3D e Balanceamento', partsCost: 0, laborCost: 150 },
  { name: 'Sangria e Troca de Fluido de Freio DOT 4', partsCost: 90, laborCost: 120 },
  { name: 'Higienização de Ar Condicionado + Filtro de Cabine', partsCost: 75, laborCost: 110 },
  { name: 'Diagnóstico Eletrônico Computadorizado', partsCost: 0, laborCost: 200 },
  { name: 'Troca de Bateria Automotiva 60Ah', partsCost: 470, laborCost: 60 },
  { name: 'Troca de Amortecedores Dianteiros (Par)', partsCost: 720, laborCost: 260 },
  { name: 'Troca de Velas de Ignição Iridium (Jogo)', partsCost: 240, laborCost: 120 },
  { name: 'Revisão Preventiva Completa', partsCost: 350, laborCost: 280 },
  { name: 'Troca de Correia Dentada e Tensor', partsCost: 380, laborCost: 320 },
  { name: 'Limpeza de Bicos Injetores e TBI', partsCost: 60, laborCost: 190 },
  { name: 'Substituição de Embreagem Completa', partsCost: 650, laborCost: 450 },
]

const VISUAL_CHECKLIST_ITEMS: {
  key: keyof Omit<VehicleInspectionChecklist, 'bodyworkDamages'>
  label: string
}[] = [
  { key: 'headlights', label: 'Faróis' },
  { key: 'taillights', label: 'Lanternas / Setas' },
  { key: 'paintwork', label: 'Pintura / Lataria' },
  { key: 'glass', label: 'Vidros / Para-brisa' },
  { key: 'mirrors', label: 'Retrovisores' },
  { key: 'bumpers', label: 'Para-choques' },
  { key: 'wipers', label: 'Limpadores' },
  { key: 'wheelsSpare', label: 'Rodas / Estepe' },
]

const DEFAULT_VISUAL_CHECKLIST: VehicleInspectionChecklist = {
  headlights: 'ok',
  taillights: 'ok',
  paintwork: 'ok',
  glass: 'ok',
  mirrors: 'ok',
  bumpers: 'ok',
  wipers: 'ok',
  wheelsSpare: 'ok',
  bodyworkDamages: '',
}

const MECHANICS_LIST = ['Roberto Silva', 'Carlos Eduardo', 'Marcos Mecânico', 'Lucas Ferreira']

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cartao_credito: 'Crédito',
  cartao_debito: 'Débito',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
  pagar_depois: 'Pagar Depois',
  pendente: 'Pendente',
}

export const OrdersView: React.FC = () => {
  const {
    orders,
    clients,
    vehicles,
    addOrder,
    updateOrder,
    updateOrderStatus,
    issueFiscalInvoice,
    fiscalSettings,
    formatCurrency,
    selectedOrderForModal,
    setSelectedOrderForModal,
    isNewOrderModalOpen,
    setIsNewOrderModalOpen,
    orderPrefill,
    setOrderPrefill,
    showToast,
  } = useApp()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')

  const [pdfModalOrder, setPdfModalOrder] = useState<ServiceOrder | null>(null)
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<ServiceOrder | null>(null)
  const [danfseModalOrder, setDanfseModalOrder] = useState<ServiceOrder | null>(null)

  // WhatsApp Image Generator State
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)

  // ===================== NEW OS FORM STATE =====================
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCpfCnpj, setClientCpfCnpj] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [mileage, setMileage] = useState<number>(0)
  const [fuelLevel, setFuelLevel] = useState<FuelStatus>('medio')

  // Pneus (4 posições)
  const [tireFrontLeft, setTireFrontLeft] = useState<TireCondition>('bom')
  const [tireFrontRight, setTireFrontRight] = useState<TireCondition>('bom')
  const [tireRearLeft, setTireRearLeft] = useState<TireCondition>('bom')
  const [tireRearRight, setTireRearRight] = useState<TireCondition>('bom')

  // Checklist visual enxuto (faróis, pintura, vidros, retrovisores, etc.)
  const [checklist, setChecklist] = useState<VehicleInspectionChecklist>(DEFAULT_VISUAL_CHECKLIST)

  const [mainServiceDesc, setMainServiceDesc] = useState('')
  const [mechanicAssigned, setMechanicAssigned] = useState(MECHANICS_LIST[0])
  const [observations, setObservations] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [paymentDueDate, setPaymentDueDate] = useState(() =>
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )

  const [serviceItems, setServiceItems] = useState<OrderItem[]>([])
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemParts, setNewItemParts] = useState<number>(0)
  const [newItemLabor, setNewItemLabor] = useState<number>(0)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Aplicar pré-preenchimento quando abrir OS direto de um cliente/veículo
  useEffect(() => {
    if (!isNewOrderModalOpen) return

    const targetClient =
      (orderPrefill?.clientId ? clients.find(c => c.id === orderPrefill.clientId) : null) ||
      clients[0]

    if (targetClient) {
      setSelectedClientId(targetClient.id)
      setClientName(targetClient.name)
      setClientPhone(targetClient.phone)
      setClientCpfCnpj(targetClient.cpfCnpj || '')

      const linkedVehicles = vehicles.filter(v => v.clientId === targetClient.id)
      const targetVehicle =
        (orderPrefill?.vehicleId
          ? linkedVehicles.find(v => v.id === orderPrefill.vehicleId)
          : null) || linkedVehicles[0]

      if (targetVehicle) {
        setSelectedVehicleId(targetVehicle.id)
        setVehicleModel(`${targetVehicle.brand} ${targetVehicle.model}`)
        setVehiclePlate(targetVehicle.plate)
        setMileage(targetVehicle.currentMileage || 0)
      } else {
        setSelectedVehicleId('')
        setVehicleModel('')
        setVehiclePlate('')
        setMileage(0)
      }
    }

    setFuelLevel('medio')
    setTireFrontLeft('bom')
    setTireFrontRight('bom')
    setTireRearLeft('bom')
    setTireRearRight('bom')
    setChecklist(DEFAULT_VISUAL_CHECKLIST)
    setMainServiceDesc('')
    setObservations('')
    setPaymentMethod('pix')
    setPaymentDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
    setServiceItems([])
    setNewItemDesc('')
    setNewItemParts(0)
    setNewItemLabor(0)

    if (orderPrefill) setOrderPrefill(null)
  }, [isNewOrderModalOpen])

  const linkedVehiclesForSelectedClient = useMemo(
    () => vehicles.filter(v => v.clientId === selectedClientId),
    [vehicles, selectedClientId]
  )

  const handleSelectClient = (cid: string) => {
    setSelectedClientId(cid)
    if (!cid) {
      setSelectedVehicleId('')
      return
    }
    const client = clients.find(c => c.id === cid)
    if (client) {
      setClientName(client.name)
      setClientPhone(client.phone)
      setClientCpfCnpj(client.cpfCnpj || '')
      const firstVeh = vehicles.find(v => v.clientId === cid)
      if (firstVeh) {
        setSelectedVehicleId(firstVeh.id)
        setVehicleModel(`${firstVeh.brand} ${firstVeh.model}`)
        setVehiclePlate(firstVeh.plate)
        setMileage(firstVeh.currentMileage || 0)
      } else {
        setSelectedVehicleId('')
        setVehicleModel('')
        setVehiclePlate('')
        setMileage(0)
      }
    }
  }

  const handleSelectVehicle = (vid: string) => {
    setSelectedVehicleId(vid)
    const v = vehicles.find(veh => veh.id === vid)
    if (v) {
      setVehicleModel(`${v.brand} ${v.model}`)
      setVehiclePlate(v.plate)
      setMileage(v.currentMileage || 0)
    }
  }

  const partsSum = serviceItems.reduce((acc, it) => acc + (Number(it.partsCost) || 0), 0)
  const laborSum = serviceItems.reduce((acc, it) => acc + (Number(it.laborCost) || 0), 0)
  const totalSum = partsSum + laborSum

  const filteredSuggestions = PRE_REGISTERED_SERVICES.filter(s =>
    s.name.toLowerCase().includes(newItemDesc.toLowerCase())
  )

  const handleSelectSuggestion = (service: (typeof PRE_REGISTERED_SERVICES)[0]) => {
    setNewItemDesc(service.name)
    setNewItemParts(service.partsCost)
    setNewItemLabor(service.laborCost)
    setShowSuggestions(false)
  }

  const handleAddItem = () => {
    if (!newItemDesc.trim()) return
    const pCost = Number(newItemParts) || 0
    const lCost = Number(newItemLabor) || 0
    const item: OrderItem = {
      id: `it-${Date.now()}`,
      serviceDescription: newItemDesc.trim(),
      partsCost: pCost,
      laborCost: lCost,
      total: pCost + lCost,
      serviceCode: '14.01',
      cnae: '4520-0/01',
    }
    setServiceItems(prev => [...prev, item])
    if (!mainServiceDesc.trim()) setMainServiceDesc(item.serviceDescription)
    setNewItemDesc('')
    setNewItemParts(0)
    setNewItemLabor(0)
    setShowSuggestions(false)
  }

  const handleRemoveItem = (id: string) => {
    setServiceItems(prev => prev.filter(i => i.id !== id))
  }

  // WhatsApp Canvas Generation
  useEffect(() => {
    if (!whatsAppModalOrder) return
    let objectUrl = ''
    setGeneratedImageUrl('')
    setImageBlob(null)
    setCopyFeedback(false)

    generateOsCanvas(whatsAppModalOrder, DEFAULT_WORKSHOP_INFO).then(canvas => {
      canvas.toBlob(blob => {
        if (blob) {
          objectUrl = URL.createObjectURL(blob)
          setImageBlob(blob)
          setGeneratedImageUrl(objectUrl)
        }
      }, 'image/png')
    })

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [whatsAppModalOrder])

  const handleDirectShare = async () => {
    if (!imageBlob || !whatsAppModalOrder) return
    const file = new File(
      [imageBlob],
      `OS_${whatsAppModalOrder.number.replace(/\D/g, '')}_WR_Mecanica.png`,
      { type: 'image/png' }
    )
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${whatsAppModalOrder.number} - WR Mecânica & Cia`,
          text: `Olá ${whatsAppModalOrder.clientName}, segue o comprovante da sua Ordem de Serviço na WR Mecânica & Cia.`,
        })
        return
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }
    await handleCopyAndOpenWhatsApp()
  }

  const handleCopyAndOpenWhatsApp = async () => {
    if (!whatsAppModalOrder) return
    try {
      if (imageBlob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': imageBlob })])
        setCopyFeedback(true)
      }
    } catch {
      // Fallback silencioso
    }
    const cleanNumber = whatsAppModalOrder.clientPhone.replace(/\D/g, '')
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
    window.open(`https://wa.me/${fullNumber}`, '_blank')
  }

  const handleDownloadImage = () => {
    if (!generatedImageUrl || !whatsAppModalOrder) return
    const link = document.createElement('a')
    link.href = generatedImageUrl
    link.download = `OS_${whatsAppModalOrder.number.replace(/\D/g, '')}_WR_Mecanica.png`
    link.click()
  }

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !clientPhone.trim() || !vehicleModel.trim()) {
      showToast('Preencha nome do cliente, telefone e veículo.', 'warning')
      return
    }

    const finalItems: OrderItem[] =
      serviceItems.length > 0
        ? serviceItems
        : [
            {
              id: `item-${Date.now()}`,
              serviceDescription: mainServiceDesc.trim() || 'Serviço Geral',
              partsCost: 0,
              laborCost: 150,
              total: 150,
              serviceCode: '14.01',
              cnae: '4520-0/01',
            },
          ]

    const finalParts = finalItems.reduce((acc, i) => acc + i.partsCost, 0)
    const finalLabor = finalItems.reduce((acc, i) => acc + i.laborCost, 0)

    addOrder({
      clientId: selectedClientId || `cli-${Date.now()}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientCpfCnpj: clientCpfCnpj.trim() || undefined,
      vehicleId: selectedVehicleId || undefined,
      vehicleModel: vehicleModel.trim(),
      vehiclePlate: vehiclePlate.toUpperCase().trim() || 'SEM PLACA',
      mileage: Number(mileage) || 0,
      fuelLevel,
      tires: {
        frontLeft: tireFrontLeft,
        frontRight: tireFrontRight,
        rearLeft: tireRearLeft,
        rearRight: tireRearRight,
      },
      inspection: {
        ...checklist,
        bodyworkDamages: checklist.bodyworkDamages?.trim() || undefined,
      },
      mechanicAssigned,
      serviceDescription: mainServiceDesc.trim() || finalItems[0].serviceDescription,
      items: finalItems,
      observations: observations.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'aguardando',
      paymentMethod,
      paymentDueDate: paymentMethod === 'pagar_depois' ? paymentDueDate : undefined,
      warranty: {
        days: 90,
        expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        coverage: '90 dias de garantia legal para mão de obra conforme Art. 26 do CDC.',
        status: 'vigente',
      },
      partsTotal: finalParts,
      laborTotal: finalLabor,
      totalAmount: finalParts + finalLabor,
    })

    setIsNewOrderModalOpen(false)
  }

  const filteredOrders = orders.filter(o => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      !q ||
      (o.number?.toLowerCase() || '').includes(q) ||
      (o.clientName?.toLowerCase() || '').includes(q) ||
      (o.vehiclePlate?.toLowerCase() || '').includes(q) ||
      (o.vehicleModel?.toLowerCase() || '').includes(q) ||
      (o.serviceDescription?.toLowerCase() || '').includes(q) ||
      (o.mechanicAssigned?.toLowerCase() || '').includes(q) ||
      (o.fiscalInvoice?.invoiceNumber || '').includes(searchTerm)

    const matchesFilter = filterStatus === 'todos' || o.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'aguardando':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            Aguardando
          </span>
        )
      case 'andamento':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-wr-orange/15 text-wr-orange">
            <span className="h-2 w-2 rounded-full bg-wr-orange animate-pulse" />
            Em andamento
          </span>
        )
      case 'pronto':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Pronto
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-wr-elevated text-wr-muted">
            Cancelado
          </span>
        )
    }
  }

  const getFuelBadge = (level: FuelStatus) => {
    if (level === 'reserva') return <span className="font-bold text-rose-500">Reserva</span>
    if (level === 'cheio') return <span className="font-bold text-emerald-500">Cheio</span>
    return <span className="font-bold text-amber-500">Médio</span>
  }

  const toggleVisualChecklist = (
    key: keyof Omit<VehicleInspectionChecklist, 'bodyworkDamages'>,
    val: VisualItemStatus
  ) => {
    setChecklist(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-wr-text flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-wr-orange" />
            Ordens de Serviço &amp; NFS-e
          </h2>
          <p className="text-xs text-wr-muted mt-0.5">
            Vistoria visual rápida (faróis, pintura, pneus), garantia de 90 dias e emissão fiscal leve
          </p>
        </div>

        <button onClick={() => setIsNewOrderModalOpen(true)} className="wr-btn-primary">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Nova Ordem de Serviço
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wr-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, placa, veículo, mecânico, OS ou NFS-e..."
            className="wr-input pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-wr-border bg-wr-surface p-1">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'aguardando', label: 'Aguardando' },
            { id: 'andamento', label: 'Em andamento' },
            { id: 'pronto', label: 'Prontas' },
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
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="wr-card p-10 text-center text-xs text-wr-muted">
          Nenhuma ordem de serviço encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredOrders.map(order => {
            const hasFiscal = order.fiscalInvoice && order.fiscalInvoice.status === 'autorizada'
            const isDeferred = order.paymentMethod === 'pagar_depois'

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderForModal(order)}
                className="wr-card-interactive p-5 cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3.5">
                  {/* Top Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-wr-border">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-wr-orange bg-wr-elevated px-2.5 py-1 rounded-lg border border-wr-border">
                        {order.number}
                      </span>
                      <span className="text-[11px] text-wr-muted">{order.date}</span>
                      {hasFiscal && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          <ShieldCheck className="h-3 w-3" /> NFS-e
                        </span>
                      )}
                      {isDeferred && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          <Wallet className="h-3 w-3" /> Pagar Depois
                        </span>
                      )}
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Client & Vehicle */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-wr-orange shrink-0" />
                        <h3 className="text-sm font-bold text-wr-text group-hover:text-wr-orange transition-colors">
                          {order.clientName}
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-bold bg-wr-elevated border border-wr-border px-2 py-0.5 rounded-md text-wr-text">
                        {order.vehiclePlate}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-wr-muted pl-6">
                      <span className="inline-flex items-center gap-1 font-semibold text-wr-gold">
                        <Car className="h-3.5 w-3.5" />
                        {order.vehicleModel}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                        <Gauge className="h-3 w-3" />
                        {Number(order.mileage).toLocaleString('pt-BR')} km
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Fuel className="h-3 w-3" />
                        {getFuelBadge(order.fuelLevel)}
                      </span>
                    </div>
                  </div>

                  {/* Service Description */}
                  <div className="wr-surface-muted p-3 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-wr-muted font-bold uppercase mb-0.5">
                      <span>Serviço</span>
                      <span>Mecânico: {order.mechanicAssigned}</span>
                    </div>
                    <p className="text-wr-text font-semibold line-clamp-2">
                      {order.serviceDescription}
                    </p>
                  </div>

                  {/* Totals */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="wr-surface-muted p-2">
                      <span className="text-[10px] text-wr-muted block">Peças</span>
                      <span className="font-mono font-bold text-wr-text">
                        {formatCurrency(order.partsTotal || 0)}
                      </span>
                    </div>
                    <div className="wr-surface-muted p-2">
                      <span className="text-[10px] text-wr-muted block">Mão de Obra</span>
                      <span className="font-mono font-bold text-wr-text">
                        {formatCurrency(order.laborTotal || 0)}
                      </span>
                    </div>
                    <div className="rounded-xl bg-wr-orange/10 border border-wr-orange/30 p-2">
                      <span className="text-[10px] text-wr-orange font-bold block">Total</span>
                      <span className="font-mono font-extrabold text-wr-orange">
                        {formatCurrency(order.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div
                  className="pt-3 border-t border-wr-border flex items-center gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  {hasFiscal ? (
                    <button
                      onClick={() => setDanfseModalOrder(order)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Ver NFS-e
                    </button>
                  ) : (
                    <button
                      onClick={() => issueFiscalInvoice(order.id)}
                      className="flex-1 wr-btn-secondary py-2"
                    >
                      <FileCheck2 className="h-3.5 w-3.5 text-wr-orange" />
                      Emitir NFS-e
                    </button>
                  )}

                  <button
                    onClick={() => setWhatsAppModalOrder(order)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </button>

                  <button
                    onClick={() => setPdfModalOrder(order)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-wr-orange/35 bg-wr-orange/10 py-2 text-xs font-bold text-wr-orange hover:bg-wr-orange hover:text-white dark:hover:text-[#0B0C10] transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Recibo
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===================== MODAL: DETALHES DA OS ===================== */}
      {selectedOrderForModal && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-wr-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-wr-orange bg-wr-elevated px-2.5 py-1 rounded-lg border border-wr-border">
                    {selectedOrderForModal.number}
                  </span>
                  {selectedOrderForModal.paymentMethod && (
                    <span className="text-[11px] font-semibold text-wr-muted">
                      Pagamento: {PAYMENT_LABELS[selectedOrderForModal.paymentMethod]}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-wr-text mt-1">
                  {selectedOrderForModal.clientName} • {selectedOrderForModal.vehicleModel} (
                  {selectedOrderForModal.vehiclePlate})
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForModal(null)}
                className="rounded-lg p-1.5 text-wr-muted hover:text-wr-text hover:bg-wr-elevated"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Switcher */}
            <div className="wr-surface-muted p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-wr-muted block">
                Status do Serviço
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'aguardando', label: 'Aguardando', active: 'bg-amber-500 text-white dark:text-black border-amber-500' },
                    { id: 'andamento', label: 'Em Andamento', active: 'bg-wr-orange text-white dark:text-[#0B0C10] border-wr-orange' },
                    { id: 'pronto', label: 'Pronto', active: 'bg-emerald-600 text-white border-emerald-600' },
                  ] as const
                ).map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => updateOrderStatus(selectedOrderForModal.id, st.id)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedOrderForModal.status === st.id
                        ? st.active
                        : 'bg-wr-surface text-wr-muted border-wr-border hover:text-wr-text'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist Visual Simplificado Registrado */}
            {selectedOrderForModal.inspection && (
              <div className="wr-surface-muted p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> Checklist Visual de Entrada
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {VISUAL_CHECKLIST_ITEMS.map(item => {
                    const val = selectedOrderForModal.inspection?.[item.key] || 'ok'
                    return (
                      <div
                        key={item.key}
                        className="rounded-xl bg-wr-surface border border-wr-border px-2.5 py-2 flex items-center justify-between gap-1"
                      >
                        <span className="text-wr-text font-medium truncate">{item.label}</span>
                        <span
                          className={`font-bold text-[10px] uppercase ${
                            val === 'ok' ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {val === 'ok' ? 'OK' : 'Avaria'}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {selectedOrderForModal.tires && (
                  <div className="grid grid-cols-4 gap-2 text-[10px] pt-1">
                    {[
                      { label: 'Pneu DE', val: selectedOrderForModal.tires.frontLeft },
                      { label: 'Pneu DD', val: selectedOrderForModal.tires.frontRight },
                      { label: 'Pneu TE', val: selectedOrderForModal.tires.rearLeft },
                      { label: 'Pneu TD', val: selectedOrderForModal.tires.rearRight },
                    ].map(t => (
                      <div
                        key={t.label}
                        className="rounded-lg bg-wr-surface border border-wr-border py-1.5 px-2 text-center"
                      >
                        <span className="text-wr-muted block">{t.label}</span>
                        <strong
                          className={`uppercase ${
                            t.val === 'bom'
                              ? 'text-emerald-500'
                              : t.val === 'regular'
                              ? 'text-amber-500'
                              : 'text-rose-500'
                          }`}
                        >
                          {t.val}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}

                {selectedOrderForModal.inspection.bodyworkDamages && (
                  <p className="text-[11px] text-wr-muted bg-wr-surface rounded-xl p-2.5 border border-wr-border">
                    <strong className="text-amber-500">Observação de avaria:</strong>{' '}
                    {selectedOrderForModal.inspection.bodyworkDamages}
                  </p>
                )}
              </div>
            )}

            {/* Mecânico */}
            <div className="wr-surface-muted p-3.5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-wr-muted">Mecânico Responsável</span>
              <select
                value={selectedOrderForModal.mechanicAssigned}
                onChange={e =>
                  updateOrder(selectedOrderForModal.id, { mechanicAssigned: e.target.value })
                }
                className="wr-input max-w-[200px] bg-wr-surface"
              >
                {MECHANICS_LIST.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Itens da OS */}
            <div className="rounded-xl border border-wr-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-wr-elevated text-wr-muted border-b border-wr-border">
                  <tr>
                    <th className="py-2.5 px-3.5 font-semibold">Serviço</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Peças</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Mão de Obra</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wr-border text-wr-text">
                  {selectedOrderForModal.items?.map(it => (
                    <tr key={it.id}>
                      <td className="py-2.5 px-3.5">{it.serviceDescription}</td>
                      <td className="py-2.5 px-3.5 font-mono text-right text-wr-muted">
                        {formatCurrency(it.partsCost)}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-right text-wr-muted">
                        {formatCurrency(it.laborCost)}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-wr-elevated border-t border-wr-border font-bold text-xs">
                  <tr>
                    <td className="py-2.5 px-3.5 text-wr-muted">Total da OS</td>
                    <td className="py-2.5 px-3.5 font-mono text-right text-wr-text">
                      {formatCurrency(selectedOrderForModal.partsTotal || 0)}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-right text-wr-text">
                      {formatCurrency(selectedOrderForModal.laborTotal || 0)}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-right text-wr-orange text-sm font-black">
                      {formatCurrency(selectedOrderForModal.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  setWhatsAppModalOrder(selectedOrderForModal)
                  setSelectedOrderForModal(null)
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar no WhatsApp
              </button>
              <button
                onClick={() => {
                  setPdfModalOrder(selectedOrderForModal)
                  setSelectedOrderForModal(null)
                }}
                className="wr-btn-primary flex-1 py-2.5"
              >
                <FileText className="h-4 w-4" />
                Comprovante / PDF
              </button>
              <button
                onClick={() => setSelectedOrderForModal(null)}
                className="wr-btn-secondary py-2.5"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: WHATSAPP IMAGEM ===================== */}
      {whatsAppModalOrder && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-2xl space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-wr-text">
                    Enviar Imagem da OS via WhatsApp
                  </h3>
                  <p className="text-[11px] text-wr-muted">
                    Gerada localmente no navegador (zero upload para o Supabase)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalOrder(null)}
                className="rounded-lg p-1 text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {copyFeedback && (
              <div className="rounded-xl bg-emerald-600 text-white p-3 font-bold">
                ✓ Imagem copiada! No WhatsApp, pressione Ctrl+V para colar.
              </div>
            )}

            <div className="rounded-2xl border border-wr-border bg-[#0A0B0E] p-3 flex items-center justify-center max-h-[440px] overflow-y-auto">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="OS WR Mecânica"
                  className="rounded-xl max-w-full h-auto"
                />
              ) : (
                <div className="py-12 text-wr-muted flex flex-col items-center gap-2">
                  <div className="h-6 w-6 border-2 border-wr-orange border-t-transparent rounded-full animate-spin" />
                  <span>Gerando imagem da OS...</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleDirectShare}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Compartilhar no WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopyAndOpenWhatsApp}
                className="wr-btn-secondary py-2.5"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </button>
              <button
                type="button"
                onClick={handleDownloadImage}
                className="wr-btn-secondary py-2.5"
              >
                <Download className="h-4 w-4 text-wr-orange" />
                Baixar PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: COMPROVANTE / PDF ===================== */}
      {pdfModalOrder && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-2xl space-y-5 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border no-print">
              <span className="font-bold text-wr-orange uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4" /> Comprovante da Ordem de Serviço
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="wr-btn-secondary px-3 py-1.5">
                  <Printer className="h-3.5 w-3.5 text-wr-orange" /> Imprimir / PDF
                </button>
                <button
                  onClick={() => setPdfModalOrder(null)}
                  className="rounded-lg p-1 text-wr-muted hover:text-wr-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-wr-border bg-wr-elevated p-6 space-y-4 text-wr-text">
              <div className="flex items-start justify-between border-b border-wr-border pb-4">
                <div>
                  <h2 className="text-lg font-black text-wr-gold">{fiscalSettings.tradeName}</h2>
                  <p className="text-[11px] text-wr-muted">{fiscalSettings.companyName}</p>
                  <p className="text-[10px] text-wr-muted">CNPJ: {fiscalSettings.cnpj}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-black text-wr-orange block">
                    {pdfModalOrder.number}
                  </span>
                  <span className="text-[11px] text-wr-muted block">{pdfModalOrder.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-wr-surface p-3.5 border border-wr-border">
                <div>
                  <span className="text-[10px] font-bold uppercase text-wr-orange block">Cliente</span>
                  <p className="font-bold text-wr-text">{pdfModalOrder.clientName}</p>
                  <p className="text-wr-muted font-mono">{pdfModalOrder.clientPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-wr-orange block">Veículo</span>
                  <p className="font-bold text-wr-text">{pdfModalOrder.vehicleModel}</p>
                  <p className="text-wr-muted font-mono">
                    Placa: {pdfModalOrder.vehiclePlate} •{' '}
                    {Number(pdfModalOrder.mileage).toLocaleString('pt-BR')} km
                  </p>
                </div>
              </div>

              {pdfModalOrder.inspection && (
                <div className="rounded-xl bg-wr-surface p-3 border border-wr-border text-[11px] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-wr-muted block">
                    Vistoria Visual (Faróis, Pintura, Pneus e Lataria)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {VISUAL_CHECKLIST_ITEMS.map(item => {
                      const val = pdfModalOrder.inspection?.[item.key] || 'ok'
                      return (
                        <span key={item.key} className="text-wr-text">
                          {item.label}:{' '}
                          <strong className={val === 'ok' ? 'text-emerald-500' : 'text-rose-500'}>
                            {val === 'ok' ? 'OK' : 'Avaria'}
                          </strong>
                        </span>
                      )
                    })}
                  </div>
                  {pdfModalOrder.inspection.bodyworkDamages && (
                    <p className="text-wr-muted">Obs: {pdfModalOrder.inspection.bodyworkDamages}</p>
                  )}
                </div>
              )}

              <table className="w-full text-left text-xs border border-wr-border rounded-xl overflow-hidden bg-wr-surface">
                <thead className="bg-wr-elevated text-wr-muted border-b border-wr-border">
                  <tr>
                    <th className="p-2.5">Descrição</th>
                    <th className="p-2.5 text-right">Peças</th>
                    <th className="p-2.5 text-right">M. Obra</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wr-border">
                  {pdfModalOrder.items?.map(it => (
                    <tr key={it.id}>
                      <td className="p-2.5 font-medium">{it.serviceDescription}</td>
                      <td className="p-2.5 font-mono text-right text-wr-muted">
                        {formatCurrency(it.partsCost)}
                      </td>
                      <td className="p-2.5 font-mono text-right text-wr-muted">
                        {formatCurrency(it.laborCost)}
                      </td>
                      <td className="p-2.5 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-wr-elevated font-bold border-t border-wr-border">
                  <tr>
                    <td className="p-2.5 text-wr-orange">TOTAL GERAL</td>
                    <td className="p-2.5 font-mono text-right">
                      {formatCurrency(pdfModalOrder.partsTotal || 0)}
                    </td>
                    <td className="p-2.5 font-mono text-right">
                      {formatCurrency(pdfModalOrder.laborTotal || 0)}
                    </td>
                    <td className="p-2.5 font-mono text-right text-sm text-wr-orange font-black">
                      {formatCurrency(pdfModalOrder.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <p className="text-[10px] text-wr-muted">
                <strong>Garantia Legal:</strong> 90 dias conforme Art. 26 do CDC.{' '}
                {pdfModalOrder.observations && `Obs.: ${pdfModalOrder.observations}`}
              </p>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-[10px] text-wr-muted">
                <div className="border-t border-wr-borderHover pt-1.5">Assinatura do Cliente</div>
                <div className="border-t border-wr-borderHover pt-1.5">
                  {fiscalSettings.tradeName}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: DANFSE OFICIAL ===================== */}
      {danfseModalOrder && (
        <DanfseModal
          order={danfseModalOrder}
          settings={fiscalSettings}
          onClose={() => setDanfseModalOrder(null)}
        />
      )}

      {/* ===================== MODAL: NOVA ORDEM DE SERVIÇO ===================== */}
      {isNewOrderModalOpen && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-3xl space-y-5 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-wr-orange" />
                <h3 className="text-base font-bold text-wr-text">Nova Ordem de Serviço</h3>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="rounded-lg p-1 text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-5">
              {/* 1. SELEÇÃO RÁPIDA DE CLIENTE & VEÍCULO VINCULADO */}
              <div className="wr-surface-muted p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Cliente &amp; Veículo Vinculado
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">
                      Selecionar Cliente Cadastrado
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={e => handleSelectClient(e.target.value)}
                      className="wr-input bg-wr-surface"
                    >
                      <option value="">Digitar cliente manualmente...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">
                      Veículo do Cliente
                    </label>
                    <select
                      value={selectedVehicleId}
                      onChange={e => handleSelectVehicle(e.target.value)}
                      disabled={linkedVehiclesForSelectedClient.length === 0}
                      className="wr-input bg-wr-surface disabled:opacity-60"
                    >
                      {linkedVehiclesForSelectedClient.length === 0 ? (
                        <option value="">Digitar veículo abaixo...</option>
                      ) : (
                        linkedVehiclesForSelectedClient.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.brand} {v.model} • {v.plate}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Nome do cliente *"
                    className="wr-input bg-wr-surface"
                  />
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="Telefone / WhatsApp *"
                    className="wr-input bg-wr-surface font-mono"
                  />
                  <input
                    type="text"
                    value={clientCpfCnpj}
                    onChange={e => setClientCpfCnpj(e.target.value)}
                    placeholder="CPF/CNPJ (para NFS-e)"
                    className="wr-input bg-wr-surface font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={e => setVehicleModel(e.target.value)}
                    placeholder="Modelo do veículo *"
                    className="wr-input bg-wr-surface"
                  />
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={e => setVehiclePlate(e.target.value)}
                    placeholder="Placa (ex: ABC1D23)"
                    className="wr-input bg-wr-surface font-mono uppercase"
                  />
                  <input
                    type="number"
                    value={mileage || ''}
                    onChange={e => setMileage(Number(e.target.value))}
                    placeholder="Quilometragem (KM)"
                    className="wr-input bg-wr-surface font-mono"
                  />
                </div>

                {/* Combustível compacto */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-wr-muted flex items-center gap-1 mr-1">
                    <Fuel className="h-3.5 w-3.5 text-wr-orange" /> Combustível:
                  </span>
                  {(
                    [
                      { id: 'reserva', label: 'Reserva', active: 'bg-rose-500 text-white border-rose-500' },
                      { id: 'medio', label: 'Médio', active: 'bg-amber-500 text-white dark:text-black border-amber-500' },
                      { id: 'cheio', label: 'Cheio', active: 'bg-emerald-600 text-white border-emerald-600' },
                    ] as const
                  ).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFuelLevel(opt.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        fuelLevel === opt.id
                          ? opt.active
                          : 'bg-wr-surface text-wr-muted border-wr-border hover:text-wr-text'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. CHECKLIST VISUAL SIMPLIFICADO (FARÓIS, PINTURA, PNEUS, ETC.) */}
              <div className="wr-surface-muted p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4" /> Checklist Visual do Veículo
                  </span>
                  <span className="text-[10px] text-wr-muted">
                    Faróis, pintura, pneus e lataria • leve para o banco
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {VISUAL_CHECKLIST_ITEMS.map(item => {
                    const current = checklist[item.key]
                    return (
                      <div
                        key={item.key}
                        className="rounded-xl bg-wr-surface border border-wr-border p-2.5 space-y-2"
                      >
                        <span className="text-[11px] font-bold text-wr-text block truncate">
                          {item.label}
                        </span>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => toggleVisualChecklist(item.key, 'ok')}
                            className={`py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              current === 'ok'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-wr-elevated text-wr-muted hover:text-wr-text'
                            }`}
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleVisualChecklist(item.key, 'avaria')}
                            className={`py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              current === 'avaria'
                                ? 'bg-rose-500 text-white'
                                : 'bg-wr-elevated text-wr-muted hover:text-wr-text'
                            }`}
                          >
                            Avaria
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Estado dos 4 Pneus */}
                <div className="space-y-1.5 pt-2 border-t border-wr-border">
                  <span className="text-[11px] font-semibold text-wr-muted block">
                    Estado dos Pneus:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Diant. Esq.', val: tireFrontLeft, set: setTireFrontLeft },
                      { label: 'Diant. Dir.', val: tireFrontRight, set: setTireFrontRight },
                      { label: 'Tras. Esq.', val: tireRearLeft, set: setTireRearLeft },
                      { label: 'Tras. Dir.', val: tireRearRight, set: setTireRearRight },
                    ].map(t => (
                      <div
                        key={t.label}
                        className="rounded-xl bg-wr-surface p-2 border border-wr-border space-y-1.5"
                      >
                        <span className="text-[10px] font-bold text-wr-text block text-center">
                          {t.label}
                        </span>
                        <div className="grid grid-cols-3 gap-1">
                          {(['bom', 'regular', 'ruim'] as TireCondition[]).map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => t.set(c)}
                              className={`py-1 rounded text-[9px] font-bold uppercase transition-colors ${
                                t.val === c
                                  ? c === 'bom'
                                    ? 'bg-emerald-600 text-white'
                                    : c === 'regular'
                                    ? 'bg-amber-500 text-white dark:text-black'
                                    : 'bg-rose-500 text-white'
                                  : 'bg-wr-elevated text-wr-muted'
                              }`}
                            >
                              {c === 'bom' ? 'Bom' : c === 'regular' ? 'Reg' : 'Ruim'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={checklist.bodyworkDamages || ''}
                  onChange={e =>
                    setChecklist(prev => ({ ...prev, bodyworkDamages: e.target.value }))
                  }
                  placeholder="Observação rápida de riscos, arranhões ou amassados (opcional)..."
                  className="wr-input bg-wr-surface"
                />
              </div>

              {/* 3. SERVIÇO, MECÂNICO & PAGAMENTO (COM PAGAR DEPOIS) */}
              <div className="wr-surface-muted p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-wr-orange block">
                  Serviço, Responsável &amp; Pagamento
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">
                      Serviço Principal *
                    </label>
                    <input
                      type="text"
                      required
                      value={mainServiceDesc}
                      onChange={e => setMainServiceDesc(e.target.value)}
                      placeholder="Ex: Revisão e troca de freios"
                      className="wr-input bg-wr-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">Mecânico</label>
                    <select
                      value={mechanicAssigned}
                      onChange={e => setMechanicAssigned(e.target.value)}
                      className="wr-input bg-wr-surface"
                    >
                      {MECHANICS_LIST.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="wr-input bg-wr-surface"
                    >
                      <option value="pix">Pix</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="pagar_depois">Pagar Depois (A Prazo)</option>
                    </select>
                  </div>
                </div>

                {paymentMethod === 'pagar_depois' && (
                  <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Wallet className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-semibold text-wr-text">
                        Esta OS será lançada automaticamente na aba <strong>Pagar Depois</strong>.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-wr-muted whitespace-nowrap">
                        Combinado para:
                      </label>
                      <input
                        type="date"
                        value={paymentDueDate}
                        onChange={e => setPaymentDueDate(e.target.value)}
                        className="wr-input bg-wr-surface font-mono w-auto"
                      />
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  placeholder="Observações gerais do cliente (opcional)..."
                  className="wr-input bg-wr-surface"
                />
              </div>

              {/* 4. ITENS & VALORES */}
              <div className="wr-surface-muted p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-wr-orange">
                    Itens de Serviço &amp; Peças
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Total: {formatCurrency(totalSum)}
                  </span>
                </div>

                <div className="rounded-xl bg-wr-surface p-3 border border-wr-orange/35 space-y-2 relative">
                  <span className="text-[11px] font-semibold text-wr-orange flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Digite para autocompletar ou lance um valor:
                  </span>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-5 relative">
                      <input
                        type="text"
                        placeholder="Descrição do serviço..."
                        value={newItemDesc}
                        onFocus={() => setShowSuggestions(true)}
                        onChange={e => {
                          setNewItemDesc(e.target.value)
                          setShowSuggestions(true)
                        }}
                        className="wr-input"
                      />
                      {showSuggestions &&
                        newItemDesc.trim().length > 0 &&
                        filteredSuggestions.length > 0 && (
                          <div className="absolute left-0 top-full mt-1 w-full max-h-44 overflow-y-auto rounded-xl border border-wr-border bg-wr-surface p-1 shadow-elevated z-30">
                            {filteredSuggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSuggestion(sug)}
                                className="w-full text-left p-2 rounded-lg hover:bg-wr-elevated flex items-center justify-between gap-2 text-xs"
                              >
                                <span className="font-semibold text-wr-text truncate">
                                  {sug.name}
                                </span>
                                <span className="font-mono text-[10px] text-wr-orange shrink-0">
                                  {formatCurrency(sug.partsCost + sug.laborCost)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="col-span-5 sm:col-span-3">
                      <input
                        type="number"
                        placeholder="R$ Peças"
                        value={newItemParts || ''}
                        onChange={e => setNewItemParts(Number(e.target.value))}
                        className="wr-input font-mono"
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-3">
                      <input
                        type="number"
                        placeholder="R$ Mão de Obra"
                        value={newItemLabor || ''}
                        onChange={e => setNewItemLabor(Number(e.target.value))}
                        className="wr-input font-mono"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="wr-btn-primary w-full h-full px-0"
                        title="Adicionar item"
                      >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

                {serviceItems.length > 0 && (
                  <div className="rounded-xl border border-wr-border overflow-hidden bg-wr-surface">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-wr-elevated text-wr-muted border-b border-wr-border">
                        <tr>
                          <th className="py-2 px-3">Serviço</th>
                          <th className="py-2 px-3 text-right">Peças</th>
                          <th className="py-2 px-3 text-right">M. Obra</th>
                          <th className="py-2 px-3 text-right">Total</th>
                          <th className="py-2 px-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wr-border text-wr-text">
                        {serviceItems.map(it => (
                          <tr key={it.id}>
                            <td className="py-2 px-3 font-medium">{it.serviceDescription}</td>
                            <td className="py-2 px-3 font-mono text-right text-wr-muted">
                              {formatCurrency(it.partsCost)}
                            </td>
                            <td className="py-2 px-3 font-mono text-right text-wr-muted">
                              {formatCurrency(it.laborCost)}
                            </td>
                            <td className="py-2 px-3 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(it.total)}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(it.id)}
                                className="text-rose-500 hover:opacity-75"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button type="submit" className="wr-btn-primary flex-1 py-3">
                  Salvar Ordem de Serviço
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
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
