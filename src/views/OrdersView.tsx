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
  Play,
  ArrowUpRight,
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
  const [clientCpf, setClientCpf] = useState('')

  const [vehicleModel, setVehicleModel] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [mileage, setMileage] = useState<number>(0)
  const [fuelLevel, setFuelLevel] = useState<FuelStatus>('medio')

  const [serviceDescription, setServiceDescription] = useState('')
  const [mechanicAssigned, setMechanicAssigned] = useState('')
  const [observations, setObservations] = useState('')

  // Itens de Serviço
  const [items, setItems] = useState<OrderItem[]>([])
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemParts, setNewItemParts] = useState<number>(0)
  const [newItemLabor, setNewItemLabor] = useState<number>(0)

  // Desconto e Pagamento (para finalização)
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<PaymentMethod>('pix')
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0)
  const [checkoutInstallments, setCheckoutInstallments] = useState<number>(1)
  const [checkoutDueDate, setCheckoutDueDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })

  // Sincroniza Mecânico Padrão
  useEffect(() => {
    if (mechanics && mechanics.length > 0 && !mechanicAssigned) {
      setMechanicAssigned(mechanics[0])
    }
  }, [mechanics, mechanicAssigned])

  // Processar Pré-preenchimento ao abrir modal vindo de agendamento ou cliente
  useEffect(() => {
    if (orderPrefill) {
      setClientName(orderPrefill.clientName || '')
      setClientPhone(orderPrefill.clientPhone || '')
      setVehicleModel(orderPrefill.vehicleModel || '')
      setVehiclePlate(orderPrefill.vehiclePlate || '')
      setServiceDescription(orderPrefill.serviceDescription || '')
      if (orderPrefill.clientId) setSelectedClientId(orderPrefill.clientId)
      setWizardStep(1)
      setIsNewOrderModalOpen(true)
      setOrderPrefill(null)
    }
  }, [orderPrefill, setOrderPrefill, setIsNewOrderModalOpen])

  // Resetar formulário
  const resetForm = () => {
    setFormStatus('aguardando')
    setSelectedClientId('')
    setClientName('')
    setClientPhone('')
    setClientCpf('')
    setVehicleModel('')
    setVehiclePlate('')
    setMileage(0)
    setFuelLevel('medio')
    setServiceDescription('')
    setMechanicAssigned(mechanics[0] || 'Roberto Silva')
    setObservations('')
    setItems([])
    setNewItemDesc('')
    setNewItemParts(0)
    setNewItemLabor(0)
    setWizardStep(1)
    setShowClientSelector(false)
    setClientSearchQuery('')
    setEditingOrder(null)
  }

  // Preencher dados ao editar uma OS
  useEffect(() => {
    if (editingOrder) {
      setFormStatus(editingOrder.status)
      setSelectedClientId(editingOrder.clientId || '')
      setClientName(editingOrder.clientName)
      setClientPhone(editingOrder.clientPhone)
      setClientCpf(editingOrder.clientCpfCnpj || '')
      setVehicleModel(editingOrder.vehicleModel)
      setVehiclePlate(editingOrder.vehiclePlate)
      setMileage(editingOrder.mileage || 0)
      setFuelLevel(editingOrder.fuelLevel || 'medio')
      setServiceDescription(editingOrder.serviceDescription)
      setMechanicAssigned(editingOrder.mechanicAssigned)
      setObservations(editingOrder.observations || '')
      setItems(editingOrder.items || [])
      setWizardStep(1)
      setIsNewOrderModalOpen(true)
    }
  }, [editingOrder, setIsNewOrderModalOpen])

  // Gerar Canvas para WhatsApp sempre que abrir modal de WhatsApp
  useEffect(() => {
    if (!whatsAppModalOrder) {
      setGeneratedImageUrl('')
      setImageBlob(null)
      setCopyFeedback(false)
      return
    }

    let isMounted = true
    generateOsCanvas(whatsAppModalOrder, DEFAULT_WORKSHOP_INFO)
      .then(canvas => {
        if (!isMounted) return
        const url = canvas.toDataURL('image/png')
        setGeneratedImageUrl(url)
        canvas.toBlob(blob => {
          if (isMounted && blob) {
            setImageBlob(blob)
          }
        }, 'image/png')
      })
      .catch(err => {
        console.error('Erro ao gerar imagem da OS:', err)
      })

    return () => {
      isMounted = false
    }
  }, [whatsAppModalOrder])

  // Adicionar item de serviço à OS
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newItemDesc.trim()) {
      showToast('Informe a descrição do serviço ou peça.', 'warning')
      return
    }

    const pCost = Number(newItemParts) || 0
    const lCost = Number(newItemLabor) || 0
    const itemTotal = pCost + lCost

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      serviceDescription: newItemDesc.trim(),
      partsCost: pCost,
      laborCost: lCost,
      total: itemTotal,
    }

    setItems(prev => [...prev, newItem])
    setNewItemDesc('')
    setNewItemParts(0)
    setNewItemLabor(0)
  }

  // Adicionar item pré-definido com 1 clique
  const handleAddPreset = (preset: ServicePreset) => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      serviceDescription: preset.name,
      partsCost: preset.partsCost,
      laborCost: preset.laborCost,
      total: preset.partsCost + preset.laborCost,
    }
    setItems(prev => [...prev, newItem])
    showToast(`Adicionado: ${preset.name}`, 'info')
  }

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id))
  }

  // Cálculos de totais
  const partsTotal = items.reduce((sum, it) => sum + (it.partsCost || 0), 0)
  const laborTotal = items.reduce((sum, it) => sum + (it.laborCost || 0), 0)
  const itemsGrandTotal = partsTotal + laborTotal

  // Seleção de cliente já existente
  const filteredExistingClients = useMemo(() => {
    if (!clientSearchQuery.trim()) return clients.slice(0, 8)
    const q = clientSearchQuery.toLowerCase().trim()
    return clients.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.cpfCnpj && c.cpfCnpj.includes(q))
    )
  }, [clients, clientSearchQuery])

  const handleSelectExistingClient = (c: typeof clients[0]) => {
    setSelectedClientId(c.id)
    setClientName(c.name)
    setClientPhone(c.phone)
    setClientCpf(c.cpfCnpj || '')
    setShowClientSelector(false)

    // Busca veículos deste cliente para autocompletar
    const clientVehs = vehicles.filter(v => v.clientId === c.id)
    if (clientVehs.length > 0) {
      const v = clientVehs[0]
      setVehicleModel(`${v.brand} ${v.model}`.trim())
      setVehiclePlate(v.plate)
      if (v.currentMileage) setMileage(v.currentMileage)
    }
    showToast(`Cliente selecionado: ${c.name}`, 'info')
  }

  const selectedClientVehicles = useMemo(() => {
    if (!selectedClientId) return []
    return vehicles.filter(v => v.clientId === selectedClientId)
  }, [selectedClientId, vehicles])

  // Salvar Ordem de Serviço (Criar ou Atualizar)
  const handleSaveOrder = () => {
    if (!clientName.trim()) {
      showToast('Por favor, informe o nome do cliente.', 'warning')
      setWizardStep(1)
      return
    }
    if (!vehicleModel.trim() && !vehiclePlate.trim()) {
      showToast('Por favor, informe o modelo ou a placa do veículo.', 'warning')
      setWizardStep(2)
      return
    }

    let finalClientId = selectedClientId
    if (!finalClientId) {
      const created = addClient({
        name: clientName.trim(),
        phone: clientPhone.trim() || '(63) 99999-0000',
        cpfCnpj: clientCpf.trim() || undefined,
      })
      finalClientId = created.id
    }

    if (vehiclePlate.trim()) {
      const existingVehicle = vehicles.find(
        v => v.plate.toUpperCase().trim() === vehiclePlate.toUpperCase().trim()
      )
      if (!existingVehicle) {
        addVehicle({
          clientId: finalClientId || `cli-${Date.now()}`,
          clientName: clientName.trim(),
          brand: vehicleModel.split(' ')[0] || 'Geral',
          model: vehicleModel.trim(),
          plate: vehiclePlate.toUpperCase().trim(),
          year: new Date().getFullYear(),
          currentMileage: mileage || 0,
        })
      }
    }

    if (editingOrder) {
      updateOrder(editingOrder.id, {
        status: formStatus,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientCpfCnpj: clientCpf.trim() || undefined,
        vehicleModel: vehicleModel.trim(),
        vehiclePlate: vehiclePlate.toUpperCase().trim(),
        mileage,
        fuelLevel,
        serviceDescription: serviceDescription.trim() || (items[0]?.serviceDescription || 'Revisão Geral'),
        mechanicAssigned: mechanicAssigned || 'Roberto Silva',
        observations: observations.trim() || '',
        items,
        partsTotal,
        laborTotal,
        totalAmount: partsTotal + laborTotal,
      })
      setEditingOrder(null)
      setIsNewOrderModalOpen(false)
      showToast('Ordem de Serviço atualizada com sucesso!', 'success')
      return
    }

    addOrder({
      status: formStatus,
      date: new Date().toLocaleDateString('pt-BR'),
      clientId: finalClientId || `cli-${Date.now()}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || '(63) 99999-0000',
      clientCpfCnpj: clientCpf.trim() || undefined,
      vehicleModel: vehicleModel.trim(),
      vehiclePlate: vehiclePlate.toUpperCase().trim(),
      mileage,
      fuelLevel,
      serviceDescription: serviceDescription.trim() || (items[0]?.serviceDescription || 'Revisão Geral'),
      mechanicAssigned: mechanicAssigned || 'Roberto Silva',
      observations: observations.trim() || '',
      items,
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
    resetForm()
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="h-3.5 w-3.5" />
            Aguardando
          </span>
        )
      case 'andamento':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-wr-orange/15 text-wr-orange border border-wr-orange/30 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-wr-orange animate-pulse" />
            Em Execução
          </span>
        )
      case 'pronto':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Pronto p/ Retirada
          </span>
        )
      case 'pago':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <DollarSign className="h-3.5 w-3.5" />
            Concluída &amp; Paga
          </span>
        )
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="h-3.5 w-3.5" />
            Cancelada
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-wr-elevated text-wr-muted border border-wr-border">
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
      {/* ===================== TOPO EXECUTIVO: DESIGN ADAPTÁVEL CLARO / ESCURO ===================== */}
      <div className="relative rounded-3xl border border-wr-border bg-wr-surface p-5 sm:p-6 shadow-card overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-wr-orange/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wr-orange/15 border border-wr-orange/30 text-[11px] font-black uppercase tracking-wider text-wr-orange">
              <Sparkles className="h-3.5 w-3.5" />
              Gestão Dinâmica de Ordens de Serviço
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-wr-text tracking-tight flex items-center gap-2.5">
              <ClipboardList className="h-6 w-6 text-wr-orange" />
              Ordens de Serviço &bull; WR Mecânica
            </h1>
            <p className="text-xs text-wr-muted max-w-xl">
              Gerencie atendimentos com quadro visual Kanban ou lista analítica, controle de peças, mão de obra e faturamento integrado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Alternador de Visualização: Lista vs Kanban */}
            <div className="inline-flex items-center rounded-2xl bg-wr-elevated border border-wr-border p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-wr-orange text-white shadow-sm'
                    : 'text-wr-muted hover:text-wr-text'
                }`}
                title="Visualização em Quadro Kanban"
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>Quadro Kanban</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('lista')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'lista'
                    ? 'bg-wr-orange text-white shadow-sm'
                    : 'text-wr-muted hover:text-wr-text'
                }`}
                title="Visualização em Lista Detalhada"
              >
                <List className="h-3.5 w-3.5" />
                <span>Lista</span>
              </button>
            </div>

            {/* Botão de Criação de OS com Assistente */}
            <button
              type="button"
              onClick={() => {
                resetForm()
                setIsNewOrderModalOpen(true)
              }}
              className="wr-btn-primary px-5 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-wr-orange/20"
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
          { label: 'Total Geral', val: tabCounts.todas, color: 'text-wr-text', border: 'hover:border-wr-borderHover', tab: 'todas' },
          { label: 'Aguardando', val: tabCounts.aguardando, color: 'text-amber-500', border: 'hover:border-amber-500/50', tab: 'aguardando' },
          { label: 'Em Execução', val: tabCounts.andamento, color: 'text-wr-orange', border: 'hover:border-wr-orange/50', tab: 'andamento' },
          { label: 'Prontos Retirada', val: tabCounts.pronto, color: 'text-blue-500', border: 'hover:border-blue-500/50', tab: 'pronto' },
          { label: 'Concluídas / Pagas', val: tabCounts.pago, color: 'text-emerald-500', border: 'hover:border-emerald-500/50', tab: 'pago' },
          { label: 'Canceladas', val: tabCounts.cancelado, color: 'text-rose-500', border: 'hover:border-rose-500/50', tab: 'cancelado' },
        ].map(kpi => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => setActiveTab(kpi.tab as typeof activeTab)}
            className={`p-3.5 rounded-2xl bg-wr-surface border border-wr-border text-left transition-all shadow-xs ${kpi.border} ${
              activeTab === kpi.tab ? 'ring-2 ring-wr-orange/50 bg-wr-elevated' : ''
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-wr-muted block truncate">
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-wr-muted pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, placa, modelo do carro, telefone, OS ou mecânico..."
            className="w-full bg-wr-surface text-wr-text placeholder-wr-muted text-xs sm:text-sm pl-11 pr-4 py-3.5 rounded-2xl border border-wr-border focus:border-wr-orange focus:ring-2 focus:ring-wr-orange/20 outline-none transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-wr-muted hover:text-wr-text"
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
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl font-bold transition-all shadow-xs ${
                activeTab === tab.id
                  ? 'bg-wr-orange text-white font-black shadow-sm'
                  : 'bg-wr-surface border border-wr-border text-wr-muted hover:text-wr-text hover:bg-wr-elevated'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === tab.id
                    ? 'bg-black/25 text-white font-black'
                    : 'bg-wr-elevated text-wr-muted border border-wr-border'
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
        /* ===================== MODO KANBAN MODERNO ===================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
          {[
            { status: 'aguardando' as OrderStatus, title: 'Aguardando Entrada', dot: 'bg-amber-500' },
            { status: 'andamento' as OrderStatus, title: 'Em Execução', dot: 'bg-wr-orange' },
            { status: 'pronto' as OrderStatus, title: 'Pronto p/ Retirada', dot: 'bg-blue-500' },
            { status: 'pago' as OrderStatus, title: 'Concluída & Paga', dot: 'bg-emerald-500' },
            { status: 'cancelado' as OrderStatus, title: 'Cancelada', dot: 'bg-rose-500' },
          ].map(col => {
            const colOrders = filteredOrders.filter(o => o.status === col.status)
            const colTotal = colOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

            return (
              <div
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={e => handleDropOnColumn(e, col.status)}
                className="rounded-3xl border border-wr-border bg-wr-surface/70 dark:bg-wr-surfaceDark/60 p-3.5 flex flex-col gap-3 min-h-[460px] transition-colors shadow-xs"
              >
                {/* Cabeçalho da Coluna Kanban */}
                <div className="flex items-center justify-between pb-2.5 border-b border-wr-border px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <span className="text-xs font-black uppercase tracking-wider text-wr-text">
                      {col.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-wr-elevated text-wr-text border border-wr-border">
                    {colOrders.length}
                  </span>
                </div>

                <div className="text-[10px] text-wr-muted px-1 font-mono font-semibold flex justify-between">
                  <span>Subtotal etapa:</span>
                  <span className="text-wr-text font-bold">{formatCurrency(colTotal)}</span>
                </div>

                {/* Lista de Cards da Coluna */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[75vh] pr-1">
                  {colOrders.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-wr-border p-4 text-[11px] text-wr-muted">
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
                        className="p-3.5 rounded-2xl border border-wr-border bg-wr-surface hover:border-wr-orange/60 hover:shadow-card transition-all cursor-pointer space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-wr-orange">
                            {order.number}
                          </span>
                          <span className="text-[10px] text-wr-muted font-medium">
                            {order.date}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-wr-text group-hover:text-wr-orange transition-colors truncate">
                            {order.clientName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-wr-muted mt-0.5">
                            <span className="truncate">{order.vehicleModel}</span>
                            <span className="font-mono text-[9px] font-black px-1.5 py-0.2 rounded bg-wr-elevated border border-wr-border text-wr-orange">
                              {order.vehiclePlate}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-wr-muted line-clamp-2">
                          {order.serviceDescription || 'Serviço Geral'}
                        </p>

                        <div className="pt-2 border-t border-wr-border flex items-center justify-between">
                          <span className="text-xs font-black font-mono text-wr-text">
                            {formatCurrency(order.totalAmount || 0)}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                handleOpenClientWhatsApp(order)
                              }}
                              className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-500/20 transition-colors"
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
                              className="p-1 rounded-lg text-wr-orange hover:bg-wr-orange/20 transition-colors"
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
                                className="w-full py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-wr-orange/15 hover:bg-wr-orange/25 text-wr-orange border border-wr-orange/30 flex items-center justify-center gap-1 transition-colors"
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
                                className="w-full py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center gap-1 transition-colors"
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
                                className="w-full py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1 transition-colors"
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
        /* ===================== MODO LISTA ANALÍTICA ===================== */
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-wr-border bg-wr-surface/60 p-12 text-center text-wr-muted space-y-3">
              <ClipboardList className="h-10 w-10 mx-auto text-wr-muted opacity-50" />
              <p className="text-sm font-bold text-wr-text">Nenhuma ordem de serviço encontrada</p>
              <p className="text-xs max-w-sm mx-auto text-wr-muted">
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
                    className="rounded-3xl border border-wr-border bg-wr-surface p-5 shadow-card hover:border-wr-orange/50 transition-all flex flex-col justify-between gap-4 group"
                  >
                    {/* Cabeçalho do Card */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-wr-border">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDetailOrder(order)
                            setDetailTab('resumo')
                          }}
                          className="font-mono text-xs font-black text-wr-orange bg-wr-orange/10 border border-wr-orange/30 px-3 py-1 rounded-xl hover:bg-wr-orange/20 transition-colors"
                        >
                          {order.number}
                        </button>
                        <span className="text-xs text-wr-muted font-medium">{order.date}</span>
                        {hasFiscal && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
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
                          <div className="h-9 w-9 rounded-xl bg-wr-orange/10 border border-wr-orange/25 flex items-center justify-center text-wr-orange shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-wr-muted block">
                              Cliente
                            </span>
                            <h3 className="text-sm font-bold text-wr-text truncate">{order.clientName}</h3>
                          </div>
                        </div>
                        {order.clientPhone && (
                          <a
                            href={`tel:${order.clientPhone.replace(/\D/g, '')}`}
                            className="text-xs font-mono text-wr-muted bg-wr-elevated px-2.5 py-1 rounded-lg border border-wr-border hover:text-wr-text flex items-center gap-1 shrink-0 transition-colors"
                          >
                            <Phone className="h-3 w-3 text-wr-orange" />
                            {order.clientPhone}
                          </a>
                        )}
                      </div>

                      {/* Veículo, Placa, KM */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-wr-elevated border border-wr-border flex items-center gap-2 col-span-2">
                          <Car className="h-4 w-4 text-wr-orange shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-wr-muted block">Veículo</span>
                            <span className="font-bold text-wr-text block truncate">{order.vehicleModel}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-wr-elevated border border-wr-border text-center">
                          <span className="text-[9px] uppercase font-bold text-wr-muted block">Placa</span>
                          <span className="font-mono font-black text-wr-orange">{order.vehiclePlate}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-wr-elevated border border-wr-border text-center">
                          <span className="text-[9px] uppercase font-bold text-wr-muted block">KM</span>
                          <span className="font-mono font-bold text-wr-text">
                            {order.mileage ? `${order.mileage.toLocaleString('pt-BR')} km` : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Serviço & Mecânico */}
                      <div className="p-3 rounded-2xl bg-wr-elevated border border-wr-border space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-wr-muted font-bold uppercase tracking-wider">
                          <span>Serviço Solicitado</span>
                          <span className="text-wr-orange flex items-center gap-1">
                            <Wrench className="h-3 w-3" /> {order.mechanicAssigned || 'Roberto Silva'}
                          </span>
                        </div>
                        <p className="text-wr-text font-semibold line-clamp-2">
                          {order.serviceDescription || 'Serviço Geral'}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black uppercase tracking-wider text-wr-muted">
                          Total da OS
                        </span>
                        <span className="font-mono text-xl font-black text-wr-orange">
                          {formatCurrency(order.totalAmount || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="space-y-2 pt-2 border-t border-wr-border">
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
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-wr-elevated hover:bg-wr-surface text-wr-text border border-wr-border transition-all text-[11px] font-bold"
                          title="Ver Detalhes Completos"
                        >
                          <Eye className="h-4 w-4 text-wr-orange shrink-0" />
                          <span className="truncate">Detalhes</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenClientWhatsApp(order)}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 transition-all text-[11px] font-bold"
                          title="Abrir WhatsApp do cliente"
                        >
                          <MessageCircle className="h-4 w-4 shrink-0" />
                          <span className="truncate">WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenNfse(order)}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/25 transition-all text-[11px] font-bold"
                          title="Nota Fiscal (NFS-e)"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">NFS-e</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPdfModalOrder(order)}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-wr-orange/10 hover:bg-wr-orange/20 text-wr-orange border border-wr-orange/25 transition-all text-[11px] font-bold"
                          title="Visualizar e Imprimir Ordem de Serviço"
                        >
                          <Printer className="h-4 w-4 shrink-0" />
                          <span className="truncate">O.S</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingOrder(order)}
                          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-wr-elevated hover:bg-wr-surface text-wr-muted hover:text-wr-text border border-wr-border transition-all text-[11px] font-bold"
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

      {/* ===================== MODAL DE DETALHES COMPLETOS DA OS ===================== */}
      {selectedDetailOrder && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-[32px] border border-wr-border bg-wr-surface p-5 sm:p-7 shadow-elevated space-y-6 my-auto max-h-[92vh] overflow-y-auto text-wr-text">
            {/* Cabeçalho do Modal de Detalhes */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-wr-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-wr-orange/15 border border-wr-orange/30 flex items-center justify-center text-wr-orange shrink-0">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-wr-orange">
                      {selectedDetailOrder.number}
                    </span>
                    {getStatusBadge(selectedDetailOrder.status)}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-wr-text mt-0.5">
                    {selectedDetailOrder.clientName} &bull; {selectedDetailOrder.vehicleModel} ({selectedDetailOrder.vehiclePlate})
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-wr-muted uppercase font-bold block">Valor Total</span>
                  <span className="font-mono text-xl font-black text-wr-orange">
                    {formatCurrency(selectedDetailOrder.totalAmount || 0)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDetailOrder(null)}
                  className="rounded-xl p-2 text-wr-muted hover:text-wr-text hover:bg-wr-elevated transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Abas de Navegação Interna */}
            <div className="flex items-center gap-2 border-b border-wr-border pb-1 overflow-x-auto">
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
                      ? 'bg-wr-orange text-white shadow-sm'
                      : 'text-wr-muted hover:text-wr-text hover:bg-wr-elevated'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CONTEÚDO DAS ABAS */}
            {detailTab === 'resumo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                      <User className="h-4 w-4" /> Dados do Cliente
                    </span>
                    <p className="text-sm font-bold text-wr-text">{selectedDetailOrder.clientName}</p>
                    <p className="text-xs text-wr-muted">Telefone: {selectedDetailOrder.clientPhone}</p>
                    {selectedDetailOrder.clientCpfCnpj && (
                      <p className="text-xs text-wr-muted">CPF/CNPJ: {selectedDetailOrder.clientCpfCnpj}</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                      <Car className="h-4 w-4" /> Dados do Veículo
                    </span>
                    <p className="text-sm font-bold text-wr-text">{selectedDetailOrder.vehicleModel}</p>
                    <p className="text-xs text-wr-muted font-mono font-bold">Placa: {selectedDetailOrder.vehiclePlate}</p>
                    <p className="text-xs text-wr-muted">KM: {selectedDetailOrder.mileage || 'Não informado'}</p>
                    <p className="text-xs text-wr-muted capitalize">Combustível: {selectedDetailOrder.fuelLevel || 'médio'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                    <Wrench className="h-4 w-4" /> Mecânico &amp; Diagnóstico
                  </span>
                  <p className="text-xs text-wr-muted">
                    Responsável: <strong className="text-wr-text">{selectedDetailOrder.mechanicAssigned || 'Roberto Silva'}</strong>
                  </p>
                  <p className="text-xs text-wr-text">
                    {selectedDetailOrder.serviceDescription || 'Revisão periódica geral'}
                  </p>
                  {selectedDetailOrder.observations && (
                    <p className="text-xs text-wr-muted italic mt-1">
                      Obs: {selectedDetailOrder.observations}
                    </p>
                  )}
                </div>
              </div>
            )}

            {detailTab === 'itens' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-wr-border overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-wr-elevated text-wr-muted font-bold border-b border-wr-border">
                      <tr>
                        <th className="p-3">Descrição do Serviço / Peça</th>
                        <th className="p-3 text-right">Peças</th>
                        <th className="p-3 text-right">Mão de Obra</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-wr-border">
                      {selectedDetailOrder.items && selectedDetailOrder.items.length > 0 ? (
                        selectedDetailOrder.items.map(it => (
                          <tr key={it.id} className="hover:bg-wr-elevated/50">
                            <td className="p-3 font-semibold text-wr-text">{it.serviceDescription}</td>
                            <td className="p-3 text-right font-mono text-wr-muted">{formatCurrency(it.partsCost)}</td>
                            <td className="p-3 text-right font-mono text-wr-muted">{formatCurrency(it.laborCost)}</td>
                            <td className="p-3 text-right font-mono font-bold text-wr-text">{formatCurrency(it.total)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-3 font-semibold text-wr-text">{selectedDetailOrder.serviceDescription}</td>
                          <td className="p-3 text-right font-mono text-wr-muted">{formatCurrency(selectedDetailOrder.partsTotal || 0)}</td>
                          <td className="p-3 text-right font-mono text-wr-muted">{formatCurrency(selectedDetailOrder.laborTotal || 0)}</td>
                          <td className="p-3 text-right font-mono font-bold text-wr-text">{formatCurrency(selectedDetailOrder.totalAmount || 0)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 p-3.5 rounded-2xl bg-wr-elevated border border-wr-border space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-wr-muted">
                      <span>Total Peças:</span>
                      <span>{formatCurrency(selectedDetailOrder.partsTotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-wr-muted">
                      <span>Total Mão de Obra:</span>
                      <span>{formatCurrency(selectedDetailOrder.laborTotal || 0)}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-wr-orange pt-2 border-t border-wr-border">
                      <span>Total Líquido:</span>
                      <span>{formatCurrency(selectedDetailOrder.totalAmount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'diagnostico' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-wr-orange">Checklist de Vistoria de Entrada</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-wr-surface border border-wr-border text-center">
                      <span className="text-[10px] text-wr-muted block">Faróis e Lanternas</span>
                      <span className="font-bold text-emerald-500">Aprovado</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-wr-surface border border-wr-border text-center">
                      <span className="text-[10px] text-wr-muted block">Pintura e Lataria</span>
                      <span className="font-bold text-emerald-500">Conferido</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-wr-surface border border-wr-border text-center">
                      <span className="text-[10px] text-wr-muted block">Vidros e Retrovisores</span>
                      <span className="font-bold text-emerald-500">Sem Avarias</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-wr-surface border border-wr-border text-center">
                      <span className="text-[10px] text-wr-muted block">Rodas e Estepe</span>
                      <span className="font-bold text-emerald-500">No Veículo</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-wr-orange">Laudo e Observações do Mecânico</h4>
                  <p className="text-xs text-wr-text">
                    {selectedDetailOrder.observations || 'Nenhuma avaria grave identificada na inspeção visual de entrada.'}
                  </p>
                </div>
              </div>
            )}

            {detailTab === 'historico' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-wr-orange">Linha do Tempo do Atendimento</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-wr-orange" />
                      <span className="font-bold text-wr-text">OS Aberta</span>
                      <span className="text-wr-muted">&bull; {selectedDetailOrder.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="font-bold text-wr-text">Mecânico Atribuído:</span>
                      <span className="text-wr-muted">{selectedDetailOrder.mechanicAssigned || 'Roberto Silva'}</span>
                    </div>
                    {selectedDetailOrder.status === 'pago' && (
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-emerald-500">OS Finalizada e Paga</span>
                        <span className="text-wr-muted">&bull; Pagamento confirmado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'financeiro' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-wr-orange">Dados Financeiros &amp; Fiscal</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-wr-surface border border-wr-border">
                      <span className="text-[10px] text-wr-muted block">Forma de Pagamento</span>
                      <span className="font-bold text-wr-text capitalize">
                        {PAYMENT_LABELS[selectedDetailOrder.paymentMethod || 'pendente']}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-wr-surface border border-wr-border">
                      <span className="text-[10px] text-wr-muted block">Status de Pagamento</span>
                      <span className="font-bold text-wr-text capitalize">{selectedDetailOrder.status}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-wr-surface border border-wr-border">
                      <span className="text-[10px] text-wr-muted block">Desconto Aplicado</span>
                      <span className="font-mono font-bold text-wr-text">
                        {selectedDetailOrder.discount ? formatCurrency(selectedDetailOrder.discount) : 'R$ 0,00'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenNfse(selectedDetailOrder)}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Visualizar NFS-e Municipal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfModalOrder(selectedDetailOrder)}
                    className="flex-1 py-3 px-4 rounded-xl bg-wr-orange hover:bg-wr-orangeDark text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Imprimir OS Oficial</span>
                  </button>
                </div>
              </div>
            )}

            {/* Rodapé de Ações do Modal de Detalhes */}
            <div className="pt-4 border-t border-wr-border flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedDetailOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text font-bold text-xs uppercase"
              >
                Fechar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenClientWhatsApp(selectedDetailOrder)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingOrder(selectedDetailOrder)
                    setSelectedDetailOrder(null)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-wr-elevated border border-wr-border hover:border-wr-orange text-wr-text font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="h-4 w-4 text-wr-orange" />
                  <span>Editar OS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ASSISTENTE DE CRIAÇÃO DE OS EM 5 ETAPAS (STEPPER) ===================== */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-[32px] border border-wr-border bg-wr-surface p-5 sm:p-8 shadow-elevated space-y-6 my-auto max-h-[92vh] overflow-y-auto text-wr-text">
            {/* Cabeçalho do Stepper */}
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-wr-orange/15 border border-wr-orange/30 flex items-center justify-center text-wr-orange">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-wr-text">
                    {editingOrder ? `Editar OS #${editingOrder.number}` : 'Assistente de Nova Ordem de Serviço'}
                  </h3>
                  <p className="text-xs text-wr-muted">
                    Preencha as informações do cliente, veículo, diagnóstico e peças
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewOrderModalOpen(false)
                  setEditingOrder(null)
                }}
                className="rounded-xl p-2 text-wr-muted hover:text-wr-text hover:bg-wr-elevated transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepper Visual (5 Etapas) */}
            <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
              {[
                { step: 1, label: 'Cliente', icon: User },
                { step: 2, label: 'Veículo', icon: Car },
                { step: 3, label: 'Diagnóstico', icon: Wrench },
                { step: 4, label: 'Serviços & Peças', icon: Layers },
                { step: 5, label: 'Revisão', icon: CheckCircle2 },
              ].map(s => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setWizardStep(s.step as typeof wizardStep)}
                  className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    wizardStep === s.step
                      ? 'bg-wr-orange text-white border-wr-orange shadow-sm font-black'
                      : wizardStep > s.step
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-wr-elevated text-wr-muted border-wr-border'
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              ))}
            </div>

            {/* CORPO DO STEPPER POR ETAPA */}
            <div className="space-y-4">
              {/* ETAPA 1: CLIENTE */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                      <User className="h-4 w-4" /> Identificação do Cliente
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowClientSelector(prev => !prev)}
                      className="text-xs font-bold text-wr-orange hover:underline flex items-center gap-1"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>{showClientSelector ? 'Digitar Manualmente' : 'Selecionar Cliente Cadastrado'}</span>
                    </button>
                  </div>

                  {showClientSelector ? (
                    <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-wr-muted" />
                        <input
                          type="text"
                          value={clientSearchQuery}
                          onChange={e => setClientSearchQuery(e.target.value)}
                          placeholder="Buscar cliente por nome, telefone ou CPF..."
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-wr-surface text-wr-text border border-wr-border outline-none focus:border-wr-orange"
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {filteredExistingClients.length === 0 ? (
                          <p className="text-xs text-wr-muted text-center py-4">Nenhum cliente encontrado.</p>
                        ) : (
                          filteredExistingClients.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectExistingClient(c)}
                              className="w-full p-2.5 rounded-xl bg-wr-surface border border-wr-border hover:border-wr-orange flex items-center justify-between text-left text-xs transition-colors"
                            >
                              <div>
                                <p className="font-bold text-wr-text">{c.name}</p>
                                <p className="text-[11px] text-wr-muted">{c.phone} {c.cpfCnpj ? `• ${c.cpfCnpj}` : ''}</p>
                              </div>
                              <span className="text-wr-orange font-bold text-[11px]">Selecionar</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-wr-muted mb-1">
                        Nome Completo do Cliente *
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        placeholder="Ex: João da Silva"
                        className="w-full p-3 rounded-xl bg-wr-elevated text-wr-text border border-wr-border focus:border-wr-orange outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-wr-muted mb-1">
                        Telefone / WhatsApp *
                      </label>
                      <input
                        type="text"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        placeholder="(63) 99999-9999"
                        className="w-full p-3 rounded-xl bg-wr-elevated text-wr-text border border-wr-border focus:border-wr-orange outline-none font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-wr-muted mb-1">
                        CPF / CNPJ (Opcional p/ Nota Fiscal)
                      </label>
                      <input
                        type="text"
                        value={clientCpf}
                        onChange={e => setClientCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full p-3 rounded-xl bg-wr-elevated text-wr-text border border-wr-border focus:border-wr-orange outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!clientName.trim()) {
                          showToast('Informe o nome do cliente.', 'warning')
                          return
                        }
                        setWizardStep(2)
                      }}
                      className="px-6 py-3 rounded-2xl bg-wr-orange hover:bg-wr-orangeDark text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
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
                    <div className="p-3.5 rounded-2xl bg-wr-elevated border border-wr-border space-y-2">
                      <span className="text-xs font-bold text-wr-orange block">
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
                            className="p-2.5 rounded-xl bg-wr-surface border border-wr-border hover:border-wr-orange flex items-center justify-between text-left text-xs transition-colors"
                          >
                            <span className="font-bold text-wr-text">{v.brand} {v.model}</span>
                            <span className="font-mono text-wr-orange font-bold">{v.plate}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                      <Car className="h-4 w-4" /> Dados do Veículo
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-wr-muted mb-1">
                          Marca e Modelo do Carro *
                        </label>
                        <input
                          type="text"
                          value={vehicleModel}
                          onChange={e => setVehicleModel(e.target.value)}
                          placeholder="Ex: Honda Civic 2.0"
                          className="w-full p-3 rounded-xl bg-wr-surface text-wr-text border border-wr-border focus:border-wr-orange outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-wr-muted mb-1">
                          Placa do Veículo *
                        </label>
                        <input
                          type="text"
                          value={vehiclePlate}
                          onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
                          placeholder="ABC1D23"
                          className="w-full p-3 rounded-xl bg-wr-surface text-wr-text border border-wr-border focus:border-wr-orange outline-none font-mono uppercase font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-wr-muted mb-1">
                          Quilometragem (KM de Entrada)
                        </label>
                        <input
                          type="number"
                          value={mileage || ''}
                          onChange={e => setMileage(Number(e.target.value) || 0)}
                          placeholder="Ex: 85000"
                          className="w-full p-3 rounded-xl bg-wr-surface text-wr-text border border-wr-border focus:border-wr-orange outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-wr-muted mb-1">
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
                                  ? 'bg-wr-orange text-white border-wr-orange'
                                  : 'bg-wr-surface text-wr-muted border-wr-border hover:text-wr-text'
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
                      className="px-5 py-3 rounded-2xl bg-wr-elevated border border-wr-border text-wr-text font-bold text-xs uppercase flex items-center gap-2"
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
                      className="px-6 py-3 rounded-2xl bg-wr-orange hover:bg-wr-orangeDark text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
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
                  <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                      <Wrench className="h-4 w-4" /> Reclamação &amp; Diagnóstico Técnico
                    </span>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-wr-muted mb-1">
                          Reclamação Relatada pelo Cliente / Serviço Solicitado *
                        </label>
                        <input
                          type="text"
                          value={serviceDescription}
                          onChange={e => setServiceDescription(e.target.value)}
                          placeholder="Ex: Barulho na suspensão dianteira ao passar em lombadas"
                          className="w-full p-3 rounded-xl bg-wr-surface text-wr-text border border-wr-border focus:border-wr-orange outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-wr-muted mb-1">
                          Mecânico Responsável Atribuído
                        </label>
                        <select
                          value={mechanicAssigned}
                          onChange={e => setMechanicAssigned(e.target.value)}
                          className="w-full p-3 rounded-xl bg-wr-surface text-wr-text border border-wr-border focus:border-wr-orange outline-none font-bold"
                        >
                          {(mechanics || ['Roberto Silva', 'Carlos Eduardo', 'Marcos Oficina']).map(m => (
                            <option key={m} value={m} className="bg-wr-surface text-wr-text">
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-wr-muted mb-1">
                          Observações Gerais de Entrada / Vistoria
                        </label>
                        <textarea
                          rows={2}
                          value={observations}
                          onChange={e => setObservations(e.target.value)}
                          placeholder="Ex: Riscos no para-choque traseiro, estepe e macaco conferidos."
                          className="w-full p-3 rounded-xl bg-wr-surface text-wr-text border border-wr-border focus:border-wr-orange outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-5 py-3 rounded-2xl bg-wr-elevated border border-wr-border text-wr-text font-bold text-xs uppercase flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="px-6 py-3 rounded-2xl bg-wr-orange hover:bg-wr-orangeDark text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
                    >
                      <span>Avançar para Serviços &amp; Peças</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 4: SERVIÇOS E PEÇAS */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  {/* Atalhos de Predefinição */}
                  {servicePresets && servicePresets.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-wr-elevated border border-wr-border space-y-2">
                      <span className="text-xs font-bold text-wr-orange flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> Adicionar Serviços Pré-definidos com 1 Clique:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {servicePresets.slice(0, 6).map(preset => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleAddPreset(preset)}
                            className="px-3 py-1.5 rounded-xl bg-wr-surface border border-wr-border hover:border-wr-orange text-xs text-wr-text font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Plus className="h-3 w-3 text-wr-orange" />
                            <span>{preset.name}</span>
                            <span className="text-[10px] font-mono text-wr-muted font-bold">
                              ({formatCurrency(preset.partsCost + preset.laborCost)})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formulário para Adicionar Item */}
                  <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                      <Plus className="h-4 w-4" /> Lançar Serviço ou Peça Manual
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                      <div className="sm:col-span-6">
                        <label className="block text-[10px] font-bold text-wr-muted mb-1">Descrição</label>
                        <input
                          type="text"
                          value={newItemDesc}
                          onChange={e => setNewItemDesc(e.target.value)}
                          placeholder="Ex: Troca de pastilhas de freio"
                          className="w-full p-2.5 rounded-xl bg-wr-surface text-wr-text border border-wr-border focus:border-wr-orange outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-wr-muted mb-1">Valor Peças</label>
                        <input
                          type="number"
                          value={newItemParts || ''}
                          onChange={e => setNewItemParts(Number(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full p-2.5 rounded-xl bg-wr-surface text-wr-text border border-wr-border focus:border-wr-orange outline-none font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-wr-muted mb-1">Mão de Obra</label>
                        <input
                          type="number"
                          value={newItemLabor || ''}
                          onChange={e => setNewItemLabor(Number(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full p-2.5 rounded-xl bg-wr-surface text-wr-text border border-wr-border focus:border-wr-orange outline-none font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-end">
                        <button
                          type="button"
                          onClick={() => handleAddItem()}
                          className="w-full py-2.5 rounded-xl bg-wr-orange hover:bg-wr-orangeDark text-white font-bold text-xs uppercase flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tabela dos Itens Lançados */}
                  <div className="rounded-2xl border border-wr-border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-wr-elevated text-wr-muted font-bold border-b border-wr-border">
                        <tr>
                          <th className="p-3">Item / Serviço</th>
                          <th className="p-3 text-right">Peças</th>
                          <th className="p-3 text-right">M.O</th>
                          <th className="p-3 text-right">Total</th>
                          <th className="p-3 text-center">Remover</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wr-border">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-wr-muted">
                              Nenhum item adicionado ainda. Lance acima ou use uma predefinição.
                            </td>
                          </tr>
                        ) : (
                          items.map(it => (
                            <tr key={it.id} className="hover:bg-wr-elevated/40">
                              <td className="p-3 font-semibold text-wr-text">{it.serviceDescription}</td>
                              <td className="p-3 text-right font-mono text-wr-muted">{formatCurrency(it.partsCost)}</td>
                              <td className="p-3 text-right font-mono text-wr-muted">{formatCurrency(it.laborCost)}</td>
                              <td className="p-3 text-right font-mono font-bold text-wr-text">{formatCurrency(it.total)}</td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(it.id)}
                                  className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="px-5 py-3 rounded-2xl bg-wr-elevated border border-wr-border text-wr-text font-bold text-xs uppercase flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWizardStep(5)}
                      className="px-6 py-3 rounded-2xl bg-wr-orange hover:bg-wr-orangeDark text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
                    >
                      <span>Avançar para Revisão</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 5: REVISÃO & SALVAR */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Resumo Consolidado da Ordem de Serviço
                    </span>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-wr-muted uppercase font-bold block">Cliente</span>
                        <p className="font-bold text-wr-text">{clientName}</p>
                        <p className="text-wr-muted">{clientPhone}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-wr-muted uppercase font-bold block">Veículo</span>
                        <p className="font-bold text-wr-text">{vehicleModel}</p>
                        <p className="font-mono font-bold text-wr-orange">{vehiclePlate} • {mileage} km</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-wr-border">
                      <span className="text-[10px] text-wr-muted uppercase font-bold block">Mecânico Atribuído</span>
                      <p className="font-bold text-wr-text">{mechanicAssigned || 'Roberto Silva'}</p>
                    </div>

                    <div className="pt-2 border-t border-wr-border flex justify-between font-mono text-xs">
                      <span className="text-wr-muted">Total Peças: {formatCurrency(partsTotal)}</span>
                      <span className="text-wr-muted">Total Mão de Obra: {formatCurrency(laborTotal)}</span>
                    </div>

                    <div className="pt-3 border-t border-wr-border flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-wr-text">Valor Total Geral:</span>
                      <span className="font-mono text-2xl font-black text-wr-orange">
                        {formatCurrency(itemsGrandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Status Inicial da OS */}
                  <div className="p-3.5 rounded-2xl bg-wr-elevated border border-wr-border space-y-2">
                    <label className="block text-xs font-bold text-wr-muted">Status Inicial da OS:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'aguardando', label: 'Aguardando' },
                        { id: 'andamento', label: 'Em Andamento' },
                        { id: 'pronto', label: 'Pronto p/ Retirada' },
                      ].map(st => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setFormStatus(st.id as OrderStatus)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            formStatus === st.id
                              ? 'bg-wr-orange text-white border-wr-orange shadow-sm'
                              : 'bg-wr-surface text-wr-muted border-wr-border hover:text-wr-text'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="px-5 py-3 rounded-2xl bg-wr-elevated border border-wr-border text-wr-text font-bold text-xs uppercase flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveOrder}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Save className="h-4 w-4" />
                      <span>{editingOrder ? 'Salvar Alterações' : 'Emitir Ordem de Serviço'}</span>
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
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[32px] border border-wr-border bg-wr-surface p-6 sm:p-8 shadow-elevated space-y-6 my-auto text-wr-text">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-wr-text">Painel de Venda &amp; Pagamento</h3>
                  <p className="text-xs text-wr-muted">
                    Finalização da OS {finalizingOrder.number} &bull; {finalizingOrder.clientName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFinalizingOrder(null)}
                className="rounded-xl p-2 text-wr-muted hover:text-wr-text hover:bg-wr-elevated transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-wr-elevated border border-wr-border space-y-2 text-xs font-mono">
              <div className="flex justify-between text-wr-muted">
                <span>Peças:</span>
                <span>{formatCurrency(finalizingOrder.partsTotal || 0)}</span>
              </div>
              <div className="flex justify-between text-wr-muted">
                <span>Mão de Obra:</span>
                <span>{formatCurrency(finalizingOrder.laborTotal || 0)}</span>
              </div>
              {checkoutDiscount > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span>Desconto Concedido:</span>
                  <span>- {formatCurrency(checkoutDiscount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-wr-border flex justify-between text-base font-black text-wr-orange">
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
              <label className="block text-xs font-black uppercase tracking-wider text-wr-muted">
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
                        ? 'bg-wr-orange text-white border-wr-orange shadow-sm'
                        : 'bg-wr-elevated text-wr-muted border-wr-border hover:text-wr-text'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {checkoutPaymentMethod === 'cartao_credito' && (
              <div>
                <label className="block text-xs font-bold text-wr-muted mb-1">Parcelamento</label>
                <select
                  value={checkoutInstallments}
                  onChange={e => setCheckoutInstallments(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-wr-elevated text-wr-text border border-wr-border text-xs font-bold font-mono outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                    <option key={n} value={n} className="bg-wr-surface text-wr-text">
                      {n === 1 ? '1x à vista' : `${n}x parcelado`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {checkoutPaymentMethod === 'pagar_depois' && (
              <div>
                <label className="block text-xs font-bold text-wr-muted mb-1">Data de Vencimento Combinada</label>
                <input
                  type="date"
                  value={checkoutDueDate}
                  onChange={e => setCheckoutDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-wr-elevated text-wr-text border border-wr-border text-xs font-mono outline-none"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-3 border-t border-wr-border">
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
                className="px-5 py-3.5 rounded-2xl bg-wr-elevated border border-wr-border text-wr-muted hover:text-wr-text font-bold text-xs uppercase"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: SUCESSO DO PAGAMENTO ===================== */}
      {completedPaymentOrder && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-[32px] border border-emerald-500/40 bg-wr-surface p-6 sm:p-8 shadow-elevated space-y-6 text-center text-wr-text">
            <div className="h-16 w-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-wr-text">Pagamento Confirmado!</h3>
              <p className="text-xs text-wr-muted">
                A OS <strong className="text-wr-orange font-mono">{completedPaymentOrder.number}</strong> foi quitada com sucesso.
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
                className="w-full py-2.5 text-xs text-wr-muted hover:text-wr-text font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: WHATSAPP ===================== */}
      {whatsAppModalOrder && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-[32px] border border-wr-border bg-wr-surface p-6 shadow-elevated space-y-4 my-auto text-wr-text">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-bold text-wr-text">Comprovante de OS para WhatsApp</h3>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppModalOrder(null)}
                className="rounded-xl p-1.5 text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-wr-border bg-wr-elevated p-2 flex items-center justify-center min-h-[280px]">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt={`OS ${whatsAppModalOrder.number}`}
                  className="rounded-xl max-h-[50vh] w-auto shadow-md"
                />
              ) : (
                <div className="text-xs text-wr-muted flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin text-wr-orange" />
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
                  className="p-3 rounded-2xl bg-wr-elevated text-wr-text hover:text-wr-orange border border-wr-border"
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
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-[32px] border border-wr-border bg-white text-slate-900 p-6 sm:p-8 shadow-elevated space-y-6 my-auto max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Visualização de Impressão Oficial &bull; OS #{pdfModalOrder.number}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-wr-orange hover:bg-wr-orangeDark text-white font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
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
              <div className="flex items-center justify-between border-b-2 border-wr-orange pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">WR MECÂNICA &amp; CIA</h2>
                  <p className="text-slate-600">Serviços Mecânicos Especializados &bull; Luzimangues / Porto Nacional - TO</p>
                  <p className="text-[11px] text-slate-500">WhatsApp: (63) 99234-5678</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl font-black text-wr-orange block">OS #{pdfModalOrder.number}</span>
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
