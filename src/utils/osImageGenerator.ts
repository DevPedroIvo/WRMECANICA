import { ServiceOrder } from '../types'
import { loadWrLogoImage } from './wrLogoSvg'

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
  address: 'Rodovia TO-080, KM 12 - Luzimangues, Porto Nacional/TO',
  slogan: 'Oficina Especializada & Centro Automotivo',
  warranty: '90 dias de garantia para serviços e garantia do fabricante para peças.',
}

export async function generateOsCanvas(
  order: ServiceOrder,
  info: WorkshopInfo = DEFAULT_WORKSHOP_INFO
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const width = 850
  const itemsCount = Math.max(order.items?.length || 1, 2)
  const hasFiscal = order.fiscalInvoice?.status === 'autorizada'
  const hasDiscount = (order.discount || 0) > 0
  const effectivePaid =
    order.paidAmount !== undefined
      ? order.paidAmount
      : order.status === 'pago'
      ? order.totalAmount || 0
      : 0
  const effectiveRemaining = Math.max(0, Number(((order.totalAmount || 0) - effectivePaid).toFixed(2)))
  const hasPartialBalance =
    (effectivePaid > 0 && effectiveRemaining > 0.01) ||
    order.status === 'parcial' ||
    (order.paymentMethod === 'pagar_depois' && effectiveRemaining > 0.01)
  const height =
    940 +
    itemsCount * 38 +
    (hasFiscal ? 64 : 0) +
    (hasDiscount ? 26 : 0) +
    (hasPartialBalance ? 46 : 0)

  canvas.width = width
  canvas.height = height

  // Fundo Branco Limpo de Alto Contraste (Muito melhor legibilidade no WhatsApp)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)

  // Borda externa elegante
  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 3
  ctx.strokeRect(12, 12, width - 24, height - 24)

  // Faixa superior Laranja WR Oficial
  const topGrad = ctx.createLinearGradient(30, 16, width - 30, 16)
  topGrad.addColorStop(0, '#EA580C')
  topGrad.addColorStop(0.5, '#F97316')
  topGrad.addColorStop(1, '#EA580C')
  ctx.strokeStyle = topGrad
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(30, 18)
  ctx.lineTo(width - 30, 18)
  ctx.stroke()

  // Header Box em tom suave (fundo claro)
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(24, 26, width - 48, 130)
  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 1
  ctx.strokeRect(24, 26, width - 48, 130)

  // Desenha a logo oficial vetorizada WR
  try {
    const logoImg = await loadWrLogoImage({ variant: 'light', showSubtitle: true })
    if (logoImg) {
      // Ajusta proporção da logo (proporção aprox 320x124)
      ctx.drawImage(logoImg, 38, 38, 175, 68)
    } else {
      ctx.font = 'bold 36px sans-serif'
      ctx.fillStyle = '#F97316'
      ctx.fillText('WR', 42, 85)
    }
  } catch {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillStyle = '#F97316'
    ctx.fillText('WR', 42, 85)
  }

  // Dados da Oficina
  ctx.font = 'bold 20px sans-serif'
  ctx.fillStyle = '#0F172A'
  ctx.fillText(info.name, 230, 62)

  ctx.font = 'bold 12px sans-serif'
  ctx.fillStyle = '#EA580C'
  ctx.fillText(info.slogan, 230, 82)

  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#64748B'
  ctx.fillText(`CNPJ: ${info.cnpj}  •  WhatsApp: ${info.phone}`, 230, 104)
  ctx.fillText(info.address, 230, 122)

  // Box da OS & Data no canto direito superior
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(width - 235, 38, 195, 96)
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 1.5
  ctx.strokeRect(width - 235, 38, 195, 96)

  ctx.font = 'bold 19px monospace'
  ctx.fillStyle = '#EA580C'
  ctx.textAlign = 'right'
  ctx.fillText(order.number, width - 55, 68)

  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#475569'
  ctx.fillText(`Data: ${order.date}`, width - 55, 90)

  const statusText =
    order.status === 'pago'
      ? 'PAGO / CONCLUÍDO'
      : order.status === 'parcial'
      ? 'PAGO PARCIAL (SALDO)'
      : order.status === 'pronto'
      ? 'PRONTO P/ RETIRADA'
      : order.status === 'andamento'
      ? 'EM ANDAMENTO'
      : 'ORÇAMENTO / AGUARDANDO'
  ctx.fillStyle =
    order.status === 'pago' || order.status === 'pronto'
      ? '#16A34A'
      : order.status === 'parcial'
      ? '#D97706'
      : order.status === 'andamento'
      ? '#EA580C'
      : '#F97316'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText(statusText, width - 55, 114)
  ctx.textAlign = 'left'

  let y = 175

  // Box: Dados do Cliente & Veículo
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(30, y, width - 60, 96)
  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 1
  ctx.strokeRect(30, y, width - 60, 96)

  // Lado do Cliente
  ctx.font = 'bold 10px sans-serif'
  ctx.fillStyle = '#EA580C'
  ctx.fillText('DADOS DO CLIENTE', 48, y + 24)

  ctx.font = 'bold 15px sans-serif'
  ctx.fillStyle = '#0F172A'
  ctx.fillText(order.clientName, 48, y + 48)

  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#475569'
  ctx.fillText(`WhatsApp: ${order.clientPhone}`, 48, y + 72)

  // Lado do Veículo
  const vX = width / 2 + 15
  ctx.font = 'bold 10px sans-serif'
  ctx.fillStyle = '#EA580C'
  ctx.fillText('DADOS DO VEÍCULO', vX, y + 24)

  ctx.font = 'bold 15px sans-serif'
  ctx.fillStyle = '#0F172A'
  ctx.fillText(order.vehicleModel, vX, y + 48)

  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#475569'
  ctx.fillText(
    `Placa: ${order.vehiclePlate}   •   KM: ${Number(order.mileage).toLocaleString('pt-BR')} km`,
    vX,
    y + 72
  )

  y += 114

  // Faixa de Vistoria de Entrada (Pneus, Combustível, Faróis)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(30, y, width - 60, 44)
  ctx.strokeStyle = '#E2E8F0'
  ctx.strokeRect(30, y, width - 60, 44)

  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#64748B'
  ctx.fillText('Nível Combustível:', 48, y + 27)
  ctx.fillStyle = '#EA580C'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText((order.fuelLevel || 'médio').toUpperCase(), 160, y + 27)

  ctx.fillStyle = '#64748B'
  ctx.font = '11px sans-serif'
  ctx.fillText('Mecânico:', 290, y + 27)
  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText(order.mechanicAssigned || 'Roberto Silva', 355, y + 27)

  ctx.fillStyle = '#64748B'
  ctx.font = '11px sans-serif'
  ctx.fillText('Vistoria:', 515, y + 27)
  const visualIssues = order.inspection
    ? [
        order.inspection.headlights === 'avaria' ? 'Faróis' : '',
        order.inspection.paintwork === 'avaria' ? 'Pintura' : '',
        order.inspection.glass === 'avaria' ? 'Vidros' : '',
        order.inspection.bumpers === 'avaria' ? 'Para-choques' : '',
      ].filter(Boolean)
    : []
  ctx.fillStyle = visualIssues.length === 0 ? '#16A34A' : '#EA580C'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText(
    visualIssues.length === 0 ? 'FARÓIS, PINTURA E PNEUS OK ✓' : `OBS: ${visualIssues.join(', ')}`,
    570,
    y + 27
  )

  y += 58

  // Faixa Descrição do Serviço
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(30, y, width - 60, 48)
  ctx.strokeStyle = '#E2E8F0'
  ctx.strokeRect(30, y, width - 60, 48)
  ctx.font = 'bold 10px sans-serif'
  ctx.fillStyle = '#64748B'
  ctx.fillText('SERVIÇO DISCRIMINADO:', 48, y + 18)
  ctx.font = 'bold 13px sans-serif'
  ctx.fillStyle = '#0F172A'
  ctx.fillText(order.serviceDescription, 48, y + 37)

  y += 62

  // Cabeçalho da Tabela
  ctx.fillStyle = '#F1F5F9'
  ctx.fillRect(30, y, width - 60, 36)
  ctx.strokeStyle = '#CBD5E1'
  ctx.strokeRect(30, y, width - 60, 36)
  ctx.font = 'bold 11px sans-serif'
  ctx.fillStyle = '#334155'
  ctx.fillText('DESCRIÇÃO DO SERVIÇO / PEÇA', 48, y + 22)
  ctx.textAlign = 'right'
  ctx.fillText('PEÇAS', width - 290, y + 22)
  ctx.fillText('MÃO DE OBRA', width - 160, y + 22)
  ctx.fillText('SUBTOTAL', width - 48, y + 22)
  ctx.textAlign = 'left'

  y += 36

  // Linhas de Itens
  const items =
    order.items && order.items.length > 0
      ? order.items
      : [
          {
            id: '1',
            serviceDescription: order.serviceDescription,
            partsCost: order.partsTotal,
            laborCost: order.laborTotal,
            total: order.totalAmount,
          },
        ]

  items.forEach((it, idx) => {
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
    ctx.fillRect(30, y, width - 60, 38)
    ctx.strokeStyle = '#E2E8F0'
    ctx.strokeRect(30, y, width - 60, 38)

    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#0F172A'
    ctx.fillText(it.serviceDescription, 48, y + 23)

    ctx.textAlign = 'right'
    ctx.font = '12px monospace'
    ctx.fillStyle = '#475569'
    ctx.fillText(
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.partsCost),
      width - 290,
      y + 23
    )
    ctx.fillText(
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.laborCost),
      width - 160,
      y + 23
    )

    ctx.font = 'bold 12px monospace'
    ctx.fillStyle = '#0F172A'
    ctx.fillText(
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.total),
      width - 48,
      y + 23
    )
    ctx.textAlign = 'left'

    y += 38
  })

  // Box de Totais & Forma de Pagamento
  y += 14
  const boxHeight = (hasDiscount ? 98 : 82) + (hasPartialBalance ? 44 : 0)
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(30, y, width - 60, boxHeight)
  ctx.strokeStyle = '#EA580C'
  ctx.lineWidth = 1.5
  ctx.strokeRect(30, y, width - 60, boxHeight)

  const fmtBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#475569'
  ctx.fillText(`Peças: ${fmtBRL(order.partsTotal || 0)}`, 48, y + 28)
  ctx.fillText(`Mão de Obra: ${fmtBRL(order.laborTotal || 0)}`, 48, y + 48)

  if (hasDiscount) {
    ctx.fillStyle = '#DC2626'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(`Desconto Concedido: - ${fmtBRL(order.discount || 0)}`, 48, y + 68)
  }

  // Total à direita
  ctx.textAlign = 'right'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillStyle = '#EA580C'
  ctx.fillText('VALOR TOTAL DA OS:', width - 48, y + 28)

  ctx.font = 'bold 26px monospace'
  ctx.fillStyle = '#0F172A'
  ctx.fillText(fmtBRL(order.totalAmount), width - 48, y + 58)

  if (order.paymentMethod) {
    ctx.font = 'bold 11px sans-serif'
    ctx.fillStyle = hasPartialBalance ? '#D97706' : '#16A34A'
    const installmentText =
      order.paymentMethod === 'cartao_credito' && (order.paymentInstallments || 1) > 1
        ? ` (${order.paymentInstallments}x)`
        : ''
    ctx.fillText(
      `Forma: ${order.paymentMethod.replace('_', ' ').toUpperCase()}${installmentText}`,
      width - 48,
      y + (hasDiscount ? 84 : 76)
    )
  }

  if (hasPartialBalance) {
    const partialLineY = y + boxHeight - 36
    ctx.strokeStyle = '#E2E8F0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(46, partialLineY)
    ctx.lineTo(width - 46, partialLineY)
    ctx.stroke()

    ctx.textAlign = 'left'
    ctx.font = 'bold 13px monospace'
    ctx.fillStyle = '#16A34A'
    ctx.fillText(`VALOR JÁ PAGO: ${fmtBRL(effectivePaid)}`, 48, partialLineY + 23)

    ctx.textAlign = 'right'
    ctx.font = 'bold 14px monospace'
    ctx.fillStyle = '#DC2626'
    ctx.fillText(`FALTA PAGAR: ${fmtBRL(effectiveRemaining)}`, width - 48, partialLineY + 23)
  }
  ctx.textAlign = 'left'

  y += boxHeight + 14

  // Carimbo Fiscal se houver
  if (order.fiscalInvoice && order.fiscalInvoice.status === 'autorizada') {
    ctx.fillStyle = '#F0FDF4'
    ctx.fillRect(30, y, width - 60, 52)
    ctx.strokeStyle = '#16A34A'
    ctx.lineWidth = 1.5
    ctx.strokeRect(30, y, width - 60, 52)

    ctx.fillStyle = '#16A34A'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(
      `✓ NFS-e AUTORIZADA — PORTO NACIONAL/TO (IBGE: 1718204) — Nº ${order.fiscalInvoice.invoiceNumber}`,
      48,
      y + 22
    )

    ctx.font = '10px monospace'
    ctx.fillStyle = '#475569'
    ctx.fillText(
      `Cód: ${order.fiscalInvoice.verificationCode}  •  Distrito de Luzimangues/TO  •  LC 116: 14.01`,
      48,
      y + 40
    )

    ctx.textAlign = 'right'
    ctx.font = 'bold 10px sans-serif'
    ctx.fillStyle = '#16A34A'
    ctx.fillText('VALIDADE FISCAL NACIONAL', width - 48, y + 32)
    ctx.textAlign = 'left'

    y += 64
  }

  // Garantia e Observações
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(30, y, width - 60, 56)
  ctx.strokeStyle = '#E2E8F0'
  ctx.strokeRect(30, y, width - 60, 56)

  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#475569'
  ctx.fillText(`Observações: ${order.observations || 'Nenhuma observação informada.'}`, 48, y + 22)
  ctx.fillText(
    `Garantia: ${order.warranty ? `${order.warranty.days} dias de garantia legal (Art. 26 CDC) - ${order.warranty.coverage}` : info.warranty}`,
    48,
    y + 42
  )

  y += 70

  // Rodapé: Aviso de autorização prévia pelo cliente (SEM frase de aprovação verbal falsa)
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(30, y - 6, width - 60, 38)
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 1
  ctx.strokeRect(30, y - 6, width - 60, 38)

  ctx.font = 'bold 11px sans-serif'
  ctx.fillStyle = '#EA580C'
  ctx.textAlign = 'center'
  ctx.fillText(
    'DOCUMENTO DE ORDEM DE SERVIÇO — ENVIADO PARA CONFERÊNCIA E AUTORIZAÇÃO DO CLIENTE',
    width / 2,
    y + 18
  )
  ctx.textAlign = 'left'

  return canvas
}
