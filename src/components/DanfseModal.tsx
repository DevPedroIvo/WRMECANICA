import React from 'react'
import { ServiceOrder, FiscalSettings } from '../types'
import { Printer, Download, X, CheckCircle2, ShieldCheck } from 'lucide-react'

interface DanfseModalProps {
  order: ServiceOrder
  settings: FiscalSettings
  onClose: () => void
}

export const DanfseModal: React.FC<DanfseModalProps> = ({ order, settings, onClose }) => {
  const invoice = order.fiscalInvoice
  if (!invoice) return null

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  // XML gerado sob demanda no navegador — zero peso armazenado no Supabase
  const handleDownloadXml = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="2.03">
    <InfNfse Id="NFSE${invoice.invoiceNumber}">
      <Numero>${invoice.invoiceNumber}</Numero>
      <CodigoVerificacao>${invoice.verificationCode}</CodigoVerificacao>
      <DataEmissao>${invoice.issuedAt}</DataEmissao>
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
          <BaseCalculo>${order.laborTotal.toFixed(2)}</BaseCalculo>
          <Aliquota>${(settings.issRate / 100).toFixed(4)}</Aliquota>
          <ValorIss>${invoice.issValue.toFixed(2)}</ValorIss>
          <ValorLiquidoNfse>${order.laborTotal.toFixed(2)}</ValorLiquidoNfse>
        </Valores>
        <ItemListaServico>${invoice.serviceCode}</ItemListaServico>
        <CodigoCnae>${invoice.cnae.replace(/\D/g, '')}</CodigoCnae>
        <Discriminacao>${order.items
          .map(it => `${it.serviceDescription} (M.O: R$ ${it.laborCost.toFixed(2)})`)
          .join(' | ')} - Veículo: ${order.vehicleModel} Placa: ${order.vehiclePlate} KM: ${order.mileage}</Discriminacao>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`

    const blob = new Blob([xmlContent], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `NFS-e_${invoice.invoiceNumber}.xml`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="wr-modal-backdrop select-none">
      <div className="wr-modal-panel max-w-3xl space-y-5 text-xs animate-fadeIn">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-wr-border no-print">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-wr-text text-sm flex items-center gap-2">
                NFS-e (DANFSE)
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                  AUTORIZADA
                </span>
              </h3>
              <p className="text-[11px] text-wr-muted">
                Nota Fiscal de Serviços Eletrônica • LC 116/2003
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="wr-btn-secondary px-3 py-1.5">
              <Printer className="h-3.5 w-3.5 text-wr-orange" /> Imprimir
            </button>
            <button onClick={handleDownloadXml} className="wr-btn-secondary px-3 py-1.5">
              <Download className="h-3.5 w-3.5 text-wr-orange" /> XML
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-wr-muted hover:text-wr-text">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document */}
        <div className="rounded-2xl border border-wr-border bg-wr-elevated p-5 space-y-4 text-wr-text">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-wr-border pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono tracking-wider text-wr-orange uppercase font-bold block">
                REPÚBLICA FEDERATIVA DO BRASIL
              </span>
              <h2 className="text-base font-black text-wr-text">PREFEITURA MUNICIPAL DE PALMAS</h2>
              <p className="text-[11px] font-bold text-wr-gold">
                NOTA FISCAL DE SERVIÇOS ELETRÔNICA — NFS-e
              </p>
            </div>

            <div className="text-right space-y-0.5">
              <span className="text-[10px] text-wr-muted block">NÚMERO DA NOTA</span>
              <span className="text-base font-black text-wr-orange font-mono block">
                {invoice.invoiceNumber}
              </span>
              <span className="text-[11px] font-mono text-wr-muted block">{invoice.issuedAt}</span>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                Cód: {invoice.verificationCode}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl bg-wr-surface p-3.5 border border-wr-border space-y-0.5">
              <span className="text-[10px] font-bold text-wr-orange uppercase block">Prestador</span>
              <p className="font-bold text-wr-text">{settings.companyName}</p>
              <p className="text-wr-muted">CNPJ: {settings.cnpj} • IM: {settings.cityRegistration}</p>
              <p className="text-wr-muted">Regime: {invoice.taxRegime}</p>
            </div>

            <div className="rounded-xl bg-wr-surface p-3.5 border border-wr-border space-y-0.5">
              <span className="text-[10px] font-bold text-wr-orange uppercase block">Tomador (Cliente)</span>
              <p className="font-bold text-wr-text">{order.clientName}</p>
              <p className="text-wr-muted font-mono">CPF/CNPJ: {order.clientCpfCnpj || 'Não informado'}</p>
              <p className="text-wr-muted">{order.clientPhone}</p>
            </div>
          </div>

          <div className="rounded-xl bg-wr-surface p-3 border border-wr-border flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span>
              Veículo: <strong>{order.vehicleModel}</strong>
            </span>
            <span>
              Placa: <strong className="text-wr-orange font-mono">{order.vehiclePlate}</strong>
            </span>
            <span>
              KM: <strong className="font-mono">{Number(order.mileage).toLocaleString('pt-BR')}</strong>
            </span>
            <span>
              RPS: <strong className="font-mono text-wr-gold">{invoice.rpsNumber}</strong>
            </span>
          </div>

          <div className="rounded-xl border border-wr-border overflow-hidden bg-wr-surface">
            <div className="grid grid-cols-4 bg-wr-elevated text-wr-muted p-2.5 font-bold text-center border-b border-wr-border text-[11px]">
              <div>Serviços</div>
              <div>Base Cálculo</div>
              <div>Alíquota ISS</div>
              <div className="text-emerald-600 dark:text-emerald-400">ISS Devido</div>
            </div>
            <div className="grid grid-cols-4 p-3 text-center font-mono font-bold">
              <div>{formatCurrency(order.laborTotal)}</div>
              <div>{formatCurrency(order.laborTotal)}</div>
              <div>{invoice.issRate.toFixed(2)}%</div>
              <div className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(invoice.issValue)}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-wr-surface p-3 border border-wr-border text-[10px] text-wr-muted flex flex-wrap items-center justify-between gap-2">
            <span>
              Chave: <strong className="font-mono text-wr-text">{invoice.accessKey}</strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Protocolo: {invoice.protocolNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
