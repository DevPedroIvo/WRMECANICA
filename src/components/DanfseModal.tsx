import React from 'react'
import { ServiceOrder, FiscalSettings } from '../types'
import { Printer, Download, Share2, X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react'

interface DanfseModalProps {
  order: ServiceOrder
  settings: FiscalSettings
  onClose: () => void
}

export const DanfseModal: React.FC<DanfseModalProps> = ({ order, settings, onClose }) => {
  const invoice = order.fiscalInvoice

  if (!invoice) return null

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  }

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
        <Discriminacao>${order.items.map(it => `${it.serviceDescription} (M.O: R$ ${it.laborCost.toFixed(2)})`).join(' | ')} - Veículo: ${order.vehicleModel} Placa: ${order.vehiclePlate} KM: ${order.mileage}</Discriminacao>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`

    const blob = new Blob([xmlContent], { type: 'application/xml' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `NFS-e_${invoice.invoiceNumber}.xml`
    link.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md select-none">
      <div className="relative w-full max-w-3xl rounded-3xl border border-[#262626] bg-[#121316] p-6 shadow-2xl space-y-5 max-h-[95vh] overflow-y-auto text-xs">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-[#FFFFFF] text-sm flex items-center gap-2">
                Documento Fiscal com Validade Jurídica (NFS-e)
                <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold">AUTORIZADA</span>
              </h3>
              <p className="text-[11px] text-[#A5A5A5]">
                Padrão Nacional de Nota Fiscal de Serviços Eletrônica • Lei Complementar 116/2003
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl bg-[#202020] border border-[#262626] px-3 py-1.5 font-bold text-[#FFFFFF] hover:border-[#FF8500] transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-[#FF8500]" /> Imprimir DANFSE
            </button>
            <button
              onClick={handleDownloadXml}
              className="flex items-center gap-1.5 rounded-xl bg-[#202020] border border-[#262626] px-3 py-1.5 font-bold text-[#FFFFFF] hover:border-[#FF8500] transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-[#FF8500]" /> Baixar XML
            </button>
            <button onClick={onClose} className="rounded-full p-1.5 text-[#A5A5A5] hover:text-[#FFFFFF]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* --- OFFICIAL DANFSE PAPER PREVIEW --- */}
        <div id="danfse-print" className="rounded-2xl border-2 border-[#262626] bg-[#090a0d] p-6 space-y-4 text-[#FFFFFF] font-sans">
          
          {/* Header oficial da Prefeitura / Receita Municipal */}
          <div className="flex items-start justify-between border-b-2 border-[#262626] pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-[#FF8500] uppercase font-bold block">
                REPÚBLICA FEDERATIVA DO BRASIL • ESTADO DO TOCANTINS
              </span>
              <h2 className="text-base font-black text-[#FFFFFF]">PREFEITURA MUNICIPAL DE PALMAS</h2>
              <p className="text-[11px] text-[#A5A5A5]">Secretaria Municipal de Finanças • Diretoria da Receita</p>
              <p className="text-[11px] font-bold text-[#E5A51B]">
                NOTA FISCAL DE SERVIÇOS ELETRÔNICA — NFS-e
              </p>
            </div>

            <div className="text-right space-y-0.5 border-l-2 border-[#262626] pl-5">
              <span className="text-[10px] text-[#A5A5A5] block">NÚMERO DA NOTA</span>
              <span className="text-base font-black text-[#FF8500] font-mono block">{invoice.invoiceNumber}</span>
              <span className="text-[10px] text-[#A5A5A5] block">Data e Hora de Emissão</span>
              <span className="text-[11px] font-mono font-bold text-[#FFFFFF] block">{invoice.issuedAt}</span>
              <span className="text-[10px] text-[#A5A5A5] block">Cód. Verificação Autenticidade</span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 block">{invoice.verificationCode}</span>
            </div>
          </div>

          {/* Dados do Prestador de Serviços */}
          <div className="rounded-xl bg-[#151515] p-3.5 border border-[#262626] space-y-1 text-[11px]">
            <span className="text-[10px] font-bold text-[#FF8500] uppercase tracking-wider block">
              PRESTADOR DE SERVIÇOS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-bold text-[#FFFFFF] text-xs">{settings.companyName}</p>
                <p className="text-[#A5A5A5]">Nome Fantasia: {settings.tradeName}</p>
                <p className="text-[#A5A5A5]">CNPJ: {settings.cnpj} • Inscrição Municipal: {settings.cityRegistration}</p>
              </div>
              <div className="text-right">
                <p className="text-[#A5A5A5]">{settings.tradeName} Matriz</p>
                <p className="text-[#A5A5A5]">Av. Teotônio Segurado, 1200 - Palmas/TO - CEP 77015-000</p>
                <p className="text-[#A5A5A5]">Telefone: (63) 99234-5678 • Regime: {invoice.taxRegime}</p>
              </div>
            </div>
          </div>

          {/* Dados do Tomador de Serviços (Cliente) */}
          <div className="rounded-xl bg-[#151515] p-3.5 border border-[#262626] space-y-1 text-[11px]">
            <span className="text-[10px] font-bold text-[#FF8500] uppercase tracking-wider block">
              TOMADOR DE SERVIÇOS (CLIENTE)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-bold text-[#FFFFFF] text-xs">{order.clientName}</p>
                <p className="text-[#A5A5A5] font-mono">CPF/CNPJ: {order.clientCpfCnpj || '482.910.458-20'}</p>
                <p className="text-[#A5A5A5]">Telefone: {order.clientPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-[#A5A5A5]">Endereço: {order.clientAddress || 'Palmas/TO'}</p>
                <p className="text-[#A5A5A5]">E-mail: {order.clientEmail || 'cliente@email.com'}</p>
              </div>
            </div>
          </div>

          {/* Dados do Veículo / Objeto do Serviço */}
          <div className="rounded-xl bg-[#1b1d24] p-3 border border-[#262626] flex items-center justify-between text-[11px]">
            <span>Veículo: <strong className="text-[#FFFFFF]">{order.vehicleModel}</strong></span>
            <span>Placa: <strong className="text-[#FF8500] font-mono">{order.vehiclePlate}</strong></span>
            <span>Quilometragem: <strong className="font-mono text-[#FFFFFF]">{Number(order.mileage).toLocaleString('pt-BR')} KM</strong></span>
            <span>RPS: <strong className="font-mono text-[#E5A51B]">{invoice.rpsNumber} (Série {invoice.rpsSeries})</strong></span>
          </div>

          {/* Discriminação dos Serviços */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A5A5] block">
              DISCRIMINAÇÃO DOS SERVIÇOS PRESTADOS
            </span>
            <div className="rounded-xl border border-[#262626] bg-[#151515] p-3 text-[11px] space-y-2">
              <p className="text-[#FFFFFF] leading-relaxed">
                {order.items.map((it, idx) => (
                  <span key={it.id} className="block py-0.5">
                    • <strong>{it.serviceDescription}</strong> — Mão de Obra de Reparação Automotiva: {formatCurrency(it.laborCost)}
                    {it.partsCost > 0 && <span className="text-[#A5A5A5]"> (Peças aplicadas: {formatCurrency(it.partsCost)})</span>}
                  </span>
                ))}
              </p>
              <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-[10px] text-[#A5A5A5]">
                <span>CNAE: <strong className="text-[#FFFFFF]">{invoice.cnae}</strong> (Manutenção Mecânica de Veículos Automotores)</span>
                <span>Código do Serviço (LC 116/2003): <strong className="text-[#FFFFFF]">{invoice.serviceCode}</strong></span>
              </div>
            </div>
          </div>

          {/* Tabela de Tributos e Valores da NFS-e */}
          <div className="rounded-xl border border-[#262626] overflow-hidden text-xs">
            <div className="grid grid-cols-4 bg-[#202020] text-[#A5A5A5] p-2.5 font-bold text-center border-b border-[#262626]">
              <div>Valor dos Serviços</div>
              <div>Base de Cálculo</div>
              <div>Alíquota ISS</div>
              <div className="text-emerald-400">Valor do ISS Devido</div>
            </div>
            <div className="grid grid-cols-4 bg-[#151515] text-[#FFFFFF] p-3 text-center font-mono font-bold">
              <div>{formatCurrency(order.laborTotal)}</div>
              <div>{formatCurrency(order.laborTotal)}</div>
              <div>{invoice.issRate.toFixed(2)}%</div>
              <div className="text-emerald-400">{formatCurrency(invoice.issValue)}</div>
            </div>
          </div>

          {/* Resumo Final de Valores */}
          <div className="rounded-xl bg-[#1b1d24] p-3.5 border border-[#FF8500]/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#A5A5A5] block">VALOR LÍQUIDO DA NOTA FISCAL DE SERVIÇOS</span>
              <span className="text-xs text-[#A5A5A5] font-semibold">Tributação: Simples Nacional • Mão de Obra Mecânica</span>
            </div>
            <span className="text-xl font-black text-[#FF8500] font-mono">
              {formatCurrency(order.laborTotal)}
            </span>
          </div>

          {/* Validação e Protocolo da Prefeitura */}
          <div className="rounded-xl bg-[#151515] p-3 border border-[#262626] text-[10px] text-[#A5A5A5] space-y-1">
            <div className="flex items-center justify-between">
              <span>Chave de Acesso: <strong className="font-mono text-[#FFFFFF]">{invoice.accessKey}</strong></span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Protocolo Autorizado: {invoice.protocolNumber}
              </span>
            </div>
            <p>
              Documento emitido por ME ou EPP optante pelo Simples Nacional. Não gera direito a crédito fiscal de IPI.
              Autenticidade e validade fiscal podem ser verificadas pelo portal oficial da Prefeitura ou apontando a câmera para o QR Code fiscal.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#262626] bg-[#202020] px-6 py-2.5 text-xs font-semibold text-[#A5A5A5] hover:text-[#FFFFFF]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
