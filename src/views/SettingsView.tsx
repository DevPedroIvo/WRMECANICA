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
  const [warrantyDaysLabor, setWarrantyDaysLabor] = useState(fiscalSettings.warrantyDaysLabor || 90)
  const [warrantyDaysParts, setWarrantyDaysParts] = useState(fiscalSettings.warrantyDaysParts || 90)
  const [warrantyTerms, setWarrantyTerms] = useState(
    fiscalSettings.warrantyTerms ||
      'Garantia legal de 90 dias conforme Art. 26 do Código de Defesa do Consumidor (CDC) para serviços mecânicos executados. Peças novas com garantia contra defeito de fabricação.'
  )

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
      warrantyDaysLabor: Number(warrantyDaysLabor) || 90,
      warrantyDaysParts: Number(warrantyDaysParts) || 90,
      warrantyTerms,
    })
    setSavedSuccess(true)
    showToast('Configurações da oficina e termos de garantia salvos!')
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

      {/* Formulário Principal de Configurações */}
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
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
          <div className="p-3.5 rounded-xl bg-wr-surface border border-wr-border space-y-3">
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
                className="wr-input font-mono max-w-sm"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Prazos e Termos de Garantia da Oficina */}
        <div className="wr-card p-5 space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-wr-orange flex items-center gap-2 border-b border-wr-border pb-3">
            <ShieldCheck className="h-4 w-4 text-wr-orange" /> Prazos e Termos de Garantia da Oficina
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-wr-muted font-semibold mb-1">
                Garantia de Mão de Obra / Serviços (Dias)
              </label>
              <input
                type="number"
                value={warrantyDaysLabor}
                onChange={e => setWarrantyDaysLabor(Number(e.target.value))}
                className="wr-input font-mono font-bold"
                placeholder="90"
              />
              <span className="text-[10px] text-wr-muted block mt-0.5">
                Padrão legal: 90 dias conforme Art. 26 do CDC
              </span>
            </div>

            <div>
              <label className="block text-wr-muted font-semibold mb-1">
                Garantia de Peças Novas (Dias)
              </label>
              <input
                type="number"
                value={warrantyDaysParts}
                onChange={e => setWarrantyDaysParts(Number(e.target.value))}
                className="wr-input font-mono font-bold"
                placeholder="90"
              />
              <span className="text-[10px] text-wr-muted block mt-0.5">
                Garantia fornecida pelo fabricante da peça
              </span>
            </div>
          </div>

          <div>
            <label className="block text-wr-muted font-semibold mb-1">
              Termos de Garantia (Texto impresso na Ordem de Serviço)
            </label>
            <textarea
              rows={3}
              value={warrantyTerms}
              onChange={e => setWarrantyTerms(e.target.value)}
              className="wr-input leading-relaxed"
              placeholder="Descreva os termos legais de garantia da oficina..."
            />
          </div>
        </div>

        {/* Card 3: Parâmetros Fiscais (NFS-e Porto Nacional / Luzimangues) */}
        <div className="wr-card p-5 space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-wr-gold flex items-center justify-between border-b border-wr-border pb-3">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Validade Fiscal (NFS-e Municipal / Nacional)
            </span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              Porto Nacional - IBGE 1718204
            </span>
          </h3>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5" /> Como funciona a Validade Fiscal da sua Oficina:
            </span>
            <p className="text-[11px] text-wr-muted leading-relaxed">
              As ordens de serviço finalizadas nesta oficina geram o <strong>Documento Auxiliar da NFS-e (DANFSE)</strong> e o arquivo <strong>XML oficial no padrão ABRASF 2.04 / Padrão Nacional</strong>, calculando o ISS de Porto Nacional/TO (Item LC 116: <strong>14.01</strong> / CNAE: <strong>4520-0/01</strong>). Você pode baixar o XML oficial ou transmiti-lo sem custos ao portal municipal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="flex items-center justify-between pt-3 border-t border-wr-border">
            <button type="submit" className="wr-btn-primary px-6 py-2.5">
              <Save className="h-4 w-4" /> Salvar Configurações da Oficina
            </button>
            {savedSuccess && (
              <span className="text-emerald-500 font-bold text-xs flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Configurações Gravadas com Sucesso!
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
    </div>
  )
}
