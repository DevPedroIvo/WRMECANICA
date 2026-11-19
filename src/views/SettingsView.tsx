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
  ClipboardCheck,
  Database,
  Sun,
  Moon,
  MapPin,
  Trash2,
  Sparkles,
  FileCheck2,
} from 'lucide-react'

export const SettingsView: React.FC = () => {
  const {
    theme,
    toggleTheme,
    fiscalSettings,
    updateFiscalSettings,
    clearAllData,
    loadDemoData,
    showToast,
  } = useApp()

  const [savedSuccess, setSavedSuccess] = useState(false)

  const [companyName, setCompanyName] = useState(fiscalSettings.companyName)
  const [tradeName, setTradeName] = useState(fiscalSettings.tradeName)
  const [cnpj, setCnpj] = useState(fiscalSettings.cnpj)
  const [cityRegistration, setCityRegistration] = useState(fiscalSettings.cityRegistration)
  const [stateRegistration, setStateRegistration] = useState(fiscalSettings.stateRegistration)
  const [phone, setPhone] = useState(fiscalSettings.phone || '(63) 99234-5678')
  const [district, setDistrict] = useState(fiscalSettings.district || 'Luzimangues')
  const [city, setCity] = useState(fiscalSettings.city || 'Porto Nacional')
  const [state, setState] = useState(fiscalSettings.state || 'TO')
  const [address, setAddress] = useState(
    fiscalSettings.address || 'Rodovia TO-080, KM 12 - Distrito de Luzimangues, Porto Nacional - TO'
  )
  const [cep, setCep] = useState(fiscalSettings.cep || '77500-000')
  const [taxRegime, setTaxRegime] = useState(fiscalSettings.taxRegime)
  const [cnae, setCnae] = useState(fiscalSettings.cnae)
  const [serviceCode, setServiceCode] = useState(fiscalSettings.serviceCode)
  const [issRate, setIssRate] = useState(fiscalSettings.issRate.toString())
  const [environment, setEnvironment] = useState(fiscalSettings.environment)
  const [cityCodeIBGE, setCityCodeIBGE] = useState(fiscalSettings.cityCodeIBGE || '1718204')
  const [fiscalProvider, setFiscalProvider] = useState(fiscalSettings.fiscalProvider || 'emissor_nacional')
  const [apiToken, setApiToken] = useState(fiscalSettings.apiToken || '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateFiscalSettings({
      companyName,
      tradeName,
      cnpj,
      cityRegistration,
      stateRegistration,
      phone,
      district,
      city,
      state,
      address,
      cep,
      taxRegime,
      cnae,
      serviceCode,
      issRate: parseFloat(issRate) || 2.5,
      environment,
      cityCodeIBGE,
      fiscalProvider: fiscalProvider as any,
      apiToken,
    })
    setSavedSuccess(true)
    showToast('Configurações fiscais e cadastrais salvas com sucesso!')
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h2 className="text-lg font-bold text-wr-text flex items-center gap-2">
          <Settings className="h-5 w-5 text-wr-orange" />
          Configurações da Oficina &amp; Validade Fiscal (Luzimangues / Porto Nacional - TO)
        </h2>
        <p className="text-xs text-wr-muted mt-0.5">
          Parâmetros cadastrais, alíquota de ISS de Porto Nacional (IBGE 1718204), emissão da NFS-e e tema visual
        </p>
      </div>

      {/* Top Row: Tema Visual da Oficina */}
      <div className="wr-card p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-wr-orange/10 border border-wr-orange/20 text-wr-orange">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-wr-text">
                Aparência do Sistema
              </h3>
              <p className="text-[11px] text-wr-muted mt-0.5">
                Alterne entre o tema escuro automotivo e o tema claro para uso sob luz solar na oficina.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                theme === 'light'
                  ? 'border-wr-orange bg-wr-orange/15 text-wr-orange'
                  : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text'
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Modo Claro</span>
            </button>

            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                theme === 'dark'
                  ? 'border-wr-orange bg-wr-orange/15 text-wr-orange'
                  : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text'
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Modo Escuro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Card 1: Dados Cadastrais */}
            <div className="wr-card p-5 space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-wr-orange flex items-center gap-2 border-b border-wr-border pb-3">
                <Building className="h-4 w-4" /> Dados Cadastrais da Oficina
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={e => setTradeName(e.target.value)}
                    className="wr-input"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Razão Social</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="wr-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Inscrição Municipal (Porto Nac.)</label>
                  <input
                    type="text"
                    value={cityRegistration}
                    onChange={e => setCityRegistration(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Inscrição Estadual (TO)</label>
                  <input
                    type="text"
                    value={stateRegistration}
                    onChange={e => setStateRegistration(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
              </div>

              {/* Endereço e Localização em Luzimangues */}
              <div className="p-3 rounded-xl bg-wr-surface border border-wr-border space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wr-gold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Localização: Distrito de Luzimangues / Porto Nacional - TO
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">Distrito / Bairro</label>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="wr-input font-bold text-wr-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">Município (Porto Nacional)</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="wr-input font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">Cód. IBGE Município</label>
                    <input
                      type="text"
                      value={cityCodeIBGE}
                      onChange={e => setCityCodeIBGE(e.target.value)}
                      className="wr-input font-mono font-bold"
                    />
                    <span className="text-[9px] text-emerald-500 block mt-0.5">1718204 (Porto Nacional - TO)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-wr-muted font-semibold mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="wr-input"
                    />
                  </div>
                  <div>
                    <label className="block text-wr-muted font-semibold mb-1">CEP</label>
                    <input
                      type="text"
                      value={cep}
                      onChange={e => setCep(e.target.value)}
                      className="wr-input font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-wr-muted font-semibold mb-1">WhatsApp Comercial Oficina</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Parâmetros Fiscais (NFS-e Porto Nacional / Luzimangues) */}
            <div className="wr-card p-5 space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-wr-gold flex items-center justify-between border-b border-wr-border pb-3">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Validade Fiscal (NFS-e Municipal / Nacional)
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  Certificado A1 Ativo
                </span>
              </h3>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5" /> Como funciona a Validade Fiscal da sua Oficina:
                </span>
                <p className="text-[10px] text-wr-muted leading-relaxed">
                  As ordens de serviço emitidas nesta oficina geram o <strong>Documento Auxiliar da NFS-e (DANFSE)</strong> e o arquivo <strong>XML oficial no padrão ABRASF 2.04 / Padrão Nacional da Receita Federal</strong>, calculando o ISS de Porto Nacional/TO (Item LC 116: <strong>14.01</strong> / CNAE: <strong>4520-0/01</strong>). Você pode baixar o XML oficial ou transmiti-lo sem custos ao portal municipal.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Regime Tributário</label>
                  <select
                    value={taxRegime}
                    onChange={e => setTaxRegime(e.target.value as typeof taxRegime)}
                    className="wr-input"
                  >
                    <option value="simples_nacional">Simples Nacional (ME / EPP)</option>
                    <option value="lucro_presumido">Lucro Presumido</option>
                    <option value="lucro_real">Lucro Real</option>
                    <option value="mei">Microempreendedor Individual (MEI)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Ambiente de Emissão</label>
                  <select
                    value={environment}
                    onChange={e => setEnvironment(e.target.value as typeof environment)}
                    className="wr-input"
                  >
                    <option value="producao">Produção (Validade Jurídica Real)</option>
                    <option value="homologacao">Homologação (Testes SEFAZ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Item LC 116/2003</label>
                  <input
                    type="text"
                    value={serviceCode}
                    onChange={e => setServiceCode(e.target.value)}
                    className="wr-input font-mono"
                    placeholder="14.01"
                  />
                  <span className="text-[9px] text-wr-muted block mt-0.5">14.01 - Manutenção de Veículos</span>
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">CNAE Principal</label>
                  <input
                    type="text"
                    value={cnae}
                    onChange={e => setCnae(e.target.value)}
                    className="wr-input font-mono"
                    placeholder="4520-0/01"
                  />
                  <span className="text-[9px] text-wr-muted block mt-0.5">4520-0/01 - Mecânica Automotiva</span>
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Alíquota ISS (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={issRate}
                    onChange={e => setIssRate(e.target.value)}
                    className="wr-input font-mono"
                  />
                  <span className="text-[9px] text-wr-muted block mt-0.5">ISS Porto Nacional/TO</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Padrão de Emissão</label>
                  <select
                    value={fiscalProvider}
                    onChange={e => setFiscalProvider(e.target.value as any)}
                    className="wr-input"
                  >
                    <option value="emissor_nacional">Emissor Nacional (gov.br/nfse - Padrão Nacional)</option>
                    <option value="prefeitura_porto_nacional">Portal Contribuinte Porto Nacional</option>
                    <option value="api_direta">API Fiscal Direta (Focus NFe / Nuvem)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Token de API Fiscal (Opcional)</label>
                  <input
                    type="password"
                    value={apiToken}
                    onChange={e => setApiToken(e.target.value)}
                    placeholder="Token de transmissão direta"
                    className="wr-input font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button type="submit" className="wr-btn-primary">
                  <Save className="h-4 w-4" /> Salvar Configurações da Oficina
                </button>
                {savedSuccess && (
                  <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                    <Check className="h-4 w-4" /> Dados Gravados!
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* Gerenciamento da Base de Dados (Zerar / Demo) */}
          <div className="wr-card p-5 space-y-4 text-xs">
            <h4 className="font-bold text-wr-text flex items-center gap-2 border-b border-wr-border pb-3">
              <Database className="h-4 w-4 text-wr-orange" /> Gerenciamento da Base de Dados
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Botão Zerar Sistema */}
              <div className="p-3.5 rounded-xl border border-rose-500/25 bg-rose-500/10 space-y-2">
                <span className="font-bold text-rose-500 flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" /> Zerar Mockups (Sistema Limpo)
                </span>
                <p className="text-[11px] text-wr-muted">
                  Limpa todas as ordens, clientes, veículos, estoque e registros de teste para começar a oficina do zero com dados reais.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja ZERAR todos os dados e começar o sistema 100% limpo para operação real?')) {
                      clearAllData()
                    }
                  }}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                >
                  Zerar Sistema Agora
                </button>
              </div>

              {/* Botão Carregar Demonstração */}
              <div className="p-3.5 rounded-xl border border-wr-border bg-wr-surface space-y-2">
                <span className="font-bold text-wr-gold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Carregar Demonstração
                </span>
                <p className="text-[11px] text-wr-muted">
                  Preenche o sistema com ordens de serviço e clientes fictícios para treinamento ou apresentação.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Deseja carregar dados de demonstração no sistema?')) {
                      loadDemoData()
                    }
                  }}
                  className="wr-btn-secondary px-3 py-1.5 text-xs font-bold text-wr-gold"
                >
                  Carregar Dados de Exemplo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live OS & Fiscal Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Preview da Ordem de Serviço &amp; Carimbo Fiscal
            </span>
            <button onClick={() => window.print()} className="wr-btn-secondary px-3 py-1.5">
              <Printer className="h-3.5 w-3.5 text-wr-orange" /> Testar Impressão
            </button>
          </div>

          <div className="wr-card p-6 space-y-4 text-xs">
            {/* Header da OS */}
            <div className="flex items-start justify-between border-b border-wr-border pb-3">
              <div>
                <h3 className="text-base font-black text-wr-gold uppercase">{tradeName}</h3>
                <p className="text-[10px] text-wr-orange font-semibold">{companyName}</p>
                <p className="text-[10px] text-wr-muted mt-0.5">
                  CNPJ: {cnpj} • IM: {cityRegistration} • IE: {stateRegistration}
                </p>
                <p className="text-[10px] text-wr-muted font-medium">
                  {address} • Tel: {phone}
                </p>
                <p className="text-[9px] text-emerald-500 font-bold mt-0.5">
                  Porto Nacional - TO • Distrito de Luzimangues (IBGE: {cityCodeIBGE})
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-wr-orange block">OS #1024</span>
                <span className="text-[10px] text-wr-muted">Modelo Oficial</span>
              </div>
            </div>

            {/* Selo Fiscal de Porto Nacional */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  NFS-e Porto Nacional / Luzimangues — Validade Fiscal
                </span>
                <span className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Nº 20260000001
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-wr-muted pt-1">
                <span>Cód. Verificação: PRTO-8B7A-44C1</span>
                <span className="text-right">ISS ({issRate}%): R$ 6,75</span>
                <span>LC 116: 14.01 • CNAE: 4520-0/01</span>
                <span className="text-right text-emerald-600 dark:text-emerald-400 font-bold">Chave: 17182042611348...</span>
              </div>
            </div>

            {/* Checklist Visual de Entrada */}
            <div className="wr-surface-muted p-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" /> Checklist de Entrada Estruturado (Inspeção Veicular Digital)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                <span className="text-emerald-600 dark:text-emerald-400">✓ Faróis: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Pintura: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Pneus: Bom</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Vidros: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Lanternas: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Retrovisores: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Estepe &amp; Macaco: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Documentos: OK</span>
              </div>
            </div>

            {/* Tabela de Serviços Modelo */}
            <div className="rounded-xl border border-wr-border overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-wr-elevated text-wr-muted border-b border-wr-border">
                  <tr>
                    <th className="py-2 px-3">Serviço / Manutenção</th>
                    <th className="py-2 px-3 text-right">Peças</th>
                    <th className="py-2 px-3 text-right">M. Obra</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wr-border text-wr-text">
                  <tr>
                    <td className="py-2 px-3">
                      <div>Troca de pastilhas de freio dianteiras</div>
                      <span className="text-[9px] text-wr-muted font-mono">Item 14.01 • Porto Nacional/TO</span>
                    </td>
                    <td className="py-2 px-3 font-mono text-right text-wr-muted">R$ 185,00</td>
                    <td className="py-2 px-3 font-mono text-right text-wr-muted">R$ 150,00</td>
                    <td className="py-2 px-3 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400">
                      R$ 335,00
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-wr-elevated font-bold border-t border-wr-border">
                  <tr>
                    <td className="py-2 px-3 text-wr-orange">TOTAL DA OS</td>
                    <td className="py-2 px-3 font-mono text-right">R$ 185,00</td>
                    <td className="py-2 px-3 font-mono text-right">R$ 150,00</td>
                    <td className="py-2 px-3 font-mono text-right text-wr-orange">R$ 335,00</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Garantia CDC */}
            <div className="rounded-xl bg-wr-surface p-2.5 border border-wr-border text-[10px] text-wr-muted">
              <p>
                <strong>Garantia Legal (Art. 26 do CDC):</strong> 90 dias de garantia para serviços mecânicos prestados e garantia do fabricante para peças novas aplicadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
