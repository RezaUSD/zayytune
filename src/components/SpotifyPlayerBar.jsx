import React, { useRef, useState } from 'react'
import { usePlayer } from '../context/PlayerContext'
import { getTrackCover, handleImageFallback } from '../services/imageHelper'

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
  onOpenNowPlaying,
}) {
  const { setIsLyricsModalOpen } = usePlayer()
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

    // Snapping
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
    <>
      {/* ========================================================
          1. MOBILE FLOATING SPOTIFY MINI PLAYER (screens < lg)
          ======================================================== */}
      {currentTrack && (
        <div
          onClick={onOpenNowPlaying}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onOpenNowPlaying?.()
            }
          }}
          className="fixed left-3 right-3 z-40 lg:hidden select-none cursor-pointer rounded-2xl bg-white border-2 border-[#141416] shadow-[3.5px_3.5px_0px_#141416] p-2 flex items-center justify-between gap-3 active:scale-[0.99] transition-transform text-[#141416]"
          style={{ bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Left: Thumbnail & Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden border border-[#141416] shadow-sm bg-gray-100">
              <img
                src={getTrackCover(currentTrack)}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
                onError={(e) => handleImageFallback(e, currentTrack)}
              />
            </div>

            <div className="flex flex-col min-w-0 justify-center">
              <span className="text-xs font-black text-[#141416] truncate leading-tight uppercase">
                {currentTrack.title}
              </span>
              <span className="text-[10px] font-bold text-[#141416]/60 truncate mt-0.5">
                {currentTrack.artist}
              </span>
            </div>
          </div>

          {/* Right: Actions (Heart & Play/Pause) */}
          <div
            className="flex items-center gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lyrics Button */}
            <button
              type="button"
              onClick={() => setIsLyricsModalOpen(true)}
              className="p-1.5 transition-transform active:scale-80 cursor-pointer text-[#141416]/60 hover:text-[#2850ED]"
              title="Lirik Lagu"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-1.5 transition-transform active:scale-80 cursor-pointer ${
                isFavorite ? 'text-[#FF6D60]' : 'text-[#141416]/30 hover:text-[#141416]'
              }`}
              title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-full bg-[#141416] text-white border border-[#141416] active:scale-90 flex items-center justify-center shadow-md transition-transform cursor-pointer"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          2. DESKTOP 3-COLUMN STUDIO MASTER BAR (screens >= lg)
          ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 select-none hidden lg:block xl:hidden bg-[#F7F4EB] border-t-2 border-[#141416] shadow-[0_-3px_0px_#141416] text-[#141416]">
        <div className="relative w-full px-6 h-[70px] flex items-center justify-between">
          {/* ====== LEFT: Track Info ====== */}
          <div className="flex items-center gap-3 min-w-0 w-[30%] shrink-0 z-10">
            {/* Album Thumbnail */}
            <div className="relative w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden border border-[#141416] shadow-sm bg-gray-100">
              {currentTrack ? (
                <img
                  src={getTrackCover(currentTrack)}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                  onError={(e) => handleImageFallback(e, currentTrack)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#141416]/30">
                  <span className="material-symbols-outlined text-[22px]">album</span>
                </div>
              )}
            </div>

            {/* Title & Artist */}
            <div className="flex flex-col min-w-0 justify-center">
              <span className="text-[13px] font-black text-[#141416] truncate leading-tight uppercase">
                {currentTrack ? currentTrack.title : 'Tidak ada trek'}
              </span>
              <span className="text-[11px] font-bold text-[#141416]/60 truncate mt-0.5">
                {currentTrack ? currentTrack.artist : 'Pilih musik'}
              </span>
            </div>

            {/* Favorite Button */}
            {currentTrack && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-1.5 rounded-lg flex-shrink-0 flex items-center justify-center transition-all ${
                  isFavorite ? 'text-[#FF6D60]' : 'text-[#141416]/30 hover:text-[#141416]'
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
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] max-w-xl flex flex-col items-center justify-center gap-1.5 z-10 pointer-events-auto">
            {/* Controls Row */}
            <div className="flex items-center gap-5 justify-center">
              <button
                type="button"
                onClick={onToggleShuffle}
                className={`p-1 rounded-full transition-all inline-flex ${
                  isShuffle ? 'text-[#2850ED] font-black' : 'text-[#141416]/40 hover:text-[#141416]'
                }`}
                title={isShuffle ? 'Acak: Aktif' : 'Acak: Nonaktif'}
              >
                <span className="material-symbols-outlined text-[18px]">shuffle</span>
              </button>

              <button
                type="button"
                onClick={onPrev}
                className="text-[#141416]/70 hover:text-[#141416] active:scale-90 transition-all p-1"
                title="Lagu Sebelumnya"
              >
                <span className="material-symbols-outlined text-[22px]">skip_previous</span>
              </button>

              {/* Primary Play/Pause Button */}
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-10 h-10 rounded-full bg-[#141416] text-white border border-[#141416] hover:scale-105 active:scale-95 flex items-center justify-center shadow-md transition-all cursor-pointer"
                title={isPlaying ? 'Jeda' : 'Putar'}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button
                type="button"
                onClick={onNext}
                className="text-[#141416]/70 hover:text-[#141416] active:scale-90 transition-all p-1"
                title="Lagu Berikutnya"
              >
                <span className="material-symbols-outlined text-[22px]">skip_next</span>
              </button>

              <button
                type="button"
                onClick={onToggleRepeat}
                className={`p-1 rounded-full transition-all inline-flex ${
                  isRepeat ? 'text-[#2850ED] font-black' : 'text-[#141416]/40 hover:text-[#141416]'
                }`}
                title={isRepeat ? 'Ulang: Aktif' : 'Ulang: Nonaktif'}
              >
                <span className="material-symbols-outlined text-[18px]">repeat</span>
              </button>
            </div>

            {/* Scrubber Row */}
            <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-[#141416]/60">
              <span className="w-8 text-right tabular-nums shrink-0 font-bold">
                {formatTime(currentTime)}
              </span>

              {/* Interactive Progress Bar */}
              <div
                ref={progressBarRef}
                onClick={handleProgressClick}
                className="relative flex-1 h-3 group flex items-center cursor-pointer"
              >
                <div className="h-1.5 w-full bg-[#E8E4D8] rounded-full overflow-hidden border border-[#141416]/20">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-[#2850ED] rounded-full transition-colors"
                  />
                </div>
              </div>

              <span className="w-8 text-left tabular-nums shrink-0 font-bold">
                {formatTime(effectiveDuration)}
              </span>
            </div>
          </div>

          {/* ====== RIGHT: Volume & Settings ====== */}
          <div className="flex items-center justify-end gap-3 w-[30%] shrink-0 z-10">
            {/* Synced Lyrics Button */}
            <button
              type="button"
              onClick={() => setIsLyricsModalOpen(true)}
              className="px-2.5 py-1 rounded-full bg-white border border-[#141416] shadow-[1.5px_1.5px_0px_#141416] hover:bg-[#FFE043] active:scale-95 transition-all text-[#141416] flex items-center gap-1.5 cursor-pointer"
              title="Buka Lirik Sinkron"
            >
              <span className="material-symbols-outlined text-[17px] text-[#2850ED]">mic</span>
              <span className="text-[10px] font-black uppercase tracking-wider">Lirik</span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2.5 group/vol">
              <button
                type="button"
                onClick={handleVolumeToggle}
                className="text-[#141416]/60 hover:text-[#141416] transition-all flex items-center justify-center p-1"
                title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
              >
                <span className="material-symbols-outlined text-[19px] leading-none block">
                  {volume === 0 || isMuted ? 'volume_off' : volume < 0.4 ? 'volume_down' : 'volume_up'}
                </span>
              </button>

              {/* Volume Slider with Drag */}
              <div
                ref={volumeBarRef}
                onMouseDown={handleVolumeMouseDown}
                className="relative w-24 h-5 flex items-center cursor-pointer select-none"
              >
                <div className="h-1.5 w-full bg-[#E8E4D8] rounded-full overflow-hidden border border-[#141416]/20">
                  <div
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    className="h-full bg-[#141416] rounded-full transition-colors"
                  />
                </div>
              </div>

              {/* Volume Percentage Number */}
              <span className="text-[11px] font-mono text-[#141416]/60 w-8 text-right tabular-nums font-bold select-none">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
