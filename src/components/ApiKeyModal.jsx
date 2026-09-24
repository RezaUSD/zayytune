import React, { useState, useEffect } from 'react'
import { getJamendoClientId, setJamendoClientId } from '../hooks/useJamendo'

export default function ApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const [jamendoKey, setJamendoKey] = useState('')
  const [ytKey, setYtKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setJamendoKey(getJamendoClientId() || '')
      if (typeof window !== 'undefined') {
        setYtKey(localStorage.getItem('timbre:ytApiKey') || import.meta.env.VITE_YOUTUBE_API_KEY || '')
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = (e) => {
    e.preventDefault()
    setJamendoClientId(jamendoKey.trim())

    if (typeof window !== 'undefined') {
      if (ytKey.trim()) {
        localStorage.setItem('timbre:ytApiKey', ytKey.trim())
      } else {
        localStorage.removeItem('timbre:ytApiKey')
      }
    }

    if (onKeySaved) onKeySaved()
    onClose()
  }

  const handleClear = () => {
    setJamendoKey('')
    setYtKey('')
    setJamendoClientId('')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('timbre:ytApiKey')
    }
    if (onKeySaved) onKeySaved()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 transition-all">
      <div
        className="w-full max-w-lg glass-panel border border-white/20 rounded-3xl p-6 sm:p-7 shadow-glass-lg flex flex-col gap-5 text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">key</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Pengaturan API Key Musik
              </h3>
              <p className="text-xs text-white/50 font-medium">
                Konektivitas Streaming Audio & Metadata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl glass-pill hover:bg-white/[0.15] text-white/70 hover:text-white flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Deezer Free API Banner */}
        <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 flex items-start gap-3.5 shadow-glass-sm">
          <span className="material-symbols-outlined text-emerald-400 text-[22px] flex-shrink-0 mt-0.5">
            check_circle
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-300">
              Deezer Simple API Terpasang (Akses Bebas Tanpa API Key)
            </span>
            <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">
              Anda sudah bisa langsung mencari dan mendengarkan jutaan lagu global tanpa registrasi atau konfigurasi API key tambahan.
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Jamendo Client ID */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Jamendo API Client ID</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Rekomendasi
                </span>
              </label>
              <a
                href="https://devportal.jamendo.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-semibold"
              >
                <span>Daftar Gratis</span>
                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={jamendoKey}
                onChange={(e) => setJamendoKey(e.target.value)}
                placeholder="Contoh: d761a832 atau client ID baru Anda"
                className="w-full glass-inset border border-white/10 focus:border-primary/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none pr-10 font-mono transition-colors shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-white/50 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showKey ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Digunakan untuk streaming audio MP3 legal tanpa batas dan cover art.
            </p>
          </div>

          {/* YouTube Data API Key */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>YouTube Data API v3 Key</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                  Opsional
                </span>
              </label>
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-semibold"
              >
                <span>Google Console</span>
                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
              </a>
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={ytKey}
              onChange={(e) => setYtKey(e.target.value)}
              placeholder="Contoh: AIzaSyD... (Opsional)"
              className="w-full glass-inset border border-white/10 focus:border-primary/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none font-mono transition-colors shadow-inner"
            />
            <p className="text-[11px] text-white/50 leading-relaxed">
              Digunakan untuk mencari video lagu YouTube secara real-time via pencarian.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 mt-1">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-all"
            >
              Hapus / Reset Key
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white glass-pill hover:bg-white/[0.12] transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-primary via-emerald-400 to-primary text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)]"
              >
                Simpan & Terapkan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
