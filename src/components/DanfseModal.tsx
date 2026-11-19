import React from 'react'
import { ServiceOrder, FiscalSettings } from '../types'
import { Printer, Download, X, CheckCircle2, ShieldCheck, ExternalLink, QrCode } from 'lucide-react'

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

  // Download do XML com validade jurídica (ABRASF 2.04 / Padrão Nacional)
  const handleDownloadXml = () => {
    const xmlContent = invoice.xmlData || `<?xml version="1.0" encoding="UTF-8"?>
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
          .join(' | ')} - Veículo: ${order.vehicleModel} Placa: ${order.vehiclePlate} KM: ${order.mileage}</Discriminacao>
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

  const verificationUrl = invoice.danfseUrl || `https://portonacional.to.gov.br/nfse/consulta?codigo=${invoice.verificationCode}`

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
                NFS-e (DANFSE Oficial)
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                  AUTORIZADA • VALIDADE FISCAL
                </span>
              </h3>
              <p className="text-[11px] text-wr-muted">
                Porto Nacional / Luzimangues - TO • LC 116/2003 (Item 14.01) • Padrão Nacional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="wr-btn-secondary px-3 py-1.5">
              <Printer className="h-3.5 w-3.5 text-wr-orange" /> Imprimir DANFSE
            </button>
            <button onClick={handleDownloadXml} className="wr-btn-secondary px-3 py-1.5">
              <Download className="h-3.5 w-3.5 text-wr-orange" /> Baixar XML Oficial
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-wr-muted hover:text-wr-text">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document (DANFSE) */}
        <div className="rounded-2xl border border-wr-border bg-wr-elevated p-6 space-y-4 text-wr-text">
          {/* Header Municipal Oficial */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-wr-border pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider text-wr-orange uppercase font-bold block">
                REPÚBLICA FEDERATIVA DO BRASIL • ESTADO DO TOCANTINS
              </span>
              <h2 className="text-base font-black text-wr-text uppercase tracking-tight">
                PREFEITURA MUNICIPAL DE PORTO NACIONAL
              </h2>
              <p className="text-[11px] font-bold text-wr-gold">
                SECRETARIA MUNICIPAL DA FAZENDA • DISTRITO DE LUZIMANGUES
              </p>
              <p className="text-[10px] text-wr-muted font-mono">
                CÓDIGO MUNICIPAL IBGE: {settings.cityCodeIBGE || '1718204'} • NOTA FISCAL DE SERVIÇOS ELETRÔNICA (NFS-e)
              </p>
            </div>

            <div className="text-right space-y-0.5 bg-wr-surface p-3 rounded-xl border border-wr-border">
              <span className="text-[9px] font-bold text-wr-muted uppercase block">Número da NFS-e</span>
              <span className="text-lg font-black text-wr-orange font-mono block">
                {invoice.invoiceNumber}
              </span>
              <span className="text-[10px] font-mono text-wr-muted block">{invoice.issuedAt}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                Cód: {invoice.verificationCode}
              </span>
            </div>
          </div>

          {/* Prestador e Tomador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl bg-wr-surface p-3.5 border border-wr-border space-y-1">
              <span className="text-[10px] font-bold text-wr-orange uppercase block">Prestador de Serviços</span>
              <p className="font-bold text-wr-text">{settings.companyName}</p>
              <p className="text-wr-muted font-semibold text-[10px]">{settings.tradeName}</p>
              <p className="text-wr-muted font-mono text-[10px]">
                CNPJ: {settings.cnpj} • IM: {settings.cityRegistration} • IE: {settings.stateRegistration}
              </p>
              <p className="text-wr-muted text-[10px]">
                {settings.address || 'Rodovia TO-080, KM 12 - Distrito de Luzimangues, Porto Nacional/TO, CEP 77500-000'}
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                Regime: {invoice.taxRegime} • CNAE: {invoice.cnae}
              </p>
            </div>

            <div className="rounded-xl bg-wr-surface p-3.5 border border-wr-border space-y-1">
              <span className="text-[10px] font-bold text-wr-orange uppercase block">Tomador de Serviços (Cliente)</span>
              <p className="font-bold text-wr-text">{order.clientName}</p>
              <p className="text-wr-muted font-mono text-[10px]">CPF/CNPJ: {order.clientCpfCnpj || 'Não informado'}</p>
              <p className="text-wr-muted text-[10px]">{order.clientAddress || 'Luzimangues, Porto Nacional/TO'}</p>
              <p className="text-wr-muted text-[10px]">Telefone: {order.clientPhone}</p>
            </div>
          </div>

          {/* Dados do Veículo e RPS */}
          <div className="rounded-xl bg-wr-surface p-3 border border-wr-border flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span>
              Veículo: <strong className="text-wr-text">{order.vehicleModel}</strong>
            </span>
            <span>
              Placa: <strong className="text-wr-orange font-mono">{order.vehiclePlate}</strong>
            </span>
            <span>
              Quilometragem: <strong className="font-mono">{Number(order.mileage).toLocaleString('pt-BR')} km</strong>
            </span>
            <span>
              RPS: <strong className="font-mono text-wr-gold">{invoice.rpsNumber} (Série {invoice.rpsSeries})</strong>
            </span>
          </div>

          {/* Discriminação de Serviços */}
          <div className="rounded-xl bg-wr-surface p-3.5 border border-wr-border space-y-1.5 text-[11px]">
            <span className="text-[10px] font-bold text-wr-orange uppercase block">
              Discriminação dos Serviços Prestados — Item LC 116: {invoice.serviceCode} (CNAE: {invoice.cnae})
            </span>
            <p className="text-wr-text font-medium leading-relaxed">
              {order.serviceDescription}
            </p>
            {order.items && order.items.length > 0 && (
              <div className="pt-2 border-t border-wr-border space-y-1 text-[10px] text-wr-muted">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>• {it.serviceDescription}</span>
                    <span className="font-mono text-wr-text">M.O: {formatCurrency(it.laborCost)} | Peças: {formatCurrency(it.partsCost)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabela de Cálculo do ISS Municipal de Porto Nacional */}
          <div className="rounded-xl border border-wr-border overflow-hidden bg-wr-surface">
            <div className="grid grid-cols-5 bg-wr-elevated text-wr-muted p-2.5 font-bold text-center border-b border-wr-border text-[10px]">
              <div>Total Serviços</div>
              <div>Total Peças</div>
              <div>Base de Cálculo ISS</div>
              <div>Alíquota ISS (Porto Nac.)</div>
              <div className="text-emerald-600 dark:text-emerald-400">Valor do ISS</div>
            </div>
            <div className="grid grid-cols-5 p-3 text-center font-mono font-bold text-[11px]">
              <div>{formatCurrency(order.laborTotal)}</div>
              <div className="text-wr-muted">{formatCurrency(order.partsTotal)}</div>
              <div>{formatCurrency(order.laborTotal)}</div>
              <div className="text-wr-orange">{invoice.issRate.toFixed(2)}%</div>
              <div className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(invoice.issValue)}
              </div>
            </div>
          </div>

          {/* Rodapé com Chave de Acesso e Protocolo */}
          <div className="rounded-xl bg-wr-surface p-3.5 border border-wr-border space-y-2 text-[10px] text-wr-muted">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="block font-bold text-wr-text">CHAVE DE ACESSO NACIONAL DA NFS-e:</span>
                <span className="font-mono text-xs text-wr-orange tracking-wider break-all block">
                  {invoice.accessKey}
                </span>
              </div>
              <div className="text-right">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Protocolo: {invoice.protocolNumber}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-wr-border flex flex-wrap items-center justify-between gap-2">
              <span className="text-[9px]">
                Consulte a autenticidade deste documento acessando o portal oficial da Prefeitura de Porto Nacional ou o Emissor Nacional gov.br/nfse com o código de verificação <strong>{invoice.verificationCode}</strong>.
              </span>
              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-wr-orange hover:underline text-[10px]"
              >
                <ExternalLink className="h-3 w-3" /> Consultar no Portal Oficial
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
