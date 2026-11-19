import React, { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { WrLogo } from '../components/WrLogo'
import {
  ServiceOrder,
  FuelStatus,
  TireCondition,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  VehicleInspectionChecklist,
  VisualItemStatus,
  ServicePreset,
} from '../types'
import { generateOsCanvas, DEFAULT_WORKSHOP_INFO } from '../utils/osImageGenerator'
import { DanfseModal } from '../components/DanfseModal'
import { ClientAutocomplete } from '../components/ClientAutocomplete'
import { VehicleAutocomplete } from '../components/VehicleAutocomplete'
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
  XCircle,
  UserCheck,
  ArrowRight,
  Edit2,
  Save,
  Wrench,
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
    selectedOrderForModal,
    setSelectedOrderForModal,
    isNewOrderModalOpen,
    setIsNewOrderModalOpen,
    orderPrefill,
    setOrderPrefill,
    showToast,
  } = useApp()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ativas')

  const [pdfModalOrder, setPdfModalOrder] = useState<ServiceOrder | null>(null)
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<ServiceOrder | null>(null)
  const [danfseModalOrder, setDanfseModalOrder] = useState<ServiceOrder | null>(null)
  const [finalizingOrder, setFinalizingOrder] = useState<ServiceOrder | null>(null)
  const [finalizingPaymentMethod, setFinalizingPaymentMethod] = useState<PaymentMethod>('pix')
  const [finalizingInstallments, setFinalizingInstallments] = useState<number>(1)
  const [finalizingDiscount, setFinalizingDiscount] = useState<number>(0)
  const [finalizingDueDate, setFinalizingDueDate] = useState(() =>
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
  const [finalizingEmitNfse, setFinalizingEmitNfse] = useState(true)

  // WhatsApp Image Generator State
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)

  // Estados para alteração posterior de itens e valores da OS
  const [isEditingItems, setIsEditingItems] = useState(false)
  const [editableItems, setEditableItems] = useState<OrderItem[]>([])
  const [newEditServiceDesc, setNewEditServiceDesc] = useState('')
  const [newEditPartsCost, setNewEditPartsCost] = useState('')
  const [newEditLaborCost, setNewEditLaborCost] = useState('')

  useEffect(() => {
    if (selectedOrderForModal) {
      setEditableItems(selectedOrderForModal.items || [])
      setIsEditingItems(false)
      setNewEditServiceDesc('')
      setNewEditPartsCost('')
      setNewEditLaborCost('')
    }
  }, [selectedOrderForModal?.id])

  const handleUpdateItemValue = (id: string, field: 'partsCost' | 'laborCost' | 'serviceDescription', value: any) => {
    setEditableItems(prev =>
      prev.map(it => {
        if (it.id !== id) return it
        const next = { ...it, [field]: value }
        if (field === 'partsCost' || field === 'laborCost') {
          const p = field === 'partsCost' ? (parseFloat(value) || 0) : it.partsCost
          const l = field === 'laborCost' ? (parseFloat(value) || 0) : it.laborCost
          next.total = p + l
        }
        return next
      })
    )
  }

  const handleRemoveEditableItem = (id: string) => {
    setEditableItems(prev => prev.filter(it => it.id !== id))
  }

  const handleAddEditableItem = () => {
    if (!newEditServiceDesc.trim()) {
      showToast('Digite a descrição do serviço ou peça.', 'warning')
      return
    }
    const pCost = parseFloat(newEditPartsCost) || 0
    const lCost = parseFloat(newEditLaborCost) || 0
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      serviceDescription: newEditServiceDesc.trim(),
      partsCost: pCost,
      laborCost: lCost,
      total: pCost + lCost,
      serviceCode: '14.01',
      cnae: '4520-0/01',
    }
    setEditableItems(prev => [...prev, newItem])
    setNewEditServiceDesc('')
    setNewEditPartsCost('')
    setNewEditLaborCost('')
  }

  const handleSaveEditableItems = () => {
    if (!selectedOrderForModal) return
    const partsTotal = editableItems.reduce((acc, i) => acc + (Number(i.partsCost) || 0), 0)
    const laborTotal = editableItems.reduce((acc, i) => acc + (Number(i.laborCost) || 0), 0)
    const rawTotal = partsTotal + laborTotal
    const discount = selectedOrderForModal.discount || 0
    const totalAmount = Math.max(0, rawTotal - discount)
    const serviceDescription =
      editableItems.map(i => i.serviceDescription).filter(Boolean).join(', ') || 'Serviço Geral'

    const updatedData: Partial<ServiceOrder> = {
      items: editableItems,
      partsTotal,
      laborTotal,
      totalAmount,
      serviceDescription,
    }

    updateOrder(selectedOrderForModal.id, updatedData)
    setSelectedOrderForModal({
      ...selectedOrderForModal,
      ...updatedData,
    })
    setIsEditingItems(false)
    showToast('Valores e itens da OS atualizados com sucesso!', 'success')
  }

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
  const [mechanicAssigned, setMechanicAssigned] = useState(mechanics?.[0] || 'Roberto Silva')
  const [observations, setObservations] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [paymentDueDate, setPaymentDueDate] = useState(() =>
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )

  useEffect(() => {
    if (!mechanicAssigned && mechanics?.length > 0) {
      setMechanicAssigned(mechanics[0])
    }
  }, [mechanics])

  const [serviceItems, setServiceItems] = useState<OrderItem[]>([])
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemParts, setNewItemParts] = useState<number>(0)
  const [newItemLabor, setNewItemLabor] = useState<number>(0)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Função para salvar imediatamente cliente e carro no cadastro permanente
  const handleRegisterClientAndVehicle = () => {
    if (!clientName.trim()) {
      showToast('Digite o nome do cliente.', 'warning')
      return null
    }

    // Procura se já existe um cliente com mesmo nome ou telefone
    let clientToUse = clients.find(
      c =>
        c.name.trim().toLowerCase() === clientName.trim().toLowerCase() ||
        (clientPhone.trim() && c.phone.replace(/\D/g, '') === clientPhone.replace(/\D/g, ''))
    )

    if (!clientToUse) {
      clientToUse = addClient({
        name: clientName.trim(),
        phone: clientPhone.trim() || '(63) 99999-0000',
        cpfCnpj: clientCpfCnpj.trim() || undefined,
      })
      showToast(`Cliente "${clientToUse.name}" cadastrado com sucesso!`, 'success')
    }
    setSelectedClientId(clientToUse.id)

    // Se informou dados de veículo, cadastra ou vincula
    let vehicleToUse = null
    if (vehicleModel.trim() || vehiclePlate.trim()) {
      const cleanPlate = vehiclePlate.toUpperCase().trim() || 'SEM PLACA'
      const existingVehicle = vehicles.find(
        v => v.plate === cleanPlate && cleanPlate !== 'SEM PLACA'
      )
      if (existingVehicle) {
        vehicleToUse = existingVehicle
        setSelectedVehicleId(existingVehicle.id)
      } else {
        const parts = vehicleModel.trim().split(' ')
        const brand = parts[0] || 'Geral'
        const model = parts.slice(1).join(' ') || vehicleModel.trim() || 'Veículo'

        vehicleToUse = addVehicle({
          clientId: clientToUse.id,
          brand,
          model,
          plate: cleanPlate,
          year: new Date().getFullYear(),
          currentMileage: Number(mileage) || 0,
        })
        setSelectedVehicleId(vehicleToUse.id)
        showToast(`Veículo "${vehicleToUse.model} (${vehicleToUse.plate})" cadastrado!`, 'success')
      }
    }

    return { client: clientToUse, vehicle: vehicleToUse }
  }

  // Aplicar pré-preenchimento quando abrir OS direto de um agendamento / cliente / veículo
  useEffect(() => {
    if (!isNewOrderModalOpen) return

    if (orderPrefill) {
      if (orderPrefill.clientId) {
        const targetClient = clients.find(c => c.id === orderPrefill.clientId)
        if (targetClient) {
          setSelectedClientId(targetClient.id)
          setClientName(targetClient.name)
          setClientPhone(targetClient.phone)
          setClientCpfCnpj(targetClient.cpfCnpj || '')
        }
      } else if (orderPrefill.clientName) {
        setSelectedClientId('')
        setClientName(orderPrefill.clientName)
        setClientPhone(orderPrefill.clientPhone || '')
        setClientCpfCnpj('')
      }

      if (orderPrefill.vehicleId) {
        const targetVehicle = vehicles.find(v => v.id === orderPrefill.vehicleId)
        if (targetVehicle) {
          setSelectedVehicleId(targetVehicle.id)
          setVehicleModel(`${targetVehicle.brand} ${targetVehicle.model}`)
          setVehiclePlate(targetVehicle.plate)
          setMileage(targetVehicle.currentMileage || 0)
        }
      } else if (orderPrefill.vehicleModel || orderPrefill.vehiclePlate) {
        setSelectedVehicleId('')
        setVehicleModel(orderPrefill.vehicleModel || '')
        setVehiclePlate(orderPrefill.vehiclePlate || '')
        setMileage(0)
      }

      if (orderPrefill.serviceDescription) {
        setMainServiceDesc(orderPrefill.serviceDescription)
      }

      setOrderPrefill(null)
    } else {
      const targetClient = clients[0]
      if (targetClient) {
        setSelectedClientId(targetClient.id)
        setClientName(targetClient.name)
        setClientPhone(targetClient.phone)
        setClientCpfCnpj(targetClient.cpfCnpj || '')

        const linkedVehicles = vehicles.filter(v => v.clientId === targetClient.id)
        const targetVehicle = linkedVehicles[0]
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
      } else {
        setSelectedClientId('')
        setClientName('')
        setClientPhone('')
        setClientCpfCnpj('')
        setSelectedVehicleId('')
        setVehicleModel('')
        setVehiclePlate('')
        setMileage(0)
      }
      setMainServiceDesc('')
    }

    setFuelLevel('medio')
    setTireFrontLeft('bom')
    setTireFrontRight('bom')
    setTireRearLeft('bom')
    setTireRearRight('bom')
    setChecklist(DEFAULT_VISUAL_CHECKLIST)
    setObservations('')
    setPaymentMethod('pix')
    setPaymentDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
    setServiceItems([])
    setNewItemDesc('')
    setNewItemParts(0)
    setNewItemLabor(0)
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

  const filteredSuggestions = (servicePresets || []).filter(s =>
    s.name.toLowerCase().includes(newItemDesc.toLowerCase().trim())
  )

  const handleSelectSuggestion = (service: ServicePreset) => {
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

    // Garante que o cliente e o veículo estejam salvos no sistema
    let effectiveClientId = selectedClientId
    let effectiveVehicleId = selectedVehicleId

    if (!effectiveClientId || !clients.some(c => c.id === effectiveClientId)) {
      const saved = handleRegisterClientAndVehicle()
      if (saved?.client) {
        effectiveClientId = saved.client.id
      }
      if (saved?.vehicle) {
        effectiveVehicleId = saved.vehicle.id
      }
    } else if (
      (!effectiveVehicleId || !vehicles.some(v => v.id === effectiveVehicleId)) &&
      (vehicleModel.trim() || vehiclePlate.trim())
    ) {
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
      serviceItems.length > 0
        ? serviceItems
        : [
            {
              id: `item-${Date.now()}`,
              serviceDescription: mainServiceDesc.trim() || 'Serviço a Avaliar / Orçamento',
              partsCost: 0,
              laborCost: 0,
              total: 0,
              serviceCode: '14.01',
              cnae: '4520-0/01',
            },
          ]

    const finalParts = finalItems.reduce((acc, i) => acc + i.partsCost, 0)
    const finalLabor = finalItems.reduce((acc, i) => acc + i.laborCost, 0)

    addOrder({
      clientId: effectiveClientId || `cli-${Date.now()}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientCpfCnpj: clientCpfCnpj.trim() || undefined,
      vehicleId: effectiveVehicleId || undefined,
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
      paymentMethod: 'pendente',
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

    let matchesFilter = true
    if (filterStatus === 'ativas') {
      // Exibe apenas as ordens ativas na oficina. Ao concluir pagamento ou cancelar, a OS some desta tela!
      matchesFilter = o.status === 'aguardando' || o.status === 'andamento'
    } else if (filterStatus === 'todos') {
      matchesFilter = true
    } else {
      matchesFilter = o.status === filterStatus
    }
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
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <XCircle className="h-3 w-3" />
            Cancelada
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-wr-elevated text-wr-muted">
            {status}
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
            Vistoria visual rápida (faróis, pintura, pneus), garantia de 90 dias e emissão da NFS-e de Porto Nacional
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
            { id: 'ativas', label: 'Em Aberto' },
            { id: 'aguardando', label: 'Aguardando' },
            { id: 'andamento', label: 'Em andamento' },
            { id: 'pronto', label: 'Concluídas / Pagas' },
            { id: 'cancelado', label: 'Canceladas' },
            { id: 'todos', label: 'Todas as OS' },
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
                className="wr-card-interactive p-4 sm:p-5 cursor-pointer flex flex-col justify-between gap-3 group active:scale-[0.99] transition-all hover:border-wr-orange shadow-sm"
              >
                {/* Linha Superior: Número da OS, Data e Status */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-wr-border">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-wr-orange bg-wr-elevated px-2.5 py-1 rounded-lg border border-wr-border">
                      {order.number}
                    </span>
                    <span className="text-[11px] text-wr-muted font-medium">{order.date}</span>
                    {hasFiscal && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        <ShieldCheck className="h-3 w-3" /> NFS-e
                      </span>
                    )}
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Informações Principais do Card: Nome, Carro e Serviço */}
                <div className="space-y-2">
                  {/* 1. Nome do Cliente */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-wr-orange/15 border border-wr-orange/30 flex items-center justify-center text-wr-orange shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-wr-muted block">Cliente</span>
                        <h3 className="text-sm font-bold text-wr-text group-hover:text-wr-orange transition-colors truncate">
                          {order.clientName}
                        </h3>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold bg-wr-elevated border border-wr-border px-2.5 py-1 rounded-lg text-wr-text shrink-0">
                      {order.vehiclePlate}
                    </span>
                  </div>

                  {/* 2. Carro */}
                  <div className="flex items-center gap-2 text-xs text-wr-gold font-bold bg-wr-elevated/60 border border-wr-border/70 rounded-xl px-3 py-2">
                    <Car className="h-4 w-4 shrink-0 text-wr-gold" />
                    <span className="truncate">{order.vehicleModel}</span>
                  </div>

                  {/* 3. Serviço Principal */}
                  <div className="rounded-xl bg-wr-surface border border-wr-border p-3 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-wr-muted block">
                      Serviço
                    </span>
                    <p className="font-semibold text-wr-text line-clamp-2 text-xs">
                      {order.serviceDescription || 'Serviço Geral'}
                    </p>
                  </div>
                </div>

                {/* Rodapé: Valor Total e Ação de Toque */}
                <div className="pt-2.5 border-t border-wr-border flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-wr-muted font-bold uppercase block">Total</span>
                    <span className="font-mono text-base font-extrabold text-wr-orange">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-wr-orange/10 border border-wr-orange/20 text-xs font-bold text-wr-orange group-hover:bg-wr-orange group-hover:text-white transition-all shadow-xs">
                    Abrir Detalhes <ArrowRight className="h-3.5 w-3.5" />
                  </span>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'aguardando', label: 'Aguardando', active: 'bg-amber-500 text-white dark:text-black border-amber-500' },
                    { id: 'andamento', label: 'Em Andamento', active: 'bg-wr-orange text-white dark:text-[#0B0C10] border-wr-orange' },
                    { id: 'pronto', label: 'Pronto', active: 'bg-emerald-600 text-white border-emerald-600' },
                    { id: 'cancelado', label: 'Cancelado', active: 'bg-rose-600 text-white border-rose-600' },
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
                {mechanics.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Seção de Itens & Valores da OS (Permite alterar valores e adicionar serviços/peças depois) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                  <Wrench className="h-4 w-4" /> Serviços &amp; Peças da OS
                </span>
                {selectedOrderForModal.status !== 'pronto' && selectedOrderForModal.status !== 'cancelado' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isEditingItems) {
                        setEditableItems(selectedOrderForModal.items || [])
                      }
                      setIsEditingItems(prev => !prev)
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isEditingItems
                        ? 'bg-wr-orange/20 text-wr-orange border border-wr-orange/40'
                        : 'bg-wr-elevated border border-wr-border text-wr-text hover:border-wr-orange/50'
                    }`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    {isEditingItems ? 'Cancelar Edição' : 'Alterar Valores / Adicionar Itens'}
                  </button>
                )}
              </div>

              {isEditingItems ? (
                /* Modo de Edição Ativa de Valores e Itens */
                <div className="rounded-2xl border border-wr-orange/40 bg-wr-elevated/40 p-4 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-wr-border pb-2.5">
                    <span className="text-xs font-bold text-wr-text">
                      Ajuste os valores ou adicione novos serviços/peças
                    </span>
                    <span className="text-[10px] text-wr-muted font-mono">
                      {editableItems.length} item(ns)
                    </span>
                  </div>

                  {/* Lista de Itens Editáveis */}
                  <div className="space-y-3">
                    {editableItems.map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className="rounded-xl border border-wr-border bg-wr-surface p-3 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={it.serviceDescription}
                            onChange={e => handleUpdateItemValue(it.id, 'serviceDescription', e.target.value)}
                            placeholder="Descrição do serviço ou peça..."
                            className="wr-input text-xs font-bold flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveEditableItem(it.id)}
                            className="p-2 rounded-lg text-wr-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Remover este item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-wr-muted uppercase mb-1">
                              Peças (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={it.partsCost}
                              onChange={e => handleUpdateItemValue(it.id, 'partsCost', e.target.value)}
                              className="wr-input font-mono text-xs text-right"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-wr-muted uppercase mb-1">
                              Mão de Obra (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={it.laborCost}
                              onChange={e => handleUpdateItemValue(it.id, 'laborCost', e.target.value)}
                              className="wr-input font-mono text-xs text-right"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-wr-muted uppercase mb-1">
                              Subtotal
                            </label>
                            <div className="wr-input bg-wr-elevated font-mono text-xs font-bold text-right text-emerald-500 flex items-center justify-end">
                              {formatCurrency(Number(it.partsCost || 0) + Number(it.laborCost || 0))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {editableItems.length === 0 && (
                      <p className="text-xs text-wr-muted text-center py-4 bg-wr-surface rounded-xl border border-wr-border">
                        Nenhum item lançado. Adicione um novo serviço ou peça abaixo.
                      </p>
                    )}
                  </div>

                  {/* Adicionar Novo Item / Serviço à OS */}
                  <div className="rounded-xl border border-dashed border-wr-orange/40 bg-wr-orange/5 p-3.5 space-y-3">
                    <span className="text-xs font-bold text-wr-orange flex items-center gap-1.5">
                      <Plus className="h-4 w-4" /> Incluir Mais um Serviço ou Peça
                    </span>

                    <div>
                      <input
                        type="text"
                        value={newEditServiceDesc}
                        onChange={e => setNewEditServiceDesc(e.target.value)}
                        placeholder="Nome do serviço ou peça adicional (ex: Troca de Correia)..."
                        className="wr-input text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-wr-muted uppercase mb-1">
                          Peças (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={newEditPartsCost}
                          onChange={e => setNewEditPartsCost(e.target.value)}
                          className="wr-input font-mono text-xs text-right"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-wr-muted uppercase mb-1">
                          Mão de Obra (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={newEditLaborCost}
                          onChange={e => setNewEditLaborCost(e.target.value)}
                          className="wr-input font-mono text-xs text-right"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddEditableItem}
                          className="w-full wr-btn-primary py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Plus className="h-4 w-4" /> Incluir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Totais Recalculados & Botões de Salvar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-wr-border">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-wr-muted uppercase font-bold block">Novo Total da OS:</span>
                      <span className="text-lg font-black font-mono text-wr-orange">
                        {formatCurrency(
                          editableItems.reduce(
                            (acc, i) => acc + (Number(i.partsCost) || 0) + (Number(i.laborCost) || 0),
                            0
                          ) - (selectedOrderForModal.discount || 0)
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditableItems(selectedOrderForModal.items || [])
                          setIsEditingItems(false)
                        }}
                        className="wr-btn-secondary px-4 py-2 text-xs font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEditableItems}
                        className="wr-btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <Save className="h-4 w-4" /> Salvar Novos Valores
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Modo Visualização Normal da Tabela */
                <div className="overflow-x-auto rounded-xl border border-wr-border">
                  <table className="w-full text-left text-xs min-w-[460px]">
                    <thead className="bg-wr-elevated text-wr-muted border-b border-wr-border">
                      <tr>
                        <th className="py-2.5 px-3.5 font-semibold">Serviço / Peça</th>
                        <th className="py-2.5 px-3.5 font-semibold text-right">Peças</th>
                        <th className="py-2.5 px-3.5 font-semibold text-right">Mão de Obra</th>
                        <th className="py-2.5 px-3.5 font-semibold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-wr-border text-wr-text">
                      {selectedOrderForModal.items?.map(it => (
                        <tr key={it.id}>
                          <td className="py-2.5 px-3.5 font-medium">{it.serviceDescription}</td>
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
                      {(selectedOrderForModal.discount || 0) > 0 && (
                        <tr className="text-rose-500 font-bold">
                          <td colSpan={3} className="py-2 px-3.5 text-right">
                            Desconto Aplicado:
                          </td>
                          <td className="py-2 px-3.5 font-mono text-right">
                            - {formatCurrency(selectedOrderForModal.discount || 0)}
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {selectedOrderForModal.status !== 'pronto' && selectedOrderForModal.status !== 'cancelado' && (
                <button
                  type="button"
                  onClick={() => {
                    setFinalizingOrder(selectedOrderForModal)
                    setSelectedOrderForModal(null)
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-colors shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Finalizar OS &amp; Pagamento
                </button>
              )}
              {selectedOrderForModal.status !== 'cancelado' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Deseja realmente cancelar a Ordem de Serviço #${selectedOrderForModal.number}?`)) {
                      updateOrderStatus(selectedOrderForModal.id, 'cancelado')
                      setSelectedOrderForModal(null)
                      showToast(`OS #${selectedOrderForModal.number} cancelada.`, 'info')
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-600 hover:text-white py-2.5 px-4 text-xs font-bold text-rose-500 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar OS
                </button>
              )}
              <button
                onClick={() => {
                  setWhatsAppModalOrder(selectedOrderForModal)
                  setSelectedOrderForModal(null)
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-wr-border bg-wr-elevated py-2.5 text-xs font-semibold text-wr-text hover:border-emerald-500 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                Enviar WhatsApp
              </button>
              <button
                onClick={() => {
                  setPdfModalOrder(selectedOrderForModal)
                  setSelectedOrderForModal(null)
                }}
                className="wr-btn-primary flex-1 py-2.5"
              >
                <Printer className="h-4 w-4" />
                Imprimir OS
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
                    Pronta para envio direto ao cliente com resumo completo e carimbo fiscal
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

            <div className="rounded-2xl border border-slate-300 bg-white p-6 space-y-4 text-slate-900 shadow-md">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-auto flex items-center justify-center p-1 rounded-xl border border-slate-200 bg-slate-50">
                    <WrLogo size="lg" variant="light" showSubtitle={true} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{fiscalSettings.tradeName}</h2>
                    <p className="text-[11px] font-semibold text-slate-600">{fiscalSettings.companyName}</p>
                    <p className="text-[10px] text-slate-500">
                      CNPJ: {fiscalSettings.cnpj} &bull; IM: {fiscalSettings.cityRegistration} &bull; Luzimangues / Porto Nacional - TO
                    </p>
                    <p className="text-[10px] text-slate-500">
                      WhatsApp: {fiscalSettings.phone || '(63) 99234-5678'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-black text-amber-600 block">
                    {pdfModalOrder.number}
                  </span>
                  <span className="text-[11px] text-slate-500 block font-medium">Data: {pdfModalOrder.date}</span>
                  {pdfModalOrder.paymentMethod && (
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded inline-block mt-1">
                      {PAYMENT_LABELS[pdfModalOrder.paymentMethod] || pdfModalOrder.paymentMethod}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-700 block">Cliente</span>
                  <p className="font-bold text-slate-900 text-sm">{pdfModalOrder.clientName}</p>
                  <p className="text-slate-600 font-mono text-xs">{pdfModalOrder.clientPhone}</p>
                  {pdfModalOrder.clientCpfCnpj && (
                    <p className="text-slate-500 font-mono text-[10px]">CPF/CNPJ: {pdfModalOrder.clientCpfCnpj}</p>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-700 block">Veículo</span>
                  <p className="font-bold text-slate-900 text-sm">{pdfModalOrder.vehicleModel}</p>
                  <p className="text-slate-600 font-mono text-xs font-semibold">
                    Placa: {pdfModalOrder.vehiclePlate} &bull;{' '}
                    {Number(pdfModalOrder.mileage).toLocaleString('pt-BR')} km
                  </p>
                  <p className="text-slate-500 text-[10px]">Mecânico: {pdfModalOrder.mechanicAssigned}</p>
                </div>
              </div>

              {pdfModalOrder.inspection && (
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-[11px] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    Vistoria Visual de Entrada (Faróis, Pintura, Pneus e Lataria)
                  </span>
                  <div className="flex flex-wrap gap-2 text-slate-800">
                    {VISUAL_CHECKLIST_ITEMS.map(item => {
                      const val = pdfModalOrder.inspection?.[item.key] || 'ok'
                      return (
                        <span key={item.key} className="text-slate-700 text-[10px]">
                          {item.label}:{' '}
                          <strong className={val === 'ok' ? 'text-emerald-700' : 'text-rose-600'}>
                            {val === 'ok' ? 'OK' : 'Avaria'}
                          </strong>
                        </span>
                      )
                    })}
                  </div>
                  {pdfModalOrder.inspection.bodyworkDamages && (
                    <p className="text-slate-600 text-[10px]">Obs: {pdfModalOrder.inspection.bodyworkDamages}</p>
                  )}
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs min-w-[440px]">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">Descrição do Serviço / Peça</th>
                      <th className="p-2.5 text-right">Valor Peças</th>
                      <th className="p-2.5 text-right">Mão de Obra</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {pdfModalOrder.items?.map(it => (
                      <tr key={it.id}>
                        <td className="p-2.5 font-medium">{it.serviceDescription}</td>
                        <td className="p-2.5 font-mono text-right text-slate-600">
                          {formatCurrency(it.partsCost)}
                        </td>
                        <td className="p-2.5 font-mono text-right text-slate-600">
                          {formatCurrency(it.laborCost)}
                        </td>
                        <td className="p-2.5 font-mono text-right font-bold text-slate-900">
                          {formatCurrency(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
                    <tr>
                      <td className="p-2.5 text-slate-800">TOTAL DA ORDEM DE SERVIÇO</td>
                      <td className="p-2.5 font-mono text-right text-slate-700">
                        {formatCurrency(pdfModalOrder.partsTotal || 0)}
                      </td>
                      <td className="p-2.5 font-mono text-right text-slate-700">
                        {formatCurrency(pdfModalOrder.laborTotal || 0)}
                      </td>
                      <td className="p-2.5 font-mono text-right text-sm text-amber-700 font-black">
                        {formatCurrency(pdfModalOrder.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                <p>
                  <strong>Garantia Legal (Art. 26 do CDC):</strong> {fiscalSettings.warrantyTerms || '90 dias de garantia para serviços e garantia do fabricante para peças.'}
                </p>
                {pdfModalOrder.observations && (
                  <p>
                    <strong>Observações:</strong> {pdfModalOrder.observations}
                  </p>
                )}
              </div>

              {/* Aviso para autorização do cliente antes do início dos trabalhos */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-50/70 p-3 text-center text-xs font-semibold text-amber-900">
                Ordem de Serviço enviada para conferência e autorização prévia do cliente.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: FINALIZAR OS & PAGAMENTO ===================== */}
      {finalizingOrder && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-lg space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-wr-text">Finalizar Ordem de Serviço</h3>
                  <p className="text-[11px] text-wr-muted font-mono">
                    {finalizingOrder.number} &bull; {finalizingOrder.clientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFinalizingOrder(null)}
                className="text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Resumo Financeiro da OS & Descontos */}
            {(() => {
              const baseParts = finalizingOrder.partsTotal || 0
              const baseLabor = finalizingOrder.laborTotal || 0
              const baseSubtotal = baseParts + baseLabor
              const currentDiscount = Math.min(Math.max(0, Number(finalizingDiscount) || 0), baseSubtotal)
              const finalCalculatedTotal = Math.max(0, baseSubtotal - currentDiscount)

              return (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-wr-surface border border-wr-border space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-wr-elevated border border-wr-border">
                        <span className="text-[10px] text-wr-muted block">Peças</span>
                        <span className="font-mono font-bold text-wr-text">
                          {formatCurrency(baseParts)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-wr-elevated border border-wr-border">
                        <span className="text-[10px] text-wr-muted block">Mão de Obra</span>
                        <span className="font-mono font-bold text-wr-text">
                          {formatCurrency(baseLabor)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-wr-elevated border border-wr-border">
                        <span className="text-[10px] text-wr-muted block">Subtotal</span>
                        <span className="font-mono font-bold text-wr-text">
                          {formatCurrency(baseSubtotal)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <span className="text-[10px] text-emerald-500 font-bold block">TOTAL FINAL</span>
                        <span className="font-mono text-base font-black text-emerald-500">
                          {formatCurrency(finalCalculatedTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Campo de Desconto Simples e Prático */}
                    <div className="pt-2 border-t border-wr-border flex items-center justify-between gap-3">
                      <label className="text-xs font-bold text-wr-text">
                        Desconto
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-wr-muted font-mono">R$</span>
                        <input
                          type="number"
                          min="0"
                          max={baseSubtotal}
                          step="1"
                          value={finalizingDiscount || ''}
                          onChange={e => setFinalizingDiscount(Math.max(0, Number(e.target.value)))}
                          placeholder="0,00"
                          className="wr-input w-28 bg-wr-elevated font-mono font-bold text-right py-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seleção da Forma de Pagamento */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-wr-orange">
                      Escolha a Forma de Pagamento:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
                        { id: 'pix', label: 'PIX', icon: '⚡' },
                        { id: 'cartao_debito', label: 'Cartão Débito', icon: '💳' },
                        { id: 'cartao_credito', label: 'Cartão Crédito', icon: '💳' },
                        { id: 'pagar_depois', label: 'A Prazo (Fiado)', icon: '📝' },
                        { id: 'boleto', label: 'Boleto', icon: '📄' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFinalizingPaymentMethod(opt.id as PaymentMethod)}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                            finalizingPaymentMethod === opt.id
                              ? 'border-wr-orange bg-wr-orange/15 text-wr-orange font-bold shadow-sm'
                              : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text'
                          }`}
                        >
                          <span className="text-base">{opt.icon}</span>
                          <span className="text-[11px]">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Parcelamento no Cartão de Crédito */}
                  {finalizingPaymentMethod === 'cartao_credito' && (
                    <div className="p-3.5 rounded-2xl bg-wr-surface border border-wr-orange/30 space-y-1.5 animate-fadeIn">
                      <label className="block text-xs font-bold text-wr-orange">
                        Dividir em quantas vezes no Crédito?
                      </label>
                      <select
                        value={finalizingInstallments}
                        onChange={e => setFinalizingInstallments(Number(e.target.value))}
                        className="wr-input bg-wr-elevated font-semibold text-xs"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => {
                          const parcelVal = finalCalculatedTotal / n
                          return (
                            <option key={n} value={n}>
                              {n === 1
                                ? `1x de ${formatCurrency(finalCalculatedTotal)} (À vista no crédito)`
                                : `${n}x de ${formatCurrency(parcelVal)} sem juros`}
                            </option>
                          )
                        })}
                      </select>
                      <span className="text-[10px] text-wr-muted block">
                        Essa condição de parcelamento constará na Nota Fiscal e no comprovante.
                      </span>
                    </div>
                  )}

                  {/* Vencimento caso seja Pagar Depois */}
                  {finalizingPaymentMethod === 'pagar_depois' && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 animate-fadeIn">
                      <label className="block text-xs font-bold text-amber-600 dark:text-amber-400">
                        Data de Vencimento Combinada (A Prazo):
                      </label>
                      <input
                        type="date"
                        value={finalizingDueDate}
                        onChange={e => setFinalizingDueDate(e.target.value)}
                        className="wr-input bg-wr-surface font-mono"
                      />
                    </div>
                  )}

                  {/* Checkbox de Emissão Fiscal */}
                  <div className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs block">
                        Emitir Nota Fiscal (NFS-e Porto Nacional / Luzimangues)
                      </span>
                      <p className="text-[10px] text-wr-muted">
                        Gera a NFS-e oficial com a forma de pagamento e parcelamento especificados.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={finalizingEmitNfse}
                      onChange={e => setFinalizingEmitNfse(e.target.checked)}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-wr-border">
                    <button
                      type="button"
                      onClick={() => setFinalizingOrder(null)}
                      className="wr-btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        finishOrder(finalizingOrder.id, {
                          paymentMethod: finalizingPaymentMethod,
                          installments:
                            finalizingPaymentMethod === 'cartao_credito' ? finalizingInstallments : 1,
                          discount: currentDiscount,
                          emitNfse: finalizingEmitNfse,
                          dueDate: finalizingDueDate,
                        })
                        setFinalizingOrder(null)
                      }}
                      className="rounded-xl bg-emerald-600 text-white font-bold px-4 py-2 hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Concluir OS e Entregar Veículo
                    </button>
                  </div>
                </div>
              )
            })()}
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

                <div className="space-y-3">
                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">
                      Cliente (digite para autocompletar) *
                    </label>
                    <ClientAutocomplete
                      value={clientName}
                      onChange={name => setClientName(name)}
                      onConfirmNewClientName={name => {
                        setClientName(name)
                        handleRegisterClientAndVehicle()
                      }}
                      onSelectClient={c => {
                        setSelectedClientId(c.id)
                        setClientName(c.name)
                        setClientPhone(c.phone)
                        setClientCpfCnpj(c.cpfCnpj || '')
                        const linked = vehicles.filter(v => v.clientId === c.id)
                        if (linked.length > 0) {
                          setSelectedVehicleId(linked[0].id)
                          setVehicleModel(`${linked[0].brand} ${linked[0].model}`)
                          setVehiclePlate(linked[0].plate)
                          setMileage(linked[0].currentMileage || 0)
                        }
                      }}
                      placeholder="Digite o nome do cliente..."
                      required
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-wr-muted font-semibold mb-1">
                        Telefone / WhatsApp *
                      </label>
                      <input
                        type="text"
                        required
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        placeholder="(63) 99234-5678"
                        className="wr-input bg-wr-surface font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-wr-muted font-semibold mb-1">
                        CPF / CNPJ (para NFS-e)
                      </label>
                      <input
                        type="text"
                        value={clientCpfCnpj}
                        onChange={e => setClientCpfCnpj(e.target.value)}
                        placeholder="000.000.000-00"
                        className="wr-input bg-wr-surface font-mono"
                      />
                    </div>
                  </div>

                  {/* Veículo com Autocomplete vinculado ao dono */}
                  <VehicleAutocomplete
                    clientId={selectedClientId}
                    modelValue={vehicleModel}
                    plateValue={vehiclePlate}
                    onModelChange={m => setVehicleModel(m)}
                    onPlateChange={p => setVehiclePlate(p)}
                    onSelectVehicle={v => {
                      setSelectedVehicleId(v.id)
                      setVehicleModel(`${v.brand} ${v.model}`)
                      setVehiclePlate(v.plate)
                      setMileage(v.currentMileage || 0)
                    }}
                  />

                  {/* Botão de Cadastro Rápido de Cliente e Veículo */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-wr-border">
                    <div className="flex items-center gap-2 text-[11px] text-wr-muted">
                      {selectedClientId ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <UserCheck className="h-4 w-4" /> Cliente vinculado ao cadastro permanente
                        </span>
                      ) : (
                        <span>Cliente novo. Clique ao lado para salvar em Clientes e Veículos.</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRegisterClientAndVehicle()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-wr-orange/15 border border-wr-orange/40 hover:bg-wr-orange hover:text-white text-wr-orange text-xs font-bold transition-all shadow-sm"
                      title="Salva este cliente, telefone e veículo no banco de dados do sistema"
                    >
                      <UserCheck className="h-4 w-4" />
                      OK, usar e cadastrar este usuário
                    </button>
                  </div>

                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">
                      Quilometragem (KM)
                    </label>
                    <input
                      type="number"
                      value={mileage || ''}
                      onChange={e => setMileage(Number(e.target.value))}
                      placeholder="Ex: 85000"
                      className="wr-input bg-wr-surface font-mono max-w-xs"
                    />
                  </div>
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
                    Inspeção visual na entrada do veículo na oficina
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

              {/* 3. SERVIÇO & MECÂNICO RESPONSÁVEL */}
              <div className="wr-surface-muted p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-wr-orange block">
                  Serviço &amp; Mecânico Responsável
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      {mechanics.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  placeholder="Observações gerais do cliente (opcional)..."
                  className="wr-input bg-wr-surface"
                />
              </div>

              {/* 4. ITENS & VALORES ESPECIFICADOS (PEÇAS E MÃO DE OBRA) */}
              <div className="wr-surface-muted p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-wr-orange block">
                      Itens do Serviço (Discriminação Detalhada de Peças e Mão de Obra)
                    </span>
                    <span className="text-[10px] text-wr-muted">
                      Especifique o valor das peças e o valor da mão de obra de cada item separadamente
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Total: {formatCurrency(totalSum)}
                  </span>
                </div>

                <div className="rounded-2xl bg-wr-surface p-4 border border-wr-orange/40 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-wr-orange flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Adicionar Novo Item de Serviço / Peça
                    </span>
                    <span className="text-[11px] text-wr-muted hidden sm:inline">
                      Sem cortes: digite a descrição e valores nos campos espaçosos abaixo
                    </span>
                  </div>

                  {/* Linha 1: Descrição completa com largura total e sugestões sem corte */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-wr-text mb-1">
                      Descrição do Serviço ou Peça *
                    </label>
                    <input
                      type="text"
                      placeholder="Digite a descrição (Ex: Troca de pastilhas de freio dianteiras, Óleo 5W30...)"
                      value={newItemDesc}
                      onFocus={() => {
                        if (newItemDesc.trim().length > 0) setShowSuggestions(true)
                      }}
                      onChange={e => {
                        setNewItemDesc(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          setShowSuggestions(false)
                        } else if (e.key === 'Escape') {
                          setShowSuggestions(false)
                        }
                      }}
                      className="wr-input text-xs sm:text-sm py-2.5 px-3.5 font-medium leading-relaxed"
                    />
                    {showSuggestions &&
                      newItemDesc.trim().length > 0 &&
                      filteredSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-wr-border bg-wr-surface shadow-2xl p-1.5 space-y-1 z-50 animate-fadeIn">
                          {filteredSuggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectSuggestion(sug)}
                              className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-wr-orange/15 hover:text-wr-orange text-wr-text text-xs font-bold transition-all truncate"
                            >
                              {sug.name}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Linha 2: Valores e Botão de Adição com espaço amplo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-bold text-wr-text mb-1">
                        Valor Peças (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={newItemParts || ''}
                        onChange={e => setNewItemParts(Number(e.target.value))}
                        className="wr-input font-mono text-xs sm:text-sm py-2.5 px-3.5 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-wr-text mb-1">
                        Mão de Obra (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={newItemLabor || ''}
                        onChange={e => setNewItemLabor(Number(e.target.value))}
                        className="wr-input font-mono text-xs sm:text-sm py-2.5 px-3.5 font-semibold"
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="wr-btn-primary w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
                        title="Adicionar item à Ordem de Serviço"
                      >
                        <Plus className="h-4 w-4 stroke-[3]" />
                        <span>Adicionar Item à OS</span>
                      </button>
                    </div>
                  </div>
                </div>

                {serviceItems.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-wr-border bg-wr-surface">
                    <table className="w-full text-left text-xs min-w-[420px]">
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
