import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, login, register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isAuthModalOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (authMode === 'login') {
      login(email, password)
    } else {
      register(name, email, password)
    }
  }

  const handleGuestDemo = () => {
    login('penikmat.musik@spotify.com', 'password123')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md p-6 sm:p-8 bg-[#12131c] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-rose-500 to-amber-400 p-[1.5px] shadow-lg shadow-indigo-500/30 mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d0e15] rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-white">graphic_eq</span>
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {authMode === 'login' ? 'Masuk ke Timbre' : 'Buat Akun Baru'}
            </h2>
            <p className="text-xs text-white/60 mt-1 max-w-xs">
              Dengarkan jutaan lagu, buat playlist tanpa batas, dan simpan lagu favoritmu.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {authMode === 'register' && (
              <div>
                <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                  Nama Lengkap / Username
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-white/40">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Reza Putra"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-white/40">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-white/40">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-400 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              {authMode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
            </button>
          </form>

          {/* Guest / Demo button */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleGuestDemo}
              className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">speed</span>
              Masuk Cepat (Akun Demo / Tamu)
            </button>
          </div>

          {/* Switch Mode */}
          <div className="mt-4 text-center">
            {authMode === 'login' ? (
              <p className="text-xs text-white/50">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-indigo-400 font-bold hover:underline ml-1"
                >
                  Daftar di sini
                </button>
              </p>
            ) : (
              <p className="text-xs text-white/50">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-indigo-400 font-bold hover:underline ml-1"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
