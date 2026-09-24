import React from 'react'

export default function Sidebar({
  activeNav = 'home',
  onNavChange,
  onOpenSearch,
  onToggleFavorites,
  isFavoritesActive,
  moods = [],
  currentMoodId,
  onSelectMood,
}) {
  return (
    <aside className="w-64 flex-shrink-0 glass-panel rounded-3xl p-5 hidden lg:flex flex-col justify-between select-none shadow-glass-md transition-all border border-white/15 bg-black/60 backdrop-blur-2xl">
      <div className="flex flex-col gap-5">
        {/* Studio Decks Section Header */}
        <div className="px-1">
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-outline font-bold">
            Studio Decks
          </span>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {/* Deck Workstation */}
          <button
            type="button"
            onClick={() => {
              onNavChange('home')
              if (isFavoritesActive) onToggleFavorites()
            }}
            className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 ${
              activeNav === 'home' && !isFavoritesActive
                ? 'bg-gradient-to-r from-rose-600/30 via-rose-500/10 to-transparent text-white border border-rose-500/40 shadow-[0_0_20px_rgba(229,37,53,0.3)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05] border border-transparent'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] transition-colors ${
                activeNav === 'home' && !isFavoritesActive ? 'text-rose-400' : ''
              }`}
            >
              album
            </span>
            <span className="font-title-md text-xs tracking-wide">Deck Workstation</span>
          </button>

          {/* Vinyl Crates / Search */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs text-white/60 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            <span className="font-title-md text-xs tracking-wide">Vinyl Crates</span>
          </button>

          {/* Rotation Queue / Favorites */}
          <button
            type="button"
            onClick={() => {
              onNavChange('favorites')
              onToggleFavorites()
            }}
            className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 ${
              isFavoritesActive
                ? 'bg-gradient-to-r from-rose-600/30 via-rose-500/10 to-transparent text-white border border-rose-500/40 shadow-[0_0_20px_rgba(229,37,53,0.3)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05] border border-transparent'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] transition-colors ${
                isFavoritesActive ? 'text-rose-400' : ''
              }`}
              style={{ fontVariationSettings: isFavoritesActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              verified
            </span>
            <span className="font-title-md text-xs tracking-wide">180g Audiophile Press</span>
          </button>
        </nav>

        {/* Vault Collections / Mood Channels */}
        <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.08]">
          <div className="flex items-center justify-between px-2 text-[10px] font-extrabold text-outline uppercase tracking-widest font-mono">
            <span>Vinyl Channels</span>
            <span className="material-symbols-outlined text-[15px] text-rose-400">queue_music</span>
          </div>

          <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
            {moods.map((m) => {
              const isSelected = currentMoodId === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMood(m.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 text-left ${
                    isSelected
                      ? 'bg-white/[0.1] text-white border border-rose-500/40 shadow-sm'
                      : 'text-white/65 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 transition-transform shadow-sm"
                      style={{
                        backgroundColor: isSelected ? '#e52535' : (m.accent || '#e52535'),
                        transform: isSelected ? 'scale(1.25)' : 'scale(1)',
                        boxShadow: isSelected ? '0 0 10px #e52535' : 'none',
                      }}
                    />
                    <span className="truncate font-body-md text-xs">{m.name}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-mono font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/30">
                      ON DECK
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quartz Locked Motor Direct Hardware Status Card (From Design 1) */}
      <div className="p-4 rounded-2xl bg-[#14151a] border border-white/10 flex flex-col gap-1.5 shadow-glass-sm mt-4">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-[10px] uppercase text-outline tracking-wider font-mono">
            Motor Direct
          </span>
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(229,37,53,0.9)]" />
        </div>
        <span className="font-label-lg text-sm text-white font-bold font-mono">
          Quartz Locked 33⅓
        </span>
        <span className="font-body-sm text-[11px] text-white/50">
          Pitch ±0.00% Sync • Technics SL Direct
        </span>
      </div>
    </aside>
  )
}


