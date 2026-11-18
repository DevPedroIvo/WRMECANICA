import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { DashboardView } from './views/DashboardView'
import { AppointmentsView } from './views/AppointmentsView'
import { OrdersView } from './views/OrdersView'
import { ClientsView } from './views/ClientsView'
import { VehiclesView } from './views/VehiclesView'
import { StockView } from './views/StockView'
import { FinancialView } from './views/FinancialView'
import { ReportsView } from './views/ReportsView'
import { SettingsView } from './views/SettingsView'

const MainAppContent: React.FC = () => {
  const { activeTab } = useApp()

  const renderActiveView = () => {
    switch (activeTab) {
      case 'inicio':
        return <DashboardView />
      case 'atendimentos':
        return <AppointmentsView />
      case 'os':
        return <OrdersView />
      case 'clientes':
        return <ClientsView />
      case 'veiculos':
        return <VehiclesView />
      case 'estoque':
        return <StockView />
      case 'financeiro':
        return <FinancialView />
      case 'relatorios':
        return <ReportsView />
      case 'configuracoes':
        return <SettingsView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen text-[#FFFFFF] font-sans selection:bg-[#FF8500] selection:text-[#080808]">
      {/* Menu Lateral Fixo */}
      <Sidebar />

      {/* Área Principal Desktop */}
      <div className="ml-64 flex min-h-screen flex-col">
        {/* Cabeçalho Superior Fixo */}
        <Header />

        {/* Conteúdo Principal com largura máxima 1440px */}
        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-[1440px]">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  )
}

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  )
}

export default App
