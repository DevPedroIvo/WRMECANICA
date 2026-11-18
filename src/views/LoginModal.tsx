import React, { useState } from 'react'
import { LogIn, Key, Mail, ShieldCheck, X } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('contato@wrmecanica.com.br')
  const [password, setPassword] = useState('••••••••')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLoginSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      {/* Phone/Card Styled Login matching Image 2 */}
      <div className="relative w-full max-w-sm rounded-[40px] border border-amber-500/40 bg-gradient-to-b from-[#141720] to-[#0a0c10] p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="mt-4 mb-2 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 shadow-xl shadow-amber-500/30">
            <span className="font-brand text-2xl font-black text-black">WR</span>
          </div>
        </div>

        <h2 className="font-brand text-xl font-black tracking-wide text-white">
          WR <span className="text-amber-400">Mecânica & Cia</span>
        </h2>
        <p className="text-xs text-amber-500/80 uppercase font-semibold tracking-widest mt-0.5">
          Sua oficina sempre conectada!
        </p>

        {/* Car Image (matching phone screen on Image 2) */}
        <div className="my-5 relative h-36 w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"
            alt="WR Mecânica Car"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              E-mail de Acesso
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161a24] py-2.5 pl-9 pr-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Senha
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161a24] py-2.5 pl-9 pr-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Entrar Button (Orange button matching image 2) */}
          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-98 transition-all"
          >
            <LogIn className="h-4 w-4 stroke-[2.5]" />
            Entrar
          </button>
        </form>

        <p className="mt-4 text-[10px] text-slate-400">
          Acesso seguro criptografado com backup em nuvem em tempo real.
        </p>
      </div>
    </div>
  )
}
