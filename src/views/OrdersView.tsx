import React, { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { WrLogo } from '../components/WrLogo'
import {
  ServiceOrder,
  FuelStatus,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  ServicePreset,
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
  XCircle,
  Edit2,
  Save,
  Wrench,
  DollarSign,
  Phone,
  ArrowRight,
  Hash,
} from 'lucide-react'

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
  pagar_depois: 'A Prazo (Fiado)',
  pendente: 'Pendente',
}

export const OrdersView: React.FC = () => {
  const {
    orders,
    clients,
    vehicles,
    mechanics,
    servicePresets,
    addClient,
    addVehicle,
    addOrder,
    updateOrder,
    updateOrderStatus,
    finishOrder,
    issueFiscalInvoice,
    fiscalSettings,
    formatCurrency,
    isNewOrderModalOpen,
    setIsNewOrderModalOpen,
    orderPrefill,
    setOrderPrefill,
    showToast,
  } = useApp()

  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<
    'ativas' | 'aguardando' | 'andamento' | 'pronto' | 'pago' | 'cancelado' | 'todas'
  >('ativas')

  // Modais de Controle
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null)
  const [finalizingOrder, setFinalizingOrder] = useState<ServiceOrder | null>(null)
  const [completedPaymentOrder, setCompletedPaymentOrder] = useState<ServiceOrder | null>(null)
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<ServiceOrder | null>(null)
  const [danfseModalOrder, setDanfseModalOrder] = useState<ServiceOrder | null>(null)
  const [pdfModalOrder, setPdfModalOrder] = useState<ServiceOrder | null>(null)

  // WhatsApp Canvas State
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('')
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)

  // ===================== ESTADO DO FORMULÁRIO (NOVA / EDITAR OS) =====================
  const [formStatus, setFormStatus] = useState<OrderStatus>('aguardando')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCpfCnpj, setClientCpfCnpj] = useState('')

  const [vehicleModel, setVehicleModel] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [mileage, setMileage] = useState<number>(0)
  const [fuelLevel, setFuelLevel] = useState<FuelStatus>('medio')

  const [serviceDescription, setServiceDescription] = useState('')
  const [mechanicAssigned, setMechanicAssigned] = useState(mechanics?.[0] || 'Roberto Silva')
  const [observations, setObservations] = useState('')

  // Itens de serviço e peças (aparece quando marcado em andamento ou pronto)
  const [items, setItems] = useState<OrderItem[]>([])
  const [itemDesc, setItemDesc] = useState('')
  const [itemPartsCost, setItemPartsCost] = useState('')
  const [itemLaborCost, setItemLaborCost] = useState('')
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false)

  // ===================== ESTADO DO PAINEL DE VENDA (CHECKOUT) =====================
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<PaymentMethod>('pix')
  const [checkoutInstallments, setCheckoutInstallments] = useState(1)
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0)
  const [checkoutDueDate, setCheckoutDueDate] = useState(() =>
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )

  // Garante seleção padrão de mecânico
  useEffect(() => {
    if (!mechanicAssigned && mechanics?.length > 0) {
      setMechanicAssigned(mechanics[0])
    }
  }, [mechanics])

  // Trata abertura do modal de Nova OS com ou sem prefill
  useEffect(() => {
    if (!isNewOrderModalOpen) return

    if (orderPrefill) {
      if (orderPrefill.clientId) {
        const c = clients.find(cl => cl.id === orderPrefill.clientId)
        if (c) {
          setSelectedClientId(c.id)
          setClientName(c.name)
          setClientPhone(c.phone)
          setClientCpfCnpj(c.cpfCnpj || '')
        }
      } else {
        setSelectedClientId('')
        setClientName(orderPrefill.clientName || '')
        setClientPhone(orderPrefill.clientPhone || '')
        setClientCpfCnpj('')
      }

      setVehicleModel(orderPrefill.vehicleModel || '')
      setVehiclePlate(orderPrefill.vehiclePlate || '')
      setMileage(0)
      setFuelLevel('medio')
      setServiceDescription(orderPrefill.serviceDescription || '')
      setOrderPrefill(null)
    } else {
      setSelectedClientId('')
      setClientName('')
      setClientPhone('')
      setClientCpfCnpj('')
      setVehicleModel('')
      setVehiclePlate('')
      setMileage(0)
      setFuelLevel('medio')
      setServiceDescription('')
    }

    setFormStatus('aguardando')
    setMechanicAssigned(mechanics?.[0] || 'Roberto Silva')
    setObservations('')
    setItems([])
    setItemDesc('')
    setItemPartsCost('')
    setItemLaborCost('')
    setShowPresetsDropdown(false)
  }, [isNewOrderModalOpen])

  // Trata abertura do modal de EDIÇÃO com a OS selecionada
  useEffect(() => {
    if (!editingOrder) return

    setFormStatus(editingOrder.status)
    setSelectedClientId(editingOrder.clientId || '')
    setClientName(editingOrder.clientName || '')
    setClientPhone(editingOrder.clientPhone || '')
    setClientCpfCnpj(editingOrder.clientCpfCnpj || '')

    setVehicleModel(editingOrder.vehicleModel || '')
    setVehiclePlate(editingOrder.vehiclePlate || '')
    setMileage(editingOrder.mileage || 0)
    setFuelLevel(editingOrder.fuelLevel || 'medio')

    setServiceDescription(editingOrder.serviceDescription || '')
    setMechanicAssigned(editingOrder.mechanicAssigned || mechanics?.[0] || 'Roberto Silva')
    setObservations(editingOrder.observations || '')
    setItems(editingOrder.items || [])
    setItemDesc('')
    setItemPartsCost('')
    setItemLaborCost('')
    setShowPresetsDropdown(false)
  }, [editingOrder])

  // WhatsApp Canvas Generator
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

  // Predefinições filtradas para a busca
  const filteredPresets = useMemo(() => {
    const q = itemDesc.trim().toLowerCase()
    return (servicePresets || []).filter(s => s.name.toLowerCase().includes(q))
  }, [servicePresets, itemDesc])

  // Adicionar item à tabela
  const handleAddItem = () => {
    if (!itemDesc.trim()) {
      showToast('Digite a descrição do serviço ou peça.', 'warning')
      return
    }
    const pCost = parseFloat(itemPartsCost) || 0
    const lCost = parseFloat(itemLaborCost) || 0
    const newItem: OrderItem = {
      id: `it-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      serviceDescription: itemDesc.trim(),
      partsCost: pCost,
      laborCost: lCost,
      total: pCost + lCost,
      serviceCode: '14.01',
      cnae: '4520-0/01',
    }
    setItems(prev => [...prev, newItem])
    setItemDesc('')
    setItemPartsCost('')
    setItemLaborCost('')
    setShowPresetsDropdown(false)
  }

  // Preencher dados ao selecionar uma predefinição
  const handleSelectPreset = (preset: ServicePreset) => {
    setItemDesc(preset.name)
    setItemPartsCost(preset.partsCost > 0 ? String(preset.partsCost) : '')
    setItemLaborCost(preset.laborCost > 0 ? String(preset.laborCost) : '')
    setShowPresetsDropdown(false)
  }

  // Remover item da tabela
  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  // Cálculos de totais dos itens adicionados
  const calculatedPartsTotal = items.reduce((acc, i) => acc + (Number(i.partsCost) || 0), 0)
  const calculatedLaborTotal = items.reduce((acc, i) => acc + (Number(i.laborCost) || 0), 0)
  const calculatedGrandTotal = calculatedPartsTotal + calculatedLaborTotal

  // Salvar Ordem de Serviço (Nova ou Edição)
  const handleSaveOrder = () => {
    if (!clientName.trim()) {
      showToast('Preencha o nome do cliente.', 'warning')
      return
    }
    if (!vehiclePlate.trim() && !vehicleModel.trim()) {
      showToast('Preencha o veículo ou placa.', 'warning')
      return
    }

    // Se estiver em modo de edição
    if (editingOrder) {
      const finalItems: OrderItem[] =
        items.length > 0
          ? items
          : [
              {
                id: `it-${Date.now()}`,
                serviceDescription: serviceDescription.trim() || 'Serviço a Avaliar / Orçamento',
                partsCost: 0,
                laborCost: 0,
                total: 0,
                serviceCode: '14.01',
                cnae: '4520-0/01',
              },
            ]

      const partsTotal = finalItems.reduce((acc, i) => acc + (Number(i.partsCost) || 0), 0)
      const laborTotal = finalItems.reduce((acc, i) => acc + (Number(i.laborCost) || 0), 0)
      const discount = editingOrder.discount || 0
      const totalAmount = Math.max(0, partsTotal + laborTotal - discount)

      const updatedData: Partial<ServiceOrder> = {
        status: formStatus,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientCpfCnpj: clientCpfCnpj.trim() || undefined,
        vehicleModel: vehicleModel.trim() || 'Veículo',
        vehiclePlate: vehiclePlate.toUpperCase().trim() || 'SEM PLACA',
        mileage: Number(mileage) || 0,
        fuelLevel,
        serviceDescription: serviceDescription.trim() || finalItems[0].serviceDescription,
        mechanicAssigned,
        observations: observations.trim(),
        items: finalItems,
        partsTotal,
        laborTotal,
        totalAmount,
      }

      updateOrder(editingOrder.id, updatedData)
      setEditingOrder(null)
      showToast(`OS #${editingOrder.number} atualizada com sucesso!`, 'success')
      return
    }

    // Modo Criação de Nova OS
    let effectiveClientId = selectedClientId
    let effectiveVehicleId = ''

    if (!effectiveClientId) {
      const newCli = addClient({
        name: clientName.trim(),
        phone: clientPhone.trim() || '(63) 99999-9999',
        cpfCnpj: clientCpfCnpj.trim() || undefined,
      })
      effectiveClientId = newCli.id
    }

    if (vehiclePlate.trim() || vehicleModel.trim()) {
      const parts = vehicleModel.trim().split(' ')
      const brand = parts[0] || 'Geral'
      const model = parts.slice(1).join(' ') || vehicleModel.trim() || 'Veículo'
      const newVeh = addVehicle({
        clientId: effectiveClientId,
        brand,
        model,
        plate: vehiclePlate.toUpperCase().trim() || 'SEM PLACA',
        year: new Date().getFullYear(),
        currentMileage: Number(mileage) || 0,
      })
      effectiveVehicleId = newVeh.id
    }

    const finalItems: OrderItem[] =
      items.length > 0
        ? items
        : [
            {
              id: `it-${Date.now()}`,
              serviceDescription: serviceDescription.trim() || 'Serviço a Avaliar / Orçamento',
              partsCost: 0,
              laborCost: 0,
              total: 0,
              serviceCode: '14.01',
              cnae: '4520-0/01',
            },
          ]

    const partsTotal = finalItems.reduce((acc, i) => acc + (Number(i.partsCost) || 0), 0)
    const laborTotal = finalItems.reduce((acc, i) => acc + (Number(i.laborCost) || 0), 0)

    addOrder({
      clientId: effectiveClientId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || '(63) 99999-9999',
      clientCpfCnpj: clientCpfCnpj.trim() || undefined,
      vehicleId: effectiveVehicleId || undefined,
      vehicleModel: vehicleModel.trim() || 'Veículo',
      vehiclePlate: vehiclePlate.toUpperCase().trim() || 'SEM PLACA',
      mileage: Number(mileage) || 0,
      fuelLevel,
      mechanicAssigned,
      serviceDescription: serviceDescription.trim() || finalItems[0].serviceDescription,
      items: finalItems,
      observations: observations.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: formStatus,
      paymentMethod: 'pendente',
      warranty: {
        days: 90,
        expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        coverage: '90 dias de garantia legal para mão de obra conforme Art. 26 do CDC.',
        status: 'vigente',
      },
      partsTotal,
      laborTotal,
      totalAmount: partsTotal + laborTotal,
    })

    setIsNewOrderModalOpen(false)
    showToast('Ordem de Serviço criada com sucesso!', 'success')
  }

  // Confirmar Pagamento no Painel de Vendas
  const handleConfirmCheckout = () => {
    if (!finalizingOrder) return
    const baseSubtotal = (finalizingOrder.partsTotal || 0) + (finalizingOrder.laborTotal || 0)
    const discount = Math.min(Math.max(0, checkoutDiscount), baseSubtotal)

    finishOrder(finalizingOrder.id, {
      paymentMethod: checkoutPaymentMethod,
      installments: checkoutPaymentMethod === 'cartao_credito' ? checkoutInstallments : 1,
      discount,
      emitNfse: false,
      dueDate: checkoutDueDate,
    })

    const updated = {
      ...finalizingOrder,
      status: 'pago' as OrderStatus,
      paymentMethod: checkoutPaymentMethod,
      discount,
      totalAmount: Math.max(0, baseSubtotal - discount),
    }

    setCompletedPaymentOrder(null)
    showToast(`Pagamento da ${finalizingOrder.number} registrado com sucesso!`, 'success')
  }

  // Abrir WhatsApp do cliente diretamente sem nenhuma mensagem pré-escrita
  const handleOpenClientWhatsApp = (order: ServiceOrder) => {
    const raw = (order.clientPhone || '').replace(/\D/g, '')
    if (!raw) {
      showToast('Cliente não possui telefone cadastrado.', 'warning')
      return
    }
    const cleanNumber = raw.startsWith('55') ? raw : `55${raw}`
    window.open(`https://wa.me/${cleanNumber}`, '_blank')
  }

  // Abrir Nota Fiscal Oficial (NFS-e) garantindo emissão prévia se necessário
  const handleOpenNfse = (order: ServiceOrder) => {
    let targetOrder = order
    if (!targetOrder.fiscalInvoice) {
      const issued = issueFiscalInvoice(targetOrder.id, targetOrder)
      if (issued) {
        targetOrder = { ...targetOrder, fiscalInvoice: issued }
      }
    }
    setDanfseModalOrder(targetOrder)
  }

  // Filtragem das Ordens de Serviço
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (o.number?.toLowerCase() || '').includes(q) ||
        (o.clientName?.toLowerCase() || '').includes(q) ||
        (o.clientPhone?.toLowerCase() || '').includes(q) ||
        (o.vehiclePlate?.toLowerCase() || '').includes(q) ||
        (o.vehicleModel?.toLowerCase() || '').includes(q) ||
        (o.serviceDescription?.toLowerCase() || '').includes(q) ||
        (o.mechanicAssigned?.toLowerCase() || '').includes(q)

      let matchesFilter = true
      if (activeTab === 'ativas') {
        matchesFilter = o.status !== 'pago' && o.status !== 'cancelado'
      } else if (activeTab === 'todas') {
        matchesFilter = true
      } else {
        matchesFilter = o.status === activeTab
      }

      return matchesSearch && matchesFilter
    })
  }, [orders, searchTerm, activeTab])

  // Contadores para as abas
  const tabCounts = useMemo(() => {
    return {
      ativas: orders.filter(o => o.status !== 'pago' && o.status !== 'cancelado').length,
      aguardando: orders.filter(o => o.status === 'aguardando').length,
      andamento: orders.filter(o => o.status === 'andamento').length,
      pronto: orders.filter(o => o.status === 'pronto').length,
      pago: orders.filter(o => o.status === 'pago').length,
      cancelado: orders.filter(o => o.status === 'cancelado').length,
      todas: orders.length,
    }
  }, [orders])

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'aguardando':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <Clock className="h-3.5 w-3.5" />
            Aguardando
          </span>
        )
      case 'andamento':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            Em Andamento
          </span>
        )
      case 'pronto':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Pronto p/ Retirada
          </span>
        )
      case 'pago':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <DollarSign className="h-3.5 w-3.5" />
            Pago
          </span>
        )
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="h-3.5 w-3.5" />
            Cancelada
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-neutral-400 border border-white/10">
            {status}
          </span>
        )
    }
  }

  // Compartilhamento direto WhatsApp
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
          text: `Olá ${whatsAppModalOrder.clientName}, segue a Ordem de Serviço da WR Mecânica & Cia.`,
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
      // Fallback
    }
    const cleanNumber = whatsAppModalOrder.clientPhone.replace(/\D/g, '')
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
    window.open(`https://wa.me/${fullNumber}`, '_blank')
  }

  return (
    <div className="space-y-6 select-none pb-12">
      {/* ===================== TOPO EXECUTIVO ===================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-900/90 border border-white/10 p-5 rounded-3xl shadow-lg backdrop-blur-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-[11px] font-black uppercase tracking-wider text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            Painel Oficial de Ordens de Serviço
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList className="h-6 w-6 text-orange-500" />
            WR Mecânica &bull; Atendimentos
          </h1>
          <p className="text-xs text-neutral-400">
            Gestão simplificada de serviços, acompanhamento em tempo real e checkout integrado
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewOrderModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl shadow-[0_10px_25px_-5px_rgba(249,115,22,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(249,115,22,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 self-start sm:self-center shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Nova Ordem de Serviço</span>
        </button>
      </div>

      {/* ===================== BARRA DE BUSCA & FILTROS POR ABA ===================== */}
      <div className="space-y-3">
        {/* Campo de Busca Universal */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, placa, carro, telefone, OS ou mecânico..."
            className="w-full bg-neutral-900/80 text-white placeholder-neutral-500 text-xs sm:text-sm pl-11 pr-4 py-3.5 rounded-2xl border border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'ativas', label: 'Na Oficina (Ativas)', count: tabCounts.ativas },
            { id: 'aguardando', label: 'Aguardando', count: tabCounts.aguardando },
            { id: 'andamento', label: 'Em Andamento', count: tabCounts.andamento },
            { id: 'pronto', label: 'Prontos p/ Retirada', count: tabCounts.pronto },
            { id: 'pago', label: 'Pagas', count: tabCounts.pago },
            { id: 'cancelado', label: 'Canceladas', count: tabCounts.cancelado },
            { id: 'todas', label: 'Todas as OS', count: tabCounts.todas },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-neutral-950 shadow-md font-black'
                  : 'bg-neutral-900/70 border border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === tab.id ? 'bg-neutral-950/20 text-neutral-950 font-black' : 'bg-white/10 text-neutral-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ===================== LISTAGEM DE CARDS DE OS ===================== */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-neutral-900/40 p-12 text-center text-neutral-400 space-y-3">
          <ClipboardList className="h-10 w-10 mx-auto text-neutral-600" />
          <p className="text-sm font-bold text-neutral-300">Nenhuma ordem de serviço encontrada</p>
          <p className="text-xs max-w-sm mx-auto text-neutral-500">
            Alterne o filtro das abas ou crie uma nova OS no botão superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map(order => {
            const hasFiscal = order.fiscalInvoice && order.fiscalInvoice.status === 'autorizada'
            const isPaid = order.status === 'pago'

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-[#12141c]/95 p-5 shadow-xl hover:border-orange-500/50 transition-all flex flex-col justify-between gap-4 group"
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-xl">
                      {order.number}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">{order.date}</span>
                    {hasFiscal && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-black text-emerald-400 font-mono">
                        <ShieldCheck className="h-3 w-3" /> NFS-e Emitida
                      </span>
                    )}
                  </div>

                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Conteúdo Principal do Card */}
                <div className="space-y-3">
                  {/* Linha 1: Cliente & Telefone */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
                          Cliente
                        </span>
                        <h3 className="text-sm font-bold text-white truncate">{order.clientName}</h3>
                      </div>
                    </div>
                    {order.clientPhone && (
                      <a
                        href={`tel:${order.clientPhone.replace(/\D/g, '')}`}
                        className="text-xs font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 hover:text-white flex items-center gap-1 shrink-0"
                      >
                        <Phone className="h-3 w-3 text-orange-400" />
                        {order.clientPhone}
                      </a>
                    )}
                  </div>

                  {/* Linha 2: Veículo, Placa, KM e Nível */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 col-span-2">
                      <Car className="h-4 w-4 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-neutral-500 block">Veículo</span>
                        <span className="font-bold text-white block truncate">{order.vehicleModel}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="text-[9px] uppercase font-bold text-neutral-500 block">Placa</span>
                      <span className="font-mono font-black text-orange-400">{order.vehiclePlate}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="text-[9px] uppercase font-bold text-neutral-500 block">KM</span>
                      <span className="font-mono font-bold text-neutral-300">
                        {order.mileage ? `${order.mileage.toLocaleString('pt-BR')} km` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Linha 3: Serviço Solicitado & Mecânico */}
                  <div className="p-3 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                      <span>Serviço Solicitado</span>
                      <span className="text-orange-400 flex items-center gap-1">
                        <Wrench className="h-3 w-3" /> {order.mechanicAssigned || 'Roberto Silva'}
                      </span>
                    </div>
                    <p className="text-neutral-200 font-semibold line-clamp-2">
                      {order.serviceDescription || 'Serviço Geral'}
                    </p>
                  </div>

                  {/* Linha 4: Valor Total da OS */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                      Total da OS
                    </span>
                    <span className="font-mono text-xl font-black text-orange-400">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </div>
                </div>

                {/* ===================== BOTÕES DO CARD ===================== */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  {/* Botão Principal em Destaque: Marcar como Pronto e ir para o Painel de Venda */}
                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => {
                        setFinalizingOrder(order)
                        setCheckoutPaymentMethod('pix')
                        setCheckoutDiscount(order.discount || 0)
                        setCheckoutInstallments(1)
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {order.status === 'pronto'
                          ? 'Receber Pagamento (Painel de Venda)'
                          : 'Marcar como Pronto & Receber'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  {/* Barra com os 5 botões utilitários */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {/* 1. WhatsApp (direto sem mensagem) */}
                    <button
                      type="button"
                      onClick={() => handleOpenClientWhatsApp(order)}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all text-[11px] font-bold"
                      title="Abrir WhatsApp do cliente"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </button>

                    {/* 2. Nota Fiscal (NFS-e) */}
                    <button
                      type="button"
                      onClick={() => handleOpenNfse(order)}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 transition-all text-[11px] font-bold"
                      title="Emitir ou Visualizar Nota Fiscal (NFS-e)"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">NFS-e</span>
                    </button>

                    {/* 3. O.S */}
                    <button
                      type="button"
                      onClick={() => setPdfModalOrder(order)}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/25 transition-all text-[11px] font-bold"
                      title="Visualizar e Imprimir Ordem de Serviço"
                    >
                      <Printer className="h-4 w-4 shrink-0" />
                      <span className="truncate">O.S</span>
                    </button>

                    {/* 4. Alterar (Lápis) */}
                    <button
                      type="button"
                      onClick={() => setEditingOrder(order)}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 transition-all text-[11px] font-bold"
                      title="Alterar dados, serviços e peças da OS"
                    >
                      <Edit2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">Alterar</span>
                    </button>

                    {/* 5. Cancelar */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Deseja realmente cancelar a OS #${order.number}?`)) {
                          updateOrderStatus(order.id, 'cancelado')
                          showToast(`OS #${order.number} cancelada.`, 'info')
                        }
                      }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition-all text-[11px] font-bold"
                      title="Cancelar esta OS"
                    >
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span className="truncate">Cancelar</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===================== MODAL: NOVA / EDITAR ORDEM DE SERVIÇO ===================== */}
      {(isNewOrderModalOpen || editingOrder) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-[32px] border border-white/10 bg-[#12141c] p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingOrder ? `Editar ${editingOrder.number}` : 'Nova Ordem de Serviço'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Preencha as informações do atendimento e o serviço solicitado
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewOrderModalOpen(false)
                  setEditingOrder(null)
                }}
                className="rounded-xl p-2 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formulário com bloqueio de Enter acidental */}
            <form
              onSubmit={e => e.preventDefault()}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
                  e.preventDefault()
                }
              }}
              className="space-y-5"
            >
              {/* 1. STATUS DO SERVIÇO */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400">
                  Status do Serviço
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'aguardando', label: 'Aguardando', color: 'border-amber-500 bg-amber-500/15 text-amber-400' },
                    { id: 'andamento', label: 'Em Andamento', color: 'border-orange-500 bg-orange-500/15 text-orange-400' },
                    { id: 'pronto', label: 'Pronto', color: 'border-blue-500 bg-blue-500/15 text-blue-400' },
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormStatus(st.id as OrderStatus)}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        formStatus === st.id
                          ? `${st.color} shadow-md ring-2 ring-orange-500/30`
                          : 'border-white/5 bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {formStatus === st.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. DADOS DO CLIENTE & CONTATO */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Dados do Cliente
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-[#181a24] text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="(63) 99999-9999"
                      className="w-full bg-[#181a24] text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 focus:border-orange-500 font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      CPF / CNPJ <span className="text-neutral-500 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={clientCpfCnpj}
                      onChange={e => setClientCpfCnpj(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-[#181a24] text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 focus:border-orange-500 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. DADOS DO CARRO, PLACA, KM & COMBUSTÍVEL */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Car className="h-4 w-4" /> Veículo &bull; Dados de Entrada
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Carro / Modelo *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      placeholder="Ex: Honda Civic 2.0 LXR"
                      className="w-full bg-[#181a24] text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Placa do Veículo *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehiclePlate}
                      onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
                      placeholder="ABC-1234"
                      className="w-full bg-[#181a24] text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 focus:border-orange-500 font-mono font-bold uppercase outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Quilometragem (KM)
                    </label>
                    <input
                      type="number"
                      value={mileage || ''}
                      onChange={e => setMileage(Number(e.target.value))}
                      placeholder="Ex: 85000"
                      className="w-full bg-[#181a24] text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 focus:border-orange-500 font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Combustível */}
                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1.5 flex items-center gap-1">
                    <Fuel className="h-3.5 w-3.5 text-orange-400" /> Nível de Combustível:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'reserva', label: 'Reserva', color: 'border-rose-500 bg-rose-500/15 text-rose-400' },
                      { id: 'medio', label: 'Médio (~1/2)', color: 'border-amber-500 bg-amber-500/15 text-amber-400' },
                      { id: 'cheio', label: 'Cheio', color: 'border-emerald-500 bg-emerald-500/15 text-emerald-400' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFuelLevel(f.id as FuelStatus)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          fuelLevel === f.id
                            ? `${f.color} shadow-sm font-black`
                            : 'border-white/5 bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. SERVIÇO QUE O CLIENTE QUER FAZER & MECÂNICO */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Wrench className="h-4 w-4" /> Serviço Solicitado &amp; Mecânico
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Serviço que o cliente quer fazer *
                    </label>
                    <input
                      type="text"
                      required
                      value={serviceDescription}
                      onChange={e => setServiceDescription(e.target.value)}
                      placeholder="Ex: Barulho na suspensão dianteira e troca de óleo..."
                      className="w-full bg-[#181a24] text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Qual mecânico vai fazer?
                    </label>
                    <select
                      value={mechanicAssigned}
                      onChange={e => setMechanicAssigned(e.target.value)}
                      className="w-full bg-[#181a24] text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 focus:border-orange-500 outline-none cursor-pointer"
                    >
                      {mechanics.map(m => (
                        <option key={m} value={m} className="bg-neutral-900">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. TABELA DE SERVIÇOS & PEÇAS (QUANDO EM ANDAMENTO OU PRONTO) */}
              {(formStatus === 'andamento' || formStatus === 'pronto' || items.length > 0) && (
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-orange-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" /> Discriminação de Serviços Feitos &amp; Peças
                      </span>
                      <p className="text-[11px] text-neutral-400">
                        Adicione os serviços executados, valor de peças e mão de obra
                      </p>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/25">
                      Subtotal: {formatCurrency(calculatedGrandTotal)}
                    </span>
                  </div>

                  {/* Campos para Adicionar Novo Item */}
                  <div className="p-3.5 rounded-2xl bg-[#181a24] border border-white/10 space-y-3">
                    {/* Descrição com Sugestões Predefinidas */}
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                        Descrição do Serviço ou Peça
                      </label>
                      <input
                        type="text"
                        value={itemDesc}
                        onFocus={() => setShowPresetsDropdown(true)}
                        onChange={e => {
                          setItemDesc(e.target.value)
                          setShowPresetsDropdown(true)
                        }}
                        placeholder="Digite o serviço ou escolha uma predefinição..."
                        className="w-full bg-neutral-900 text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 focus:border-orange-500 outline-none"
                      />

                      {showPresetsDropdown && filteredPresets.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 p-1.5 shadow-2xl z-50 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-neutral-500 px-2 py-1 block">
                            Serviços Predefinidos Rápidos
                          </span>
                          {filteredPresets.map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectPreset(preset)}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-orange-500/15 hover:text-orange-400 text-neutral-300 text-xs font-semibold flex items-center justify-between transition-colors"
                            >
                              <span className="truncate">{preset.name}</span>
                              <span className="font-mono text-[11px] text-orange-400 shrink-0 font-bold ml-2">
                                Peças: {formatCurrency(preset.partsCost)} | M.O: {formatCurrency(preset.laborCost)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                          Valor Peça (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={itemPartsCost}
                          onChange={e => setItemPartsCost(e.target.value)}
                          placeholder="0,00"
                          className="w-full bg-neutral-900 text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 font-mono font-bold outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                          Mão de Obra (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={itemLaborCost}
                          onChange={e => setItemLaborCost(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddItem()
                            }
                          }}
                          placeholder="0,00"
                          className="w-full bg-neutral-900 text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 font-mono font-bold outline-none"
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="w-full bg-orange-500 hover:bg-orange-400 text-neutral-950 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Plus className="h-4 w-4 stroke-[3]" />
                          <span>Adicionar Item</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tabela dos Itens Adicionados */}
                  {items.length > 0 && (
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#181a24]">
                      <table className="w-full text-left text-xs min-w-[420px]">
                        <thead className="bg-white/5 text-neutral-400 border-b border-white/10 text-[11px] uppercase font-bold">
                          <tr>
                            <th className="py-2.5 px-3">Serviço / Peça</th>
                            <th className="py-2.5 px-3 text-right">Peças</th>
                            <th className="py-2.5 px-3 text-right">Mão de Obra</th>
                            <th className="py-2.5 px-3 text-right">Total</th>
                            <th className="py-2.5 px-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white">
                          {items.map(it => (
                            <tr key={it.id}>
                              <td className="py-2.5 px-3 font-semibold">{it.serviceDescription}</td>
                              <td className="py-2.5 px-3 font-mono text-right text-neutral-400">
                                {formatCurrency(it.partsCost)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-right text-neutral-400">
                                {formatCurrency(it.laborCost)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-right font-black text-emerald-400">
                                {formatCurrency(it.total)}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(it.id)}
                                  className="text-rose-400 hover:text-rose-300 p-1"
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
              )}

              {/* 6. CAMPO DE OBSERVAÇÃO */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400">
                  Observações Gerais <span className="text-neutral-500 font-normal">(Opcional)</span>
                </label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  placeholder="Alguma observação adicional sobre o veículo ou instruções do cliente..."
                  className="w-full bg-[#181a24] text-white text-xs sm:text-sm p-3 rounded-xl border border-white/10 focus:border-orange-500 outline-none"
                />
              </div>

              {/* 7. BOTÕES SALVAR E CANCELAR */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingOrder ? 'Salvar Alterações da OS' : 'Salvar Ordem de Serviço'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewOrderModalOpen(false)
                    setEditingOrder(null)
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: PAINEL DE VENDA (CHECKOUT AO MARCAR COMO PRONTO) ===================== */}
      {finalizingOrder && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[32px] border border-white/10 bg-[#12141c] p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
            {/* Cabeçalho do Checkout */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Painel de Venda &bull; {finalizingOrder.number}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {finalizingOrder.clientName} &bull; {finalizingOrder.vehicleModel} ({finalizingOrder.vehiclePlate})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFinalizingOrder(null)}
                className="rounded-xl p-2 text-neutral-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Resumo Financeiro da OS */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Peças</span>
                  <span className="font-mono font-bold text-neutral-200">
                    {formatCurrency(finalizingOrder.partsTotal || 0)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Mão de Obra</span>
                  <span className="font-mono font-bold text-neutral-200">
                    {formatCurrency(finalizingOrder.laborTotal || 0)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Subtotal</span>
                  <span className="font-mono font-bold text-neutral-200">
                    {formatCurrency((finalizingOrder.partsTotal || 0) + (finalizingOrder.laborTotal || 0))}
                  </span>
                </div>
              </div>

              {/* Campo de Desconto */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="font-bold text-neutral-300">Desconto Concedido:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 font-mono font-bold">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={checkoutDiscount || ''}
                    onChange={e => setCheckoutDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0,00"
                    className="w-28 bg-[#181a24] text-white text-xs sm:text-sm font-mono font-bold text-right p-2 rounded-xl border border-white/10 outline-none"
                  />
                </div>
              </div>

              {/* Total Final a Pagar */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Total Final a Pagar:
                </span>
                <span className="font-mono text-2xl font-black text-emerald-400">
                  {formatCurrency(
                    Math.max(
                      0,
                      (finalizingOrder.partsTotal || 0) + (finalizingOrder.laborTotal || 0) - checkoutDiscount
                    )
                  )}
                </span>
              </div>
            </div>

            {/* Seleção do Método de Pagamento */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400">
                Escolha o Método de Pagamento:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'pix', label: 'PIX', icon: '⚡' },
                  { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
                  { id: 'cartao_debito', label: 'Cartão Débito', icon: '💳' },
                  { id: 'cartao_credito', label: 'Cartão Crédito', icon: '💳' },
                  { id: 'pagar_depois', label: 'A Prazo (Fiado)', icon: '📝' },
                  { id: 'boleto', label: 'Boleto', icon: '📄' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCheckoutPaymentMethod(opt.id as PaymentMethod)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                      checkoutPaymentMethod === opt.id
                        ? 'border-orange-500 bg-orange-500/15 text-orange-400 font-black shadow-md ring-2 ring-orange-500/30'
                        : 'border-white/5 bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Opções extras para Cartão de Crédito ou Fiado */}
            {checkoutPaymentMethod === 'cartao_credito' && (
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-orange-500/30 space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-bold text-orange-400">
                  Parcelamento no Cartão de Crédito:
                </label>
                <select
                  value={checkoutInstallments}
                  onChange={e => setCheckoutInstallments(Number(e.target.value))}
                  className="w-full bg-[#181a24] text-white text-xs p-2.5 rounded-xl border border-white/10 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <option key={num} value={num}>
                      {num}x de{' '}
                      {formatCurrency(
                        Math.max(
                          0,
                          (finalizingOrder.partsTotal || 0) + (finalizingOrder.laborTotal || 0) - checkoutDiscount
                        ) / num
                      )}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {checkoutPaymentMethod === 'pagar_depois' && (
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-amber-500/30 space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-bold text-amber-400">
                  Data combinada para pagamento (Vencimento):
                </label>
                <input
                  type="date"
                  value={checkoutDueDate}
                  onChange={e => setCheckoutDueDate(e.target.value)}
                  className="w-full bg-[#181a24] text-white text-xs p-2.5 rounded-xl border border-white/10 font-mono outline-none"
                />
              </div>
            )}

            {/* Ações do Checkout */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmCheckout}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmar Pagamento e Finalizar Venda</span>
              </button>
              <button
                type="button"
                onClick={() => setFinalizingOrder(null)}
                className="px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs uppercase tracking-wider"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: SUCESSO DO PAGAMENTO (COMPARTILHAR NOTA FISCAL) ===================== */}
      {completedPaymentOrder && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-[#12141c] p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Venda Concluída com Sucesso!</h3>
              <p className="text-xs text-neutral-400">
                A {completedPaymentOrder.number} foi marcada como paga e o veículo foi liberado.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/5 text-xs space-y-1">
              <div className="flex justify-between text-neutral-400">
                <span>Cliente:</span>
                <strong className="text-white">{completedPaymentOrder.clientName}</strong>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Veículo:</span>
                <strong className="text-white">{completedPaymentOrder.vehicleModel} ({completedPaymentOrder.vehiclePlate})</strong>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Método:</span>
                <strong className="text-emerald-400">
                  {PAYMENT_LABELS[completedPaymentOrder.paymentMethod || 'pix']}
                </strong>
              </div>
              <div className="flex justify-between text-neutral-400 pt-1 border-t border-white/5">
                <span>Valor Pago:</span>
                <strong className="font-mono text-base font-black text-emerald-400">
                  {formatCurrency(completedPaymentOrder.totalAmount || 0)}
                </strong>
              </div>
            </div>

            {/* BOTÕES DE COMPARTILHAMENTO PÓS-PAGAMENTO */}
            <div className="space-y-2 pt-1">
              {/* Compartilhar Nota Fiscal */}
              <button
                type="button"
                onClick={() => {
                  handleOpenNfse(completedPaymentOrder)
                  setCompletedPaymentOrder(null)
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
              >
                <FileText className="h-4 w-4" />
                <span>Compartilhar Nota Fiscal (NFS-e)</span>
              </button>

              {/* Abrir WhatsApp do Cliente */}
              <button
                type="button"
                onClick={() => {
                  handleOpenClientWhatsApp(completedPaymentOrder)
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Abrir WhatsApp do Cliente</span>
              </button>

              {/* Concluir */}
              <button
                type="button"
                onClick={() => setCompletedPaymentOrder(null)}
                className="w-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white font-bold text-xs uppercase tracking-wider py-3 rounded-2xl transition-all"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: WHATSAPP ===================== */}
      {whatsAppModalOrder && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-[32px] border border-white/10 bg-[#12141c] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-black text-emerald-400 text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Enviar OS via WhatsApp
              </span>
              <button
                onClick={() => setWhatsAppModalOrder(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-2 flex items-center justify-center min-h-[220px]">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="Comprovante OS"
                  className="rounded-xl max-h-[300px] w-auto object-contain shadow-md"
                />
              ) : (
                <div className="flex items-center gap-2 text-neutral-400 text-xs animate-pulse">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span>Gerando imagem da OS...</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDirectShare}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-black text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Compartilhar no WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopyAndOpenWhatsApp}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: IMPRESSÃO OFICIAL DA OS (PDF / VISUALIZADOR) ===================== */}
      {pdfModalOrder && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-[32px] border border-white/10 bg-[#12141c] p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[95vh] overflow-y-auto">
            {/* Barra Superior de Ações (Oculta na Impressão) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 no-print">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Ordem de Serviço &bull; {pdfModalOrder.number}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Visualização executiva para impressão ou envio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenClientWhatsApp(pdfModalOrder)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  title="Abrir WhatsApp do cliente"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPdfModalOrder(null)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Folha Oficial da OS (Design Corporativo Branco de Alta Definição) */}
            <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-8 space-y-6 text-slate-900 shadow-xl font-sans printable-order">
              {/* 1. CABEÇALHO DA OFICINA */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-auto flex items-center justify-center p-2 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                    <WrLogo size="lg" variant="light" showSubtitle={true} />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      {fiscalSettings.tradeName || 'WR MECÂNICA & AUTO CENTER'}
                    </h1>
                    <p className="text-xs font-semibold text-slate-700">
                      {fiscalSettings.companyName || 'WR Mecânica & Cia Ltda'} &bull; CNPJ: {fiscalSettings.cnpj || '38.271.748/0001-38'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {fiscalSettings.address || 'Rodovia TO-080, KM 12'} &bull; {fiscalSettings.district || 'Luzimangues'}, {fiscalSettings.city || 'Porto Nacional'} - {fiscalSettings.state || 'TO'}
                    </p>
                    <p className="text-[11px] font-bold text-amber-700">
                      Telefone / WhatsApp: {fiscalSettings.phone || '(63) 99208-8283'} &bull; Atendimento Especializado Multimarcas
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200 w-full sm:w-auto">
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 block">
                    ORDEM DE SERVIÇO Nº
                  </span>
                  <span className="font-mono text-2xl font-black text-amber-700 block">
                    {pdfModalOrder.number}
                  </span>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                    <p>
                      <strong>Emissão:</strong> {pdfModalOrder.date} {pdfModalOrder.time ? `às ${pdfModalOrder.time}` : ''}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className="inline-block uppercase font-black text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {pdfModalOrder.status === 'pago'
                          ? 'PAGA / CONCLUÍDA'
                          : pdfModalOrder.status === 'pronto'
                          ? 'PRONTO P/ RETIRADA'
                          : pdfModalOrder.status === 'andamento'
                          ? 'EM ANDAMENTO'
                          : pdfModalOrder.status === 'cancelado'
                          ? 'CANCELADA'
                          : 'AGUARDANDO'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. DADOS DO CLIENTE E DO VEÍCULO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cartão Cliente */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <User className="h-4 w-4 text-amber-700" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                      Dados do Cliente
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Nome Completo</span>
                      <p className="font-bold text-slate-900 text-sm">{pdfModalOrder.clientName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Telefone</span>
                      <p className="font-mono font-semibold text-slate-800">{pdfModalOrder.clientPhone || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">CPF / CNPJ</span>
                      <p className="font-mono font-semibold text-slate-800">{pdfModalOrder.clientCpfCnpj || 'Não Informado'}</p>
                    </div>
                  </div>
                </div>

                {/* Cartão Veículo */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <Car className="h-4 w-4 text-amber-700" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                      Dados do Veículo
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Modelo / Veículo</span>
                      <p className="font-bold text-slate-900">{pdfModalOrder.vehicleModel || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Placa</span>
                      <p className="font-mono font-black text-amber-800">{pdfModalOrder.vehiclePlate}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Quilometragem</span>
                      <p className="font-mono font-semibold text-slate-800">
                        {pdfModalOrder.mileage ? `${pdfModalOrder.mileage.toLocaleString('pt-BR')} km` : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Combustível</span>
                      <p className="font-semibold text-slate-800 capitalize">
                        {pdfModalOrder.fuelLevel === 'cheio'
                          ? 'Cheio'
                          : pdfModalOrder.fuelLevel === 'reserva'
                          ? 'Reserva'
                          : 'Médio (~1/2)'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Mecânico Resp.</span>
                      <p className="font-semibold text-slate-800">{pdfModalOrder.mechanicAssigned || 'Roberto Silva'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. SERVIÇO SOLICITADO / RELATO DO CLIENTE */}
              {pdfModalOrder.serviceDescription && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
                    Serviço Solicitado / Relato do Cliente:
                  </span>
                  <p className="text-slate-900 font-medium leading-relaxed">
                    {pdfModalOrder.serviceDescription}
                  </p>
                </div>
              )}

              {/* 4. DISCRIMINAÇÃO DOS SERVIÇOS E PEÇAS EXECUTADAS */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-amber-700" /> Discriminação de Serviços e Peças
                </span>

                <div className="overflow-x-auto rounded-xl border border-slate-300">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Item / Descrição dos Serviços &amp; Aplicações</th>
                        <th className="py-2.5 px-3 text-right">Peças (R$)</th>
                        <th className="py-2.5 px-3 text-right">M. Obra (R$)</th>
                        <th className="py-2.5 px-3 text-right">Total Item (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {(pdfModalOrder.items || []).map((it, idx) => (
                        <tr key={it.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <span className="text-slate-400 font-mono text-[10px] mr-2">#{String(idx + 1).padStart(2, '0')}</span>
                            {it.serviceDescription}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-right text-slate-700">
                            {formatCurrency(it.partsCost || 0)}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-right text-slate-700">
                            {formatCurrency(it.laborCost || 0)}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-right font-black text-slate-900">
                            {formatCurrency(it.total || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. TOTAIS E FORMA DE PAGAMENTO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
                <div className="space-y-2 text-xs">
                  {pdfModalOrder.observations && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                      <strong className="text-[10px] uppercase font-black text-slate-700 block">
                        Observações Técnicas:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">{pdfModalOrder.observations}</p>
                    </div>
                  )}

                  {/* Garantia Legal Art. 26 CDC */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-1 text-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                      Garantia Legal de Serviços &bull; 90 Dias
                    </span>
                    <p className="text-[11px] text-slate-700 leading-tight">
                      Garantia de 90 dias para serviços executados e peças genuínas conforme o Art. 26 do Código de Defesa do Consumidor (Lei nº 8.078/90). Não cobre mau uso ou intervenção de terceiros.
                    </p>
                  </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Total de Peças:</span>
                    <span className="font-mono font-bold">{formatCurrency(pdfModalOrder.partsTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Total Mão de Obra:</span>
                    <span className="font-mono font-bold">{formatCurrency(pdfModalOrder.laborTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal Geral:</span>
                    <span className="font-mono font-bold">
                      {formatCurrency((pdfModalOrder.partsTotal || 0) + (pdfModalOrder.laborTotal || 0))}
                    </span>
                  </div>

                  {(pdfModalOrder.discount || 0) > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold border-t border-slate-200 pt-1">
                      <span>Desconto Especial:</span>
                      <span className="font-mono">- {formatCurrency(pdfModalOrder.discount || 0)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-900 pt-2 border-t-2 border-slate-900">
                    <span className="text-sm font-black uppercase">VALOR TOTAL DA OS:</span>
                    <span className="font-mono text-2xl font-black text-amber-800">
                      {formatCurrency(pdfModalOrder.totalAmount || 0)}
                    </span>
                  </div>

                  <div className="pt-2 text-right text-[11px] text-slate-600">
                    <span>Forma de Pagamento: </span>
                    <strong className="text-slate-900 uppercase">
                      {PAYMENT_LABELS[pdfModalOrder.paymentMethod || 'pendente']}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 6. CAMPOS DE ASSINATURA */}
              <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900 uppercase">{fiscalSettings.tradeName || 'WR Mecânica & Cia'}</p>
                  <p className="text-[10px] text-slate-500">Responsável Técnico / Mecânico</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900 uppercase">{pdfModalOrder.clientName}</p>
                  <p className="text-[10px] text-slate-500">Assinatura do Cliente / Proprietário</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: DANFSE OFICIAL (NFS-E) ===================== */}
      {danfseModalOrder && (
        <DanfseModal
          order={danfseModalOrder}
          settings={fiscalSettings}
          onClose={() => setDanfseModalOrder(null)}
        />
      )}
    </div>
  )
}
