import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  DollarSign,
  Plus,
  ChevronRight,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react'

export const FinancialView: React.FC = () => {
  const { financial, formatCurrency, addFinancialRecord, toggleFinancialStatus } = useApp()
  const [activeTab, setActiveTab] = useState<'resumo' | 'contas' | 'fluxo'>('resumo')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Form State
  const [type, setType] = useState<'receita' | 'despesa'>('receita')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Serviços')
  const [entityName, setEntityName] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [dueDate, setDueDate] = useState('15/11/2025')

  const totalReceitas = 18750.00
  const totalDespesas = 10430.00
  const saldoAtual = 8320.00

  const contasReceber = financial.filter(f => f.type === 'receita')
  const contasPagar = financial.filter(f => f.type === 'despesa')

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !entityName) return

    addFinancialRecord({
      type,
      category,
      description,
      amount: Number(amount),
      entityName,
      dueDate,
      status: 'pendente'
    })

    setIsAddModalOpen(false)
    setDescription('')
    setAmount(0)
    setEntityName('')
  }

  return (
    <div className="space-y-6 pb-12 max-w-[1440px] mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#FFFFFF] flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#FF8500]" strokeWidth={1.75} />
            Financeiro da Oficina
          </h2>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Fluxo de caixa, receitas faturadas, despesas operacionais e contas a liquidar
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] px-4 py-2.5 text-xs font-bold text-[#080808] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" strokeWidth={2.5} />
          Novo Lançamento
        </button>
      </div>

      {/* Tabs: Resumo (orange pill) | Contas | Fluxo (Exact from Mobile/Desktop Ref) */}
      <div className="flex items-center gap-2 bg-[#151515] p-1.5 rounded-xl w-fit border border-[#262626]">
        {[
          { id: 'resumo', label: 'Resumo' },
          { id: 'contas', label: 'Contas' },
          { id: 'fluxo', label: 'Fluxo' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-lg px-6 py-2 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#FF8500] text-[#080808] shadow-sm'
                : 'text-[#A5A5A5] hover:text-[#FFFFFF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top Indicators: Receitas & Despesas (Matching Screen 6) */}
      <div className="grid grid-cols-2 gap-5">
        {/* Receitas */}
        <div className="rounded-2xl border border-[#262626] bg-[#151515] p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#A5A5A5] block">Receitas do Mês</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono mt-0.5 block">
                {formatCurrency(totalReceitas)}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            +18.4%
          </span>
        </div>

        {/* Despesas */}
        <div className="rounded-2xl border border-[#262626] bg-[#151515] p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#A5A5A5] block">Despesas Operacionais</span>
              <span className="text-2xl font-bold text-rose-400 font-mono mt-0.5 block">
                {formatCurrency(totalDespesas)}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            -4.2%
          </span>
        </div>
      </div>

      {/* Saldo Atual Card (Gold Metallic Bag Icon matching Reference) */}
      <div className="rounded-2xl border border-[#E5A51B]/40 bg-[#151515] p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-[#202020] flex items-center justify-center text-[#E5A51B] border border-[#E5A51B]/30 shadow-inner">
            <DollarSign className="h-9 w-9 stroke-[2.2]" strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#A5A5A5] block">
              Saldo Atual em Caixa
            </span>
            <span className="text-3xl font-black text-[#E5A51B] font-mono mt-1 block">
              {formatCurrency(saldoAtual)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#A5A5A5] block">Margem Líquida</span>
          <span className="text-xl font-bold text-[#FFFFFF] font-mono mt-0.5 block">44.3%</span>
        </div>
      </div>

      {/* Contas a Receber & Contas a Pagar matching Screen 6 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Contas a Receber */}
        <div className="rounded-2xl border border-[#262626] bg-[#151515] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <h4 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
              Contas a receber
            </h4>
            <span className="text-xs font-bold text-[#FF8500] hover:underline cursor-pointer">
              Ver todas →
            </span>
          </div>

          <div className="space-y-3">
            {contasReceber.map(item => {
              const isPaid = item.status === 'pago'
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#262626] bg-[#202020] p-4 text-xs flex items-center justify-between hover:border-[#383838] transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#FFFFFF] block">Cliente: {item.entityName}</span>
                    <span className="text-[11px] text-[#A5A5A5] flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#FF8500]" strokeWidth={1.75} />
                      Vencimento: {item.dueDate}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {formatCurrency(item.amount)}
                    </span>
                    <button
                      onClick={() => toggleFinancialStatus(item.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#FF8500]/10 text-[#FF8500] border-[#FF8500]/30 hover:bg-[#FF8500] hover:text-[#080808]'
                      }`}
                    >
                      {isPaid ? 'Recebido ✓' : 'Liquidar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contas a Pagar */}
        <div className="rounded-2xl border border-[#262626] bg-[#151515] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <h4 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
              Contas a pagar
            </h4>
            <span className="text-xs font-bold text-[#FF8500] hover:underline cursor-pointer">
              Ver todas →
            </span>
          </div>

          <div className="space-y-3">
            {contasPagar.map(item => {
              const isPaid = item.status === 'pago'
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#262626] bg-[#202020] p-4 text-xs flex items-center justify-between hover:border-[#383838] transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#FFFFFF] block">Fornecedor: {item.entityName}</span>
                    <span className="text-[11px] text-[#A5A5A5] flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#FF8500]" strokeWidth={1.75} />
                      Vencimento: {item.dueDate}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="font-bold text-rose-400 font-mono text-sm">
                      {formatCurrency(item.amount)}
                    </span>
                    <button
                      onClick={() => toggleFinancialStatus(item.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-[#080808]'
                      }`}
                    >
                      {isPaid ? 'Pago ✓' : 'Marcar Pago'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal: Novo Lançamento */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-[#262626] bg-[#151515] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="text-sm font-bold text-[#FFFFFF]">Novo Lançamento Financeiro</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-lg p-1 text-[#A5A5A5] hover:text-[#FFFFFF]">
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('receita')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    type === 'receita'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                      : 'bg-[#202020] text-[#A5A5A5] border-[#262626]'
                  }`}
                >
                  + Receita (Entrada)
                </button>
                <button
                  type="button"
                  onClick={() => setType('despesa')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    type === 'despesa'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                      : 'bg-[#202020] text-[#A5A5A5] border-[#262626]'
                  }`}
                >
                  - Despesa (Saída)
                </button>
              </div>

              <div>
                <label className="block text-[#A5A5A5] font-semibold mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de óleo / Compra de peças"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">
                    {type === 'receita' ? 'Cliente' : 'Fornecedor'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={type === 'receita' ? 'Nome do cliente' : 'Nome do fornecedor'}
                    value={entityName}
                    onChange={e => setEntityName(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={amount || ''}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  >
                    <option value="Serviços">Serviços</option>
                    <option value="Peças">Peças</option>
                    <option value="Fornecedores">Fornecedores</option>
                    <option value="Estrutura / Contas">Estrutura / Contas</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Vencimento</label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#FF8500] py-2.5 text-xs font-bold text-[#080808] hover:bg-[#D96A00] transition-colors"
                >
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
