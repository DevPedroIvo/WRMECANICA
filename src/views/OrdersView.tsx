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
  Users,
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
  ArrowLeft,
  Kanban,
  List,
  Eye,
  Check,
  Calendar,
  Layers,
  ChevronRight,
  AlertTriangle,
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

  // Alternância de modo de visualização (Lista vs Kanban)
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('kanban')

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

  // Novo Modal de Detalhes da OS
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<ServiceOrder | null>(null)
  const [detailTab, setDetailTab] = useState<'resumo' | 'itens' | 'diagnostico' | 'historico' | 'financeiro'>('resumo')

  // Stepper / Assistente em 5 etapas para Criação de OS
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // WhatsApp Canvas State
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('')
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)

  // ===================== ESTADO DO FORMULÁRIO (NOVA / EDITAR OS) =====================
  const [formStatus, setFormStatus] = useState<OrderStatus>('aguardando')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [showClientSelector, setShowClientSelector] = useState(false)
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCpfCnpj, setClientCpfCnpj] = useState('')

  const [vehicleModel, setVehicleModel] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [mileage, setMileage] = useState<number>(0)
  const [fuelLevel, setFuelLevel] = useState<FuelStatus>('medio')

  const [serviceDescription, setServiceDescription] = useState('')
  const [technicalDiagnostic, setTechnicalDiagnostic] = useState('')
  const [mechanicAssigned, setMechanicAssigned] = useState(mechanics?.[0] || 'Roberto Silva')
  const [observations, setObservations] = useState('')

  // Itens de serviço e peças
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
    setWizardStep(1)

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
      setTechnicalDiagnostic('')
    }

    setFormStatus('aguardando')
    setMechanicAssigned(mechanics?.[0] || 'Roberto Silva')
    setObservations('')
    setItems([])
    setItemDesc('')
    setItemPartsCost('')
    setItemLaborCost('')
    setShowPresetsDropdown(false)
    setShowClientSelector(false)
    setClientSearchQuery('')
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
    const cleanItems = (editingOrder.items || []).filter(
      it =>
        it.serviceDescription !== 'Serviço a Avaliar / Orçamento' ||
        (it.partsCost || 0) > 0 ||
        (it.laborCost || 0) > 0
    )
    setItems(cleanItems)
    setItemDesc('')
    setItemPartsCost('')
    setItemLaborCost('')
    setShowPresetsDropdown(false)
    setShowClientSelector(false)
    setClientSearchQuery('')
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

  // Lista de clientes já cadastrados filtrada para o seletor
  const filteredClientsList = useMemo(() => {
    const q = clientSearchQuery.toLowerCase().trim()
    if (!q) return clients.slice(0, 10)
    return clients
      .filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          (c.phone || '').includes(q) ||
          (c.cpfCnpj || '').includes(q)
      )
      .slice(0, 10)
  }, [clients, clientSearchQuery])

  // Veículos do cliente selecionado no assistente
  const selectedClientVehicles = useMemo(() => {
    if (!selectedClientId) return []
    return vehicles.filter(v => v.clientId === selectedClientId)
  }, [vehicles, selectedClientId])

  // Ação ao selecionar um cliente já cadastrado
  const handleSelectExistingClient = (c: (typeof clients)[0]) => {
    setSelectedClientId(c.id)
    setClientName(c.name)
    setClientPhone(c.phone)
    setClientCpfCnpj(c.cpfCnpj || '')

    const clientVehicles = vehicles.filter(v => v.clientId === c.id)
    if (clientVehicles.length > 0) {
      const firstV = clientVehicles[0]
      setVehicleModel(`${firstV.brand} ${firstV.model}`.trim())
      setVehiclePlate(firstV.plate)
      if (firstV.currentMileage) {
        setMileage(firstV.currentMileage)
      }
    }
    setShowClientSelector(false)
    setClientSearchQuery('')
    showToast(`Cliente "${c.name}" selecionado!`, 'info')
  }

  // Adicionar item à tabela
  const handleAddItem = () => {
    if (!itemDesc.trim()) {
      showToast('Digite a descrição do serviço ou peça.', 'warning')
      return
    }
    const pCost = parseFloat(String(itemPartsCost).replace(',', '.')) || 0
    const lCost = parseFloat(String(itemLaborCost).replace(',', '.')) || 0
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
      setWizardStep(1)
      return
    }
    if (!vehiclePlate.trim() && !vehicleModel.trim()) {
      showToast('Preencha o veículo ou placa.', 'warning')
      setWizardStep(2)
      return
    }

    // Se estiver em modo de edição
    if (editingOrder) {
      const finalItems: OrderItem[] = items
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
        serviceDescription: serviceDescription.trim() || (finalItems[0]?.serviceDescription || 'Serviço Geral'),
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

    const finalItems: OrderItem[] = items
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
      serviceDescription: serviceDescription.trim() || (finalItems[0]?.serviceDescription || 'Serviço Geral'),
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
    const finalTotal = Math.max(0, baseSubtotal - discount)

    finishOrder(finalizingOrder.id, {
      paymentMethod: checkoutPaymentMethod,
      installments: checkoutPaymentMethod === 'cartao_credito' ? checkoutInstallments : 1,
      discount,
      emitNfse: false,
      dueDate: checkoutDueDate,
    })

    const updated: ServiceOrder = {
      ...finalizingOrder,
      status: 'pago',
      paymentMethod: checkoutPaymentMethod,
      paymentInstallments: checkoutPaymentMethod === 'cartao_credito' ? checkoutInstallments : 1,
      discount,
      totalAmount: finalTotal,
    }

    setFinalizingOrder(null)
    setCompletedPaymentOrder(updated)
    showToast(`Pagamento da ${finalizingOrder.number} registrado com sucesso!`, 'success')
  }

  // Abrir WhatsApp do cliente diretamente
  const handleOpenClientWhatsApp = (order: ServiceOrder) => {
    const raw = (order.clientPhone || '').replace(/\D/g, '')
    if (!raw) {
      showToast('Cliente não possui telefone cadastrado.', 'warning')
      return
    }
    const cleanNumber = raw.startsWith('55') ? raw : `55${raw}`
    window.open(`https://wa.me/${cleanNumber}`, '_blank')
  }

  // Abrir Nota Fiscal Oficial (NFS-e)
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

  // Contadores para as abas e métricas
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1A2230] text-slate-300 border border-[#2A364C]">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Aguardando
          </span>
        )
      case 'andamento':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#271C14] text-[#F97316] border border-[#F97316]/40 shadow-sm shadow-[#F97316]/10">
            <span className="h-2 w-2 rounded-full bg-[#F97316] animate-pulse" />
            Em Execução
          </span>
        )
      case 'pronto':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#142338] text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
            Pronto p/ Retirada
          </span>
        )
      case 'pago':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#142921] text-emerald-400 border border-emerald-500/30">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            Concluída &amp; Paga
          </span>
        )
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#2C191D] text-rose-400 border border-rose-500/30">
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            Cancelada
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#1A2230] text-slate-400 border border-[#2A364C]">
            {status}
          </span>
        )
    }
  }

  // Drag and drop para o Quadro Kanban
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('text/plain', orderId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnColumn = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault()
    const orderId = e.dataTransfer.getData('text/plain')
    if (!orderId) return
    const targetOrder = orders.find(o => o.id === orderId)
    if (!targetOrder || targetOrder.status === targetStatus) return

    if (targetStatus === 'pronto') {
      updateOrderStatus(orderId, 'pronto')
      showToast(`OS #${targetOrder.number} marcada como Pronta p/ Retirada!`, 'info')
    } else if (targetStatus === 'pago') {
      // Abre o modal de finalização/pagamento para garantir a integridade financeira
      setFinalizingOrder(targetOrder)
      setCheckoutPaymentMethod('pix')
      setCheckoutDiscount(targetOrder.discount || 0)
      setCheckoutInstallments(1)
    } else {
      updateOrderStatus(orderId, targetStatus)
      showToast(`OS #${targetOrder.number} movida para ${targetStatus.toUpperCase()}!`, 'info')
    }
  }

  // Compartilhamento direto WhatsApp
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

  const handleDirectShare = async () => {
    if (!whatsAppModalOrder) return
    if (imageBlob && navigator.canShare && navigator.canShare({ files: [new File([imageBlob], 'os.png', { type: 'image/png' })] })) {
      try {
        const file = new File([imageBlob], `OS-${whatsAppModalOrder.number}.png`, { type: 'image/png' })
        await navigator.share({
          title: `OS ${whatsAppModalOrder.number} - WR Mecânica`,
          text: `Olá ${whatsAppModalOrder.clientName}! Segue a sua Ordem de Serviço na WR Mecânica & Cia.`,
          files: [file],
        })
        return
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }
    await handleCopyAndOpenWhatsApp()
  }

  return (
    <div className="space-y-6 select-none pb-12 animate-fadeIn">
      {/* ===================== TOPO EXECUTIVO AUTOMOTIVO ===================== */}
      <div className="relative rounded-3xl border border-[#222C3D] bg-gradient-to-r from-[#141A24] via-[#161D2B] to-[#141A24] p-5 sm:p-6 shadow-card overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#F97316]/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/15 border border-[#F97316]/30 text-[11px] font-black uppercase tracking-wider text-[#F97316]">
              <Sparkles className="h-3.5 w-3.5" />
              Central de Gestão de Ordens de Serviço
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <ClipboardList className="h-6 w-6 text-[#F97316]" />
              Ordens de Serviço &bull; WR Mecânica
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Gerencie atendimentos com quadro visual Kanban ou lista detalhada, diagnóstico técnico, estepe, peças e faturamento integrado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Alternador de Visualização: Lista vs Kanban */}
            <div className="inline-flex items-center rounded-2xl bg-[#0F141C] border border-[#222C3D] p-1">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-[#F97316] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização em Quadro Kanban"
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>Kanban</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('lista')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'lista'
                    ? 'bg-[#F97316] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização em Lista Compacta"
              >
                <List className="h-3.5 w-3.5" />
                <span>Lista</span>
              </button>
            </div>

            {/* Botão de Criação de OS com Assistente */}
            <button
              type="button"
              onClick={() => setIsNewOrderModalOpen(true)}
              className="bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-md shadow-[#F97316]/25 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Nova Ordem de Serviço</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== CARDS DE KPIS DA OFICINA ===================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Geral', val: tabCounts.todas, color: 'text-white', border: 'hover:border-slate-500', tab: 'todas' },
          { label: 'Aguardando', val: tabCounts.aguardando, color: 'text-slate-300', border: 'hover:border-slate-400', tab: 'aguardando' },
          { label: 'Em Execução', val: tabCounts.andamento, color: 'text-[#F97316]', border: 'hover:border-[#F97316]', tab: 'andamento' },
          { label: 'Prontos Retirada', val: tabCounts.pronto, color: 'text-blue-400', border: 'hover:border-blue-400', tab: 'pronto' },
          { label: 'Concluídas / Pagas', val: tabCounts.pago, color: 'text-emerald-400', border: 'hover:border-emerald-400', tab: 'pago' },
          { label: 'Canceladas', val: tabCounts.cancelado, color: 'text-rose-400', border: 'hover:border-rose-400', tab: 'cancelado' },
        ].map(kpi => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => setActiveTab(kpi.tab as typeof activeTab)}
            className={`p-3.5 rounded-2xl bg-[#141A24] border border-[#222C3D] text-left transition-all ${kpi.border} ${
              activeTab === kpi.tab ? 'ring-2 ring-[#F97316]/50 bg-[#1A2230]' : ''
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              {kpi.label}
            </span>
            <span className={`text-xl font-black font-mono mt-1 block ${kpi.color}`}>
              {kpi.val}
            </span>
          </button>
        ))}
      </div>

      {/* ===================== BARRA DE BUSCA & FILTROS ===================== */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, placa, modelo do carro, telefone, OS ou mecânico..."
            className="w-full bg-[#141A24] text-white placeholder-slate-400 text-xs sm:text-sm pl-11 pr-4 py-3.5 rounded-2xl border border-[#222C3D] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Abas Rápidas de Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'ativas', label: 'Na Oficina (Ativas)', count: tabCounts.ativas },
            { id: 'aguardando', label: 'Aguardando', count: tabCounts.aguardando },
            { id: 'andamento', label: 'Em Execução', count: tabCounts.andamento },
            { id: 'pronto', label: 'Prontos p/ Retirada', count: tabCounts.pronto },
            { id: 'pago', label: 'Pagas', count: tabCounts.pago },
            { id: 'cancelado', label: 'Canceladas', count: tabCounts.cancelado },
            { id: 'todas', label: 'Todas as OS', count: tabCounts.todas },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#F97316] text-white shadow-md font-black'
                  : 'bg-[#141A24] border border-[#222C3D] text-slate-400 hover:text-white hover:bg-[#1A2230]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === tab.id
                    ? 'bg-black/30 text-white font-black'
                    : 'bg-[#0F141C] text-slate-400 border border-[#222C3D]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ===================== ÁREA PRINCIPAL: KANBAN OU LISTA ===================== */}
      {viewMode === 'kanban' ? (
        /* ===================== MODO KANBAN AUTOMOTIVO ===================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
          {[
            { status: 'aguardando' as OrderStatus, title: 'Aguardando Entrada', color: 'border-slate-500/40 text-slate-300', dot: 'bg-slate-400' },
            { status: 'andamento' as OrderStatus, title: 'Em Execução', color: 'border-[#F97316]/50 text-[#F97316]', dot: 'bg-[#F97316]' },
            { status: 'pronto' as OrderStatus, title: 'Pronto p/ Retirada', color: 'border-blue-500/50 text-blue-400', dot: 'bg-blue-400' },
            { status: 'pago' as OrderStatus, title: 'Concluída & Paga', color: 'border-emerald-500/50 text-emerald-400', dot: 'bg-emerald-400' },
            { status: 'cancelado' as OrderStatus, title: 'Cancelada', color: 'border-rose-500/50 text-rose-400', dot: 'bg-rose-400' },
          ].map(col => {
            const colOrders = filteredOrders.filter(o => o.status === col.status)
            const colTotal = colOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

            return (
              <div
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={e => handleDropOnColumn(e, col.status)}
                className="rounded-3xl border border-[#222C3D] bg-[#0F141C]/80 p-3.5 flex flex-col gap-3 min-h-[460px] transition-colors"
              >
                {/* Cabeçalho da Coluna Kanban */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#222C3D] px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {col.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1A2230] text-slate-300 border border-[#2A364C]">
                    {colOrders.length}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 px-1 font-mono font-semibold flex justify-between">
                  <span>Subtotal etapa:</span>
                  <span className="text-white font-bold">{formatCurrency(colTotal)}</span>
                </div>

                {/* Lista de Cards da Coluna */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[75vh] pr-1">
                  {colOrders.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-[#222C3D]/80 p-4 text-[11px] text-slate-500">
                      Nenhuma OS nesta etapa
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <div
                        key={order.id}
                        draggable={true}
                        onDragStart={e => handleDragStart(e, order.id)}
                        onClick={() => {
                          setSelectedDetailOrder(order)
                          setDetailTab('resumo')
                        }}
                        className="p-3.5 rounded-2xl border border-[#222C3D] bg-[#141A24] hover:border-[#F97316]/60 hover:shadow-lg transition-all cursor-pointer space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-[#F97316]">
                            {order.number}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {order.date}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#F97316] transition-colors truncate">
                            {order.clientName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="truncate">{order.vehicleModel}</span>
                            <span className="font-mono text-[9px] font-black px-1.5 py-0.2 rounded bg-[#1A2230] border border-[#222C3D] text-[#F97316]">
                              {order.vehiclePlate}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {order.serviceDescription || 'Serviço Geral'}
                        </p>

                        <div className="pt-2 border-t border-[#222C3D] flex items-center justify-between">
                          <span className="text-xs font-black font-mono text-white">
                            {formatCurrency(order.totalAmount || 0)}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                handleOpenClientWhatsApp(order)
                              }}
                              className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                setPdfModalOrder(order)
                              }}
                              className="p-1 rounded-lg text-[#F97316] hover:bg-[#F97316]/20 transition-colors"
                              title="Imprimir O.S"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Botões Rápidos para Mover Status no Kanban */}
                        {col.status !== 'pago' && col.status !== 'cancelado' && (
                          <div className="pt-1 flex items-center gap-1.5">
                            {col.status === 'aguardando' && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation()
                                  updateOrderStatus(order.id, 'andamento')
                                  showToast(`OS #${order.number} em execução!`, 'info')
                                }}
                                className="w-full py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-[#F97316]/15 hover:bg-[#F97316]/30 text-[#F97316] border border-[#F97316]/30 flex items-center justify-center gap-1"
                              >
                                <span>Iniciar Execução</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                            {col.status === 'andamento' && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation()
                                  updateOrderStatus(order.id, 'pronto')
                                  showToast(`OS #${order.number} pronta p/ retirada!`, 'info')
                                }}
                                className="w-full py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 flex items-center justify-center gap-1"
                              >
                                <span>Marcar Pronto</span>
                                <CheckCircle2 className="h-3 w-3" />
                              </button>
                            )}
                            {col.status === 'pronto' && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation()
                                  setFinalizingOrder(order)
                                  setCheckoutPaymentMethod('pix')
                                  setCheckoutDiscount(order.discount || 0)
                                  setCheckoutInstallments(1)
                                }}
                                className="w-full py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1"
                              >
                                <span>Receber Venda</span>
                                <DollarSign className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ===================== MODO LISTA COMPACTA AUTOMOTIVA ===================== */
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#222C3D] bg-[#141A24]/60 p-12 text-center text-slate-400 space-y-3">
              <ClipboardList className="h-10 w-10 mx-auto text-slate-500 opacity-50" />
              <p className="text-sm font-bold text-white">Nenhuma ordem de serviço encontrada</p>
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Alterne os filtros acima ou abra uma nova OS no botão superior.
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
                    className="rounded-3xl border border-[#222C3D] bg-[#141A24] p-5 shadow-card hover:border-[#F97316]/50 transition-all flex flex-col justify-between gap-4 group"
                  >
                    {/* Cabeçalho do Card */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#222C3D]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDetailOrder(order)
                            setDetailTab('resumo')
                          }}
                          className="font-mono text-xs font-black text-[#F97316] bg-[#F97316]/10 border border-[#F97316]/30 px-3 py-1 rounded-xl hover:bg-[#F97316]/20 transition-colors"
                        >
                          {order.number}
                        </button>
                        <span className="text-xs text-slate-400 font-medium">{order.date}</span>
                        {hasFiscal && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-black text-emerald-400 font-mono">
                            <ShieldCheck className="h-3 w-3" /> NFS-e
                          </span>
                        )}
                      </div>

                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    {/* Conteúdo Principal do Card */}
                    <div className="space-y-3">
                      {/* Cliente & Telefone */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-[#F97316]/10 border border-[#F97316]/25 flex items-center justify-center text-[#F97316] shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              Cliente
                            </span>
                            <h3 className="text-sm font-bold text-white truncate">{order.clientName}</h3>
                          </div>
                        </div>
                        {order.clientPhone && (
                          <a
                            href={`tel:${order.clientPhone.replace(/\D/g, '')}`}
                            className="text-xs font-mono text-slate-300 bg-[#1A2230] px-2.5 py-1 rounded-lg border border-[#222C3D] hover:text-white flex items-center gap-1 shrink-0 transition-colors"
                          >
                            <Phone className="h-3 w-3 text-[#F97316]" />
                            {order.clientPhone}
                          </a>
                        )}
                      </div>

                      {/* Veículo, Placa, KM */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#1A2230] border border-[#222C3D] flex items-center gap-2 col-span-2">
                          <Car className="h-4 w-4 text-[#F97316] shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Veículo</span>
                            <span className="font-bold text-white block truncate">{order.vehicleModel}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#1A2230] border border-[#222C3D] text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Placa</span>
                          <span className="font-mono font-black text-[#F97316]">{order.vehiclePlate}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#1A2230] border border-[#222C3D] text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">KM</span>
                          <span className="font-mono font-bold text-white">
                            {order.mileage ? `${order.mileage.toLocaleString('pt-BR')} km` : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Serviço & Mecânico */}
                      <div className="p-3 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>Serviço Solicitado</span>
                          <span className="text-[#F97316] flex items-center gap-1">
                            <Wrench className="h-3 w-3" /> {order.mechanicAssigned || 'Roberto Silva'}
                          </span>
                        </div>
                        <p className="text-white font-semibold line-clamp-2">
                          {order.serviceDescription || 'Serviço Geral'}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Total da OS
                        </span>
                        <span className="font-mono text-xl font-black text-[#F97316]">
                          {formatCurrency(order.totalAmount || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="space-y-2 pt-2 border-t border-[#222C3D]">
                      {/* Botão de Checkout se não paga */}
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() => {
                            setFinalizingOrder(order)
                            setCheckoutPaymentMethod('pix')
                            setCheckoutDiscount(order.discount || 0)
                            setCheckoutInstallments(1)
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
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

                      {/* Barra com os botões utilitários */}
                      <div className="grid grid-cols-5 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDetailOrder(order)
                            setDetailTab('resumo')
                          }}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#1A2230] hover:bg-[#222C3D] text-white border border-[#222C3D] transition-all text-[11px] font-bold"
                          title="Ver Detalhes Completos"
                        >
                          <Eye className="h-4 w-4 text-[#F97316] shrink-0" />
                          <span className="truncate">Detalhes</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenClientWhatsApp(order)}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all text-[11px] font-bold"
                          title="Abrir WhatsApp do cliente"
                        >
                          <MessageCircle className="h-4 w-4 shrink-0" />
                          <span className="truncate">WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenNfse(order)}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 transition-all text-[11px] font-bold"
                          title="Nota Fiscal (NFS-e)"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">NFS-e</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPdfModalOrder(order)}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/25 transition-all text-[11px] font-bold"
                          title="Visualizar e Imprimir Ordem de Serviço"
                        >
                          <Printer className="h-4 w-4 shrink-0" />
                          <span className="truncate">O.S</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingOrder(order)}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#1A2230] hover:bg-[#222C3D] text-slate-300 border border-[#222C3D] transition-all text-[11px] font-bold"
                          title="Editar OS"
                        >
                          <Edit2 className="h-4 w-4 shrink-0" />
                          <span className="truncate">Editar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== NOVO MODAL DE DETALHES COMPLETOS DA OS ===================== */}
      {selectedDetailOrder && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-[32px] border border-[#222C3D] bg-[#141A24] p-5 sm:p-7 shadow-elevated space-y-6 my-auto max-h-[92vh] overflow-y-auto text-white">
            {/* Cabeçalho do Modal de Detalhes */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#222C3D]">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-[#F97316]/15 border border-[#F97316]/30 flex items-center justify-center text-[#F97316] shrink-0">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-[#F97316]">
                      {selectedDetailOrder.number}
                    </span>
                    {getStatusBadge(selectedDetailOrder.status)}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    {selectedDetailOrder.clientName} &bull; {selectedDetailOrder.vehicleModel} ({selectedDetailOrder.vehiclePlate})
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Total</span>
                  <span className="font-mono text-xl font-black text-[#F97316]">
                    {formatCurrency(selectedDetailOrder.totalAmount || 0)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDetailOrder(null)}
                  className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-[#1A2230] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Abas de Navegação Interna */}
            <div className="flex items-center gap-2 border-b border-[#222C3D] pb-1 overflow-x-auto">
              {[
                { id: 'resumo', label: '1. Resumo Geral' },
                { id: 'itens', label: '2. Serviços & Peças' },
                { id: 'diagnostico', label: '3. Diagnóstico & Vistoria' },
                { id: 'historico', label: '4. Histórico da OS' },
                { id: 'financeiro', label: '5. Financeiro & NFS-e' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id as typeof detailTab)}
                  className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded-xl transition-all ${
                    detailTab === tab.id
                      ? 'bg-[#F97316] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-[#1A2230]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conteúdo da Aba Selecionada */}
            <div className="space-y-4 min-h-[220px]">
              {detailTab === 'resumo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#F97316] block">
                      Dados do Cliente
                    </span>
                    <p className="text-sm font-bold text-white">{selectedDetailOrder.clientName}</p>
                    <p className="text-slate-400 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-[#F97316]" /> {selectedDetailOrder.clientPhone}
                    </p>
                    {selectedDetailOrder.clientCpfCnpj && (
                      <p className="text-slate-400 font-mono">CPF/CNPJ: {selectedDetailOrder.clientCpfCnpj}</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#F97316] block">
                      Dados do Veículo
                    </span>
                    <p className="text-sm font-bold text-white">{selectedDetailOrder.vehicleModel}</p>
                    <p className="text-slate-400 font-mono">
                      Placa: <strong className="text-[#F97316]">{selectedDetailOrder.vehiclePlate}</strong> &bull; KM: {selectedDetailOrder.mileage.toLocaleString('pt-BR')} km
                    </p>
                    <p className="text-slate-400 uppercase">
                      Combustível: <strong className="text-white">{selectedDetailOrder.fuelLevel || 'Médio'}</strong> &bull; Mecânico: <strong className="text-white">{selectedDetailOrder.mechanicAssigned}</strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-2 md:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Descrição Principal do Serviço
                    </span>
                    <p className="text-white text-sm font-semibold">
                      {selectedDetailOrder.serviceDescription || 'Revisão e Manutenção Geral'}
                    </p>
                    {selectedDetailOrder.observations && (
                      <p className="text-slate-400 text-xs italic mt-1">
                        Obs: {selectedDetailOrder.observations}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'itens' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-2xl border border-[#222C3D] bg-[#1A2230]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0F141C] text-slate-400 border-b border-[#222C3D] text-[11px] uppercase font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Serviço / Peça</th>
                          <th className="py-2.5 px-3 text-right">Peças</th>
                          <th className="py-2.5 px-3 text-right">Mão de Obra</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222C3D] text-white">
                        {selectedDetailOrder.items && selectedDetailOrder.items.length > 0 ? (
                          selectedDetailOrder.items.map(it => (
                            <tr key={it.id}>
                              <td className="py-2.5 px-3 font-semibold">{it.serviceDescription}</td>
                              <td className="py-2.5 px-3 font-mono text-right text-slate-400">
                                {formatCurrency(it.partsCost)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-right text-slate-400">
                                {formatCurrency(it.laborCost)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-right font-black text-[#F97316]">
                                {formatCurrency(it.total)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400">
                              Nenhum item discriminado individualmente.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1A2230] border border-[#222C3D] flex flex-wrap items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Peças: {formatCurrency(selectedDetailOrder.partsTotal || 0)}</span>
                    <span className="text-slate-400">Mão de Obra: {formatCurrency(selectedDetailOrder.laborTotal || 0)}</span>
                    {selectedDetailOrder.discount ? (
                      <span className="text-rose-400">Desconto: -{formatCurrency(selectedDetailOrder.discount)}</span>
                    ) : null}
                    <span className="text-base font-black text-[#F97316]">Total: {formatCurrency(selectedDetailOrder.totalAmount || 0)}</span>
                  </div>
                </div>
              )}

              {detailTab === 'diagnostico' && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#F97316] block">
                      Diagnóstico Técnico Registrado
                    </span>
                    <p className="text-white font-medium">
                      {selectedDetailOrder.serviceDescription}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Observações e Reclamação Relatada
                    </span>
                    <p className="text-slate-300">
                      {selectedDetailOrder.observations || 'Nenhuma avaria ou reclamação específica anotada.'}
                    </p>
                  </div>
                </div>
              )}

              {detailTab === 'historico' && (
                <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-3 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Linha do Tempo Operacional
                  </span>
                  <div className="space-y-3 border-l-2 border-[#F97316]/40 pl-4 ml-2">
                    <div>
                      <p className="font-bold text-white">Abertura da OS #{selectedDetailOrder.number}</p>
                      <p className="text-slate-400 text-[11px]">{selectedDetailOrder.date} {selectedDetailOrder.time ? `às ${selectedDetailOrder.time}` : ''}</p>
                    </div>
                    <div>
                      <p className="font-bold text-white">Status Atual: {selectedDetailOrder.status.toUpperCase()}</p>
                      <p className="text-slate-400 text-[11px]">Mecânico responsável: {selectedDetailOrder.mechanicAssigned}</p>
                    </div>
                    {selectedDetailOrder.status === 'pago' && (
                      <div>
                        <p className="font-bold text-emerald-400">Pagamento Confirmado</p>
                        <p className="text-slate-400 text-[11px]">
                          Forma: {PAYMENT_LABELS[selectedDetailOrder.paymentMethod || 'pix']} &bull; Total: {formatCurrency(selectedDetailOrder.totalAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'financeiro' && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Forma de Pagamento</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {PAYMENT_LABELS[selectedDetailOrder.paymentMethod || 'pendente']}
                        {selectedDetailOrder.paymentInstallments && selectedDetailOrder.paymentInstallments > 1 ? ` (${selectedDetailOrder.paymentInstallments}x)` : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Garantia Legal</span>
                      <span className="text-xs font-semibold text-emerald-400">90 dias (CDC)</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Nota Fiscal (NFS-e)</span>
                      <span className="text-xs font-semibold text-white">
                        {selectedDetailOrder.fiscalInvoice?.status === 'autorizada' ? '✓ Autorizada' : 'Pendente de Emissão'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ações Rápidas no Rodapé do Modal */}
            <div className="pt-4 border-t border-[#222C3D] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenClientWhatsApp(selectedDetailOrder)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => setPdfModalOrder(selectedDetailOrder)}
                  className="px-4 py-2.5 rounded-xl bg-[#F97316]/15 hover:bg-[#F97316]/25 text-[#F97316] border border-[#F97316]/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir / PDF
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenNfse(selectedDetailOrder)}
                  className="px-4 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  NFS-e
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedDetailOrder.status !== 'pago' && (
                  <button
                    type="button"
                    onClick={() => {
                      const tgt = selectedDetailOrder
                      setSelectedDetailOrder(null)
                      setFinalizingOrder(tgt)
                      setCheckoutPaymentMethod('pix')
                      setCheckoutDiscount(tgt.discount || 0)
                      setCheckoutInstallments(1)
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Receber Pagamento
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const tgt = selectedDetailOrder
                    setSelectedDetailOrder(null)
                    setEditingOrder(tgt)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#1A2230] hover:bg-[#222C3D] text-white border border-[#222C3D] font-bold text-xs flex items-center gap-1.5"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar OS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ASSISTENTE DE CRIAÇÃO EM 5 ETAPAS (STEPPER) ===================== */}
      {(isNewOrderModalOpen || editingOrder) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-[32px] border border-[#222C3D] bg-[#141A24] p-5 sm:p-7 shadow-elevated space-y-5 my-auto max-h-[92vh] overflow-y-auto text-white">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-[#222C3D]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#F97316]/15 border border-[#F97316]/30 flex items-center justify-center text-[#F97316]">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingOrder ? `Editar ${editingOrder.number}` : 'Nova Ordem de Serviço'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Assistente estruturado em 5 etapas para abertura e diagnóstico do serviço
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewOrderModalOpen(false)
                  setEditingOrder(null)
                  setShowClientSelector(false)
                }}
                className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-[#1A2230] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepper Visual (1 a 5) */}
            <div className="grid grid-cols-5 gap-1.5 text-center text-xs pb-2 border-b border-[#222C3D]">
              {[
                { step: 1 as const, label: '1. Cliente' },
                { step: 2 as const, label: '2. Veículo' },
                { step: 3 as const, label: '3. Diagnóstico' },
                { step: 4 as const, label: '4. Peças & Serviços' },
                { step: 5 as const, label: '5. Revisão' },
              ].map(st => (
                <button
                  key={st.step}
                  type="button"
                  onClick={() => setWizardStep(st.step)}
                  className={`py-2 px-1 rounded-xl font-bold transition-all truncate text-[11px] sm:text-xs ${
                    wizardStep === st.step
                      ? 'bg-[#F97316] text-white shadow-md'
                      : wizardStep > st.step
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#1A2230] text-slate-400 border border-[#222C3D]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Conteúdo da Etapa Atual do Wizard */}
            <div className="space-y-4">
              {/* ETAPA 1: CLIENTE */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-[#F97316] flex items-center gap-1.5">
                        <User className="h-4 w-4" /> Selecionar ou Cadastrar Cliente
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowClientSelector(prev => !prev)}
                        className="text-xs text-[#F97316] font-bold hover:underline flex items-center gap-1"
                      >
                        <Users className="h-3.5 w-3.5" />
                        {showClientSelector ? 'Fechar Lista' : 'Selecionar Cliente Existente'}
                      </button>
                    </div>

                    {showClientSelector && (
                      <div className="p-3 rounded-xl bg-[#0F141C] border border-[#222C3D] space-y-2">
                        <input
                          type="text"
                          value={clientSearchQuery}
                          onChange={e => setClientSearchQuery(e.target.value)}
                          placeholder="Pesquisar por nome, telefone ou CPF..."
                          className="w-full p-2.5 rounded-xl bg-[#141A24] text-white border border-[#222C3D] text-xs focus:border-[#F97316] outline-none"
                        />
                        <div className="max-h-36 overflow-y-auto space-y-1">
                          {filteredClientsList.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectExistingClient(c)}
                              className="w-full text-left p-2 rounded-lg hover:bg-[#1A2230] flex items-center justify-between text-xs transition-colors"
                            >
                              <span className="font-bold text-white">{c.name}</span>
                              <span className="font-mono text-slate-400 text-[11px]">{c.phone}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Nome Completo do Cliente *
                        </label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={e => setClientName(e.target.value)}
                          placeholder="Ex: João da Silva"
                          className="w-full p-3 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Telefone / WhatsApp *
                        </label>
                        <input
                          type="text"
                          value={clientPhone}
                          onChange={e => setClientPhone(e.target.value)}
                          placeholder="(63) 99999-0000"
                          className="w-full p-3 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none font-mono"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          CPF / CNPJ <span className="text-slate-500 font-normal">(Opcional)</span>
                        </label>
                        <input
                          type="text"
                          value={clientCpfCnpj}
                          onChange={e => setClientCpfCnpj(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full p-3 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!clientName.trim()) {
                          showToast('Preencha o nome do cliente para prosseguir.', 'warning')
                          return
                        }
                        setWizardStep(2)
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                    >
                      <span>Avançar para Veículo</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 2: VEÍCULO */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  {selectedClientVehicles.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-2">
                      <span className="text-xs font-bold text-[#F97316] block">
                        Veículos já vinculados a este cliente:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedClientVehicles.map(v => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setVehicleModel(`${v.brand} ${v.model}`.trim())
                              setVehiclePlate(v.plate)
                              if (v.currentMileage) setMileage(v.currentMileage)
                              showToast(`Veículo ${v.plate} selecionado!`, 'info')
                            }}
                            className="p-2.5 rounded-xl bg-[#141A24] border border-[#222C3D] hover:border-[#F97316] flex items-center justify-between text-left text-xs transition-colors"
                          >
                            <span className="font-bold text-white">{v.brand} {v.model}</span>
                            <span className="font-mono text-[#F97316] font-bold">{v.plate}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-[#F97316] flex items-center gap-1.5">
                      <Car className="h-4 w-4" /> Dados do Veículo
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Marca e Modelo do Carro *
                        </label>
                        <input
                          type="text"
                          value={vehicleModel}
                          onChange={e => setVehicleModel(e.target.value)}
                          placeholder="Ex: Honda Civic 2.0"
                          className="w-full p-3 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Placa do Veículo *
                        </label>
                        <input
                          type="text"
                          value={vehiclePlate}
                          onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
                          placeholder="ABC1D23"
                          className="w-full p-3 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none font-mono uppercase font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Quilometragem (KM de Entrada)
                        </label>
                        <input
                          type="number"
                          value={mileage || ''}
                          onChange={e => setMileage(Number(e.target.value) || 0)}
                          placeholder="Ex: 85000"
                          className="w-full p-3 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Nível de Combustível
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'reserva', label: 'Reserva' },
                            { id: 'medio', label: 'Médio' },
                            { id: 'cheio', label: 'Cheio' },
                          ].map(f => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setFuelLevel(f.id as FuelStatus)}
                              className={`py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                                fuelLevel === f.id
                                  ? 'bg-[#F97316] text-white border-[#F97316]'
                                  : 'bg-[#141A24] text-slate-400 border-[#222C3D] hover:text-white'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-5 py-3 rounded-2xl bg-[#1A2230] text-slate-300 font-bold text-xs uppercase flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!vehiclePlate.trim() && !vehicleModel.trim()) {
                          showToast('Preencha o modelo ou placa do veículo.', 'warning')
                          return
                        }
                        setWizardStep(3)
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                    >
                      <span>Avançar para Diagnóstico</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 3: DIAGNÓSTICO E SERVIÇO */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-[#F97316] flex items-center gap-1.5">
                      <Wrench className="h-4 w-4" /> Reclamação &amp; Diagnóstico Técnico
                    </span>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Reclamação Relatada pelo Cliente / Serviço Solicitado *
                        </label>
                        <input
                          type="text"
                          value={serviceDescription}
                          onChange={e => setServiceDescription(e.target.value)}
                          placeholder="Ex: Barulho na suspensão dianteira ao passar em lombadas"
                          className="w-full p-3 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Mecânico Responsável Atribuído
                        </label>
                        <select
                          value={mechanicAssigned}
                          onChange={e => setMechanicAssigned(e.target.value)}
                          className="w-full p-3 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none font-bold"
                        >
                          {(mechanics || ['Roberto Silva', 'Carlos Eduardo', 'Marcos Oficina']).map(m => (
                            <option key={m} value={m} className="bg-[#141A24] text-white">
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Observações Gerais de Entrada / Vistoria
                        </label>
                        <textarea
                          rows={2}
                          value={observations}
                          onChange={e => setObservations(e.target.value)}
                          placeholder="Ex: Riscos no para-choque traseiro, estepe e macaco conferidos."
                          className="w-full p-3 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-5 py-3 rounded-2xl bg-[#1A2230] text-slate-300 font-bold text-xs uppercase flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="px-6 py-3 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                    >
                      <span>Avançar para Peças &amp; Serviços</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 4: PEÇAS E SERVIÇOS */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-[#F97316] flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" /> Adicionar Peças &amp; Mão de Obra
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPresetsDropdown(prev => !prev)}
                        className="text-xs text-[#F97316] font-bold hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Catálogo de Predefinições
                      </button>
                    </div>

                    {showPresetsDropdown && (
                      <div className="p-3 rounded-xl bg-[#0F141C] border border-[#222C3D] space-y-1.5 max-h-36 overflow-y-auto">
                        {(servicePresets || []).map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPreset(p)}
                            className="w-full text-left p-2 rounded-lg hover:bg-[#1A2230] flex items-center justify-between text-xs transition-colors"
                          >
                            <span className="font-bold text-white">{p.name}</span>
                            <span className="font-mono text-[#F97316]">{formatCurrency((p.partsCost || 0) + (p.laborCost || 0))}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Descrição do Item</label>
                        <input
                          type="text"
                          value={itemDesc}
                          onChange={e => setItemDesc(e.target.value)}
                          placeholder="Ex: Jogo de Pastilhas de Freio"
                          className="w-full p-2.5 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Valor Peças (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={itemPartsCost}
                          onChange={e => setItemPartsCost(e.target.value)}
                          placeholder="0,00"
                          className="w-full p-2.5 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Mão de Obra (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={itemLaborCost}
                          onChange={e => setItemLaborCost(e.target.value)}
                          placeholder="0,00"
                          className="w-full p-2.5 rounded-xl bg-[#141A24] text-white border border-[#222C3D] focus:border-[#F97316] outline-none font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-2.5 rounded-xl bg-[#141A24] hover:bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/40 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Item à OS</span>
                    </button>

                    {/* Tabela de Itens Adicionados */}
                    {items.length > 0 && (
                      <div className="overflow-x-auto rounded-xl border border-[#222C3D] bg-[#0F141C]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#141A24] text-slate-400 border-b border-[#222C3D] text-[10px] uppercase font-bold">
                            <tr>
                              <th className="py-2 px-3">Item / Serviço</th>
                              <th className="py-2 px-3 text-right">Peças</th>
                              <th className="py-2 px-3 text-right">M.O</th>
                              <th className="py-2 px-3 text-right">Total</th>
                              <th className="py-2 px-2 w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#222C3D] text-white">
                            {items.map(it => (
                              <tr key={it.id}>
                                <td className="py-2 px-3 font-semibold">{it.serviceDescription}</td>
                                <td className="py-2 px-3 font-mono text-right text-slate-400">{formatCurrency(it.partsCost)}</td>
                                <td className="py-2 px-3 font-mono text-right text-slate-400">{formatCurrency(it.laborCost)}</td>
                                <td className="py-2 px-3 font-mono text-right font-black text-[#F97316]">{formatCurrency(it.total)}</td>
                                <td className="py-2 px-2 text-center">
                                  <button type="button" onClick={() => handleRemoveItem(it.id)} className="text-rose-400 hover:text-rose-300">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-[#0F141C] border border-[#222C3D] flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Peças: {formatCurrency(calculatedPartsTotal)}</span>
                      <span className="text-slate-400">M.O: {formatCurrency(calculatedLaborTotal)}</span>
                      <span className="text-sm font-black text-[#F97316]">Total: {formatCurrency(calculatedGrandTotal)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="px-5 py-3 rounded-2xl bg-[#1A2230] text-slate-300 font-bold text-xs uppercase flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWizardStep(5)}
                      className="px-6 py-3 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                    >
                      <span>Avançar para Revisão</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 5: REVISÃO & CONFIRMAÇÃO */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1A2230] border border-[#222C3D] space-y-3 text-xs">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Revisão Geral da Ordem de Serviço
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#141A24] border border-[#222C3D] space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Cliente</span>
                        <p className="font-bold text-white">{clientName}</p>
                        <p className="font-mono text-slate-400">{clientPhone}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#141A24] border border-[#222C3D] space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Veículo</span>
                        <p className="font-bold text-white">{vehicleModel}</p>
                        <p className="font-mono text-[#F97316] font-bold">{vehiclePlate}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#141A24] border border-[#222C3D] space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Serviço &amp; Mecânico</span>
                      <p className="font-bold text-white">{serviceDescription || 'Serviço Geral'}</p>
                      <p className="text-slate-400">Responsável: <strong className="text-white">{mechanicAssigned}</strong></p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0F141C] border border-[#222C3D] flex items-center justify-between font-mono">
                      <span className="text-slate-400">Total de Itens: {items.length}</span>
                      <span className="text-base font-black text-[#F97316]">
                        Valor Total da OS: {formatCurrency(calculatedGrandTotal)}
                      </span>
                    </div>

                    {/* Status Inicial */}
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Status Inicial da OS:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormStatus('aguardando')}
                          className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                            formStatus === 'aguardando'
                              ? 'bg-[#1A2230] text-white border-[#F97316] ring-2 ring-[#F97316]/30'
                              : 'bg-[#141A24] text-slate-400 border-[#222C3D]'
                          }`}
                        >
                          Aguardando Entrada
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormStatus('andamento')}
                          className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                            formStatus === 'andamento'
                              ? 'bg-[#F97316] text-white border-[#F97316]'
                              : 'bg-[#141A24] text-slate-400 border-[#222C3D]'
                          }`}
                        >
                          Em Execução
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="px-5 py-3 rounded-2xl bg-[#1A2230] text-slate-300 font-bold text-xs uppercase flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveOrder}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2"
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>{editingOrder ? 'Salvar Alterações da OS' : 'Salvar e Abrir Ordem de Serviço'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: PAINEL DE VENDA (CHECKOUT AO MARCAR COMO PRONTO) ===================== */}
      {finalizingOrder && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[32px] border border-[#222C3D] bg-[#141A24] p-6 sm:p-8 shadow-elevated space-y-6 my-auto text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#222C3D]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Painel de Venda &amp; Pagamento</h3>
                  <p className="text-xs text-slate-400">
                    Finalização da OS {finalizingOrder.number} &bull; {finalizingOrder.clientName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFinalizingOrder(null)}
                className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-[#1A2230] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F141C] border border-[#222C3D] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Peças:</span>
                <span>{formatCurrency(finalizingOrder.partsTotal || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Mão de Obra:</span>
                <span>{formatCurrency(finalizingOrder.laborTotal || 0)}</span>
              </div>
              {checkoutDiscount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Desconto Concedido:</span>
                  <span>- {formatCurrency(checkoutDiscount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#222C3D] flex justify-between text-base font-black text-[#F97316]">
                <span>Total a Cobrar:</span>
                <span>
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
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Método de Pagamento
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'pix', label: 'PIX' },
                  { id: 'cartao_credito', label: 'Crédito' },
                  { id: 'cartao_debito', label: 'Débito' },
                  { id: 'dinheiro', label: 'Dinheiro' },
                  { id: 'pagar_depois', label: 'A Prazo (Fiado)' },
                  { id: 'boleto', label: 'Boleto' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCheckoutPaymentMethod(m.id as PaymentMethod)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      checkoutPaymentMethod === m.id
                        ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                        : 'bg-[#1A2230] text-slate-300 border-[#222C3D] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {checkoutPaymentMethod === 'cartao_credito' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Parcelamento</label>
                <select
                  value={checkoutInstallments}
                  onChange={e => setCheckoutInstallments(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#1A2230] text-white border border-[#222C3D] text-xs font-bold font-mono outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                    <option key={n} value={n} className="bg-[#141A24]">
                      {n === 1 ? '1x à vista' : `${n}x parcelado`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {checkoutPaymentMethod === 'pagar_depois' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Data de Vencimento Combinada</label>
                <input
                  type="date"
                  value={checkoutDueDate}
                  onChange={e => setCheckoutDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1A2230] text-white border border-[#222C3D] text-xs font-mono outline-none"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-3 border-t border-[#222C3D]">
              <button
                type="button"
                onClick={handleConfirmCheckout}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmar Pagamento &bull; Dar Baixa</span>
              </button>
              <button
                type="button"
                onClick={() => setFinalizingOrder(null)}
                className="px-5 py-3.5 rounded-2xl bg-[#1A2230] text-slate-300 font-bold text-xs uppercase"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: SUCESSO DO PAGAMENTO ===================== */}
      {completedPaymentOrder && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-[32px] border border-emerald-500/40 bg-[#141A24] p-6 sm:p-8 shadow-elevated space-y-6 text-center text-white">
            <div className="h-16 w-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Pagamento Confirmado!</h3>
              <p className="text-xs text-slate-400">
                A OS <strong className="text-[#F97316] font-mono">{completedPaymentOrder.number}</strong> foi quitada com sucesso.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  const target = completedPaymentOrder
                  setCompletedPaymentOrder(null)
                  handleOpenNfse(target)
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <FileText className="h-4 w-4" />
                <span>Visualizar / Compartilhar Nota Fiscal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = completedPaymentOrder
                  setCompletedPaymentOrder(null)
                  setWhatsAppModalOrder(target)
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Enviar Comprovante no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setCompletedPaymentOrder(null)}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: WHATSAPP ===================== */}
      {whatsAppModalOrder && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-[32px] border border-[#222C3D] bg-[#141A24] p-6 shadow-elevated space-y-4 my-auto text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#222C3D]">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Comprovante de OS para WhatsApp</h3>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppModalOrder(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-[#222C3D] bg-[#0F141C] p-2 flex items-center justify-center min-h-[280px]">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt={`OS ${whatsAppModalOrder.number}`}
                  className="rounded-xl max-h-[50vh] w-auto shadow-md"
                />
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin text-[#F97316]" />
                  <span>Gerando comprovante oficial da OS...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleDirectShare}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{copyFeedback ? '✓ Copiado! Abrindo WhatsApp' : 'Compartilhar no WhatsApp'}</span>
              </button>

              {generatedImageUrl && (
                <a
                  href={generatedImageUrl}
                  download={`OS-${whatsAppModalOrder.number}.png`}
                  className="p-3 rounded-2xl bg-[#1A2230] text-slate-300 hover:text-white border border-[#222C3D]"
                  title="Baixar imagem"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: IMPRESSÃO OFICIAL DA OS (PDF) ===================== */}
      {pdfModalOrder && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-[32px] border border-[#222C3D] bg-white text-slate-900 p-6 sm:p-8 shadow-elevated space-y-6 my-auto max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Visualização de Impressão Oficial &bull; OS #{pdfModalOrder.number}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#F97316] text-white font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir Agora</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPdfModalOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Documento Impresso Oficial */}
            <div className="space-y-6 text-xs text-slate-800">
              <div className="flex items-center justify-between border-b-2 border-[#F97316] pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">WR MECÂNICA &amp; CIA</h2>
                  <p className="text-slate-600">Serviços Mecânicos Especializados &bull; Luzimangues / Porto Nacional - TO</p>
                  <p className="text-[11px] text-slate-500">WhatsApp: (63) 99234-5678</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl font-black text-[#F97316] block">OS #{pdfModalOrder.number}</span>
                  <span className="text-[11px] text-slate-500">Data: {pdfModalOrder.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Cliente</span>
                  <p className="font-bold text-slate-900">{pdfModalOrder.clientName}</p>
                  <p className="text-slate-600">Tel: {pdfModalOrder.clientPhone}</p>
                  {pdfModalOrder.clientCpfCnpj && <p className="text-slate-600">CPF: {pdfModalOrder.clientCpfCnpj}</p>}
                </div>

                <div className="p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Veículo</span>
                  <p className="font-bold text-slate-900">{pdfModalOrder.vehicleModel}</p>
                  <p className="text-slate-600">Placa: <strong className="text-slate-900">{pdfModalOrder.vehiclePlate}</strong> &bull; KM: {pdfModalOrder.mileage}</p>
                  <p className="text-slate-600">Mecânico: {pdfModalOrder.mechanicAssigned}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Serviços e Peças Realizados</span>
                <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Descrição</th>
                      <th className="p-2.5 text-right">Peças</th>
                      <th className="p-2.5 text-right">M.O</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pdfModalOrder.items && pdfModalOrder.items.length > 0 ? (
                      pdfModalOrder.items.map(it => (
                        <tr key={it.id}>
                          <td className="p-2.5 font-semibold">{it.serviceDescription}</td>
                          <td className="p-2.5 text-right font-mono">{formatCurrency(it.partsCost)}</td>
                          <td className="p-2.5 text-right font-mono">{formatCurrency(it.laborCost)}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(it.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-2.5 font-semibold">{pdfModalOrder.serviceDescription}</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(pdfModalOrder.partsTotal)}</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(pdfModalOrder.laborTotal)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(pdfModalOrder.totalAmount)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span>Peças:</span>
                    <span>{formatCurrency(pdfModalOrder.partsTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mão de Obra:</span>
                    <span>{formatCurrency(pdfModalOrder.laborTotal || 0)}</span>
                  </div>
                  {pdfModalOrder.discount ? (
                    <div className="flex justify-between text-rose-600">
                      <span>Desconto:</span>
                      <span>-{formatCurrency(pdfModalOrder.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                    <span>Valor Total:</span>
                    <span>{formatCurrency(pdfModalOrder.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 text-center">
                Documento de conferência de Ordem de Serviço &bull; Garantia de 90 dias conforme Art. 26 do CDC
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
