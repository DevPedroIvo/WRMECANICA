import React, { useState } from 'react'
import { useApp, PERMISSION_TABS, TabType } from '../context/AppContext'
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
  Users,
  Lock,
  Key,
  CheckSquare,
  Square,
  UserCheck,
  Wrench,
  Plus,
  Download,
  Bell,
  Smartphone,
  Laptop,
  CheckCircle,
  AlertCircle,
  Volume2,
} from 'lucide-react'
import { usePwaInstall } from '../hooks/usePwaInstall'
import {
  requestNotificationPermission,
  sendAppNotification,
  getNotificationPermissionStatus,
  NotificationStatus,
} from '../utils/notifications'

export const SettingsView: React.FC = () => {
  const {
    theme,
    toggleTheme,
    fiscalSettings,
    updateFiscalSettings,
    clearAllData,
    loadDemoData,
    showToast,
    employeePermissions,
    updateEmployeePermissions,
    currentUserRole,
    currentUserName,
    mechanics,
    addMechanic,
    deleteMechanic,
  } = useApp()

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [newMechanicName, setNewMechanicName] = useState('')

  const { isInstallable, isInstalled, isIOS, installApp } = usePwaInstall()
  const [notifStatus, setNotifStatus] = useState<NotificationStatus>(getNotificationPermissionStatus)

  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission()
    setNotifStatus(getNotificationPermissionStatus())
    if (granted) {
      showToast('Notificações no aparelho ativadas com sucesso!', 'success')
    } else {
      showToast('Permissão de notificação não concedida ou bloqueada no navegador.', 'warning')
    }
  }

  const handleTestNotification = () => {
    sendAppNotification('🔔 Teste: WR Mecânica & Cia', {
      body: 'Alerta emitido! Você receberá avisos de novas OS e agendamentos mesmo fora do app.',
    })
    showToast('Alerta sonoro e visual de teste emitido!', 'info')
  }

  const handleClearAllConfirm = () => {
    if (
      window.confirm(
        'ATENÇÃO: Deseja ZERAR TODOS os clientes, veículos, ordens de serviço, agendamentos, fiados, estoque e mecânicos para iniciar o uso real da oficina com a cliente?\n\nAs informações fiscais oficiais (Luzimangues/Porto Nacional - TO) serão preservadas.'
      )
    ) {
      clearAllData()
    }
  }

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

  const handleTogglePermission = (tabId: TabType) => {
    let next: TabType[]
    if (employeePermissions.includes(tabId)) {
      next = employeePermissions.filter(t => t !== tabId)
    } else {
      next = [...employeePermissions, tabId]
    }
    updateEmployeePermissions(next)
    showToast('Permissão de funcionários atualizada!')
  }

  const handleSelectAllPermissions = () => {
    const all = PERMISSION_TABS.map(t => t.id)
    updateEmployeePermissions(all)
    showToast('Todas as telas liberadas para os funcionários!')
  }

  const handleSelectStandardPermissions = () => {
    const standard: TabType[] = ['inicio', 'caixa', 'os', 'atendimentos', 'clientes', 'estoque']
    updateEmployeePermissions(standard)
    showToast('Padrão operacional restaurado para funcionários!')
  }

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
    showToast('Configurações da oficina salvas!')
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 select-none max-w-5xl">
      <div>
        <h2 className="text-lg font-bold text-wr-text flex items-center gap-2">
          <Settings className="h-5 w-5 text-wr-orange" />
          Configurações da Oficina &amp; Validade Fiscal (Luzimangues / Porto Nacional - TO)
        </h2>
        <p className="text-xs text-wr-muted mt-0.5">
          Permissões de funcionários, dados cadastrais, alíquota de ISS de Porto Nacional (IBGE 1718204), emissão da NFS-e e tema visual
        </p>
      </div>

      {/* SEÇÃO: Funcionários & Permissões de Acesso */}
      <div className="wr-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-wr-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-wr-orange/15 text-wr-orange">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-wr-text">Funcionários &amp; Permissões</h3>
              <p className="text-[11px] text-wr-muted">Escolha as telas liberadas para o usuário <strong>Wr_mecanica</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectStandardPermissions}
              className="wr-btn-secondary px-3 py-1.5 text-xs font-semibold"
            >
              Padrão
            </button>
            <button
              type="button"
              onClick={handleSelectAllPermissions}
              className="wr-btn-primary px-3 py-1.5 text-xs font-semibold"
            >
              Liberar Tudo
            </button>
          </div>
        </div>

        {/* Perfil do Funcionário */}
        <div>
          <div className="rounded-xl border border-wr-orange/30 bg-wr-orange/10 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-wr-orange shrink-0" />
              <div>
                <span className="text-xs font-bold text-wr-text block">Funcionário (Wr_mecanica)</span>
                <span className="text-[10px] text-wr-muted">Operador do Sistema</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-wr-orange/20 text-wr-orange">
              {employeePermissions.length} de {PERMISSION_TABS.length} telas liberadas
            </span>
          </div>
        </div>

        {/* Grid de Permissões Direto e Limpo */}
        <div className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PERMISSION_TABS.map(tab => {
              const isAllowed = employeePermissions.includes(tab.id)

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTogglePermission(tab.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                    isAllowed
                      ? 'border-wr-orange/50 bg-wr-orange/10 text-wr-text font-bold'
                      : 'border-wr-border bg-wr-elevated/40 text-wr-muted hover:text-wr-text'
                  }`}
                >
                  <span className="text-xs truncate">{tab.label}</span>
                  <span
                    className={`h-5 px-2 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isAllowed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-wr-border text-wr-muted'
                    }`}
                  >
                    {isAllowed ? 'SIM' : 'NÃO'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* SEÇÃO: Aplicativo Instalável (PWA) & Notificações Externas */}
      <div className="wr-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-wr-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-wr-orange/15 text-wr-orange">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-wr-text">Aplicativo Baixável &amp; Notificações Externas</h3>
              <p className="text-[11px] text-wr-muted">Instale o app na tela inicial e receba alertas sonoros e no aparelho fora do navegador</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Baixar Aplicativo */}
          <div className="rounded-xl border border-wr-border bg-wr-elevated/40 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-wr-text flex items-center gap-2">
                  <Download className="h-4 w-4 text-wr-orange" />
                  Aplicativo WR Mecânica
                </span>
                {isInstalled ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Instalado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-wr-orange/20 text-wr-orange">
                    Pronto para Baixar
                  </span>
                )}
              </div>
              <p className="text-[11px] text-wr-muted leading-relaxed">
                Transforme a oficina em um aplicativo sem precisar de loja. Funciona em tela cheia, offline e com acesso instantâneo na tela inicial do celular ou computador.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={installApp}
                className="w-full wr-btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="h-4 w-4" />
                {isInstalled ? 'Abrir / Reinstalar Aplicativo' : 'Baixar / Instalar no Aparelho'}
              </button>
              {isIOS && (
                <p className="text-[10px] text-wr-muted text-center mt-2">
                  No iPhone: toque no ícone de <strong>Compartilhar</strong> e escolha <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              )}
            </div>
          </div>

          {/* Card Notificações do Aparelho */}
          <div className="rounded-xl border border-wr-border bg-wr-elevated/40 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-wr-text flex items-center gap-2">
                  <Bell className="h-4 w-4 text-wr-orange" />
                  Notificações no Dispositivo
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    notifStatus === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : notifStatus === 'denied'
                      ? 'bg-rose-500/20 text-rose-500'
                      : 'bg-wr-orange/20 text-wr-orange'
                  }`}
                >
                  {notifStatus === 'granted'
                    ? 'Ativadas'
                    : notifStatus === 'denied'
                    ? 'Bloqueadas no Navegador'
                    : 'Pendente de Ativação'}
                </span>
              </div>
              <p className="text-[11px] text-wr-muted leading-relaxed">
                Receba alertas visuais e sonoros com vibração quando uma nova OS for gerada, o status mudar ou novos agendamentos forem marcados, mesmo fora da página.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleRequestNotification}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  notifStatus === 'granted'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/25'
                    : 'wr-btn-primary'
                }`}
              >
                <Bell className="h-4 w-4" />
                {notifStatus === 'granted' ? 'Notificações Ativas' : 'Ativar Notificações no Aparelho'}
              </button>
              <button
                type="button"
                onClick={handleTestNotification}
                className="wr-btn-secondary py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
                title="Tocar som e enviar notificação de teste"
              >
                <Volume2 className="h-4 w-4 text-wr-orange" />
                Testar Alerta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO: Mecânicos da Oficina (Adicionar e Remover) */}
      <div className="wr-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-wr-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-wr-orange/15 text-wr-orange border border-wr-orange/30">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-wr-text flex items-center gap-2">
                Mecânicos da Oficina
                <span className="rounded-full bg-wr-elevated border border-wr-border px-2 py-0.5 text-[10px] font-bold text-wr-muted font-mono">
                  {mechanics.length} cadastrado(s)
                </span>
              </h3>
              <p className="text-[11px] text-wr-muted mt-0.5">
                Profissionais responsáveis pela execução dos serviços selecionáveis na Ordem de Serviço
              </p>
            </div>
          </div>
        </div>

        {/* Formulário para Adicionar Novo Mecânico */}
        <form
          onSubmit={e => {
            e.preventDefault()
            if (!newMechanicName.trim()) return
            addMechanic(newMechanicName.trim())
            setNewMechanicName('')
          }}
          className="flex flex-col sm:flex-row gap-2 max-w-lg"
        >
          <input
            type="text"
            required
            value={newMechanicName}
            onChange={e => setNewMechanicName(e.target.value)}
            placeholder="Nome do mecânico (ex: Fernando Santos)..."
            className="wr-input flex-1"
          />
          <button type="submit" className="wr-btn-primary px-4 py-2.5 text-xs font-bold shrink-0">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Adicionar Mecânico
          </button>
        </form>

        {/* Lista de Mecânicos Cadastrados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {mechanics.map(m => (
            <div
              key={m}
              className="rounded-2xl border border-wr-border bg-wr-elevated p-3.5 flex items-center justify-between gap-3 hover:border-wr-borderHover transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-wr-surface border border-wr-border flex items-center justify-center font-bold text-xs text-wr-orange shrink-0">
                  {m.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-wr-text block truncate">{m}</span>
                  <span className="text-[10px] text-wr-muted block">Mecânico Operacional</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Deseja remover o mecânico "${m}" da lista?`)) {
                    deleteMechanic(m)
                  }
                }}
                className="p-1.5 rounded-lg border border-wr-border bg-wr-surface text-wr-muted hover:text-rose-500 hover:border-rose-500/30 transition-colors shrink-0"
                title="Remover mecânico"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO: Gestão de Dados & Zeramento do Sistema */}
      <div className="wr-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-wr-border pb-3">
          <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-wr-text">Gestão de Dados &amp; Zeramento da Oficina</h3>
            <p className="text-[11px] text-wr-muted mt-0.5">
              Zere todos os dados para passar o sistema limpo e pronto para a cliente começar a operar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Zerar para Operação Real */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Zerar Sistema para Operação Real
              </span>
              <p className="text-[11px] text-wr-muted leading-relaxed">
                Apaga todos os clientes, veículos, ordens de serviço, agendamentos, fiados, estoque e mecânicos de teste. As <strong>informações fiscais da oficina de Luzimangues/Porto Nacional - TO são 100% mantidas</strong>.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearAllConfirm}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Zerar Todos os Dados da Oficina
              </button>
            </div>
          </div>

          {/* Card Carregar Demonstração */}
          <div className="rounded-xl border border-wr-border bg-wr-elevated/40 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-wr-text flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-wr-orange" />
                Carregar Dados de Demonstração
              </span>
              <p className="text-[11px] text-wr-muted leading-relaxed">
                Insere dados de teste com clientes, veículos, ordens de serviço e gráficos para apresentação ou demonstração rápida do sistema.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Deseja carregar dados de demonstração para testes?')) {
                    loadDemoData()
                  }
                }}
                className="w-full wr-btn-secondary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-wr-orange" />
                Carregar Dados de Teste
              </button>
            </div>
          </div>
        </div>
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
          <div className="p-3.5 rounded-xl bg-wr-surface border border-wr-border space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-wr-orange flex items-center gap-1.5">
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

        {/* Card 3: Parâmetros Fiscais (NFS-e Porto Nacional / Luzimangues) */}
        <div className="wr-card p-5 space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-wr-orange flex items-center justify-between border-b border-wr-border pb-3">
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
