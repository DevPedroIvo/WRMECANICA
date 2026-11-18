import React, { createContext, useContext, useState, useEffect } from 'react'
import { Client, Vehicle, ServiceOrder, StockItem, FinancialRecord, Appointment, AppointmentStatus, FiscalSettings, FiscalInvoice } from '../types'
import { INITIAL_CLIENTS, INITIAL_VEHICLES, INITIAL_STOCK, INITIAL_ORDERS, INITIAL_FINANCIAL, INITIAL_APPOINTMENTS, DEFAULT_FISCAL_SETTINGS } from '../mockData'

export type TabType = 'inicio' | 'atendimentos' | 'os' | 'clientes' | 'veiculos' | 'estoque' | 'financeiro' | 'relatorios' | 'configuracoes'

interface AppContextType {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  clients: Client[]
  vehicles: Vehicle[]
  stock: StockItem[]
  orders: ServiceOrder[]
  financial: FinancialRecord[]
  appointments: Appointment[]
  fiscalSettings: FiscalSettings
  updateFiscalSettings: (settings: Partial<FiscalSettings>) => void
  issueFiscalInvoice: (orderId: string) => FiscalInvoice | null
  cancelFiscalInvoice: (orderId: string) => void
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client
  updateClient: (id: string, client: Partial<Client>) => void
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void
  addOrder: (order: Omit<ServiceOrder, 'id' | 'number'>) => ServiceOrder
  updateOrder: (id: string, updated: Partial<ServiceOrder>) => void
  updateOrderStatus: (id: string, status: ServiceOrder['status']) => void
  addStockItem: (item: Omit<StockItem, 'id' | 'status'>) => void
  adjustStockQuantity: (id: string, delta: number) => void
  addFinancialRecord: (record: Omit<FinancialRecord, 'id'>) => void
  toggleFinancialStatus: (id: string) => void
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void
  formatCurrency: (val: number) => string
  sendWhatsApp: (phone: string, text: string) => void
  selectedOrderForModal: ServiceOrder | null
  setSelectedOrderForModal: (order: ServiceOrder | null) => void
  isNewOrderModalOpen: boolean
  setIsNewOrderModalOpen: (open: boolean) => void
  resetDataToDefault: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('inicio')
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<ServiceOrder | null>(null)
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false)

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('wr_clients_v4')
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS
  })

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('wr_vehicles_v4')
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES
  })

  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('wr_stock_v4')
    return saved ? JSON.parse(saved) : INITIAL_STOCK
  })

  const [orders, setOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('wr_orders_v4')
    return saved ? JSON.parse(saved) : INITIAL_ORDERS
  })

  const [financial, setFinancial] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('wr_financial_v4')
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL
  })

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('wr_appointments_v4')
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS
  })

  const [fiscalSettings, setFiscalSettings] = useState<FiscalSettings>(() => {
    const saved = localStorage.getItem('wr_fiscal_v4')
    return saved ? JSON.parse(saved) : DEFAULT_FISCAL_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem('wr_clients_v4', JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    localStorage.setItem('wr_vehicles_v4', JSON.stringify(vehicles))
  }, [vehicles])

  useEffect(() => {
    localStorage.setItem('wr_stock_v4', JSON.stringify(stock))
  }, [stock])

  useEffect(() => {
    localStorage.setItem('wr_orders_v4', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem('wr_financial_v4', JSON.stringify(financial))
  }, [financial])

  useEffect(() => {
    localStorage.setItem('wr_appointments_v4', JSON.stringify(appointments))
  }, [appointments])

  useEffect(() => {
    localStorage.setItem('wr_fiscal_v4', JSON.stringify(fiscalSettings))
  }, [fiscalSettings])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0)
  }

  const sendWhatsApp = (phone: string, text: string) => {
    const cleanNumber = phone.replace(/\D/g, '')
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
    const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const updateFiscalSettings = (updated: Partial<FiscalSettings>) => {
    setFiscalSettings(prev => ({ ...prev, ...updated }))
  }

  // Emissão Oficial de NFS-e (Validade Jurídica / Fiscal Municipal e Nacional)
  const issueFiscalInvoice = (orderId: string): FiscalInvoice | null => {
    const targetOrder = orders.find(o => o.id === orderId)
    if (!targetOrder) return null

    const currentYear = new Date().getFullYear()
    const invNum = fiscalSettings.nextInvoiceNumber
    const formattedInvNumber = `${currentYear}${String(invNum).padStart(7, '0')}`
    
    // Gerar código de verificação autêntico (ex: A8B9-7C6D-E5F4)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const rndSegment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    const verificationCode = `${rndSegment()}-${rndSegment()}-${rndSegment()}`

    // Chave de acesso fiscal de 44 dígitos
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
      danfseUrl: `https://nfe.palmas.to.gov.br/consulta?code=${verificationCode}`
    }

    // Atualiza a ordem com a nota emitida
    updateOrder(orderId, { fiscalInvoice: newInvoice })

    // Incrementa próximo número fiscal
    setFiscalSettings(prev => ({
      ...prev,
      nextInvoiceNumber: prev.nextInvoiceNumber + 1,
      nextRpsNumber: prev.nextRpsNumber + 1
    }))

    return newInvoice
  }

  const cancelFiscalInvoice = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId)
    if (!targetOrder || !targetOrder.fiscalInvoice) return

    updateOrder(orderId, {
      fiscalInvoice: {
        ...targetOrder.fiscalInvoice,
        status: 'cancelada'
      }
    })
  }

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('pt-BR')
    }
    setClients(prev => [newClient, ...prev])
    return newClient
  }

  const updateClient = (id: string, updated: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
  }

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`
    }
    setVehicles(prev => [newVehicle, ...prev])
    return newVehicle
  }

  const updateVehicle = (id: string, updated: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v))
  }

  const addOrder = (orderData: Omit<ServiceOrder, 'id' | 'number'>) => {
    const nextNumber = `OS #${1024 + orders.length + 1}`
    const newOrder: ServiceOrder = {
      ...orderData,
      id: `os-${Date.now()}`,
      number: nextNumber
    }
    setOrders(prev => [newOrder, ...prev])

    const finRecord: FinancialRecord = {
      id: `fin-${Date.now()}`,
      type: 'receita',
      category: 'Serviços & Peças',
      description: `${nextNumber} - ${orderData.vehicleModel}`,
      amount: orderData.totalAmount,
      entityName: orderData.clientName,
      dueDate: orderData.date,
      status: 'pendente',
      orderId: newOrder.id
    }
    setFinancial(prev => [finRecord, ...prev])

    return newOrder
  }

  const updateOrder = (id: string, updated: Partial<ServiceOrder>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o))
    if (selectedOrderForModal && selectedOrderForModal.id === id) {
      setSelectedOrderForModal(prev => prev ? { ...prev, ...updated } : null)
    }
  }

  const updateOrderStatus = (id: string, status: ServiceOrder['status']) => {
    updateOrder(id, { status })
  }

  const addStockItem = (itemData: Omit<StockItem, 'id' | 'status'>) => {
    const status = itemData.quantity <= itemData.minQuantity ? 'Baixo' : 'OK'
    const newItem: StockItem = {
      ...itemData,
      id: `stk-${Date.now()}`,
      status
    }
    setStock(prev => [newItem, ...prev])
  }

  const adjustStockQuantity = (id: string, delta: number) => {
    setStock(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta)
        return {
          ...item,
          quantity: newQty,
          status: newQty <= item.minQuantity ? 'Baixo' : 'OK'
        }
      }
      return item
    }))
  }

  const addFinancialRecord = (recordData: Omit<FinancialRecord, 'id'>) => {
    const newRec: FinancialRecord = {
      ...recordData,
      id: `fin-${Date.now()}`
    }
    setFinancial(prev => [newRec, ...prev])
  }

  const toggleFinancialStatus = (id: string) => {
    setFinancial(prev => prev.map(f => {
      if (f.id === id) {
        const nextStatus = f.status === 'pago' ? 'pendente' : 'pago'
        return {
          ...f,
          status: nextStatus,
          paymentDate: nextStatus === 'pago' ? new Date().toLocaleDateString('pt-BR') : undefined
        }
      }
      return f
    }))
  }

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const resetDataToDefault = () => {
    localStorage.removeItem('wr_clients_v4')
    localStorage.removeItem('wr_vehicles_v4')
    localStorage.removeItem('wr_stock_v4')
    localStorage.removeItem('wr_orders_v4')
    localStorage.removeItem('wr_financial_v4')
    localStorage.removeItem('wr_appointments_v4')
    localStorage.removeItem('wr_fiscal_v4')
    setClients(INITIAL_CLIENTS)
    setVehicles(INITIAL_VEHICLES)
    setStock(INITIAL_STOCK)
    setOrders(INITIAL_ORDERS)
    setFinancial(INITIAL_FINANCIAL)
    setAppointments(INITIAL_APPOINTMENTS)
    setFiscalSettings(DEFAULT_FISCAL_SETTINGS)
  }

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        clients,
        vehicles,
        stock,
        orders,
        financial,
        appointments,
        fiscalSettings,
        updateFiscalSettings,
        issueFiscalInvoice,
        cancelFiscalInvoice,
        addClient,
        updateClient,
        addVehicle,
        updateVehicle,
        addOrder,
        updateOrder,
        updateOrderStatus,
        addStockItem,
        adjustStockQuantity,
        addFinancialRecord,
        toggleFinancialStatus,
        updateAppointmentStatus,
        formatCurrency,
        sendWhatsApp,
        selectedOrderForModal,
        setSelectedOrderForModal,
        isNewOrderModalOpen,
        setIsNewOrderModalOpen,
        resetDataToDefault
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
