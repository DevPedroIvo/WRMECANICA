import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { WrLogo } from './WrLogo'
import { ShieldCheck, Wrench, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, Sparkles, KeyRound } from 'lucide-react'

export const LoginModal: React.FC = () => {
  const { login } = useApp()
  const [selectedRole, setSelectedRole] = useState<'dono' | 'funcionario'>('funcionario')
  
  // Senha sempre em branco para forçar digitação segura na troca de usuário
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const targetUsername = selectedRole === 'dono' ? 'Dono' : 'Wr_mecanica'
  const roleTitle = selectedRole === 'dono' ? 'Dono (Administrador)' : 'Funcionário (Equipe)'
  const roleSubtitle = selectedRole === 'dono' ? 'Acesso Total / Gestão' : 'Wr_mecanica'

  const handleRoleSelect = (role: 'dono' | 'funcionario') => {
    setSelectedRole(role)
    setPassword('')
    setErrorMsg('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setErrorMsg('Por favor, digite a senha do perfil selecionado.')
      return
    }

    const res = login(targetUsername, password.trim())
    if (!res.success) {
      setErrorMsg('Senha incorreta! Digite a senha cadastrada para este usuário.')
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07080b]/90 backdrop-blur-xl p-4 sm:p-6 animate-fadeIn select-none overflow-y-auto">
      {/* Luz ambiente de fundo estética automotiva */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-md rounded-[32px] border border-white/10 dark:border-white/10 bg-[#12141c]/95 p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.85)] space-y-6 overflow-hidden">
        {/* Barra superior de brilho laranja */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-wr-orange to-transparent opacity-80" />

        {/* Cabeçalho Premium com Logo */}
        <div className="text-center space-y-2.5 pt-1">
          <div className="flex justify-center transform hover:scale-[1.02] transition-transform">
            <WrLogo size="lg" showSubtitle={true} />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 px-3 py-1 text-[11px] font-bold text-orange-400">
            <Sparkles className="h-3 w-3 text-wr-orange" />
            <span>Painel de Gestão Automotiva Integrada</span>
          </div>
        </div>

        {/* Seleção do Perfil: Dono ou Funcionário com visual moderno */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 text-center">
            Selecione seu perfil de acesso
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Botão Dono */}
            <button
              type="button"
              onClick={() => handleRoleSelect('dono')}
              className={`group relative p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 ${
                selectedRole === 'dono'
                  ? 'border-wr-orange bg-gradient-to-b from-wr-orange/20 via-wr-orange/10 to-transparent shadow-[0_0_25px_rgba(249,115,22,0.25)] ring-2 ring-wr-orange/50 text-white'
                  : 'border-white/5 bg-[#171923]/60 hover:bg-[#1c1f2c] hover:border-white/15 text-neutral-400'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`p-2.5 rounded-xl transition-colors ${
                    selectedRole === 'dono'
                      ? 'bg-wr-orange text-neutral-950 font-black shadow-md'
                      : 'bg-white/5 text-neutral-400 group-hover:text-white'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
                </div>
                {selectedRole === 'dono' && (
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-wr-orange text-neutral-950">
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm font-black tracking-wide block uppercase text-white">
                  Dono
                </span>
                <span className="text-[11px] font-medium text-neutral-400 block truncate">
                  Administrador
                </span>
                <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  selectedRole === 'dono' ? 'bg-wr-orange/20 text-orange-300' : 'bg-white/5 text-neutral-500'
                }`}>
                  Acesso Total
                </span>
              </div>
            </button>

            {/* Botão Funcionário */}
            <button
              type="button"
              onClick={() => handleRoleSelect('funcionario')}
              className={`group relative p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 ${
                selectedRole === 'funcionario'
                  ? 'border-wr-orange bg-gradient-to-b from-wr-orange/20 via-wr-orange/10 to-transparent shadow-[0_0_25px_rgba(249,115,22,0.25)] ring-2 ring-wr-orange/50 text-white'
                  : 'border-white/5 bg-[#171923]/60 hover:bg-[#1c1f2c] hover:border-white/15 text-neutral-400'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`p-2.5 rounded-xl transition-colors ${
                    selectedRole === 'funcionario'
                      ? 'bg-wr-orange text-neutral-950 font-black shadow-md'
                      : 'bg-white/5 text-neutral-400 group-hover:text-white'
                  }`}
                >
                  <Wrench className="h-5 w-5 stroke-[2.5]" />
                </div>
                {selectedRole === 'funcionario' && (
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-wr-orange text-neutral-950">
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm font-black tracking-wide block uppercase text-white">
                  Funcionário
                </span>
                <span className="text-[11px] font-medium text-neutral-400 block truncate">
                  Wr_mecanica
                </span>
                <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  selectedRole === 'funcionario' ? 'bg-wr-orange/20 text-orange-300' : 'bg-white/5 text-neutral-500'
                }`}>
                  Operacional
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Formulário com Campo de Senha Estilizado */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-neutral-300 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-wr-orange" />
                Senha de Acesso
              </label>
              <span className="text-[11px] text-neutral-400">
                Entrando como: <strong className="text-orange-400 font-bold">{roleSubtitle}</strong>
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setErrorMsg('')
                }}
                placeholder={`Digite a senha de ${roleSubtitle}...`}
                className="w-full bg-[#181a24] text-white placeholder-neutral-500 text-sm font-mono tracking-wider pl-10 pr-11 py-3.5 rounded-2xl border border-white/10 focus:border-wr-orange focus:ring-2 focus:ring-wr-orange/30 outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 transition-colors"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3 text-center animate-fadeIn">
              <p className="text-xs font-bold text-rose-400">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-[0_10px_25px_-5px_rgba(249,115,22,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(249,115,22,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Rodapé Seguro */}
        <div className="pt-2 border-t border-white/5 text-center">
          <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5 font-medium">
            <Lock className="h-3 w-3 text-wr-orange" />
            WR Mecânica &bull; Acesso Protegido e Criptografado
          </p>
        </div>
      </div>
    </div>
  )
}
