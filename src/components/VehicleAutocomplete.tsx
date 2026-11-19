import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Vehicle } from '../types'
import { Car, Check } from 'lucide-react'

interface VehicleAutocompleteProps {
  clientId?: string
  modelValue: string
  plateValue: string
  onSelectVehicle?: (vehicle: Vehicle) => void
  onModelChange: (model: string) => void
  onPlateChange: (plate: string) => void
  className?: string
}

export const VehicleAutocomplete: React.FC<VehicleAutocompleteProps> = ({
  clientId,
  modelValue,
  plateValue,
  onSelectVehicle,
  onModelChange,
  onPlateChange,
  className = '',
}) => {
  const { vehicles } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Prioriza os veículos do cliente selecionado; se não houver cliente, busca em todos
  const availableVehicles = useMemo(() => {
    if (clientId) {
      const owned = vehicles.filter(v => v.clientId === clientId)
      if (owned.length > 0) return owned
    }
    return vehicles
  }, [vehicles, clientId])

  const filteredVehicles = useMemo(() => {
    const qModel = modelValue.trim().toLowerCase()
    const qPlate = plateValue.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

    if (!qModel && !qPlate) {
      return []
    }

    return availableVehicles.filter(v => {
      const matchModel = qModel ? `${v.brand} ${v.model}`.toLowerCase().includes(qModel) : true
      const matchPlate = qPlate ? v.plate.toLowerCase().replace(/[^a-z0-9]/g, '').includes(qPlate) : true
      return matchModel && matchPlate
    }).slice(0, 6)
  }, [availableVehicles, modelValue, plateValue])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (v: Vehicle) => {
    onModelChange(`${v.brand} ${v.model}`)
    onPlateChange(v.plate)
    if (onSelectVehicle) {
      onSelectVehicle(v)
    }
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setIsOpen(false)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-wr-muted mb-1">
            Modelo do Veículo
          </label>
          <div className="relative">
            <input
              type="text"
              value={modelValue}
              onChange={e => {
                onModelChange(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => {
                if (modelValue.trim().length > 0 || plateValue.trim().length > 0) {
                  setIsOpen(true)
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Fiat Strada 1.4"
              className="wr-input pr-8"
              required
            />
            <Car className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-wr-muted pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-wr-muted mb-1">
            Placa
          </label>
          <input
            type="text"
            value={plateValue}
            onChange={e => {
              onPlateChange(e.target.value.toUpperCase())
              setIsOpen(true)
            }}
            onFocus={() => {
              if (modelValue.trim().length > 0 || plateValue.trim().length > 0) {
                setIsOpen(true)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ex: BRA2E19"
            className="wr-input uppercase font-mono"
            required
          />
        </div>
      </div>

      {isOpen && (modelValue.trim().length > 0 || plateValue.trim().length > 0) && filteredVehicles.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-wr-border bg-wr-surface shadow-2xl max-h-56 overflow-y-auto p-1.5 space-y-1 animate-fadeIn">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-wr-muted border-b border-wr-border mb-1">
            {clientId ? 'Veículos vinculados a este cliente' : 'Veículos encontrados'}
          </div>
          {filteredVehicles.map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() => handleSelect(v)}
              className="w-full text-left p-2 rounded-xl hover:bg-wr-elevated transition-colors flex items-center justify-between gap-2"
            >
              <div>
                <span className="font-bold text-xs text-wr-text">
                  {v.brand} {v.model}
                </span>
                <span className="text-[10px] text-wr-muted block">
                  Ano: {v.year} • Cor: {v.color || 'Padrão'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-wr-orange bg-wr-orange/10 px-2 py-0.5 rounded border border-wr-orange/20">
                  {v.plate}
                </span>
                <Check className="h-3.5 w-3.5 text-wr-muted hover:text-wr-orange" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
