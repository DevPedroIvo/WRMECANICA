import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import {
  DollarSign,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
} from 'lucide-react'

export const FinancialView: React.FC = () => {
  const {
    financial,
    deferredPayments,
    formatCurrency,
    addFinancialRecord,
    toggleFinancialStatus,
    setActiveTab,
  } = useApp()

  const [subTab, setSubTab] = useState<'resumo' | 'receber' | 'pagar'>('resumo')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [type, setType] = useState<'receita' | 'despesa'>('receita')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Serviços')
  const [entityName, setEntityName] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [dueDate, setDueDate] = useState(new Date().toLocaleDateString('pt-BR'))

  const { totalReceitas, totalDespesas, saldoAtual, margem, totalPagarDepois } = useMemo(() => {
    const rec = financial
      .filter(f => f.type === 'receita')
      .reduce((acc, f) => acc + f.amount, 0)
    const desp = financial
      .filter(f => f.type === 'despesa')
      .reduce((acc, f) => acc + f.amount, 0)
    const saldo = rec - desp
    const m = rec > 0 ? Math.round((saldo / rec) * 1000) / 10 : 0
    const fiado = deferredPayments.reduce(
      (sum, d) => sum + Math.max(0, d.totalAmount - d.paidAmount),
      0
    )
    return {
      totalReceitas: rec,
      totalDespesas: desp,
      saldoAtual: saldo,
      margem: m,
      totalPagarDepois: fiado,
    }
  }, [financial, deferredPayments])

  const contasReceber = financial.filter(f => f.type === 'receita')
  const contasPagar = financial.filter(f => f.type === 'despesa')

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount || !entityName.trim()) return

    addFinancialRecord({
      type,
      category,
      description: description.trim(),
      amount: Number(amount),
      entityName: entityName.trim(),
      dueDate,
      status: 'pendente',
    })

    setIsAddModalOpen(false)
    setDescription('')
    setAmount(0)
    setEntityName('')
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-wr-text flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-wr-orange" />
            Financeiro da Oficina
          </h2>
          <p className="text-xs text-wr-muted mt-0.5">
            Entradas, saídas, saldo em caixa e integração com Pagar Depois
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab('fiado')} className="wr-btn-secondary">
            <Wallet className="h-4 w-4 text-amber-500" />
            Pagar Depois ({formatCurrency(totalPagarDepois)})
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="wr-btn-primary">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 rounded-xl border border-wr-border bg-wr-surface p-1 w-fit">
        {[
          { id: 'resumo', label: 'Resumo Geral' },
          { id: 'receber', label: `Receitas (${contasReceber.length})` },
          { id: 'pagar', label: `Despesas (${contasPagar.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as typeof subTab)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              subTab === tab.id
                ? 'bg-wr-orange text-white dark:text-[#0B0C10]'
                : 'text-wr-muted hover:text-wr-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">Receitas Totais</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatCurrency(totalReceitas)}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">Despesas</span>
            <span className="text-2xl font-extrabold font-mono text-rose-500 mt-1 block">
              {formatCurrency(totalDespesas)}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        <div className="wr-card p-5 flex items-center justify-between border-wr-gold/40">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">
              Saldo Líquido ({margem}%)
            </span>
            <span className="text-2xl font-extrabold font-mono text-wr-gold mt-1 block">
              {formatCurrency(saldoAtual)}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-wr-gold/15 text-wr-gold flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className={`grid grid-cols-1 ${subTab === 'resumo' ? 'lg:grid-cols-2' : ''} gap-5`}>
        {(subTab === 'resumo' || subTab === 'receber') && (
          <div className="wr-card p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <h4 className="text-xs font-bold text-wr-text uppercase tracking-wider">
                Receitas &amp; Entradas
              </h4>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {contasReceber.length} registro(s)
              </span>
            </div>

            <div className="space-y-2.5">
              {contasReceber.map(item => {
                const isPaid = item.status === 'pago'
                return (
                  <div
                    key={item.id}
                    className="wr-surface-muted p-3.5 text-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-wr-text block truncate">
                        {item.entityName}
                      </span>
                      <span className="text-[11px] text-wr-muted block truncate">
                        {item.description}
                      </span>
                      <span className="text-[10px] text-wr-muted inline-flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-wr-orange" /> {item.dueDate}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        {formatCurrency(item.amount)}
                      </span>
                      <button
                        onClick={() => toggleFinancialStatus(item.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-wr-orange/15 text-wr-orange border-wr-orange/30 hover:bg-wr-orange hover:text-white'
                        }`}
                      >
                        {isPaid ? 'Recebido ✓' : 'Marcar Pago'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {(subTab === 'resumo' || subTab === 'pagar') && (
          <div className="wr-card p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <h4 className="text-xs font-bold text-wr-text uppercase tracking-wider">
                Despesas &amp; Saídas
              </h4>
              <span className="text-[11px] font-mono text-rose-500 font-bold">
                {contasPagar.length} registro(s)
              </span>
            </div>

            <div className="space-y-2.5">
              {contasPagar.map(item => {
                const isPaid = item.status === 'pago'
                return (
                  <div
                    key={item.id}
                    className="wr-surface-muted p-3.5 text-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-wr-text block truncate">
                        {item.entityName}
                      </span>
                      <span className="text-[11px] text-wr-muted block truncate">
                        {item.description}
                      </span>
                      <span className="text-[10px] text-wr-muted inline-flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-wr-orange" /> {item.dueDate}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-bold text-rose-500 font-mono text-sm">
                        {formatCurrency(item.amount)}
                      </span>
                      <button
                        onClick={() => toggleFinancialStatus(item.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-500 border-rose-500/30 hover:bg-rose-500 hover:text-white'
                        }`}
                      >
                        {isPaid ? 'Pago ✓' : 'Liquidar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Novo Lançamento */}
      {isAddModalOpen && (
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-md animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-wr-border">
              <h3 className="text-sm font-bold text-wr-text">Novo Lançamento Financeiro</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('receita')}
                  className={`py-2.5 rounded-xl font-bold border transition-all ${
                    type === 'receita'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-wr-elevated text-wr-muted border-wr-border'
                  }`}
                >
                  + Receita
                </button>
                <button
                  type="button"
                  onClick={() => setType('despesa')}
                  className={`py-2.5 rounded-xl font-bold border transition-all ${
                    type === 'despesa'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-wr-elevated text-wr-muted border-wr-border'
                  }`}
                >
                  - Despesa
                </button>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de óleo / Compra de peças"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="wr-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">
                    {type === 'receita' ? 'Cliente *' : 'Fornecedor *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={entityName}
                    onChange={e => setEntityName(e.target.value)}
                    className="wr-input"
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount || ''}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="wr-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="wr-input"
                  >
                    <option value="Serviços">Serviços</option>
                    <option value="Peças">Peças</option>
                    <option value="Fornecedores">Fornecedores</option>
                    <option value="Estrutura / Contas">Estrutura / Contas</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Vencimento</label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="wr-input font-mono"
                  />
                </div>
              </div>

              <button type="submit" className="wr-btn-primary w-full py-3 mt-1">
                Confirmar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
