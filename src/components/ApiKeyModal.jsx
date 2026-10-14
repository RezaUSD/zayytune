import React, { useState, useEffect } from 'react'

export default function ApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const [ytKey, setYtKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      setYtKey(localStorage.getItem('timbre:ytApiKey') || import.meta.env.VITE_YOUTUBE_API_KEY || '')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = (e) => {
    e.preventDefault()
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
    setYtKey('')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('timbre:ytApiKey')
    }
    if (onKeySaved) onKeySaved()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div
        className="w-full max-w-lg neo-card bg-white border-2 border-[#141416] rounded-3xl p-6 shadow-[5px_5px_0px_#141416] flex flex-col gap-4 text-[#141416] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#141416]/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FFE043] border-2 border-[#141416] shadow-[1.5px_1.5px_0px_#141416] flex items-center justify-center text-[#141416]">
              <span className="material-symbols-outlined text-[20px]">key</span>
            </div>
            <div>
              <h3 className="text-base font-black text-[#141416] uppercase tracking-tight">
                Full Audio & Streaming API
              </h3>
              <p className="text-[11px] text-[#141416]/60 font-bold">
                Koneksi YouTube Player & Deezer Catalog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#141416] hover:bg-[#F7F4EB] text-[#141416] flex items-center justify-center transition-transform active:scale-90"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Deezer Banner */}
        <div className="p-3 rounded-2xl bg-[#98E8CE] border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-start gap-3">
          <span className="material-symbols-outlined text-[#141416] text-[20px] shrink-0 mt-0.5">
            check_circle
          </span>
          <div className="text-[11px] leading-tight">
            <span className="font-black text-[#141416] block uppercase">
              Katalog Lagu Global Aktif (Deezer & LRCLIB)
            </span>
            <p className="text-[#141416]/80 font-medium mt-0.5">
              Chart Top 50, metadata, pencarian lagu dan lirik karaoke berjalan sudah aktif otomatis tanpa perlu konfigurasi.
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSave} className="flex flex-col gap-3.5 mt-1">
          {/* YouTube API Key */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#141416] flex items-center gap-1.5 uppercase">
                <span>Google YouTube Data API Key</span>
                <span className="neo-badge bg-[#FFE043] text-[9px] px-2 py-0.2">
                  Full Lagu
                </span>
              </label>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-black text-[#2850ED] hover:underline flex items-center gap-0.5"
              >
                <span>Dapatkan API Key Gratis</span>
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </a>
            </div>
            <p className="text-[11px] text-[#141416]/70 leading-relaxed font-medium">
              Masukkan API Key YouTube gratis dari Google Cloud Console agar setiap lagu yang kamu cari otomatis diputar <strong>FULL length (3–5 menit penuh)</strong> tanpa terpotong 30 detik!
            </p>
            <div className="relative mt-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={ytKey}
                onChange={(e) => setYtKey(e.target.value)}
                placeholder="Contoh: AIzaSyD..."
                className="w-full px-3.5 py-2 pr-10 bg-white border-2 border-[#141416] rounded-xl text-xs font-mono font-bold text-[#141416] placeholder-[#141416]/30 shadow-[2px_2px_0px_#141416] focus:outline-none focus:bg-[#FFFDE8]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#141416]/50 hover:text-[#141416]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showKey ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-[#141416]/10">
            {ytKey && (
              <button
                type="button"
                onClick={handleClear}
                className="neo-btn bg-white hover:bg-rose-100 text-[#FF6D60] px-3.5 py-1.5 text-xs font-black mr-auto"
              >
                Hapus Key
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="neo-btn bg-white hover:bg-gray-100 text-[#141416] px-4 py-1.5 text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="neo-btn bg-[#2850ED] hover:bg-[#1f42d4] text-white px-5 py-1.5 text-xs font-black"
            >
              Simpan & Aktifkan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
