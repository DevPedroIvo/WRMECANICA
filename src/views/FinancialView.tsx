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
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const getRecordMonthKey = (dateStr?: string): string | null => {
  if (!dateStr) return null
  const clean = dateStr.trim()
  if (clean.includes('/')) {
    const parts = clean.split('/')
    if (parts.length === 3) {
      const year = parts[2].slice(0, 4)
      const month = parts[1].padStart(2, '0')
      return `${year}-${month}`
    }
  }
  if (clean.includes('-')) {
    const parts = clean.split('-')
    if (parts.length >= 2) {
      const year = parts[0]
      const month = parts[1].padStart(2, '0')
      return `${year}-${month}`
    }
  }
  return null
}

const formatMonthDisplay = (key: string) => {
  if (key === 'todos') return 'Todos os Meses (Geral)'
  const [yearStr, monthStr] = key.split('-')
  const mIndex = parseInt(monthStr, 10) - 1
  return `${MONTH_NAMES[mIndex] || monthStr} de ${yearStr}`
}

export const FinancialView: React.FC = () => {
  const {
    financial,
    deferredPayments,
    formatCurrency,
    addFinancialRecord,
    toggleFinancialStatus,
    setActiveTab,
  } = useApp()

  // Unificação: "Resumo Geral" e "Receitas" agora são um só!
  const [subTab, setSubTab] = useState<'receitas' | 'despesas'>('receitas')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Filtro de Mês (padrão: mês atual; permite navegar mês a mês ou ver todos)
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey)

  const handlePrevMonth = () => {
    if (selectedMonth === 'todos') {
      setSelectedMonth(currentMonthKey)
      return
    }
    const [yearStr, monthStr] = selectedMonth.split('-')
    let year = parseInt(yearStr, 10)
    let month = parseInt(monthStr, 10) - 1
    if (month < 1) {
      month = 12
      year -= 1
    }
    setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`)
  }

  const handleNextMonth = () => {
    if (selectedMonth === 'todos') {
      setSelectedMonth(currentMonthKey)
      return
    }
    const [yearStr, monthStr] = selectedMonth.split('-')
    let year = parseInt(yearStr, 10)
    let month = parseInt(monthStr, 10) + 1
    if (month > 12) {
      month = 1
      year += 1
    }
    setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`)
  }

  const [type, setType] = useState<'receita' | 'despesa'>('receita')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Serviços')
  const [entityName, setEntityName] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [dueDate, setDueDate] = useState(new Date().toLocaleDateString('pt-BR'))

  // Filtragem dos registros pelo mês selecionado
  const financialInPeriod = useMemo(() => {
    if (selectedMonth === 'todos') return financial
    return financial.filter(f => {
      const key = getRecordMonthKey(f.paymentDate || f.dueDate)
      return key === selectedMonth
    })
  }, [financial, selectedMonth])

  const { totalReceitas, totalDespesas, saldoAtual, margem, totalPagarDepois } = useMemo(() => {
    const rec = financialInPeriod
      .filter(f => f.type === 'receita')
      .reduce((acc, f) => acc + f.amount, 0)
    const desp = financialInPeriod
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
  }, [financialInPeriod, deferredPayments])

  const contasReceber = useMemo(
    () => financialInPeriod.filter(f => f.type === 'receita'),
    [financialInPeriod]
  )
  const contasPagar = useMemo(
    () => financialInPeriod.filter(f => f.type === 'despesa'),
    [financialInPeriod]
  )

  const filteredItems = useMemo(() => {
    const currentList = subTab === 'receitas' ? contasReceber : contasPagar
    const q = searchTerm.trim().toLowerCase()
    if (!q) return currentList
    return currentList.filter(
      item =>
        (item.description || '').toLowerCase().includes(q) ||
        (item.entityName || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.dueDate || '').toLowerCase().includes(q)
    )
  }, [subTab, contasReceber, contasPagar, searchTerm])

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
            Fluxo de caixa, receitas operacionais, despesas e integração com Pagar Depois
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setActiveTab('fiado')} className="wr-btn-secondary">
            <Wallet className="h-4 w-4 text-wr-orange" />
            Pagar Depois ({formatCurrency(totalPagarDepois)})
          </button>
          <button
            onClick={() => {
              setType(subTab === 'despesas' ? 'despesa' : 'receita')
              setIsAddModalOpen(true)
            }}
            className="wr-btn-primary"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Barra de Seleção de Mês */}
      <div className="wr-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-wr-surface border-wr-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-wr-orange/15 text-wr-orange">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-wr-muted block">
              Mês de Referência
            </span>
            <span className="text-sm font-bold text-wr-text">
              {formatMonthDisplay(selectedMonth)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Navegador Anterior / Próximo e Seletor Direto de Mês */}
          <div className="inline-flex items-center rounded-xl border border-wr-border bg-wr-elevated p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Mês anterior"
              className="p-1.5 rounded-lg text-wr-muted hover:text-wr-text hover:bg-wr-surface transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              type="month"
              value={selectedMonth === 'todos' ? '' : selectedMonth}
              onChange={e => e.target.value && setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-wr-text focus:outline-hidden px-2 font-mono cursor-pointer"
              title="Clique para escolher qualquer mês/ano"
            />
            <button
              type="button"
              onClick={handleNextMonth}
              title="Próximo mês"
              className="p-1.5 rounded-lg text-wr-muted hover:text-wr-text hover:bg-wr-surface transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {selectedMonth !== currentMonthKey && (
            <button
              type="button"
              onClick={() => setSelectedMonth(currentMonthKey)}
              className="px-3 py-1.5 rounded-xl border border-wr-orange/40 bg-wr-orange/10 hover:bg-wr-orange/20 text-wr-orange text-xs font-bold transition-colors"
            >
              Mês Atual
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedMonth(selectedMonth === 'todos' ? currentMonthKey : 'todos')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              selectedMonth === 'todos'
                ? 'border-wr-orange bg-wr-orange text-white dark:text-[#0B0C10]'
                : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text'
            }`}
          >
            {selectedMonth === 'todos' ? 'Vendo Geral' : 'Todos os Meses'}
          </button>
        </div>
      </div>

      {/* KPIs Cards - Unificados para dar visão completa da oficina */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">Receitas Totais</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatCurrency(totalReceitas)}
            </span>
            <span className="text-[10px] text-wr-muted mt-0.5 block">
              {contasReceber.length} lançamento(s)
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="wr-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">Despesas Totais</span>
            <span className="text-2xl font-extrabold font-mono text-rose-500 mt-1 block">
              {formatCurrency(totalDespesas)}
            </span>
            <span className="text-[10px] text-wr-muted mt-0.5 block">
              {contasPagar.length} lançamento(s)
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        <div className="wr-card p-5 flex items-center justify-between border-wr-orange/40">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">
              Saldo em Caixa ({margem}% margem)
            </span>
            <span className="text-2xl font-extrabold font-mono text-wr-orange mt-1 block">
              {formatCurrency(saldoAtual)}
            </span>
            <span className="text-[10px] text-wr-muted mt-0.5 block">
              {saldoAtual >= 0 ? 'Resultado positivo' : 'Déficit no período'}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-wr-orange/15 text-wr-orange flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="wr-card p-5 flex items-center justify-between border-wr-orange/30">
          <div>
            <span className="text-xs font-semibold text-wr-muted block">A Prazo (Pagar Depois)</span>
            <span className="text-2xl font-extrabold font-mono text-wr-orange mt-1 block">
              {formatCurrency(totalPagarDepois)}
            </span>
            <button
              onClick={() => setActiveTab('fiado')}
              className="text-[10px] text-wr-orange hover:underline mt-0.5 block font-bold"
            >
              Ver contas a receber →
            </button>
          </div>
          <div className="h-10 w-10 rounded-xl bg-wr-orange/15 text-wr-orange flex items-center justify-center">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Abas Unificadas: apenas 2 abas (Resumo & Receitas vs Despesas) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 rounded-xl border border-wr-border bg-wr-surface p-1 w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setSubTab('receitas')}
            className={`flex-1 sm:flex-initial rounded-lg px-5 py-2 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              subTab === 'receitas'
                ? 'bg-wr-orange text-white dark:text-[#0B0C10] shadow-sm'
                : 'text-wr-muted hover:text-wr-text'
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Resumo &amp; Receitas ({contasReceber.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('despesas')}
            className={`flex-1 sm:flex-initial rounded-lg px-5 py-2 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              subTab === 'despesas'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-wr-muted hover:text-wr-text'
            }`}
          >
            <ArrowDownRight className="h-3.5 w-3.5" />
            Despesas &amp; Saídas ({contasPagar.length})
          </button>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-wr-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Buscar em ${subTab === 'receitas' ? 'receitas' : 'despesas'}...`}
            className="wr-input pl-9 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Lista Principal de Movimentações (Totalmente adaptada para Celular) */}
      <div className="wr-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-wr-border">
          <div>
            <h3 className="text-sm font-bold text-wr-text flex items-center gap-2">
              {subTab === 'receitas' ? (
                <>
                  <span className="p-1 rounded-md bg-emerald-500/15 text-emerald-500">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  Extrato de Receitas &amp; Entradas
                </>
              ) : (
                <>
                  <span className="p-1 rounded-md bg-rose-500/15 text-rose-500">
                    <ArrowDownRight className="h-4 w-4" />
                  </span>
                  Contas a Pagar &amp; Despesas da Oficina
                </>
              )}
            </h3>
            <p className="text-[11px] text-wr-muted mt-0.5">
              {subTab === 'receitas'
                ? 'Ordens de serviço pagas, pagamentos de fiado e receitas avulsas'
                : 'Compras de peças, fornecedores, contas e custos operacionais'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-wr-elevated border border-wr-border px-2.5 py-0.5 text-[10px] font-bold text-wr-muted font-mono">
              {formatMonthDisplay(selectedMonth)}
            </span>
            <span className="font-mono text-xs font-bold text-wr-muted">
              {filteredItems.length} registro(s)
            </span>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-wr-muted text-xs space-y-2">
            <DollarSign className="h-8 w-8 mx-auto text-wr-muted/60" />
            <p className="font-semibold text-wr-text">Nenhum registro encontrado</p>
            <p className="text-[11px]">
              {searchTerm
                ? `Nenhum lançamento corresponde a "${searchTerm}"`
                : subTab === 'receitas'
                ? `Nenhuma receita registrada em ${formatMonthDisplay(selectedMonth)}.`
                : `Nenhuma despesa registrada em ${formatMonthDisplay(selectedMonth)}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map(item => {
              const isPaid = item.status === 'pago'
              const isReceita = item.type === 'receita'

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-wr-border bg-wr-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-wr-borderHover transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-wr-text truncate">
                        {item.entityName}
                      </span>
                      <span className="rounded-md bg-wr-surface border border-wr-border px-1.5 py-0.5 text-[10px] text-wr-muted font-medium">
                        {item.category}
                      </span>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          {isReceita ? 'Recebido' : 'Pago'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-wr-orange/15 px-2 py-0.5 text-[10px] font-bold text-wr-orange">
                          <Clock className="h-3 w-3" />
                          Pendente
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-wr-muted truncate">{item.description}</p>

                    <div className="flex items-center gap-3 text-[11px] text-wr-muted pt-0.5 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-wr-orange" />
                        {item.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-wr-border">
                    <div className="text-left sm:text-right">
                      <span
                        className={`font-mono text-base font-extrabold block ${
                          isReceita
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-500'
                        }`}
                      >
                        {isReceita ? '+' : '-'} {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[10px] text-wr-muted capitalize">
                        {item.type}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFinancialStatus(item.id)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                        isPaid
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                          : isReceita
                          ? 'bg-wr-orange/15 text-wr-orange border-wr-orange/30 hover:bg-wr-orange hover:text-white dark:hover:text-[#0B0C10]'
                          : 'bg-rose-500/15 text-rose-500 border-rose-500/30 hover:bg-rose-500 hover:text-white'
                      }`}
                    >
                      {isPaid ? 'Concluído ✓' : isReceita ? 'Marcar Recebido' : 'Pagar Agora'}
                    </button>
                  </div>
                </div>
              )
            })}
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
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-wr-elevated text-wr-muted border-wr-border'
                  }`}
                >
                  + Receita (Entrada)
                </button>
                <button
                  type="button"
                  onClick={() => setType('despesa')}
                  className={`py-2.5 rounded-xl font-bold border transition-all ${
                    type === 'despesa'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-wr-elevated text-wr-muted border-wr-border'
                  }`}
                >
                  - Despesa (Saída)
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
                    {type === 'receita' ? 'Cliente *' : 'Fornecedor / Credor *'}
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
                  <label className="block text-wr-muted font-semibold mb-1">Data de Vencimento</label>
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
