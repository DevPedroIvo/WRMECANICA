import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Wrench,
  ChevronRight,
  Printer,
  Calendar,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react'

export const ReportsView: React.FC = () => {
  const { formatCurrency } = useApp()
  const [selectedReport, setSelectedReport] = useState<string>('faturamento')

  const reportItems = [
    {
      id: 'servicos',
      title: 'Serviços realizados',
      subtitle: 'Relatório detalhado de serviços prestados',
      icon: Wrench,
    },
    {
      id: 'faturamento',
      title: 'Faturamento',
      subtitle: 'Relatório mensal de faturamento e receitas',
      icon: TrendingUp,
    },
    {
      id: 'clientes',
      title: 'Clientes',
      subtitle: 'Relatório de clientes e frequência',
      icon: Users,
    },
    {
      id: 'estoque',
      title: 'Estoque',
      subtitle: 'Relatório de giro de peças e reposição',
      icon: Package,
    },
    {
      id: 'financeiro',
      title: 'Financeiro',
      subtitle: 'Relatório de DRE, despesas e margem',
      icon: DollarSign,
    }
  ]

  return (
    <div className="space-y-6 pb-12 max-w-[1440px] mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#FFFFFF] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#FF8500]" strokeWidth={1.75} />
            Relatórios Gerenciais
          </h2>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Acompanhe o desempenho, volume de serviços e indicadores financeiros da oficina
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border border-[#262626] bg-[#151515] px-4 py-2.5 text-xs font-semibold text-[#FFFFFF] hover:border-[#383838] transition-colors"
        >
          <Printer className="h-4 w-4 text-[#FF8500]" strokeWidth={1.75} />
          Imprimir / Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Report List Navigation matching Image 1 Screen 7 (4 cols) */}
        <div className="col-span-4 space-y-2.5">
          {reportItems.map(item => {
            const Icon = item.icon
            const isSelected = selectedReport === item.id
            return (
              <div
                key={item.id}
                onClick={() => setSelectedReport(item.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#FF8500] bg-[#202020] shadow-sm'
                    : 'border-[#262626] bg-[#151515] hover:border-[#383838]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    isSelected
                      ? 'bg-[#151515] text-[#FF8500] border-[#FF8500]/30'
                      : 'bg-[#202020] text-[#A5A5A5] border-[#262626]'
                  }`}>
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#FFFFFF]">{item.title}</h4>
                    <p className="text-[11px] text-[#A5A5A5]">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${
                  isSelected ? 'text-[#FF8500] translate-x-1' : 'text-[#A5A5A5]'
                }`} strokeWidth={1.75} />
              </div>
            )
          })}
        </div>

        {/* Selected Report Content (8 cols) */}
        <div className="col-span-8 rounded-2xl border border-[#262626] bg-[#151515] p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8500]">Visão Analítica</span>
              <h3 className="text-base font-bold text-[#FFFFFF] mt-0.5">
                {reportItems.find(r => r.id === selectedReport)?.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#202020] px-3 py-1.5 border border-[#262626] text-xs text-[#A5A5A5]">
              <Calendar className="h-3.5 w-3.5 text-[#FF8500]" strokeWidth={1.75} />
              <span>Novembro / 2025</span>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#262626] bg-[#202020] p-4">
              <span className="text-[11px] text-[#A5A5A5] block">Total Consolidado</span>
              <span className="text-xl font-bold text-[#FFFFFF] font-mono mt-1 block">R$ 18.750,00</span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">+12% vs mês anterior</span>
            </div>
            <div className="rounded-xl border border-[#262626] bg-[#202020] p-4">
              <span className="text-[11px] text-[#A5A5A5] block">Ticket Médio</span>
              <span className="text-xl font-bold text-[#E5A51B] font-mono mt-1 block">R$ 670,00</span>
              <span className="text-[10px] text-[#A5A5A5] mt-1 inline-block">28 ordens finalizadas</span>
            </div>
            <div className="rounded-xl border border-[#262626] bg-[#202020] p-4">
              <span className="text-[11px] text-[#A5A5A5] block">Margem de Lucro</span>
              <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">44.3%</span>
              <span className="text-[10px] text-[#A5A5A5] mt-1 inline-block">R$ 8.320,00 lucro líquido</span>
            </div>
          </div>

          {/* Table breakdown */}
          <div className="rounded-xl border border-[#262626] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#202020] text-[#A5A5A5] border-b border-[#262626]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Categoria / Item</th>
                  <th className="py-3 px-4 font-semibold">Qtd</th>
                  <th className="py-3 px-4 font-semibold text-right">Valor Total</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626] text-[#FFFFFF]">
                <tr className="hover:bg-[#202020]/40 transition-colors">
                  <td className="py-3 px-4 font-medium">Revisão Completa e Troca de Freios</td>
                  <td className="py-3 px-4 font-mono text-[#A5A5A5]">12 OS</td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-emerald-400">R$ 7.200,00</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">100% OK</span>
                  </td>
                </tr>
                <tr className="hover:bg-[#202020]/40 transition-colors">
                  <td className="py-3 px-4 font-medium">Troca de Óleo e Filtros</td>
                  <td className="py-3 px-4 font-mono text-[#A5A5A5]">16 OS</td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-emerald-400">R$ 4.800,00</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">100% OK</span>
                  </td>
                </tr>
                <tr className="hover:bg-[#202020]/40 transition-colors">
                  <td className="py-3 px-4 font-medium">Alinhamento e Balanceamento 3D</td>
                  <td className="py-3 px-4 font-mono text-[#A5A5A5]">14 OS</td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-emerald-400">R$ 2.100,00</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">100% OK</span>
                  </td>
                </tr>
                <tr className="hover:bg-[#202020]/40 transition-colors">
                  <td className="py-3 px-4 font-medium">Venda Avulsa de Peças de Balcão</td>
                  <td className="py-3 px-4 font-mono text-[#A5A5A5]">9 Vendas</td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-emerald-400">R$ 4.650,00</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">100% OK</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
