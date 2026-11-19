import React, { useState } from 'react'
import { ServiceOrder, FiscalSettings } from '../types'
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Share2,
  MessageCircle,
} from 'lucide-react'

interface DanfseModalProps {
  order: ServiceOrder
  settings: FiscalSettings
  onClose: () => void
}

export const DanfseModal: React.FC<DanfseModalProps> = ({ order, settings, onClose }) => {
  const invoice = order.fiscalInvoice
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  if (!invoice) return null

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const copyToClipboard = (text: string, type: 'key' | 'code') => {
    navigator.clipboard.writeText(text)
    if (type === 'key') {
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    } else {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const paymentDesc =
    invoice.paymentMethodDescription ||
    (order.paymentMethod ? `PAGO VIA ${order.paymentMethod.replace('_', ' ').toUpperCase()}` : 'À VISTA')

  const handleShareInvoice = async () => {
    const text = `*NOTA FISCAL DE SERVIÇOS ELETRÔNICA (NFS-e)*\nNº: ${invoice.invoiceNumber}\nCliente: ${order.clientName}\nVeículo: ${order.vehicleModel} (${order.vehiclePlate})\nValor Serviços: ${formatCurrency(order.laborTotal)}\nValor Peças: ${formatCurrency(order.partsTotal || 0)}\nTotal: ${formatCurrency(order.totalAmount)}\nForma de Pagamento: ${paymentDesc}\nCód. Verificação: ${invoice.verificationCode}\nChave de Acesso: ${invoice.accessKey}\nConsulta Pública: https://www.nfse.gov.br/emissornacional/ConsultaPublica\n\nWR Mecânica & Cia • Porto Nacional - TO`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `NFS-e #${invoice.invoiceNumber} - ${order.clientName}`,
          text,
        })
        return
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }

    const cleanNumber = order.clientPhone.replace(/\D/g, '')
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
    window.open(`https://wa.me/${fullNumber}?text=${encodeURIComponent(text)}`, '_blank')
  }

  // Download do XML com validade jurídica (ABRASF 2.04 / Padrão Nacional)
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
      <IdentificacaoRps>
        <Numero>${invoice.rpsNumber}</Numero>
        <Serie>${invoice.rpsSeries}</Serie>
        <Tipo>1</Tipo>
      </IdentificacaoRps>
      <PrestadorServico>
        <IdentificacaoPrestador>
          <CpfCnpj><Cnpj>${settings.cnpj.replace(/\D/g, '')}</Cnpj></CpfCnpj>
          <InscricaoMunicipal>${settings.cityRegistration}</InscricaoMunicipal>
        </IdentificacaoPrestador>
        <RazaoSocial>${settings.companyName}</RazaoSocial>
        <NomeFantasia>${settings.tradeName}</NomeFantasia>
        <Endereco>
          <Endereco>${settings.address || 'Rodovia TO-080, KM 12'}</Endereco>
          <Bairro>${settings.district || 'Luzimangues'}</Bairro>
          <CodigoMunicipio>${settings.cityCodeIBGE || '1718204'}</CodigoMunicipio>
          <Uf>${settings.state || 'TO'}</Uf>
          <Cep>${settings.cep || '77500000'}</Cep>
        </Endereco>
      </PrestadorServico>
      <TomadorServico>
        <IdentificacaoTomador>
          <CpfCnpj><Cpf>${(order.clientCpfCnpj || '00000000000').replace(/\D/g, '')}</Cpf></CpfCnpj>
        </IdentificacaoTomador>
        <RazaoSocial>${order.clientName}</RazaoSocial>
      </TomadorServico>
      <Servico>
        <Valores>
          <ValorServicos>${order.laborTotal.toFixed(2)}</ValorServicos>
          <ValorPecas>${(order.partsTotal || 0).toFixed(2)}</ValorPecas>
          <BaseCalculo>${order.laborTotal.toFixed(2)}</BaseCalculo>
          <Aliquota>${(settings.issRate / 100).toFixed(4)}</Aliquota>
          <ValorIss>${invoice.issValue.toFixed(2)}</ValorIss>
          <ValorLiquidoNfse>${order.laborTotal.toFixed(2)}</ValorLiquidoNfse>
        </Valores>
        <ItemListaServico>${invoice.serviceCode}</ItemListaServico>
        <CodigoCnae>${invoice.cnae.replace(/\D/g, '')}</CodigoCnae>
        <CodigoTributacaoMunicipio>14.01.01</CodigoTributacaoMunicipio>
        <Discriminacao>${order.items
          .map(it => `${it.serviceDescription} (M.O: R$ ${it.laborCost.toFixed(2)})`)
          .join(' | ')} - Veículo: ${order.vehicleModel} Placa: ${order.vehiclePlate} KM: ${order.mileage} - Forma de Pagamento: ${paymentDesc}</Discriminacao>
        <CodigoMunicipio>${settings.cityCodeIBGE || '1718204'}</CodigoMunicipio>
        <MunicipioIncidencia>${settings.cityCodeIBGE || '1718204'}</MunicipioIncidencia>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`

    const blob = new Blob([xmlContent], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `NFS-e_${invoice.invoiceNumber}_PortoNacional.xml`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="wr-modal-backdrop select-none">
      <div className="wr-modal-panel max-w-3xl space-y-4 text-xs animate-fadeIn max-h-[96vh] overflow-y-auto p-4 sm:p-6">
        {/* Top Action Bar (hidden when printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-wr-border no-print">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-wr-text text-sm flex flex-wrap items-center gap-2">
                NFS-e (DANFSE Oficial)
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                  AUTORIZADA &bull; VALIDADE FISCAL
                </span>
              </h3>
              <p className="text-[11px] text-wr-muted">
                Porto Nacional / Luzimangues - TO &bull; LC 116/2003 (Item 14.01)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShareInvoice}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition-colors shadow-xs"
              title="Compartilhar via WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Compartilhar</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="wr-btn-secondary px-3 py-2"
              title="Imprimir Nota Fiscal"
            >
              <Printer className="h-4 w-4 text-wr-orange" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadXml}
              className="wr-btn-secondary px-3 py-2"
              title="Baixar arquivo XML"
            >
              <Download className="h-4 w-4 text-wr-orange" />
              <span className="hidden sm:inline">XML</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-wr-muted hover:text-wr-text hover:bg-wr-elevated"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Informações de Autenticidade e Consulta Pública */}
        <div className="no-print rounded-2xl bg-blue-500/10 border border-blue-500/30 p-3 sm:p-4 text-[11px] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="font-bold text-blue-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Autenticidade &amp; Consulta Pública
            </span>
            <span className="text-[10px] text-wr-muted font-mono">Padrão Nacional NFS-e / SEFAZ-TO</span>
          </div>
          <p className="text-wr-text leading-relaxed">
            Esta NFS-e segue a Lei Complementar nº 116/2003 e o Convênio Nacional de NFS-e. Você pode consultar diretamente com a chave ou código de verificação:
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="https://www.nfse.gov.br/emissornacional/ConsultaPublica"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors"
            >
              <ExternalLink className="h-3 w-3" /> Portal Nacional gov.br/nfse
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard(invoice.accessKey || '', 'key')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-wr-border bg-wr-surface text-wr-text hover:border-wr-orange font-bold text-[10px] transition-colors"
            >
              {copiedKey ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(invoice.verificationCode || '', 'code')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-wr-border bg-wr-surface text-wr-text hover:border-wr-orange font-bold text-[10px] transition-colors"
            >
              {copiedCode ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copiedCode ? 'Código Copiado!' : 'Copiar Código'}
            </button>
          </div>
        </div>

        {/* Printable Document (DANFSE - Otimizado e Responsivo para Celular e A4) */}
        <div
          id="danfse-printable-doc"
          className="danfse-print-container rounded-2xl border border-wr-border bg-white text-black p-3.5 sm:p-5 space-y-3 font-sans text-xs shadow-xs"
        >
          {/* Header Municipal Oficial */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 border-b-2 border-black pb-3">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono tracking-wider text-neutral-600 uppercase font-bold block">
                REPÚBLICA FEDERATIVA DO BRASIL &bull; ESTADO DO TOCANTINS
              </span>
              <h2 className="text-sm sm:text-base font-black text-black uppercase tracking-tight leading-tight">
                PREFEITURA MUNICIPAL DE PORTO NACIONAL
              </h2>
              <p className="text-[10px] font-bold text-neutral-800">
                SECRETARIA MUNICIPAL DA FAZENDA &bull; DISTRITO DE LUZIMANGUES
              </p>
              <p className="text-[9px] text-neutral-600 font-mono">
                CÓD. IBGE: {settings.cityCodeIBGE || '1718204'} &bull; NOTA FISCAL DE SERVIÇOS ELETRÔNICA (NFS-e)
              </p>
            </div>

            <div className="text-left sm:text-right space-y-0.5 bg-neutral-100 p-2 sm:p-2.5 rounded-xl border border-neutral-300 w-full sm:w-auto sm:min-w-[150px]">
              <span className="text-[9px] font-bold text-neutral-600 uppercase block">Número da NFS-e</span>
              <span className="text-base font-black text-black font-mono block">
                {invoice.invoiceNumber}
              </span>
              <span className="text-[9px] font-mono text-neutral-600 block">{invoice.issuedAt}</span>
              <span className="text-[9px] font-mono font-bold text-emerald-700 block">
                Cód: {invoice.verificationCode}
              </span>
            </div>
          </div>

          {/* Prestador e Tomador (Adaptado para 1 col no celular e 2 cols no desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-[10px]">
            <div className="rounded-xl bg-neutral-50 p-2.5 border border-neutral-300 space-y-0.5">
              <span className="text-[9px] font-bold text-neutral-700 uppercase block border-b border-neutral-200 pb-0.5">
                Prestador de Serviços (Oficina)
              </span>
              <p className="font-bold text-black text-[11px]">{settings.companyName}</p>
              <p className="text-neutral-700 font-semibold">{settings.tradeName}</p>
              <p className="font-mono text-neutral-700">
                CNPJ: {settings.cnpj} &bull; IM: {settings.cityRegistration} &bull; IE: {settings.stateRegistration}
              </p>
              <p className="text-neutral-600">
                {settings.address || 'Rodovia TO-080, KM 12 - Luzimangues, Porto Nacional/TO, CEP 77500-000'}
              </p>
              <p className="font-bold text-neutral-800">
                Regime: {invoice.taxRegime} &bull; CNAE: {invoice.cnae}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-50 p-2.5 border border-neutral-300 space-y-0.5">
              <span className="text-[9px] font-bold text-neutral-700 uppercase block border-b border-neutral-200 pb-0.5">
                Tomador de Serviços (Cliente)
              </span>
              <p className="font-bold text-black text-[11px]">{order.clientName}</p>
              <p className="font-mono text-neutral-700">CPF/CNPJ: {order.clientCpfCnpj || 'Não informado'}</p>
              <p className="text-neutral-600">{order.clientAddress || 'Luzimangues, Porto Nacional/TO'}</p>
              <p className="text-neutral-600">Telefone: {order.clientPhone}</p>
              <p className="font-bold text-emerald-800">
                Condição: {paymentDesc}
              </p>
            </div>
          </div>

          {/* Dados do Veículo, RPS e Forma de Pagamento */}
          <div className="rounded-xl bg-neutral-100 p-2.5 border border-neutral-300 flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <span>
              Veículo: <strong className="text-black">{order.vehicleModel}</strong>
            </span>
            <span>
              Placa: <strong className="font-mono text-black font-bold">{order.vehiclePlate}</strong>
            </span>
            <span>
              KM: <strong className="font-mono">{Number(order.mileage).toLocaleString('pt-BR')}</strong>
            </span>
            <span>
              RPS: <strong className="font-mono text-neutral-800">{invoice.rpsNumber} (Série {invoice.rpsSeries})</strong>
            </span>
            <span className="rounded-lg bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[10px] font-black text-emerald-800">
              {paymentDesc}
            </span>
          </div>

          {/* Discriminação de Serviços e Peças */}
          <div className="rounded-xl bg-neutral-50 p-2.5 border border-neutral-300 space-y-1.5 text-[10px]">
            <span className="text-[9px] font-bold text-neutral-700 uppercase block border-b border-neutral-200 pb-0.5">
              Discriminação dos Serviços Prestados &bull; Item LC 116: {invoice.serviceCode} (CNAE: {invoice.cnae})
            </span>
            <p className="text-black font-medium leading-tight">
              {order.serviceDescription}
            </p>
            {order.items && order.items.length > 0 && (
              <div className="pt-1.5 border-t border-neutral-200 space-y-1 text-[9px] text-neutral-700">
                {order.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-0.5 border-b border-neutral-100 last:border-0 gap-0.5"
                  >
                    <span>&bull; {it.serviceDescription}</span>
                    <span className="font-mono text-black font-semibold">
                      Mão de Obra: {formatCurrency(it.laborCost)} | Peças: {formatCurrency(it.partsCost)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Destaque de Desconto se concedido */}
            {(order.discount || 0) > 0 && (
              <div className="pt-1 border-t border-neutral-200 flex justify-between items-center text-[10px] font-bold text-rose-700">
                <span>Desconto Concedido:</span>
                <span className="font-mono">- {formatCurrency(order.discount || 0)}</span>
              </div>
            )}
          </div>

          {/* Tabela de Cálculo do ISS Municipal (Com scroll horizontal suave no celular) */}
          <div className="overflow-x-auto rounded-xl border border-neutral-300">
            <div className="min-w-[420px]">
              <div className="grid grid-cols-5 bg-neutral-200 text-neutral-800 p-1.5 font-bold text-center border-b border-neutral-300 text-[9px]">
                <div>Total Serviços</div>
                <div>Total Peças</div>
                <div>Base Cálculo ISS</div>
                <div>Alíquota ISS</div>
                <div>Valor do ISS</div>
              </div>
              <div className="grid grid-cols-5 p-2 text-center font-mono font-bold text-[10px] bg-white">
                <div>{formatCurrency(order.laborTotal)}</div>
                <div className="text-neutral-600">{formatCurrency(order.partsTotal)}</div>
                <div>{formatCurrency(order.laborTotal)}</div>
                <div>{invoice.issRate.toFixed(2)}%</div>
                <div className="text-emerald-700">{formatCurrency(invoice.issValue)}</div>
              </div>
            </div>
          </div>

          {/* Chave de Acesso e Protocolo */}
          <div className="rounded-xl bg-neutral-50 p-2.5 border border-neutral-300 space-y-1.5 text-[9px] text-neutral-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="block font-bold text-black uppercase text-[8px]">
                  CHAVE DE ACESSO NACIONAL DA NFS-e (50 DÍGITOS):
                </span>
                <span className="font-mono text-[9px] text-neutral-900 tracking-wider break-all font-bold block">
                  {invoice.accessKey}
                </span>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="font-bold text-emerald-800 inline-flex items-center gap-1 text-[9px]">
                  <CheckCircle2 className="h-3 w-3" /> Protocolo: {invoice.protocolNumber}
                </span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[8px] text-neutral-600">
              <span>
                Consulte em <strong>www.nfse.gov.br</strong> ou na Prefeitura de Porto Nacional/TO informando o Código: <strong>{invoice.verificationCode}</strong>.
              </span>
              <span className="font-mono font-bold text-black">
                Página 1 / 1
              </span>
            </div>
          </div>
        </div>

        {/* Global Print Style for 1 Page A4 */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #danfse-printable-doc, #danfse-printable-doc * {
              visibility: visible;
            }
            #danfse-printable-doc {
              position: fixed;
              left: 0;
              top: 0;
              width: 100vw;
              margin: 0;
              padding: 6mm !important;
              border: 1px solid #000 !important;
              border-radius: 0 !important;
              background: #fff !important;
              color: #000 !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 6mm;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
