import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Package, Search, Plus, AlertTriangle, X, CheckCircle2, Camera, Scan } from 'lucide-react'
import { BarcodeScannerModal } from '../components/BarcodeScannerModal'

export const StockView: React.FC = () => {
  const { stock, addStockItem, adjustStockQuantity, formatCurrency } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [onlyLow, setOnlyLow] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scannerTarget, setScannerTarget] = useState<'search' | 'product_code'>('search')

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Geral')
  const [quantity, setQuantity] = useState(10)
  const [minQuantity, setMinQuantity] = useState(5)
  const [costPrice, setCostPrice] = useState(50)
  const [sellingPrice, setSellingPrice] = useState(95)

  const lowCount = stock.filter(s => s.status === 'Baixo').length
  const totalValue = stock.reduce((acc, s) => acc + s.quantity * s.sellingPrice, 0)

  const filteredStock = stock.filter(item => {
    if (onlyLow && item.status !== 'Baixo') return false
    const q = searchTerm.toLowerCase()
    return (
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    )
  })

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    addStockItem({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      category: category.trim(),
      quantity,
      minQuantity,
      costPrice,
      sellingPrice,
    })

    setIsAddModalOpen(false)
    setCode('')
    setName('')
    setQuantity(10)
    setMinQuantity(5)
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-wr-text flex items-center gap-2">
            <Package className="h-5 w-5 text-wr-orange" />
            Estoque de Peças e Produtos
          </h2>
          <p className="text-xs text-wr-muted mt-0.5">
            Controle de almoxarifado, preços e alertas automáticos de reposição
          </p>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="wr-btn-primary">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Adicionar Produto
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="wr-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-wr-muted font-semibold">Itens Cadastrados</span>
            <span className="text-2xl font-extrabold font-mono text-wr-text block mt-1">
              {stock.length}
            </span>
          </div>
          <Package className="h-5 w-5 text-wr-orange" />
        </div>

        <div className="wr-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-wr-muted font-semibold">Alerta de Estoque Baixo</span>
            <span className="text-2xl font-extrabold font-mono text-amber-500 block mt-1">
              {lowCount}
            </span>
          </div>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>

        <div className="wr-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-wr-muted font-semibold">Valor em Estoque (Venda)</span>
            <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
              {formatCurrency(totalValue)}
            </span>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
      </div>

      {/* Search & Quick Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wr-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar peça, código ou categoria..."
            className="wr-input pl-10"
          />
        </div>

        {/* Botão de Leitor de Código de Barras pela Câmera */}
        <button
          type="button"
          onClick={() => {
            setScannerTarget('search')
            setIsScannerOpen(true)
          }}
          className="wr-btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:border-wr-orange"
          title="Ler código de barras com a câmera do celular"
        >
          <Camera className="h-4 w-4 text-wr-orange" />
          <span>Escanear Código</span>
        </button>

        <button
          onClick={() => setOnlyLow(prev => !prev)}
          className={`rounded-xl px-3.5 py-2.5 text-xs font-bold border transition-colors ${
            onlyLow
              ? 'bg-amber-500 text-white dark:text-black border-amber-500'
              : 'bg-wr-surface text-wr-muted border-wr-border hover:text-wr-text'
          }`}
        >
          Apenas Estoque Baixo ({lowCount})
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filteredStock.map(item => {
          const isLow = item.status === 'Baixo'
          return (
            <div
              key={item.id}
              className="wr-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-wr-borderHover transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-wr-elevated border border-wr-border flex items-center justify-center text-wr-orange shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-wr-text">{item.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-wr-muted mt-0.5">
                    <span className="font-mono text-wr-gold font-semibold">{item.code}</span>
                    <span>•</span>
                    <span>{item.category}</span>
                    <span>•</span>
                    <span className="text-wr-text font-mono font-semibold">
                      {formatCurrency(item.sellingPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    isLow
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isLow ? 'Repor' : 'OK'}
                </span>

                <div className="flex items-center gap-1 rounded-xl border border-wr-border bg-wr-elevated p-1">
                  <button
                    onClick={() => adjustStockQuantity(item.id, -1)}
                    disabled={item.quantity <= 0}
                    className="h-7 w-7 rounded-lg text-wr-muted hover:text-wr-text hover:bg-wr-surface disabled:opacity-30 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-2.5 font-mono text-xs font-bold text-wr-text min-w-[32px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => adjustStockQuantity(item.id, 1)}
                    className="h-7 w-7 rounded-lg text-wr-muted hover:text-wr-text hover:bg-wr-surface text-sm font-bold"
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
        <div className="wr-modal-backdrop">
          <div className="wr-modal-panel max-w-md animate-fadeIn">
            <div className="flex items-center justify-between pb-3.5 border-b border-wr-border">
              <h3 className="text-sm font-bold text-wr-text">Adicionar Produto</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-wr-muted hover:text-wr-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-wr-muted font-semibold">Código *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerTarget('product_code')
                        setIsScannerOpen(true)
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-wr-orange hover:underline"
                      title="Ler código de barras pela câmera"
                    >
                      <Camera className="h-3 w-3" />
                      <span>Ler</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      placeholder="Ex: 7891234567890"
                      className="wr-input font-mono uppercase pr-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setScannerTarget('product_code')
                        setIsScannerOpen(true)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-wr-muted hover:text-wr-orange transition-colors"
                      title="Escanear com a câmera"
                    >
                      <Scan className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Categoria *</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Filtros"
                    className="wr-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-wr-muted font-semibold mb-1">Nome da Peça *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Filtro de Óleo"
                  className="wr-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="wr-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Mínimo Alerta</label>
                  <input
                    type="number"
                    value={minQuantity}
                    onChange={e => setMinQuantity(Number(e.target.value))}
                    className="wr-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={e => setCostPrice(Number(e.target.value))}
                    className="wr-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-wr-muted font-semibold mb-1">Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(Number(e.target.value))}
                    className="wr-input font-mono"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="wr-btn-primary w-full py-3 mt-1">
                Salvar Produto
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Scanner de Código de Barras via Câmera */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={scannedCode => {
          if (scannerTarget === 'product_code') {
            setCode(scannedCode)
          } else {
            setSearchTerm(scannedCode)
          }
        }}
      />
    </div>
  )
}
