import React, { useState, useEffect, useRef, useMemo } from 'react'
import { getLyrics } from '../services/lyricsApi'
import { getActiveLyricIndex } from '../services/lyricsHelper'
import { useLyricOffset } from '../hooks/useLyricOffset'
import { LISTENING_MODES } from '../hooks/useAudioModes'
import { getTrackCover, handleImageFallback } from '../services/imageHelper'

export default function MobileNowPlayingModal({
  isOpen,
  onClose,
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
  activeListeningModeId = 'original',
  onSelectListeningMode,
  tracks = [],
  onSelectTrack,
}) {
  const [isLyricsOpen, setIsLyricsOpen] = useState(false)
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [lyricsData, setLyricsData] = useState(null)
  const [loadingLyrics, setLoadingLyrics] = useState(false)
  const lyricsContainerRef = useRef(null)
  const activeLineRef = useRef(null)
  const progressBarRef = useRef(null)

  // Touch gesture for swipe down to dismiss
  const touchStartY = useRef(0)
  const touchDeltaY = useRef(0)

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
    touchDeltaY.current = 0
  }

  const handleTouchMove = (e) => {
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current
  }

  const handleTouchEnd = () => {
    if (touchDeltaY.current > 75) {
      if (isLyricsOpen) {
        setIsLyricsOpen(false)
      } else if (isQueueOpen) {
        setIsQueueOpen(false)
      } else {
        onClose?.()
      }
    }
    touchStartY.current = 0
    touchDeltaY.current = 0
  }

  // Load lyrics whenever track changes
  useEffect(() => {
    if (!currentTrack) {
      setLyricsData(null)
      return
    }

    let isMounted = true
    setLoadingLyrics(true)

    getLyrics(currentTrack.artist, currentTrack.title, currentTrack.duration)
      .then((data) => {
        if (isMounted) {
          setLyricsData(data)
          setLoadingLyrics(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setLyricsData(null)
          setLoadingLyrics(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist, currentTrack?.duration])

  const lyricOffset = useLyricOffset(currentTrack)

  // Active line calculation for synced lyrics
  const activeLineIdx = useMemo(() => {
    if (!lyricsData?.lines || lyricsData.lines.length === 0) return -1
    return getActiveLyricIndex(lyricsData.lines, currentTime, lyricOffset)
  }, [lyricsData, currentTime, lyricOffset])

  // Auto-scroll active lyric line to center
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeLineIdx])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const effectiveDuration = duration || currentTrack?.duration || 240
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !onSeek) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clickX = clientX - rect.left
    const percent = Math.min(1, Math.max(0, clickX / rect.width))
    onSeek(percent * effectiveDuration)
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#F7F4EB] text-[#141416] flex flex-col overflow-hidden select-none animate-in fade-in duration-200"
    >
      {/* Top Header & Drag Handle */}
      <header
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 w-full flex flex-col items-center pt-3 pb-2 px-5 shrink-0"
      >
        {/* Drag Pill */}
        <div
          onClick={onClose}
          className="w-12 h-1.5 rounded-full bg-[#141416]/20 mb-2 cursor-grab hover:bg-[#141416]/40 transition-colors"
        />

        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border-2 border-[#141416] shadow-[2px_2px_0px_#141416] text-[#141416] flex items-center justify-center transition-all active:scale-90 hover:bg-[#FFE043] cursor-pointer btn-spring"
            title="Kecilkan"
          >
            <span className="material-symbols-outlined text-[24px]">keyboard_arrow_down</span>
          </button>

          <div className="flex flex-col items-center text-center px-2 min-w-0 max-w-[65%]">
            <span className="neo-badge bg-[#FFE043] text-[#141416] text-[9px] px-2.5 py-0.5 border border-[#141416] font-black uppercase tracking-wider">
              NOW PLAYING
            </span>
            <span className="text-xs font-black text-[#141416] truncate mt-1 uppercase tracking-tight">
              {currentTrack?.album || 'Timbre Music'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`w-10 h-10 rounded-full border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center justify-center transition-all active:scale-90 cursor-pointer btn-spring ${
              isQueueOpen
                ? 'bg-[#2850ED] text-white'
                : 'bg-white text-[#141416] hover:bg-[#FFE043]'
            }`}
            title="Antrean Lagu"
          >
            <span className="material-symbols-outlined text-[20px]">queue_music</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          MAIN FULLSCREEN PLAYER VIEW (Neo-Brutalist Aesthetic)
          ======================================================== */}
      <main className="relative z-10 flex-1 flex flex-col justify-between px-6 pt-2 pb-6 max-w-md mx-auto w-full overflow-hidden">
        {/* 1. Artwork Showcase Card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full aspect-square max-w-[280px] xs:max-w-[310px] mx-auto my-auto flex items-center justify-center"
        >
          <div
            className={`relative w-full h-full rounded-3xl overflow-hidden shadow-[5px_5px_0px_#141416] border-2 border-[#141416] bg-white transition-transform duration-500 ${
              isPlaying ? 'scale-100' : 'scale-[0.97]'
            }`}
          >
            <img
              src={getTrackCover(currentTrack)}
              alt={currentTrack?.title || 'Track Art'}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => handleImageFallback(e, currentTrack)}
            />
          </div>
        </div>

        {/* 2. Track Title & Artist Row */}
        <div className="w-full flex items-center justify-between mt-3 mb-1">
          <div className="flex flex-col min-w-0 pr-4">
            <h1 className="text-xl xs:text-2xl font-black text-[#141416] uppercase tracking-tight leading-tight truncate">
              {currentTrack ? currentTrack.title : 'Pilih Trek Musik'}
            </h1>
            <p className="text-sm text-[#141416]/60 font-bold truncate mt-0.5">
              {currentTrack ? currentTrack.artist : 'Artis Musik'}
            </p>
          </div>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={onToggleFavorite}
            className="w-11 h-11 rounded-full bg-white border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center justify-center transition-all active:scale-80 hover:bg-[#FFE043] cursor-pointer shrink-0 btn-spring"
            title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          >
            <span
              className={`material-symbols-outlined text-[24px] transition-colors ${
                isFavorite ? 'text-[#FF6D60]' : 'text-[#141416]/40 hover:text-[#141416]'
              }`}
              style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>

        {/* 3. Progress Scrubber Bar */}
        <div className="w-full flex flex-col gap-1.5 my-1.5">
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            onTouchStart={handleProgressClick}
            className="relative w-full h-6 flex items-center cursor-pointer group"
          >
            <div className="h-2 w-full bg-[#141416]/10 border border-[#141416]/20 rounded-full overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-[#2850ED] rounded-full transition-all"
              />
            </div>
            <div
              style={{ left: `${progressPercent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FFE043] border-2 border-[#141416] shadow-[1px_1px_0px_#141416] pointer-events-none group-hover:scale-125 transition-transform"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#141416]/50">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* 4. Primary Controls (Shuffle, Prev, Big Play/Pause, Next, Repeat) */}
        <div className="w-full flex items-center justify-between px-1 my-1.5">
          {/* Shuffle */}
          <button
            type="button"
            onClick={onToggleShuffle}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all active:scale-90 cursor-pointer btn-spring ${
              isShuffle
                ? 'bg-[#2850ED] text-white border-[#141416] shadow-[2px_2px_0px_#141416]'
                : 'bg-white text-[#141416]/50 border-[#141416]/20 hover:border-[#141416] hover:text-[#141416]'
            }`}
            title="Acak"
          >
            <span className="material-symbols-outlined text-[20px]">shuffle</span>
          </button>

          {/* Previous */}
          <button
            type="button"
            onClick={onPrev}
            className="w-12 h-12 rounded-full bg-white border-2 border-[#141416] shadow-[2.5px_2.5px_0px_#141416] text-[#141416] hover:bg-[#FFE043] active:scale-90 transition-all flex items-center justify-center cursor-pointer btn-spring"
            title="Sebelumnya"
          >
            <span className="material-symbols-outlined text-[28px]">skip_previous</span>
          </button>

          {/* Big Circular Play / Pause Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full bg-[#FFE043] text-[#141416] border-2 border-[#141416] shadow-[4px_4px_0px_#141416] hover:bg-[#FFE866] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center transition-all cursor-pointer btn-spring"
            title={isPlaying ? 'Jeda' : 'Putar'}
          >
            <span
              className="material-symbols-outlined text-[36px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={onNext}
            className="w-12 h-12 rounded-full bg-white border-2 border-[#141416] shadow-[2.5px_2.5px_0px_#141416] text-[#141416] hover:bg-[#FFE043] active:scale-90 transition-all flex items-center justify-center cursor-pointer btn-spring"
            title="Berikutnya"
          >
            <span className="material-symbols-outlined text-[28px]">skip_next</span>
          </button>

          {/* Repeat */}
          <button
            type="button"
            onClick={onToggleRepeat}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all active:scale-90 cursor-pointer btn-spring ${
              isRepeat
                ? 'bg-[#2850ED] text-white border-[#141416] shadow-[2px_2px_0px_#141416]'
                : 'bg-white text-[#141416]/50 border-[#141416]/20 hover:border-[#141416] hover:text-[#141416]'
            }`}
            title="Ulangi"
          >
            <span className="material-symbols-outlined text-[20px]">repeat</span>
          </button>
        </div>

        {/* 5. Audio DSP Mode & Lyrics Card Bar */}
        <div className="w-full pt-2 space-y-2.5">
          {/* Mode selection row */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {LISTENING_MODES.map((mode) => {
              const isActive = activeListeningModeId === mode.id
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onSelectListeningMode?.(mode.id)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 border-2 btn-spring ${
                    isActive
                      ? 'bg-[#2850ED] text-white border-[#141416] shadow-[2px_2px_0px_#141416]'
                      : 'bg-white text-[#141416]/70 border-[#141416]/20 hover:border-[#141416] hover:text-[#141416] shadow-[1px_1px_0px_#141416]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {mode.icon || 'graphic_eq'}
                  </span>
                  <span>{mode.shortName || mode.name}</span>
                </button>
              )
            })}
          </div>

          {/* Lyrics Expand Button */}
          <button
            type="button"
            onClick={() => setIsLyricsOpen(true)}
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#FFFDE8] border-2 border-[#141416] shadow-[3px_3px_0px_#141416] text-xs font-black text-[#141416] flex items-center justify-between transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer btn-spring"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#2850ED]">mic</span>
              <span className="uppercase tracking-wide">Lihat Lirik Lagu</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#141416]/50">chevron_right</span>
          </button>
        </div>
      </main>

      {/* ========================================================
          SLIDE-UP LYRICS BOTTOM SHEET (Neo-Brutalist Theme)
          ======================================================== */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        <div
          className={`absolute inset-x-0 bottom-0 top-14 bg-[#F7F4EB] rounded-t-3xl border-t-2 border-x-2 border-[#141416] flex flex-col shadow-[0_-8px_0px_#141416] transition-transform duration-[380ms] ease-out ${
            isLyricsOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-full'
          }`}
        >
          {/* Pill & Header */}
          <div className="flex flex-col items-center pt-3 px-5 shrink-0 bg-white border-b-2 border-[#141416]/10 rounded-t-3xl">
            <div
              className="w-12 h-1.5 rounded-full bg-[#141416]/20 mb-3 cursor-grab hover:bg-[#141416]/40 transition-colors"
              onClick={() => setIsLyricsOpen(false)}
            />
            <div className="w-full flex items-center justify-between pb-3">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#2850ED] font-black flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2850ED] animate-pulse" />
                {lyricsData?.isSynced ? 'LIRIK SINKRON (REALTIME)' : 'TEKS LIRIK'}
              </span>
              <button
                type="button"
                onClick={() => setIsLyricsOpen(false)}
                className="w-8 h-8 rounded-full bg-white border-2 border-[#141416] shadow-[1.5px_1.5px_0px_#141416] text-[#141416] flex items-center justify-center transition-all hover:bg-[#FFE043] cursor-pointer btn-spring"
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
              </button>
            </div>
          </div>

          {/* Scrollable Lyrics */}
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-3.5 select-text text-center [mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_90%,transparent_100%)]"
          >
            {loadingLyrics ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-[#141416]/50 py-16">
                <span className="material-symbols-outlined text-[32px] animate-spin text-[#2850ED]">progress_activity</span>
                <span className="text-xs font-mono font-bold">Mencari lirik lagu...</span>
              </div>
            ) : lyricsData?.lines && lyricsData.lines.length > 0 ? (
              lyricsData.lines.map((line, idx) => {
                const isActive = activeLineIdx === idx
                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => line.time !== undefined && onSeek && onSeek(line.time)}
                    className="flex justify-center"
                  >
                    <span
                      className={`inline-block transition-all duration-300 cursor-pointer rounded-xl max-w-full text-center leading-snug ${
                        isActive
                          ? 'bg-[#2850ED] text-white font-black text-base xs:text-lg py-2 px-4 shadow-[3px_3px_0px_#141416] border-2 border-[#141416]'
                          : 'text-[#141416]/40 hover:text-[#141416] hover:bg-white/60 py-1 px-3 text-sm xs:text-base font-bold'
                      }`}
                    >
                      {line.text}
                    </span>
                  </div>
                )
              })
            ) : lyricsData?.plainLyrics ? (
              <div className="text-left text-xs font-bold leading-relaxed whitespace-pre-line text-[#141416]/80 p-4 max-w-md mx-auto bg-white rounded-2xl border-2 border-[#141416] shadow-[2px_2px_0px_#141416]">
                {lyricsData.plainLyrics}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-[#141416]/40 py-16">
                <span className="material-symbols-outlined text-[36px] mb-2 text-[#141416]/30">mic_off</span>
                <span className="text-xs font-bold text-[#141416]/60">Lirik belum tersedia untuk lagu ini</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          SLIDE-UP QUEUE BOTTOM SHEET (Neo-Brutalist Theme)
          ======================================================== */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        <div
          className={`absolute inset-x-0 bottom-0 top-14 bg-[#F7F4EB] rounded-t-3xl border-t-2 border-x-2 border-[#141416] flex flex-col shadow-[0_-8px_0px_#141416] transition-transform duration-[380ms] ease-out ${
            isQueueOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-full'
          }`}
        >
          <div className="flex flex-col items-center pt-3 px-5 shrink-0 bg-white border-b-2 border-[#141416]/10 rounded-t-3xl">
            <div
              className="w-12 h-1.5 rounded-full bg-[#141416]/20 mb-3 cursor-grab hover:bg-[#141416]/40 transition-colors"
              onClick={() => setIsQueueOpen(false)}
            />
            <div className="w-full flex items-center justify-between pb-3">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#141416] font-black flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#2850ED]">queue_music</span>
                ANTREAN • {tracks.length} LAGU
              </span>
              <button
                type="button"
                onClick={() => setIsQueueOpen(false)}
                className="w-8 h-8 rounded-full bg-white border-2 border-[#141416] shadow-[1.5px_1.5px_0px_#141416] text-[#141416] flex items-center justify-center transition-all hover:bg-[#FFE043] cursor-pointer btn-spring"
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-2">
            {tracks.map((track, idx) => {
              const isActive = (currentTrack?.id || currentTrack?.videoId) === (track.id || track.videoId)
              return (
                <div
                  key={track.id || idx}
                  onClick={() => {
                    onSelectTrack?.(track)
                    setIsQueueOpen(false)
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer border-2 transition-all btn-spring ${
                    isActive
                      ? 'bg-[#FFE043] border-[#141416] shadow-[2px_2px_0px_#141416]'
                      : 'bg-white border-[#141416]/15 hover:border-[#141416] hover:shadow-[2px_2px_0px_#141416] text-[#141416]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-[#141416]">
                    <img
                      src={getTrackCover(track)}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageFallback(e, track)}
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-black truncate uppercase leading-tight text-[#141416]">
                      {track.title}
                    </span>
                    <span className="text-[10px] font-bold text-[#141416]/60 truncate mt-0.5">
                      {track.artist}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#141416]/60">
                    {track.durationFormatted || '03:45'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
