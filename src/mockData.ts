import { Client, Vehicle, ServiceOrder, StockItem, FinancialRecord, Appointment, FiscalSettings } from './types'

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Marcos Oliveira',
    phone: '(63) 99234-5678',
    email: 'marcos.oliveira@email.com',
    cpfCnpj: '482.910.458-20',
    address: 'Av. Teotônio Segurado, 1200 - Plano Diretor Sul, Palmas/TO',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    createdAt: '12/01/2024',
    notes: 'Cliente preferencial da oficina. Sempre faz revisões preventivas.'
  },
  {
    id: 'cli-2',
    name: 'Ana Paula',
    phone: '(63) 98112-3456',
    email: 'ana.paula@email.com',
    cpfCnpj: '739.124.890-55',
    address: 'Quadra 104 Sul, Rua SE 05, Lote 14, Palmas/TO',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    createdAt: '05/03/2024',
    notes: 'Solicitou sempre ligar antes de trocar qualquer peça sobressalente.'
  },
  {
    id: 'cli-3',
    name: 'Carlos Mendes',
    phone: '(63) 99988-7766',
    email: 'carlos.mendes@email.com',
    cpfCnpj: '23.890.124/0001-88',
    address: 'Alameda dos Ipês, 45 - Graciosa, Palmas/TO',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    createdAt: '19/06/2024',
    notes: 'Frotista com 3 caminhonetes da empresa.'
  },
  {
    id: 'cli-4',
    name: 'Mariana Costa',
    phone: '(63) 98455-1234',
    email: 'mariana.costa@email.com',
    cpfCnpj: '621.439.810-72',
    address: 'Rua 15 de Novembro, 210, Palmas/TO',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    createdAt: '10/08/2024'
  }
]

export const INITIAL_VEHICLES: Vehicle[] = [
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
    chassis: '93HFC1670NZ109482',
    renavam: '01293847561'
  },
  {
    id: 'veh-2',
    clientId: 'cli-2',
    clientName: 'Ana Paula',
    brand: 'Toyota',
    model: 'Corolla Altis Hybrid',
    plate: 'BRA2E19',
    year: 2023,
    color: 'Prata Lunar',
    currentMileage: 31200,
    fuelType: 'Híbrido',
    chassis: '9BRBD48E3P0281940',
    renavam: '01394857201'
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
    chassis: '988652391M9104820',
    renavam: '01129384019'
  }
]

export const INITIAL_STOCK: StockItem[] = [
  {
    id: 'stk-1',
    code: 'FL-1001',
    name: 'Filtro de Óleo Motor',
    category: 'Filtros',
    quantity: 40,
    minQuantity: 15,
    costPrice: 22.00,
    sellingPrice: 48.00,
    ncm: '8421.23.00',
    cfop: '5405',
    status: 'OK'
  },
  {
    id: 'stk-2',
    code: 'PB-002',
    name: 'Pastilha de Freio Dianteira',
    category: 'Freios',
    quantity: 32,
    minQuantity: 10,
    costPrice: 85.00,
    sellingPrice: 185.00,
    ncm: '8708.30.90',
    cfop: '5405',
    status: 'Baixo'
  },
  {
    id: 'stk-3',
    code: 'OL-003',
    name: 'Óleo 5W30 Sintético (1L)',
    category: 'Lubrificantes',
    quantity: 25,
    minQuantity: 20,
    costPrice: 28.00,
    sellingPrice: 58.00,
    ncm: '2710.19.32',
    cfop: '5405',
    status: 'OK'
  },
  {
    id: 'stk-4',
    code: 'BT-004',
    name: 'Bateria Automotiva 60Ah Selada',
    category: 'Elétrica',
    quantity: 8,
    minQuantity: 12,
    costPrice: 285.00,
    sellingPrice: 470.00,
    ncm: '8507.10.10',
    cfop: '5405',
    status: 'Baixo'
  },
  {
    id: 'stk-5',
    code: 'AM-005',
    name: 'Amortecedor Dianteiro Par',
    category: 'Suspensão',
    quantity: 14,
    minQuantity: 10,
    costPrice: 410.00,
    sellingPrice: 720.00,
    ncm: '8708.80.00',
    cfop: '5405',
    status: 'OK'
  },
  {
    id: 'stk-6',
    code: 'VL-006',
    name: 'Jogo de Velas Iridium (4 un)',
    category: 'Ignição',
    quantity: 18,
    minQuantity: 10,
    costPrice: 120.00,
    sellingPrice: 240.00,
    ncm: '8511.10.00',
    cfop: '5405',
    status: 'OK'
  }
]

export const INITIAL_ORDERS: ServiceOrder[] = [
  {
    id: 'os-1',
    number: 'OS #1024',
    clientId: 'cli-1',
    clientName: 'Marcos Oliveira',
    clientPhone: '(63) 99234-5678',
    clientCpfCnpj: '482.910.458-20',
    clientAddress: 'Av. Teotônio Segurado, 1200 - Palmas/TO',
    vehicleId: 'veh-1',
    vehicleModel: 'Honda Civic Touring 1.5 Turbo',
    vehiclePlate: 'QWE1A23',
    mileage: 48500,
    fuelLevel: 'medio',
    tires: {
      frontLeft: 'bom',
      frontRight: 'bom',
      rearLeft: 'regular',
      rearRight: 'regular'
    },
    inspection: {
      spareTire: true,
      jack: true,
      wheelWrench: true,
      triangle: true,
      vehicleDocuments: true,
      headlights: 'ok',
      taillights: 'ok',
      turnSignals: 'ok',
      brakeLights: 'ok',
      airConditioning: 'ok',
      wipers: 'ok',
      oilLevel: 'normal',
      coolantLevel: 'normal',
      brakeFluid: 'baixo',
      bodyworkDamages: ['Pequeno risco para-choque diant. dir.']
    },
    mechanicAssigned: 'Roberto Silva',
    serviceDescription: 'Troca de pastilhas de freio e sangria completa do sistema hidráulico',
    items: [
      { id: 'it-1', serviceDescription: 'Troca de pastilhas de freio dianteiras', partsCost: 185.00, laborCost: 150.00, total: 335.00, serviceCode: '14.01', cnae: '4520-0/01' },
      { id: 'it-2', serviceDescription: 'Sangria de fluido DOT 4 e alinhamento 3D', partsCost: 90.00, laborCost: 120.00, total: 210.00, serviceCode: '14.01', cnae: '4520-0/01' }
    ],
    observations: 'Cliente relatou ruído metálico ao acionar freios em descidas.',
    date: '15/11/2025',
    time: '09:00',
    status: 'andamento',
    paymentMethod: 'pix',
    partsTotal: 275.00,
    laborTotal: 270.00,
    totalAmount: 545.00,
    warranty: {
      days: 90,
      expirationDate: '13/02/2026',
      coverage: 'Garantia total para o sistema de freios e mão de obra de reparação mecânica.',
      status: 'vigente'
    },
    fiscalInvoice: {
      invoiceNumber: '20250001024',
      rpsNumber: '1024',
      rpsSeries: '1',
      verificationCode: 'W8R9-2B7A-44C1',
      accessKey: '17251134892124000190550010000010241094827104',
      issuedAt: '15/11/2025 10:14:22',
      protocolNumber: '317250091823491',
      status: 'autorizada',
      serviceCode: '14.01',
      cnae: '4520-0/01',
      issRate: 2.50,
      issValue: 6.75,
      taxRegime: 'Simples Nacional - Alíquota 2.5%',
      danfseUrl: 'https://nfe.palmas.to.gov.br/consulta?code=W8R9-2B7A-44C1'
    }
  },
  {
    id: 'os-2',
    number: 'OS #0987',
    clientId: 'cli-1',
    clientName: 'Marcos Oliveira',
    clientPhone: '(63) 99234-5678',
    clientCpfCnpj: '482.910.458-20',
    vehicleId: 'veh-1',
    vehicleModel: 'Honda Civic Touring 1.5 Turbo',
    vehiclePlate: 'QWE1A23',
    mileage: 40000,
    fuelLevel: 'cheio',
    tires: {
      frontLeft: 'bom',
      frontRight: 'bom',
      rearLeft: 'bom',
      rearRight: 'bom'
    },
    inspection: {
      spareTire: true,
      jack: true,
      wheelWrench: true,
      triangle: true,
      vehicleDocuments: true,
      headlights: 'ok',
      taillights: 'ok',
      turnSignals: 'ok',
      brakeLights: 'ok',
      airConditioning: 'ok',
      wipers: 'ok',
      oilLevel: 'normal',
      coolantLevel: 'normal',
      brakeFluid: 'normal',
      bodyworkDamages: []
    },
    mechanicAssigned: 'Carlos Eduardo',
    serviceDescription: 'Revisão Preventiva de 40.000 KM com troca de filtros e óleo',
    items: [
      { id: 'it-3', serviceDescription: 'Troca de óleo motor 5W30 e filtro', partsCost: 280.00, laborCost: 120.00, total: 400.00, serviceCode: '14.01', cnae: '4520-0/01' },
      { id: 'it-4', serviceDescription: 'Higienização de ar e filtro de cabine', partsCost: 80.00, laborCost: 120.00, total: 200.00, serviceCode: '14.01', cnae: '4520-0/01' }
    ],
    observations: 'Revisão periódica preventiva realizada com sucesso.',
    date: '02/10/2025',
    time: '14:30',
    status: 'pronto',
    paymentMethod: 'pix',
    partsTotal: 360.00,
    laborTotal: 240.00,
    totalAmount: 600.00,
    warranty: {
      days: 90,
      expirationDate: '31/12/2025',
      coverage: 'Garantia de 90 dias conforme CDC para revisão preventiva e peças aplicadas.',
      status: 'vigente'
    },
    fiscalInvoice: {
      invoiceNumber: '20250000987',
      rpsNumber: '987',
      rpsSeries: '1',
      verificationCode: 'J3K9-8L1P-90B2',
      accessKey: '17251034892124000190550010000009871092817290',
      issuedAt: '02/10/2025 16:45:10',
      protocolNumber: '317250081290341',
      status: 'autorizada',
      serviceCode: '14.01',
      cnae: '4520-0/01',
      issRate: 2.50,
      issValue: 6.00,
      taxRegime: 'Simples Nacional - Alíquota 2.5%',
      danfseUrl: 'https://nfe.palmas.to.gov.br/consulta?code=J3K9-8L1P-90B2'
    }
  },
  {
    id: 'os-3',
    number: 'OS #1025',
    clientId: 'cli-2',
    clientName: 'Ana Paula',
    clientPhone: '(63) 98112-3456',
    clientCpfCnpj: '739.124.890-55',
    vehicleId: 'veh-2',
    vehicleModel: 'Toyota Corolla Altis Hybrid',
    vehiclePlate: 'BRA2E19',
    mileage: 31200,
    fuelLevel: 'medio',
    tires: {
      frontLeft: 'bom',
      frontRight: 'bom',
      rearLeft: 'bom',
      rearRight: 'regular'
    },
    inspection: {
      spareTire: true,
      jack: true,
      wheelWrench: true,
      triangle: true,
      vehicleDocuments: true,
      headlights: 'ok',
      taillights: 'ok',
      turnSignals: 'ok',
      brakeLights: 'ok',
      airConditioning: 'defeito',
      wipers: 'ok',
      oilLevel: 'normal',
      coolantLevel: 'normal',
      brakeFluid: 'normal',
      bodyworkDamages: ['Leve raspado porta traseira esquerda']
    },
    mechanicAssigned: 'Roberto Silva',
    serviceDescription: 'Higienização e revisão de ar condicionado',
    items: [
      { id: 'it-5', serviceDescription: 'Higienização e troca de filtro de cabine', partsCost: 75.00, laborCost: 100.00, total: 175.00, serviceCode: '14.01', cnae: '4520-0/01' },
      { id: 'it-6', serviceDescription: 'Troca de óleo sintético e filtro de combustível', partsCost: 260.00, laborCost: 105.00, total: 365.00, serviceCode: '14.01', cnae: '4520-0/01' }
    ],
    observations: 'Cliente retirará o carro até as 18h.',
    date: '15/11/2025',
    time: '10:30',
    status: 'aguardando',
    paymentMethod: 'cartao_credito',
    paymentInstallments: 3,
    partsTotal: 335.00,
    laborTotal: 205.00,
    totalAmount: 540.00,
    warranty: {
      days: 90,
      expirationDate: '13/02/2026',
      coverage: 'Garantia legal de 90 dias.',
      status: 'vigente'
    },
    fiscalInvoice: {
      status: 'nao_emitida',
      serviceCode: '14.01',
      cnae: '4520-0/01',
      issRate: 2.50,
      issValue: 5.12,
      taxRegime: 'Simples Nacional'
    }
  },
  {
    id: 'os-4',
    number: 'OS #1026',
    clientId: 'cli-3',
    clientName: 'Carlos Mendes',
    clientPhone: '(63) 99988-7766',
    clientCpfCnpj: '23.890.124/0001-88',
    vehicleId: 'veh-3',
    vehicleModel: 'Jeep Compass Turbodiesel',
    vehiclePlate: 'JEP4F99',
    mileage: 68900,
    fuelLevel: 'reserva',
    tires: {
      frontLeft: 'regular',
      frontRight: 'regular',
      rearLeft: 'ruim',
      rearRight: 'ruim'
    },
    inspection: {
      spareTire: true,
      jack: true,
      wheelWrench: true,
      triangle: true,
      vehicleDocuments: true,
      headlights: 'ok',
      taillights: 'ok',
      turnSignals: 'ok',
      brakeLights: 'ok',
      airConditioning: 'ok',
      wipers: 'defeito',
      oilLevel: 'normal',
      coolantLevel: 'normal',
      brakeFluid: 'normal',
      bodyworkDamages: ['Para-choque traseiro com marcas de engate']
    },
    mechanicAssigned: 'Marcos Mecânico',
    serviceDescription: 'Diagnóstico computadorizado de injeção e suspensão dianteira',
    items: [
      { id: 'it-7', serviceDescription: 'Diagnóstico por scanner e teste de bicos', partsCost: 0.00, laborCost: 250.00, total: 250.00, serviceCode: '14.01', cnae: '4520-0/01' }
    ],
    observations: 'Luz da injeção acesa no painel ao acelerar em subidas.',
    date: '15/11/2025',
    time: '14:00',
    status: 'aguardando',
    paymentMethod: 'pendente',
    partsTotal: 0.00,
    laborTotal: 250.00,
    totalAmount: 250.00,
    fiscalInvoice: {
      status: 'nao_emitida',
      serviceCode: '14.01',
      cnae: '4520-0/01',
      issRate: 2.50,
      issValue: 6.25,
      taxRegime: 'Simples Nacional'
    }
  }
]

export const DEFAULT_FISCAL_SETTINGS: FiscalSettings = {
  companyName: 'WR MECÂNICA E AUTOPEÇAS LTDA',
  tradeName: 'WR Mecânica & Cia',
  cnpj: '34.892.124/0001-90',
  stateRegistration: '29.481.092-4',
  cityRegistration: '184.920-1',
  taxRegime: 'simples_nacional',
  cnae: '4520-0/01',
  serviceCode: '14.01',
  issRate: 2.50,
  environment: 'producao',
  certificateStatus: 'ativo',
  certificateName: 'CERTIFICADO DIGITAL A1 ICP-BRASIL (WR MECÂNICA)',
  certificateExpiry: '15/10/2027',
  nextInvoiceNumber: 1027,
  nextRpsNumber: 1027,
  rpsSeries: '1',
  cityCodeIBGE: '1721000' // Palmas / TO
}

export const INITIAL_FINANCIAL: FinancialRecord[] = [
  {
    id: 'fin-1',
    type: 'receita',
    category: 'Serviços & Peças',
    description: 'Serviço OS #1024 - Honda Civic (NFS-e 20250001024)',
    amount: 545.00,
    entityName: 'Marcos Oliveira',
    dueDate: '15/11/2025',
    status: 'pendente'
  },
  {
    id: 'fin-2',
    type: 'despesa',
    category: 'Peças & Fornecedor',
    description: 'Compra de Lote Pastilhas e Filtros',
    amount: 1230.00,
    entityName: 'Auto Peças Distribuidora',
    dueDate: '20/11/2025',
    status: 'pendente'
  },
  {
    id: 'fin-3',
    type: 'receita',
    category: 'Serviços & Peças',
    description: 'OS #0987 - Quitação em Pix (NFS-e 20250000987)',
    amount: 600.00,
    entityName: 'Marcos Oliveira',
    dueDate: '02/10/2025',
    paymentDate: '02/10/2025',
    status: 'pago'
  },
  {
    id: 'fin-4',
    type: 'receita',
    category: 'Faturamento Acumulado',
    description: 'Recebimentos do Mês Concluídos',
    amount: 17350.00,
    entityName: 'Vários Clientes',
    dueDate: '01/11/2025',
    paymentDate: '10/11/2025',
    status: 'pago'
  },
  {
    id: 'fin-5',
    type: 'despesa',
    category: 'Custos Operacionais',
    description: 'Aluguel do Galpão & Energia Elétrica',
    amount: 9200.00,
    entityName: 'Galpão Mecânica WR',
    dueDate: '05/11/2025',
    paymentDate: '05/11/2025',
    status: 'pago'
  }
]

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    time: '09:00',
    date: '15/11/2025',
    clientName: 'Marcos Oliveira',
    clientPhone: '(63) 99234-5678',
    vehicleModel: 'Honda Civic Touring 1.5 Turbo',
    vehiclePlate: 'QWE1A23',
    serviceDescription: 'Troca de pastilhas de freio e sangria',
    mechanicName: 'Roberto Silva',
    box: 'Box 01 (Elevador)',
    status: 'em_atendimento',
    estimatedDuration: '1h 30m'
  },
  {
    id: 'apt-2',
    time: '10:30',
    date: '15/11/2025',
    clientName: 'Ana Paula',
    clientPhone: '(63) 98112-3456',
    vehicleModel: 'Toyota Corolla Altis Hybrid',
    vehiclePlate: 'BRA2E19',
    serviceDescription: 'Higienização de ar e troca de óleo',
    mechanicName: 'Carlos Eduardo',
    box: 'Box 02 (Rampa)',
    status: 'confirmado',
    estimatedDuration: '1h'
  },
  {
    id: 'apt-3',
    time: '14:00',
    date: '15/11/2025',
    clientName: 'Carlos Mendes',
    clientPhone: '(63) 99988-7766',
    vehicleModel: 'Jeep Compass Turbodiesel',
    vehiclePlate: 'JEP4F99',
    serviceDescription: 'Diagnóstico eletrônico de injeção',
    mechanicName: 'Marcos Mecânico',
    box: 'Box 03 (Diagnóstico)',
    status: 'confirmado',
    estimatedDuration: '2h'
  }
]
