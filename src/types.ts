export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  cpfCnpj?: string
  address?: string
  avatarUrl?: string
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
  photoUrl?: string
}

export type FuelStatus = 'reserva' | 'medio' | 'cheio'
export type TireCondition = 'bom' | 'regular' | 'ruim'

export interface TireChecklist {
  frontLeft: TireCondition
  frontRight: TireCondition
  rearLeft: TireCondition
  rearRight: TireCondition
}

// Checklist veicular de entrada (sem imagens, 100% estruturado e leve para o Supabase)
export interface VehicleInspectionChecklist {
  // Pertences e Ferramentas (boolean)
  spareTire: boolean        // Estepe
  jack: boolean             // Macaco
  wheelWrench: boolean      // Chave de roda
  triangle: boolean         // Triângulo de segurança
  vehicleDocuments: boolean // Documento do veículo no carro

  // Luzes e Elétrica
  headlights: 'ok' | 'defeito'      // Faróis principais
  taillights: 'ok' | 'defeito'      // Lanternas traseiras
  turnSignals: 'ok' | 'defeito'     // Setas / Pisca
  brakeLights: 'ok' | 'defeito'     // Luz de freio
  airConditioning: 'ok' | 'defeito' // Ar condicionado
  wipers: 'ok' | 'defeito'          // Limpador e palhetas

  // Níveis de Fluidos Rápidos
  oilLevel: 'normal' | 'baixo'      // Nível do óleo
  coolantLevel: 'normal' | 'baixo'  // Fluido arrefecimento
  brakeFluid: 'normal' | 'baixo'    // Fluido de freio

  // Avarias pré-existentes na lataria (tags leves de texto)
  bodyworkDamages: string[]
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

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'pendente'

export interface ServiceWarranty {
  days: number           // 90 dias conforme Art. 26 do Código de Defesa do Consumidor
  expirationDate: string // Data de validade da garantia
  coverage: string       // Termo de cobertura
  status: 'vigente' | 'expirada'
}

// Nota Fiscal de Serviços com Validade Jurídica / Fiscal (NFS-e Padrão Nacional / Municipal)
export interface FiscalInvoice {
  invoiceNumber?: string      // Número da NFS-e Autorizada (ex: 2026000104)
  rpsNumber?: string          // Número do RPS
  rpsSeries?: string          // Série do RPS
  verificationCode?: string   // Código de Autenticidade da Prefeitura (ex: A8B9-7C6D-E5F4)
  accessKey?: string          // Chave de Acesso Fiscal (50 dígitos)
  issuedAt?: string           // Data e Hora de Autorização pela Prefeitura/Sefaz
  protocolNumber?: string     // Protocolo de Autorização
  status: 'nao_emitida' | 'processando' | 'autorizada' | 'cancelada'
  serviceCode: string         // Código LC 116 (14.01 - Reparação de veículos)
  cnae: string                // 4520-0/01 - Manutenção mecânica de veículos
  issRate: number             // Alíquota ISS (ex: 2.50%)
  issValue: number            // Valor do ISS
  taxRegime: string           // Simples Nacional / Lucro Presumido
  xmlData?: string            // XML da NFS-e assinado
  danfseUrl?: string          // Link oficial de consulta
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
  paymentInstallments?: number
  warranty?: ServiceWarranty
  fiscalInvoice?: FiscalInvoice
  partsTotal: number
  laborTotal: number
  totalAmount: number
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
  ncm?: string       // NCM da peça para validade fiscal
  cfop?: string      // CFOP (ex: 5405 / 5102)
  status: 'OK' | 'Baixo'
  imageUrl?: string
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
}

export type AppointmentStatus = 'em_atendimento' | 'confirmado' | 'aguardando' | 'concluido'

export interface Appointment {
  id: string
  time: string
  date: string
  clientName: string
  clientPhone: string
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
  stateRegistration: string   // Inscrição Estadual (IE)
  cityRegistration: string    // Inscrição Municipal (IM)
  taxRegime: 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei'
  cnae: string                // 4520-0/01
  serviceCode: string         // 14.01
  issRate: number             // 2.50%
  environment: 'homologacao' | 'producao'
  certificateStatus: 'ativo' | 'pendente' | 'expirado'
  certificateName: string
  certificateExpiry: string
  nextInvoiceNumber: number
  nextRpsNumber: number
  rpsSeries: string
  cityCodeIBGE: string
}
