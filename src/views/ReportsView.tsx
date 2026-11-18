import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Wallet,
  Wrench,
  ChevronRight,
  Printer,
  Calendar,
} from 'lucide-react'

export const ReportsView: React.FC = () => {
  const {
    orders,
    clients,
    vehicles,
    stock,
    financial,
    deferredPayments,
    formatCurrency,
  } = useApp()
  const [selectedReport, setSelectedReport] = useState<string>('faturamento')

  const reportItems = [
    { id: 'faturamento', title: 'Faturamento', subtitle: 'Receitas, despesas e margem líquida', icon: TrendingUp },
    { id: 'servicos', title: 'Ordens de Serviço', subtitle: 'Volume de atendimentos e ticket médio', icon: Wrench },
    { id: 'clientes', title: 'Clientes & Veículos', subtitle: 'Base de clientes e frota vinculada', icon: Users },
    { id: 'fiado', title: 'Pagar Depois', subtitle: 'Contas a prazo, recebimentos e saldo', icon: Wallet },
    { id: 'estoque', title: 'Estoque', subtitle: 'Peças cadastradas e itens em reposição', icon: Package },
  ]

  const summary = useMemo(() => {
    const totalRev = financial
      .filter(f => f.type === 'receita')
      .reduce((s, f) => s + f.amount, 0)
    const totalExp = financial
      .filter(f => f.type === 'despesa')
      .reduce((s, f) => s + f.amount, 0)
    const net = totalRev - totalExp
    const margin = totalRev > 0 ? ((net / totalRev) * 100).toFixed(1) : '0.0'
    const ordersTotal = orders.reduce((s, o) => s + o.totalAmount, 0)
    const ticketMedio = orders.length > 0 ? ordersTotal / orders.length : 0
    const deferredOpen = deferredPayments.reduce(
      (s, d) => s + Math.max(0, d.totalAmount - d.paidAmount),
      0
    )
    const stockValue = stock.reduce((s, it) => s + it.quantity * it.sellingPrice, 0)
    return { totalRev, totalExp, net, margin, ordersTotal, ticketMedio, deferredOpen, stockValue }
  }, [financial, orders, deferredPayments, stock])

  const activeMeta = reportItems.find(r => r.id === selectedReport) || reportItems[0]

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-wr-text flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-wr-orange" />
            Relatórios Gerenciais
          </h2>
          <p className="text-xs text-wr-muted mt-0.5">
            Indicadores calculados em tempo real com base nos dados atuais da oficina
          </p>
        </div>

        <button onClick={() => window.print()} className="wr-btn-secondary no-print">
          <Printer className="h-4 w-4 text-wr-orange" />
          Imprimir / Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation */}
        <div className="lg:col-span-4 space-y-2.5 no-print">
          {reportItems.map(item => {
            const Icon = item.icon
            const isSelected = selectedReport === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedReport(item.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-wr-orange bg-wr-surface shadow-card ring-1 ring-wr-orange/25'
                    : 'border-wr-border bg-wr-surface/70 hover:bg-wr-surface hover:border-wr-borderHover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isSelected
                        ? 'bg-wr-orange/15 text-wr-orange border-wr-orange/30'
                        : 'bg-wr-elevated text-wr-muted border-wr-border'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-wr-text">{item.title}</h4>
                    <p className="text-[11px] text-wr-muted">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    isSelected ? 'text-wr-orange translate-x-0.5' : 'text-wr-muted'
                  }`}
                />
              </button>
            )
          })}
        </div>

        {/* Right Analytical Content */}
        <div className="lg:col-span-8 wr-card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-wr-border">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-wr-orange">
                Relatório Consolidado
              </span>
              <h3 className="text-base font-bold text-wr-text mt-0.5">{activeMeta.title}</h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-wr-elevated px-3 py-1.5 border border-wr-border text-xs text-wr-muted">
              <Calendar className="h-3.5 w-3.5 text-wr-orange" />
              <span>{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="wr-surface-muted p-4">
              <span className="text-[11px] text-wr-muted block">Receitas Totais</span>
              <span className="text-xl font-extrabold text-wr-text font-mono mt-1 block">
                {formatCurrency(summary.totalRev)}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">
                Margem: {summary.margin}%
              </span>
            </div>

            <div className="wr-surface-muted p-4">
              <span className="text-[11px] text-wr-muted block">Ticket Médio (OS)</span>
              <span className="text-xl font-extrabold text-wr-gold font-mono mt-1 block">
                {formatCurrency(summary.ticketMedio)}
              </span>
              <span className="text-[10px] text-wr-muted mt-1 inline-block">
                {orders.length} ordens registradas
              </span>
            </div>

            <div className="wr-surface-muted p-4">
              <span className="text-[11px] text-wr-muted block">Pagar Depois (Em Aberto)</span>
              <span className="text-xl font-extrabold text-wr-orange font-mono mt-1 block">
                {formatCurrency(summary.deferredOpen)}
              </span>
              <span className="text-[10px] text-wr-muted mt-1 inline-block">
                {deferredPayments.length} registro(s) a prazo
              </span>
            </div>
          </div>

          {/* Dynamic Table */}
          <div className="rounded-xl border border-wr-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-wr-elevated text-wr-muted border-b border-wr-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Indicador / Item</th>
                  <th className="py-3 px-4 font-semibold">Quantidade</th>
                  <th className="py-3 px-4 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wr-border text-wr-text">
                {selectedReport === 'clientes' ? (
                  clients.map(c => {
                    const countVeh = vehicles.filter(v => v.clientId === c.id).length
                    const sumOs = orders
                      .filter(o => o.clientId === c.id)
                      .reduce((s, o) => s + o.totalAmount, 0)
                    return (
                      <tr key={c.id} className="hover:bg-wr-elevated/50">
                        <td className="py-3 px-4 font-semibold">{c.name}</td>
                        <td className="py-3 px-4 font-mono text-wr-muted">
                          {countVeh} veículo(s)
                        </td>
                        <td className="py-3 px-4 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(sumOs)}
                        </td>
                      </tr>
                    )
                  })
                ) : selectedReport === 'fiado' ? (
                  deferredPayments.map(d => (
                    <tr key={d.id} className="hover:bg-wr-elevated/50">
                      <td className="py-3 px-4 font-semibold">
                        {d.clientName} — {d.description}
                      </td>
                      <td className="py-3 px-4 font-mono text-wr-muted">
                        Pago: {formatCurrency(d.paidAmount)}
                      </td>
                      <td className="py-3 px-4 font-mono text-right font-bold text-wr-orange">
                        Falta: {formatCurrency(Math.max(0, d.totalAmount - d.paidAmount))}
                      </td>
                    </tr>
                  ))
                ) : selectedReport === 'estoque' ? (
                  stock.map(it => (
                    <tr key={it.id} className="hover:bg-wr-elevated/50">
                      <td className="py-3 px-4 font-semibold">
                        {it.name} <span className="font-mono text-wr-muted">({it.code})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-wr-muted">{it.quantity} un.</td>
                      <td className="py-3 px-4 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(it.quantity * it.sellingPrice)}
                      </td>
                    </tr>
                  ))
                ) : (
                  orders.map(o => (
                    <tr key={o.id} className="hover:bg-wr-elevated/50">
                      <td className="py-3 px-4 font-semibold">
                        {o.number} • {o.serviceDescription}
                      </td>
                      <td className="py-3 px-4 font-mono text-wr-muted">{o.vehiclePlate}</td>
                      <td className="py-3 px-4 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(o.totalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
