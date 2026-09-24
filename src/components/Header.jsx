import React, { useEffect } from 'react'

export default function Header({
  onOpenSearch,
  accent,
  isFavoritesActive = false,
  onToggleFavorites,
  favoritesCount = 0,
}) {
  // Listen for Ctrl+K / Cmd+K / Slash to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenSearch?.()
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        onOpenSearch?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpenSearch])

  // Smooth scroll to top / turntable deck
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0a1f]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.7)] border-b border-indigo-500/15 transition-colors duration-500">
      {/* Dynamic top ambient glow accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] opacity-85 transition-all duration-700 pointer-events-none"
        style={{
          background: accent
            ? `linear-gradient(90deg, transparent, ${accent}, transparent)`
            : 'linear-gradient(90deg, transparent, #818cf8, #c084fc, transparent)',
        }}
      />

      <div className="h-16 lg:h-20 w-full px-3 sm:px-6 lg:px-10 flex items-center justify-between gap-2 sm:gap-4">
        {/* ========================================================
            LEFT: Brand Logo - ZayyTune
            ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={handleScrollToTop}
            title="ZayyTune Studio - Kembali ke Atas"
            className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-xl p-1 -m-1 transition-transform active:scale-95 cursor-pointer"
          >
            {/* Sleek Neutral Obsidian Glass Logo Icon */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 backdrop-blur-xl flex items-center justify-center relative shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:border-white/25">
              <span className="material-symbols-outlined text-white text-[20px] sm:text-[22px] transition-transform duration-700 group-hover:rotate-180">
                graphic_eq
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0c0a1f] shadow-[0_0_6px_#34d399]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl tracking-tight font-black select-none inline-flex items-center">
                  <span className="text-white">Zayy</span><span className="text-zinc-300 font-semibold">Tune</span><span className="text-indigo-400 font-black">.</span>
                </span>
                <span className="inline-block px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider font-bold text-zinc-300 bg-white/[0.06] border border-white/10 rounded shadow-inner">
                  STUDIO
                </span>
              </div>
              <span className="hidden sm:block font-mono text-[9px] text-zinc-400/70 tracking-widest uppercase -mt-0.5 select-none">
                Hi-Fi Turntable Deck
              </span>
            </div>
          </button>
        </div>

        {/* ========================================================
            RIGHT: Favorites Filter & Search Bar
            ======================================================== */}
        <div className="flex items-center gap-2.5 sm:gap-3">

          {/* Quick Favorites Toggle Button */}
          {onToggleFavorites && (
            <button
              type="button"
              onClick={onToggleFavorites}
              title={isFavoritesActive ? 'Kembali ke Top Playlist 2026' : 'Lihat Lagu Favorit Saya'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border select-none active:scale-95 cursor-pointer ${
                isFavoritesActive
                  ? 'bg-rose-500/20 text-rose-200 border-rose-400/40 shadow-[0_0_16px_rgba(244,63,94,0.35)]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-rose-300 border-white/10 hover:border-white/20'
              }`}
            >
              <span
                className="material-symbols-outlined text-[17px] text-rose-400"
                style={{ fontVariationSettings: isFavoritesActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
              <span className="hidden sm:inline">Favorit</span>
              {favoritesCount > 0 && (
                <span className="px-1.5 py-0.2 font-mono text-[10px] rounded-full bg-rose-500/30 text-rose-200 font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Clean Desktop Search Input */}
          <div className="relative hidden sm:flex items-center">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-48 md:w-56 lg:w-64 flex items-center justify-between bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-xs px-3.5 py-2 rounded-xl transition-all shadow-inner group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="material-symbols-outlined text-white/40 group-hover:text-white/80 text-[18px] transition-colors">
                  search
                </span>
                <span className="truncate font-sans text-xs group-hover:text-white/80">Cari lagu, artis, genre...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/10 text-white/60 border border-white/10 group-hover:border-white/20 transition-colors">
                <span>Ctrl</span>
                <span>K</span>
              </kbd>
            </button>
          </div>

          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            title="Cari Musik"
            className="sm:hidden p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
        </div>
      </div>
    </header>
  )
}



