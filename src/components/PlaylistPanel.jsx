import React from 'react'

export default function PlaylistPanel({
  playlistTitle = 'Daftar Lagu Populer',
  tracks = [],
  currentTrack,
  isPlaying,
  onSelectTrack,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
  onOpenApiKey,
  onOpenSearch,
}) {
  return (
    <section className="rounded-3xl border border-white/10 p-6 sm:p-7 flex flex-col gap-5 shadow-2xl transition-all bg-[#0e0f14]/80 backdrop-blur-xl">
      {/* Panel Top Action Strip */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-400 shadow-inner">
            <span className="material-symbols-outlined text-[22px]">queue_music</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {playlistTitle}
            </h2>
            <p className="text-xs text-white/50 font-medium mt-0.5 flex items-center gap-2">
              <span>{tracks.length} Trek Studio</span>
              <span>•</span>
              <span className="text-rose-400 font-mono text-[11px]">180g Lossless Audio</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenSearch}
            type="button"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-2 transition-all shadow-sm"
            title="Cari Lagu Lain"
          >
            <span className="material-symbols-outlined text-[16px] text-rose-400">search</span>
            <span className="hidden sm:inline">Cari Trek Lain</span>
          </button>
        </div>
      </div>

      {/* Modern Glass Table Column Header */}
      {tracks.length > 0 && (
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] font-extrabold text-white/40 uppercase tracking-widest font-mono select-none">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-11 sm:col-span-6 md:col-span-5">Judul & Artis</div>
          <div className="hidden md:block md:col-span-4 truncate">Album</div>
          <div className="hidden sm:flex sm:col-span-5 md:col-span-2 items-center justify-end">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
          </div>
        </div>
      )}

      {/* Track List Rows */}
      {tracks.length > 0 ? (
        <div className="flex flex-col gap-1.5 max-h-[520px] overflow-y-auto pr-1">
          {tracks.map((track, idx) => {
            const isActive = currentTrack?.id === track.id

            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className={`grid grid-cols-12 gap-3 items-center px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer group select-none border ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 via-white/[0.08] to-transparent border-primary/50 text-white shadow-[0_0_25px_rgba(var(--primary),0.18)]'
                    : 'glass-card border-white/[0.06] hover:border-white/20 hover:bg-white/[0.07] text-white/90'
                }`}
              >
                {/* Col 1: Track Number / Play / Green Equalizer */}
                <div className="col-span-1 text-center flex items-center justify-center">
                  {isActive && isPlaying ? (
                    <div className="flex items-end justify-center gap-0.5 h-4">
                      <span className="w-1 bg-primary rounded-full wave-bar-1" />
                      <span className="w-1 bg-primary rounded-full wave-bar-2" />
                      <span className="w-1 bg-primary rounded-full wave-bar-3" />
                    </div>
                  ) : (
                    <>
                      <span
                        className={`text-xs font-bold group-hover:hidden ${
                          isActive ? 'text-primary' : 'text-white/50'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="material-symbols-outlined text-[20px] text-white hidden group-hover:inline-block">
                        play_arrow
                      </span>
                    </>
                  )}
                </div>

                {/* Col 2: Thumbnail, Title & Artist */}
                <div className="col-span-11 sm:col-span-6 md:col-span-5 flex items-center gap-3.5 min-w-0">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-white/10 bg-black/40">
                    <img
                      src={track.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'
                      }}
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-sm font-bold truncate transition-colors ${
                        isActive ? 'text-primary' : 'text-white group-hover:text-white'
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="text-xs text-white/60 group-hover:text-white/80 truncate mt-0.5 font-medium">
                      {track.artist}
                    </span>
                  </div>
                </div>

                {/* Col 3: Album (Hidden on Mobile) */}
                <div className="hidden md:block md:col-span-4 text-xs text-white/60 group-hover:text-white/80 truncate font-medium">
                  {track.album || track.title}
                </div>

                {/* Col 4: Duration */}
                <div className="hidden sm:flex sm:col-span-5 md:col-span-2 items-center justify-end text-xs font-mono font-bold text-white/60 group-hover:text-white">
                  <span>{track.durationFormatted || '3:30'}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-3.5 glass-card rounded-3xl border border-dashed border-white/20">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-primary shadow-glass-sm">
            <span className="material-symbols-outlined text-[28px]">queue_music</span>
          </div>
          <div>
            <h4 className="text-base font-black text-white">Belum Ada Trek Lagu</h4>
            <p className="text-xs text-white/60 max-w-sm mt-1 leading-relaxed">
              Cari lagu artis favoritmu atau ganti mood channel di sidebar untuk memuat katalog baru.
            </p>
          </div>
          <button
            onClick={onOpenSearch}
            type="button"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary via-emerald-400 to-primary text-black text-xs font-extrabold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)] mt-2"
          >
            Cari Lagu Sekarang
          </button>
        </div>
      )}
    </section>
  )
}
