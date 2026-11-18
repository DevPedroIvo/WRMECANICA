import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { WrLogo } from '../components/WrLogo'
import {
  Menu,
  Bell,
  Search,
  Fuel,
  Save,
  MessageCircle,
  Car,
  ChevronRight,
  Plus,
  Home,
  Wrench,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Package,
  Layers,
  CheckCircle2,
  Edit,
  ArrowUpRight
} from 'lucide-react'

export const MobileShowcaseView: React.FC = () => {
  const { sendWhatsApp } = useApp()
  const [fuelVal, setFuelVal] = useState(75)

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#16181f] border border-[#262a34] p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span className="text-[#f97316]">TODA A SUA OFICINA NA PALMA DA MÃO!</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualização fiel das 7 telas móveis da WR Mecânica & Cia (como apresentado no material de divulgação)
          </p>
        </div>
      </div>

      {/* 7 Phones Horizontal Gallery / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5 overflow-x-auto pb-6">
        
        {/* PHONE 1: INÍCIO */}
        <div className="flex flex-col items-center">
          <span className="mb-2 text-xs font-bold text-[#f97316] uppercase tracking-wider bg-[#26180c] px-3 py-1 rounded-full border border-[#f97316]/30">
            1. Início
          </span>
          <div className="w-[280px] h-[580px] rounded-[38px] border-[6px] border-[#22252e] bg-[#0f1115] overflow-hidden shadow-2xl flex flex-col justify-between text-white relative">
            
            {/* Top Status */}
            <div className="pt-2 px-5 flex justify-between text-[10px] text-slate-400">
              <span>9:41</span>
              <span>●●● 4G</span>
            </div>

            {/* Header */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-white/5">
              <Menu className="h-4 w-4 text-slate-400" />
              <div className="text-center">
                <span className="font-serif text-xs font-bold text-amber-400 block tracking-wider">WR</span>
                <span className="text-[9px] text-[#f97316] font-semibold">Mecânica &amp; Cia</span>
              </div>
              <Bell className="h-4 w-4 text-slate-400" />
            </div>

            {/* Content */}
            <div className="flex-1 px-3 py-2 space-y-2.5 overflow-y-auto">
              {/* Car photo */}
              <div className="h-20 w-full rounded-xl overflow-hidden relative">
                <img src="/assets/car-exemplar.png" alt="Car" className="h-full w-full object-contain filter drop-shadow" />
              </div>

              {/* 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#1a1c22] p-2 rounded-xl border border-white/5">
                  <Car className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                  <p className="text-[9px] text-slate-400 mt-0.5">Ordens em Andamento</p>
                  <p className="text-sm font-bold text-white">12</p>
                </div>
                <div className="bg-[#1a1c22] p-2 rounded-xl border border-white/5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mx-auto" />
                  <p className="text-[9px] text-slate-400 mt-0.5">Serviços Concluídos</p>
                  <p className="text-sm font-bold text-white">28</p>
                </div>
                <div className="bg-[#1a1c22] p-2 rounded-xl border border-white/5 col-span-2 flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#f97316] font-bold">$</span>
                    <span className="text-[10px] text-slate-400">Faturamento do Mês</span>
                  </div>
                  <span className="text-xs font-bold text-[#f97316]">R$ 18.750,00</span>
                </div>
              </div>

              {/* Clientes Ativos */}
              <div className="bg-[#1a1c22] p-2 rounded-xl border border-white/5 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-[10px] text-slate-400">Clientes Ativos</span>
                </div>
                <span className="text-xs font-bold text-white">843</span>
              </div>

              {/* Próximos atendimentos */}
              <div className="bg-[#1a1c22] p-2 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-slate-300 font-bold">Próximos atendimentos</span>
                  <span className="text-[#f97316] text-[9px]">Ver todos →</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between text-slate-300"><span>09:00</span><span>Marcos Oliveira</span></div>
                  <div className="flex justify-between text-slate-300"><span>10:30</span><span>Ana Paula</span></div>
                  <div className="flex justify-between text-slate-300"><span>14:00</span><span>Carlos Mendes</span></div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 py-1.5 px-3 flex justify-around text-[9px] text-slate-400 bg-[#0e1015]">
              <span className="text-[#f97316]">Início</span>
              <span>OS</span>
              <span>Clientes</span>
              <span>Financeiro</span>
              <span>Mais</span>
            </div>
          </div>
        </div>

        {/* PHONE 2: ORDEM DE SERVIÇO */}
        <div className="flex flex-col items-center">
          <span className="mb-2 text-xs font-bold text-[#f97316] uppercase tracking-wider bg-[#26180c] px-3 py-1 rounded-full border border-[#f97316]/30">
            2. Ordem de Serviço
          </span>
          <div className="w-[280px] h-[580px] rounded-[38px] border-[6px] border-[#22252e] bg-[#0f1115] overflow-hidden shadow-2xl flex flex-col justify-between text-white relative">
            <div className="pt-2 px-5 flex justify-between text-[10px] text-slate-400">
              <span>9:41</span>
              <span>●●● 4G</span>
            </div>

            {/* Header */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-white/5 text-xs font-bold">
              <span>← Nova Ordem de Serviço</span>
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Form Fields matching mockup */}
            <div className="flex-1 px-3 py-2 space-y-2 overflow-y-auto text-left text-[11px]">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Cliente</label>
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/10 flex justify-between items-center text-slate-300">
                  <span>Selecione um cliente</span>
                  <span>▼</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Veículo</label>
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/10 flex justify-between items-center text-slate-300">
                  <span>Selecione um veículo</span>
                  <span>▼</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Quilometragem Atual (KM)</label>
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/10 text-slate-300">
                  0,00
                </div>
              </div>

              {/* Fuel Level */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Nível de Combustível</label>
                <div className="flex items-center gap-2 bg-[#1c1e26] p-2 rounded-lg border border-white/10">
                  <Fuel className="h-4 w-4 text-[#f97316]" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fuelVal}
                    onChange={e => setFuelVal(Number(e.target.value))}
                    className="flex-1 accent-[#f97316]"
                  />
                  <span className="font-bold text-[#f97316] text-[10px]">{fuelVal}%</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Serviços a Realizar</label>
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/10 flex justify-between items-center text-slate-300">
                  <span>Selecione os serviços</span>
                  <span>▼</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Peças Utilizadas</label>
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/10 flex justify-between items-center text-slate-300">
                  <span>Selecione as peças</span>
                  <span>▼</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Observações</label>
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/10 text-slate-500">
                  Digite observações...
                </div>
              </div>

              {/* Save Button */}
              <button className="w-full bg-[#f97316] text-black font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md mt-1">
                <Save className="h-3.5 w-3.5" />
                <span>Salvar</span>
              </button>
            </div>

            <div className="border-t border-white/10 py-1.5 px-3 flex justify-around text-[9px] text-slate-400 bg-[#0e1015]">
              <span>Início</span>
              <span className="text-[#f97316]">OS</span>
              <span>Clientes</span>
              <span>Financeiro</span>
              <span>Mais</span>
            </div>
          </div>
        </div>

        {/* PHONE 3: CLIENTES */}
        <div className="flex flex-col items-center">
          <span className="mb-2 text-xs font-bold text-[#f97316] uppercase tracking-wider bg-[#26180c] px-3 py-1 rounded-full border border-[#f97316]/30">
            3. Clientes
          </span>
          <div className="w-[280px] h-[580px] rounded-[38px] border-[6px] border-[#22252e] bg-[#0f1115] overflow-hidden shadow-2xl flex flex-col justify-between text-white relative">
            <div className="pt-2 px-5 flex justify-between text-[10px] text-slate-400">
              <span>9:41</span>
              <span>●●● 4G</span>
            </div>

            <div className="px-4 py-2 border-b border-white/5 text-xs font-bold text-left">
              <span>← Cadastro de Clientes</span>
            </div>

            <div className="flex-1 px-3 py-3 space-y-3 overflow-y-auto text-left text-[11px]">
              {/* Avatar circle */}
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
                  <Users className="h-8 w-8 text-slate-300" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Nome do Cliente</label>
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/10 text-white font-semibold">
                  Marcos Oliveira
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Telefone</label>
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/10 text-white font-mono">
                  (63) 99234-5678
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Endereço (opcional)</label>
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/10 text-slate-500">
                  Digite o endereço...
                </div>
              </div>

              {/* Green WhatsApp button */}
              <button 
                onClick={() => sendWhatsApp('63992345678', 'Olá Marcos Oliveira, aqui é da WR Mecânica!')}
                className="w-full bg-[#25D366] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Abrir WhatsApp</span>
              </button>

              {/* Histórico */}
              <div className="pt-2">
                <div className="flex justify-between text-[10px] text-slate-300 font-bold mb-1.5">
                  <span>Histórico de atendimentos</span>
                  <span className="text-[#f97316] text-[9px]">Ver todos →</span>
                </div>
                <div className="space-y-1.5">
                  <div className="bg-[#1c1e26] p-2 rounded-lg flex justify-between items-center text-[10px]">
                    <span className="font-bold text-amber-400">OS #1024</span>
                    <span className="text-slate-400">15/11/2025</span>
                    <ChevronRight className="h-3 w-3 text-slate-500" />
                  </div>
                  <div className="bg-[#1c1e26] p-2 rounded-lg flex justify-between items-center text-[10px]">
                    <span className="font-bold text-amber-400">OS #0987</span>
                    <span className="text-slate-400">02/10/2025</span>
                    <ChevronRight className="h-3 w-3 text-slate-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 py-1.5 px-3 flex justify-around text-[9px] text-slate-400 bg-[#0e1015]">
              <span>Início</span>
              <span>OS</span>
              <span className="text-[#f97316]">Clientes</span>
              <span>Financeiro</span>
              <span>Mais</span>
            </div>
          </div>
        </div>

        {/* PHONE 4: VEÍCULOS */}
        <div className="flex flex-col items-center">
          <span className="mb-2 text-xs font-bold text-[#f97316] uppercase tracking-wider bg-[#26180c] px-3 py-1 rounded-full border border-[#f97316]/30">
            4. Veículos
          </span>
          <div className="w-[280px] h-[580px] rounded-[38px] border-[6px] border-[#22252e] bg-[#0f1115] overflow-hidden shadow-2xl flex flex-col justify-between text-white relative">
            <div className="pt-2 px-5 flex justify-between text-[10px] text-slate-400">
              <span>9:41</span>
              <span>●●● 4G</span>
            </div>

            <div className="px-4 py-2 border-b border-white/5 text-xs font-bold text-left">
              <span>← Veículos</span>
            </div>

            <div className="flex-1 px-3 py-3 space-y-3 overflow-y-auto text-left">
              {/* Car photo */}
              <div className="h-32 w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center p-2">
                <img src="/assets/car-exemplar.png" alt="Honda Civic" className="w-full h-full object-contain filter drop-shadow" />
              </div>

              {/* Specs */}
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-white">Honda Civic</h4>
                <p className="text-[11px] text-slate-400 font-mono">Placa: QWE1A23</p>
                <p className="text-[11px] text-slate-400">Ano: 2022</p>
              </div>

              <div className="pt-2 border-t border-white/5 text-[11px]">
                <span className="text-[10px] text-slate-500 block mb-1">Cliente</span>
                <div className="flex items-center gap-2 text-slate-200">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold">Marcos Oliveira</span>
                </div>
              </div>

              {/* Editar Veículo Button */}
              <button className="w-full border border-[#f97316] text-[#f97316] font-bold py-2 rounded-xl text-xs hover:bg-[#f97316] hover:text-black transition-colors mt-4">
                Editar Veículo
              </button>
            </div>

            <div className="border-t border-white/10 py-1.5 px-3 flex justify-around text-[9px] text-slate-400 bg-[#0e1015]">
              <span>Início</span>
              <span>OS</span>
              <span>Clientes</span>
              <span>Financeiro</span>
              <span className="text-[#f97316]">Mais</span>
            </div>
          </div>
        </div>

        {/* PHONE 5: ESTOQUE */}
        <div className="flex flex-col items-center">
          <span className="mb-2 text-xs font-bold text-[#f97316] uppercase tracking-wider bg-[#26180c] px-3 py-1 rounded-full border border-[#f97316]/30">
            5. Estoque
          </span>
          <div className="w-[280px] h-[580px] rounded-[38px] border-[6px] border-[#22252e] bg-[#0f1115] overflow-hidden shadow-2xl flex flex-col justify-between text-white relative">
            <div className="pt-2 px-5 flex justify-between text-[10px] text-slate-400">
              <span>9:41</span>
              <span>●●● 4G</span>
            </div>

            <div className="px-4 py-2 border-b border-white/5 text-xs font-bold text-left">
              <span>← Estoque</span>
            </div>

            <div className="flex-1 px-3 py-2 space-y-2.5 overflow-y-auto text-left">
              {/* Search */}
              <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/10 flex items-center gap-2 text-xs text-slate-400">
                <Search className="h-3.5 w-3.5 text-slate-500" />
                <span>Buscar peça...</span>
              </div>

              {/* Items List matching Image 1 */}
              <div className="space-y-2">
                {[
                  { name: 'Filtro de Óleo', cod: 'FL-1001', qty: 40, status: 'OK', ok: true },
                  { name: 'Pastilha de Freio', cod: 'PB-002', qty: 32, status: 'Baixo', ok: false },
                  { name: 'Óleo 5W30', cod: 'OL-003', qty: 25, status: 'OK', ok: true },
                  { name: 'Bateria 60Ah', cod: 'BT-004', qty: 8, status: 'Baixo', ok: false },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#1c1e26] p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Cod: {item.cod}</p>
                      <p className="text-[10px] text-slate-400">Estoque: {item.qty} un.</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.ok 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Product Button */}
              <button className="w-full bg-[#f97316] text-black font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md mt-2 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar Produto</span>
              </button>
            </div>

            <div className="border-t border-white/10 py-1.5 px-3 flex justify-around text-[9px] text-slate-400 bg-[#0e1015]">
              <span>Início</span>
              <span>OS</span>
              <span>Clientes</span>
              <span>Financeiro</span>
              <span className="text-[#f97316]">Mais</span>
            </div>
          </div>
        </div>

        {/* PHONE 6: FINANCEIRO */}
        <div className="flex flex-col items-center">
          <span className="mb-2 text-xs font-bold text-[#f97316] uppercase tracking-wider bg-[#26180c] px-3 py-1 rounded-full border border-[#f97316]/30">
            6. Financeiro
          </span>
          <div className="w-[280px] h-[580px] rounded-[38px] border-[6px] border-[#22252e] bg-[#0f1115] overflow-hidden shadow-2xl flex flex-col justify-between text-white relative">
            <div className="pt-2 px-5 flex justify-between text-[10px] text-slate-400">
              <span>9:41</span>
              <span>●●● 4G</span>
            </div>

            <div className="px-4 py-2 border-b border-white/5 text-xs font-bold text-left">
              <span>← Financeiro</span>
            </div>

            <div className="flex-1 px-3 py-2 space-y-2 overflow-y-auto text-left text-[11px]">
              {/* Tabs: Resumo | Contas | Fluxo */}
              <div className="flex gap-1 bg-[#1a1c22] p-1 rounded-lg">
                <button className="flex-1 bg-[#f97316] text-black font-bold rounded py-1 text-[10px]">Resumo</button>
                <button className="flex-1 text-slate-400 py-1 text-[10px]">Contas</button>
                <button className="flex-1 text-slate-400 py-1 text-[10px]">Fluxo</button>
              </div>

              {/* Receitas vs Despesas */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Receitas</span>
                  </div>
                  <p className="font-bold text-emerald-400 mt-1">R$ 18.750,00</p>
                </div>
                <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1 text-rose-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Despesas</span>
                  </div>
                  <p className="font-bold text-rose-400 mt-1">R$ 10.430,00</p>
                </div>
              </div>

              {/* Saldo Atual (Gold Money Bag) */}
              <div className="bg-[#1c1e26] p-3 rounded-xl border border-amber-500/30 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Saldo Atual</span>
                  <span className="text-base font-black text-amber-400">R$ 8.320,00</span>
                </div>
              </div>

              {/* Contas a receber */}
              <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/5">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-300">Contas a receber</span>
                  <span className="text-[#f97316] text-[9px]">Ver todas →</span>
                </div>
                <div className="text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Cliente: Marcos Oliveira</span>
                    <span className="font-bold text-emerald-400">R$ 800,00</span>
                  </div>
                  <span className="text-[9px] text-slate-500">Vencimento: 15/11/2025</span>
                </div>
              </div>

              {/* Contas a pagar */}
              <div className="bg-[#1c1e26] p-2 rounded-lg border border-white/5">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-300">Contas a pagar</span>
                  <span className="text-[#f97316] text-[9px]">Ver todas →</span>
                </div>
                <div className="text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Fornecedor: Auto Peças</span>
                    <span className="font-bold text-rose-400">R$ 1.230,00</span>
                  </div>
                  <span className="text-[9px] text-slate-500">Vencimento: 20/11/2025</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 py-1.5 px-3 flex justify-around text-[9px] text-slate-400 bg-[#0e1015]">
              <span>Início</span>
              <span>OS</span>
              <span>Clientes</span>
              <span className="text-[#f97316]">Financeiro</span>
              <span>Mais</span>
            </div>
          </div>
        </div>

        {/* PHONE 7: RELATÓRIOS */}
        <div className="flex flex-col items-center">
          <span className="mb-2 text-xs font-bold text-[#f97316] uppercase tracking-wider bg-[#26180c] px-3 py-1 rounded-full border border-[#f97316]/30">
            7. Relatórios
          </span>
          <div className="w-[280px] h-[580px] rounded-[38px] border-[6px] border-[#22252e] bg-[#0f1115] overflow-hidden shadow-2xl flex flex-col justify-between text-white relative">
            <div className="pt-2 px-5 flex justify-between text-[10px] text-slate-400">
              <span>9:41</span>
              <span>●●● 4G</span>
            </div>

            <div className="px-4 py-2 border-b border-white/5 text-xs font-bold text-left">
              <span>← Relatórios</span>
            </div>

            <div className="flex-1 px-3 py-3 space-y-2 overflow-y-auto text-left">
              {[
                { title: 'Serviços realizados', sub: 'Relatório de serviços', icon: Wrench },
                { title: 'Faturamento', sub: 'Relatório de faturamento', icon: TrendingUp },
                { title: 'Clientes', sub: 'Relatório de clientes', icon: Users },
                { title: 'Estoque', sub: 'Relatório de estoque', icon: Package },
                { title: 'Financeiro', sub: 'Relatório financeiro', icon: DollarSign },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="bg-[#1c1e26] p-2.5 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-amber-500/40">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{item.title}</p>
                        <p className="text-[9px] text-slate-400">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                )
              })}
            </div>

            <div className="border-t border-white/10 py-1.5 px-3 flex justify-around text-[9px] text-slate-400 bg-[#0e1015]">
              <span>Início</span>
              <span>OS</span>
              <span>Clientes</span>
              <span>Financeiro</span>
              <span className="text-[#f97316]">Mais</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
