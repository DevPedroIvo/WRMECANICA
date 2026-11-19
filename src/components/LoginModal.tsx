import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { WrLogo } from './WrLogo'
import { ShieldCheck, Users, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export const LoginModal: React.FC = () => {
  const { login } = useApp()
  const [selectedRole, setSelectedRole] = useState<'dono' | 'funcionario'>('dono')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const targetUsername = selectedRole === 'dono' ? 'Samilly Martins' : 'Wr_mecanica'
  const roleLabel = selectedRole === 'dono' ? 'Dono (Samilly Martins)' : 'Funcionário (Wr_mecanica)'

  const handleRoleSelect = (role: 'dono' | 'funcionario') => {
    setSelectedRole(role)
    setPassword('')
    setErrorMsg('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setErrorMsg('Por favor, digite a sua senha de acesso.')
      return
    }

    const res = login(targetUsername, password)
    if (!res.success) {
      setErrorMsg('Senha incorreta para o perfil selecionado! Tente novamente.')
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div className="w-full max-w-md rounded-3xl border border-wr-border bg-wr-surface p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header com Logo Vetorizada Oficial */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <WrLogo size="lg" showSubtitle={true} />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-wr-orange/10 border border-wr-orange/20 px-3 py-1 text-[11px] font-bold text-wr-orange">
            <Lock className="h-3 w-3" />
            Autenticação Segura &bull; WR Mecânica
          </div>
        </div>

        {/* Seleção do Perfil de Acesso: Apenas Dono ou Funcionário */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-wr-muted uppercase tracking-wider text-center">
            Selecione o seu perfil de acesso
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleSelect('dono')}
              className={`relative p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                selectedRole === 'dono'
                  ? 'border-wr-orange bg-wr-orange/15 text-wr-orange shadow-md ring-2 ring-wr-orange/40'
                  : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text hover:border-wr-borderHover'
              }`}
            >
              {selectedRole === 'dono' && (
                <span className="absolute top-2 right-2 text-wr-orange">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              )}
              <div
                className={`p-2.5 rounded-xl ${
                  selectedRole === 'dono'
                    ? 'bg-wr-orange text-white dark:text-[#0B0C10]'
                    : 'bg-wr-surface text-wr-muted'
                }`}
              >
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-bold block uppercase tracking-wider">Dono</span>
                <span className="text-[11px] text-wr-muted block mt-0.5">Samilly Martins</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('funcionario')}
              className={`relative p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                selectedRole === 'funcionario'
                  ? 'border-wr-orange bg-wr-orange/15 text-wr-orange shadow-md ring-2 ring-wr-orange/40'
                  : 'border-wr-border bg-wr-elevated text-wr-muted hover:text-wr-text hover:border-wr-borderHover'
              }`}
            >
              {selectedRole === 'funcionario' && (
                <span className="absolute top-2 right-2 text-wr-orange">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              )}
              <div
                className={`p-2.5 rounded-xl ${
                  selectedRole === 'funcionario'
                    ? 'bg-wr-orange text-white dark:text-[#0B0C10]'
                    : 'bg-wr-surface text-wr-muted'
                }`}
              >
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-bold block uppercase tracking-wider">Funcionário</span>
                <span className="text-[11px] text-wr-muted block mt-0.5">Wr_mecanica</span>
              </div>
            </button>
          </div>
        </div>

        {/* Formulário: Apenas a Senha é exigida (sem atalhos, seguro) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-wr-muted mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-wr-text">
                <Lock className="h-3.5 w-3.5 text-wr-orange" />
                Senha para: <strong className="text-wr-orange">{roleLabel}</strong>
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setErrorMsg('')
                }}
                placeholder="Digite sua senha de acesso..."
                className="wr-input pr-11 py-3 text-sm font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-wr-muted hover:text-wr-text p-1 transition-colors"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-center">
              <p className="text-xs font-bold text-rose-500">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full wr-btn-primary py-3.5 justify-center text-xs font-bold uppercase tracking-wider shadow-lg"
          >
            Entrar no Sistema <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-wr-border text-center">
          <p className="text-[11px] text-wr-muted">
            Oficina Mecânica WR &bull; Sistema protegido por senha
          </p>
        </div>
      </div>
    </div>
  )
}
