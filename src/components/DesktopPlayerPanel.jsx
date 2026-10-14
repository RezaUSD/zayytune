import React, { useRef, useState, useEffect, useMemo } from 'react'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import { getLyrics } from '../services/lyricsApi'
import { getTrackCover, handleImageFallback } from '../services/imageHelper'
import {
  getActiveLyricIndex,
  getSavedTrackOffset,
  saveTrackOffset,
  DEFAULT_LYRIC_OFFSET,
  LYRIC_OFFSET_EVENT,
} from '../services/lyricsHelper'

export default function DesktopPlayerPanel() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    isRepeat,
    volume,
    queue,
    queueIndex,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    playTrack,
  } = usePlayer()

  const { isFavorite, toggleFavorite } = useAuth()
  const progressBarRef = useRef(null)
  const volumeBarRef = useRef(null)
  const lyricsContainerRef = useRef(null)
  const activeLineRef = useRef(null)

  const [showLyrics, setShowLyrics] = useState(false)
  const [lyricsData, setLyricsData] = useState(null)
  const [loadingLyrics, setLoadingLyrics] = useState(false)
  const [panelOffset, setPanelOffset] = useState(DEFAULT_LYRIC_OFFSET)
  const [isMuted, setIsMuted] = useState(false)
  const [prevVolume, setPrevVolume] = useState(0.8)

  const effectiveDuration = duration || currentTrack?.duration || 220
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))

  // Sync offset for active track & listen for cross-component updates
  useEffect(() => {
    if (currentTrack) {
      const trackId = currentTrack.id || currentTrack.videoId
      setPanelOffset(getSavedTrackOffset(trackId))
    }

    const handleOffsetBroadcast = (e) => {
      const trackId = currentTrack?.id || currentTrack?.videoId
      if (e.detail?.trackId === trackId && typeof e.detail?.offset === 'number') {
        setPanelOffset(e.detail.offset)
      }
    }

    window.addEventListener(LYRIC_OFFSET_EVENT, handleOffsetBroadcast)
    return () => window.removeEventListener(LYRIC_OFFSET_EVENT, handleOffsetBroadcast)
  }, [currentTrack?.id, currentTrack?.videoId])

  const handleAdjustPanelOffset = (delta) => {
    setPanelOffset((prev) => {
      const next = Math.round((prev + delta) * 10) / 10
      const clamped = Math.max(-10, Math.min(10, next))
      const trackId = currentTrack?.id || currentTrack?.videoId
      saveTrackOffset(trackId, clamped)
      return clamped
    })
  }

  const handleResetPanelOffset = () => {
    setPanelOffset(DEFAULT_LYRIC_OFFSET)
    const trackId = currentTrack?.id || currentTrack?.videoId
    saveTrackOffset(trackId, DEFAULT_LYRIC_OFFSET)
  }

  // Fetch lyrics when track changes (with duration constraint)
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

  // Calculate synced lyrics active index with calibrated offset compensation
  const activeLineIdx = useMemo(() => {
    if (!lyricsData?.lines || lyricsData.lines.length === 0) return -1
    return getActiveLyricIndex(lyricsData.lines, currentTime, panelOffset)
  }, [lyricsData, currentTime, panelOffset])

  // Auto-scroll active lyric line (or top during intro)
  useEffect(() => {
    if (showLyrics && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    } else if (showLyrics && activeLineIdx === -1 && lyricsContainerRef.current) {
      lyricsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activeLineIdx, showLyrics])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const remainingTime = Math.max(0, effectiveDuration - currentTime)

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !seek) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.min(1, Math.max(0, clickX / rect.width))
    seek(percent * effectiveDuration)
  }

  const handleVolumeClick = (e) => {
    if (!volumeBarRef.current || !setVolume) return
    const rect = volumeBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newVol = Math.min(1, Math.max(0, clickX / rect.width))
    setVolume(newVol)
    if (newVol > 0) setIsMuted(false)
  }

  const handleMuteToggle = () => {
    if (isMuted || volume === 0) {
      setIsMuted(false)
      setVolume(prevVolume || 0.8)
    } else {
      setPrevVolume(volume)
      setIsMuted(true)
      setVolume(0)
    }
  }

  const fav = currentTrack ? isFavorite(currentTrack) : false
  const upNextTrack = queue && queueIndex + 1 < queue.length ? queue[queueIndex + 1] : null

  return (
    <aside className="w-80 flex-shrink-0 hidden xl:flex flex-col bg-white border-l-2 border-[#141416] p-5 h-screen sticky top-0 justify-between select-none relative shadow-[-4px_0px_0px_#141416]/10 text-[#141416]">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#141416]/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="neo-badge bg-[#FFE043] text-[#141416] text-[9px] px-2 py-0.5">
            STUDIO
          </span>
          <span className="text-[11px] font-black tracking-widest uppercase text-[#141416]">
            NOW PLAYING
          </span>
          {isPlaying && (
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-1 h-full bg-[#2850ED] animate-pulse rounded-full" />
              <span className="w-1 h-2/3 bg-[#FF6D60] animate-pulse delay-75 rounded-full" />
              <span className="w-1 h-4/5 bg-[#FFE043] animate-pulse delay-150 rounded-full" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => currentTrack && toggleFavorite(currentTrack)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              fav ? 'text-rose-400' : 'text-white/40 hover:text-white'
            }`}
            title={fav ? 'Disukai' : 'Tambah ke Favorit'}
          >
            <span
              className="material-symbols-outlined text-[19px]"
              style={{ fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>

      {/* 2. Main Track Artwork & Info Showcase */}
      <div className="flex flex-col items-center text-center my-auto py-2">
        {/* Cover Art Card */}
        <div className="relative w-52 h-52 2xl:w-56 2xl:h-56 rounded-2xl overflow-hidden shadow-[3.5px_3.5px_0px_#141416] border-2 border-[#141416] bg-gray-100 group">
          <img
            src={getTrackCover(currentTrack)}
            alt={currentTrack?.title || 'No Track'}
            referrerPolicy="no-referrer"
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
            onError={(e) => handleImageFallback(e, currentTrack)}
          />
        </div>

        {/* Title, Artist, & Lossless Chip */}
        <div className="mt-4 w-full px-2">
          <h3 className="text-base font-black text-[#141416] uppercase truncate leading-snug">
            {currentTrack ? currentTrack.title : 'Pilih Lagu Diputar'}
          </h3>
          <p className="text-xs font-bold text-[#141416]/60 truncate mt-0.5">
            {currentTrack ? currentTrack.artist : 'Timbre Hi-Fi Studio'}
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-[#98E8CE] border border-[#141416] text-[10px] text-[#141416] font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-[#141416]" />
            <span>FULL STREAM • YOUTUBE</span>
          </div>
        </div>

        {/* Timeline Progress Slider */}
        <div className="w-full mt-5 space-y-1.5">
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            className="group/slider relative h-2 bg-[#E8E4D8] border border-[#141416]/20 rounded-full cursor-pointer overflow-hidden transition-all hover:h-2.5"
          >
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-[#2850ED] rounded-full relative"
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#141416] opacity-0 group-hover/slider:opacity-100 shadow-md transition-opacity" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#141416]/60 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(remainingTime)}</span>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2.5 w-full mt-3 px-1">
          <button
            type="button"
            onClick={handleMuteToggle}
            className="text-[#141416]/60 hover:text-[#141416] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <span className="material-symbols-outlined text-[17px]">
              {isMuted || volume === 0
                ? 'volume_off'
                : volume < 0.5
                ? 'volume_down'
                : 'volume_up'}
            </span>
          </button>
          <div
            ref={volumeBarRef}
            onClick={handleVolumeClick}
            className="flex-1 h-1.5 bg-[#E8E4D8] border border-[#141416]/20 rounded-full cursor-pointer overflow-hidden group/vol hover:h-2 transition-all"
          >
            <div
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              className="h-full bg-[#141416] group-hover/vol:bg-[#2850ED] rounded-full"
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#141416]/60 w-7 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>

      {/* 3. Up Next Mini Row */}
      {upNextTrack && !showLyrics && (
        <div
          onClick={() => playTrack(upNextTrack, queue)}
          className="my-2 p-2 rounded-xl bg-[#F7F4EB] hover:bg-[#FFFDE8] border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center justify-between gap-2.5 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={getTrackCover(upNextTrack)}
              alt={upNextTrack.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-8 h-8 rounded-lg object-cover border border-[#141416] shrink-0"
              onError={(e) => handleImageFallback(e, upNextTrack)}
            />
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#141416]/50 block">
                Up Next
              </span>
              <span className="text-xs font-black uppercase text-[#141416] group-hover:text-[#2850ED] truncate block">
                {upNextTrack.title}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#141416]/40 group-hover:text-[#141416]">
            play_arrow
          </span>
        </div>
      )}

      {/* 4. Controls Dock at bottom */}
      <div className="w-full rounded-2xl bg-[#2850ED] p-3 text-white border-2 border-[#141416] shadow-[3.5px_3.5px_0px_#141416] flex flex-col gap-2 z-20">
        <div className="flex items-center justify-between px-1">
          {/* Shuffle */}
          <button
            type="button"
            onClick={toggleShuffle}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isShuffle ? 'text-[#FFE043]' : 'text-white/70 hover:text-white'
            }`}
            title="Acak"
          >
            <span
              className="material-symbols-outlined text-[19px]"
              style={{ fontVariationSettings: isShuffle ? "'FILL' 1" : "'FILL' 0" }}
            >
              shuffle
            </span>
          </button>

          {/* Previous */}
          <button
            type="button"
            onClick={prevTrack}
            className="p-1.5 text-white hover:scale-110 active:scale-90 transition-transform cursor-pointer"
            title="Sebelumnya"
          >
            <span className="material-symbols-outlined text-[24px]">skip_previous</span>
          </button>

          {/* Big White Round Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-white text-[#141416] border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center justify-center active:scale-90 hover:scale-105 transition-all cursor-pointer"
            title={isPlaying ? 'Jeda' : 'Putar'}
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={nextTrack}
            className="p-1.5 text-white hover:scale-110 active:scale-90 transition-transform cursor-pointer"
            title="Berikutnya"
          >
            <span className="material-symbols-outlined text-[24px]">skip_next</span>
          </button>

          {/* Repeat */}
          <button
            type="button"
            onClick={toggleRepeat}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isRepeat ? 'text-[#FFE043]' : 'text-white/70 hover:text-white'
            }`}
            title="Ulangi"
          >
            <span
              className="material-symbols-outlined text-[19px]"
              style={{ fontVariationSettings: isRepeat ? "'FILL' 1" : "'FILL' 0" }}
            >
              repeat
            </span>
          </button>
        </div>

        {/* Toggle Slide-Up Lyrics Button */}
        <button
          type="button"
          onClick={() => setShowLyrics(!showLyrics)}
          className="w-full py-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:text-[#FFE043] transition-colors cursor-pointer pt-1 border-t border-white/20"
        >
          <span className="material-symbols-outlined text-[16px]">
            {showLyrics ? 'expand_more' : 'mic'}
          </span>
          <span>{showLyrics ? 'Tutup Lirik' : 'Lirik Sinkron'}</span>
        </button>
      </div>

      {/* ========================================================
          5. SLIDE-UP LYRICS OVERLAY — properly clipped by wrapper
          ======================================================== */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        <div
          className={`absolute inset-x-0 bottom-0 top-0 bg-[#F7F4EB] border-l-2 border-[#141416] flex flex-col p-4 transition-transform duration-[380ms] ease-out ${
            showLyrics ? 'translate-y-0 pointer-events-auto' : 'translate-y-full'
          }`}
        >
          {/* Header of lyrics slide-up */}
          <div className="flex flex-wrap items-center justify-between gap-1 pb-2 border-b-2 border-[#141416]/10 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="neo-badge bg-[#FFE043] text-[#141416] text-[9px] px-1.5 py-0.5">
                KARAOKE
              </span>
              {lyricsData?.isSynced && (
                <div className="flex items-center gap-1 bg-[#EFEAD8] px-1.5 py-0.5 rounded text-[9px] font-bold text-[#141416]/70 border border-[#141416]/15">
                  <span className="font-mono">
                    {panelOffset > 0 ? `+${panelOffset.toFixed(1)}s` : panelOffset < 0 ? `${panelOffset.toFixed(1)}s` : '0.0s'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustPanelOffset(-0.2)}
                    className="px-1 bg-white hover:bg-[#FFE043] rounded cursor-pointer"
                    title="-0.2s"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPanelOffset}
                    className="px-1 bg-white hover:bg-gray-200 rounded text-[8px] cursor-pointer"
                    title="Reset"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustPanelOffset(+0.2)}
                    className="px-1 bg-white hover:bg-[#FFE043] rounded cursor-pointer"
                    title="+0.2s"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowLyrics(false)}
              className="w-7 h-7 rounded-full bg-white border border-[#141416] shadow-[1px_1px_0px_#141416] text-[#141416] hover:bg-[#FFE043] flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup Lirik"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Scrollable lyrics content */}
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3 select-text text-center"
          >
            {loadingLyrics ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-[#141416]/50 py-12">
                <span className="material-symbols-outlined text-[28px] animate-spin text-[#2850ED]">
                  progress_activity
                </span>
                <span className="text-xs font-black uppercase">Memuat lirik...</span>
              </div>
            ) : lyricsData?.lines && lyricsData.lines.length > 0 ? (
              <>
                {lyricsData.lines.map((line, idx) => {
                  const isActive = activeLineIdx === idx
                  const isPast = activeLineIdx !== -1 && idx < activeLineIdx
                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => line.time !== undefined && seek(Math.max(0, line.time - panelOffset))}
                      className="py-0.5 px-1 transition-all duration-300 flex justify-center"
                    >
                      <span
                        className={`inline-block transition-all duration-300 cursor-pointer rounded-xl max-w-full text-center leading-snug ${
                          isActive
                            ? 'bg-[#2850ED] text-white font-black text-xs sm:text-sm py-1.5 px-3 shadow-[1.5px_1.5px_0px_#141416] border border-[#141416]'
                            : isPast
                            ? 'text-[#141416]/70 hover:text-[#141416] py-0.5 px-2 text-[11px] font-bold'
                            : 'text-[#141416]/35 hover:text-[#141416] py-0.5 px-2 text-[11px] font-bold'
                        }`}
                      >
                        {line.text}
                      </span>
                    </div>
                  )
                })}
              </>
            ) : lyricsData?.plainLyrics ? (
              <div className="text-[#141416]/80 text-xs font-bold leading-relaxed whitespace-pre-line px-1 text-left bg-white p-3 rounded-xl border border-[#141416]">
                {lyricsData.plainLyrics}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-[#141416]/40 py-12">
                <span className="material-symbols-outlined text-[32px] mb-1.5 text-[#141416]/30">
                  mic_off
                </span>
                <span className="text-xs font-black uppercase text-[#141416]/60">Lirik belum tersedia</span>
                <span className="text-[10px] text-[#141416]/40 mt-1 max-w-[180px]">
                  Lirik untuk trek ini belum ada di arsip LRCLIB.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
