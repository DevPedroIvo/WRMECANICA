import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { WrLogo } from './WrLogo'
import { ShieldCheck, Users, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'

export const LoginModal: React.FC = () => {
  const { login } = useApp()
  const [selectedRole, setSelectedRole] = useState<'dono' | 'funcionario'>('dono')
  const [username, setUsername] = useState('Samilly Martins')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleRoleSelect = (role: 'dono' | 'funcionario') => {
    setSelectedRole(role)
    setErrorMsg('')
    if (role === 'dono') {
      setUsername('Samilly Martins')
      setPassword('')
    } else {
      setUsername('Wr_mecanica')
      setPassword('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Preencha o usuário e a senha.')
      return
    }

    const res = login(username, password)
    if (!res.success) {
      setErrorMsg('Usuário ou senha incorretos! Verifique os dados.')
    }
  }

  const handleQuickLogin = (role: 'dono' | 'funcionario') => {
    if (role === 'dono') {
      login('Samilly Martins', 'Sami2026@')
    } else {
      login('Wr_mecanica', 'We2023@')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div className="w-full max-w-md rounded-3xl border border-wr-border bg-wr-surface p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Header com Logo Vetorizada Oficial */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <WrLogo size="lg" showSubtitle={true} />
          </div>
          <p className="text-xs text-wr-muted font-medium">
            Acesso Restrito &bull; Gestão Automotiva
          </p>
        </div>

        {/* Seleção do Perfil (Dono vs Funcionários) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleRoleSelect('dono')}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              selectedRole === 'dono'
                ? 'border-wr-orange bg-wr-orange/15 text-wr-orange shadow-md'
                : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Dono</span>
            <span className="text-[10px] text-wr-muted truncate max-w-full">Samilly Martins</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('funcionario')}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              selectedRole === 'funcionario'
                ? 'border-wr-gold bg-wr-gold/15 text-wr-gold shadow-md'
                : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text'
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Funcionários</span>
            <span className="text-[10px] text-wr-muted font-mono">Wr_mecanica</span>
          </button>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-wr-muted mb-1 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-wr-orange" /> Usuário
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => {
                setUsername(e.target.value)
                setErrorMsg('')
              }}
              placeholder="Digite o usuário..."
              className="wr-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-wr-muted mb-1 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-wr-orange" /> Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setErrorMsg('')
                }}
                placeholder="Digite a senha..."
                className="wr-input pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-wr-muted hover:text-wr-text"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-500 animate-fadeIn text-center">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full wr-btn-primary py-3 justify-center text-xs font-bold uppercase tracking-wider mt-1"
          >
            Entrar no Sistema <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Acesso rápido em 1 clique com as credenciais cadastradas */}
        <div className="pt-3 border-t border-wr-border text-center space-y-2">
          <span className="text-[10px] uppercase font-bold text-wr-muted block">
            Atalho rápido de acesso
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('dono')}
              className="rounded-xl border border-wr-border bg-wr-elevated hover:border-wr-orange p-2 text-left transition-colors"
            >
              <span className="font-bold text-xs text-wr-text block truncate">Samilly Martins</span>
              <span className="text-[10px] text-wr-muted font-mono">Dono &bull; Total</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('funcionario')}
              className="rounded-xl border border-wr-border bg-wr-elevated hover:border-wr-gold p-2 text-left transition-colors"
            >
              <span className="font-bold text-xs text-wr-text block truncate">Wr_mecanica</span>
              <span className="text-[10px] text-wr-muted font-mono">Funcionários</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
