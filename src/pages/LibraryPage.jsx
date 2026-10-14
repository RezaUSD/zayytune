import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { useScrollReveal, useStaggerChildren } from '../hooks/useAnimations'
import TrackRow from '../components/TrackRow'
import CreatePlaylistModal from '../components/CreatePlaylistModal'
import { DEFAULT_FALLBACK_COVER, getAestheticFallback } from '../services/imageHelper'

export default function LibraryPage() {
  const navigate = useNavigate()
  const { user, playlists, favorites, history, setIsAuthModalOpen, setAuthMode } = useAuth()
  const { playTrack } = usePlayer()

  const [activeTab, setActiveTab] = useState('playlists') // 'playlists' | 'favorites' | 'history'
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Animation hooks
  const headerReveal = useScrollReveal({ threshold: 0.1 })
  const contentReveal = useScrollReveal({ threshold: 0.05 })
  const playlistStagger = useStaggerChildren(playlists.length + 1, 90) // +1 for liked songs hero

  return (
    <div className="space-y-6 pb-12 select-none page-enter">
      {/* Header & Tabs */}
      <div ref={headerReveal.ref} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#141416] uppercase tracking-tight text-reveal">Koleksi Musik</h2>
          <p className="text-xs font-bold text-[#141416]/60 text-reveal-delay-1">Kelola playlist, lagu favorit, dan riwayat putarmu</p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            if (!user) {
              setAuthMode('login')
              setIsAuthModalOpen(true)
            } else {
              setIsCreateOpen(true)
            }
          }}
          className="self-start sm:self-auto neo-btn bg-[#FFE043] text-[#141416] px-4 py-2 text-xs font-black flex items-center gap-2 btn-spring text-reveal-delay-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Buat Playlist
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-[#141416]/10 pb-3">
        {[
          { id: 'playlists', label: `Playlist (${playlists.length})`, color: 'bg-[#FFE043]', textColor: 'text-[#141416]' },
          { id: 'favorites', label: `Disukai (${favorites.length})`, color: 'bg-[#FF6D60]', textColor: 'text-white' },
          { id: 'history', label: `Riwayat (${history.length})`, color: 'bg-[#C5C1FF]', textColor: 'text-[#141416]' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all duration-300 border-2 btn-spring ${
              activeTab === tab.id
                ? `${tab.color} border-[#141416] ${tab.textColor} shadow-[2px_2px_0px_#141416]`
                : 'border-transparent text-[#141416]/60 hover:text-[#141416] hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Playlists */}
      {activeTab === 'playlists' && (
        <div ref={playlistStagger.parentRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Liked Songs Hero Card */}
          <div
            onClick={() => navigate('/playlist/liked-songs')}
            className={`stagger-item ${playlistStagger.isChildVisible(0) ? 'visible' : ''} col-span-2 sm:col-span-2 p-5 rounded-3xl bg-[#FF6D60] border-2 border-[#141416] shadow-[4px_4px_0px_#141416] flex flex-col justify-between cursor-pointer hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group`}
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-2">
                Koleksi Favorit
              </span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Lagu yang Disukai</h3>
              <p className="text-xs font-bold text-white/80 mt-1">{favorites.length} lagu tersimpan</p>
            </div>

            <div className="flex items-center justify-between mt-8">
              <span className="text-xs font-bold text-white/80">Otomatis Tersinkron</span>
              <div className="w-10 h-10 rounded-full bg-white text-[#141416] border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center justify-center group-hover:scale-110 transition-transform btn-spring">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </div>
            </div>
          </div>

          {/* User Playlists */}
          {playlists.map((pl, idx) => (
            <div
              key={pl.id}
              onClick={() => navigate(`/playlist/${pl.id}`)}
              className={`stagger-item ${playlistStagger.isChildVisible(idx + 1) ? 'visible' : ''} p-3.5 rounded-3xl bg-white border-2 border-[#141416] shadow-[3px_3px_0px_#141416] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer flex flex-col gap-3 group`}
            >
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-[#141416]">
                <img
                  src={pl.coverUrl || DEFAULT_FALLBACK_COVER}
                  alt={pl.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = getAestheticFallback(pl.name)
                  }}
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-[#141416] uppercase truncate group-hover:text-[#2850ED] transition-colors">
                  {pl.name}
                </h4>
                <p className="text-[10px] font-bold text-[#141416]/50 uppercase mt-0.5">
                  {pl.tracks?.length || 0} lagu
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Liked Songs */}
      {activeTab === 'favorites' && (
        <div ref={contentReveal.ref} className={`space-y-4 reveal ${contentReveal.isVisible ? 'visible' : ''}`}>
          {favorites.length === 0 ? (
            <div className="p-12 text-center bg-white border-2 border-[#141416] shadow-[3px_3px_0px_#141416] rounded-3xl">
              <span className="material-symbols-outlined text-[48px] text-[#FF6D60] mb-2">
                favorite_border
              </span>
              <h4 className="text-base font-black text-[#141416] uppercase">Belum ada lagu yang disukai</h4>
              <p className="text-xs font-bold text-[#141416]/60 mt-1 max-w-sm mx-auto">
                Beri tanda hati pada lagu yang kamu dengar agar otomatis terkumpul di sini.
              </p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-4 neo-btn bg-[#FFE043] text-[#141416] px-4 py-2 text-xs font-black btn-spring"
              >
                Jelajahi Lagu
              </button>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#141416] shadow-[3.5px_3.5px_0px_#141416] rounded-3xl p-3 sm:p-4 space-y-1.5">
              {favorites.map((track, idx) => (
                <TrackRow key={track.id || idx} track={track} index={idx} queue={favorites} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: History */}
      {activeTab === 'history' && (
        <div ref={contentReveal.ref} className={`space-y-4 reveal ${contentReveal.isVisible ? 'visible' : ''}`}>
          {history.length === 0 ? (
            <div className="p-12 text-center bg-white border-2 border-[#141416] shadow-[3px_3px_0px_#141416] rounded-3xl">
              <span className="material-symbols-outlined text-[48px] text-[#141416]/30 mb-2">history</span>
              <h4 className="text-base font-black text-[#141416] uppercase">Riwayat masih kosong</h4>
              <p className="text-xs font-bold text-[#141416]/60 mt-1">Lagu yang baru saja kamu putar akan muncul di sini.</p>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#141416] shadow-[3.5px_3.5px_0px_#141416] rounded-3xl p-3 sm:p-4 space-y-1.5">
              {history.map((track, idx) => (
                <TrackRow key={track.id || idx} track={track} index={idx} queue={history} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Playlist Modal */}
      <CreatePlaylistModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  )
}
