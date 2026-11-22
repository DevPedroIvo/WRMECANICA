import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { DeferredPayment, DeferredPaymentEntry, DeferredStatus } from '../types'
import { ClientAutocomplete } from '../components/ClientAutocomplete'
import {
  Wallet,
  Plus,
  Search,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Car,
  Users,
  X,
  DollarSign,
  Trash2,
  History,
} from 'lucide-react'

function getDeferredStatus(item: DeferredPayment, todayISO: string): DeferredStatus {
  const remaining = item.totalAmount - item.paidAmount
  if (remaining <= 0.01) return 'quitado'
  if (item.dueDate < todayISO) return 'atrasado'
  if (item.paidAmount > 0) return 'parcial'
  return 'em_aberto'
}

function getDaysDiff(dueDateISO: string, todayISO: string): number {
  const d1 = new Date(`${dueDateISO}T00:00:00`)
  const d2 = new Date(`${todayISO}T00:00:00`)
  return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24))
}

function formatISODateBR(iso: string): string {
  if (!iso || !iso.includes('-')) return iso
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const DeferredPaymentsView: React.FC = () => {
  const {
    deferredPayments,
    clients,
    vehicles,
    addDeferredPayment,
    registerDeferredPayment,
    deleteDeferredPayment,
    formatCurrency,
    sendWhatsApp,
  } = useApp()

  const todayISO = new Date().toISOString().slice(0, 10)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'abertos' | 'atrasado' | 'parcial' | 'quitado' | 'todos'>('abertos')

  // Modal Nova Conta a Prazo
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clientNameInput, setClientNameInput] = useState('')
  const [selectedVehicleInfo, setSelectedVehicleInfo] = useState('')
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [paidInitial, setPaidInitial] = useState<number>(0)
  const [dueDate, setDueDate] = useState(() =>
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState('')

  // Modal Registrar Pagamento (Valor Inteiro ou Personalizado)
  const [payingItem, setPayingItem] = useState<DeferredPayment | null>(null)
  const [payMode, setPayMode] = useState<'integral' | 'personalizado'>('integral')
  const [payAmount, setPayAmount] = useState<number>(0)
  const [payMethod, setPayMethod] = useState<DeferredPaymentEntry['method']>('pix')
  const [payNote, setPayNote] = useState('')

  // KPIs calculados em tempo real
  const stats = useMemo(() => {
    let totalOpen = 0
    let totalOverdue = 0
    let totalReceived = 0
    let overdueCount = 0
    const pendingClientIds = new Set<string>()

    for (const item of deferredPayments) {
      const remaining = Math.max(0, item.totalAmount - item.paidAmount)
      totalReceived += item.paidAmount
      if (remaining > 0.01) {
        totalOpen += remaining
        pendingClientIds.add(item.clientId)
        if (item.dueDate < todayISO) {
          totalOverdue += remaining
          overdueCount += 1
        }
      }
    }

    return {
      totalOpen,
      totalOverdue,
      totalReceived,
      overdueCount,
      pendingClientsCount: pendingClientIds.size,
    }
  }, [deferredPayments, todayISO])

  const filteredList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return deferredPayments
      .filter(item => {
        const st = getDeferredStatus(item, todayISO)
        const matchesFilter =
          statusFilter === 'todos'
            ? true
            : statusFilter === 'abertos'
            ? st !== 'quitado'
            : st === statusFilter

        if (!matchesFilter) return false
        if (!q) return true

        return (
          (item.clientName || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.vehicleInfo || '').toLowerCase().includes(q) ||
          (item.orderNumber || '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        // Ordena: atrasados primeiro, depois vencimento mais próximo, quitados no final
        const remA = a.totalAmount - a.paidAmount > 0.01 ? 0 : 1
        const remB = b.totalAmount - b.paidAmount > 0.01 ? 0 : 1
        if (remA !== remB) return remA - remB
        return (a.dueDate || '').localeCompare(b.dueDate || '')
      })
  }, [deferredPayments, searchTerm, statusFilter, todayISO])

  const clientVehiclesForForm = vehicles.filter(v => v.clientId === selectedClientId)

  const handleOpenNewModal = () => {
    setSelectedClientId('')
    setClientNameInput('')
    setSelectedVehicleInfo('')
    setDescription('')
    setTotalAmount(0)
    setPaidInitial(0)
    setDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
    setNotes('')
    setIsNewModalOpen(true)
  }

  const handleCreateDeferred = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientNameInput.trim() || !description.trim() || totalAmount <= 0) return

    const existingClient = clients.find(c => c.id === selectedClientId || c.name.toLowerCase() === clientNameInput.trim().toLowerCase())
    const cId = existingClient?.id || `cli-${Date.now()}`
    const cName = existingClient?.name || clientNameInput.trim()
    const cPhone = existingClient?.phone || '(63) 99234-5678'

    addDeferredPayment({
      clientId: cId,
      clientName: cName,
      clientPhone: cPhone,
      vehicleInfo: selectedVehicleInfo || undefined,
      description: description.trim(),
      totalAmount: Number(totalAmount),
      paidAmount: Math.min(Number(paidInitial) || 0, Number(totalAmount)),
      dueDate,
      notes: notes.trim() || undefined,
    })

    setIsNewModalOpen(false)
  }

  const openPayModal = (item: DeferredPayment) => {
    const remaining = Math.max(0, Number((item.totalAmount - item.paidAmount).toFixed(2)))
    setPayingItem(item)
    setPayMode('integral')
    setPayAmount(remaining)
    setPayMethod('pix')
    setPayNote('')
  }

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingItem) return
    const remaining = Math.max(0, Number((payingItem.totalAmount - payingItem.paidAmount).toFixed(2)))
    const finalAmount =
      payMode === 'integral'
        ? remaining
        : Number(Math.min(Math.max(0, Number(payAmount) || 0), remaining).toFixed(2))
    if (finalAmount <= 0) return
    registerDeferredPayment(payingItem.id, finalAmount, payMethod, payNote.trim() || undefined)
    setPayingItem(null)
  }

  const sendReminderWhatsApp = (item: DeferredPayment) => {
    const remaining = Math.max(0, item.totalAmount - item.paidAmount)
    const dueFormatted = formatISODateBR(item.dueDate)
    const vehicleText = item.vehicleInfo ? ` referente ao veículo ${item.vehicleInfo}` : ''
    const msg = `Olá ${item.clientName}, tudo bem? Passando apenas para lembrar do saldo pendente de ${formatCurrency(
      remaining
    )}${vehicleText} (${item.description}), combinado para ${dueFormatted}, na WR Mecânica & Cia. Se precisar da chave Pix é só avisar!`
    sendWhatsApp(item.clientPhone, msg)
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-wr-text flex items-center gap-2">
            <Wallet className="h-5 w-5 text-wr-orange" />
            Controle de Clientes — Pagar Depois
          </h2>
          <p className="text-xs text-wr-muted mt-0.5">
            Acompanhe clientes a prazo, registre pagamentos parciais ou quitações e envie lembretes no WhatsApp
          </p>
        </div>

        <button onClick={handleOpenNewModal} className="wr-btn-primary">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Nova Conta a Prazo
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">Total a Receber</span>
            <span className="text-2xl font-extrabold font-mono text-wr-orange mt-1 block">
              {formatCurrency(stats.totalOpen)}
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-wr-orange/15 text-wr-orange flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">
              Em Atraso ({stats.overdueCount})
            </span>
            <span className="text-2xl font-extrabold font-mono text-rose-500 mt-1 block">
              {formatCurrency(stats.totalOverdue)}
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">Já Recebido</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatCurrency(stats.totalReceived)}
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">Clientes Pendentes</span>
            <span className="text-2xl font-extrabold font-mono text-wr-text mt-1 block">
              {stats.pendingClientsCount}
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-wr-elevated border border-wr-border text-wr-orange flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search + Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wr-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente, placa, OS ou serviço..."
            className="wr-input pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-wr-border bg-wr-surface p-1">
          {[
            { id: 'abertos', label: 'Em Aberto' },
            { id: 'atrasado', label: 'Atrasados' },
            { id: 'parcial', label: 'Parciais' },
            { id: 'quitado', label: 'Quitados' },
            { id: 'todos', label: 'Todos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-wr-orange text-white'
                  : 'text-wr-muted hover:text-wr-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Accounts */}
      {filteredList.length === 0 ? (
        <div className="wr-card p-10 text-center space-y-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-wr-text">Nenhuma conta encontrada neste filtro</p>
          <p className="text-xs text-wr-muted">
            Quando criar uma OS marcada como "Pagar Depois" ou lançar uma conta a prazo, ela aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredList.map(item => {
            const status = getDeferredStatus(item, todayISO)
            const remaining = Math.max(0, item.totalAmount - item.paidAmount)
            const progress = Math.min(100, Math.round((item.paidAmount / Math.max(item.totalAmount, 1)) * 100))
            const daysDiff = getDaysDiff(item.dueDate, todayISO)

            return (
              <div
                key={item.id}
                className="wr-card p-5 flex flex-col justify-between gap-4 hover:border-wr-borderHover transition-all"
              >
                <div className="space-y-3.5">
                  {/* Top Row: Client & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-wr-text">{item.clientName}</h3>
                        {item.orderNumber && (
                          <span className="rounded-md bg-wr-elevated border border-wr-border px-2 py-0.5 font-mono text-[10px] font-bold text-wr-orange">
                            {item.orderNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-wr-muted mt-0.5">
                        <span className="font-mono">{item.clientPhone}</span>
                        {item.vehicleInfo && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-wr-text font-medium">
                              <Car className="h-3 w-3 text-wr-orange" />
                              {item.vehicleInfo}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    {status === 'quitado' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="h-3 w-3" /> Quitado
                      </span>
                    )}
                    {status === 'atrasado' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold text-rose-500 shrink-0">
                        <AlertTriangle className="h-3 w-3" /> Atrasado ({Math.abs(daysDiff)}d)
                      </span>
                    )}
                    {status === 'parcial' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 shrink-0">
                        <Clock className="h-3 w-3" /> Parcial
                      </span>
                    )}
                    {status === 'em_aberto' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-wr-orange/15 px-2.5 py-1 text-[10px] font-bold text-wr-orange shrink-0">
                        <Clock className="h-3 w-3" />
                        {daysDiff === 0 ? 'Vence hoje' : `Vence em ${daysDiff}d`}
                      </span>
                    )}
                  </div>

                  {/* Description & Due Date */}
                  <div className="wr-surface-muted p-3 text-xs space-y-1">
                    <p className="font-semibold text-wr-text">{item.description}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-wr-muted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-wr-orange" />
                        Combinado para:{' '}
                        <strong className={status === 'atrasado' ? 'text-rose-500' : 'text-wr-text'}>
                          {formatISODateBR(item.dueDate)}
                        </strong>
                      </span>
                      <span>Lançado em {item.createdAt}</span>
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-wr-muted italic pt-1 border-t border-wr-border/60">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* Financial Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-wr-muted">
                        Pago:{' '}
                        <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.paidAmount)}
                        </strong>{' '}
                        de <span className="font-mono">{formatCurrency(item.totalAmount)}</span>
                      </span>
                      <span className="font-mono font-extrabold text-sm text-wr-text">
                        {remaining > 0.01 ? (
                          <span className={status === 'atrasado' ? 'text-rose-500' : 'text-wr-orange'}>
                            Falta {formatCurrency(remaining)}
                          </span>
                        ) : (
                          <span className="text-emerald-500">Pago 100%</span>
                        )}
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-wr-elevated overflow-hidden border border-wr-border">
                      <div
                        style={{ width: `${progress}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          status === 'quitado'
                            ? 'bg-emerald-500'
                            : status === 'atrasado'
                            ? 'bg-rose-500'
                            : 'bg-wr-orange'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Payment History Chips */}
                  {item.payments.length > 0 && (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-wr-muted">
                        <History className="h-3 w-3" /> Pagamentos registrados:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.payments.map(p => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400"
                          >
                            {p.date} • {formatCurrency(p.amount)} ({p.method.replace('_', ' ')})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-wr-border">
                  {status !== 'quitado' && (
                    <>
                      <button
                        onClick={() => openPayModal(item)}
                        className="wr-btn-primary flex-1 py-2.5"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        Registrar Pagamento
                      </button>

                      <button
                        onClick={() => sendReminderWhatsApp(item)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-white transition-colors"
                        title="Enviar lembrete educado pelo WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Cobrar
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir este registro de ${item.clientName}?`)) {
                        deleteDeferredPayment(item.id)
                      }
                    }}
                    className="rounded-xl border border-wr-border bg-wr-elevated p-2.5 text-wr-muted hover:text-rose-500 hover:border-rose-500/40 transition-colors"
                    title="Remover registro"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Nova Conta a Prazo */}
      {isNewModalOpen && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-lg animate-fadeIn">
            <div className="flex items-center justify-between pb-3.5 border-b border-wr-border">
              <h3 className="text-sm font-bold text-wr-text">Nova Conta — Pagar Depois</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="rounded-lg p-1 text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeferred} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">
                    Cliente (digite para autocompletar) *
                  </label>
                  <ClientAutocomplete
                    value={clientNameInput}
                    onChange={name => setClientNameInput(name)}
                    onSelectClient={c => {
                      setSelectedClientId(c.id)
                      setClientNameInput(c.name)
                      const veh = vehicles.find(v => v.clientId === c.id)
                      setSelectedVehicleInfo(
                        veh ? `${veh.brand} ${veh.model} • ${veh.plate}` : ''
                      )
                    }}
                    placeholder="Digite o nome do cliente..."
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-wr-muted font-semibold mb-1">
                    Veículo Vinculado
                  </label>
                  <select
                    value={selectedVehicleInfo}
                    onChange={e => setSelectedVehicleInfo(e.target.value)}
                    className="wr-input"
                  >
                    <option value="">Sem veículo específico</option>
                    {clientVehiclesForForm.map(v => {
                      const label = `${v.brand} ${v.model} • ${v.plate}`
                      return (
                        <option key={v.id} value={label}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Serviço / Motivo *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Troca de embreagem + peças"
                  className="wr-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Valor Total *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={totalAmount || ''}
                    onChange={e => setTotalAmount(Number(e.target.value))}
                    placeholder="0,00"
                    className="wr-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">
                    Entrada (se deu)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paidInitial || ''}
                    onChange={e => setPaidInitial(Number(e.target.value))}
                    placeholder="0,00"
                    className="wr-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">
                    Data Combinada *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Observações (opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: Combinou pagar via Pix no dia 5"
                  className="wr-input"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button type="submit" className="wr-btn-primary flex-1 py-3">
                  Salvar Conta a Prazo
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="wr-btn-secondary py-3"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Pagamento (Total ou Parcial) */}
      {payingItem && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-md animate-fadeIn">
            <div className="flex items-center justify-between pb-3.5 border-b border-wr-border">
              <div>
                <h3 className="text-sm font-bold text-wr-text">Registrar Pagamento</h3>
                <p className="text-[11px] text-wr-muted mt-0.5">
                  Cliente: <strong className="text-wr-orange">{payingItem.clientName}</strong>
                </p>
              </div>
              <button
                onClick={() => setPayingItem(null)}
                className="rounded-lg p-1 text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="mt-4 space-y-4 text-xs">
              {(() => {
                const currentRemaining = Math.max(
                  0,
                  Number((payingItem.totalAmount - payingItem.paidAmount).toFixed(2))
                )
                const effectivePayingNow =
                  payMode === 'integral'
                    ? currentRemaining
                    : Number(Math.min(Math.max(0, Number(payAmount) || 0), currentRemaining).toFixed(2))
                const willRemainAfter = Math.max(
                  0,
                  Number((currentRemaining - effectivePayingNow).toFixed(2))
                )

                return (
                  <>
                    <div className="wr-surface-muted p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-wr-muted">
                        <span>Total da conta:</span>
                        <span className="font-mono font-bold text-wr-text">
                          {formatCurrency(payingItem.totalAmount)}
                        </span>
                      </div>
                      {payingItem.paidAmount > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-emerald-500 font-semibold">
                          <span>Já pago anteriormente:</span>
                          <span className="font-mono">{formatCurrency(payingItem.paidAmount)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1.5 border-t border-wr-border">
                        <span className="text-wr-muted font-bold">Saldo restante atual:</span>
                        <span className="font-mono text-base font-extrabold text-wr-orange">
                          {formatCurrency(currentRemaining)}
                        </span>
                      </div>
                    </div>

                    {/* Seletor explícito: Valor Inteiro vs Outro Valor Personalizado */}
                    <div className="space-y-2">
                      <label className="block text-wr-muted font-semibold">
                        Tipo de Pagamento *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPayMode('integral')
                            setPayAmount(currentRemaining)
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            payMode === 'integral'
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs'
                              : 'bg-wr-elevated border-wr-border text-wr-muted hover:text-wr-text'
                          }`}
                        >
                          <span className="font-black text-xs block">Valor Inteiro</span>
                          <span className="font-mono text-[11px] font-bold block mt-0.5">
                            {formatCurrency(currentRemaining)}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPayMode('personalizado')
                            if (payAmount >= currentRemaining) {
                              setPayAmount(0)
                            }
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            payMode === 'personalizado'
                              ? 'bg-wr-orange/15 border-wr-orange text-wr-orange shadow-xs'
                              : 'bg-wr-elevated border-wr-border text-wr-muted hover:text-wr-text'
                          }`}
                        >
                          <span className="font-black text-xs block">Outro Valor</span>
                          <span className="text-[11px] block mt-0.5">
                            Pagamento parcial
                          </span>
                        </button>
                      </div>
                    </div>

                    {payMode === 'personalizado' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-wr-muted font-semibold">
                            Valor Personalizado Recebido (R$) *
                          </label>
                          <span className="text-[10px] font-mono text-wr-muted">
                            Máx: {formatCurrency(currentRemaining)}
                          </span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={currentRemaining}
                          required
                          autoFocus
                          value={payAmount || ''}
                          onChange={e => setPayAmount(Number(e.target.value))}
                          placeholder="Informe quanto o cliente está pagando..."
                          className="wr-input font-mono text-base font-black text-emerald-500"
                        />
                        {currentRemaining > 10 && (
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPayAmount(Number((currentRemaining / 2).toFixed(2)))
                              }
                              className="px-2.5 py-1 rounded-lg bg-wr-elevated border border-wr-border text-[11px] font-bold text-wr-text hover:border-wr-orange transition-colors"
                            >
                              50% ({formatCurrency(Number((currentRemaining / 2).toFixed(2)))})
                            </button>
                            {[50, 100, 200, 500].map(
                              preset =>
                                preset < currentRemaining && (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setPayAmount(preset)}
                                    className="px-2.5 py-1 rounded-lg bg-wr-elevated border border-wr-border text-[11px] font-bold text-wr-muted hover:text-wr-text transition-colors"
                                  >
                                    R$ {preset}
                                  </button>
                                )
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Resumo claro: Pagando agora vs Quanto falta pagar */}
                    <div
                      className={`p-3.5 rounded-xl border grid grid-cols-2 gap-3 font-mono ${
                        willRemainAfter > 0.01
                          ? 'bg-amber-500/10 border-amber-500/35'
                          : 'bg-emerald-500/10 border-emerald-500/35'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-wr-muted block">
                          Pagando Agora
                        </span>
                        <span className="text-sm font-black text-emerald-500">
                          {formatCurrency(effectivePayingNow)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-wr-muted block">
                          Falta Pagar Depois
                        </span>
                        <span
                          className={`text-sm font-black ${
                            willRemainAfter > 0.01 ? 'text-rose-500' : 'text-emerald-500'
                          }`}
                        >
                          {willRemainAfter > 0.01
                            ? formatCurrency(willRemainAfter)
                            : 'R$ 0,00 (Quitado)'}
                        </span>
                      </div>
                    </div>
                  </>
                )
              })()}

              <div>
                <label className="block text-wr-muted font-semibold mb-1">Forma de Pagamento</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as DeferredPaymentEntry['method'])}
                  className="wr-input"
                >
                  <option value="pix">Pix</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="transferencia">Transferência</option>
                </select>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Anotação (opcional)
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={e => setPayNote(e.target.value)}
                  placeholder="Ex: Primeira parcela paga no Pix"
                  className="wr-input"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button type="submit" className="wr-btn-primary flex-1 py-3">
                  Confirmar Recebimento
                </button>
                <button
                  type="button"
                  onClick={() => setPayingItem(null)}
                  className="wr-btn-secondary py-3"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
