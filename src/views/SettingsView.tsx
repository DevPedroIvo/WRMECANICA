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
  CheckCircle2,
} from 'lucide-react'

export const SettingsView: React.FC = () => {
  const {
    theme,
    toggleTheme,
    fiscalSettings,
    updateFiscalSettings,
    resetDataToDefault,
    storageMetrics,
    showToast,
  } = useApp()

  const [savedSuccess, setSavedSuccess] = useState(false)

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateFiscalSettings({
      companyName,
      tradeName,
      cnpj,
      cityRegistration,
      stateRegistration,
      taxRegime,
      cnae,
      serviceCode,
      issRate: parseFloat(issRate) || 2.5,
      environment,
      cityCodeIBGE,
    })
    setSavedSuccess(true)
    showToast('Configurações salvas com sucesso!')
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h2 className="text-lg font-bold text-wr-text flex items-center gap-2">
          <Settings className="h-5 w-5 text-wr-orange" />
          Configurações, Aparência &amp; Otimização Supabase
        </h2>
        <p className="text-xs text-wr-muted mt-0.5">
          Tema Claro/Escuro, economia de banco/egress do Supabase e parâmetros fiscais da oficina
        </p>
      </div>

      {/* Top Row: Appearance + Supabase Economy Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appearance Switcher (4 cols) */}
        <div className="lg:col-span-4 wr-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-wr-border">
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-wr-orange" />
            ) : (
              <Sun className="h-4 w-4 text-wr-orange" />
            )}
            <h3 className="text-xs font-bold uppercase tracking-wider text-wr-text">
              Aparência do Sistema
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`rounded-xl border p-3.5 text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'border-wr-orange bg-wr-orange/10 text-wr-orange font-bold'
                  : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text'
              }`}
            >
              <Sun className="h-5 w-5" />
              <span className="text-xs">Modo Claro</span>
            </button>

            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`rounded-xl border p-3.5 text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'border-wr-orange bg-wr-orange/10 text-wr-orange font-bold'
                  : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text'
              }`}
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs">Modo Escuro</span>
            </button>
          </div>
          <p className="text-[11px] text-wr-muted">
            Sua preferência fica salva automaticamente no navegador.
          </p>
        </div>

        {/* Supabase Optimization Dashboard (8 cols) */}
        <div className="lg:col-span-8 wr-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-wr-border">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-wr-text">
                Proteção de Limites do Supabase (Plano Gratuito)
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              {storageMetrics.configured ? 'Conectado ao Supabase' : 'Pronto para Supabase'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="wr-surface-muted p-3">
              <span className="text-[10px] text-wr-muted block">Peso total dos dados</span>
              <strong className="font-mono text-sm text-wr-text">
                {storageMetrics.localPayloadKB} KB
              </strong>
              <span className="text-[10px] text-emerald-500 block">
                {storageMetrics.estimatedFreeTierPercent}% de 500 MB
              </span>
            </div>

            <div className="wr-surface-muted p-3">
              <span className="text-[10px] text-wr-muted block">Cache Local (TTL)</span>
              <strong className="font-mono text-sm text-wr-text">
                {storageMetrics.cacheTtlMinutes} min
              </strong>
              <span className="text-[10px] text-wr-muted block">Evita GET repetido</span>
            </div>

            <div className="wr-surface-muted p-3">
              <span className="text-[10px] text-wr-muted block">Imagens no Banco</span>
              <strong className="font-mono text-sm text-emerald-500">0 bytes</strong>
              <span className="text-[10px] text-wr-muted block">Base64 bloqueado</span>
            </div>

            <div className="wr-surface-muted p-3">
              <span className="text-[10px] text-wr-muted block">Requests na Sessão</span>
              <strong className="font-mono text-sm text-wr-text">
                {storageMetrics.sessionRequests}
              </strong>
              <span className="text-[10px] text-wr-muted block">Upsert por delta</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-wr-muted">
            <span>✓ Projeção explícita de colunas (sem SELECT *)</span>
            <span>✓ Sem Realtime WebSockets nem polling contínuo</span>
            <span>✓ Upsert com Prefer: return=minimal (zero egress)</span>
            <span>✓ Schema otimizado em supabase/schema.sql</span>
          </div>
        </div>
      </div>

      {/* Main Split: Company/Fiscal Form & OS Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-5">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="wr-card p-5 space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-wr-orange flex items-center gap-2 border-b border-wr-border pb-3">
                <Building className="h-4 w-4" /> Dados da Oficina
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
                  <label className="block text-wr-muted font-semibold mb-1">Insc. Municipal</label>
                  <input
                    type="text"
                    value={cityRegistration}
                    onChange={e => setCityRegistration(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Insc. Estadual</label>
                  <input
                    type="text"
                    value={stateRegistration}
                    onChange={e => setStateRegistration(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">IBGE Município</label>
                  <input
                    type="text"
                    value={cityCodeIBGE}
                    onChange={e => setCityCodeIBGE(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">Endereço</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="wr-input"
                />
              </div>
            </div>

            <div className="wr-card p-5 space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-wr-gold flex items-center gap-2 border-b border-wr-border pb-3">
                <ShieldCheck className="h-4 w-4" /> Parâmetros Fiscais (NFS-e)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Regime</label>
                  <select
                    value={taxRegime}
                    onChange={e => setTaxRegime(e.target.value as typeof taxRegime)}
                    className="wr-input"
                  >
                    <option value="simples_nacional">Simples Nacional</option>
                    <option value="lucro_presumido">Lucro Presumido</option>
                    <option value="lucro_real">Lucro Real</option>
                    <option value="mei">MEI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Ambiente</label>
                  <select
                    value={environment}
                    onChange={e => setEnvironment(e.target.value as typeof environment)}
                    className="wr-input"
                  >
                    <option value="producao">Produção</option>
                    <option value="homologacao">Homologação</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">LC 116</label>
                  <input
                    type="text"
                    value={serviceCode}
                    onChange={e => setServiceCode(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">CNAE</label>
                  <input
                    type="text"
                    value={cnae}
                    onChange={e => setCnae(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">ISS (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={issRate}
                    onChange={e => setIssRate(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button type="submit" className="wr-btn-primary">
                  <Save className="h-4 w-4" />
                  Salvar Configurações
                </button>
                {savedSuccess && (
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                    <Check className="h-4 w-4" /> Salvo!
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* Reset Demo */}
          <div className="wr-card border-rose-500/25 p-5 space-y-2 text-xs">
            <h4 className="font-bold text-rose-500 flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> Restaurar Dados Padrão
            </h4>
            <p className="text-[11px] text-wr-muted">
              Restaura clientes, veículos, ordens de serviço, contas a prazo e estoque aos valores iniciais.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar todos os dados de demonstração?')) {
                  resetDataToDefault()
                }
              }}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
            >
              Restaurar Demonstração
            </button>
          </div>
        </div>

        {/* Live OS Preview */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Preview da Ordem de Serviço
            </span>
            <button onClick={() => window.print()} className="wr-btn-secondary px-3 py-1.5">
              <Printer className="h-3.5 w-3.5 text-wr-orange" /> Testar Impressão
            </button>
          </div>

          <div className="wr-card p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-wr-border pb-3">
              <div>
                <h3 className="text-base font-black text-wr-gold uppercase">{tradeName}</h3>
                <p className="text-[10px] text-wr-orange font-semibold">{companyName}</p>
                <p className="text-[10px] text-wr-muted mt-0.5">
                  CNPJ: {cnpj} • IM: {cityRegistration}
                </p>
                <p className="text-[10px] text-wr-muted">
                  {address} • {phone}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-wr-orange block">OS #1024</span>
                <span className="text-[10px] text-wr-muted">Modelo Padrão</span>
              </div>
            </div>

            <div className="wr-surface-muted p-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" /> Checklist Visual de Entrada (Enxuto)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                <span className="text-emerald-600 dark:text-emerald-400">✓ Faróis: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Pintura: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Pneus: Bom</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Vidros: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Lanternas: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Retrovisores: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Para-choques: OK</span>
                <span className="text-emerald-600 dark:text-emerald-400">✓ Rodas/Estepe: OK</span>
              </div>
            </div>

            <div className="rounded-xl border border-wr-border overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-wr-elevated text-wr-muted border-b border-wr-border">
                  <tr>
                    <th className="py-2 px-3">Serviço</th>
                    <th className="py-2 px-3 text-right">Peças</th>
                    <th className="py-2 px-3 text-right">M. Obra</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wr-border text-wr-text">
                  <tr>
                    <td className="py-2 px-3">Troca de pastilhas de freio dianteiras</td>
                    <td className="py-2 px-3 font-mono text-right text-wr-muted">R$ 185,00</td>
                    <td className="py-2 px-3 font-mono text-right text-wr-muted">R$ 150,00</td>
                    <td className="py-2 px-3 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400">
                      R$ 335,00
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-wr-elevated font-bold border-t border-wr-border">
                  <tr>
                    <td className="py-2 px-3 text-wr-orange">TOTAL</td>
                    <td className="py-2 px-3 font-mono text-right">R$ 185,00</td>
                    <td className="py-2 px-3 font-mono text-right">R$ 150,00</td>
                    <td className="py-2 px-3 font-mono text-right text-wr-orange">R$ 335,00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
