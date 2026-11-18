import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Vehicle } from '../types'
import {
  Car,
  Search,
  Plus,
  User,
  Calendar,
  Gauge,
  Wrench,
  X,
  Edit2
} from 'lucide-react'

export const VehiclesView: React.FC = () => {
  const { vehicles, clients, addVehicle, updateVehicle, setActiveTab } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  // Form state
  const [clientId, setClientId] = useState(clients[0]?.id || '')
  const [brand, setBrand] = useState('Honda')
  const [model, setModel] = useState('Civic')
  const [plate, setPlate] = useState('QWE1A23')
  const [year, setYear] = useState(2022)
  const [color, setColor] = useState('Preto')
  const [mileage, setMileage] = useState(48500)
  const [photoUrl, setPhotoUrl] = useState('/assets/car-exemplar.png')

  const filteredVehicles = vehicles.filter(v =>
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.clientName && v.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault()
    const client = clients.find(c => c.id === clientId)
    const clientName = client?.name || 'Cliente'

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
        clientId,
        clientName,
        brand,
        model,
        plate: plate.toUpperCase(),
        year,
        color,
        currentMileage: mileage,
        photoUrl
      })
      setEditingVehicle(null)
    } else {
      addVehicle({
        clientId,
        clientName,
        brand,
        model,
        plate: plate.toUpperCase(),
        year,
        color,
        currentMileage: mileage,
        photoUrl
      })
      setIsAddModalOpen(false)
    }
  }

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v)
    setClientId(v.clientId)
    setBrand(v.brand)
    setModel(v.model)
    setPlate(v.plate)
    setYear(v.year)
    setColor(v.color || 'Preto')
    setMileage(v.currentMileage)
    setPhotoUrl(v.photoUrl || '/assets/car-exemplar.png')
  }

  return (
    <div className="space-y-6 pb-12 max-w-[1440px] mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#FFFFFF] flex items-center gap-2">
            <Car className="h-5 w-5 text-[#FF8500]" strokeWidth={1.75} />
            Frota de Veículos
          </h2>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Veículos cadastrados, placas, histórico e clientes vinculados
          </p>
        </div>

        <button
          onClick={() => {
            setEditingVehicle(null)
            setIsAddModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-[#FF8500] hover:bg-[#D96A00] px-4 py-2.5 text-xs font-bold text-[#080808] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" strokeWidth={2.5} />
          Cadastrar Veículo
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A5A5A5]" strokeWidth={1.75} />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por placa, modelo ou cliente..."
          className="w-full rounded-xl border border-[#262626] bg-[#151515] py-2.5 pl-10 pr-4 text-xs text-[#FFFFFF] placeholder-[#A5A5A5] focus:border-[#FF8500] focus:outline-none"
        />
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => (
          <div
            key={vehicle.id}
            className="rounded-2xl border border-[#262626] bg-[#151515] overflow-hidden shadow-xl flex flex-col justify-between hover:border-[#383838] transition-all"
          >
            <div>
              {/* Car Photo Banner */}
              <div className="relative h-44 w-full bg-[#080808] flex items-center justify-center p-3 border-b border-[#262626]">
                <img
                  src={vehicle.photoUrl || '/assets/car-exemplar.png'}
                  alt={vehicle.model}
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Vehicle Specs */}
              <div className="p-5 text-center space-y-1.5">
                <h3 className="text-base font-bold text-[#FFFFFF]">{vehicle.brand} {vehicle.model}</h3>
                <p className="text-xs text-[#E5A51B] font-mono font-semibold">Placa: {vehicle.plate}</p>
                <p className="text-xs text-[#A5A5A5]">Ano: {vehicle.year}</p>

                <div className="pt-3 text-left border-t border-[#262626] mt-3">
                  <span className="text-[10px] text-[#A5A5A5] uppercase block mb-1">Cliente Proprietário</span>
                  <div className="flex items-center gap-2 text-[#FFFFFF] text-xs">
                    <User className="h-4 w-4 text-[#A5A5A5]" strokeWidth={1.75} />
                    <span className="font-semibold">{vehicle.clientName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 space-y-2">
              <button
                onClick={() => openEdit(vehicle)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#FF8500] bg-transparent py-2.5 text-xs font-bold text-[#FF8500] hover:bg-[#FF8500] hover:text-[#080808] transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Editar Veículo</span>
              </button>

              <button
                onClick={() => setActiveTab('os')}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#262626] bg-[#202020] py-2 text-xs font-semibold text-[#A5A5A5] hover:text-[#FFFFFF] transition-all"
              >
                <Wrench className="h-3.5 w-3.5 text-[#FF8500]" strokeWidth={1.75} />
                <span>Criar Ordem de Serviço</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Adicionar / Editar */}
      {(isAddModalOpen || editingVehicle) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-[#262626] bg-[#151515] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#262626]">
              <h3 className="text-sm font-bold text-[#FFFFFF]">
                {editingVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingVehicle(null)
                }}
                className="rounded-full p-1 text-[#A5A5A5] hover:text-[#FFFFFF]"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[#A5A5A5] font-semibold mb-1">Cliente</label>
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Marca</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Modelo</label>
                  <input
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Placa</label>
                  <input
                    type="text"
                    value={plate}
                    onChange={e => setPlate(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] font-mono uppercase focus:border-[#FF8500] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A5A5A5] font-semibold mb-1">Ano</label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#262626] bg-[#202020] p-2.5 text-xs text-[#FFFFFF] focus:border-[#FF8500] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#FF8500] hover:bg-[#D96A00] py-3 text-xs font-bold text-[#080808] shadow-sm transition-colors mt-2"
              >
                Salvar Veículo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
