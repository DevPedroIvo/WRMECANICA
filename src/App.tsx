import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { BottomNav } from './components/BottomNav'
import { DashboardView } from './views/DashboardView'
import { AppointmentsView } from './views/AppointmentsView'
import { OrdersView } from './views/OrdersView'
import { ClientsView } from './views/ClientsView'
import { DeferredPaymentsView } from './views/DeferredPaymentsView'
import { StockView } from './views/StockView'
import { FinancialView } from './views/FinancialView'
import { ReportsView } from './views/ReportsView'
import { SettingsView } from './views/SettingsView'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

const MainAppContent: React.FC = () => {
  const { activeTab, toasts, dismissToast } = useApp()

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
      case 'fiado':
        return <DeferredPaymentsView />
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
    <div className="min-h-screen bg-wr-bg text-wr-text font-sans transition-colors duration-200">
      {/* Menu Lateral Responsivo */}
      <Sidebar />

      {/* Área Principal */}
      <div className="lg:pl-64 flex min-h-screen flex-col">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
          <div className="mx-auto max-w-[1440px]">{renderActiveView()}</div>
        </main>
      </div>

      {/* Navegação Mobile */}
      <BottomNav />

      {/* Toasts Flutuantes */}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border border-wr-border bg-wr-surface px-4 py-3 text-xs font-semibold text-wr-text shadow-elevated animate-fadeIn"
            >
              <div className="flex items-center gap-2.5">
                {toast.type === 'success' && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                )}
                {toast.type === 'info' && (
                  <Info className="h-4 w-4 text-wr-orange shrink-0" />
                )}
                {toast.type === 'warning' && (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-wr-muted hover:text-wr-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
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
