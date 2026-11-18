import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Settings,
  Building,
  RotateCcw,
  Save,
  Check,
  ShieldCheck,
  FileText,
  Printer,
  Sparkles,
  ClipboardCheck,
  Award,
  KeyRound,
  FileCheck2,
  AlertCircle
} from 'lucide-react'

export const SettingsView: React.FC = () => {
  const { fiscalSettings, updateFiscalSettings, resetDataToDefault, formatCurrency } = useApp()
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Local state initialized with context / defaults
  const [companyName, setCompanyName] = useState(fiscalSettings.companyName)
  const [tradeName, setTradeName] = useState(fiscalSettings.tradeName)
  const [cnpj, setCnpj] = useState(fiscalSettings.cnpj)
  const [cityRegistration, setCityRegistration] = useState(fiscalSettings.cityRegistration)
  const [stateRegistration, setStateRegistration] = useState(fiscalSettings.stateRegistration)
  const [phone, setPhone] = useState('(63) 99234-5678')
  const [address, setAddress] = useState('Av. Teotônio Segurado, 1200 - Palmas/TO')
  const [taxRegime, setTaxRegime] = useState(fiscalSettings.taxRegime)
  const [cnae, setCnae] = useState(fiscalSettings.cnae)
  const [serviceCode, setServiceCode] = useState(fiscalSettings.serviceCode)
  const [issRate, setIssRate] = useState(fiscalSettings.issRate.toString())
  const [environment, setEnvironment] = useState(fiscalSettings.environment)
  const [cityCodeIBGE, setCityCodeIBGE] = useState(fiscalSettings.cityCodeIBGE)
  const [warrantyText, setWarrantyText] = useState('Garantia legal de 90 dias conforme Artigo 26 do Código de Defesa do Consumidor (CDC) para serviços executados e garantia do fabricante para peças novas.')
  const [whatsappTemplate, setWhatsappTemplate] = useState('Olá {CLIENTE}! Sua Ordem de Serviço na WR Mecânica & Cia está pronta. Segue imagem com detalhamento completo dos serviços!')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateFiscalSettings({
      companyName,
      tradeName,
      cnpj,
      cityRegistration,
      stateRegistration,
      taxRegime: taxRegime as any,
      cnae,
      serviceCode,
      issRate: parseFloat(issRate) || 2.5,
      environment: environment as any,
      cityCodeIBGE
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 pb-12 max-w-[1440px] mx-auto select-none">
      <div>
        <h2 className="text-xl font-bold text-[#FFFFFF] flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#FF8500]" strokeWidth={1.75} />
          Configurações da Oficina &amp; Validade Fiscal (NFS-e)
        </h2>
        <p className="text-xs text-[#A5A5A5] mt-0.5">
          Gerenciamento cadastral da oficina mecânica, parâmetros fiscais municipais/SEFAZ (LC 116 e CNAE) e modelo de Ordem de Serviço
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Formulário de Configurações (6 cols) */}
        <div className="col-span-6 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Card 1: Dados da Oficina */}
            <div className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-6 shadow-xl space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF8500] flex items-center gap-2 border-b border-[#262626] pb-3">
                <Building className="h-4 w-4" strokeWidth={1.75} /> Dados Cadastrais da Empresa
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={e => setTradeName(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    Razão Social Oficial
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    Inscrição Municipal (IM)
                  </label>
                  <input
                    type="text"
                    value={cityRegistration}
                    onChange={e => setCityRegistration(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    Inscrição Estadual (IE)
                  </label>
                  <input
                    type="text"
                    value={stateRegistration}
                    onChange={e => setStateRegistration(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    WhatsApp Comercial
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    Cód. IBGE Município
                  </label>
                  <input
                    type="text"
                    value={cityCodeIBGE}
                    onChange={e => setCityCodeIBGE(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A5A5A5] font-semibold mb-1">
                  Endereço da Oficina
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                />
              </div>
            </div>

            {/* Card 2: Parâmetros Fiscais (NFS-e / SEFAZ) */}
            <div className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-6 shadow-xl space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E5A51B] flex items-center justify-between border-b border-[#262626] pb-3">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#E5A51B]" strokeWidth={1.75} />
                  Parâmetros de Validade Fiscal (NFS-e / LC 116)
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  Certificado A1 Válido
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    Regime Tributário
                  </label>
                  <select
                    value={taxRegime}
                    onChange={e => setTaxRegime(e.target.value as any)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  >
                    <option value="simples_nacional">Simples Nacional (ME / EPP)</option>
                    <option value="lucro_presumido">Lucro Presumido</option>
                    <option value="lucro_real">Lucro Real</option>
                    <option value="mei">Microempreendedor Individual (MEI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    Ambiente de Transmissão
                  </label>
                  <select
                    value={environment}
                    onChange={e => setEnvironment(e.target.value as any)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  >
                    <option value="producao">Produção (Validade Jurídica Real)</option>
                    <option value="homologacao">Homologação (Ambiente de Testes)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    Código LC 116/2003
                  </label>
                  <input
                    type="text"
                    value={serviceCode}
                    onChange={e => setServiceCode(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                    placeholder="14.01"
                  />
                  <span className="text-[9px] text-[#A5A5A5] block mt-0.5">14.01 - Reparação de Veículos</span>
                </div>

                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    CNAE Principal
                  </label>
                  <input
                    type="text"
                    value={cnae}
                    onChange={e => setCnae(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                    placeholder="4520-0/01"
                  />
                  <span className="text-[9px] text-[#A5A5A5] block mt-0.5">4520-0/01 - Manutenção Mecânica</span>
                </div>

                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    Alíquota ISS (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={issRate}
                    onChange={e => setIssRate(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                  />
                  <span className="text-[9px] text-[#A5A5A5] block mt-0.5">Retenção de ISS Municipal</span>
                </div>
              </div>

              {/* Status Certificado Digital */}
              <div className="rounded-xl border border-[#262626] bg-[#202020] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#FFFFFF] block">
                      {fiscalSettings.certificateName}
                    </span>
                    <span className="text-[10px] text-[#A5A5A5]">
                      Assinatura XML ICP-Brasil A1 • Vencimento: {fiscalSettings.certificateExpiry}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  CONECTADO
                </span>
              </div>
            </div>

            {/* Card 3: Garantia CDC & WhatsApp */}
            <div className="rounded-2xl border border-[#262626] bg-[#151515]/90 backdrop-blur-md p-6 shadow-xl space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF8500] flex items-center gap-2 border-b border-[#262626] pb-3">
                <Award className="h-4 w-4" strokeWidth={1.75} /> Termos de Garantia (Art. 26 CDC) &amp; Mensagens
              </h3>

              <div>
                <label className="block text-[#A5A5A5] font-semibold mb-1">
                  Termo de Garantia Legal Automotiva (90 Dias)
                </label>
                <textarea
                  rows={2}
                  value={warrantyText}
                  onChange={e => setWarrantyText(e.target.value)}
                  className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A5A5A5] font-semibold mb-1">
                  Mensagem Automática para Envio de Imagem no WhatsApp
                </label>
                <textarea
                  rows={2}
                  value={whatsappTemplate}
                  onChange={e => setWhatsappTemplate(e.target.value)}
                  className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] px-5 py-2.5 text-xs font-bold text-[#080808] transition-colors shadow-sm"
                >
                  <Save className="h-4 w-4" strokeWidth={2} />
                  Salvar Todas as Configurações
                </button>

                {savedSuccess && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Check className="h-4 w-4" /> Configurações fiscais e cadastrais salvas!
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* Reset Demo Card */}
          <div className="rounded-2xl border border-rose-500/20 bg-[#151515]/90 p-5 shadow-xl space-y-2 text-xs">
            <h4 className="font-bold text-rose-400 flex items-center gap-2">
              <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Restaurar Demonstração do Sistema
            </h4>
            <p className="text-[11px] text-[#A5A5A5]">
              Restaura ordens de serviço, clientes, agendamentos, estoque e parâmetros fiscais aos padrões originais.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Deseja realmente restaurar os dados de demonstração da oficina?')) {
                  resetDataToDefault()
                  alert('Dados padrão restaurados com sucesso!')
                }
              }}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-black transition-colors"
            >
              Restaurar Dados da Oficina
            </button>
          </div>
        </div>

        {/* Live Preview da Ordem de Serviço (6 cols) */}
        <div className="col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF8500] flex items-center gap-2">
              <FileText className="h-4 w-4" /> Preview da Ordem de Serviço (Em Tempo Real)
            </span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-[#262626] bg-[#151515] px-3 py-1.5 text-xs font-semibold text-[#FFFFFF] hover:border-[#FF8500] transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-[#FF8500]" /> Testar Impressão
            </button>
          </div>

          {/* DOCUMENT PREVIEW CONTAINER */}
          <div className="rounded-2xl border border-[#262626] bg-[#0a0b0e] p-6 shadow-2xl space-y-4 text-xs">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#262626] pb-3">
              <div>
                <h3 className="text-base font-black text-[#E5A51B] uppercase tracking-wide">{tradeName}</h3>
                <p className="text-[10px] text-[#FF8500] font-semibold">{companyName}</p>
                <p className="text-[9px] text-[#A5A5A5] mt-0.5">CNPJ: {cnpj} • IM: {cityRegistration} • IE: {stateRegistration}</p>
                <p className="text-[9px] text-[#A5A5A5]">{address} • Tel: {phone}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-[#FF8500] block">OS #1024</span>
                <span className="text-[10px] text-[#A5A5A5] block">15/11/2025</span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 inline-block mt-1">EM ANDAMENTO</span>
              </div>
            </div>

            {/* Client & Car box */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#151515] p-3 border border-[#262626] text-[11px]">
              <div>
                <span className="text-[9px] font-bold uppercase text-[#FF8500] block">Cliente</span>
                <p className="font-bold text-[#FFFFFF]">Marcos Oliveira</p>
                <p className="text-[#A5A5A5]">(63) 99234-5678 • CPF: 482.910.458-20</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-[#FF8500] block">Veículo</span>
                <p className="font-bold text-[#FFFFFF]">Honda Civic Touring 1.5 Turbo</p>
                <p className="text-[#A5A5A5] font-mono">Placa: QWE1A23 • 48.500 km</p>
              </div>
            </div>

            {/* Combustível, Pneus e Mecânico */}
            <div className="flex items-center justify-between rounded-xl bg-[#151515] p-2.5 border border-[#262626] text-[10px]">
              <span>Combustível: <strong className="text-amber-400 uppercase font-mono">Médio</strong></span>
              <span>Pneus: <strong className="text-emerald-400 uppercase font-mono">Verificados (Bom)</strong></span>
              <span>Mecânico: <strong className="text-[#FFFFFF]">Roberto Silva</strong></span>
            </div>

            {/* Checklist de Entrada Estruturado (Sem fotos para economizar Supabase) */}
            <div className="rounded-xl bg-[#151515] p-3 border border-[#262626] space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF8500] flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5 text-[#FF8500]" /> Checklist de Entrada Estruturado do Veículo (100% Digital)
              </span>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-[#A5A5A5]">
                <span className="text-emerald-400">✓ Estepe &amp; Macaco OK</span>
                <span className="text-emerald-400">✓ Chave de Roda &amp; Triângulo OK</span>
                <span className="text-emerald-400">✓ Documentos &amp; Luzes OK</span>
              </div>
              <p className="text-[9px] text-[#A5A5A5]">Avarias: 1 pequeno risco no para-choque dianteiro direito.</p>
            </div>

            {/* Tabela de Serviços Modelo */}
            <div className="rounded-xl border border-[#262626] overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#151515] text-[#A5A5A5] border-b border-[#262626]">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Serviço / Manutenção</th>
                    <th className="py-2 px-3 font-semibold text-right">Peças</th>
                    <th className="py-2 px-3 font-semibold text-right">M. Obra</th>
                    <th className="py-2 px-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626] text-[#FFFFFF]">
                  <tr>
                    <td className="py-2 px-3">
                      <div>Troca de pastilhas de freio dianteiras</div>
                      <span className="text-[9px] text-[#A5A5A5] font-mono">LC 116: 14.01 • CNAE: 4520-0/01</span>
                    </td>
                    <td className="py-2 px-3 font-mono text-right text-[#A5A5A5]">R$ 185,00</td>
                    <td className="py-2 px-3 font-mono text-right text-[#A5A5A5]">R$ 150,00</td>
                    <td className="py-2 px-3 font-mono text-right text-emerald-400 font-bold">R$ 335,00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">
                      <div>Sangria de fluido DOT 4 e alinhamento</div>
                      <span className="text-[9px] text-[#A5A5A5] font-mono">LC 116: 14.01 • CNAE: 4520-0/01</span>
                    </td>
                    <td className="py-2 px-3 font-mono text-right text-[#A5A5A5]">R$ 90,00</td>
                    <td className="py-2 px-3 font-mono text-right text-[#A5A5A5]">R$ 120,00</td>
                    <td className="py-2 px-3 font-mono text-right text-emerald-400 font-bold">R$ 210,00</td>
                  </tr>
                </tbody>
                <tfoot className="bg-[#151515] border-t border-[#262626] font-bold">
                  <tr>
                    <td className="py-2 px-3 text-[#FF8500]">TOTAL DA OS</td>
                    <td className="py-2 px-3 font-mono text-right text-[#FFFFFF]">R$ 275,00</td>
                    <td className="py-2 px-3 font-mono text-right text-[#FFFFFF]">R$ 270,00</td>
                    <td className="py-2 px-3 font-mono text-right text-sm text-[#FF8500] font-black">R$ 545,00</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Selo de Validade Fiscal NFS-e */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
                  NFS-e Emitida — Documento Fiscal com Validade Jurídica
                </span>
                <span className="font-mono text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Nº 20250001024
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-[#A5A5A5] pt-1">
                <span>Cód. Verificação: W8R9-2B7A-44C1</span>
                <span className="text-right">ISS ({issRate}%): R$ 6,75</span>
                <span>Regime: Simples Nacional</span>
                <span className="text-right text-emerald-400 font-bold">Chave: 172100034892124000190...</span>
              </div>
            </div>

            {/* Garantia CDC */}
            <div className="rounded-xl bg-[#151515] p-2.5 border border-[#262626] text-[9px] text-[#A5A5A5]">
              <p><strong>Garantia Legal (Art. 26 CDC):</strong> {warrantyText}</p>
            </div>

            {/* Assinaturas */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#262626] text-center text-[9px] text-[#A5A5A5]">
              <div className="border-t border-[#383838] pt-1">
                <span>Assinatura do Cliente</span>
              </div>
              <div className="border-t border-[#383838] pt-1">
                <span>{tradeName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
