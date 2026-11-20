import React, { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
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
  Calendar,
  Layers,
  ChevronRight,
  AlertTriangle,
  MoreVertical,
  Check,
  ChevronDown,
  Filter,
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

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  aguardando: {
    label: 'Aguardando',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  andamento: {
    label: 'Em Andamento',
    bg: 'bg-wr-orange/15',
    text: 'text-wr-orange',
    border: 'border-wr-orange/30',
    dot: 'bg-wr-orange',
  },
  pronto: {
    label: 'Pronto p/ Retirada',
    bg: 'bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
  },
  pago: {
    label: 'Concluída & Paga',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  cancelado: {
    label: 'Cancelada',
    bg: 'bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
  },
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
  const [activeFilter, setActiveFilter] = useState<
    'todas' | 'aguardando' | 'andamento' | 'pronto' | 'pago' | 'cancelado'
  >('todas')

  // Card clicado abre o Painel Lateral Amplo (Slide-Over Drawer)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<ServiceOrder | null>(null)

  // Menu suspenso de ações rápidas no card
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null)

  // Modais de Controle
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null)
  const [finalizingOrder, setFinalizingOrder] = useState<ServiceOrder | null>(null)
  const [completedPaymentOrder, setCompletedPaymentOrder] = useState<ServiceOrder | null>(null)
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<ServiceOrder | null>(null)
  const [danfseModalOrder, setDanfseModalOrder] = useState<ServiceOrder | null>(null)
  const [pdfModalOrder, setPdfModalOrder] = useState<ServiceOrder | null>(null)

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

  // Fecha menus flutuantes ao clicar fora
  useEffect(() => {
    const handleWindowClick = () => setOpenCardMenuId(null)
    window.addEventListener('click', handleWindowClick)
    return () => window.removeEventListener('click', handleWindowClick)
  }, [])

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

  // Gerar Canvas para WhatsApp
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

  // Itens de serviço
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

  const partsTotal = items.reduce((sum, it) => sum + (it.partsCost || 0), 0)
  const laborTotal = items.reduce((sum, it) => sum + (it.laborCost || 0), 0)
  const itemsGrandTotal = partsTotal + laborTotal

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

  // Salvar Ordem de Serviço
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

  // Checkout e Pagamento
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
    if (selectedOrderDetails && selectedOrderDetails.id === finalizingOrder.id) {
      setSelectedOrderDetails(updated)
    }
    showToast(`Pagamento da ${finalizingOrder.number} registrado com sucesso!`, 'success')
  }

  // WhatsApp direto
  const handleOpenClientWhatsApp = (order: ServiceOrder) => {
    const raw = (order.clientPhone || '').replace(/\D/g, '')
    if (!raw) {
      showToast('Cliente não possui telefone cadastrado.', 'warning')
      return
    }
    const cleanNumber = raw.startsWith('55') ? raw : `55${raw}`
    window.open(`https://wa.me/${cleanNumber}`, '_blank')
  }

  // NFS-e Oficial
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

  // Compartilhamento com Imagem no WhatsApp
  const handleDirectShare = async () => {
    if (!whatsAppModalOrder) return
    if (
      imageBlob &&
      navigator.canShare &&
      navigator.canShare({ files: [new File([imageBlob], 'os.png', { type: 'image/png' })] })
    ) {
      try {
        const file = new File([imageBlob], `OS-${whatsAppModalOrder.number}.png`, {
          type: 'image/png',
        })
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

    if (imageBlob && navigator.clipboard && window.ClipboardItem) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': imageBlob })])
        setCopyFeedback(true)
      } catch {
        // fallback
      }
    }
    const cleanNumber = whatsAppModalOrder.clientPhone.replace(/\D/g, '')
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
    window.open(`https://wa.me/${fullNumber}`, '_blank')
  }

  // Filtragem
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
        (o.serviceDescription?.toLowerCase() || '').includes(q)

      const matchesFilter = activeFilter === 'todas' ? true : o.status === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [orders, searchTerm, activeFilter])

  // Contadores para as abas de filtro
  const filterCounts = useMemo(() => {
    return {
      todas: orders.length,
      aguardando: orders.filter(o => o.status === 'aguardando').length,
      andamento: orders.filter(o => o.status === 'andamento').length,
      pronto: orders.filter(o => o.status === 'pronto').length,
      pago: orders.filter(o => o.status === 'pago').length,
      cancelado: orders.filter(o => o.status === 'cancelado').length,
    }
  }, [orders])

  return (
    <div className="space-y-6 select-none pb-14 animate-fadeIn">
      {/* ===================== TOPO EXECUTIVO: GESTÃO VISUAL DE CARDS ===================== */}
      <div className="relative rounded-3xl border border-wr-border bg-wr-surface p-5 sm:p-6 shadow-card overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-wr-orange/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wr-orange/15 border border-wr-orange/30 text-[11px] font-black uppercase tracking-wider text-wr-orange">
              <Sparkles className="h-3.5 w-3.5" />
              Gestão Visual por Cards &bull; WR Mecânica
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-wr-text tracking-tight flex items-center gap-2.5">
              <ClipboardList className="h-6 w-6 text-wr-orange" />
              Ordens de Serviço
            </h1>
            <p className="text-xs text-wr-muted max-w-xl">
              Navegue pelos cards clicáveis de cada ordem para abrir a ficha completa do atendimento, veículo, peças e financeiro.
            </p>
          </div>

          <div className="flex items-center gap-3">
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

      {/* ===================== FILTROS VISUAIS & BARRA DE BUSCA ===================== */}
      <div className="space-y-3">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-wr-muted pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por cliente, placa do carro ou número da OS..."
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

        {/* Filtros em Abas de Status com contadores reais */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'todas', label: 'Todas as OS', count: filterCounts.todas },
            { id: 'aguardando', label: 'Aguardando', count: filterCounts.aguardando },
            { id: 'andamento', label: 'Em Andamento', count: filterCounts.andamento },
            { id: 'pronto', label: 'Pronto p/ Retirada', count: filterCounts.pronto },
            { id: 'pago', label: 'Concluídas / Pagas', count: filterCounts.pago },
            { id: 'cancelado', label: 'Canceladas', count: filterCounts.cancelado },
          ].map(f => {
            const isSelected = activeFilter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id as typeof activeFilter)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-2xl font-bold transition-all shadow-xs ${
                  isSelected
                    ? 'bg-wr-orange text-white font-black shadow-sm'
                    : 'bg-wr-surface border border-wr-border text-wr-muted hover:text-wr-text hover:bg-wr-elevated'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isSelected
                      ? 'bg-black/25 text-white'
                      : 'bg-wr-elevated text-wr-muted border border-wr-border'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ===================== GRADE RESPONSIVA DE CARDS CLICÁVEIS ===================== */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-wr-border bg-wr-surface/60 p-12 text-center text-wr-muted space-y-3">
          <ClipboardList className="h-12 w-12 mx-auto text-wr-muted opacity-50" />
          <h3 className="text-base font-bold text-wr-text">Nenhuma Ordem de Serviço encontrada</h3>
          <p className="text-xs max-w-sm mx-auto text-wr-muted">
            Tente outro termo de busca ou selecione outro status no filtro acima.
          </p>
          <button
            type="button"
            onClick={() => {
              resetForm()
              setIsNewOrderModalOpen(true)
            }}
            className="wr-btn-primary px-4 py-2.5 text-xs mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Nova OS</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredOrders.map(order => {
            const statusStyle = STATUS_CONFIG[order.status] || STATUS_CONFIG.aguardando
            const hasFiscal = order.fiscalInvoice && order.fiscalInvoice.status === 'autorizada'
            const isMenuOpen = openCardMenuId === order.id

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderDetails(order)}
                className="group relative rounded-3xl border border-wr-border bg-wr-surface hover:border-wr-orange/60 p-5 shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 overflow-hidden"
              >
                {/* Linha 1: Número da OS, Data & Badge de Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-wr-orange px-2.5 py-1 rounded-xl bg-wr-orange/10 border border-wr-orange/25">
                      {order.number}
                    </span>
                    <span className="text-[11px] font-medium text-wr-muted">
                      {order.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasFiscal && (
                      <span
                        title="Nota Fiscal Autorizada"
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 font-mono"
                      >
                        NFS-e
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                      {statusStyle.label}
                    </span>
                  </div>
                </div>

                {/* Linha 2: Veículo, Placa & Foto / Ícone */}
                <div className="flex items-center gap-3">
                  {/* Foto do Veículo ou Ícone Automotivo com estilo Mercosul */}
                  <div className="h-12 w-12 rounded-2xl bg-wr-elevated border border-wr-border flex flex-col items-center justify-center text-wr-orange shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Car className="h-5 w-5" />
                    <span className="text-[8px] font-mono font-black text-wr-muted tracking-tighter uppercase mt-0.5">
                      Auto
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-wr-elevated border border-wr-border text-wr-text">
                        {order.vehiclePlate}
                      </span>
                      {order.mileage ? (
                        <span className="text-[10px] font-mono text-wr-muted">
                          {order.mileage.toLocaleString('pt-BR')} km
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-sm font-bold text-wr-text truncate mt-1">
                      {order.vehicleModel}
                    </h3>
                  </div>
                </div>

                {/* Linha 3: Cliente & Telefone */}
                <div className="p-3 rounded-2xl bg-wr-elevated border border-wr-border space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-wr-muted">
                    <span>Cliente</span>
                    {order.clientPhone && (
                      <span className="font-mono text-wr-muted">{order.clientPhone}</span>
                    )}
                  </div>
                  <p className="font-bold text-wr-text truncate">
                    {order.clientName}
                  </p>
                </div>

                {/* Linha 4: Serviço Principal Solicitado */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wr-muted flex items-center gap-1">
                    <Wrench className="h-3 w-3 text-wr-orange" /> Serviço Principal
                  </span>
                  <p className="text-xs text-wr-text font-medium line-clamp-2">
                    {order.serviceDescription || (order.items?.[0]?.serviceDescription || 'Revisão Periódica Geral')}
                  </p>
                </div>

                {/* Linha 5: Valor Total e Barra de Ações Rápidas */}
                <div className="pt-3 border-t border-wr-border flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-wr-muted">
                      Total
                    </span>
                    <span className="font-mono text-base font-black text-wr-orange">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </div>

                  {/* Botões de Ações Rápidas (com stopPropagation para não abrir o card ao clicar) */}
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {/* Botão de WhatsApp Rápido */}
                    <button
                      type="button"
                      onClick={() => handleOpenClientWhatsApp(order)}
                      className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                      title="Abrir WhatsApp do cliente"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>

                    {/* Botão de Impressão Rápida */}
                    <button
                      type="button"
                      onClick={() => setPdfModalOrder(order)}
                      className="p-2 rounded-xl bg-wr-elevated text-wr-text border border-wr-border hover:border-wr-orange hover:text-wr-orange transition-colors"
                      title="Imprimir Ordem de Serviço"
                    >
                      <Printer className="h-4 w-4" />
                    </button>

                    {/* Menu Mais Opções */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenCardMenuId(prev => (prev === order.id ? null : order.id))
                        }
                        className="p-2 rounded-xl bg-wr-elevated text-wr-muted hover:text-wr-text border border-wr-border hover:border-wr-orange transition-colors"
                        title="Mais Ações"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown de Opções */}
                      {isMenuOpen && (
                        <div
                          className="absolute right-0 bottom-full mb-2 w-48 rounded-2xl border border-wr-border bg-wr-surface p-1.5 shadow-elevated z-30 space-y-1 text-xs"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenCardMenuId(null)
                              setEditingOrder(order)
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left font-semibold text-wr-text hover:bg-wr-elevated flex items-center gap-2"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-wr-orange" />
                            <span>Editar Ordem</span>
                          </button>

                          {order.status !== 'pago' && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null)
                                setFinalizingOrder(order)
                                setCheckoutPaymentMethod('pix')
                                setCheckoutDiscount(order.discount || 0)
                                setCheckoutInstallments(1)
                              }}
                              className="w-full px-3 py-2 rounded-xl text-left font-semibold text-emerald-500 hover:bg-emerald-500/10 flex items-center gap-2"
                            >
                              <DollarSign className="h-3.5 w-3.5" />
                              <span>Receber / Venda</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setOpenCardMenuId(null)
                              handleOpenNfse(order)
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left font-semibold text-blue-500 hover:bg-blue-500/10 flex items-center gap-2"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Nota Fiscal (NFS-e)</span>
                          </button>

                          <div className="pt-1 border-t border-wr-border">
                            <span className="px-3 py-1 text-[9px] uppercase font-bold text-wr-muted block">
                              Mudar Status Rápido
                            </span>
                            {(['aguardando', 'andamento', 'pronto'] as OrderStatus[]).map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => {
                                  setOpenCardMenuId(null)
                                  updateOrderStatus(order.id, st)
                                  showToast(`Status atualizado para ${STATUS_CONFIG[st].label}!`, 'info')
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-semibold text-wr-muted hover:text-wr-text hover:bg-wr-elevated flex items-center gap-2"
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[st].dot}`} />
                                <span>{STATUS_CONFIG[st].label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===================== PAINEL LATERAL AMPLO (SLIDE-OVER DRAWER DE DETALHES) ===================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
          {/* Backdrop Escurecido com Blur */}
          <div
            onClick={() => setSelectedOrderDetails(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-2xl bg-wr-surface border-l border-wr-border shadow-2xl flex flex-col justify-between overflow-hidden animate-slideInRight text-wr-text">
              {/* Topo do Painel Lateral */}
              <div className="p-5 sm:p-6 border-b border-wr-border flex items-center justify-between gap-4 bg-wr-surface">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-wr-orange/15 border border-wr-orange/30 flex items-center justify-center text-wr-orange shrink-0">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-wr-orange">
                        {selectedOrderDetails.number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          STATUS_CONFIG[selectedOrderDetails.status]?.bg || ''
                        } ${STATUS_CONFIG[selectedOrderDetails.status]?.text || ''} ${
                          STATUS_CONFIG[selectedOrderDetails.status]?.border || ''
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            STATUS_CONFIG[selectedOrderDetails.status]?.dot || ''
                          }`}
                        />
                        {STATUS_CONFIG[selectedOrderDetails.status]?.label || selectedOrderDetails.status}
                      </span>
                    </div>
                    <p className="text-xs text-wr-muted mt-0.5">
                      Aberta em {selectedOrderDetails.date} &bull; Garantia CDC 90 dias
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfModalOrder(selectedOrderDetails)}
                    className="p-2.5 rounded-xl border border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text hover:border-wr-orange transition-colors"
                    title="Imprimir OS Oficial"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetails(null)}
                    className="p-2.5 rounded-xl border border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Corpo com Rolagem e Seções Visuais Organizadas */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Seção 1: Cliente e Contato */}
                <div className="p-4 rounded-3xl bg-wr-elevated border border-wr-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                      <User className="h-4 w-4" /> Dados do Cliente
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenClientWhatsApp(selectedOrderDetails)}
                      className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/25 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-wr-muted block">Nome</span>
                      <p className="font-bold text-wr-text text-sm">{selectedOrderDetails.clientName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-wr-muted block">Telefone</span>
                      <p className="font-mono font-bold text-wr-text">{selectedOrderDetails.clientPhone || '—'}</p>
                    </div>
                    {selectedOrderDetails.clientCpfCnpj && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-wr-muted block">CPF / CNPJ</span>
                        <p className="font-mono text-wr-text">{selectedOrderDetails.clientCpfCnpj}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seção 2: Veículo & Entrada */}
                <div className="p-4 rounded-3xl bg-wr-elevated border border-wr-border space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                    <Car className="h-4 w-4" /> Veículo &bull; Vistoria de Entrada
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-wr-surface border border-wr-border col-span-2">
                      <span className="text-[10px] uppercase font-bold text-wr-muted block">Modelo</span>
                      <p className="font-bold text-wr-text text-sm truncate">{selectedOrderDetails.vehicleModel}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-wr-surface border border-wr-border text-center">
                      <span className="text-[10px] uppercase font-bold text-wr-muted block">Placa</span>
                      <p className="font-mono font-black text-wr-orange text-sm">{selectedOrderDetails.vehiclePlate}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-wr-surface border border-wr-border text-center">
                      <span className="text-[10px] uppercase font-bold text-wr-muted block">KM</span>
                      <p className="font-mono font-bold text-wr-text">
                        {selectedOrderDetails.mileage ? `${selectedOrderDetails.mileage.toLocaleString('pt-BR')} km` : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-wr-muted pt-1">
                    <span>Nível de Combustível: <strong className="text-wr-text capitalize">{selectedOrderDetails.fuelLevel || 'médio'}</strong></span>
                    <span>Mecânico: <strong className="text-wr-orange">{selectedOrderDetails.mechanicAssigned || 'Roberto Silva'}</strong></span>
                  </div>
                </div>

                {/* Seção 3: Diagnóstico & Queixa */}
                <div className="p-4 rounded-3xl bg-wr-elevated border border-wr-border space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                    <Wrench className="h-4 w-4" /> Diagnóstico Técnico &amp; Queixa do Cliente
                  </span>
                  <p className="text-xs text-wr-text font-medium bg-wr-surface p-3 rounded-2xl border border-wr-border">
                    {selectedOrderDetails.serviceDescription || 'Revisão e manutenção geral solicitada.'}
                  </p>
                  {selectedOrderDetails.observations && (
                    <p className="text-[11px] text-wr-muted italic px-1">
                      Obs: {selectedOrderDetails.observations}
                    </p>
                  )}
                </div>

                {/* Seção 4: Tabela de Serviços & Peças */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                    <Layers className="h-4 w-4" /> Serviços Executados &amp; Peças Utilizadas
                  </span>

                  <div className="rounded-2xl border border-wr-border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-wr-elevated text-wr-muted font-bold border-b border-wr-border">
                        <tr>
                          <th className="p-3">Descrição</th>
                          <th className="p-3 text-right">Peças</th>
                          <th className="p-3 text-right">M.O</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wr-border">
                        {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                          selectedOrderDetails.items.map(it => (
                            <tr key={it.id} className="hover:bg-wr-elevated/40">
                              <td className="p-3 font-semibold text-wr-text">{it.serviceDescription}</td>
                              <td className="p-3 text-right font-mono text-wr-muted">{formatCurrency(it.partsCost)}</td>
                              <td className="p-3 text-right font-mono text-wr-muted">{formatCurrency(it.laborCost)}</td>
                              <td className="p-3 text-right font-mono font-bold text-wr-text">{formatCurrency(it.total)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="p-3 font-semibold text-wr-text">{selectedOrderDetails.serviceDescription}</td>
                            <td className="p-3 text-right font-mono text-wr-muted">{formatCurrency(selectedOrderDetails.partsTotal || 0)}</td>
                            <td className="p-3 text-right font-mono text-wr-muted">{formatCurrency(selectedOrderDetails.laborTotal || 0)}</td>
                            <td className="p-3 text-right font-mono font-bold text-wr-text">{formatCurrency(selectedOrderDetails.totalAmount || 0)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Seção 5: Resumo Financeiro, Desconto e Total */}
                <div className="p-4 rounded-3xl bg-wr-elevated border border-wr-border space-y-2">
                  <div className="flex justify-between text-xs font-mono text-wr-muted">
                    <span>Subtotal Peças:</span>
                    <span>{formatCurrency(selectedOrderDetails.partsTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-wr-muted">
                    <span>Subtotal Mão de Obra:</span>
                    <span>{formatCurrency(selectedOrderDetails.laborTotal || 0)}</span>
                  </div>
                  {selectedOrderDetails.discount ? (
                    <div className="flex justify-between text-xs font-mono text-rose-500">
                      <span>Desconto Aplicado:</span>
                      <span>- {formatCurrency(selectedOrderDetails.discount)}</span>
                    </div>
                  ) : null}
                  <div className="pt-2 border-t border-wr-border flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-wr-text">Total da Ordem:</span>
                    <span className="font-mono text-2xl font-black text-wr-orange">
                      {formatCurrency(selectedOrderDetails.totalAmount || 0)}
                    </span>
                  </div>
                </div>

                {/* Seção 6: Status & Mudança Rápida */}
                <div className="p-4 rounded-3xl bg-wr-elevated border border-wr-border space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-wr-orange block">
                    Atualizar Andamento da OS
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['aguardando', 'andamento', 'pronto'] as OrderStatus[]).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          updateOrderStatus(selectedOrderDetails.id, st)
                          setSelectedOrderDetails(prev => (prev ? { ...prev, status: st } : null))
                          showToast(`Status atualizado para ${STATUS_CONFIG[st].label}!`, 'info')
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedOrderDetails.status === st
                            ? 'bg-wr-orange text-white border-wr-orange shadow-sm'
                            : 'bg-wr-surface text-wr-muted border-wr-border hover:text-wr-text'
                        }`}
                      >
                        {STATUS_CONFIG[st].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rodapé Fixo do Painel Lateral */}
              <div className="p-5 sm:p-6 border-t border-wr-border bg-wr-surface flex flex-wrap items-center justify-between gap-3">
                {selectedOrderDetails.status !== 'pago' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedOrderDetails
                      setSelectedOrderDetails(null)
                      setFinalizingOrder(target)
                      setCheckoutPaymentMethod('pix')
                      setCheckoutDiscount(target.discount || 0)
                      setCheckoutInstallments(1)
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Receber Pagamento (Finalizar Venda)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenNfse(selectedOrderDetails)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Visualizar NFS-e Autorizada</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedOrderDetails
                      setSelectedOrderDetails(null)
                      setEditingOrder(target)
                    }}
                    className="px-4 py-3.5 rounded-2xl border border-wr-border bg-wr-elevated text-wr-text hover:border-wr-orange font-bold text-xs uppercase flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-wr-orange" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetails(null)}
                    className="px-4 py-3.5 rounded-2xl border border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text font-bold text-xs uppercase"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ASSISTENTE DE CRIAÇÃO / EDIÇÃO DE OS EM 5 ETAPAS (STEPPER) ===================== */}
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
