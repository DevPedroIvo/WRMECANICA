import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  DollarSign,
  CreditCard,
  QrCode,
  Banknote,
  FileText,
  Calendar,
  Clock,
  User,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  Receipt,
  RotateCcw,
} from 'lucide-react'
import { PaymentMethod } from '../types'

export const CaixaView: React.FC = () => {
  const {
    activeShift,
    shiftHistory,
    openCashShift,
    closeCashShift,
    addCashMovement,
    currentUserRole,
    formatCurrency,
  } = useApp()

  // Modais
  const [openModalVisible, setOpenModalVisible] = useState(false)
  const [closeModalVisible, setCloseModalVisible] = useState(false)
  const [movementModalType, setMovementModalType] = useState<'sangria' | 'suprimento' | null>(null)

  // Estados dos formulários
  const [initialAmount, setInitialAmount] = useState('150.00')
  const [openNotes, setOpenNotes] = useState('')

  const [physicalCash, setPhysicalCash] = useState('')
  const [closeNotes, setCloseNotes] = useState('')

  const [movementAmount, setMovementAmount] = useState('')
  const [movementDesc, setMovementDesc] = useState('')

  // Totais do turno ativo
  const movements = activeShift?.movements || []

  const totalEntries = movements
    .filter(m => m.type === 'entrada_os' || m.type === 'suprimento')
    .reduce((sum, m) => sum + m.amount, 0)

  const totalExits = movements
    .filter(m => m.type === 'sangria' || m.type === 'despesa')
    .reduce((sum, m) => sum + m.amount, 0)

  const cashIn = movements
    .filter(m => (m.type === 'entrada_os' || m.type === 'suprimento') && m.paymentMethod === 'dinheiro')
    .reduce((sum, m) => sum + m.amount, 0)

  const cashOut = movements
    .filter(m => (m.type === 'sangria' || m.type === 'despesa') && m.paymentMethod === 'dinheiro')
    .reduce((sum, m) => sum + m.amount, 0)

  const currentCashInDrawer = (activeShift?.initialAmount || 0) + cashIn - cashOut

  const pixTotal = movements
    .filter(m => m.paymentMethod === 'pix')
    .reduce((sum, m) => sum + m.amount, 0)

  const cardDebitTotal = movements
    .filter(m => m.paymentMethod === 'cartao_debito')
    .reduce((sum, m) => sum + m.amount, 0)

  const cardCreditTotal = movements
    .filter(m => m.paymentMethod === 'cartao_credito')
    .reduce((sum, m) => sum + m.amount, 0)

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault()
    openCashShift(parseFloat(initialAmount) || 0, openNotes)
    setOpenModalVisible(false)
    setInitialAmount('150.00')
    setOpenNotes('')
  }

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault()
    closeCashShift(parseFloat(physicalCash) || 0, closeNotes)
    setCloseModalVisible(false)
    setPhysicalCash('')
    setCloseNotes('')
  }

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(movementAmount)
    if (!val || val <= 0) return

    if (movementModalType === 'sangria') {
      addCashMovement({
        type: 'sangria',
        description: movementDesc || 'Sangria de Caixa / Retirada',
        amount: val,
        paymentMethod: 'dinheiro',
      })
    } else if (movementModalType === 'suprimento') {
      addCashMovement({
        type: 'suprimento',
        description: movementDesc || 'Reforço de Troco / Suprimento',
        amount: val,
        paymentMethod: 'dinheiro',
      })
    }

    setMovementModalType(null)
    setMovementAmount('')
    setMovementDesc('')
  }

  const getPaymentBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'dinheiro':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">Dinheiro</span>
      case 'pix':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/15 text-teal-500 border border-teal-500/30">PIX</span>
      case 'cartao_credito':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">Crédito</span>
      case 'cartao_debito':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-500 border border-sky-500/30">Débito</span>
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-wr-elevated text-wr-muted border border-wr-border">{method}</span>
    }
  }

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-wr-text flex items-center gap-2">
            <Wallet className="h-5 w-5 text-wr-orange" />
            Caixa Diário da Oficina
          </h2>
          <p className="text-xs text-wr-muted mt-0.5">
            Abertura, conferência de gaveta, sangrias, suprimentos e fechamento de turno
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeShift ? (
            <>
              <button
                type="button"
                onClick={() => setMovementModalType('suprimento')}
                className="wr-btn-secondary px-3 py-1.5 text-xs font-semibold"
              >
                <Plus className="h-4 w-4 text-emerald-500" /> Suprimento
              </button>

              <button
                type="button"
                onClick={() => setMovementModalType('sangria')}
                className="wr-btn-secondary px-3 py-1.5 text-xs font-semibold text-rose-500"
              >
                <Minus className="h-4 w-4 text-rose-500" /> Sangria
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhysicalCash(currentCashInDrawer.toFixed(2))
                  setCloseModalVisible(true)
                }}
                className="rounded-xl bg-rose-500 text-white font-bold text-xs px-4 py-2 hover:bg-rose-600 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Lock className="h-4 w-4" /> Fechar Caixa
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setOpenModalVisible(true)}
              className="wr-btn-primary px-4 py-2 text-xs font-bold"
            >
              <Unlock className="h-4 w-4" /> Abrir Caixa Diário
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {activeShift ? (
        <div className="wr-card p-5 border-emerald-500/30 bg-emerald-500/5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-wr-border pb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  CAIXA ABERTO &bull; {activeShift.date}
                </span>
                <span className="text-[11px] text-wr-muted block">
                  Aberto às {new Date(activeShift.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} por{' '}
                  <strong className="text-wr-text capitalize">{activeShift.openedBy}</strong>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-wr-muted uppercase font-bold block">Fundo de Troco Inicial</span>
              <span className="font-mono text-sm font-black text-wr-text">
                {formatCurrency(activeShift.initialAmount)}
              </span>
            </div>
          </div>

          {/* Cards de Métricas do Caixa */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="wr-surface p-3.5 rounded-2xl border border-wr-border">
              <span className="text-[10px] text-wr-muted font-bold uppercase tracking-wider flex items-center gap-1">
                <Banknote className="h-3.5 w-3.5 text-emerald-500" /> Dinheiro em Gaveta
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                {formatCurrency(currentCashInDrawer)}
              </span>
              <span className="text-[9px] text-wr-muted block mt-0.5">Fundo + Dinheiro físico</span>
            </div>

            <div className="wr-surface p-3.5 rounded-2xl border border-wr-border">
              <span className="text-[10px] text-wr-muted font-bold uppercase tracking-wider flex items-center gap-1">
                <QrCode className="h-3.5 w-3.5 text-teal-500" /> Total em PIX
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-teal-500 block mt-1">
                {formatCurrency(pixTotal)}
              </span>
              <span className="text-[9px] text-wr-muted block mt-0.5">Conta bancária</span>
            </div>

            <div className="wr-surface p-3.5 rounded-2xl border border-wr-border">
              <span className="text-[10px] text-wr-muted font-bold uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-sky-500" /> Cartões (Déb./Créd.)
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-sky-500 block mt-1">
                {formatCurrency(cardDebitTotal + cardCreditTotal)}
              </span>
              <span className="text-[9px] text-wr-muted block mt-0.5">Máquina de cartão</span>
            </div>

            <div className="wr-surface p-3.5 rounded-2xl border border-wr-border">
              <span className="text-[10px] text-wr-muted font-bold uppercase tracking-wider flex items-center gap-1">
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" /> Sangrias / Saídas
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-rose-500 block mt-1">
                {formatCurrency(totalExits)}
              </span>
              <span className="text-[9px] text-wr-muted block mt-0.5">Retiradas do dia</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="wr-card p-8 text-center space-y-4 border-dashed border-2">
          <div className="w-14 h-14 rounded-full bg-wr-elevated border border-wr-border flex items-center justify-center mx-auto text-wr-muted">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-wr-text">O Caixa Diário está Fechado</h3>
            <p className="text-xs text-wr-muted mt-1 max-w-md mx-auto">
              Abra o caixa no início do expediente informando o valor de troco inicial da gaveta para registrar recebimentos de ordens de serviço.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpenModalVisible(true)}
            className="wr-btn-primary px-6 py-2.5 font-bold text-xs uppercase tracking-wider"
          >
            <Unlock className="h-4 w-4" /> Abrir Caixa Agora
          </button>
        </div>
      )}

      {/* Tabela de Movimentações do Turno Ativo */}
      {activeShift && (
        <div className="wr-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-wr-border pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-wr-text flex items-center gap-2">
              <Receipt className="h-4 w-4 text-wr-orange" /> Movimentações do Turno Atual ({movements.length})
            </h3>
            <span className="text-[11px] text-wr-muted">
              Entradas totais: <strong className="text-emerald-500">{formatCurrency(totalEntries)}</strong>
            </span>
          </div>

          {movements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-wr-elevated text-wr-muted border-b border-wr-border text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Descrição / OS</th>
                    <th className="py-2.5 px-3">Forma</th>
                    <th className="py-2.5 px-3">Operador</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wr-border text-wr-text">
                  {movements.map(m => {
                    const isIncome = m.type === 'entrada_os' || m.type === 'suprimento'
                    return (
                      <tr key={m.id} className="hover:bg-wr-elevated/40 transition-colors">
                        <td className="py-2 px-3 font-mono text-wr-muted">{m.timeFormatted}</td>
                        <td className="py-2 px-3">
                          {isIncome ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                              <ArrowUpRight className="h-3.5 w-3.5" /> Entrada
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
                              <ArrowDownRight className="h-3.5 w-3.5" /> Saída
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-medium">
                          {m.description}
                          {m.orderNumber && (
                            <span className="font-mono text-[10px] text-wr-orange ml-1.5 font-bold">
                              ({m.orderNumber})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">{getPaymentBadge(m.paymentMethod)}</td>
                        <td className="py-2 px-3 text-wr-muted capitalize">{m.operator}</td>
                        <td className={`py-2 px-3 font-mono font-bold text-right ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isIncome ? '+' : '-'} {formatCurrency(m.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center space-y-1 text-xs text-wr-muted">
              <p>Nenhuma movimentação registrada no turno ainda.</p>
              <p className="text-[11px]">As ordens de serviço finalizadas aparecerão aqui automaticamente.</p>
            </div>
          )}
        </div>
      )}

      {/* Histórico de Caixas Fechados */}
      <div className="wr-card p-5 space-y-4 text-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-wr-text flex items-center gap-2 border-b border-wr-border pb-3">
          <Clock className="h-4 w-4 text-wr-gold" /> Histórico de Caixas Fechados ({shiftHistory.length})
        </h3>

        {shiftHistory.length > 0 ? (
          <div className="divide-y divide-wr-border">
            {shiftHistory.map(shift => (
              <div key={shift.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-wr-text text-sm">{shift.date}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-wr-elevated text-wr-muted border border-wr-border">
                      Fechado
                    </span>
                    <span className="text-[10px] text-wr-muted">
                      por <strong className="capitalize text-wr-text">{shift.closedBy || shift.openedBy}</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-wr-muted">
                    Fundo Inicial: {formatCurrency(shift.initialAmount)} &bull; Movimentações: {shift.movements.length}
                    {shift.notes && ` &bull; Obs: ${shift.notes}`}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-wr-muted uppercase block">Físico Contado</span>
                    <span className="font-mono font-bold text-wr-text">
                      {formatCurrency(shift.finalPhysicalCash || 0)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-wr-muted uppercase block">Diferença</span>
                    {shift.difference === 0 ? (
                      <span className="font-mono font-bold text-emerald-500">Exato (R$ 0,00)</span>
                    ) : (shift.difference || 0) > 0 ? (
                      <span className="font-mono font-bold text-sky-500">+{formatCurrency(shift.difference || 0)}</span>
                    ) : (
                      <span className="font-mono font-bold text-rose-500">{formatCurrency(shift.difference || 0)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-wr-muted text-center py-4 text-xs">
            Nenhum caixa fechado arquivado ainda.
          </p>
        )}
      </div>

      {/* Modal: ABRIR CAIXA */}
      {openModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="wr-modal-panel max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <h3 className="text-sm font-bold text-wr-text flex items-center gap-2">
                <Unlock className="h-4 w-4 text-wr-orange" /> Abertura de Caixa Diário
              </h3>
              <button onClick={() => setOpenModalVisible(false)} className="text-wr-muted hover:text-wr-text">
                &times;
              </button>
            </div>

            <form onSubmit={handleOpenShift} className="space-y-4 text-xs">
              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Fundo de Troco Inicial (Dinheiro na Gaveta)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-wr-muted">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={initialAmount}
                    onChange={e => setInitialAmount(e.target.value)}
                    className="wr-input pl-10 font-mono text-base font-bold text-wr-orange"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Observações de Abertura (Opcional)
                </label>
                <input
                  type="text"
                  value={openNotes}
                  onChange={e => setOpenNotes(e.target.value)}
                  placeholder="Ex: Notas miúdas de R$ 5 e R$ 10 para troco"
                  className="wr-input"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-wr-border">
                <button
                  type="button"
                  onClick={() => setOpenModalVisible(false)}
                  className="wr-btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="wr-btn-primary">
                  Confirmar e Abrir Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: FECHAR CAIXA */}
      {closeModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="wr-modal-panel max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <h3 className="text-sm font-bold text-wr-text flex items-center gap-2">
                <Lock className="h-4 w-4 text-rose-500" /> Fechamento de Caixa Diário
              </h3>
              <button onClick={() => setCloseModalVisible(false)} className="text-wr-muted hover:text-wr-text">
                &times;
              </button>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-wr-surface border border-wr-border space-y-1">
                <span className="text-[10px] text-wr-muted uppercase font-bold block">Dinheiro Esperado na Gaveta:</span>
                <span className="font-mono text-base font-black text-emerald-500">
                  {formatCurrency(currentCashInDrawer)}
                </span>
                <span className="text-[10px] text-wr-muted block">
                  (Fundo: {formatCurrency(activeShift?.initialAmount || 0)} + Entradas dinheiro: {formatCurrency(cashIn)} - Saídas: {formatCurrency(cashOut)})
                </span>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Valor em Dinheiro Físico Contado na Gaveta
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-wr-muted">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={physicalCash}
                    onChange={e => setPhysicalCash(e.target.value)}
                    className="wr-input pl-10 font-mono text-base font-bold"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">
                  Observações do Fechamento
                </label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={e => setCloseNotes(e.target.value)}
                  placeholder="Ex: Turno conferido sem divergências"
                  className="wr-input"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-wr-border">
                <button
                  type="button"
                  onClick={() => setCloseModalVisible(false)}
                  className="wr-btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="rounded-xl bg-rose-500 text-white font-bold px-4 py-2 hover:bg-rose-600 transition-colors">
                  Confirmar Fechamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: SANGRIA OU SUPRIMENTO */}
      {movementModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="wr-modal-panel max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <h3 className="text-sm font-bold text-wr-text flex items-center gap-2">
                {movementModalType === 'sangria' ? (
                  <>
                    <Minus className="h-4 w-4 text-rose-500" /> Registrar Sangria (Retirada)
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 text-emerald-500" /> Registrar Suprimento (Troco)
                  </>
                )}
              </h3>
              <button onClick={() => setMovementModalType(null)} className="text-wr-muted hover:text-wr-text">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="space-y-4 text-xs">
              <div>
                <label className="block text-wr-muted font-semibold mb-1">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-wr-muted">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={movementAmount}
                    onChange={e => setMovementAmount(e.target.value)}
                    className="wr-input pl-10 font-mono text-base font-bold text-wr-orange"
                    placeholder="0.00"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">Motivo / Descrição</label>
                <input
                  type="text"
                  value={movementDesc}
                  onChange={e => setMovementDesc(e.target.value)}
                  placeholder={
                    movementModalType === 'sangria'
                      ? 'Ex: Retirada para pagamento de fornecedor'
                      : 'Ex: Adição de moedas para troco'
                  }
                  className="wr-input"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-wr-border">
                <button
                  type="button"
                  onClick={() => setMovementModalType(null)}
                  className="wr-btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="wr-btn-primary">
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
