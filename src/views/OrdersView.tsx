import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ServiceOrder, FuelStatus, TireCondition, OrderItem, OrderStatus, VehicleInspectionChecklist } from '../types'
import { generateOsCanvas, DEFAULT_WORKSHOP_INFO } from '../utils/osImageGenerator'
import { DanfseModal } from '../components/DanfseModal'
import {
  ClipboardList,
  Search,
  Plus,
  Car,
  User,
  Phone,
  Gauge,
  Fuel,
  Disc,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  FileText,
  Printer,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  DollarSign,
  Download,
  Copy,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Square,
  Wrench,
  FileCheck2,
  FileSpreadsheet
} from 'lucide-react'

// Pre-registered catalog of common services with default parts & labor costs
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
  { name: 'Limpeza de Bicos Injetores e Corpo de Borboleta (TBI)', partsCost: 60, laborCost: 190 },
  { name: 'Substituição de Embreagem Completa', partsCost: 650, laborCost: 450 }
]

export const OrdersView: React.FC = () => {
  const { 
    orders, 
    addOrder, 
    updateOrder, 
    updateOrderStatus, 
    issueFiscalInvoice,
    fiscalSettings,
    formatCurrency, 
    sendWhatsApp,
    isNewOrderModalOpen,
    setIsNewOrderModalOpen
  } = useApp()

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')

  // Selected Order for Details Drawer & PDF Modal & WhatsApp Image Modal & Fiscal Modal
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
  const [pdfModalOrder, setPdfModalOrder] = useState<ServiceOrder | null>(null)
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<ServiceOrder | null>(null)
  const [danfseModalOrder, setDanfseModalOrder] = useState<ServiceOrder | null>(null)

  // WhatsApp Image Generator State
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('')
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false)

  // Mechanic options
  const mechanicsList = ['Roberto Silva', 'Carlos Eduardo', 'Marcos Mecânico', 'Lucas Ferreira']

  // ===================== NEW OS FORM STATE =====================
  const [clientName, setClientName] = useState('Marcos Oliveira')
  const [clientPhone, setClientPhone] = useState('(63) 99234-5678')
  const [clientCpfCnpj, setClientCpfCnpj] = useState('482.910.458-20')
  const [vehicleModel, setVehicleModel] = useState('Honda Civic Touring')
  const [vehiclePlate, setVehiclePlate] = useState('QWE1A23')
  const [mileage, setMileage] = useState<number>(48500)
  
  // Fuel buttons: reserva, medio, cheio
  const [fuelLevel, setFuelLevel] = useState<FuelStatus>('medio')

  // Tires state: 4 tires with condition
  const [tireFrontLeft, setTireFrontLeft] = useState<TireCondition>('bom')
  const [tireFrontRight, setTireFrontRight] = useState<TireCondition>('bom')
  const [tireRearLeft, setTireRearLeft] = useState<TireCondition>('regular')
  const [tireRearRight, setTireRearRight] = useState<TireCondition>('regular')

  // ===================== CHECKLIST VEICULAR PROFISSIONAL (SEM FOTOS / LEVE) =====================
  const [spareTire, setSpareTire] = useState(true)
  const [jack, setJack] = useState(true)
  const [wheelWrench, setWheelWrench] = useState(true)
  const [triangle, setTriangle] = useState(true)
  const [vehicleDocuments, setVehicleDocuments] = useState(true)

  const [headlights, setHeadlights] = useState<'ok' | 'defeito'>('ok')
  const [taillights, setTaillights] = useState<'ok' | 'defeito'>('ok')
  const [turnSignals, setTurnSignals] = useState<'ok' | 'defeito'>('ok')
  const [brakeLights, setBrakeLights] = useState<'ok' | 'defeito'>('ok')
  const [airConditioning, setAirConditioning] = useState<'ok' | 'defeito'>('ok')
  const [wipers, setWipers] = useState<'ok' | 'defeito'>('ok')

  const [oilLevel, setOilLevel] = useState<'normal' | 'baixo'>('normal')
  const [coolantLevel, setCoolantLevel] = useState<'normal' | 'baixo'>('normal')
  const [brakeFluid, setBrakeFluid] = useState<'normal' | 'baixo'>('normal')

  const [bodyworkDamages, setBodyworkDamages] = useState<string>('Pequeno risco no para-choque dianteiro')

  // Service main description & mechanic
  const [mainServiceDesc, setMainServiceDesc] = useState('Revisão Preventiva e Troca de Freios')
  const [mechanicAssigned, setMechanicAssigned] = useState('Roberto Silva')
  const [observations, setObservations] = useState('Cliente solicitou verificação de ruído ao frear.')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro'>('pix')

  // Table of Services with partsCost & laborCost
  const [serviceItems, setServiceItems] = useState<OrderItem[]>([
    {
      id: 'item-1',
      serviceDescription: 'Troca de pastilhas de freio dianteiras',
      partsCost: 185.00,
      laborCost: 150.00,
      total: 335.00,
      serviceCode: '14.01',
      cnae: '4520-0/01'
    },
    {
      id: 'item-2',
      serviceDescription: 'Sangria de fluido DOT 4 e alinhamento',
      partsCost: 90.00,
      laborCost: 120.00,
      total: 210.00,
      serviceCode: '14.01',
      cnae: '4520-0/01'
    }
  ])

  // New row inputs inside table (first / top input)
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemParts, setNewItemParts] = useState<number>(0)
  const [newItemLabor, setNewItemLabor] = useState<number>(0)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

  // Calculations in real time
  const partsSum = serviceItems.reduce((acc, it) => acc + (Number(it.partsCost) || 0), 0)
  const laborSum = serviceItems.reduce((acc, it) => acc + (Number(it.laborCost) || 0), 0)
  const totalSum = partsSum + laborSum

  // Filter autocomplete suggestions based on what user is typing
  const filteredSuggestions = PRE_REGISTERED_SERVICES.filter(s => 
    s.name.toLowerCase().includes(newItemDesc.toLowerCase())
  )

  const handleSelectSuggestion = (service: typeof PRE_REGISTERED_SERVICES[0]) => {
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
      serviceDescription: newItemDesc,
      partsCost: pCost,
      laborCost: lCost,
      total: pCost + lCost,
      serviceCode: '14.01',
      cnae: '4520-0/01'
    }
    setServiceItems(prev => [item, ...prev])
    setNewItemDesc('')
    setNewItemParts(0)
    setNewItemLabor(0)
    setShowSuggestions(false)
  }

  const handleRemoveItem = (id: string) => {
    setServiceItems(prev => prev.filter(i => i.id !== id))
  }

  // Handle WhatsApp Image Modal open & canvas render
  useEffect(() => {
    if (whatsAppModalOrder) {
      setGeneratedImageUrl('')
      setImageBlob(null)
      setCopyFeedback(false)
      generateOsCanvas(whatsAppModalOrder, DEFAULT_WORKSHOP_INFO).then(canvas => {
        canvas.toBlob(blob => {
          if (blob) {
            setImageBlob(blob)
            setGeneratedImageUrl(URL.createObjectURL(blob))
          }
        }, 'image/png')
      })
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
          text: `Olá ${whatsAppModalOrder.clientName}, segue o comprovante da sua Ordem de Serviço na WR Mecânica & Cia.`
        })
        return
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share was not completed, using fallback', err)
        } else {
          return
        }
      }
    }

    await handleCopyAndOpenWhatsApp()
  }

  const handleCopyAndOpenWhatsApp = async () => {
    if (!whatsAppModalOrder) return

    try {
      if (imageBlob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': imageBlob })
        ])
        setCopyFeedback(true)
      }
    } catch (err) {
      console.warn('Clipboard write failed, downloading image instead', err)
    }

    const cleanNumber = whatsAppModalOrder.clientPhone.replace(/\D/g, '')
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
    const url = `https://wa.me/${fullNumber}`
    window.open(url, '_blank')
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
    if (!clientName || !clientPhone || !vehicleModel) {
      alert('Preencha os campos obrigatórios do cliente e veículo.')
      return
    }

    const inspectionData: VehicleInspectionChecklist = {
      spareTire,
      jack,
      wheelWrench,
      triangle,
      vehicleDocuments,
      headlights,
      taillights,
      turnSignals,
      brakeLights,
      airConditioning,
      wipers,
      oilLevel,
      coolantLevel,
      brakeFluid,
      bodyworkDamages: bodyworkDamages ? [bodyworkDamages] : []
    }

    addOrder({
      clientId: `cli-${Date.now()}`,
      clientName,
      clientPhone,
      clientCpfCnpj,
      vehicleModel,
      vehiclePlate: vehiclePlate.toUpperCase() || 'SEM PLACA',
      mileage: Number(mileage) || 0,
      fuelLevel,
      tires: {
        frontLeft: tireFrontLeft,
        frontRight: tireFrontRight,
        rearLeft: tireRearLeft,
        rearRight: tireRearRight
      },
      inspection: inspectionData,
      mechanicAssigned,
      serviceDescription: mainServiceDesc,
      items: serviceItems.length > 0 ? serviceItems : [
        {
          id: `item-${Date.now()}`,
          serviceDescription: mainServiceDesc || 'Serviço Geral',
          partsCost: 0,
          laborCost: 150.00,
          total: 150.00,
          serviceCode: '14.01',
          cnae: '4520-0/01'
        }
      ],
      observations,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'aguardando',
      paymentMethod,
      warranty: {
        days: 90,
        expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        coverage: '90 dias de garantia legal para mão de obra conforme Art. 26 do CDC.',
        status: 'vigente'
      },
      partsTotal: partsSum,
      laborTotal: laborSum,
      totalAmount: totalSum
    })

    setIsNewOrderModalOpen(false)
  }

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.vehiclePlate?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.vehicleModel?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.serviceDescription?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.mechanicAssigned?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.fiscalInvoice?.invoiceNumber || '').includes(searchTerm)
    
    const matchesFilter = filterStatus === 'todos' || o.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Status Badges
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'aguardando':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#202020] text-[#A5A5A5] border border-[#262626]">
            <Clock className="h-3 w-3 text-amber-400" />
            Aguardando ser feito
          </span>
        )
      case 'andamento':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF8500]/15 text-[#FF8500] border border-[#FF8500]/40">
            <span className="h-2 w-2 rounded-full bg-[#FF8500] animate-pulse" />
            Em andamento
          </span>
        )
      case 'pronto':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Pronto / Concluído
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#202020] text-[#A5A5A5]">
            Cancelado
          </span>
        )
    }
  }

  // Helper for fuel display
  const getFuelBadge = (level: FuelStatus) => {
    switch (level) {
      case 'reserva':
        return <span className="font-bold text-rose-400">Reserva</span>
      case 'medio':
        return <span className="font-bold text-amber-400">Médio</span>
      case 'cheio':
        return <span className="font-bold text-emerald-400">Cheio</span>
      default:
        return <span>Médio</span>
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-[1440px] mx-auto select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#FFFFFF] flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#FF8500]" strokeWidth={1.75} />
            Ordens de Serviço &amp; Emissão Fiscal (NFS-e)
          </h2>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Gerenciamento automotivo, checklist de entrada sem fotos (otimizado para banco), garantia legal de 90 dias e emissão de NFS-e com validade fiscal
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] px-5 py-2.5 text-xs font-bold text-[#080808] transition-colors shadow-md"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" strokeWidth={2.5} />
          Nova Ordem de Serviço
        </button>
      </div>

      {/* 1. CAMPO DE BUSCA ANTES DOS FILTROS */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A5A5A5]" strokeWidth={1.75} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, veículo, placa, mecânico, número da OS ou número da NFS-e..."
            className="w-full rounded-2xl border border-[#262626] bg-[#151515]/90 py-3 pl-11 pr-4 text-xs text-[#FFFFFF] placeholder-[#A5A5A5] focus:border-[#FF8500] focus:outline-none transition-all shadow-md"
          />
        </div>

        {/* 2. FILTROS DE STATUS */}
        <div className="flex items-center gap-2 bg-[#151515] p-1.5 rounded-xl w-fit border border-[#262626]">
          {[
            { id: 'todos', label: 'Todas as Ordens' },
            { id: 'aguardando', label: 'Aguardando ser feito' },
            { id: 'andamento', label: 'Em andamento' },
            { id: 'pronto', label: 'Pronto / Concluído' }
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
      </div>

      {/* 3. GRID DE CARDS DE OS */}
      <div className="grid grid-cols-2 gap-5">
        {filteredOrders.map(order => {
          const hasFiscal = order.fiscalInvoice && order.fiscalInvoice.status === 'autorizada'
          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-6 shadow-xl hover:border-[#FF8500]/60 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Number, Date, Status & Fiscal Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#FF8500] bg-[#202020] px-2.5 py-1 rounded-lg border border-[#262626]">
                      {order.number}
                    </span>
                    <span className="text-[11px] text-[#A5A5A5]">{order.date}</span>
                    
                    {/* Validade Fiscal Indicator */}
                    {hasFiscal ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
                        <ShieldCheck className="h-3 w-3" /> NFS-e #{order.fiscalInvoice?.invoiceNumber}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#202020] border border-[#262626] px-2 py-0.5 text-[10px] text-[#A5A5A5]">
                        NFS-e Pendente
                      </span>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Nome do Cliente & Carro (com Placa) */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#FF8500]" strokeWidth={1.75} />
                      <h3 className="text-sm font-bold text-[#FFFFFF] group-hover:text-[#FF8500] transition-colors">
                        {order.clientName}
                      </h3>
                    </div>
                    {order.warranty && (
                      <span className="text-[10px] text-[#E5A51B] font-semibold bg-[#202020] px-2 py-0.5 rounded border border-[#E5A51B]/30">
                        Garantia 90D ✓
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#E5A51B] font-semibold pl-6">
                    <Car className="h-3.5 w-3.5 text-[#E5A51B]" strokeWidth={1.75} />
                    <span>{order.vehicleModel}</span>
                    <span className="bg-[#202020] px-2 py-0.5 rounded text-[11px] font-mono text-[#FFFFFF] border border-[#262626]">
                      {order.vehiclePlate}
                    </span>
                  </div>

                  {/* KM e Gasolina em letras menores */}
                  <div className="flex items-center gap-4 text-[11px] text-[#A5A5A5] pl-6 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Gauge className="h-3 w-3 text-[#A5A5A5]" strokeWidth={1.75} />
                      {Number(order.mileage).toLocaleString('pt-BR')} km
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3 text-[#A5A5A5]" strokeWidth={1.75} />
                      Gasolina: {getFuelBadge(order.fuelLevel)}
                    </span>
                    {order.paymentMethod && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold uppercase text-[10px]">
                          {order.paymentMethod.replace('_', ' ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Serviço a ser feito */}
                <div className="mt-4 rounded-xl bg-[#202020]/70 p-3.5 border border-[#262626] text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A5A5] block">
                    Serviço a Realizar
                  </span>
                  <p className="text-[#FFFFFF] font-semibold mt-0.5 line-clamp-2">
                    {order.serviceDescription}
                  </p>
                </div>

                {/* Atribuir quem vai fazer (Mecânico) */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[#A5A5A5]">Mecânico responsável:</span>
                  <span className="font-bold text-[#FFFFFF] bg-[#202020] px-2.5 py-1 rounded-lg border border-[#262626]">
                    {order.mechanicAssigned || 'Roberto Silva'}
                  </span>
                </div>

                {/* Valores de Peças, Mão de Obra e Total */}
                <div className="mt-4 pt-3 border-t border-[#262626] grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-[#202020] p-2">
                    <span className="text-[10px] text-[#A5A5A5] block">Peças</span>
                    <span className="font-mono font-bold text-[#FFFFFF]">
                      {formatCurrency(order.partsTotal || 0)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-[#202020] p-2">
                    <span className="text-[10px] text-[#A5A5A5] block">Mão de Obra (ISS)</span>
                    <span className="font-mono font-bold text-[#FFFFFF]">
                      {formatCurrency(order.laborTotal || 0)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-[#FF8500]/10 border border-[#FF8500]/30 p-2">
                    <span className="text-[10px] text-[#FF8500] font-bold block">Total da OS</span>
                    <span className="font-mono font-bold text-[#FF8500]">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação no Card */}
              <div className="mt-5 pt-3 border-t border-[#262626] flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                {/* Botão de Validade Fiscal / NFS-e */}
                {hasFiscal ? (
                  <button
                    onClick={() => setDanfseModalOrder(order)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
                    title="Visualizar Nota Fiscal de Serviço Eletrônica Oficial"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Ver NFS-e</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      issueFiscalInvoice(order.id)
                      alert(`NFS-e emitida com sucesso com validade fiscal municipal! Código de verificação e protocolo gerados.`)
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#262626] bg-[#202020] py-2.5 text-xs font-bold text-[#FFFFFF] hover:border-[#FF8500] transition-colors"
                    title="Emitir Nota Fiscal com Validade Jurídica"
                  >
                    <FileCheck2 className="h-4 w-4 text-[#FF8500]" />
                    <span>Emitir NFS-e</span>
                  </button>
                )}

                {/* Botão para enviar IMAGEM PERSONALIZADA da OS no WhatsApp */}
                <button
                  onClick={() => setWhatsAppModalOrder(order)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
                  title="Enviar Imagem da OS Personalizada no WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                  <span>WhatsApp</span>
                </button>

                {/* Botão gerar Comprovante / PDF */}
                <button
                  onClick={() => setPdfModalOrder(order)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#FF8500]/40 bg-[#FF8500]/10 py-2.5 text-xs font-bold text-[#FF8500] hover:bg-[#FF8500] hover:text-[#080808] transition-colors"
                >
                  <FileText className="h-4 w-4" strokeWidth={1.75} />
                  <span>Comprovante</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ===================== MODAL: WHATSAPP IMAGEM PERSONALIZADA DA OS ===================== */}
      {whatsAppModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md select-none">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#262626] bg-[#121316] p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-[#FFFFFF]">Enviar Imagem Personalizada da OS via WhatsApp</h3>
                  <p className="text-[11px] text-[#A5A5A5]">Imagem gerada com a logo, CNPJ e detalhamento da oficina para o cliente</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalOrder(null)}
                className="rounded-full p-1 text-[#A5A5A5] hover:text-[#FFFFFF]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-emerald-400">Compartilhamento Direto da Imagem Personalizada</p>
                <p className="text-[11px] text-[#A5A5A5] leading-relaxed">
                  Ao clicar em <strong>"Compartilhar Imagem Direto"</strong>, o sistema abre o menu nativo de compartilhamento com o arquivo da imagem anexado para envio direto ao WhatsApp sem copiar!
                </p>
              </div>
            </div>

            {copyFeedback && (
              <div className="rounded-xl bg-emerald-500 text-black p-3 font-bold text-xs flex items-center justify-between animate-fadeIn">
                <span>✓ Imagem copiada com sucesso! No WhatsApp, basta pressionar Ctrl+V para colar a imagem.</span>
              </div>
            )}

            <div className="rounded-2xl border border-[#262626] bg-[#080808] p-3 text-center flex flex-col items-center justify-center max-h-[460px] overflow-y-auto shadow-inner">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="OS Personalizada WR Mecânica"
                  className="rounded-xl shadow-2xl max-w-full h-auto border border-[#262626]"
                />
              ) : (
                <div className="py-16 text-[#A5A5A5] flex flex-col items-center gap-2">
                  <div className="h-6 w-6 border-2 border-[#FF8500] border-t-transparent rounded-full animate-spin" />
                  <span>Gerando imagem personalizada de alta resolução...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDirectShare}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-bold text-black transition-colors shadow-lg"
              >
                <ExternalLink className="h-4 w-4" />
                Compartilhar Imagem Direto (WhatsApp)
              </button>

              <button
                type="button"
                onClick={handleCopyAndOpenWhatsApp}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                title="Copiar imagem e abrir conversa no navegador"
              >
                <Copy className="h-4 w-4" />
                Copiar Imagem
              </button>

              <button
                type="button"
                onClick={handleDownloadImage}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#262626] bg-[#202020] px-4 py-3 text-xs font-semibold text-[#FFFFFF] hover:border-[#FF8500] transition-colors"
                title="Baixar imagem no computador"
              >
                <Download className="h-4 w-4 text-[#FF8500]" />
                Baixar PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: DETALHES DA OS (AO CLICAR NO CARD) ===================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md select-none">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#262626] bg-[#151515] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
              <div>
                <span className="font-mono text-xs font-bold text-[#FF8500] bg-[#202020] px-2.5 py-1 rounded-lg border border-[#262626]">
                  {selectedOrder.number}
                </span>
                <h3 className="text-lg font-bold text-[#FFFFFF] mt-1">Detalhes da Ordem de Serviço</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-1.5 text-[#A5A5A5] hover:text-[#FFFFFF] hover:bg-[#202020]"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            {/* SEÇÃO FISCAL: EMISSÃO DE NFS-E COM VALIDADE JURÍDICA */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Validade Fiscal • Nota Fiscal de Serviços (NFS-e)
                </span>
                {selectedOrder.fiscalInvoice?.status === 'autorizada' ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black font-bold text-[10px]">
                    NFS-e AUTORIZADA
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px]">
                    NÃO EMITIDA
                  </span>
                )}
              </div>

              {selectedOrder.fiscalInvoice?.status === 'autorizada' ? (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-3 bg-[#151515] p-3 rounded-xl border border-[#262626]">
                    <div>
                      <span className="text-[#A5A5A5] text-[10px] block">Nº da Nota Fiscal:</span>
                      <strong className="text-[#FFFFFF] font-mono">{selectedOrder.fiscalInvoice.invoiceNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[#A5A5A5] text-[10px] block">Código de Autenticidade:</span>
                      <strong className="text-emerald-400 font-mono">{selectedOrder.fiscalInvoice.verificationCode}</strong>
                    </div>
                    <div>
                      <span className="text-[#A5A5A5] text-[10px] block">Protocolo de Autorização:</span>
                      <strong className="text-[#A5A5A5] font-mono text-[11px]">{selectedOrder.fiscalInvoice.protocolNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[#A5A5A5] text-[10px] block">ISSQN Apurado:</span>
                      <strong className="text-[#FFFFFF] font-mono">{formatCurrency(selectedOrder.fiscalInvoice.issValue)} (2.5%)</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setDanfseModalOrder(selectedOrder)
                      }}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    >
                      <FileCheck2 className="h-4 w-4" /> Visualizar Espelho da NFS-e (DANFSE Oficial)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <p className="text-[#A5A5A5] text-[11px]">
                    A emissão da NFS-e gera o documento eletrônico com chave de acesso e código de autenticidade da Prefeitura para comprovação fiscal e contábil.
                  </p>
                  <button
                    onClick={() => {
                      const inv = issueFiscalInvoice(selectedOrder.id)
                      if (inv) {
                        setSelectedOrder(prev => prev ? { ...prev, fiscalInvoice: inv } : null)
                        alert('NFS-e autorizada com sucesso pela Prefeitura! Código de autenticidade gerado.')
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] text-[#080808] font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <ShieldCheck className="h-4 w-4" /> Emitir NFS-e Oficial Agora
                  </button>
                </div>
              )}
            </div>

            {/* DEFINIR STATUS DO SERVIÇO */}
            <div className="rounded-2xl border border-[#262626] bg-[#202020] p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A5A5A5] block">
                Definir Status do Serviço:
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'aguardando')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedOrder.status === 'aguardando'
                      ? 'bg-amber-500 text-black border-amber-500 shadow-lg'
                      : 'bg-[#151515] text-[#A5A5A5] border-[#262626] hover:text-[#FFFFFF]'
                  }`}
                >
                  Aguardando ser feito
                </button>
                <button
                  type="button"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'andamento')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedOrder.status === 'andamento'
                      ? 'bg-[#FF8500] text-[#080808] border-[#FF8500] shadow-lg'
                      : 'bg-[#151515] text-[#A5A5A5] border-[#262626] hover:text-[#FFFFFF]'
                  }`}
                >
                  Em andamento
                </button>
                <button
                  type="button"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'pronto')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedOrder.status === 'pronto'
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg'
                      : 'bg-[#151515] text-[#A5A5A5] border-[#262626] hover:text-[#FFFFFF]'
                  }`}
                >
                  Pronto (Concluído)
                </button>
              </div>
            </div>

            {/* CHECKLIST DE INSPEÇÃO VEICULAR REGISTRADO (SEM FOTOS / LEVE) */}
            {selectedOrder.inspection && (
              <div className="rounded-2xl border border-[#262626] bg-[#202020] p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF8500] flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4" /> Checklist de Entrada &amp; Inspeção Veicular
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-[#151515] p-3 border border-[#262626] space-y-1">
                    <span className="text-[10px] text-[#A5A5A5] uppercase font-bold block">Pertences &amp; Itens Obrigatórios:</span>
                    <p className="text-[11px] text-[#FFFFFF] space-y-0.5">
                      <span>• Estepe: <strong>{selectedOrder.inspection.spareTire ? 'Presente ✓' : 'Ausente'}</strong></span><br />
                      <span>• Macaco &amp; Chave: <strong>{selectedOrder.inspection.jack ? 'Presentes ✓' : 'Ausentes'}</strong></span><br />
                      <span>• Triângulo: <strong>{selectedOrder.inspection.triangle ? 'Presente ✓' : 'Ausente'}</strong></span><br />
                      <span>• Documento no Carro: <strong>{selectedOrder.inspection.vehicleDocuments ? 'Sim ✓' : 'Não'}</strong></span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#151515] p-3 border border-[#262626] space-y-1">
                    <span className="text-[10px] text-[#A5A5A5] uppercase font-bold block">Luzes &amp; Elétrica:</span>
                    <p className="text-[11px] text-[#FFFFFF] space-y-0.5">
                      <span>• Faróis: <strong>{selectedOrder.inspection.headlights.toUpperCase()}</strong></span><br />
                      <span>• Lanternas / Freio: <strong>{selectedOrder.inspection.taillights.toUpperCase()}</strong></span><br />
                      <span>• Ar Condicionado: <strong>{selectedOrder.inspection.airConditioning.toUpperCase()}</strong></span><br />
                      <span>• Óleo Motor: <strong>{selectedOrder.inspection.oilLevel.toUpperCase()}</strong></span>
                    </p>
                  </div>
                </div>

                {selectedOrder.inspection.bodyworkDamages && selectedOrder.inspection.bodyworkDamages.length > 0 && (
                  <div className="rounded-xl bg-[#151515] p-2.5 border border-[#262626] text-[11px]">
                    <span className="text-[10px] text-amber-400 font-bold block">Avarias pré-existentes registradas:</span>
                    <p className="text-[#A5A5A5] mt-0.5">{selectedOrder.inspection.bodyworkDamages.join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Atribuir Mecânico Responsável */}
            <div className="rounded-2xl border border-[#262626] bg-[#202020] p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#A5A5A5] block">Mecânico Responsável</span>
                <span className="text-sm font-bold text-[#FFFFFF] mt-0.5 block">{selectedOrder.mechanicAssigned}</span>
              </div>
              <select
                value={selectedOrder.mechanicAssigned}
                onChange={e => updateOrder(selectedOrder.id, { mechanicAssigned: e.target.value })}
                className="rounded-xl border border-[#262626] bg-[#151515] px-3 py-2 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
              >
                {mechanicsList.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Tabela de Serviços e Peças da OS */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF8500]">
                Tabela de Serviços Realizados
              </span>
              <div className="rounded-xl border border-[#262626] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#202020] text-[#A5A5A5] border-b border-[#262626]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Serviço</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Peças</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Mão de Obra</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626] text-[#FFFFFF]">
                    {selectedOrder.items?.map(it => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-4">{it.serviceDescription}</td>
                        <td className="py-2.5 px-4 font-mono text-right text-[#A5A5A5]">{formatCurrency(it.partsCost)}</td>
                        <td className="py-2.5 px-4 font-mono text-right text-[#A5A5A5]">{formatCurrency(it.laborCost)}</td>
                        <td className="py-2.5 px-4 font-mono text-right font-bold text-emerald-400">{formatCurrency(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#202020] border-t border-[#262626] font-bold text-xs">
                    <tr>
                      <td className="py-3 px-4 text-[#A5A5A5]">Total Geral da OS</td>
                      <td className="py-3 px-4 font-mono text-right text-[#FFFFFF]">{formatCurrency(selectedOrder.partsTotal || 0)}</td>
                      <td className="py-3 px-4 font-mono text-right text-[#FFFFFF]">{formatCurrency(selectedOrder.laborTotal || 0)}</td>
                      <td className="py-3 px-4 font-mono text-right text-[#FF8500] text-sm font-black">{formatCurrency(selectedOrder.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setWhatsAppModalOrder(selectedOrder)
                  setSelectedOrder(null)
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-bold text-black transition-colors shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar Imagem no WhatsApp
              </button>
              <button
                onClick={() => {
                  setPdfModalOrder(selectedOrder)
                  setSelectedOrder(null)
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] py-3 text-xs font-bold text-[#080808] transition-colors shadow-md"
              >
                <FileText className="h-4 w-4" />
                Visualizar Comprovante / PDF
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 rounded-xl border border-[#262626] bg-[#202020] py-3 text-xs font-semibold text-[#A5A5A5] hover:text-[#FFFFFF]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: COMPROVANTE DA ORDEM DE SERVIÇO (PDF COM VALIDADE FISCAL) ===================== */}
      {pdfModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md select-none">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#262626] bg-[#121316] p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <span className="font-bold text-[#FF8500] uppercase tracking-wider text-xs flex items-center gap-2">
                <FileText className="h-4 w-4" /> Comprovante da Ordem de Serviço &amp; Termo de Garantia
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#202020] border border-[#262626] px-3 py-1.5 font-bold text-[#FFFFFF] hover:border-[#FF8500]"
                >
                  <Printer className="h-3.5 w-3.5 text-[#FF8500]" /> Imprimir / PDF
                </button>
                <button
                  onClick={() => setPdfModalOrder(null)}
                  className="rounded-full p-1 text-[#A5A5A5] hover:text-[#FFFFFF]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* THE PRINTABLE INVOICE / RECEIPT CANVAS */}
            <div id="os-print-preview" className="rounded-2xl border border-[#262626] bg-[#0d0e12] p-6 space-y-5 text-[#FFFFFF]">
              {/* Header: Company & OS Info */}
              <div className="flex items-start justify-between border-b border-[#262626] pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#E5A51B] tracking-wide">WR MECÂNICA &amp; CIA</h2>
                  <p className="text-[11px] text-[#A5A5A5]">Oficina Especializada &amp; Centro Automotivo</p>
                  <p className="text-[10px] text-[#A5A5A5]">CNPJ: 34.892.124/0001-90 • Av. Teotônio Segurado, 1200</p>
                  <p className="text-[10px] text-[#A5A5A5]">WhatsApp: (63) 99234-5678 • Palmas/TO</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-black text-[#FF8500] block">{pdfModalOrder.number}</span>
                  <span className="text-[11px] text-[#A5A5A5] block">Data: {pdfModalOrder.date}</span>
                  {pdfModalOrder.fiscalInvoice?.invoiceNumber ? (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mt-1">
                      NFS-e Nº {pdfModalOrder.fiscalInvoice.invoiceNumber}
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-[#A5A5A5] block mt-1">
                      Status: {pdfModalOrder.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Client & Vehicle Card */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#151515] p-4 border border-[#262626]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#FF8500] block">Dados do Cliente</span>
                  <p className="font-bold text-sm text-[#FFFFFF] mt-0.5">{pdfModalOrder.clientName}</p>
                  <p className="text-[#A5A5A5]">CPF/CNPJ: {pdfModalOrder.clientCpfCnpj || 'Não informado'}</p>
                  <p className="text-[#A5A5A5]">{pdfModalOrder.clientPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#FF8500] block">Dados do Veículo</span>
                  <p className="font-bold text-sm text-[#FFFFFF] mt-0.5">{pdfModalOrder.vehicleModel}</p>
                  <p className="text-[#A5A5A5] font-mono">Placa: {pdfModalOrder.vehiclePlate} • KM: {Number(pdfModalOrder.mileage).toLocaleString('pt-BR')}</p>
                  <p className="text-[#A5A5A5]">Combustível: {pdfModalOrder.fuelLevel.toUpperCase()}</p>
                </div>
              </div>

              {/* Inspection Summary */}
              {pdfModalOrder.inspection && (
                <div className="rounded-xl bg-[#151515] p-3 border border-[#262626] text-[11px] flex items-center justify-between">
                  <span>Itens de Segurança: <strong className="text-emerald-400">Estepe, Macaco e Chave Conferidos ✓</strong></span>
                  <span>Mecânico: <strong className="text-[#FFFFFF]">{pdfModalOrder.mechanicAssigned}</strong></span>
                  <span>Garantia: <strong className="text-[#E5A51B]">90 Dias (CDC)</strong></span>
                </div>
              )}

              {/* Services Table */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#A5A5A5]">Detalhamento de Serviços e Peças</span>
                <table className="w-full text-left text-xs border border-[#262626] rounded-xl overflow-hidden">
                  <thead className="bg-[#151515] text-[#A5A5A5] border-b border-[#262626]">
                    <tr>
                      <th className="p-2.5">Descrição</th>
                      <th className="p-2.5 text-right">Peças</th>
                      <th className="p-2.5 text-right">Mão de Obra</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {pdfModalOrder.items?.map(it => (
                      <tr key={it.id}>
                        <td className="p-2.5 font-medium">{it.serviceDescription}</td>
                        <td className="p-2.5 font-mono text-right text-[#A5A5A5]">{formatCurrency(it.partsCost)}</td>
                        <td className="p-2.5 font-mono text-right text-[#A5A5A5]">{formatCurrency(it.laborCost)}</td>
                        <td className="p-2.5 font-mono text-right font-bold text-emerald-400">{formatCurrency(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#151515] font-bold border-t border-[#262626]">
                    <tr>
                      <td className="p-2.5 text-[#FF8500]">TOTAL GERAL</td>
                      <td className="p-2.5 font-mono text-right">{formatCurrency(pdfModalOrder.partsTotal || 0)}</td>
                      <td className="p-2.5 font-mono text-right">{formatCurrency(pdfModalOrder.laborTotal || 0)}</td>
                      <td className="p-2.5 font-mono text-right text-base text-[#FF8500] font-black">{formatCurrency(pdfModalOrder.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Selo Fiscal & Termos de Garantia */}
              <div className="rounded-xl bg-[#151515] p-3 border border-[#262626] text-[10px] text-[#A5A5A5] space-y-1.5">
                <div className="flex items-center justify-between border-b border-[#262626] pb-1.5">
                  <span className="font-bold text-[#FFFFFF]">Documento com Validade Fiscal e Jurídica</span>
                  {pdfModalOrder.fiscalInvoice?.verificationCode && (
                    <span className="font-mono text-emerald-400">Autenticidade: {pdfModalOrder.fiscalInvoice.verificationCode}</span>
                  )}
                </div>
                <p><strong>Garantia Legal:</strong> 90 (noventa) dias de garantia legal contra defeitos de serviços executados, conforme prevê o Artigo 26, inciso II do Código de Defesa do Consumidor (Lei 8.078/90).</p>
                <p><strong>Observações:</strong> {pdfModalOrder.observations || 'Nenhuma observação informada.'}</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[#262626] text-center text-[10px] text-[#A5A5A5]">
                <div className="border-t border-[#383838] pt-2">
                  <span>Assinatura do Cliente</span>
                </div>
                <div className="border-t border-[#383838] pt-2">
                  <span>WR Mecânica &amp; Cia</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setWhatsAppModalOrder(pdfModalOrder)
                  setPdfModalOrder(null)
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-bold text-black transition-colors shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar Imagem no WhatsApp
              </button>

              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] py-3 text-xs font-bold text-[#080808] transition-colors shadow-lg"
              >
                <Printer className="h-4 w-4" />
                Imprimir / Salvar em PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: DANFSE OFICIAL (NFS-E COM VALIDADE FISCAL) ===================== */}
      {danfseModalOrder && (
        <DanfseModal
          order={danfseModalOrder}
          settings={fiscalSettings}
          onClose={() => setDanfseModalOrder(null)}
        />
      )}

      {/* ===================== MODAL: NOVA ORDEM DE SERVIÇO COMPLETA (SEM FOTOS / LEVE) ===================== */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md select-none">
          <div className="relative w-full max-w-3xl rounded-3xl border border-[#262626] bg-[#121316] p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#FF8500]" />
                <h3 className="text-base font-bold text-[#FFFFFF]">Cadastrar Nova Ordem de Serviço</h3>
              </div>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="rounded-full p-1 text-[#A5A5A5] hover:text-[#FFFFFF]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-5">
              {/* 1. DADOS DO CLIENTE */}
              <div className="rounded-2xl border border-[#262626] bg-[#151515] p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF8500] flex items-center gap-2">
                  <User className="h-4 w-4" /> Dados do Cliente (Necessário para NFS-e)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#A5A5A5] font-semibold mb-1">Nome do Cliente *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="Ex: Marcos Oliveira"
                      className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A5A5A5] font-semibold mb-1">CPF ou CNPJ (para NFS-e) *</label>
                    <input
                      type="text"
                      value={clientCpfCnpj}
                      onChange={e => setClientCpfCnpj(e.target.value)}
                      placeholder="Ex: 482.910.458-20"
                      className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A5A5A5] font-semibold mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="Ex: (63) 99234-5678"
                      className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. DADOS DO VEÍCULO */}
              <div className="rounded-2xl border border-[#262626] bg-[#151515] p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF8500] flex items-center gap-2">
                  <Car className="h-4 w-4" /> Dados do Veículo
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#A5A5A5] font-semibold mb-1">Veículo / Modelo *</label>
                    <input
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      placeholder="Ex: Honda Civic Touring"
                      className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A5A5A5] font-semibold mb-1">Placa do Carro</label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={e => setVehiclePlate(e.target.value)}
                      placeholder="Ex: QWE1A23"
                      className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A5A5A5] font-semibold mb-1">Quilometragem (KM)</label>
                    <input
                      type="number"
                      value={mileage}
                      onChange={e => setMileage(Number(e.target.value))}
                      placeholder="Ex: 48500"
                      className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. GASOLINA: BOTÕES RESERVA, MÉDIO, CHEIO */}
              <div className="rounded-2xl border border-[#262626] bg-[#151515] p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A5A5A5] flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-[#FF8500]" /> Nível de Combustível (Selecione)
                </span>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setFuelLevel('reserva')}
                    className={`py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                      fuelLevel === 'reserva'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                        : 'bg-[#202020] text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    Reserva
                  </button>

                  <button
                    type="button"
                    onClick={() => setFuelLevel('medio')}
                    className={`py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                      fuelLevel === 'medio'
                        ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'bg-[#202020] text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    Médio
                  </button>

                  <button
                    type="button"
                    onClick={() => setFuelLevel('cheio')}
                    className={`py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                      fuelLevel === 'cheio'
                        ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-[#202020] text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    Cheio
                  </button>
                </div>
              </div>

              {/* 4. CHECKLIST VEICULAR PROFISSIONAL (SEM FOTOS - ZERO PESO DE STORAGE) */}
              <div className="rounded-2xl border border-[#262626] bg-[#151515] p-4 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF8500] flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" /> Checklist de Inspeção Veicular de Entrada (Otimizado para Banco)
                </span>

                {/* Pertences do Carro */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#A5A5A5] block">Pertences &amp; Equipamentos no Veículo:</span>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: 'Estepe', state: spareTire, set: setSpareTire },
                      { label: 'Macaco', state: jack, set: setJack },
                      { label: 'Chave Roda', state: wheelWrench, set: setWheelWrench },
                      { label: 'Triângulo', state: triangle, set: setTriangle },
                      { label: 'Documento', state: vehicleDocuments, set: setVehicleDocuments },
                    ].map(item => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => item.set(!item.state)}
                        className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-between ${
                          item.state
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-[#202020] text-[#A5A5A5] border-[#262626]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span>{item.state ? '✓' : '✗'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Luzes e Elétrica */}
                <div className="space-y-2 pt-2 border-t border-[#262626]">
                  <span className="text-[11px] font-bold text-[#A5A5A5] block">Inspeção de Luzes e Elétrica:</span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Faróis', val: headlights, set: setHeadlights },
                      { label: 'Lanternas Traseiras', val: taillights, set: setTaillights },
                      { label: 'Setas / Pisca', val: turnSignals, set: setTurnSignals },
                      { label: 'Luz de Freio', val: brakeLights, set: setBrakeLights },
                      { label: 'Ar Condicionado', val: airConditioning, set: setAirConditioning },
                      { label: 'Limpador Para-brisa', val: wipers, set: setWipers },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl bg-[#202020] p-2.5 border border-[#262626] flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#FFFFFF]">{item.label}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => item.set('ok')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.val === 'ok' ? 'bg-emerald-500 text-black' : 'bg-[#151515] text-[#A5A5A5]'
                            }`}
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => item.set('defeito')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.val === 'defeito' ? 'bg-rose-500 text-white' : 'bg-[#151515] text-[#A5A5A5]'
                            }`}
                          >
                            Defeito
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estado dos 4 Pneus */}
                <div className="space-y-2 pt-2 border-t border-[#262626]">
                  <span className="text-[11px] font-bold text-[#A5A5A5] block">Estado dos Pneus:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'DE (Diant. Esq.)', val: tireFrontLeft, set: setTireFrontLeft },
                      { label: 'DD (Diant. Dir.)', val: tireFrontRight, set: setTireFrontRight },
                      { label: 'TE (Tras. Esq.)', val: tireRearLeft, set: setTireRearLeft },
                      { label: 'TD (Tras. Dir.)', val: tireRearRight, set: setTireRearRight },
                    ].map(t => (
                      <div key={t.label} className="rounded-xl bg-[#202020] p-2 border border-[#262626] space-y-1">
                        <span className="text-[10px] font-bold text-[#FFFFFF] block text-center">{t.label}</span>
                        <div className="grid grid-cols-3 gap-1">
                          {(['bom', 'regular', 'ruim'] as TireCondition[]).map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => t.set(c)}
                              className={`py-1 rounded text-[9px] font-bold uppercase transition-all ${
                                t.val === c
                                  ? c === 'bom' ? 'bg-emerald-500 text-black' : c === 'regular' ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white'
                                  : 'bg-[#151515] text-[#A5A5A5]'
                              }`}
                            >
                              {c[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avarias Lataria Pré-existentes */}
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Avarias Pré-existentes na Lataria (Opcional):</label>
                  <input
                    type="text"
                    value={bodyworkDamages}
                    onChange={e => setBodyworkDamages(e.target.value)}
                    placeholder="Ex: Pequeno arranhão para-choque diant. dir., porta com mossa leve..."
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  />
                </div>
              </div>

              {/* 5. SERVIÇO A REALIZAR, MECÂNICO E PAGAMENTO */}
              <div className="rounded-2xl border border-[#262626] bg-[#151515] p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF8500]">
                  Diagnóstico e Responsável Técnico
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#A5A5A5] font-semibold mb-1">Serviço Principal *</label>
                    <input
                      type="text"
                      required
                      value={mainServiceDesc}
                      onChange={e => setMainServiceDesc(e.target.value)}
                      placeholder="Ex: Troca de pastilhas de freio e sangria"
                      className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A5A5A5] font-semibold mb-1">Mecânico Atribuído</label>
                    <select
                      value={mechanicAssigned}
                      onChange={e => setMechanicAssigned(e.target.value)}
                      className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    >
                      {mechanicsList.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#A5A5A5] font-semibold mb-1">Forma de Pagamento</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as any)}
                      className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    >
                      <option value="pix">Pix (Chave / QR Code)</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="dinheiro">Dinheiro em Espécie</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Observações do Cliente</label>
                  <textarea
                    rows={2}
                    value={observations}
                    onChange={e => setObservations(e.target.value)}
                    placeholder="Particularidades do veículo relatadas pelo cliente..."
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  />
                </div>
              </div>

              {/* 6. TABELA COM SERVIÇOS - CAMPO DE ADICIONAR NO TOPO COM AUTOCOMPLETE AUTOMÁTICO */}
              <div className="rounded-2xl border border-[#262626] bg-[#151515] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF8500]">
                    Tabela de Serviços e Valores (Cálculo em Tempo Real)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Total Acumulado: {formatCurrency(totalSum)}
                  </span>
                </div>

                {/* CAMPO DE ADICIONAR NO TOPO COM AUTOCOMPLETE */}
                <div className="rounded-xl bg-[#202020] p-3.5 border border-[#FF8500]/40 space-y-2 relative shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#FF8500] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#FF8500]" />
                      Adicionar Serviço (Digite para auto-completar nome e valores):
                    </span>
                    <span className="text-[10px] text-[#A5A5A5]">Sugestões automáticas do catálogo</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 relative">
                    <div className="col-span-5 relative">
                      <input
                        type="text"
                        placeholder="Digite o nome do serviço..."
                        value={newItemDesc}
                        onFocus={() => setShowSuggestions(true)}
                        onChange={e => {
                          setNewItemDesc(e.target.value)
                          setShowSuggestions(true)
                        }}
                        className="w-full rounded-lg border border-[#262626] bg-[#151515] p-2 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                      />

                      {showSuggestions && newItemDesc.trim().length > 0 && filteredSuggestions.length > 0 && (
                        <div className="absolute left-0 top-full mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-[#262626] bg-[#151515] p-1.5 shadow-2xl z-30 space-y-1">
                          {filteredSuggestions.map((sug, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectSuggestion(sug)}
                              className="p-2 rounded-lg hover:bg-[#202020] cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <span className="font-semibold text-[#FFFFFF]">{sug.name}</span>
                              <div className="text-right text-[10px] font-mono text-[#A5A5A5]">
                                <span>Peças: {formatCurrency(sug.partsCost)}</span> • <span className="text-[#FF8500]">MO: {formatCurrency(sug.laborCost)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="R$ Peças"
                        value={newItemParts || ''}
                        onChange={e => setNewItemParts(Number(e.target.value))}
                        className="w-full rounded-lg border border-[#262626] bg-[#151515] p-2 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="R$ Mão de Obra"
                        value={newItemLabor || ''}
                        onChange={e => setNewItemLabor(Number(e.target.value))}
                        className="w-full rounded-lg border border-[#262626] bg-[#151515] p-2 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                      />
                    </div>

                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full h-full flex items-center justify-center rounded-lg bg-[#FF8500] text-black hover:bg-[#D96A00] transition-colors shadow-md"
                        title="Adicionar à Tabela"
                      >
                        <Plus className="h-4 w-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabela de Itens Adicionados */}
                <div className="rounded-xl border border-[#262626] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#202020] text-[#A5A5A5] border-b border-[#262626]">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Serviço Cadastrado</th>
                        <th className="py-2 px-3 font-semibold text-right w-28">Valor Peças</th>
                        <th className="py-2 px-3 font-semibold text-right w-28">Mão de Obra</th>
                        <th className="py-2 px-3 font-semibold text-right w-28">Subtotal</th>
                        <th className="py-2 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626] text-[#FFFFFF]">
                      {serviceItems.map(item => (
                        <tr key={item.id} className="hover:bg-[#202020]/40">
                          <td className="py-2 px-3 font-medium">{item.serviceDescription}</td>
                          <td className="py-2 px-3 font-mono text-right text-[#A5A5A5]">{formatCurrency(item.partsCost)}</td>
                          <td className="py-2 px-3 font-mono text-right text-[#A5A5A5]">{formatCurrency(item.laborCost)}</td>
                          <td className="py-2 px-3 font-mono text-right font-bold text-emerald-400">{formatCurrency(item.total)}</td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-rose-400 hover:text-rose-300 p-1 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                  <div className="rounded-xl bg-[#202020] p-2.5 border border-[#262626]">
                    <span className="text-[10px] text-[#A5A5A5] block">Total Peças</span>
                    <span className="font-mono font-bold text-[#FFFFFF] text-sm">{formatCurrency(partsSum)}</span>
                  </div>
                  <div className="rounded-xl bg-[#202020] p-2.5 border border-[#262626]">
                    <span className="text-[10px] text-[#A5A5A5] block">Mão de Obra (Tributável ISS)</span>
                    <span className="font-mono font-bold text-[#FFFFFF] text-sm">{formatCurrency(laborSum)}</span>
                  </div>
                  <div className="rounded-xl bg-[#FF8500]/15 border border-[#FF8500] p-2.5">
                    <span className="text-[10px] text-[#FF8500] font-bold block">TOTAL DA OS</span>
                    <span className="font-mono font-black text-[#FF8500] text-base">{formatCurrency(totalSum)}</span>
                  </div>
                </div>
              </div>

              {/* Submit & Cancel */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] py-3 text-xs font-bold text-[#080808] transition-colors shadow-lg"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  Salvar Ordem de Serviço
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-6 rounded-xl border border-[#262626] bg-[#202020] py-3 text-xs font-semibold text-[#A5A5A5] hover:text-[#FFFFFF]"
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
