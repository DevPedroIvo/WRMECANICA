import {
  Client,
  Vehicle,
  ServiceOrder,
  StockItem,
  FinancialRecord,
  Appointment,
  FiscalSettings,
  DeferredPayment,
} from './types'

// ============================================================================
// DADOS OPERACIONAIS INICIAIS DA OFICINA (ZERADOS PARA USO REAL)
// ============================================================================
export const INITIAL_CLIENTS: Client[] = []
export const INITIAL_VEHICLES: Vehicle[] = []
export const INITIAL_STOCK: StockItem[] = []
export const INITIAL_ORDERS: ServiceOrder[] = []
export const INITIAL_FINANCIAL: FinancialRecord[] = []
export const INITIAL_APPOINTMENTS: Appointment[] = []
export const INITIAL_DEFERRED_PAYMENTS: DeferredPayment[] = []

// Parâmetros fiscais reais e oficiais: Luzimangues, Distrito de Porto Nacional - TO
// Código IBGE de Porto Nacional/TO: 1718204
export const DEFAULT_FISCAL_SETTINGS: FiscalSettings = {
  companyName: 'WR MECÂNICA E AUTOPEÇAS LTDA',
  tradeName: 'WR Mecânica & Cia',
  cnpj: '34.892.124/0001-90',
  stateRegistration: '29.481.092-4',
  cityRegistration: '048.910-2',
  taxRegime: 'simples_nacional',
  cnae: '4520-0/01', // Manutenção e reparação mecânica de veículos automotores
  serviceCode: '14.01', // LC 116/2003 - Lubrificação, limpeza, revisão, manutenção e consertos
  issRate: 2.5, // Alíquota ISS municipal Porto Nacional / Simples Nacional
  environment: 'producao',
  certificateStatus: 'ativo',
  certificateName: 'CERTIFICADO DIGITAL A1 (WR MECÂNICA - PORTO NACIONAL/TO)',
  certificateExpiry: '15/10/2027',
  nextInvoiceNumber: 1,
  nextRpsNumber: 1,
  rpsSeries: '1',
  cityCodeIBGE: '1718204',
  district: 'Luzimangues',
  city: 'Porto Nacional',
  state: 'TO',
  address: 'Rodovia TO-080, KM 12 - Distrito de Luzimangues, Porto Nacional - TO',
  cep: '77500-000',
  phone: '(63) 99234-5678',
  fiscalProvider: 'emissor_nacional',
}

// ============================================================================
// DADOS DE DEMONSTRAÇÃO (OPCIONAIS — DISPONÍVEIS VIA BOTÃO EM CONFIGURAÇÕES)
// ============================================================================
export const DEMO_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Marcos Oliveira',
    phone: '(63) 99234-5678',
    email: 'marcos.oliveira@email.com',
    cpfCnpj: '482.910.458-20',
    address: 'Av. Orla Oeste, Qd. 14, Luzimangues - Porto Nacional/TO',
    createdAt: '12/01/2026',
    notes: 'Cliente de Luzimangues. Sempre faz revisões preventivas.',
  },
  {
    id: 'cli-2',
    name: 'Ana Paula Ferreira',
    phone: '(63) 98112-3456',
    email: 'ana.paula@email.com',
    cpfCnpj: '739.124.890-55',
    address: 'Rodovia TO-080, KM 10, Luzimangues - Porto Nacional/TO',
    createdAt: '05/03/2026',
    notes: 'Solicitou sempre avisar antes de trocar qualquer peça sobressalente.',
  },
  {
    id: 'cli-3',
    name: 'Carlos Mendes',
    phone: '(63) 99988-7766',
    email: 'carlos.mendes@email.com',
    cpfCnpj: '23.890.124/0001-88',
    address: 'Setor Industrial, Porto Nacional/TO',
    createdAt: '19/06/2026',
    notes: 'Frotista com veículos da empresa. Costuma acertar na quinzena.',
  },
]

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    clientId: 'cli-1',
    clientName: 'Marcos Oliveira',
    brand: 'Honda',
    model: 'Civic Touring 1.5 Turbo',
    plate: 'QWE1A23',
    year: 2022,
    color: 'Preto Cristal',
    currentMileage: 48500,
    fuelType: 'Gasolina',
  },
  {
    id: 'veh-2',
    clientId: 'cli-2',
    clientName: 'Ana Paula Ferreira',
    brand: 'Toyota',
    model: 'Corolla Altis Hybrid',
    plate: 'BRA2E19',
    year: 2023,
    color: 'Prata Lunar',
    currentMileage: 31200,
    fuelType: 'Híbrido',
  },
  {
    id: 'veh-3',
    clientId: 'cli-3',
    clientName: 'Carlos Mendes',
    brand: 'Jeep',
    model: 'Compass Longitude 2.0 Turbodiesel',
    plate: 'JEP4F99',
    year: 2021,
    color: 'Branco Polar',
    currentMileage: 68900,
    fuelType: 'Diesel',
  },
]

export const DEMO_STOCK: StockItem[] = [
  {
    id: 'stk-1',
    code: 'FL-1001',
    name: 'Filtro de Óleo Motor',
    category: 'Filtros',
    quantity: 40,
    minQuantity: 15,
    costPrice: 22.0,
    sellingPrice: 48.0,
    ncm: '8421.23.00',
    cfop: '5405',
    status: 'OK',
  },
  {
    id: 'stk-2',
    code: 'PB-002',
    name: 'Pastilha de Freio Dianteira',
    category: 'Freios',
    quantity: 32,
    minQuantity: 10,
    costPrice: 85.0,
    sellingPrice: 185.0,
    ncm: '8708.30.90',
    cfop: '5405',
    status: 'Baixo',
  },
  {
    id: 'stk-3',
    code: 'OL-003',
    name: 'Óleo Sintético 5W30 (1 Litro)',
    category: 'Lubrificantes',
    quantity: 25,
    minQuantity: 12,
    costPrice: 35.0,
    sellingPrice: 70.0,
    ncm: '2710.19.32',
    cfop: '5405',
    status: 'OK',
  },
]

export const DEMO_ORDERS: ServiceOrder[] = [
  {
    id: 'os-1',
    number: 'OS #1024',
    clientId: 'cli-1',
    clientName: 'Marcos Oliveira',
    clientPhone: '(63) 99234-5678',
    clientCpfCnpj: '482.910.458-20',
    clientAddress: 'Luzimangues, Porto Nacional/TO',
    vehicleId: 'veh-1',
    vehicleModel: 'Honda Civic Touring 1.5 Turbo',
    vehiclePlate: 'QWE1A23',
    mileage: 48500,
    fuelLevel: 'medio',
    tires: {
      frontLeft: 'bom',
      frontRight: 'bom',
      rearLeft: 'regular',
      rearRight: 'regular',
    },
    inspection: {
      headlights: 'ok',
      taillights: 'ok',
      paintwork: 'ok',
      glass: 'ok',
      mirrors: 'ok',
      bumpers: 'avaria',
      wipers: 'ok',
      wheelsSpare: 'ok',
      bodyworkDamages: 'Pequeno risco para-choque diant. dir.',
    },
    mechanicAssigned: 'Roberto Silva',
    serviceDescription: 'Substituição pastilhas dianteiras e sangria de fluido de freio',
    items: [
      {
        id: 'it-1',
        serviceDescription: 'Troca de pastilhas de freio dianteiras',
        partsCost: 185.0,
        laborCost: 150.0,
        total: 335.0,
        serviceCode: '14.01',
        cnae: '4520-0/01',
      },
      {
        id: 'it-2',
        serviceDescription: 'Sangria de fluido DOT 4 e alinhamento 3D',
        partsCost: 90.0,
        laborCost: 120.0,
        total: 210.0,
        serviceCode: '14.01',
        cnae: '4520-0/01',
      },
    ],
    observations: 'Cliente retirará o veículo no final da tarde.',
    date: '18/11/2026',
    time: '09:00',
    status: 'andamento',
    paymentMethod: 'pendente',
    partsTotal: 275.0,
    laborTotal: 270.0,
    totalAmount: 545.0,
    warranty: {
      days: 90,
      expirationDate: '16/02/2027',
      coverage: '90 dias conforme Art. 26 do CDC para mão de obra mecânica e garantia do fabricante.',
      status: 'vigente',
    },
    fiscalInvoice: {
      invoiceNumber: '20260000001',
      rpsNumber: '1024',
      rpsSeries: '1',
      verificationCode: 'PRTO-8B7A-44C1',
      accessKey: '17182042611348921240001900000001000000001183920145',
      issuedAt: '18/11/2026 10:15:00',
      protocolNumber: '3171820420260000019482',
      status: 'autorizada',
      serviceCode: '14.01',
      cnae: '4520-0/01',
      issRate: 2.5,
      issValue: 6.75,
      taxRegime: 'Simples Nacional - Porto Nacional/TO',
      cityCodeIBGE: '1718204',
      district: 'Luzimangues',
      city: 'Porto Nacional',
      danfseUrl: 'https://portonacional.to.gov.br/nfse/consulta?codigo=PRTO-8B7A-44C1',
    },
  },
]

export const DEMO_FINANCIAL: FinancialRecord[] = [
  {
    id: 'fin-1',
    type: 'receita',
    category: 'Serviços & Peças',
    description: 'Serviço OS #1024 - Honda Civic (NFS-e 20260000001)',
    amount: 545.0,
    entityName: 'Marcos Oliveira',
    dueDate: '25/11/2026',
    status: 'pendente',
  },
]

export const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    time: '09:00',
    date: '19/11/2026',
    clientId: 'cli-1',
    clientName: 'Marcos Oliveira',
    clientPhone: '(63) 99234-5678',
    vehicleId: 'veh-1',
    vehicleModel: 'Honda Civic Touring 1.5 Turbo',
    vehiclePlate: 'QWE1A23',
    serviceDescription: 'Troca de pastilhas de freio e sangria',
    mechanicName: 'Roberto Silva',
    box: 'Box 01 (Elevador)',
    status: 'em_atendimento',
    estimatedDuration: '1h 30m',
  },
]

export const DEMO_DEFERRED_PAYMENTS: DeferredPayment[] = []
