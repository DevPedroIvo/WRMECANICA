import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Client } from '../types'
import { User, Phone, Check, Plus, Search, Car } from 'lucide-react'

interface ClientAutocompleteProps {
  value: string
  onChange: (name: string) => void
  onSelectClient?: (client: Client) => void
  onConfirmNewClientName?: (name: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  autoFocus?: boolean
}

export const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  value,
  onChange,
  onSelectClient,
  onConfirmNewClientName,
  placeholder = 'Digite o nome do cliente...',
  className = '',
  required = false,
  autoFocus = false,
}) => {
  const { clients, vehicles } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filtra clientes pelo que foi digitado (nome, telefone ou CPF)
  const filteredClients = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) {
      // Quando vazio, mostra os últimos 5 clientes cadastrados para escolha rápida
      return clients.slice(0, 5)
    }
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))) ||
      (c.cpfCnpj && c.cpfCnpj.includes(q))
    ).slice(0, 8)
  }, [clients, value])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (client: Client) => {
    onChange(client.name)
    if (onSelectClient) {
      onSelectClient(client)
    }
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Se pressionou Enter, fecha a listinha suspensa para não atrapalhar preencher outros campos
      if (filteredClients.length === 1 && value.trim().length > 1) {
        handleSelect(filteredClients[0])
      } else {
        setIsOpen(false)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          className={`wr-input pr-8 ${className}`}
        />
        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-wr-muted pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-wr-border bg-wr-surface shadow-2xl max-h-60 overflow-y-auto p-1.5 space-y-1 animate-fadeIn">
          {filteredClients.length > 0 ? (
            filteredClients.map(c => {
              const clientVehicles = vehicles.filter(v => v.clientId === c.id)
              const isSelected = c.name.toLowerCase() === value.trim().toLowerCase()

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-wr-orange/15 border border-wr-orange/30 text-wr-orange'
                      : 'hover:bg-wr-elevated text-wr-text'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs truncate">{c.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-wr-orange shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-wr-muted font-mono mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </span>
                      {clientVehicles.length > 0 && (
                        <span className="flex items-center gap-1 text-emerald-500 font-sans">
                          <Car className="h-3 w-3" /> {clientVehicles.length} veículo(s)
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-wr-orange px-2 py-0.5 rounded bg-wr-orange/10 shrink-0">
                    Selecionar
                  </span>
                </button>
              )
            })
          ) : (
            <div className="p-3 text-center space-y-2">
              <p className="text-xs text-wr-muted">
                Nenhum cliente cadastrado com "<strong>{value}</strong>".
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    if (onConfirmNewClientName) {
                      onConfirmNewClientName(value.trim())
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-wr-orange text-white text-xs font-bold shadow hover:bg-wr-orangeDark transition-all"
                >
                  OK, usar este usuário
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
