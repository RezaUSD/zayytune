import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { useCountUp, useScrollReveal } from '../hooks/useAnimations'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, favorites, playlists, history, setIsAuthModalOpen, setAuthMode } = useAuth()
  const { activeListeningModeId, setActiveListeningModeId } = usePlayer()

  // Animated counters
  const favCount = useCountUp(favorites.length, 800)
  const plCount = useCountUp(playlists.length, 800)
  const histCount = useCountUp(history?.length || 0, 800)

  // Scroll reveals
  const statsReveal = useScrollReveal({ threshold: 0.1 })
  const audioReveal = useScrollReveal({ threshold: 0.1 })

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 select-none page-enter">
      <h2 className="text-2xl font-black text-[#141416] uppercase tracking-tight text-reveal">Profil & Pengaturan</h2>

      {/* User Card */}
      {user ? (
        <div className="neo-card p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#141416] shadow-[2px_2px_0px_#141416] bg-[#C5C1FF] shrink-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h3 className="text-xl font-black text-[#141416] uppercase">{user.name}</h3>
            <p className="text-xs font-bold text-[#141416]/50 mt-0.5">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="neo-badge bg-[#C5C1FF] text-[#141416] text-[9px] px-2 py-0.5">
                {user.role}
              </span>
              <span className="text-[11px] font-bold text-[#141416]/40">Bergabung {user.joinedAt}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="neo-btn bg-[#FF6D60] text-white text-xs px-4 py-2 shrink-0"
          >
            Keluar
          </button>
        </div>
      ) : (
        <div className="neo-card bg-gradient-to-r from-[#2850ED] to-[#6366f1] p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <h3 className="text-lg font-black uppercase">Mode Tamu</h3>
            <p className="text-xs font-bold text-white/70 mt-1 max-w-sm">
              Masuk atau buat akun untuk menyimpan playlist dan sinkronkan ke semua perangkat.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login')
              setIsAuthModalOpen(true)
            }}
            className="neo-btn bg-white text-[#2850ED] text-xs px-5 py-2.5 shrink-0 border-white"
          >
            Masuk / Daftar
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div ref={statsReveal.ref} className={`grid grid-cols-3 gap-3 reveal ${statsReveal.isVisible ? 'visible' : ''}`}>
        <div
          onClick={() => navigate('/library')}
          className="neo-card p-4 text-center cursor-pointer hover:bg-[#FF6D60]/5"
        >
          <span className="material-symbols-outlined text-[28px] text-[#FF6D60] mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
          <p ref={favCount.ref} className="text-xl font-black text-[#141416]">{favCount.count}</p>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#141416]/50">Disukai</span>
        </div>
        <div
          onClick={() => navigate('/library')}
          className="neo-card p-4 text-center cursor-pointer hover:bg-[#2850ED]/5"
        >
          <span className="material-symbols-outlined text-[28px] text-[#2850ED] mb-1">
            queue_music
          </span>
          <p ref={plCount.ref} className="text-xl font-black text-[#141416]">{plCount.count}</p>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#141416]/50">Playlist</span>
        </div>
        <div
          onClick={() => navigate('/library')}
          className="neo-card p-4 text-center cursor-pointer hover:bg-[#FFE043]/20"
        >
          <span className="material-symbols-outlined text-[28px] text-[#FFE043] mb-1">
            history
          </span>
          <p ref={histCount.ref} className="text-xl font-black text-[#141416]">{histCount.count}</p>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#141416]/50">Riwayat</span>
        </div>
      </div>

      {/* Audio Engine Modes */}
      <div ref={audioReveal.ref} className={`neo-card p-5 space-y-4 !transform-none reveal ${audioReveal.isVisible ? 'visible' : ''}`}>
        <div>
          <h4 className="text-sm font-black text-[#141416] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2850ED] text-[20px]">tune</span>
            Mode Audio
          </h4>
          <p className="text-xs font-bold text-[#141416]/50 mt-0.5">
            Pilih pemrosesan audio untuk karakter nada favoritmu
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'original', name: 'Original Hi-Fi', desc: 'Audio murni studio', color: 'bg-[#98E8CE]' },
            { id: 'slowed', name: 'Slowed + Reverb', desc: 'Nuansa ambient dreamy', color: 'bg-[#C5C1FF]' },
            { id: 'bass', name: 'Bass Boosted', desc: 'Dentuman bass rendah', color: 'bg-[#FFE043]' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveListeningModeId(mode.id)}
              className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                activeListeningModeId === mode.id
                  ? `${mode.color} border-[#141416] text-[#141416] shadow-[2px_2px_0px_#141416]`
                  : 'bg-[#F7F4EB] border-[#141416]/15 text-[#141416]/70 hover:text-[#141416] hover:border-[#141416]/30'
              }`}
            >
              <span className="text-xs font-black block uppercase">{mode.name}</span>
              <span className="text-[10px] font-bold text-[#141416]/50 mt-1 block">{mode.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* App Info */}
      <div className="neo-card p-5 text-center space-y-1">
        <p className="text-xs font-black text-[#141416] uppercase">ZayyTune v1.0.0</p>
        <p className="text-[11px] font-bold text-[#141416]/40">
          Built with React + Tailwind + Vite • Hi-Fi Music Player
        </p>
      </div>
    </div>
  )
}
