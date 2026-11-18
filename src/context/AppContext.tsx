import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  Client,
  Vehicle,
  ServiceOrder,
  StockItem,
  FinancialRecord,
  Appointment,
  AppointmentStatus,
  FiscalSettings,
  FiscalInvoice,
  DeferredPayment,
  DeferredPaymentEntry,
  ThemeMode,
} from '../types'
import {
  INITIAL_CLIENTS,
  INITIAL_VEHICLES,
  INITIAL_STOCK,
  INITIAL_ORDERS,
  INITIAL_FINANCIAL,
  INITIAL_APPOINTMENTS,
  INITIAL_DEFERRED_PAYMENTS,
  DEFAULT_FISCAL_SETTINGS,
} from '../mockData'
import {
  saveLocalDebounced,
  loadLocalSafe,
  fetchTableCached,
  upsertDeltaRow,
  deleteDeltaRow,
  isSupabaseConfigured,
  getSupabaseOptimizationMetrics,
  StorageMetrics,
} from '../utils/supabaseClient'

export type TabType =
  | 'inicio'
  | 'os'
  | 'atendimentos'
  | 'clientes'
  | 'fiado'
  | 'estoque'
  | 'financeiro'
  | 'relatorios'
  | 'configuracoes'

export interface ToastMessage {
  id: string
  type: 'success' | 'info' | 'warning'
  message: string
}

export interface OrderPrefill {
  clientId?: string
  vehicleId?: string
}

interface AppContextType {
  theme: ThemeMode
  toggleTheme: () => void
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void

  clients: Client[]
  vehicles: Vehicle[]
  stock: StockItem[]
  orders: ServiceOrder[]
  financial: FinancialRecord[]
  appointments: Appointment[]
  deferredPayments: DeferredPayment[]
  fiscalSettings: FiscalSettings

  updateFiscalSettings: (settings: Partial<FiscalSettings>) => void
  issueFiscalInvoice: (orderId: string) => FiscalInvoice | null
  cancelFiscalInvoice: (orderId: string) => void

  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client
  updateClient: (id: string, client: Partial<Client>) => void

  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void

  addOrder: (order: Omit<ServiceOrder, 'id' | 'number'>) => ServiceOrder
  updateOrder: (id: string, updated: Partial<ServiceOrder>) => void
  updateOrderStatus: (id: string, status: ServiceOrder['status']) => void

  addDeferredPayment: (data: Omit<DeferredPayment, 'id' | 'createdAt' | 'payments'>) => DeferredPayment
  registerDeferredPayment: (
    id: string,
    amount: number,
    method: DeferredPaymentEntry['method'],
    note?: string
  ) => void
  deleteDeferredPayment: (id: string) => void

  addStockItem: (item: Omit<StockItem, 'id' | 'status'>) => void
  adjustStockQuantity: (id: string, delta: number) => void

  addFinancialRecord: (record: Omit<FinancialRecord, 'id'>) => void
  toggleFinancialStatus: (id: string) => void

  addAppointment: (apt: Omit<Appointment, 'id'>) => Appointment
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void

  formatCurrency: (val: number) => string
  sendWhatsApp: (phone: string, text: string) => void

  selectedOrderForModal: ServiceOrder | null
  setSelectedOrderForModal: (order: ServiceOrder | null) => void
  isNewOrderModalOpen: boolean
  setIsNewOrderModalOpen: (open: boolean) => void
  orderPrefill: OrderPrefill | null
  setOrderPrefill: (prefill: OrderPrefill | null) => void
  openNewOrderModal: (prefill?: OrderPrefill) => void

  selectedClientId: string | null
  setSelectedClientId: (id: string | null) => void

  toasts: ToastMessage[]
  showToast: (message: string, type?: ToastMessage['type']) => void
  dismissToast: (id: string) => void

  storageMetrics: StorageMetrics
  resetDataToDefault: () => void
}

const STORAGE_KEYS = {
  clients: 'wr_clients_v5',
  vehicles: 'wr_vehicles_v5',
  stock: 'wr_stock_v5',
  orders: 'wr_orders_v5',
  financial: 'wr_financial_v5',
  appointments: 'wr_appointments_v5',
  deferred: 'wr_deferred_v5',
  fiscal: 'wr_fiscal_v5',
  theme: 'wr_theme',
} as const

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.theme)
    return saved === 'light' || saved === 'dark' ? saved : 'dark'
  })

  const [activeTab, setActiveTab] = useState<TabType>('inicio')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<ServiceOrder | null>(null)
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false)
  const [orderPrefill, setOrderPrefill] = useState<OrderPrefill | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const [clients, setClients] = useState<Client[]>(() =>
    loadLocalSafe(STORAGE_KEYS.clients, INITIAL_CLIENTS)
  )
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    loadLocalSafe(STORAGE_KEYS.vehicles, INITIAL_VEHICLES)
  )
  const [stock, setStock] = useState<StockItem[]>(() =>
    loadLocalSafe(STORAGE_KEYS.stock, INITIAL_STOCK)
  )
  const [orders, setOrders] = useState<ServiceOrder[]>(() =>
    loadLocalSafe(STORAGE_KEYS.orders, INITIAL_ORDERS)
  )
  const [financial, setFinancial] = useState<FinancialRecord[]>(() =>
    loadLocalSafe(STORAGE_KEYS.financial, INITIAL_FINANCIAL)
  )
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadLocalSafe(STORAGE_KEYS.appointments, INITIAL_APPOINTMENTS)
  )
  const [deferredPayments, setDeferredPayments] = useState<DeferredPayment[]>(() =>
    loadLocalSafe(STORAGE_KEYS.deferred, INITIAL_DEFERRED_PAYMENTS)
  )
  const [fiscalSettings, setFiscalSettings] = useState<FiscalSettings>(() =>
    loadLocalSafe(STORAGE_KEYS.fiscal, DEFAULT_FISCAL_SETTINGS)
  )

  // Aplicar tema claro/escuro no <html>
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem(STORAGE_KEYS.theme, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  // Sincronização inicial opcional com Supabase (1 única vez por sessão graças ao TTL cache)
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    Promise.all([
      fetchTableCached<Client>('clients'),
      fetchTableCached<Vehicle>('vehicles'),
      fetchTableCached<ServiceOrder>('service_orders'),
      fetchTableCached<DeferredPayment>('deferred_payments'),
      fetchTableCached<StockItem>('stock_items'),
      fetchTableCached<FinancialRecord>('financial_records'),
      fetchTableCached<Appointment>('appointments'),
      fetchTableCached<FiscalSettings>('fiscal_settings', { limit: 1 }),
    ]).then(([c, v, o, d, s, f, a, fs]) => {
      if (!active) return
      if (c && c.length > 0) setClients(c)
      if (v && v.length > 0) setVehicles(v)
      if (o && o.length > 0) setOrders(o)
      if (d && d.length > 0) setDeferredPayments(d)
      if (s && s.length > 0) setStock(s)
      if (f && f.length > 0) setFinancial(f)
      if (a && a.length > 0) setAppointments(a)
      if (fs && fs.length > 0) setFiscalSettings(fs[0])
    })
    return () => {
      active = false
    }
  }, [])

  // Persistência local com debounce (evita bloqueio da UI e compacta payload)
  useEffect(() => saveLocalDebounced(STORAGE_KEYS.clients, clients), [clients])
  useEffect(() => saveLocalDebounced(STORAGE_KEYS.vehicles, vehicles), [vehicles])
  useEffect(() => saveLocalDebounced(STORAGE_KEYS.stock, stock), [stock])
  useEffect(() => saveLocalDebounced(STORAGE_KEYS.orders, orders), [orders])
  useEffect(() => saveLocalDebounced(STORAGE_KEYS.financial, financial), [financial])
  useEffect(() => saveLocalDebounced(STORAGE_KEYS.appointments, appointments), [appointments])
  useEffect(() => saveLocalDebounced(STORAGE_KEYS.deferred, deferredPayments), [deferredPayments])
  useEffect(() => saveLocalDebounced(STORAGE_KEYS.fiscal, fiscalSettings), [fiscalSettings])

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts(prev => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3800)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const formatCurrency = useCallback((val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0)
  }, [])

  const sendWhatsApp = useCallback((phone: string, text: string) => {
    const cleanNumber = phone.replace(/\D/g, '')
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
    const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }, [])

  const openNewOrderModal = useCallback((prefill?: OrderPrefill) => {
    if (prefill) setOrderPrefill(prefill)
    else setOrderPrefill(null)
    setActiveTab('os')
    setIsNewOrderModalOpen(true)
  }, [])

  const updateFiscalSettings = useCallback((updated: Partial<FiscalSettings>) => {
    setFiscalSettings(prev => {
      const next = { ...prev, ...updated }
      void upsertDeltaRow('fiscal_settings', 'default', next)
      return next
    })
  }, [])

  const updateOrder = useCallback((id: string, updated: Partial<ServiceOrder>) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === id) {
          const next = { ...o, ...updated }
          void upsertDeltaRow('service_orders', id, next, {
            client_id: next.clientId,
            status: next.status,
          })
          return next
        }
        return o
      })
    )
    setSelectedOrderForModal(prev => (prev && prev.id === id ? { ...prev, ...updated } : prev))
  }, [])

  const issueFiscalInvoice = useCallback(
    (orderId: string): FiscalInvoice | null => {
      const targetOrder = orders.find(o => o.id === orderId)
      if (!targetOrder) return null

      const currentYear = new Date().getFullYear()
      const invNum = fiscalSettings.nextInvoiceNumber
      const formattedInvNumber = `${currentYear}${String(invNum).padStart(7, '0')}`

      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      const rndSegment = () =>
        Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      const verificationCode = `${rndSegment()}-${rndSegment()}-${rndSegment()}`

      const cleanCnpj = fiscalSettings.cnpj.replace(/\D/g, '')
      const rndKeySuffix = Math.floor(1000000000 + Math.random() * 9000000000)
      const accessKey = `17${String(currentYear).slice(-2)}${cleanCnpj}55001${String(invNum).padStart(9, '0')}${rndKeySuffix}`

      const laborAmount = targetOrder.laborTotal || 0
      const issValue = Number(((laborAmount * fiscalSettings.issRate) / 100).toFixed(2))

      const newInvoice: FiscalInvoice = {
        invoiceNumber: formattedInvNumber,
        rpsNumber: String(targetOrder.number.replace(/\D/g, '') || invNum),
        rpsSeries: fiscalSettings.rpsSeries || '1',
        verificationCode,
        accessKey,
        issuedAt: new Date().toLocaleString('pt-BR'),
        protocolNumber: `317${currentYear}${String(invNum).padStart(6, '0')}${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'autorizada',
        serviceCode: fiscalSettings.serviceCode || '14.01',
        cnae: fiscalSettings.cnae || '4520-0/01',
        issRate: fiscalSettings.issRate,
        issValue,
        taxRegime: fiscalSettings.taxRegime === 'simples_nacional' ? 'Simples Nacional' : 'Lucro Presumido',
        danfseUrl: `https://nfe.palmas.to.gov.br/consulta?code=${verificationCode}`,
      }

      updateOrder(orderId, { fiscalInvoice: newInvoice })
      setFiscalSettings(prev => {
        const next = {
          ...prev,
          nextInvoiceNumber: prev.nextInvoiceNumber + 1,
          nextRpsNumber: prev.nextRpsNumber + 1,
        }
        void upsertDeltaRow('fiscal_settings', 'default', next)
        return next
      })

      showToast(`NFS-e #${formattedInvNumber} autorizada com sucesso!`)
      return newInvoice
    },
    [orders, fiscalSettings, updateOrder, showToast]
  )

  const cancelFiscalInvoice = useCallback(
    (orderId: string) => {
      const targetOrder = orders.find(o => o.id === orderId)
      if (!targetOrder || !targetOrder.fiscalInvoice) return

      updateOrder(orderId, {
        fiscalInvoice: {
          ...targetOrder.fiscalInvoice,
          status: 'cancelada',
        },
      })
      showToast('NFS-e cancelada.', 'warning')
    },
    [orders, updateOrder, showToast]
  )

  const addClient = useCallback(
    (clientData: Omit<Client, 'id' | 'createdAt'>) => {
      const newClient: Client = {
        ...clientData,
        id: `cli-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      }
      setClients(prev => [newClient, ...prev])
      void upsertDeltaRow('clients', newClient.id, newClient)
      showToast(`Cliente ${newClient.name} cadastrado!`)
      return newClient
    },
    [showToast]
  )

  const updateClient = useCallback(
    (id: string, updated: Partial<Client>) => {
      setClients(prev =>
        prev.map(c => {
          if (c.id === id) {
            const next = { ...c, ...updated }
            void upsertDeltaRow('clients', id, next)
            return next
          }
          return c
        })
      )
      if (updated.name) {
        setVehicles(prev =>
          prev.map(v => (v.clientId === id ? { ...v, clientName: updated.name } : v))
        )
      }
      showToast('Dados do cliente atualizados!')
    },
    [showToast]
  )

  const addVehicle = useCallback(
    (vehicleData: Omit<Vehicle, 'id'>) => {
      const newVehicle: Vehicle = {
        ...vehicleData,
        plate: vehicleData.plate.toUpperCase().trim(),
        id: `veh-${Date.now()}`,
      }
      setVehicles(prev => [newVehicle, ...prev])
      void upsertDeltaRow('vehicles', newVehicle.id, newVehicle, {
        client_id: newVehicle.clientId,
        plate: newVehicle.plate,
      })
      showToast(`Veículo ${newVehicle.brand} ${newVehicle.model} vinculado!`)
      return newVehicle
    },
    [showToast]
  )

  const updateVehicle = useCallback(
    (id: string, updated: Partial<Vehicle>) => {
      setVehicles(prev =>
        prev.map(v => {
          if (v.id === id) {
            const next = {
              ...v,
              ...updated,
              plate: (updated.plate ?? v.plate).toUpperCase().trim(),
            }
            void upsertDeltaRow('vehicles', id, next, {
              client_id: next.clientId,
              plate: next.plate,
            })
            return next
          }
          return v
        })
      )
      showToast('Veículo atualizado!')
    },
    [showToast]
  )

  const deleteVehicle = useCallback(
    (id: string) => {
      setVehicles(prev => prev.filter(v => v.id !== id))
      void deleteDeltaRow('vehicles', id)
      showToast('Veículo removido do cadastro.', 'info')
    },
    [showToast]
  )

  const addDeferredPayment = useCallback(
    (data: Omit<DeferredPayment, 'id' | 'createdAt' | 'payments'>) => {
      const created: DeferredPayment = {
        ...data,
        id: `def-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('pt-BR'),
        payments: [],
      }
      setDeferredPayments(prev => [created, ...prev])
      void upsertDeltaRow('deferred_payments', created.id, created, {
        client_id: created.clientId,
        due_date: created.dueDate,
      })
      showToast(`Conta a prazo registrada para ${created.clientName}.`)
      return created
    },
    [showToast]
  )

  const registerDeferredPayment = useCallback(
    (
      id: string,
      amount: number,
      method: DeferredPaymentEntry['method'],
      note?: string
    ) => {
      const value = Number(amount)
      if (!value || value <= 0) return

      const todayStr = new Date().toLocaleDateString('pt-BR')
      let targetForFinance: DeferredPayment | null = null

      setDeferredPayments(prev =>
        prev.map(item => {
          if (item.id !== id) return item
          const remaining = Math.max(0, item.totalAmount - item.paidAmount)
          const applied = Math.min(value, remaining)
          const entry: DeferredPaymentEntry = {
            id: `pay-${Date.now()}`,
            date: todayStr,
            amount: applied,
            method,
            note,
          }
          const next: DeferredPayment = {
            ...item,
            paidAmount: Number((item.paidAmount + applied).toFixed(2)),
            payments: [entry, ...item.payments],
          }
          targetForFinance = next
          void upsertDeltaRow('deferred_payments', id, next, {
            client_id: next.clientId,
            due_date: next.dueDate,
          })
          return next
        })
      )

      if (targetForFinance) {
        const ref = targetForFinance as DeferredPayment
        const finRec: FinancialRecord = {
          id: `fin-def-${Date.now()}`,
          type: 'receita',
          category: 'Recebimento a Prazo',
          description: `Pagamento (${method.replace('_', ' ').toUpperCase()}) - ${ref.description}`,
          amount: value,
          entityName: ref.clientName,
          dueDate: todayStr,
          paymentDate: todayStr,
          status: 'pago',
          deferredId: ref.id,
        }
        setFinancial(prev => [finRec, ...prev])
        void upsertDeltaRow('financial_records', finRec.id, finRec, {
          type: finRec.type,
          status: finRec.status,
        })
        showToast(
          ref.paidAmount >= ref.totalAmount
            ? `Conta de ${ref.clientName} quitada com sucesso!`
            : `Pagamento parcial de ${formatCurrency(value)} registrado!`
        )
      }
    },
    [formatCurrency, showToast]
  )

  const deleteDeferredPayment = useCallback(
    (id: string) => {
      setDeferredPayments(prev => prev.filter(d => d.id !== id))
      void deleteDeltaRow('deferred_payments', id)
      showToast('Registro removido.', 'info')
    },
    [showToast]
  )

  const addOrder = useCallback(
    (orderData: Omit<ServiceOrder, 'id' | 'number'>) => {
      const maxNum = orders.reduce((acc, o) => {
        const parsed = parseInt(o.number.replace(/\D/g, ''), 10)
        return Number.isNaN(parsed) ? acc : Math.max(acc, parsed)
      }, 1024)
      const nextNumber = `OS #${maxNum + 1}`
      const newOrder: ServiceOrder = {
        ...orderData,
        id: `os-${Date.now()}`,
        number: nextNumber,
      }
      setOrders(prev => [newOrder, ...prev])
      void upsertDeltaRow('service_orders', newOrder.id, newOrder, {
        client_id: newOrder.clientId,
        status: newOrder.status,
      })

      const finRecord: FinancialRecord = {
        id: `fin-${Date.now()}`,
        type: 'receita',
        category: 'Serviços & Peças',
        description: `${nextNumber} - ${orderData.vehicleModel}`,
        amount: orderData.totalAmount,
        entityName: orderData.clientName,
        dueDate: orderData.date,
        status: orderData.paymentMethod === 'pagar_depois' || orderData.paymentMethod === 'pendente' ? 'pendente' : 'pago',
        paymentDate:
          orderData.paymentMethod === 'pagar_depois' || orderData.paymentMethod === 'pendente'
            ? undefined
            : orderData.date,
        orderId: newOrder.id,
      }
      setFinancial(prev => [finRecord, ...prev])
      void upsertDeltaRow('financial_records', finRecord.id, finRecord, {
        type: finRecord.type,
        status: finRecord.status,
      })

      // Se marcado como "Pagar Depois", cria automaticamente controle na aba Pagar Depois
      if (orderData.paymentMethod === 'pagar_depois') {
        const defaultDue = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
        const deferred: DeferredPayment = {
          id: `def-${Date.now() + 1}`,
          clientId: newOrder.clientId,
          clientName: newOrder.clientName,
          clientPhone: newOrder.clientPhone,
          vehicleInfo: `${newOrder.vehicleModel} • ${newOrder.vehiclePlate}`,
          orderId: newOrder.id,
          orderNumber: newOrder.number,
          description: `${newOrder.number} - ${newOrder.serviceDescription}`,
          totalAmount: newOrder.totalAmount,
          paidAmount: 0,
          createdAt: newOrder.date,
          dueDate: orderData.paymentDueDate || defaultDue,
          payments: [],
          notes: orderData.observations || 'Pagamento a prazo gerado automaticamente pela OS.',
        }
        setDeferredPayments(prev => [deferred, ...prev])
        void upsertDeltaRow('deferred_payments', deferred.id, deferred, {
          client_id: deferred.clientId,
          due_date: deferred.dueDate,
        })
        showToast(`${nextNumber} criada e lançada na aba "Pagar Depois"!`)
      } else {
        showToast(`${nextNumber} cadastrada com sucesso!`)
      }

      return newOrder
    },
    [orders, showToast]
  )

  const updateOrderStatus = useCallback(
    (id: string, status: ServiceOrder['status']) => {
      updateOrder(id, { status })
      showToast('Status da ordem de serviço atualizado!', 'info')
    },
    [updateOrder, showToast]
  )

  const addStockItem = useCallback(
    (itemData: Omit<StockItem, 'id' | 'status'>) => {
      const status = itemData.quantity <= itemData.minQuantity ? 'Baixo' : 'OK'
      const newItem: StockItem = {
        ...itemData,
        id: `stk-${Date.now()}`,
        status,
      }
      setStock(prev => [newItem, ...prev])
      void upsertDeltaRow('stock_items', newItem.id, newItem, { code: newItem.code })
      showToast(`Peça ${newItem.name} adicionada ao estoque!`)
    },
    [showToast]
  )

  const adjustStockQuantity = useCallback((id: string, delta: number) => {
    setStock(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta)
          const next: StockItem = {
            ...item,
            quantity: newQty,
            status: newQty <= item.minQuantity ? 'Baixo' : 'OK',
          }
          void upsertDeltaRow('stock_items', id, next, { code: next.code })
          return next
        }
        return item
      })
    )
  }, [])

  const addFinancialRecord = useCallback(
    (recordData: Omit<FinancialRecord, 'id'>) => {
      const newRec: FinancialRecord = {
        ...recordData,
        id: `fin-${Date.now()}`,
      }
      setFinancial(prev => [newRec, ...prev])
      void upsertDeltaRow('financial_records', newRec.id, newRec, {
        type: newRec.type,
        status: newRec.status,
      })
      showToast('Lançamento financeiro registrado!')
    },
    [showToast]
  )

  const toggleFinancialStatus = useCallback((id: string) => {
    setFinancial(prev =>
      prev.map(f => {
        if (f.id === id) {
          const nextStatus: FinancialRecord['status'] = f.status === 'pago' ? 'pendente' : 'pago'
          const next: FinancialRecord = {
            ...f,
            status: nextStatus,
            paymentDate: nextStatus === 'pago' ? new Date().toLocaleDateString('pt-BR') : undefined,
          }
          void upsertDeltaRow('financial_records', id, next, {
            type: next.type,
            status: next.status,
          })
          return next
        }
        return f
      })
    )
  }, [])

  const addAppointment = useCallback(
    (aptData: Omit<Appointment, 'id'>) => {
      const created: Appointment = {
        ...aptData,
        id: `apt-${Date.now()}`,
      }
      setAppointments(prev => [created, ...prev])
      void upsertDeltaRow('appointments', created.id, created, {
        date: created.date,
        status: created.status,
      })
      showToast(`Agendamento para ${created.clientName} criado!`)
      return created
    },
    [showToast]
  )

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setAppointments(prev =>
      prev.map(a => {
        if (a.id === id) {
          const next = { ...a, status }
          void upsertDeltaRow('appointments', id, next, {
            date: next.date,
            status: next.status,
          })
          return next
        }
        return a
      })
    )
  }, [])

  const resetDataToDefault = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(k => {
      if (k !== STORAGE_KEYS.theme) localStorage.removeItem(k)
    })
    setClients(INITIAL_CLIENTS)
    setVehicles(INITIAL_VEHICLES)
    setStock(INITIAL_STOCK)
    setOrders(INITIAL_ORDERS)
    setFinancial(INITIAL_FINANCIAL)
    setAppointments(INITIAL_APPOINTMENTS)
    setDeferredPayments(INITIAL_DEFERRED_PAYMENTS)
    setFiscalSettings(DEFAULT_FISCAL_SETTINGS)
    showToast('Dados de demonstração restaurados!', 'info')
  }, [showToast])

  const storageMetrics = useMemo(
    () =>
      getSupabaseOptimizationMetrics({
        clients,
        vehicles,
        stock,
        orders,
        financial,
        appointments,
        deferredPayments,
        fiscalSettings,
      }),
    [clients, vehicles, stock, orders, financial, appointments, deferredPayments, fiscalSettings]
  )

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        mobileMenuOpen,
        setMobileMenuOpen,
        clients,
        vehicles,
        stock,
        orders,
        financial,
        appointments,
        deferredPayments,
        fiscalSettings,
        updateFiscalSettings,
        issueFiscalInvoice,
        cancelFiscalInvoice,
        addClient,
        updateClient,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addOrder,
        updateOrder,
        updateOrderStatus,
        addDeferredPayment,
        registerDeferredPayment,
        deleteDeferredPayment,
        addStockItem,
        adjustStockQuantity,
        addFinancialRecord,
        toggleFinancialStatus,
        addAppointment,
        updateAppointmentStatus,
        formatCurrency,
        sendWhatsApp,
        selectedOrderForModal,
        setSelectedOrderForModal,
        isNewOrderModalOpen,
        setIsNewOrderModalOpen,
        orderPrefill,
        setOrderPrefill,
        openNewOrderModal,
        selectedClientId,
        setSelectedClientId,
        toasts,
        showToast,
        dismissToast,
        storageMetrics,
        resetDataToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
