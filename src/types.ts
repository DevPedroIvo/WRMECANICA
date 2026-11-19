export type ThemeMode = 'dark' | 'light'

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  cpfCnpj?: string
  address?: string
  createdAt: string
  notes?: string
}

export interface Vehicle {
  id: string
  clientId: string
  clientName?: string
  brand: string
  model: string
  plate: string
  year: number
  color?: string
  currentMileage: number
  chassis?: string
  renavam?: string
  fuelType?: 'Flex' | 'Gasolina' | 'Etanol' | 'Diesel' | 'Híbrido' | 'Elétrico'
}

export type FuelStatus = 'reserva' | 'medio' | 'cheio'
export type TireCondition = 'bom' | 'regular' | 'ruim'
export type VisualItemStatus = 'ok' | 'avaria'

export interface TireChecklist {
  frontLeft: TireCondition
  frontRight: TireCondition
  rearLeft: TireCondition
  rearRight: TireCondition
}

// Checklist visual enxuto de entrada (faróis, pintura, pneus, vidros, etc. — ultra leve para o Supabase)
export interface VehicleInspectionChecklist {
  headlights: VisualItemStatus   // Faróis
  taillights: VisualItemStatus   // Lanternas e Setas
  paintwork: VisualItemStatus    // Pintura e Lataria
  glass: VisualItemStatus        // Vidros e Para-brisa
  mirrors: VisualItemStatus      // Retrovisores
  bumpers: VisualItemStatus      // Para-choques
  wipers: VisualItemStatus       // Palhetas / Limpadores
  wheelsSpare: VisualItemStatus  // Rodas e Estepe
  bodyworkDamages?: string       // Observação curta de riscos/amassados pré-existentes
}

export interface OrderItem {
  id: string
  serviceDescription: string
  partsCost: number
  laborCost: number
  total: number
  serviceCode?: string // Código de serviço municipal (ex: 14.01)
  cnae?: string        // CNAE (ex: 4520-0/01)
}

export type OrderStatus = 'aguardando' | 'andamento' | 'pronto' | 'cancelado'

export type PaymentMethod =
  | 'pix'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'dinheiro'
  | 'boleto'
  | 'pagar_depois'
  | 'pendente'

export interface ServiceWarranty {
  days: number           // 90 dias conforme Art. 26 do CDC
  expirationDate: string
  coverage: string
  status: 'vigente' | 'expirada'
}

// Nota Fiscal de Serviços (XML gerado sob demanda no cliente — zero peso extra no banco)
export interface FiscalInvoice {
  invoiceNumber?: string
  rpsNumber?: string
  rpsSeries?: string
  verificationCode?: string
  accessKey?: string
  issuedAt?: string
  protocolNumber?: string
  status: 'nao_emitida' | 'processando' | 'autorizada' | 'cancelada'
  serviceCode: string
  cnae: string
  issRate: number
  issValue: number
  taxRegime: string
  danfseUrl?: string
  xmlData?: string
  district?: string
  city?: string
  cityCodeIBGE?: string
  paymentMethodDescription?: string
}

export type UserRole = 'dono' | 'caixa'

export interface CashMovement {
  id: string
  timestamp: string
  timeFormatted: string
  type: 'entrada_os' | 'suprimento' | 'sangria' | 'despesa'
  description: string
  amount: number
  paymentMethod: PaymentMethod
  orderId?: string
  orderNumber?: string
  operator: UserRole
}

export interface DailyCashShift {
  id: string
  date: string
  openedAt: string
  closedAt?: string
  status: 'aberto' | 'fechado'
  openedBy: UserRole
  closedBy?: UserRole
  initialAmount: number
  movements: CashMovement[]
  finalPhysicalCash?: number
  difference?: number
  notes?: string
}

export interface ServiceOrder {
  id: string
  number: string
  clientId: string
  clientName: string
  clientPhone: string
  clientCpfCnpj?: string
  clientEmail?: string
  clientAddress?: string
  vehicleId?: string
  vehicleModel: string
  vehiclePlate: string
  mileage: number
  fuelLevel: FuelStatus
  tires?: TireChecklist
  inspection?: VehicleInspectionChecklist
  mechanicAssigned: string
  serviceDescription: string
  items: OrderItem[]
  observations: string
  date: string
  time?: string
  status: OrderStatus
  paymentMethod?: PaymentMethod
  paymentDueDate?: string // Data combinada caso paymentMethod === 'pagar_depois' (YYYY-MM-DD)
  paymentInstallments?: number
  warranty?: ServiceWarranty
  fiscalInvoice?: FiscalInvoice
  partsTotal: number
  laborTotal: number
  totalAmount: number
}

export interface DeferredPaymentEntry {
  id: string
  date: string // DD/MM/YYYY
  amount: number
  method: 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'transferencia'
  note?: string
}

export type DeferredStatus = 'em_aberto' | 'parcial' | 'atrasado' | 'quitado'

export interface DeferredPayment {
  id: string
  clientId: string
  clientName: string
  clientPhone: string
  vehicleInfo?: string
  orderId?: string
  orderNumber?: string
  description: string
  totalAmount: number
  paidAmount: number
  createdAt: string   // DD/MM/YYYY
  dueDate: string     // YYYY-MM-DD para cálculo preciso de vencimento/atraso
  payments: DeferredPaymentEntry[]
  notes?: string
}

export interface StockItem {
  id: string
  code: string
  name: string
  category: string
  quantity: number
  minQuantity: number
  costPrice: number
  sellingPrice: number
  ncm?: string
  cfop?: string
  status: 'OK' | 'Baixo'
}

export interface FinancialRecord {
  id: string
  type: 'receita' | 'despesa'
  category: string
  description: string
  amount: number
  entityName: string
  dueDate: string
  paymentDate?: string
  status: 'pendente' | 'pago'
  orderId?: string
  deferredId?: string
}

export type AppointmentStatus = 'em_atendimento' | 'confirmado' | 'aguardando' | 'concluido'

export interface Appointment {
  id: string
  time: string
  date: string
  clientId?: string
  clientName: string
  clientPhone: string
  vehicleId?: string
  vehicleModel: string
  vehiclePlate: string
  serviceDescription: string
  mechanicName: string
  box: string
  status: AppointmentStatus
  estimatedDuration: string
}

export interface FiscalSettings {
  companyName: string
  tradeName: string
  cnpj: string
  stateRegistration: string
  cityRegistration: string
  taxRegime: 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei'
  cnae: string
  serviceCode: string
  issRate: number
  environment: 'homologacao' | 'producao'
  certificateStatus: 'ativo' | 'pendente' | 'expirado'
  certificateName: string
  certificateExpiry: string
  nextInvoiceNumber: number
  nextRpsNumber: number
  rpsSeries: string
  cityCodeIBGE: string
  district?: string
  city?: string
  state?: string
  address?: string
  phone?: string
  cep?: string
  fiscalProvider?: 'emissor_nacional' | 'prefeitura_porto_nacional' | 'api_direta'
  apiToken?: string
  warrantyDaysLabor?: number
  warrantyDaysParts?: number
  warrantyTerms?: string
}
