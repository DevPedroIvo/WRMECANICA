import { ServiceOrder, FiscalSettings } from '../types'
import { loadWrLogoImage } from './wrLogoSvg'

/**
 * Constrói um documento PDF 1.4 binário padronizado A4 (595.28 x 841.89 pt)
 * encapsulando um fluxo JPEG de alta resolução com DCTDecode.
 * Compatível nativamente com visualizadores de PDF (Acrobat, Chrome, Edge, WhatsApp, iOS, Android).
 */
export function buildPdfFromJpegBuffer(
  jpegBytes: Uint8Array,
  imgW: number,
  imgH: number
): Uint8Array {
  const a4W = 595.28
  const a4H = 841.89

  const enc = new TextEncoder()
  const headerStr = '%PDF-1.4\n%\xFF\xFF\xFF\xFF\n'
  const header = enc.encode(headerStr)

  const chunks: Uint8Array[] = [header]
  let currentOffset = header.length
  const offsets: number[] = []

  function appendChunk(str: string) {
    const b = enc.encode(str)
    chunks.push(b)
    currentOffset += b.length
  }

  function appendBinary(u8: Uint8Array) {
    chunks.push(u8)
    currentOffset += u8.length
  }

  function addObjHeader(): number {
    offsets.push(currentOffset)
    const objNum = offsets.length
    appendChunk(`${objNum} 0 obj\n`)
    return objNum
  }

  function addObjFooter() {
    appendChunk('\nendobj\n')
  }

  // Obj 1: Catalog
  addObjHeader()
  appendChunk('<< /Type /Catalog /Pages 2 0 R >>')
  addObjFooter()

  // Obj 2: Pages
  addObjHeader()
  appendChunk('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  addObjFooter()

  // Obj 3: Page
  addObjHeader()
  appendChunk(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${a4W.toFixed(2)} ${a4H.toFixed(2)}] /Resources << /XObject << /Im1 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>`
  )
  addObjFooter()

  // Obj 4: Image XObject (JPEG DCTDecode)
  addObjHeader()
  appendChunk(
    `<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  )
  appendBinary(jpegBytes)
  appendChunk('\nendstream')
  addObjFooter()

  // Obj 5: Page Content Stream (Margem de 18pt no A4)
  const margin = 18
  const printW = a4W - margin * 2
  const printH = (imgH / imgW) * printW
  const printX = margin
  const printY = a4H - margin - printH

  const streamContent = `q\n${printW.toFixed(2)} 0 0 ${printH.toFixed(2)} ${printX.toFixed(2)} ${Math.max(margin, printY).toFixed(2)} cm\n/Im1 Do\nQ\n`
  const streamBytes = enc.encode(streamContent)

  addObjHeader()
  appendChunk(`<< /Length ${streamBytes.length} >>\nstream\n`)
  appendBinary(streamBytes)
  appendChunk('\nendstream')
  addObjFooter()

  // Xref
  const startXref = currentOffset
  appendChunk(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`)
  for (let i = 0; i < offsets.length; i++) {
    const offStr = String(offsets[i]).padStart(10, '0')
    appendChunk(`${offStr} 00000 n \n`)
  }

  // Trailer
  appendChunk(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`)

  let totalLen = 0
  for (const c of chunks) totalLen += c.length
  const finalBuf = new Uint8Array(totalLen)
  let pos = 0
  for (const c of chunks) {
    finalBuf.set(c, pos)
    pos += c.length
  }
  return finalBuf
}

/**
 * Renderiza a Nota Fiscal oficial (DANFSE) em um Canvas de alta resolução (1240 x 1754 px - A4 150-300 DPI)
 */
export async function renderNfseToCanvas(
  order: ServiceOrder,
  settings: FiscalSettings,
  invoice: any,
  paymentDesc: string
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  const width = 1240
  const height = 1754
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!

  // Fundo branco papel puro
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  // 1. Cabeçalho Oficial
  // Logotipo WR
  try {
    const logoImg = await loadWrLogoImage({ variant: 'light', showSubtitle: true })
    if (logoImg) {
      ctx.drawImage(logoImg, 50, 50, 240, 92)
    }
  } catch (err) {
    console.warn('Erro ao carregar logo na nota fiscal:', err)
  }

  // Linha vertical divisória
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(310, 50)
  ctx.lineTo(310, 150)
  ctx.stroke()

  // Dados da Oficina
  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 19px sans-serif'
  ctx.fillText(settings.companyName || 'WR MECÂNICA E AUTOPEÇAS LTDA', 330, 75)

  ctx.fillStyle = '#475569'
  ctx.font = '14px sans-serif'
  ctx.fillText(`CNPJ: ${settings.cnpj}   •   Inscrição Municipal: ${settings.cityRegistration}`, 330, 100)
  ctx.fillText(`${settings.address || 'Rodovia TO-080, KM 12 - Distrito de Luzimangues'}`, 330, 122)
  ctx.fillText('Porto Nacional - TO   •   CEP 77500-000   •   Tel: (63) 99245-8102', 330, 144)

  // Box da NFS-e (Direita)
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(width - 340, 50, 290, 102)
  ctx.strokeStyle = '#94A3B8'
  ctx.lineWidth = 1.5
  ctx.strokeRect(width - 340, 50, 290, 102)

  ctx.fillStyle = '#64748B'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('DANFSE • NOTA FISCAL DE SERVIÇOS', width - 325, 74)

  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 22px monospace'
  ctx.fillText(`Nº ${invoice.invoiceNumber}`, width - 325, 105)

  ctx.fillStyle = '#475569'
  ctx.font = '12px sans-serif'
  ctx.fillText(`Emissão: ${invoice.issuedAt}`, width - 325, 128)
  ctx.fillText(`Cód. Verificação: ${invoice.verificationCode}`, width - 325, 144)

  // Linha divisória horizontal
  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(50, 175)
  ctx.lineTo(width - 50, 175)
  ctx.stroke()

  // 2. Tomador de Serviços & Dados do Veículo (2 boxes lado a lado)
  const boxW = 550
  const boxH = 150
  const boxY = 195

  // Box Cliente
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(50, boxY, boxW, boxH)
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 1
  ctx.strokeRect(50, boxY, boxW, boxH)

  ctx.fillStyle = '#64748B'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('TOMADOR / CLIENTE (DESTINATÁRIO)', 70, boxY + 28)

  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(order.clientName, 70, boxY + 60)

  ctx.fillStyle = '#334155'
  ctx.font = '14px sans-serif'
  ctx.fillText(`CPF/CNPJ: ${order.clientCpfCnpj || 'Não informado'}`, 70, boxY + 86)
  ctx.fillText(`Telefone: ${order.clientPhone || 'Não informado'}`, 70, boxY + 110)
  ctx.fillText(`Endereço: ${order.clientAddress || 'Distrito de Luzimangues, Porto Nacional - TO'}`, 70, boxY + 134)

  // Box Veículo
  const rightBoxX = width - 50 - boxW
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(rightBoxX, boxY, boxW, boxH)
  ctx.strokeRect(rightBoxX, boxY, boxW, boxH)

  ctx.fillStyle = '#64748B'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('DADOS DO VEÍCULO ATENDIDO', rightBoxX + 20, boxY + 28)

  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(order.vehicleModel, rightBoxX + 20, boxY + 60)

  // Placa Mercosul estilizada no Canvas
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(rightBoxX + 20, boxY + 75, 110, 38)
  ctx.strokeStyle = '#1E293B'
  ctx.lineWidth = 1.5
  ctx.strokeRect(rightBoxX + 20, boxY + 75, 110, 38)

  ctx.fillStyle = '#003399'
  ctx.fillRect(rightBoxX + 20, boxY + 75, 110, 12)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 8px sans-serif'
  ctx.fillText('BRASIL', rightBoxX + 58, boxY + 84)

  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 16px monospace'
  ctx.fillText(order.vehiclePlate, rightBoxX + 32, boxY + 104)

  ctx.fillStyle = '#334155'
  ctx.font = '14px sans-serif'
  ctx.fillText(`KM: ${order.mileage ? Number(order.mileage).toLocaleString('pt-BR') : '0'} km`, rightBoxX + 150, boxY + 95)
  ctx.fillText(`Ref: Ordem de Serviço #${order.number}`, rightBoxX + 150, boxY + 120)

  // 3. Tabela de Discriminação dos Serviços
  const tableY = 370
  const tableW = width - 100
  const tableH = 520

  ctx.fillStyle = '#0F172A'
  ctx.fillRect(50, tableY, tableW, 36)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('DISCRIMINAÇÃO DOS SERVIÇOS PRESTADOS E PEÇAS', 65, tableY + 23)
  ctx.fillText('ITEM LC 116: 14.01', width - 200, tableY + 23)

  ctx.fillStyle = '#F1F5F9'
  ctx.fillRect(50, tableY + 36, tableW, 28)
  ctx.fillStyle = '#475569'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('DESCRIÇÃO', 65, tableY + 55)
  ctx.fillText('MÃO DE OBRA', width - 420, tableY + 55)
  ctx.fillText('PEÇAS', width - 260, tableY + 55)
  ctx.fillText('TOTAL', width - 120, tableY + 55)

  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 1
  ctx.strokeRect(50, tableY, tableW, tableH)

  // Linhas de itens
  let rowY = tableY + 88
  if (order.items && order.items.length > 0) {
    order.items.forEach((item, idx) => {
      ctx.fillStyle = '#1E293B'
      ctx.font = '14px sans-serif'
      ctx.fillText(`${idx + 1}. ${item.serviceDescription}`, 65, rowY)

      ctx.font = '14px monospace'
      ctx.fillStyle = '#475569'
      ctx.fillText(formatCurrency(item.laborCost), width - 420, rowY)
      ctx.fillText(formatCurrency(item.partsCost), width - 260, rowY)

      ctx.fillStyle = '#0F172A'
      ctx.font = 'bold 14px monospace'
      ctx.fillText(formatCurrency(item.total || item.laborCost + item.partsCost), width - 120, rowY)

      // linha sutil
      ctx.strokeStyle = '#F1F5F9'
      ctx.beginPath()
      ctx.moveTo(50, rowY + 12)
      ctx.lineTo(width - 50, rowY + 12)
      ctx.stroke()

      rowY += 36
    })
  } else {
    ctx.fillStyle = '#1E293B'
    ctx.font = '14px sans-serif'
    ctx.fillText(`1. ${order.serviceDescription || 'Manutenção e Reparação Mecânica Automotiva'}`, 65, rowY)

    ctx.font = '14px monospace'
    ctx.fillStyle = '#475569'
    ctx.fillText(formatCurrency(order.laborTotal), width - 420, rowY)
    ctx.fillText(formatCurrency(order.partsTotal || 0), width - 260, rowY)

    ctx.fillStyle = '#0F172A'
    ctx.font = 'bold 14px monospace'
    ctx.fillText(formatCurrency(order.totalAmount), width - 120, rowY)
  }

  // 4. Totais e Condição de Pagamento
  const totalsY = 920

  // Box Pagamento
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(50, totalsY, boxW, 140)
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 1
  ctx.strokeRect(50, totalsY, boxW, 140)

  ctx.fillStyle = '#64748B'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('FORMA DE PAGAMENTO REGISTRADA', 70, totalsY + 30)

  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 20px sans-serif'
  ctx.fillText(paymentDesc, 70, totalsY + 68)

  ctx.fillStyle = '#10B981'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('✓ PAGAMENTO CONFIRMADO E QUITADO', 70, totalsY + 100)

  ctx.fillStyle = '#64748B'
  ctx.font = '12px sans-serif'
  ctx.fillText('Documento com quitação integral registrada no sistema da oficina.', 70, totalsY + 122)

  // Box Valores Totais
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(rightBoxX, totalsY, boxW, 140)
  ctx.strokeRect(rightBoxX, totalsY, boxW, 140)

  ctx.fillStyle = '#475569'
  ctx.font = '13px sans-serif'
  ctx.fillText('Total Serviços (M.O):', rightBoxX + 25, totalsY + 32)
  ctx.fillText('Total Peças / Insumos:', rightBoxX + 25, totalsY + 58)
  if ((order.discount || 0) > 0) {
    ctx.fillStyle = '#E11D48'
    ctx.fillText('Desconto Concedido:', rightBoxX + 25, totalsY + 84)
  }

  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 14px monospace'
  ctx.fillText(formatCurrency(order.laborTotal), rightBoxX + boxW - 140, totalsY + 32)
  ctx.fillText(formatCurrency(order.partsTotal || 0), rightBoxX + boxW - 140, totalsY + 58)
  if ((order.discount || 0) > 0) {
    ctx.fillStyle = '#E11D48'
    ctx.fillText(`- ${formatCurrency(order.discount || 0)}`, rightBoxX + boxW - 140, totalsY + 84)
  }

  // Linha total
  ctx.strokeStyle = '#CBD5E1'
  ctx.beginPath()
  ctx.moveTo(rightBoxX + 20, totalsY + 98)
  ctx.lineTo(rightBoxX + boxW - 20, totalsY + 98)
  ctx.stroke()

  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 15px sans-serif'
  ctx.fillText('VALOR TOTAL LÍQUIDO:', rightBoxX + 25, totalsY + 125)

  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 22px monospace'
  ctx.fillText(formatCurrency(order.totalAmount), rightBoxX + boxW - 160, totalsY + 125)

  // 5. Tributos Municipais (ISSQN)
  const taxY = 1090
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(50, taxY, tableW, 70)
  ctx.strokeStyle = '#CBD5E1'
  ctx.strokeRect(50, taxY, tableW, 70)

  ctx.fillStyle = '#64748B'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('REGIME TRIBUTÁRIO', 70, taxY + 26)
  ctx.fillText('BASE CÁLCULO ISS', 320, taxY + 26)
  ctx.fillText('ALÍQUOTA', 570, taxY + 26)
  ctx.fillText('VALOR DO ISS', 800, taxY + 26)
  ctx.fillText('MUNICÍPIO DE INCIDÊNCIA', 1000, taxY + 26)

  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText(invoice.taxRegime || 'Simples Nacional', 70, taxY + 52)
  ctx.font = 'bold 14px monospace'
  ctx.fillText(formatCurrency(order.laborTotal), 320, taxY + 52)
  ctx.fillText(`${Number(invoice.issRate).toFixed(2)}%`, 570, taxY + 52)
  ctx.fillText(formatCurrency(invoice.issValue), 800, taxY + 52)
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('Porto Nacional - TO', 1000, taxY + 52)

  // 6. Chave de Acesso Nacional e Autenticidade
  const keyY = 1190
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(50, keyY, tableW, 110)
  ctx.strokeStyle = '#CBD5E1'
  ctx.strokeRect(50, keyY, tableW, 110)

  ctx.fillStyle = '#64748B'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('CHAVE DE ACESSO NACIONAL DA NFS-e (CONSULTA PÚBLICA EM WWW.NFSE.GOV.BR)', 70, keyY + 28)

  const formattedKey = (invoice.accessKey || '').replace(/(\d{4})/g, '$1 ').trim()
  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 15px monospace'
  ctx.fillText(formattedKey, 70, keyY + 58)

  ctx.fillStyle = '#475569'
  ctx.font = '12px sans-serif'
  ctx.fillText(`Protocolo de Autorização: ${invoice.protocolNumber}   •   Página 1 de 1`, 70, keyY + 90)
  ctx.fillText('Documento emitido por ME ou EPP optante pelo Simples Nacional.', width - 480, keyY + 90)

  return canvas
}

/**
 * Gera o arquivo binário PDF (.pdf) oficial da NFS-e a partir do Canvas
 */
export async function generateNfsePdfBlob(
  order: ServiceOrder,
  settings: FiscalSettings,
  invoice: any,
  paymentDesc: string
): Promise<{ blob: Blob; file: File; fileName: string }> {
  const canvas = await renderNfseToCanvas(order, settings, invoice, paymentDesc)

  // Extrai o buffer JPEG em 95% de fidelidade
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
  const base64Data = dataUrl.split(',')[1]
  const binaryString = atob(base64Data)
  const jpegBytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    jpegBytes[i] = binaryString.charCodeAt(i)
  }

  // Constrói o PDF binário no padrão A4
  const pdfBytes = buildPdfFromJpegBuffer(jpegBytes, canvas.width, canvas.height)
  const fileName = `NFS-e_${invoice.invoiceNumber}_WR_Mecanica.pdf`

  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const file = new File([blob], fileName, { type: 'application/pdf' })

  return { blob, file, fileName }
}

/**
 * Compartilha o arquivo PDF oficial da Nota Fiscal:
 * 1. Via Web Share API (se suportado pelo celular/sistema, anexa o PDF diretamente no WhatsApp).
 * 2. Em desktops / navegadores sem envio nativo de arquivos:
 *    Baixa o arquivo .PDF imediatamente e abre o WhatsApp com a mensagem pronta para anexar.
 */
export async function shareNfsePdf(
  order: ServiceOrder,
  settings: FiscalSettings,
  invoice: any,
  paymentDesc: string
): Promise<{ sharedDirectly: boolean; fileName: string }> {
  const { blob, file, fileName } = await generateNfsePdfBlob(order, settings, invoice, paymentDesc)

  const rawPhone = (order.clientPhone || '').replace(/\D/g, '')
  const fullPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`

  const message = `Olá *${order.clientName}*, segue em anexo a sua *Nota Fiscal Eletrônica em PDF (NFS-e nº ${invoice.invoiceNumber})* emitida pela *WR Mecânica & Cia*.\n\n🚗 *Veículo:* ${order.vehicleModel} (${order.vehiclePlate})\n📄 *Valor Total:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount)}\n💳 *Condição:* ${paymentDesc}\n🔑 *Chave de Acesso:* ${invoice.accessKey}\n🔗 *Consulta Pública:* https://www.nfse.gov.br/emissornacional/ConsultaPublica\n\n_Documento fiscal oficial emitido em Porto Nacional / Luzimangues - TO._`

  // 1. Tenta compartilhamento nativo de arquivo (Android / iOS / Windows Web Share com suporte a arquivos)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `NFS-e ${invoice.invoiceNumber} - WR Mecânica`,
        text: message,
      })
      return { sharedDirectly: true, fileName }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Erro ao compartilhar via Web Share:', err)
      }
    }
  }

  // 2. Fallback: Baixa o arquivo PDF localmente para o cliente anexar e abre o WhatsApp do cliente
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  // Abre conversa do WhatsApp
  if (rawPhone) {
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank')
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return { sharedDirectly: false, fileName }
}
