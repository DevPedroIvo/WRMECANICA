import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Client } from '../types'
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  ChevronRight,
  X,
  UserCheck
} from 'lucide-react'

export const ClientsView: React.FC = () => {
  const { clients, orders, addClient, sendWhatsApp } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client>(clients[0] || null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // New Client Form
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newAddress, setNewAddress] = useState('')

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  )

  const clientOrders = selectedClient ? orders.filter(o => o.clientId === selectedClient.id) : []

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newPhone) return
    const created = addClient({
      name: newName,
      phone: newPhone,
      address: newAddress,
    })
    setSelectedClient(created)
    setIsAddModalOpen(false)
    setNewName('')
    setNewPhone('')
    setNewAddress('')
  }

  return (
    <div className="space-y-6 pb-12 max-w-[1440px] mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#FFFFFF] flex items-center gap-2">
            <Users className="h-5 w-5 text-[#FF8500]" strokeWidth={1.75} />
            Clientes da Oficina
          </h2>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Cadastros, histórico de atendimentos e contato via WhatsApp
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] px-4 py-2.5 text-xs font-bold text-[#080808] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" strokeWidth={2.5} />
          Cadastrar Cliente
        </button>
      </div>

      {/* Main Grid: Directory on Left, Detailed Profile on Right */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left List (5 cols) */}
        <div className="col-span-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A5A5A5]" strokeWidth={1.75} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente por nome ou telefone..."
              className="w-full rounded-xl border border-[#262626] bg-[#151515] py-2.5 pl-10 pr-4 text-xs text-[#FFFFFF] placeholder-[#A5A5A5] focus:border-[#FF8500] focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredClients.map(client => {
              const isSelected = selectedClient?.id === client.id
              const clientOrderCount = orders.filter(o => o.clientId === client.id).length
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FF8500] bg-[#202020] shadow-sm'
                      : 'border-[#262626] bg-[#151515] hover:border-[#383838]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#202020] border border-[#262626] flex items-center justify-center text-[#FF8500] font-bold text-xs shrink-0">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#FFFFFF]">{client.name}</h4>
                      <p className="text-[11px] text-[#A5A5A5] mt-0.5 font-mono">{client.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#202020] px-2 py-0.5 text-[10px] font-bold text-[#E5A51B] border border-[#262626]">
                      {clientOrderCount} OS
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#A5A5A5]" strokeWidth={1.75} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Card: Cadastro de Clientes (7 cols) */}
        {selectedClient && (
          <div className="col-span-7">
            <div className="rounded-2xl border border-[#262626] bg-[#151515] p-7 shadow-xl space-y-5">
              
              {/* Profile Avatar */}
              <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b border-[#262626]">
                <div className="h-20 w-20 rounded-full bg-[#202020] border border-[#262626] flex items-center justify-center text-[#FF8500]">
                  <Users className="h-9 w-9" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#FFFFFF]">{selectedClient.name}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 mt-1 border border-emerald-500/20">
                    <UserCheck className="h-3 w-3" strokeWidth={2} /> Cliente Ativo
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5 text-xs text-left">
                <div>
                  <label className="text-[10px] text-[#A5A5A5] font-semibold uppercase block mb-1">
                    Nome do Cliente
                  </label>
                  <div className="rounded-xl border border-[#262626] bg-[#202020] px-3.5 py-2.5 text-[#FFFFFF] font-medium">
                    {selectedClient.name}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#A5A5A5] font-semibold uppercase block mb-1">
                    Telefone
                  </label>
                  <div className="rounded-xl border border-[#262626] bg-[#202020] px-3.5 py-2.5 text-[#FFFFFF] font-mono">
                    {selectedClient.phone}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#A5A5A5] font-semibold uppercase block mb-1">
                    Endereço
                  </label>
                  <div className="rounded-xl border border-[#262626] bg-[#202020] px-3.5 py-2.5 text-[#A5A5A5]">
                    {selectedClient.address || 'Digite o endereço...'}
                  </div>
                </div>

                {/* WhatsApp Button */}
                <button
                  onClick={() => sendWhatsApp(
                    selectedClient.phone,
                    `Olá ${selectedClient.name}! Aqui é da WR Mecânica & Cia. Como podemos te ajudar hoje?`
                  )}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all mt-2"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  <span>Abrir WhatsApp</span>
                </button>
              </div>

              {/* Histórico de Atendimentos */}
              <div className="pt-3 border-t border-[#262626]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#FFFFFF]">
                    Histórico de atendimentos
                  </h4>
                  <span className="text-[11px] font-semibold text-[#FF8500]">
                    Total: {clientOrders.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {clientOrders.length === 0 ? (
                    <div className="bg-[#202020] p-3 rounded-xl border border-[#262626] flex justify-between items-center text-xs">
                      <span className="font-bold text-[#E5A51B]">OS #1024</span>
                      <span className="text-[#A5A5A5]">15/11/2025</span>
                      <ChevronRight className="h-4 w-4 text-[#A5A5A5]" strokeWidth={1.75} />
                    </div>
                  ) : (
                    clientOrders.map(order => (
                      <div
                        key={order.id}
                        className="bg-[#202020] p-3 rounded-xl border border-[#262626] flex justify-between items-center text-xs hover:border-[#383838] transition-colors"
                      >
                        <span className="font-bold text-[#E5A51B] font-mono">{order.number}</span>
                        <span className="text-[#A5A5A5]">{order.date}</span>
                        <ChevronRight className="h-4 w-4 text-[#A5A5A5]" strokeWidth={1.75} />
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Modal: Novo Cliente */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-[#262626] bg-[#151515] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#262626]">
              <h3 className="text-sm font-bold text-[#FFFFFF]">Cadastrar Novo Cliente</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-1 text-[#A5A5A5] hover:text-[#FFFFFF]">
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[#A5A5A5] font-semibold mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A5A5A5] font-semibold mb-1">Telefone (com DDD)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="(63) 99234-5678"
                  className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] font-mono focus:border-[#FF8500] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A5A5A5] font-semibold mb-1">Endereço (opcional)</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  placeholder="Digite o endereço..."
                  className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#FF8500] hover:bg-[#D96A00] py-3 text-xs font-bold text-[#080808] shadow-sm transition-colors mt-2"
              >
                Salvar Cliente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
