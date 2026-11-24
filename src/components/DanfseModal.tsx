import React, { useState } from 'react'
import { ServiceOrder, FiscalSettings } from '../types'
import { useApp } from '../context/AppContext'
import { WrLogo } from './WrLogo'
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  FileText,
  Loader2,
  Share2,
  Save,
} from 'lucide-react'
import { generateNfsePdfBlob, shareNfsePdf } from '../utils/nfsePdfGenerator'

interface DanfseModalProps {
  order: ServiceOrder
  settings: FiscalSettings
  onClose: () => void
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro à Vista',
  cartao_debito: 'Cartão de Débito',
  cartao_credito: 'Cartão de Crédito',
  pagar_depois: 'Faturado / A Prazo',
  boleto: 'Boleto Bancário',
  pendente: 'Pendente',
}

export const DanfseModal: React.FC<DanfseModalProps> = ({ order, settings, onClose }) => {
  const { updateOrder, showToast } = useApp()
  const [copiedKey, setCopiedKey] = useState(false)
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)
  const [pdfFeedback, setPdfFeedback] = useState<string | null>(null)
  const [notesInput, setNotesInput] = useState<string>(order.invoiceNotes || order.observations || '')

  const effectiveOrder: ServiceOrder = {
    ...order,
    invoiceNotes: notesInput.trim(),
  }

  const handleSaveNotes = () => {
    updateOrder(order.id, { invoiceNotes: notesInput.trim() })
    showToast('Descrição da Nota Fiscal salva na OS!', 'success')
  }

  const installmentsSuffix =
    order.paymentInstallments && order.paymentInstallments > 1
      ? ` (${order.paymentInstallments}x)`
      : ''

  const paymentDesc =
    order.paymentMethod && order.paymentMethod !== 'pendente'
      ? `${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod.replace('_', ' ')}${installmentsSuffix}`
      : 'PIX'

  const defaultInvoice = {
    invoiceNumber: `${new Date().getFullYear()}${String((order.number || '').replace(/\D/g, '') || '1001').padStart(7, '0')}`,
    series: '1',
    rpsNumber: String((order.number || '').replace(/\D/g, '') || '1001'),
    rpsSeries: '1',
    issuedAt: `${order.date || new Date().toLocaleDateString('pt-BR')} às ${order.time || '10:00'}`,
    verificationCode: `PRTO-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    accessKey: `1718204${new Date().getFullYear().toString().slice(-2)}0000000000010000000011987654321`,
    status: 'autorizada' as const,
    serviceCode: '14.01',
    cnae: '4520-0/01',
    issRate: settings?.issRate || 3.0,
    issValue: ((order.laborTotal || order.totalAmount) * (settings?.issRate || 3.0)) / 100,
    taxRegime: settings?.taxRegime || 'Simples Nacional',
    protocolNumber: `2026.${Math.floor(100000 + Math.random() * 900000)}`,
    xmlData: '',
  }

  const invoice = {
    ...defaultInvoice,
    ...(order.fiscalInvoice || {}),
  }

  const companyName = settings?.companyName || 'WR MECÂNICA E AUTOPEÇAS LTDA'
  const tradeName = settings?.tradeName || 'WR Mecânica & Cia'
  const cnpj = settings?.cnpj || '34.892.124/0001-90'
  const cityRegistration = settings?.cityRegistration || '048.910-2'
  const address = settings?.address || 'Rodovia TO-080, KM 12 - Distrito de Luzimangues'
  const cityState = 'Porto Nacional - TO'
  const postalCode = 'CEP 77500-000'
  const workshopPhone = '(63) 99245-8102'

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const copyKeyToClipboard = () => {
    navigator.clipboard.writeText(invoice.accessKey || '')
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  // 🚀 Compartilhar o arquivo PDF oficial da Nota Fiscal
  const handleSharePdf = async () => {
    try {
      setIsProcessingPdf(true)
      setPdfFeedback('Gerando arquivo PDF oficial da Nota Fiscal...')

      const result = await shareNfsePdf(effectiveOrder, settings, invoice, paymentDesc)

      if (result.sharedDirectly) {
        setPdfFeedback('PDF compartilhado com sucesso via WhatsApp!')
      } else {
        setPdfFeedback('PDF baixado! Abrindo conversa do WhatsApp para envio do arquivo.')
      }

      setTimeout(() => setPdfFeedback(null), 5000)
    } catch (err) {
      console.error('Erro ao compartilhar PDF:', err)
      setPdfFeedback('Não foi possível gerar o PDF. Tente imprimir ou baixar diretamente.')
      setTimeout(() => setPdfFeedback(null), 4000)
    } finally {
      setIsProcessingPdf(false)
    }
  }

  // 📥 Download direto do PDF da Nota Fiscal
  const handleDownloadPdf = async () => {
    try {
      setIsProcessingPdf(true)
      setPdfFeedback('Compilando PDF da NFS-e...')
      const { blob, fileName } = await generateNfsePdfBlob(effectiveOrder, settings, invoice, paymentDesc)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setPdfFeedback('Download do PDF concluído!')
      setTimeout(() => setPdfFeedback(null), 3000)
    } catch (err) {
      console.error('Erro ao baixar PDF:', err)
      setPdfFeedback('Erro ao baixar PDF.')
      setTimeout(() => setPdfFeedback(null), 3000)
    } finally {
      setIsProcessingPdf(false)
    }
  }

  const handleDownloadXml = () => {
    const xmlContent =
      invoice.xmlData ||
      `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="2.04">
    <InfNfse Id="NFSE${invoice.invoiceNumber}">
      <Numero>${invoice.invoiceNumber}</Numero>
      <CodigoVerificacao>${invoice.verificationCode}</CodigoVerificacao>
      <DataEmissao>${invoice.issuedAt}</DataEmissao>
      <ChaveAcesso>${invoice.accessKey}</ChaveAcesso>
      <PrestadorServico>
        <IdentificacaoPrestador>
          <CpfCnpj><Cnpj>${cnpj.replace(/\D/g, '')}</Cnpj></CpfCnpj>
          <InscricaoMunicipal>${cityRegistration}</InscricaoMunicipal>
        </IdentificacaoPrestador>
        <RazaoSocial>${companyName}</RazaoSocial>
        <NomeFantasia>${tradeName}</NomeFantasia>
      </PrestadorServico>
      <TomadorServico>
        <IdentificacaoTomador>
          <CpfCnpj><Cpf>${(order.clientCpfCnpj || '00000000000').replace(/\D/g, '')}</Cpf></CpfCnpj>
        </IdentificacaoTomador>
        <RazaoSocial>${order.clientName}</RazaoSocial>
      </TomadorServico>
      <Servico>
        <Valores>
          <ValorServicos>${(Number(order.laborTotal) || 0).toFixed(2)}</ValorServicos>
          <ValorPecas>${(Number(order.partsTotal) || 0).toFixed(2)}</ValorPecas>
          <ValorLiquidoNfse>${(Number(order.totalAmount) || 0).toFixed(2)}</ValorLiquidoNfse>
        </Valores>
        <ItemListaServico>${invoice.serviceCode}</ItemListaServico>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`

    const blob = new Blob([xmlContent], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `NFS-e_${invoice.invoiceNumber}_WR_Mecanica.xml`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Chave formatada em blocos de 4 para leitura humana limpa
  const formattedKey = (invoice.accessKey || '').replace(/(\d{4})/g, '$1 ').trim()

  return (
    <div className="wr-modal-backdrop select-none">
      <div className="wr-modal-panel max-w-4xl space-y-4 text-xs animate-fadeIn max-h-[96vh] overflow-y-auto p-4 sm:p-6">
        {/* Top Control Bar (Clean, uncluttered, no-print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-wr-border no-print">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-wr-text text-sm sm:text-base">
                  Nota Fiscal de Serviços Eletrônica (NFS-e)
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Autorizada
                </span>
              </div>
              <p className="text-[11px] text-wr-muted">
                Documento Auxiliar da NFS-e (DANFSE) &bull; Prefeitura de Porto Nacional - TO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* BOTÃO COMPARTILHAR PDF NO WHATSAPP */}
            <button
              type="button"
              disabled={isProcessingPdf}
              onClick={handleSharePdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-xs disabled:opacity-50"
              title="Compartilhar arquivo PDF da Nota Fiscal no WhatsApp"
            >
              {isProcessingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              <span>Compartilhar PDF</span>
            </button>

            {/* BOTÃO BAIXAR ARQUIVO PDF */}
            <button
              type="button"
              disabled={isProcessingPdf}
              onClick={handleDownloadPdf}
              className="wr-btn-secondary px-3.5 py-2"
              title="Baixar arquivo PDF no computador"
            >
              <FileText className="h-4 w-4 text-wr-orange" />
              <span>Baixar PDF</span>
            </button>

            {/* BOTÃO IMPRIMIR */}
            <button
              type="button"
              onClick={() => window.print()}
              className="wr-btn-secondary px-3 py-2"
              title="Imprimir ou Salvar em PDF do Navegador"
            >
              <Printer className="h-4 w-4 text-wr-orange" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            {/* BOTÃO XML */}
            <button
              type="button"
              onClick={handleDownloadXml}
              className="wr-btn-secondary px-3 py-2"
              title="Baixar arquivo XML fiscal"
            >
              <Download className="h-4 w-4 text-wr-orange" />
              <span className="hidden sm:inline">XML</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-wr-muted hover:text-wr-text hover:bg-wr-elevated transition-colors ml-1"
              title="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notificação / Feedback de Compartilhamento de PDF */}
        {pdfFeedback && (
          <div className="no-print p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{pdfFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setPdfFeedback(null)}
              className="text-emerald-600 hover:text-emerald-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Campo Editável: Descrição / Observações na Nota Fiscal (não imprime) */}
        <div className="no-print rounded-2xl border border-wr-border bg-wr-elevated p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-wr-orange">
              Descrição / Observações da Nota Fiscal (opcional)
            </label>
            <button
              type="button"
              onClick={handleSaveNotes}
              className="inline-flex items-center gap-1.5 rounded-xl bg-wr-orange hover:bg-wr-orangeDark px-3 py-1.5 text-[11px] font-bold text-white transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Salvar Descrição</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={notesInput}
            onChange={e => setNotesInput(e.target.value)}
            placeholder="Digite aqui qualquer observação, condição de garantia ou descrição adicional para aparecer na Nota Fiscal..."
            className="wr-input bg-wr-surface text-xs leading-relaxed"
          />
        </div>

        {/* ============================================================== */}
        {/* DOCUMENTO FISCAL LIMPO, PROFISSIONAL E EXECUTIVO (A4 / TELA) */}
        {/* ============================================================== */}
        <div
          id="danfse-printable-doc"
          className="danfse-document-sheet bg-white text-slate-800 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 font-sans shadow-sm"
        >
          {/* 1. CABEÇALHO OFICIAL: LOGO WR MECÂNICA + IDENTIFICAÇÃO NFS-E */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <WrLogo size="lg" variant="light" showSubtitle={true} className="shrink-0 h-14" />
              <div className="space-y-0.5 border-l border-slate-200 pl-4 text-[11px] leading-tight">
                <p className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  {companyName}
                </p>
                <p className="font-semibold text-slate-600">
                  CNPJ: <span className="font-mono">{cnpj}</span> &bull; IM: <span className="font-mono">{cityRegistration}</span>
                </p>
                <p className="text-slate-500">
                  {address} &bull; {cityState}
                </p>
                <p className="text-slate-500">
                  Tel: {workshopPhone} &bull; {postalCode}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto text-left sm:text-right bg-slate-50 border border-slate-200 rounded-xl p-3 sm:min-w-[190px] shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                DANFSE &bull; NFS-e
              </span>
              <span className="text-lg font-black text-slate-900 font-mono block leading-none py-1">
                Nº {invoice.invoiceNumber}
              </span>
              <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200">
                <p>Emissão: <strong className="text-slate-700">{invoice.issuedAt}</strong></p>
                <p>Cód. Verificação: <strong className="font-mono text-slate-800 font-bold">{invoice.verificationCode}</strong></p>
              </div>
            </div>
          </div>

          {/* 2. DADOS DO CLIENTE E DO VEÍCULO (2 COLUNAS LIMPAS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-3.5 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Tomador / Cliente
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Ref: OS #{order.number}
                </span>
              </div>
              <div className="space-y-1 leading-snug">
                <p className="font-bold text-slate-900 text-sm">{order.clientName}</p>
                <p className="text-slate-600">
                  CPF/CNPJ: <span className="font-mono font-medium">{order.clientCpfCnpj || 'Não informado'}</span>
                </p>
                <p className="text-slate-600">
                  Telefone: <span className="font-medium">{order.clientPhone || 'Não informado'}</span>
                </p>
                <p className="text-slate-500 text-[11px]">
                  {order.clientAddress || 'Distrito de Luzimangues, Porto Nacional - TO'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Dados do Veículo Atendido
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Quitada
                </span>
              </div>
              <div className="space-y-1 leading-snug">
                <p className="font-bold text-slate-900 text-sm">{order.vehicleModel}</p>
                <div className="flex items-center gap-3 pt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-200 text-slate-900 font-mono font-bold text-xs tracking-wider">
                    {order.vehiclePlate}
                  </span>
                  <span className="text-slate-600 text-xs">
                    KM: <strong className="font-mono text-slate-800">{order.mileage ? Number(order.mileage).toLocaleString('pt-BR') : '0'}</strong>
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] pt-1">
                  Ordem de Serviço vinculada: <strong className="font-mono text-slate-700">#{order.number}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* 3. DISCRIMINAÇÃO DOS SERVIÇOS & PEÇAS (TABELA EXECUTIVA E CLARA) */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span>DISCRIMINAÇÃO DOS SERVIÇOS PRESTADOS E PEÇAS</span>
              <span className="text-slate-500 font-normal hidden sm:inline">
                Item LC 116/2003: 14.01 &bull; Manutenção Automotiva
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Descrição</th>
                  <th className="py-2.5 px-4 text-right">Mão de Obra</th>
                  <th className="py-2.5 px-4 text-right">Peças</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 px-4 font-medium text-slate-900">
                        {item.serviceDescription}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-600">
                        {formatCurrency(item.laborCost)}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-600">
                        {formatCurrency(item.partsCost)}
                      </td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.total || item.laborCost + item.partsCost)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {order.serviceDescription || 'Serviços de Manutenção e Reparação Mecânica Automotiva'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatCurrency(order.laborTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatCurrency(order.partsTotal || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4. FORMA DE PAGAMENTO E TOTALIZADORES (DISPOSIÇÃO EQUILIBRADA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Box da Forma de Pagamento */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Forma de Pagamento Registrada
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 tracking-wide">
                  {paymentDesc}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Quitado
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Transação liquidada e confirmada no caixa da oficina.
              </p>
            </div>

            {/* Box dos Valores Finais */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Total de Serviços:</span>
                <span className="font-mono">{formatCurrency(order.laborTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Total de Peças / Insumos:</span>
                <span className="font-mono">{formatCurrency(order.partsTotal || 0)}</span>
              </div>
              {(order.travelFee || 0) > 0 && (
                <div className="flex justify-between text-slate-700 font-semibold text-[11px]">
                  <span>Taxa de Deslocamento:</span>
                  <span className="font-mono">{formatCurrency(order.travelFee || 0)}</span>
                </div>
              )}
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold text-[11px]">
                  <span>Desconto Aplicado:</span>
                  <span className="font-mono">- {formatCurrency(order.discount || 0)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Valor Total Líquido
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {formatCurrency(order.totalAmount || order.laborTotal + (order.partsTotal || 0) + (order.travelFee || 0))}
                </span>
              </div>
            </div>
          </div>

          {/* 4.5. DESCRIÇÃO / OBSERVAÇÕES PERSONALIZADAS (se preenchidas) */}
          {notesInput.trim() && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Observações / Descrição Adicional
              </span>
              <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                {notesInput.trim()}
              </p>
            </div>
          )}

          {/* 5. TRIBUTAÇÃO MUNICIPAL (ISSQN) - SÓBRIA E DIRETA */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Regime Tributário</span>
              <span className="font-semibold text-slate-800">{invoice.taxRegime}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Base de Cálculo ISS</span>
              <span className="font-mono font-semibold text-slate-800">{formatCurrency(order.laborTotal)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Alíquota</span>
              <span className="font-mono font-semibold text-slate-800">{Number(invoice.issRate).toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor do ISS</span>
              <span className="font-mono font-semibold text-slate-800">{formatCurrency(invoice.issValue)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Município de Incidência</span>
              <span className="font-semibold text-slate-800">Porto Nacional / TO</span>
            </div>
          </div>

          {/* 6. VALIDAÇÃO FISCAL, CHAVE DE ACESSO E AUTENTICIDADE */}
          <div className="rounded-xl border border-slate-200 p-3.5 space-y-2 bg-slate-50/50 text-[11px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Chave de Acesso Nacional da NFS-e
                </span>
                <span className="font-mono text-xs text-slate-900 font-bold tracking-wider break-all block py-0.5">
                  {formattedKey}
                </span>
              </div>
              <div className="flex items-center gap-2 no-print shrink-0">
                <button
                  type="button"
                  onClick={copyKeyToClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold transition-colors"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                  <span>{copiedKey ? 'Copiada!' : 'Copiar Chave'}</span>
                </button>
                <a
                  href="https://www.nfse.gov.br/emissornacional/ConsultaPublica"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Consultar no Portal gov.br</span>
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[10px] text-slate-500">
              <p>
                Documento emitido por ME ou EPP optante pelo Simples Nacional. Protocolo: <strong className="font-mono text-slate-700">{invoice.protocolNumber}</strong>
              </p>
              <p className="font-semibold text-slate-600">
                Página 1 de 1
              </p>
            </div>
          </div>
        </div>

        {/* Global Print Styling - Folha A4 Impecável */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            body * {
              visibility: hidden !important;
            }
            #danfse-printable-doc, #danfse-printable-doc * {
              visibility: visible !important;
            }
            #danfse-printable-doc {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              border-radius: 0 !important;
              background: #ffffff !important;
              color: #1e293b !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
