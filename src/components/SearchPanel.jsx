import React, { useState, useEffect, useRef } from 'react'
import { searchDeezerTracks } from '../services/deezerApi'
import { searchYouTubeMusic } from '../services/youtubeSearch'

export default function SearchPanel({
  isOpen,
  onClose,
  onSelectTrack,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Universal Instant Search (Deezer Global + YouTube Music)
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const deezerHits = await searchDeezerTracks(query, 10).catch(() => [])
        let ytHits = []
        if (deezerHits.length < 4) {
          ytHits = await searchYouTubeMusic(query).catch(() => [])
        }
        setResults([...deezerHits, ...ytHits])
      } catch (err) {
        console.warn('Search query error:', err)
      } finally {
        setIsLoading(false)
      }
    }, 220)

    return () => clearTimeout(timeout)
  }, [query])

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Light Transparent Click-Away Overlay (Does NOT darken or block screen) */}
      <div
        className="fixed inset-0 z-40 bg-black/20 transition-opacity"
        onClick={onClose}
      />

      {/* Floating Search Popover Anchored to Top-Right (Turntable in Center Stays 100% Visible!) */}
      <div
        className="fixed top-[68px] sm:top-[74px] left-3 right-3 sm:left-auto sm:right-6 lg:right-10 z-50 sm:w-[460px] bg-[#141233]/95 backdrop-blur-2xl border border-indigo-500/20 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[calc(100vh-140px)] animate-in fade-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-indigo-500/15 bg-[#1a1744]/85">
          <div className="relative flex items-center">
            {/* Search Icon */}
            <span className="material-symbols-outlined absolute left-3.5 text-indigo-300 text-[20px] pointer-events-none">
              search
            </span>

            {/* Clean Rounded Search Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari lagu, artis, atau album..."
              className="w-full bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.09] border border-white/10 focus:border-indigo-400/60 text-white text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 outline-none transition-all placeholder-white/40 shadow-inner"
            />

            {/* Loading Spinner or Clear Button */}
            {isLoading ? (
              <div className="absolute right-3.5 w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : query ? (
              <button
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                className="absolute right-3.5 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Hapus pencarian"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            ) : (
              <span className="absolute right-3.5 font-mono text-[9px] text-white/40 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                ESC
              </span>
            )}
          </div>
        </div>

        {/* Results Scroll Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 custom-scrollbar min-h-[220px]">
          {/* Empty Query Prompt */}
          {!query && (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-indigo-300 mb-2.5 shadow-inner">
                <span className="material-symbols-outlined text-[22px]">manage_search</span>
              </div>
              <h3 className="text-xs sm:text-sm text-white font-semibold">
                Cari Musik & Artis
              </h3>
              <p className="text-[11px] text-white/40 mt-0.5 max-w-xs">
                Ketik nama lagu atau artis untuk langsung memutar di piringan hitam.
              </p>
            </div>
          )}

          {/* No Results Found */}
          {query && !isLoading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <span className="material-symbols-outlined text-[32px] text-white/30 mb-1.5">
                search_off
              </span>
              <p className="text-xs text-white font-medium">
                Tidak ditemukan hasil untuk "{query}"
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                Coba periksa ejaan atau gunakan kata kunci lain.
              </p>
            </div>
          )}

          {/* Clean Track Result Rows */}
          {results.map((track, idx) => (
            <div
              key={track.id || idx}
              onClick={() => {
                onSelectTrack(track)
                onClose()
              }}
              className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.07] transition-all border border-transparent hover:border-white/10 cursor-pointer mb-1 select-none"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Album Cover Thumbnail */}
                <div className="relative w-10 h-10 rounded-lg bg-black border border-white/10 overflow-hidden flex-shrink-0 shadow-sm">
                  <img
                    src={track.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120'}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[18px] opacity-80 group-hover:scale-110 transition-transform">
                      play_arrow
                    </span>
                  </div>
                </div>

                {/* Title & Artist */}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white group-hover:text-indigo-200 transition-colors truncate">
                    {track.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50 truncate mt-0.5">
                    <span className="truncate">{track.artist}</span>
                    {track.album && (
                      <>
                        <span className="text-white/20">•</span>
                        <span className="truncate text-white/40">{track.album}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Source Badge & Duration */}
              <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[9px] font-mono text-white/60">
                  {track.source === 'youtube' ? 'YouTube' : 'Lossless'}
                </span>
                <span className="font-mono text-[10px] text-white/40">
                  {track.durationFormatted || '03:30'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Bar */}
        <div className="px-3.5 py-2 border-t border-white/10 bg-[#161720]/80 flex items-center justify-between text-[10px] text-white/40 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>Pencarian Cepat</span>
          </div>
          <button
            onClick={onClose}
            className="hover:text-white transition-colors uppercase font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </>
  )
}
