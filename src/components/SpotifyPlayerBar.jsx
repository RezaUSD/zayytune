import React, { useRef, useState } from 'react'

export default function SpotifyPlayerBar({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
  isFavorite,
  onToggleFavorite,
  currentTime = 0,
  duration = 0,
  onSeek,
  volume = 0.8,
  onVolumeChange,
  onOpenEQ,
  activeListeningModeId = 'original',
}) {
  const progressBarRef = useRef(null)
  const volumeBarRef = useRef(null)
  const [isMuted, setIsMuted] = useState(false)
  const [prevVolume, setPrevVolume] = useState(0.8)

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const effectiveDuration = duration || currentTrack?.duration || 240
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !onSeek) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.min(1, Math.max(0, clickX / rect.width))
    onSeek(percent * effectiveDuration)
  }

  const updateVolumeFromClientX = (clientX) => {
    if (!volumeBarRef.current) return
    const rect = volumeBarRef.current.getBoundingClientRect()
    const raw = (clientX - rect.left) / rect.width
    let newVol = Math.min(1, Math.max(0, raw))

    // Snapping: if within 5% of max, snap directly to 100% (1.0)
    if (newVol >= 0.95) newVol = 1
    else if (newVol <= 0.04) newVol = 0
    else newVol = Math.round(newVol * 100) / 100

    onVolumeChange?.(newVol)
    if (newVol > 0) setIsMuted(false)
  }

  const handleVolumeMouseDown = (e) => {
    e.preventDefault()
    updateVolumeFromClientX(e.clientX)

    const handleMouseMove = (moveEvent) => {
      updateVolumeFromClientX(moveEvent.clientX)
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleVolumeToggle = () => {
    if (isMuted || volume === 0) {
      setIsMuted(false)
      onVolumeChange?.(prevVolume || 0.8)
    } else {
      setPrevVolume(volume)
      setIsMuted(true)
      onVolumeChange?.(0)
    }
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 select-none bg-[#0d0b24]/95 backdrop-blur-2xl border-t border-indigo-500/20 shadow-[0_-10px_35px_rgba(0,0,0,0.8)]">
      <div className="w-full px-2.5 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-1.5 sm:gap-4">
        {/* ====== LEFT: Track Info ====== */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-[34%] sm:w-[28%] shrink-0">
          {/* Album Thumbnail */}
          <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex-shrink-0 overflow-hidden border border-white/10 shadow-md bg-[#16171d]">
            {currentTrack?.coverArtUrl ? (
              <img
                src={currentTrack.coverArtUrl}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <span className="material-symbols-outlined text-[18px] sm:text-[22px]">album</span>
              </div>
            )}
          </div>

          {/* Title & Artist */}
          <div className="flex flex-col min-w-0 justify-center">
            <span className="text-[11px] sm:text-[13px] font-bold text-white truncate leading-tight">
              {currentTrack ? currentTrack.title : 'Tidak ada trek'}
            </span>
            <span className="text-[9px] sm:text-[11px] text-white/50 truncate mt-0.5">
              {currentTrack ? currentTrack.artist : 'Pilih musik'}
            </span>
          </div>

          {/* Favorite Button */}
          {currentTrack && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-lg flex-shrink-0 hidden sm:flex items-center justify-center transition-all ${
                isFavorite ? 'text-rose-400' : 'text-white/30 hover:text-white'
              }`}
              title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          )}
        </div>

        {/* ====== CENTER: Playback Controls & Progress Scrubber ====== */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1 sm:gap-1.5 max-w-xl mx-auto px-1 sm:px-2">
          {/* Controls Row */}
          <div className="flex items-center gap-2.5 sm:gap-5">
            <button
              type="button"
              onClick={onToggleShuffle}
              className={`p-1 rounded-full transition-all hidden sm:inline-flex ${
                isShuffle ? 'text-indigo-400' : 'text-white/35 hover:text-white'
              }`}
              title={isShuffle ? 'Acak: Aktif' : 'Acak: Nonaktif'}
            >
              <span className="material-symbols-outlined text-[18px]">shuffle</span>
            </button>

            <button
              type="button"
              onClick={onPrev}
              className="text-white/60 hover:text-white active:scale-90 transition-all p-1"
              title="Lagu Sebelumnya"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">skip_previous</span>
            </button>

            {/* Primary Play/Pause Button */}
            <button
              type="button"
              onClick={onTogglePlay}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-black hover:bg-white/90 active:scale-95 flex items-center justify-center shadow-lg transition-all"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              <span
                className="material-symbols-outlined text-[20px] sm:text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button
              type="button"
              onClick={onNext}
              className="text-white/60 hover:text-white active:scale-90 transition-all p-1"
              title="Lagu Berikutnya"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">skip_next</span>
            </button>

            <button
              type="button"
              onClick={onToggleRepeat}
              className={`p-1 rounded-full transition-all hidden sm:inline-flex ${
                isRepeat ? 'text-indigo-400' : 'text-white/35 hover:text-white'
              }`}
              title={isRepeat ? 'Ulang: Aktif' : 'Ulang: Nonaktif'}
            >
              <span className="material-symbols-outlined text-[18px]">repeat</span>
            </button>
          </div>

          {/* Clean Modern Scrubber Row */}
          <div className="w-full flex items-center gap-1.5 sm:gap-2.5 text-[9px] sm:text-[11px] font-mono text-white/40">
            <span className="w-7 sm:w-9 text-right text-white/50 tabular-nums shrink-0 font-medium">
              {formatTime(currentTime)}
            </span>

            {/* Interactive Progress Bar */}
            <div
              ref={progressBarRef}
              onClick={handleProgressClick}
              className="relative flex-1 h-4 group flex items-center cursor-pointer"
            >
              <div className="h-1 w-full bg-white/15 rounded-full group-hover:h-1.5 transition-all overflow-hidden">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="h-full bg-white group-hover:bg-indigo-400 rounded-full transition-colors"
                />
              </div>
              <div
                style={{ left: `${progressPercent}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              />
            </div>

            <span className="w-7 sm:w-9 text-left text-white/50 tabular-nums shrink-0 font-medium">
              {formatTime(effectiveDuration)}
            </span>
          </div>
        </div>

        {/* ====== RIGHT: Volume & Settings ====== */}
        <div className="hidden sm:flex items-center gap-3 w-[28%] justify-end">
          {/* Equalizer Modal Trigger */}
          {onOpenEQ && (
            <button
              type="button"
              onClick={onOpenEQ}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
              title="Buka Pengaturan Equalizer"
            >
              <span className="material-symbols-outlined text-[18px]">equalizer</span>
            </button>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-2.5 group/vol">
            <button
              type="button"
              onClick={handleVolumeToggle}
              className="text-white/45 hover:text-white transition-all flex items-center justify-center p-1 rounded-lg hover:bg-white/5 shrink-0"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
            >
              <span className="material-symbols-outlined text-[19px] leading-none block">
                {volume === 0 || isMuted ? 'volume_off' : volume < 0.4 ? 'volume_down' : 'volume_up'}
              </span>
            </button>

            {/* Volume Slider with Full Drag Support */}
            <div
              ref={volumeBarRef}
              onMouseDown={handleVolumeMouseDown}
              className="relative w-20 sm:w-24 h-5 flex items-center cursor-pointer select-none"
            >
              <div className="h-1 w-full bg-white/15 rounded-full group-hover/vol:h-1.5 transition-all overflow-hidden">
                <div
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  className="h-full bg-white group-hover/vol:bg-indigo-400 rounded-full transition-colors"
                />
              </div>
              <div
                style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover/vol:opacity-100 transition-opacity pointer-events-none"
              />
            </div>

            {/* Volume Percentage Number (Clickable to jump between 100% & 50%) */}
            <button
              type="button"
              onClick={() => {
                const current = Math.round((isMuted ? 0 : volume) * 100)
                if (current >= 100) {
                  onVolumeChange?.(0.5)
                } else {
                  setIsMuted(false)
                  onVolumeChange?.(1)
                }
              }}
              title={Math.round((isMuted ? 0 : volume) * 100) >= 100 ? 'Klik untuk setel 50%' : 'Klik untuk setel 100%'}
              className="text-[11px] font-mono text-white/50 hover:text-white group-hover/vol:text-white/90 w-9 text-right tabular-nums font-semibold select-none leading-none cursor-pointer transition-colors p-0.5 rounded hover:bg-white/10"
            >
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </button>
          </div>
        </div>

        {/* Mobile Volume Toggle */}
        <div className="flex sm:hidden items-center">
          <button
            type="button"
            onClick={handleVolumeToggle}
            className="text-white/50 hover:text-white transition-all p-1"
          >
            <span className="material-symbols-outlined text-[20px]">
              {volume === 0 || isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
