import { ServiceOrder } from '../types'

export interface WorkshopInfo {
  name: string
  cnpj: string
  phone: string
  address: string
  slogan: string
  warranty: string
}

export const DEFAULT_WORKSHOP_INFO: WorkshopInfo = {
  name: 'WR MECÂNICA & CIA',
  cnpj: '34.892.124/0001-90',
  phone: '(63) 99234-5678',
  address: 'Av. Teotônio Segurado, 1200 - Palmas/TO',
  slogan: 'Oficina Especializada & Centro Automotivo',
  warranty: '90 dias de garantia para serviços e garantia do fabricante para peças.'
}

export function generateOsCanvas(order: ServiceOrder, info: WorkshopInfo = DEFAULT_WORKSHOP_INFO): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    // Height calculation considering items and fiscal stamp
    const width = 850
    const itemsCount = Math.max(order.items?.length || 1, 2)
    const hasFiscal = order.fiscalInvoice?.status === 'autorizada'
    const height = 1000 + (itemsCount * 36) + (hasFiscal ? 60 : 0)
    
    canvas.width = width
    canvas.height = height

    // Background: deep automotive black
    ctx.fillStyle = '#0a0b0e'
    ctx.fillRect(0, 0, width, height)

    // Outer subtle border
    ctx.strokeStyle = '#262626'
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, width - 20, height - 20)

    // Top gold accent line
    const goldGrad = ctx.createLinearGradient(30, 20, width - 30, 20)
    goldGrad.addColorStop(0, '#E5A51B')
    goldGrad.addColorStop(0.5, '#FF8500')
    goldGrad.addColorStop(1, '#E5A51B')
    ctx.strokeStyle = goldGrad
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(30, 22)
    ctx.lineTo(width - 30, 22)
    ctx.stroke()

    // Header Background
    ctx.fillStyle = '#12141a'
    ctx.fillRect(20, 26, width - 40, 130)

    // Logo Monogram "WR"
    ctx.font = 'bold 44px sans-serif'
    ctx.fillStyle = '#E5A51B'
    ctx.fillText('WR', 45, 85)

    // Workshop Title & Slogan
    ctx.font = 'bold 24px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(info.name, 125, 68)

    ctx.font = '13px sans-serif'
    ctx.fillStyle = '#FF8500'
    ctx.fillText(info.slogan, 125, 90)

    // CNPJ & Address & Phone
    ctx.font = '11px sans-serif'
    ctx.fillStyle = '#A5A5A5'
    ctx.fillText(`CNPJ: ${info.cnpj}  •  WhatsApp: ${info.phone}`, 125, 112)
    ctx.fillText(info.address, 125, 130)

    // OS Number & Status Box on top right
    ctx.fillStyle = '#1b1d24'
    ctx.fillRect(width - 240, 42, 200, 95)
    ctx.strokeStyle = '#353945'
    ctx.lineWidth = 1
    ctx.strokeRect(width - 240, 42, 200, 95)

    ctx.font = 'bold 20px monospace'
    ctx.fillStyle = '#FF8500'
    ctx.textAlign = 'right'
    ctx.fillText(order.number, width - 55, 75)

    ctx.font = '11px sans-serif'
    ctx.fillStyle = '#A5A5A5'
    ctx.fillText(`Data: ${order.date}`, width - 55, 96)

    const statusText = order.status === 'pronto' ? 'PRONTO / CONCLUÍDO' : order.status === 'andamento' ? 'EM ANDAMENTO' : 'AGUARDANDO'
    ctx.fillStyle = order.status === 'pronto' ? '#10B981' : order.status === 'andamento' ? '#FF8500' : '#E5A51B'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(statusText, width - 55, 120)
    ctx.textAlign = 'left'

    let y = 180

    // Client & Vehicle Info Card
    ctx.fillStyle = '#151720'
    ctx.fillRect(30, y, width - 60, 100)
    ctx.strokeStyle = '#262626'
    ctx.strokeRect(30, y, width - 60, 100)

    // Client side
    ctx.font = 'bold 10px sans-serif'
    ctx.fillStyle = '#FF8500'
    ctx.fillText('DADOS DO CLIENTE', 50, y + 25)

    ctx.font = 'bold 16px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(order.clientName, 50, y + 50)

    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#A5A5A5'
    ctx.fillText(`Telefone: ${order.clientPhone}`, 50, y + 74)

    // Vehicle side
    const vX = width / 2 + 20
    ctx.font = 'bold 10px sans-serif'
    ctx.fillStyle = '#FF8500'
    ctx.fillText('DADOS DO VEÍCULO', vX, y + 25)

    ctx.font = 'bold 16px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(order.vehicleModel, vX, y + 50)

    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#A5A5A5'
    ctx.fillText(`Placa: ${order.vehiclePlate}   •   KM: ${Number(order.mileage).toLocaleString('pt-BR')} km`, vX, y + 74)

    y += 120

    // Checklist strip (Fuel, Tires, Mechanic)
    ctx.fillStyle = '#1b1d24'
    ctx.fillRect(30, y, width - 60, 48)
    ctx.strokeStyle = '#262626'
    ctx.strokeRect(30, y, width - 60, 48)

    ctx.font = '11px sans-serif'
    ctx.fillStyle = '#A5A5A5'
    ctx.fillText('Nível Combustível:', 50, y + 28)
    ctx.fillStyle = '#FF8500'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(order.fuelLevel.toUpperCase(), 160, y + 28)

    ctx.fillStyle = '#A5A5A5'
    ctx.font = '11px sans-serif'
    ctx.fillText('Mecânico:', 300, y + 28)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(order.mechanicAssigned || 'Roberto Silva', 365, y + 28)

    ctx.fillStyle = '#A5A5A5'
    ctx.font = '11px sans-serif'
    ctx.fillText('Estado dos Pneus:', 580, y + 28)
    ctx.fillStyle = '#10B981'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText('VERIFICADOS ✓', 695, y + 28)

    y += 70

    // Service Description Banner
    ctx.fillStyle = '#151720'
    ctx.fillRect(30, y, width - 60, 52)
    ctx.font = 'bold 10px sans-serif'
    ctx.fillStyle = '#A5A5A5'
    ctx.fillText('SERVIÇO PRINCIPAL A REALIZAR:', 50, y + 20)
    ctx.font = 'bold 13px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(order.serviceDescription, 50, y + 40)

    y += 75

    // Table Header
    ctx.fillStyle = '#20232d'
    ctx.fillRect(30, y, width - 60, 36)
    ctx.font = 'bold 11px sans-serif'
    ctx.fillStyle = '#A5A5A5'
    ctx.fillText('DETALHAMENTO DE SERVIÇOS & PEÇAS', 50, y + 22)
    ctx.textAlign = 'right'
    ctx.fillText('PEÇAS', width - 290, y + 22)
    ctx.fillText('MÃO DE OBRA', width - 160, y + 22)
    ctx.fillText('SUBTOTAL', width - 50, y + 22)
    ctx.textAlign = 'left'

    y += 36

    // Items rows
    const items = order.items && order.items.length > 0 ? order.items : [
      { id: '1', serviceDescription: order.serviceDescription, partsCost: order.partsTotal, laborCost: order.laborTotal, total: order.totalAmount }
    ]

    items.forEach((it, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#12141a' : '#151821'
      ctx.fillRect(30, y, width - 60, 36)
      ctx.strokeStyle = '#1e212b'
      ctx.strokeRect(30, y, width - 60, 36)

      ctx.font = '12px sans-serif'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(it.serviceDescription, 50, y + 22)

      ctx.textAlign = 'right'
      ctx.font = '12px monospace'
      ctx.fillStyle = '#A5A5A5'
      ctx.fillText(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.partsCost), width - 290, y + 22)
      ctx.fillText(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.laborCost), width - 160, y + 22)

      ctx.font = 'bold 12px monospace'
      ctx.fillStyle = '#10B981'
      ctx.fillText(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.total), width - 50, y + 22)
      ctx.textAlign = 'left'

      y += 36
    })

    // Totals Box
    y += 15
    ctx.fillStyle = '#1b1d24'
    ctx.fillRect(30, y, width - 60, 80)
    ctx.strokeStyle = '#FF8500'
    ctx.lineWidth = 1.5
    ctx.strokeRect(30, y, width - 60, 80)

    ctx.font = '11px sans-serif'
    ctx.fillStyle = '#A5A5A5'
    ctx.fillText(`Peças: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.partsTotal || 0)}`, 50, y + 32)
    ctx.fillText(`Mão de Obra: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.laborTotal || 0)}`, 50, y + 56)

    ctx.textAlign = 'right'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillStyle = '#FF8500'
    ctx.fillText('VALOR TOTAL DA OS:', width - 50, y + 32)

    ctx.font = 'bold 28px monospace'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount), width - 50, y + 64)
    ctx.textAlign = 'left'

    y += 95

    // Fiscal Stamp (if authorized)
    if (order.fiscalInvoice && order.fiscalInvoice.status === 'autorizada') {
      ctx.fillStyle = '#0d2217'
      ctx.fillRect(30, y, width - 60, 52)
      ctx.strokeStyle = '#10B981'
      ctx.lineWidth = 1.5
      ctx.strokeRect(30, y, width - 60, 52)

      ctx.fillStyle = '#10B981'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(`✓ DOCUMENTO FISCAL MUNICIPAL EMITIDO — NFS-e Nº ${order.fiscalInvoice.invoiceNumber}`, 45, y + 22)

      ctx.font = '10px monospace'
      ctx.fillStyle = '#A5A5A5'
      ctx.fillText(`Cód. Autenticidade: ${order.fiscalInvoice.verificationCode}  •  Protocolo: ${order.fiscalInvoice.protocolNumber || 'AUTORIZADO'}  •  LC 116: 14.01`, 45, y + 40)
      
      ctx.textAlign = 'right'
      ctx.font = 'bold 10px sans-serif'
      ctx.fillStyle = '#10B981'
      ctx.fillText('VALIDADE FISCAL NACIONAL', width - 45, y + 32)
      ctx.textAlign = 'left'

      y += 62
    }

    // Warranty & Observations
    ctx.fillStyle = '#12141a'
    ctx.fillRect(30, y, width - 60, 60)
    ctx.strokeStyle = '#262626'
    ctx.strokeRect(30, y, width - 60, 60)

    ctx.font = '10px sans-serif'
    ctx.fillStyle = '#A5A5A5'
    ctx.fillText(`Observações: ${order.observations || 'Nenhuma observação informada.'}`, 50, y + 22)
    ctx.fillText(`Garantia: ${order.warranty ? `${order.warranty.days} dias de garantia legal (Art. 26 CDC) - ${order.warranty.coverage}` : info.warranty}`, 50, y + 42)

    y += 85

    // Signatures
    ctx.strokeStyle = '#353945'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(80, y)
    ctx.lineTo(340, y)
    ctx.moveTo(width - 340, y)
    ctx.lineTo(width - 80, y)
    ctx.stroke()

    ctx.font = '11px sans-serif'
    ctx.fillStyle = '#A5A5A5'
    ctx.textAlign = 'center'
    ctx.fillText('Assinatura do Cliente', 210, y + 20)
    ctx.fillText(info.name, width - 210, y + 20)

    resolve(canvas)
  })
}
