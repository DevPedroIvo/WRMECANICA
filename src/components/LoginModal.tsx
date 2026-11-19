import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { WrLogo } from './WrLogo'
import { ShieldCheck, UserCheck, KeyRound, Lock, ArrowRight, Delete } from 'lucide-react'
import { UserRole } from '../types'

export const LoginModal: React.FC = () => {
  const { login } = useApp()
  const [selectedRole, setSelectedRole] = useState<UserRole>('dono')
  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit
      setPin(next)
      setErrorMsg('')
      if (next.length === 4) {
        attemptLogin(next)
      }
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
    setErrorMsg('')
  }

  const handleClear = () => {
    setPin('')
    setErrorMsg('')
  }

  const attemptLogin = (codeToTest: string) => {
    const res = login(codeToTest)
    if (!res.success) {
      setErrorMsg('Senha incorreta! Dono: 2026 | Caixa: 1234')
      setPin('')
    }
  }

  const quickLogin = (role: UserRole) => {
    const defaultPin = role === 'dono' ? '2026' : '1234'
    login(defaultPin)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div className="w-full max-w-md rounded-3xl border border-wr-border bg-wr-surface p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header com Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <WrLogo size="lg" showSubtitle={true} />
          </div>
          <p className="text-xs text-wr-muted font-medium">
            Sistema de Gestão &amp; Oficina Automotiva
          </p>
        </div>

        {/* Seleção do Perfil (Dono vs Caixa) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('dono')
              setPin('')
              setErrorMsg('')
            }}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              selectedRole === 'dono'
                ? 'border-wr-orange bg-wr-orange/15 text-wr-orange shadow-md'
                : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Dono</span>
            <span className="text-[10px] text-wr-muted font-mono">Senha: 2026</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('caixa')
              setPin('')
              setErrorMsg('')
            }}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              selectedRole === 'caixa'
                ? 'border-wr-gold bg-wr-gold/15 text-wr-gold shadow-md'
                : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text'
            }`}
          >
            <UserCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Caixa</span>
            <span className="text-[10px] text-wr-muted font-mono">Senha: 1234</span>
          </button>
        </div>

        {/* Display do PIN (4 bolinhas) */}
        <div className="text-center space-y-2">
          <span className="text-xs text-wr-muted font-semibold flex items-center justify-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-wr-orange" />
            Digite o PIN de 4 dígitos ({selectedRole === 'dono' ? 'Dono' : 'Caixa'})
          </span>

          <div className="flex justify-center items-center gap-4 py-2">
            {[0, 1, 2, 3].map(idx => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? 'bg-wr-orange border-wr-orange scale-110 shadow-sm'
                    : 'border-wr-border bg-wr-elevated'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-[11px] font-bold text-rose-500 animate-fadeIn">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Teclado Numérico */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-2xl border border-wr-border bg-wr-elevated text-lg font-bold text-wr-text hover:bg-wr-orange hover:text-white dark:hover:text-[#0B0C10] hover:border-wr-orange active:scale-95 transition-all shadow-sm flex items-center justify-center font-mono"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl border border-wr-border bg-wr-elevated text-xs font-bold text-wr-muted hover:text-rose-500 active:scale-95 transition-all flex items-center justify-center uppercase tracking-wider"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl border border-wr-border bg-wr-elevated text-lg font-bold text-wr-text hover:bg-wr-orange hover:text-white dark:hover:text-[#0B0C10] hover:border-wr-orange active:scale-95 transition-all shadow-sm flex items-center justify-center font-mono"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-2xl border border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text active:scale-95 transition-all flex items-center justify-center"
            aria-label="Apagar dígito"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Botão de Acesso Rápido */}
        <div className="pt-2 border-t border-wr-border text-center space-y-2">
          <button
            type="button"
            onClick={() => quickLogin(selectedRole)}
            className="w-full wr-btn-primary py-2.5 justify-center text-xs font-bold uppercase tracking-wider"
          >
            Entrar como {selectedRole === 'dono' ? 'Dono (2026)' : 'Caixa (1234)'} <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-[10px] text-wr-muted">
            Dono tem acesso total • Caixa tem acesso ao caixa diário, ordens e atendimentos
          </p>
        </div>
      </div>
    </div>
  )
}
