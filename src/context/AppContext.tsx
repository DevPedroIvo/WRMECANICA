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
  UserRole,
  DailyCashShift,
  CashMovement,
  PaymentMethod,
  ClientReminder,
  ServicePreset,
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
  DEMO_CLIENTS,
  DEMO_VEHICLES,
  DEMO_STOCK,
  DEMO_ORDERS,
  DEMO_FINANCIAL,
  DEMO_APPOINTMENTS,
  DEMO_DEFERRED_PAYMENTS,
} from '../mockData'

export const INITIAL_SERVICE_PRESETS: ServicePreset[] = [
  { id: 'srv-1', name: 'Troca de Óleo e Filtros', partsCost: 180, laborCost: 120, category: 'Revisão' },
  { id: 'srv-2', name: 'Troca de Pastilhas de Freio Dianteiras', partsCost: 185, laborCost: 150, category: 'Freios' },
  { id: 'srv-3', name: 'Troca de Pastilhas de Freio Traseiras', partsCost: 160, laborCost: 140, category: 'Freios' },
  { id: 'srv-4', name: 'Alinhamento 3D e Balanceamento', partsCost: 0, laborCost: 150, category: 'Suspensão' },
  { id: 'srv-5', name: 'Sangria e Troca de Fluido de Freio DOT 4', partsCost: 90, laborCost: 120, category: 'Freios' },
  { id: 'srv-6', name: 'Higienização de Ar Condicionado + Filtro de Cabine', partsCost: 75, laborCost: 110, category: 'Ar Condicionado' },
  { id: 'srv-7', name: 'Diagnóstico Eletrônico Computadorizado', partsCost: 0, laborCost: 200, category: 'Diagnóstico' },
  { id: 'srv-8', name: 'Troca de Bateria Automotiva 60Ah', partsCost: 470, laborCost: 60, category: 'Elétrica' },
  { id: 'srv-9', name: 'Troca de Amortecedores Dianteiros (Par)', partsCost: 720, laborCost: 260, category: 'Suspensão' },
  { id: 'srv-10', name: 'Troca de Velas de Ignição Iridium (Jogo)', partsCost: 240, laborCost: 120, category: 'Motor' },
  { id: 'srv-11', name: 'Revisão Preventiva Completa', partsCost: 350, laborCost: 280, category: 'Revisão' },
  { id: 'srv-12', name: 'Troca de Correia Dentada e Tensor', partsCost: 380, laborCost: 320, category: 'Motor' },
  { id: 'srv-13', name: 'Limpeza de Bicos Injetores e TBI', partsCost: 60, laborCost: 190, category: 'Injeção' },
  { id: 'srv-14', name: 'Substituição de Embreagem Completa', partsCost: 650, laborCost: 450, category: 'Transmissão' },
]
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
import { sendAppNotification } from '../utils/notifications'

export type TabType =
  | 'inicio'
  | 'os'
  | 'caixa'
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
  clientName?: string
  clientPhone?: string
  vehiclePlate?: string
  vehicleModel?: string
  serviceDescription?: string
}

export interface FinishOrderOptions {
  paymentMethod: PaymentMethod
  installments?: number
  discount?: number
  emitNfse: boolean
  dueDate?: string
}

// Abas que podem ser liberadas para os funcionários (Configurações é exclusiva do dono)
export const PERMISSION_TABS: { id: TabType; label: string; description: string }[] = [
  { id: 'inicio', label: 'Visão Geral', description: 'Painel inicial (sempre liberado)' },
  { id: 'caixa', label: 'Caixa Diário', description: 'Abrir/fechar caixa, sangria e suprimento' },
  { id: 'os', label: 'Ordens de Serviço', description: 'Criar, finalizar e enviar OS' },
  { id: 'atendimentos', label: 'Agendamentos', description: 'Agenda e boxes' },
  { id: 'clientes', label: 'Clientes', description: 'Cadastro, veículos e lembretes' },
  { id: 'fiado', label: 'Pagar Depois', description: 'Contas a prazo dos clientes' },
  { id: 'estoque', label: 'Estoque', description: 'Peças e reposição' },
  { id: 'financeiro', label: 'Financeiro', description: 'Receitas, despesas e saldo' },
  { id: 'relatorios', label: 'Relatórios', description: 'Indicadores e faturamento' },
]

export const DEFAULT_EMPLOYEE_PERMISSIONS: TabType[] = [
  'inicio',
  'caixa',
  'os',
  'atendimentos',
  'clientes',
  'estoque',
]

// Logins do sistema
const SYSTEM_USERS: { username: string; password: string; role: UserRole; displayName: string }[] = [
  { username: 'Samilly Martins', password: 'Sami2026@', role: 'dono', displayName: 'Samilly Martins' },
  { username: 'Wr_mecanica', password: 'Wr2023@', role: 'funcionario', displayName: 'Funcionário WR' },
]

export const PAYMENT_DESCRIPTIONS: Record<PaymentMethod, string> = {
  pix: 'PAGO VIA PIX',
  dinheiro: 'PAGO EM DINHEIRO',
  cartao_debito: 'PAGO NO CARTÃO DE DÉBITO',
  cartao_credito: 'PAGO NO CARTÃO DE CRÉDITO',
  pagar_depois: 'FATURADO / A PRAZO (PAGAR DEPOIS)',
  boleto: 'BOLETO BANCÁRIO',
  pendente: 'A DEFINIR',
}

export const describePayment = (method?: PaymentMethod, installments?: number): string => {
  if (!method) return 'A DEFINIR'
  const base = PAYMENT_DESCRIPTIONS[method] || 'PAGO'
  if (method === 'cartao_credito') {
    const n = installments && installments > 1 ? installments : 1
    return n > 1 ? `${base} EM ${n}X` : `${base} À VISTA (1X)`
  }
  return base
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
  issueFiscalInvoice: (orderId: string, orderOverride?: ServiceOrder) => FiscalInvoice | null
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

  currentUserRole: UserRole | null
  currentUserName: string | null
  login: (username: string, password: string) => { success: boolean; role?: UserRole; message?: string }
  logout: () => void
  employeePermissions: TabType[]
  updateEmployeePermissions: (perms: TabType[]) => void
  canAccess: (tab: TabType) => boolean

  reminders: ClientReminder[]
  addReminder: (data: Omit<ClientReminder, 'id' | 'createdAt' | 'done'>) => void
  toggleReminderDone: (id: string) => void
  deleteReminder: (id: string) => void

  mechanics: string[]
  addMechanic: (name: string) => void
  deleteMechanic: (name: string) => void

  servicePresets: ServicePreset[]
  addServicePreset: (preset: Omit<ServicePreset, 'id'>) => ServicePreset
  updateServicePreset: (id: string, preset: Partial<ServicePreset>) => void
  deleteServicePreset: (id: string) => void

  activeShift: DailyCashShift | null
  shiftHistory: DailyCashShift[]
  openCashShift: (initialAmount: number, notes?: string) => void
  closeCashShift: (finalPhysicalCash: number, notes?: string) => void
  addCashMovement: (movement: Omit<CashMovement, 'id' | 'timestamp' | 'timeFormatted' | 'operator'>) => void

  finishOrder: (orderId: string, options: FinishOrderOptions) => void

  storageMetrics: StorageMetrics
  resetDataToDefault: () => void
  clearAllData: () => void
  loadDemoData: () => void
}

const STORAGE_KEYS = {
  clients: 'wr_clients_v7',
  vehicles: 'wr_vehicles_v7',
  stock: 'wr_stock_v7',
  orders: 'wr_orders_v7',
  financial: 'wr_financial_v7',
  appointments: 'wr_appointments_v7',
  deferred: 'wr_deferred_v7',
  fiscal: 'wr_fiscal_v7',
  theme: 'wr_theme',
  authRole: 'wr_auth_v2',
  employeePerms: 'wr_employee_perms_v1',
  reminders: 'wr_reminders_v7',
  mechanics: 'wr_mechanics_v1',
  servicePresets: 'wr_service_presets_v1',
  activeCashShift: 'wr_active_cash_shift_v7',
  cashShiftsHistory: 'wr_cash_shifts_v7',
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
    loadLocalSafe(STORAGE_KEYS.clients, [])
  )
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    loadLocalSafe(STORAGE_KEYS.vehicles, [])
  )
  const [stock, setStock] = useState<StockItem[]>(() =>
    loadLocalSafe(STORAGE_KEYS.stock, [])
  )
  const [orders, setOrders] = useState<ServiceOrder[]>(() =>
    loadLocalSafe(STORAGE_KEYS.orders, [])
  )
  const [financial, setFinancial] = useState<FinancialRecord[]>(() =>
    loadLocalSafe(STORAGE_KEYS.financial, [])
  )
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadLocalSafe(STORAGE_KEYS.appointments, [])
  )
  const [deferredPayments, setDeferredPayments] = useState<DeferredPayment[]>(() =>
    loadLocalSafe(STORAGE_KEYS.deferred, [])
  )
  const [fiscalSettings, setFiscalSettings] = useState<FiscalSettings>(() =>
    loadLocalSafe(STORAGE_KEYS.fiscal, DEFAULT_FISCAL_SETTINGS)
  )

  // Autenticação de Operadores (Dono: Samilly Martins / Funcionário: Wr_mecanica)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.authRole)
    if (!saved) return 'dono' // Fica autenticado por padrão para não ficar pedindo senha ao entrar
    try {
      const parsed = JSON.parse(saved)
      return parsed.role === 'dono' || parsed.role === 'funcionario' ? parsed.role : 'dono'
    } catch {
      return saved === 'dono' || saved === 'funcionario' ? (saved as UserRole) : 'dono'
    }
  })

  const [currentUserName, setCurrentUserName] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.authRole)
    if (!saved) return 'Samilly Martins'
    try {
      const parsed = JSON.parse(saved)
      return parsed.username || 'Samilly Martins'
    } catch {
      return saved === 'dono' ? 'Samilly Martins' : 'Wr_mecanica'
    }
  })

  // Permissões de Acesso dos Funcionários (configuradas pelo Dono)
  const [employeePermissions, setEmployeePermissions] = useState<TabType[]>(() =>
    loadLocalSafe(STORAGE_KEYS.employeePerms, DEFAULT_EMPLOYEE_PERMISSIONS)
  )

  // Lembretes de manutenção / troca de óleo de clientes
  const [reminders, setReminders] = useState<ClientReminder[]>(() =>
    loadLocalSafe(STORAGE_KEYS.reminders, [])
  )

  // Lista dinâmica de Mecânicos da Oficina
  const [mechanics, setMechanics] = useState<string[]>(() =>
    loadLocalSafe(STORAGE_KEYS.mechanics, [
      'Roberto Silva',
      'Carlos Eduardo',
      'Marcos Mecânico',
      'Lucas Ferreira',
    ])
  )

  // Predefinições dinâmicas de Serviços da Oficina
  const [servicePresets, setServicePresets] = useState<ServicePreset[]>(() =>
    loadLocalSafe(STORAGE_KEYS.servicePresets, INITIAL_SERVICE_PRESETS)
  )

  useEffect(() => {
    saveLocalDebounced(STORAGE_KEYS.servicePresets, servicePresets)
  }, [servicePresets])

  // Caixa Diário (Turno atual aberto e histórico)
  const [activeShift, setActiveShift] = useState<DailyCashShift | null>(() =>
    loadLocalSafe(STORAGE_KEYS.activeCashShift, null)
  )
  const [shiftHistory, setShiftHistory] = useState<DailyCashShift[]>(() =>
    loadLocalSafe(STORAGE_KEYS.cashShiftsHistory, [])
  )

  useEffect(() => {
    if (currentUserRole && currentUserName) {
      localStorage.setItem(
        STORAGE_KEYS.authRole,
        JSON.stringify({ role: currentUserRole, username: currentUserName })
      )
    } else {
      localStorage.removeItem(STORAGE_KEYS.authRole)
    }
  }, [currentUserRole, currentUserName])

  useEffect(() => {
    saveLocalDebounced(STORAGE_KEYS.employeePerms, employeePermissions)
  }, [employeePermissions])

  useEffect(() => {
    saveLocalDebounced(STORAGE_KEYS.reminders, reminders)
  }, [reminders])

  useEffect(() => {
    saveLocalDebounced(STORAGE_KEYS.mechanics, mechanics)
  }, [mechanics])

  useEffect(() => {
    saveLocalDebounced(STORAGE_KEYS.activeCashShift, activeShift)
  }, [activeShift])

  useEffect(() => {
    saveLocalDebounced(STORAGE_KEYS.cashShiftsHistory, shiftHistory)
  }, [shiftHistory])

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

  const login = useCallback(
    (usernameInput: string, passwordInput: string) => {
      const u = usernameInput.trim()
      const p = passwordInput.trim()

      const found = SYSTEM_USERS.find(
        user => user.username.toLowerCase() === u.toLowerCase() && user.password === p
      )

      if (found) {
        setCurrentUserRole(found.role)
        setCurrentUserName(found.username)
        showToast(
          `Bem-vindo(a), ${found.displayName}! Acesso como ${found.role === 'dono' ? 'Dono(a)' : 'Funcionário(a)'} liberado.`,
          'success'
        )
        return { success: true, role: found.role }
      }

      showToast('Usuário ou senha incorretos! Verifique suas credenciais.', 'warning')
      return { success: false, message: 'Credenciais inválidas' }
    },
    [showToast]
  )

  const logout = useCallback(() => {
    setCurrentUserRole(null)
    setCurrentUserName(null)
    localStorage.removeItem(STORAGE_KEYS.authRole)
    try {
      localStorage.removeItem('wr_saved_passwords_v1')
    } catch {}
    showToast('Sessão encerrada com segurança. Digite a senha para novo acesso.', 'info')
  }, [showToast])

  const updateEmployeePermissions = useCallback((perms: TabType[]) => {
    setEmployeePermissions(perms)
  }, [])

  const canAccess = useCallback(
    (tab: TabType): boolean => {
      if (currentUserRole === 'dono') return true
      if (tab === 'configuracoes') return false
      if (tab === 'inicio') return true
      return employeePermissions.includes(tab)
    },
    [currentUserRole, employeePermissions]
  )

  const addReminder = useCallback(
    (data: Omit<ClientReminder, 'id' | 'createdAt' | 'done'>) => {
      const newRem: ClientReminder = {
        ...data,
        id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toLocaleDateString('pt-BR'),
        done: false,
      }
      setReminders(prev => [newRem, ...prev])
      showToast('Lembrete salvo com sucesso!', 'success')
    },
    [showToast]
  )

  const toggleReminderDone = useCallback((id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, done: !r.done } : r))
    )
  }, [])

  const deleteReminder = useCallback(
    (id: string) => {
      setReminders(prev => prev.filter(r => r.id !== id))
      showToast('Lembrete excluído.', 'info')
    },
    [showToast]
  )

  const addMechanic = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setMechanics(prev => {
        if (prev.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
          showToast(`Mecânico "${trimmed}" já está cadastrado!`, 'warning')
          return prev
        }
        showToast(`Mecânico "${trimmed}" cadastrado com sucesso!`, 'success')
        return [...prev, trimmed]
      })
    },
    [showToast]
  )

  const deleteMechanic = useCallback(
    (name: string) => {
      setMechanics(prev => {
        if (prev.length <= 1) {
          showToast('A oficina deve ter pelo menos um mecânico cadastrado.', 'warning')
          return prev
        }
        showToast(`Mecânico "${name}" removido!`, 'info')
        return prev.filter(m => m !== name)
      })
    },
    [showToast]
  )

  const addServicePreset = useCallback(
    (preset: Omit<ServicePreset, 'id'>) => {
      const newPreset: ServicePreset = {
        id: `srv-${Date.now()}`,
        ...preset,
      }
      setServicePresets(prev => [newPreset, ...prev])
      showToast(`Predefinição "${newPreset.name}" adicionada com sucesso!`, 'success')
      return newPreset
    },
    [showToast]
  )

  const updateServicePreset = useCallback(
    (id: string, updated: Partial<ServicePreset>) => {
      setServicePresets(prev =>
        prev.map(p => (p.id === id ? { ...p, ...updated } : p))
      )
      showToast('Predefinição atualizada!', 'success')
    },
    [showToast]
  )

  const deleteServicePreset = useCallback(
    (id: string) => {
      setServicePresets(prev => prev.filter(p => p.id !== id))
      showToast('Predefinição removida.', 'info')
    },
    [showToast]
  )

  const openCashShift = useCallback(
    (initialAmount: number, notes?: string) => {
      if (activeShift) {
        showToast('Já existe um turno de caixa aberto!', 'warning')
        return
      }
      const newShift: DailyCashShift = {
        id: `shift-${Date.now()}`,
        date: new Date().toLocaleDateString('pt-BR'),
        openedAt: new Date().toISOString(),
        status: 'aberto',
        openedBy: currentUserRole || 'dono',
        initialAmount: Number(initialAmount) || 0,
        movements: [],
        notes,
      }
      setActiveShift(newShift)
      showToast(`Caixa diário aberto com sucesso! Fundo inicial: ${formatCurrency(newShift.initialAmount)}`, 'success')
    },
    [activeShift, currentUserRole, formatCurrency, showToast]
  )

  const addCashMovement = useCallback(
    (movement: Omit<CashMovement, 'id' | 'timestamp' | 'timeFormatted' | 'operator'>) => {
      if (!activeShift) {
        showToast('O caixa diário está fechado! Abra o caixa para registrar movimentações.', 'warning')
        return
      }
      const now = new Date()
      const newMovement: CashMovement = {
        ...movement,
        id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: now.toISOString(),
        timeFormatted: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        operator: currentUserRole || 'caixa',
      }
      setActiveShift(prev => {
        if (!prev) return null
        return {
          ...prev,
          movements: [newMovement, ...prev.movements],
        }
      })
      showToast(`Movimentação de ${formatCurrency(movement.amount)} registrada no caixa!`)
    },
    [activeShift, currentUserRole, formatCurrency, showToast]
  )

  const closeCashShift = useCallback(
    (finalPhysicalCash: number, notes?: string) => {
      if (!activeShift) {
        showToast('Não há caixa aberto para ser fechado.', 'warning')
        return
      }

      // Cálculo do dinheiro esperado em caixa: Fundo inicial + Entradas em dinheiro + Suprimentos - Sangrias - Despesas em dinheiro
      const cashInEntries = activeShift.movements
        .filter(m => (m.type === 'entrada_os' || m.type === 'suprimento') && m.paymentMethod === 'dinheiro')
        .reduce((sum, m) => sum + m.amount, 0)

      const cashOutExits = activeShift.movements
        .filter(m => (m.type === 'sangria' || m.type === 'despesa') && m.paymentMethod === 'dinheiro')
        .reduce((sum, m) => sum + m.amount, 0)

      const expectedCash = activeShift.initialAmount + cashInEntries - cashOutExits
      const difference = Number((finalPhysicalCash - expectedCash).toFixed(2))

      const closedShift: DailyCashShift = {
        ...activeShift,
        closedAt: new Date().toISOString(),
        status: 'fechado',
        closedBy: currentUserRole || 'dono',
        finalPhysicalCash,
        difference,
        notes: notes ? `${activeShift.notes ? activeShift.notes + ' | ' : ''}${notes}` : activeShift.notes,
      }

      setShiftHistory(prev => [closedShift, ...prev])
      setActiveShift(null)

      if (difference === 0) {
        showToast('Caixa fechado com sucesso! Conferência exata (100% batido).', 'success')
      } else if (difference > 0) {
        showToast(`Caixa fechado! Sobra de ${formatCurrency(difference)}.`, 'info')
      } else {
        showToast(`Caixa fechado com quebra/falta de ${formatCurrency(Math.abs(difference))}.`, 'warning')
      }
    },
    [activeShift, currentUserRole, formatCurrency, showToast]
  )

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

    // Se o valor total ou descrição da OS foram alterados, sincroniza com o registro financeiro vinculado
    if (updated.totalAmount !== undefined) {
      setFinancial(prev =>
        prev.map(f => {
          if (f.orderId === id) {
            const nextFin = {
              ...f,
              amount: updated.totalAmount!,
              description: updated.serviceDescription
                ? `${f.description.split(' - ')[0]} - ${updated.serviceDescription}`
                : f.description,
            }
            void upsertDeltaRow('financial_records', f.id, nextFin, {
              type: nextFin.type,
              status: nextFin.status,
            })
            return nextFin
          }
          return f
        })
      )
    }
  }, [])

  const issueFiscalInvoice = useCallback(
    (orderId: string, orderOverride?: ServiceOrder): FiscalInvoice | null => {
      const baseOrder = orderOverride || orders.find(o => o.id === orderId)
      if (!baseOrder) return null

      const targetOrder = baseOrder
      const currentYear = new Date().getFullYear()
      const invNum = fiscalSettings.nextInvoiceNumber
      const formattedInvNumber = `${currentYear}${String(invNum).padStart(7, '0')}`

      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      const rndSegment = () =>
        Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      const verificationCode = `PRTO-${rndSegment()}-${rndSegment()}`

      const ibgeCode = fiscalSettings.cityCodeIBGE || '1718204' // Porto Nacional - TO
      const now = new Date()
      const aamm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`
      const cleanCnpj = fiscalSettings.cnpj.replace(/\D/g, '').padEnd(14, '0').slice(0, 14)
      const serie = String(fiscalSettings.rpsSeries || '1').padStart(5, '0')
      const numDoc = String(invNum).padStart(9, '0')
      const rndSuffix = String(Math.floor(10000000 + Math.random() * 90000000))
      const baseKey = `${ibgeCode}${aamm}${cleanCnpj}00${serie}${numDoc}1${rndSuffix}`

      let sum = 0
      let weight = 2
      for (let i = baseKey.length - 1; i >= 0; i--) {
        sum += parseInt(baseKey[i], 10) * weight
        weight = weight === 9 ? 2 : weight + 1
      }
      const rem = sum % 11
      const dv = rem < 2 ? 0 : 11 - rem
      const accessKey = `${baseKey}${dv}`

      const laborAmount = targetOrder.laborTotal || 0
      const issValue = Number(((laborAmount * fiscalSettings.issRate) / 100).toFixed(2))

      const clientDoc = (targetOrder.clientCpfCnpj || '00000000000').replace(/\D/g, '')
      const isCnpj = clientDoc.length > 11
      const docTag = isCnpj ? `<Cnpj>${clientDoc}</Cnpj>` : `<Cpf>${clientDoc.padStart(11, '0')}</Cpf>`

      const paymentMethodDescription = describePayment(
        targetOrder.paymentMethod,
        targetOrder.paymentInstallments
      )

      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="2.04">
    <InfNfse Id="NFSE${formattedInvNumber}">
      <Numero>${formattedInvNumber}</Numero>
      <CodigoVerificacao>${verificationCode}</CodigoVerificacao>
      <DataEmissao>${new Date().toISOString()}</DataEmissao>
      <ChaveAcesso>${accessKey}</ChaveAcesso>
      <IdentificacaoRps>
        <Numero>${targetOrder.number.replace(/\D/g, '') || invNum}</Numero>
        <Serie>${fiscalSettings.rpsSeries || '1'}</Serie>
        <Tipo>1</Tipo>
      </IdentificacaoRps>
      <NaturezaOperacao>1</NaturezaOperacao>
      <RegimeEspecialTributacao>1</RegimeEspecialTributacao>
      <OptanteSimplesNacional>1</OptanteSimplesNacional>
      <PrestadorServico>
        <IdentificacaoPrestador>
          <CpfCnpj><Cnpj>${cleanCnpj}</Cnpj></CpfCnpj>
          <InscricaoMunicipal>${fiscalSettings.cityRegistration || '048.910-2'}</InscricaoMunicipal>
        </IdentificacaoPrestador>
        <RazaoSocial>${fiscalSettings.companyName}</RazaoSocial>
        <NomeFantasia>${fiscalSettings.tradeName}</NomeFantasia>
        <Endereco>
          <Endereco>${fiscalSettings.address || 'Rodovia TO-080, KM 12'}</Endereco>
          <Bairro>Luzimangues</Bairro>
          <CodigoMunicipio>${ibgeCode}</CodigoMunicipio>
          <Uf>TO</Uf>
          <Cep>77500000</Cep>
        </Endereco>
      </PrestadorServico>
      <TomadorServico>
        <IdentificacaoTomador>
          <CpfCnpj>${docTag}</CpfCnpj>
        </IdentificacaoTomador>
        <RazaoSocial>${targetOrder.clientName}</RazaoSocial>
      </TomadorServico>
      <Servico>
        <Valores>
          <ValorServicos>${laborAmount.toFixed(2)}</ValorServicos>
          <ValorPecas>${(targetOrder.partsTotal || 0).toFixed(2)}</ValorPecas>
          <BaseCalculo>${laborAmount.toFixed(2)}</BaseCalculo>
          <Aliquota>${(fiscalSettings.issRate / 100).toFixed(4)}</Aliquota>
          <ValorIss>${issValue.toFixed(2)}</ValorIss>
          <ValorLiquidoNfse>${laborAmount.toFixed(2)}</ValorLiquidoNfse>
        </Valores>
        <ItemListaServico>${fiscalSettings.serviceCode || '14.01'}</ItemListaServico>
        <CodigoCnae>${(fiscalSettings.cnae || '4520-0/01').replace(/\D/g, '')}</CodigoCnae>
        <CodigoTributacaoMunicipio>14.01.01</CodigoTributacaoMunicipio>
        <Discriminacao>${targetOrder.serviceDescription} | Veículo: ${targetOrder.vehicleModel} Placa: ${targetOrder.vehiclePlate} KM: ${targetOrder.mileage} | Condição: ${paymentMethodDescription}</Discriminacao>
        <CodigoMunicipio>${ibgeCode}</CodigoMunicipio>
        <MunicipioIncidencia>${ibgeCode}</MunicipioIncidencia>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`

      const newInvoice: FiscalInvoice = {
        invoiceNumber: formattedInvNumber,
        rpsNumber: String(targetOrder.number.replace(/\D/g, '') || invNum),
        rpsSeries: fiscalSettings.rpsSeries || '1',
        verificationCode,
        accessKey,
        issuedAt: new Date().toLocaleString('pt-BR'),
        protocolNumber: `3${ibgeCode}${currentYear}${String(invNum).padStart(6, '0')}${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'autorizada',
        serviceCode: fiscalSettings.serviceCode || '14.01',
        cnae: fiscalSettings.cnae || '4520-0/01',
        issRate: fiscalSettings.issRate,
        issValue,
        taxRegime: fiscalSettings.taxRegime === 'simples_nacional' ? 'Simples Nacional' : 'Lucro Presumido',
        danfseUrl: `https://www.nfse.gov.br/emissornacional/ConsultaPublica`,
        xmlData,
        district: 'Luzimangues',
        city: 'Porto Nacional',
        cityCodeIBGE: ibgeCode,
        paymentMethodDescription,
        discountValue: targetOrder.discount || 0,
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

      showToast(`NFS-e #${formattedInvNumber} autorizada com validade fiscal (Porto Nacional/Luzimangues)!`)
      return newInvoice
    },
    [orders, fiscalSettings, updateOrder, showToast]
  )

  const finishOrder = useCallback(
    (orderId: string, options: FinishOrderOptions) => {
      const order = orders.find(o => o.id === orderId)
      if (!order) return

      const { paymentMethod, installments, discount = 0, emitNfse, dueDate } = options
      const rawSubtotal = (order.partsTotal || 0) + (order.laborTotal || 0)
      const validDiscount = Math.min(Math.max(0, Number(discount) || 0), rawSubtotal)
      const finalTotal = Math.max(0, rawSubtotal - validDiscount)

      const paymentDesc = describePayment(paymentMethod, installments)

      const updatedOrder: Partial<ServiceOrder> = {
        status: 'pronto',
        paymentMethod,
        paymentInstallments: paymentMethod === 'cartao_credito' ? installments || 1 : undefined,
        discount: validDiscount > 0 ? validDiscount : undefined,
        totalAmount: finalTotal,
        paymentDueDate: paymentMethod === 'pagar_depois' ? dueDate : undefined,
        date: order.date || new Date().toLocaleDateString('pt-BR'),
      }

      updateOrder(orderId, updatedOrder)

      const mergedOrder: ServiceOrder = {
        ...order,
        ...updatedOrder,
      }

      // Registra no financeiro se não for a prazo
      if (paymentMethod !== 'pagar_depois') {
        const finRecord: FinancialRecord = {
          id: `fin-${Date.now()}`,
          type: 'receita',
          category: 'Serviços & Peças',
          description: `${order.number} (${paymentDesc}) - ${order.vehicleModel}${validDiscount > 0 ? ` (Desc: ${formatCurrency(validDiscount)})` : ''}`,
          amount: finalTotal,
          entityName: order.clientName,
          dueDate: new Date().toLocaleDateString('pt-BR'),
          paymentDate: new Date().toLocaleDateString('pt-BR'),
          status: 'pago',
          orderId: order.id,
        }
        setFinancial(prev => [finRecord, ...prev])
        void upsertDeltaRow('financial_records', finRecord.id, finRecord, {
          type: finRecord.type,
          status: finRecord.status,
        })
      }

      // Se houver turno de caixa aberto e não for a prazo, registra no caixa diário
      if (activeShift && paymentMethod !== 'pagar_depois') {
        addCashMovement({
          type: 'entrada_os',
          description: `Recebimento ${order.number} - ${order.clientName} (${paymentDesc})`,
          amount: finalTotal,
          paymentMethod,
          orderId: order.id,
          orderNumber: order.number,
        })
      }

      // Se for a prazo / fiado, cria na aba A Prazo
      if (paymentMethod === 'pagar_depois') {
        const defaultDue = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
        const deferred: DeferredPayment = {
          id: `def-${Date.now() + 1}`,
          clientId: order.clientId,
          clientName: order.clientName,
          clientPhone: order.clientPhone,
          vehicleInfo: `${order.vehicleModel} • ${order.vehiclePlate}`,
          orderId: order.id,
          orderNumber: order.number,
          description: `${order.number} - ${order.serviceDescription}`,
          totalAmount: finalTotal,
          paidAmount: 0,
          createdAt: new Date().toLocaleDateString('pt-BR'),
          dueDate: dueDate || order.paymentDueDate || defaultDue,
          payments: [],
          notes: order.observations
            ? `${order.observations}${validDiscount > 0 ? ` | Desconto: ${formatCurrency(validDiscount)}` : ''}`
            : validDiscount > 0
            ? `Desconto de ${formatCurrency(validDiscount)} aplicado.`
            : 'Finalizada com pagamento a prazo.',
        }
        setDeferredPayments(prev => [deferred, ...prev])
        void upsertDeltaRow('deferred_payments', deferred.id, deferred, {
          client_id: deferred.clientId,
          due_date: deferred.dueDate,
        })
      }

      // Emissão da Nota Fiscal se solicitada
      if (emitNfse) {
        setTimeout(() => {
          issueFiscalInvoice(orderId, mergedOrder)
        }, 120)
      }

      showToast(
        `${order.number} finalizada! Pagamento: ${paymentDesc}${validDiscount > 0 ? ` (Desconto: ${formatCurrency(validDiscount)})` : ''}`,
        'success'
      )
    },
    [orders, activeShift, updateOrder, addCashMovement, issueFiscalInvoice, formatCurrency, showToast]
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
      }, 0)
      const nextNumber = `OS #${maxNum > 0 ? maxNum + 1 : 1001}`
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

      sendAppNotification(`Nova ${nextNumber} Criada!`, {
        body: `${orderData.clientName} • ${orderData.vehicleModel} (${orderData.serviceDescription || 'Serviço em andamento'})`,
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
      const statusLabels: Record<ServiceOrder['status'], string> = {
        aguardando: 'Aguardando',
        andamento: 'Em Andamento',
        pronto: 'Concluído / Pronto',
        cancelado: 'Cancelado',
      }
      sendAppNotification('Status da OS Atualizado', {
        body: `Ordem alterada para: ${statusLabels[status] || status}`,
      })
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
      sendAppNotification('Novo Agendamento Marcado!', {
        body: `${created.clientName} - ${created.vehicleModel} em ${created.date} às ${created.time}`,
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

  const clearAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(k => {
      if (k !== STORAGE_KEYS.theme && k !== STORAGE_KEYS.authRole) localStorage.removeItem(k)
    })
    setClients([])
    setVehicles([])
    setStock([])
    setOrders([])
    setFinancial([])
    setAppointments([])
    setDeferredPayments([])
    setActiveShift(null)
    setShiftHistory([])
    setReminders([])
    setFiscalSettings(DEFAULT_FISCAL_SETTINGS)
    showToast('Sistema 100% zerado e limpo para operação real!', 'info')
  }, [showToast])

  const loadDemoData = useCallback(() => {
    setClients(DEMO_CLIENTS)
    setVehicles(DEMO_VEHICLES)
    setStock(DEMO_STOCK)
    setOrders(DEMO_ORDERS)
    setFinancial(DEMO_FINANCIAL)
    setAppointments(DEMO_APPOINTMENTS)
    setDeferredPayments(DEMO_DEFERRED_PAYMENTS)
    setFiscalSettings(DEFAULT_FISCAL_SETTINGS)
    showToast('Dados de exemplo carregados com sucesso!', 'success')
  }, [showToast])

  const resetDataToDefault = useCallback(() => {
    clearAllData()
  }, [clearAllData])

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
        currentUserRole,
        currentUserName,
        login,
        logout,
        employeePermissions,
        updateEmployeePermissions,
        canAccess,
        reminders,
        addReminder,
        toggleReminderDone,
        deleteReminder,
        mechanics,
        addMechanic,
        deleteMechanic,
        servicePresets,
        addServicePreset,
        updateServicePreset,
        deleteServicePreset,
        activeShift,
        shiftHistory,
        openCashShift,
        closeCashShift,
        addCashMovement,
        finishOrder,
        storageMetrics,
        resetDataToDefault,
        clearAllData,
        loadDemoData,
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
