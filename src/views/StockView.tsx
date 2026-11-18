import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  X
} from 'lucide-react'

export const StockView: React.FC = () => {
  const { stock, addStockItem, adjustStockQuantity, formatCurrency } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // New stock form
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Geral')
  const [quantity, setQuantity] = useState(10)
  const [minQuantity, setMinQuantity] = useState(5)
  const [costPrice, setCostPrice] = useState(50)
  const [sellingPrice, setSellingPrice] = useState(95)

  const filteredStock = stock.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code) return

    addStockItem({
      code: code.toUpperCase(),
      name,
      category,
      quantity,
      minQuantity,
      costPrice,
      sellingPrice
    })

    setIsAddModalOpen(false)
    setCode('')
    setName('')
    setQuantity(10)
    setMinQuantity(5)
  }

  return (
    <div className="space-y-6 pb-12 max-w-[1440px] mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#FFFFFF] flex items-center gap-2">
            <Package className="h-5 w-5 text-[#FF8500]" strokeWidth={1.75} />
            Estoque de Peças e Produtos
          </h2>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Controle de itens em almoxarifado, custos, margens e alertas de reposição
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] px-4 py-2.5 text-xs font-bold text-[#080808] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" strokeWidth={2.5} />
          Adicionar Produto
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-80">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A5A5A5]" strokeWidth={1.75} />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar peça..."
          className="w-full rounded-xl border border-[#262626] bg-[#151515] py-2.5 pl-10 pr-4 text-xs text-[#FFFFFF] placeholder-[#A5A5A5] focus:border-[#FF8500] focus:outline-none"
        />
      </div>

      {/* Stock Items List */}
      <div className="space-y-3">
        {filteredStock.map(item => {
          const isLow = item.status === 'Baixo'

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[#262626] bg-[#151515] shadow-sm hover:border-[#383838] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-[#202020] border border-[#262626] flex items-center justify-center text-[#FF8500] shrink-0">
                  <Package className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#FFFFFF]">{item.name}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-[#A5A5A5] mt-0.5">
                    <span className="font-mono text-[#E5A51B] font-semibold">Cod: {item.code}</span>
                    <span>•</span>
                    <span>Estoque: {item.quantity} un.</span>
                    <span>•</span>
                    <span className="text-[#FFFFFF] font-mono font-medium">Preço: {formatCurrency(item.sellingPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Status pill & adjustments */}
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-md text-[10px] font-bold ${
                  isLow
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {item.status}
                </span>

                <div className="flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#202020] p-1">
                  <button
                    onClick={() => adjustStockQuantity(item.id, -1)}
                    disabled={item.quantity <= 0}
                    className="h-6 w-6 rounded text-[#A5A5A5] hover:text-[#FFFFFF] disabled:opacity-30 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="px-2 font-mono text-xs font-bold text-[#FFFFFF]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => adjustStockQuantity(item.id, 1)}
                    className="h-6 w-6 rounded text-[#A5A5A5] hover:text-[#FFFFFF] text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: Adicionar Produto */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-[#262626] bg-[#151515] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#262626]">
              <h3 className="text-sm font-bold text-[#FFFFFF]">Adicionar Produto</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-1 text-[#A5A5A5] hover:text-[#FFFFFF]">
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Código</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Ex: FL-1001"
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] font-mono uppercase focus:border-[#FF8500] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Categoria</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Ex: Filtros"
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A5A5A5] font-semibold mb-1">Nome da Peça</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Filtro de Óleo"
                  className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Mínimo para Alerta</label>
                  <input
                    type="number"
                    value={minQuantity}
                    onChange={e => setMinQuantity(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Preço de Custo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={e => setCostPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Preço de Venda</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#FF8500] hover:bg-[#D96A00] py-3 text-xs font-bold text-[#080808] shadow-sm transition-colors mt-2"
              >
                Salvar Produto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
