import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDeezerTopChart } from '../services/deezerApi'
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
import { useScrollReveal, useStaggerChildren } from '../hooks/useAnimations'
import { toast } from 'sonner'

export default function HomePage() {
  const navigate = useNavigate()
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    seek,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    setIsLyricsModalOpen,
  } = usePlayer()

  const { user, isFavorite, toggleFavorite, favorites, history } = useAuth()
  const [chartTracks, setChartTracks] = useState([])
  const [chartLoading, setChartLoading] = useState(true)

  // Top Chart (Deezer = metadata rilisan resmi) → hanya lagu yang punya lirik sinkron di LRCLIB
  useEffect(() => {
    let alive = true
    ;(async () => {
      const tracks = await fetchDeezerTopChart(40)
      const checked = await Promise.all(
        tracks.map(async (t) => {
          try {
            const lyr = await getLyrics(t.artist, t.title, t.duration)
            return lyr?.isSynced ? t : null
          } catch {
            return null
          }
        })
      )
      if (!alive) return
      // Hapus preview 30 detik agar selalu diputar versi penuh yang dicocokkan dengan lirik
      setChartTracks(checked.filter(Boolean).map((t) => ({ ...t, audioUrl: undefined })))
      setChartLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  const [heroShowLyrics, setHeroShowLyrics] = useState(false)
  const [heroLyrics, setHeroLyrics] = useState(null)
  const [heroLyricsLoading, setHeroLyricsLoading] = useState(false)
  const [heroLyricOffset, setHeroLyricOffset] = useState(DEFAULT_LYRIC_OFFSET)
  const heroLyricsRef = useRef(null)
  const heroActiveLineRef = useRef(null)

  // Sync lyric offset with stored track preference and cross-component broadcast
  useEffect(() => {
    if (currentTrack) {
      const trackId = currentTrack.id || currentTrack.videoId
      setHeroLyricOffset(getSavedTrackOffset(trackId))
    }

    const handleOffsetChange = (e) => {
      const trackId = currentTrack?.id || currentTrack?.videoId
      if (e.detail?.trackId === trackId && typeof e.detail?.offset === 'number') {
        setHeroLyricOffset(e.detail.offset)
      }
    }

    window.addEventListener(LYRIC_OFFSET_EVENT, handleOffsetChange)
    return () => window.removeEventListener(LYRIC_OFFSET_EVENT, handleOffsetChange)
  }, [currentTrack?.id, currentTrack?.videoId])

  const handleAdjustHeroOffset = (delta) => {
    setHeroLyricOffset((prev) => {
      const next = Math.round((prev + delta) * 10) / 10
      const clamped = Math.max(-10, Math.min(10, next))
      const trackId = currentTrack?.id || currentTrack?.videoId
      saveTrackOffset(trackId, clamped)
      return clamped
    })
  }

  const handleResetHeroOffset = () => {
    setHeroLyricOffset(DEFAULT_LYRIC_OFFSET)
    const trackId = currentTrack?.id || currentTrack?.videoId
    saveTrackOffset(trackId, DEFAULT_LYRIC_OFFSET)
  }

  // Scroll reveal refs
  const greetingReveal = useScrollReveal({ threshold: 0.1 })
  const quickPlayReveal = useScrollReveal({ threshold: 0.1 })
  const heroReveal = useScrollReveal({ threshold: 0.08 })
  const chartHeaderReveal = useScrollReveal({ threshold: 0.1 })
  const chartCardReveal = useScrollReveal({ threshold: 0.05 })
  const genreHeaderReveal = useScrollReveal({ threshold: 0.1 })

  // Stagger children for chart items and genre cards
  const chartStagger = useStaggerChildren(9, 60)
  const genreStagger = useStaggerChildren(4, 100)

  const effectiveChartTracks = chartTracks

  // Quick Play horizontal scroll controller
  const quickPlayScrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftStartRef = useRef(0)

  const checkScrollState = useCallback(() => {
    const el = quickPlayScrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])

  // Fetch lyrics for current playing track (pass duration for bit-exact match)
  useEffect(() => {
    if (!currentTrack) {
      setHeroLyrics(null)
      return
    }

    let isMounted = true
    setHeroLyricsLoading(true)

    getLyrics(currentTrack.artist, currentTrack.title, currentTrack.duration)
      .then((data) => {
        if (isMounted) {
          setHeroLyrics(data)
          setHeroLyricsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setHeroLyrics(null)
          setHeroLyricsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentTrack?.title, currentTrack?.artist, currentTrack?.duration])

  // Active line index for hero synced lyrics with calibrated offset compensation
  const heroActiveLineIdx = useMemo(() => {
    if (!heroLyrics?.lines || heroLyrics.lines.length === 0) return -1
    return getActiveLyricIndex(heroLyrics.lines, currentTime, heroLyricOffset)
  }, [heroLyrics, currentTime, heroLyricOffset])

  // Auto scroll hero lyrics
  useEffect(() => {
    if (heroShowLyrics && heroActiveLineRef.current && heroLyricsRef.current) {
      heroActiveLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    } else if (heroShowLyrics && heroActiveLineIdx === -1 && heroLyricsRef.current) {
      heroLyricsRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [heroActiveLineIdx, heroShowLyrics])

  const effectiveDuration = duration || currentTrack?.duration || 195
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value)
    if (seek) seek((val / 100) * effectiveDuration)
  }

  // Real-time time of day tracker (refreshes every 30s)
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    if (currentHour >= 4 && currentHour < 11) return 'Selamat Pagi'
    if (currentHour >= 11 && currentHour < 15) return 'Selamat Siang'
    if (currentHour >= 15 && currentHour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  const isTrackFav = currentTrack ? isFavorite(currentTrack) : false

  // Quick play shortcuts from recently played or chart (up to 12 tracks)
  const quickPlayTracks = useMemo(() => {
    if (history && history.length > 0) return history.slice(0, 12)
    if (chartTracks && chartTracks.length > 0) return chartTracks.slice(0, 12)
    return []
  }, [history, chartTracks])

  // Attach mouse wheel and drag-to-scroll listeners for horizontal scroll
  useEffect(() => {
    const el = quickPlayScrollRef.current
    if (!el) return

    checkScrollState()
    el.addEventListener('scroll', checkScrollState, { passive: true })
    window.addEventListener('resize', checkScrollState)

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > 0) {
        const maxScroll = el.scrollWidth - el.clientWidth
        if ((e.deltaY > 0 && el.scrollLeft < maxScroll - 2) || (e.deltaY < 0 && el.scrollLeft > 2)) {
          e.preventDefault()
          el.scrollLeft += e.deltaY * 1.2
        }
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('scroll', checkScrollState)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', checkScrollState)
    }
  }, [checkScrollState, quickPlayTracks])

  const handleMouseDown = (e) => {
    const el = quickPlayScrollRef.current
    if (!el) return
    isDraggingRef.current = true
    hasDraggedRef.current = false
    startXRef.current = e.pageX - el.offsetLeft
    scrollLeftStartRef.current = el.scrollLeft
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    const el = quickPlayScrollRef.current
    if (!el) return
    const x = e.pageX - el.offsetLeft
    const walk = (x - startXRef.current) * 1.4
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true
    }
    el.scrollLeft = scrollLeftStartRef.current - walk
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
    setTimeout(() => {
      hasDraggedRef.current = false
    }, 50)
  }

  return (
    <div className="relative w-full select-none space-y-7 pb-8 page-enter">
      {/* Decorative Animated Background Shapes */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#FFD1C7] rounded-full blur-3xl opacity-30 pointer-events-none -z-10 shape-drift-1" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-[#A8E6CF] rounded-full blur-3xl opacity-25 pointer-events-none -z-10 shape-drift-2" />
      <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-[#FFEAA7] rounded-full blur-3xl opacity-30 pointer-events-none -z-10 shape-drift-3" />

      {/* ====== HEADER GREETING BAR ====== */}
      <section ref={greetingReveal.ref} className="pt-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-[#141416] tracking-tight uppercase">
            {getGreeting()}{user?.name ? `, ${user.name}` : ''}
          </h2>

          {favorites.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/playlist/liked-songs')}
              className="neo-btn bg-[#FF6D60] text-white text-[10px] px-3 py-1 gap-1.5 btn-spring cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[13px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span>{favorites.length} Disukai</span>
            </button>
          )}
        </div>
      </section>

      {/* ====== QUICK PLAY - Horizontal Scroll with Navigation & Wheel/Drag ====== */}
      {quickPlayTracks.length > 0 && (
        <section ref={quickPlayReveal.ref} className={`reveal ${quickPlayReveal.isVisible ? 'visible' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#141416]/70">
              {history && history.length > 0 ? 'Baru Diputar' : 'Populer Sekarang'}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => quickPlayScrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' })}
                disabled={!canScrollLeft}
                className={`w-7 h-7 rounded-xl border-2 border-[#141416] flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'bg-white hover:bg-[#FFE043] shadow-[1.5px_1.5px_0px_#141416] active:translate-x-[-1px] active:translate-y-[1px] cursor-pointer'
                    : 'bg-transparent border-[#141416]/20 text-[#141416]/30 cursor-not-allowed opacity-40'
                }`}
                title="Geser ke kiri"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => quickPlayScrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' })}
                disabled={!canScrollRight}
                className={`w-7 h-7 rounded-xl border-2 border-[#141416] flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'bg-white hover:bg-[#FFE043] shadow-[1.5px_1.5px_0px_#141416] active:translate-x-[-1px] active:translate-y-[1px] cursor-pointer'
                    : 'bg-transparent border-[#141416]/20 text-[#141416]/30 cursor-not-allowed opacity-40'
                }`}
                title="Geser ke kanan"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(history && history.length > 0 ? '/library' : '/search')}
                className="text-[11px] font-black uppercase tracking-wider text-[#2850ED] hover:underline flex items-center gap-1 cursor-pointer btn-spring ml-1"
              >
                <span>Lihat Semua</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>

          <div
            ref={quickPlayScrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth snap-x select-none cursor-grab active:cursor-grabbing"
          >
            {quickPlayTracks.map((track, idx) => {
              const isThisPlaying =
                isPlaying && (currentTrack?.id === track.id || currentTrack?.title === track.title)
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (!hasDraggedRef.current) {
                      playTrack(track, quickPlayTracks)
                    }
                  }}
                  style={{ transitionDelay: `${idx * 40}ms` }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border-2 cursor-pointer transition-all duration-300 shrink-0 min-w-[210px] max-w-[260px] snap-start group ${
                    isThisPlaying
                      ? 'bg-[#FFE043] border-[#141416] shadow-[2px_2px_0px_#141416]'
                      : 'bg-white border-[#141416]/15 hover:border-[#141416] hover:shadow-[2px_2px_0px_#141416] hover:-translate-y-0.5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl border border-[#141416] overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={getTrackCover(track)}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                      onError={(e) => handleImageFallback(e, track)}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-black text-[#141416] truncate block uppercase leading-tight group-hover:text-[#2850ED] transition-colors">
                      {track.title}
                    </span>
                    <span className="text-[10px] font-bold text-[#141416]/50 truncate block">
                      {track.artist}
                    </span>
                  </div>
                  {isThisPlaying && (
                    <div className="flex items-end gap-0.5 h-4 shrink-0">
                      <span className="w-0.5 bg-[#2850ED] rounded-full wave-bar-1" />
                      <span className="w-0.5 bg-[#2850ED] rounded-full wave-bar-2" />
                      <span className="w-0.5 bg-[#2850ED] rounded-full wave-bar-3" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ====== NOW PLAYING HERO CARD — with breathing artwork ====== */}
      {currentTrack && (
        <section ref={heroReveal.ref} className={`reveal-scale ${heroReveal.isVisible ? 'visible' : ''}`}>
          <div className="neo-card bg-white p-4 sm:p-5 relative shadow-[4px_4px_0px_#141416] !transform-none !hover:transform-none">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#141416]/10">
              <div className="flex items-center gap-2.5">
                <span className="neo-badge bg-[#FFE043] text-[#141416] text-[10px] px-2.5 py-0.5 transform -rotate-3">
                  NOW PLAYING
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => setHeroShowLyrics(!heroShowLyrics)}
                  className={`neo-badge text-[10px] px-2.5 sm:px-3 py-1 cursor-pointer transition-all flex items-center gap-1.5 btn-spring ${
                    heroShowLyrics
                      ? 'bg-[#2850ED] text-white shadow-[2px_2px_0px_#141416]'
                      : 'bg-[#F7F4EB] text-[#141416] hover:bg-[#FFE043]'
                  }`}
                  title="Lirik Sinkron"
                >
                  <span className="material-symbols-outlined text-[15px]">mic</span>
                  <span className="font-black hidden sm:inline">
                    {heroShowLyrics ? 'TUTUP LIRIK' : 'LIRIK'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLyricsModalOpen(true)}
                  className="p-1.5 rounded-full text-[#141416]/50 hover:text-[#2850ED] hover:bg-[#F7F4EB] transition-all cursor-pointer btn-spring"
                  title="Layar Penuh"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Left: Square Artwork with breathing effect */}
              <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 border-[#141416] overflow-hidden bg-[#243358] shrink-0 ${
                isPlaying ? 'artwork-glow-playing artwork-breathing' : 'shadow-[2.5px_2.5px_0px_#141416]'
              }`}>
                <img
                  src={getTrackCover(currentTrack)}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                  onError={(e) => handleImageFallback(e, currentTrack)}
                />
              </div>

              {/* Right: Info, Controls */}
              <div className="flex-1 w-full min-w-0 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-black text-[#141416] uppercase tracking-tight leading-none truncate">
                      {currentTrack.title}
                    </h2>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#141416]/60 mt-1 block truncate">
                      {currentTrack.artist}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(currentTrack)}
                    className={`p-1.5 btn-spring cursor-pointer ${
                      isTrackFav ? 'text-[#FF6D60]' : 'text-[#141416]/30 hover:text-[#141416]'
                    }`}
                    title="Favorit"
                  >
                    <span
                      className="material-symbols-outlined text-[24px]"
                      style={{ fontVariationSettings: isTrackFav ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-4 py-1">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={prevTrack}
                      className="text-[#141416] btn-spring cursor-pointer p-1"
                      title="Sebelumnya"
                    >
                      <span className="material-symbols-outlined text-[22px]">skip_previous</span>
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-full bg-[#141416] text-white border-2 border-[#141416] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] flex items-center justify-center btn-spring cursor-pointer"
                      title={isPlaying ? 'Jeda' : 'Putar'}
                    >
                      <span
                        className="material-symbols-outlined text-[24px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={nextTrack}
                      className="text-[#141416] btn-spring cursor-pointer p-1"
                      title="Berikutnya"
                    >
                      <span className="material-symbols-outlined text-[22px]">skip_next</span>
                    </button>
                  </div>

                  {/* Animated Equalizer */}
                  <div className="flex items-center gap-2 bg-[#F7F4EB] px-3 py-1.5 rounded-full border border-[#141416]/20">
                    <span className="material-symbols-outlined text-[17px] text-[#141416]/60">
                      volume_up
                    </span>
                    <div className="flex items-end gap-1 h-5">
                      <span className={`w-1 bg-[#141416] rounded-full transition-all ${isPlaying ? 'wave-bar-1' : 'h-1.5'}`} />
                      <span className={`w-1 bg-[#2850ED] rounded-full transition-all ${isPlaying ? 'wave-bar-2' : 'h-2.5'}`} />
                      <span className={`w-1 bg-[#FF6D60] rounded-full transition-all ${isPlaying ? 'wave-bar-3' : 'h-3'}`} />
                      <span className={`w-1 bg-[#FFE043] rounded-full transition-all ${isPlaying ? 'wave-bar-4' : 'h-2'}`} />
                      <span className={`w-1 bg-[#141416] rounded-full transition-all ${isPlaying ? 'wave-bar-2' : 'h-2.5'}`} />
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full flex items-center gap-2.5 pt-1">
                  <span className="text-[11px] font-mono font-black text-[#141416]/60 whitespace-nowrap w-10 text-right">
                    {formatDuration(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercent}
                    onChange={handleSeekChange}
                    className="flex-1 h-1.5 bg-[#E8E4D8] rounded-full appearance-none cursor-pointer accent-[#2850ED]"
                  />
                  <span className="text-[11px] font-mono font-black text-[#141416]/60 whitespace-nowrap w-10">
                    {formatDuration(effectiveDuration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Embedded Synced Lyrics Panel */}
            {heroShowLyrics && (
              <div className="mt-4 pt-3 border-t-2 border-[#141416]/10 reveal visible">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#141416]/70 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2850ED] animate-pulse" />
                      {heroLyrics?.isSynced
                        ? 'LIRIK SINKRON'
                        : 'TEKS LIRIK'}
                    </span>
                    {heroLyrics?.isSynced && (
                      <div className="flex items-center gap-1 bg-[#EFEAD8] px-2 py-0.5 rounded-lg border border-[#141416]/15 text-[10px] font-bold text-[#141416]/70">
                        <span className="font-mono">
                          {heroLyricOffset > 0 ? `+${heroLyricOffset.toFixed(1)}s` : heroLyricOffset < 0 ? `${heroLyricOffset.toFixed(1)}s` : '0.0s'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustHeroOffset(-0.2)}
                          className="px-1 bg-white hover:bg-[#FFE043] rounded text-[#141416] cursor-pointer"
                          title="Mundurkan lirik 0.2 detik"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={handleResetHeroOffset}
                          className="px-1 bg-white hover:bg-gray-200 rounded text-[9px] text-[#141416] cursor-pointer"
                          title="Reset ke 0"
                        >
                          0
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustHeroOffset(+0.2)}
                          className="px-1 bg-white hover:bg-[#FFE043] rounded text-[#141416] cursor-pointer"
                          title="Majukan lirik 0.2 detik"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLyricsModalOpen(true)}
                    className="text-[10px] font-black uppercase text-[#2850ED] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Layar Penuh</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_full</span>
                  </button>
                </div>

                  <div
                    ref={heroLyricsRef}
                    className="max-h-52 overflow-y-auto no-scrollbar p-3 px-4 rounded-2xl bg-[#F7F4EB] border-2 border-[#141416] shadow-[2px_2px_0px_#141416] text-center space-y-1.5 select-text"
                  >
                    {heroLyricsLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#141416]/60">
                        <span className="material-symbols-outlined text-[24px] animate-spin text-[#2850ED]">
                          progress_activity
                        </span>
                        <span className="text-xs font-black uppercase">Memuat Lirik...</span>
                      </div>
                    ) : heroLyrics?.lines && heroLyrics.lines.length > 0 ? (
                      <>
                        {heroLyrics.lines.map((line, idx) => {
                          const isActive = heroActiveLineIdx === idx
                          const isPast = heroActiveLineIdx !== -1 && idx < heroActiveLineIdx
                          return (
                            <div
                              key={idx}
                              ref={isActive ? heroActiveLineRef : null}
                              onClick={() => line.time !== undefined && seek(Math.max(0, line.time - heroLyricOffset))}
                              className="py-0.5 px-1 transition-all duration-300 flex justify-center"
                            >
                              <span
                                className={`inline-block transition-all duration-300 cursor-pointer rounded-xl max-w-full text-center leading-snug ${
                                  isActive
                                    ? 'bg-[#2850ED] text-white font-black text-sm sm:text-base py-1.5 px-4 shadow-[2px_2px_0px_#141416] border-2 border-[#141416]'
                                    : isPast
                                    ? 'text-[#141416]/70 hover:text-[#141416] hover:bg-white/60 py-1 px-3 text-xs sm:text-[13px] font-bold'
                                    : 'text-[#141416]/35 hover:text-[#141416] hover:bg-white/40 py-1 px-3 text-xs sm:text-[13px] font-bold'
                                }`}
                              >
                                {line.text}
                              </span>
                            </div>
                          )
                        })}
                      </>
                  ) : heroLyrics?.plainLyrics ? (
                    <div className="text-left text-xs font-bold leading-relaxed whitespace-pre-line text-[#141416]/80 p-2 max-w-md mx-auto bg-white rounded-xl border border-[#141416]">
                      {heroLyrics.plainLyrics}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-[#141416]/50">
                      <span className="material-symbols-outlined text-[24px] block mb-1">mic_off</span>
                      <span className="text-xs font-bold">Lirik belum tersedia untuk lagu ini</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}



      {/* ====== TRENDING CHARTS ====== */}
      <section className="space-y-3">
        <div ref={chartHeaderReveal.ref} className={`flex items-center justify-between reveal-left ${chartHeaderReveal.isVisible ? 'visible' : ''}`}>
          <div className="flex items-center gap-2.5">
            <span className="neo-badge text-[10px] px-2.5 py-0.5 bg-[#2850ED] text-white">
              TOP CHART
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#141416]/70 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#2850ED]">lyrics</span>
              Lagu Populer · Lirik Sinkron
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => playTrack(effectiveChartTracks[0], effectiveChartTracks)}
              className="neo-btn bg-[#2850ED] text-white text-[10px] px-2.5 py-1 gap-1 btn-spring cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">play_arrow</span>
              <span>Putar Semua</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="text-[11px] font-black uppercase tracking-wider text-[#2850ED] hover:underline flex items-center gap-1 cursor-pointer btn-spring ml-1"
            >
              <span>Lihat Semua</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <div ref={chartCardReveal.ref} className={`neo-card bg-white p-3.5 sm:p-5 shadow-[4px_4px_0px_#141416] !transform-none reveal-scale ${chartCardReveal.isVisible ? 'visible' : ''}`}>
          {effectiveChartTracks && effectiveChartTracks.length > 0 ? (
            <div ref={chartStagger.parentRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {effectiveChartTracks.slice(0, 9).map((track, idx) => {
                const isThisPlaying =
                  isPlaying && (currentTrack?.id === track.id || currentTrack?.title === track.title)
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, effectiveChartTracks)}
                    className={`stagger-item ${chartStagger.isChildVisible(idx) ? 'visible' : ''} flex items-center justify-between p-2 rounded-2xl border-2 cursor-pointer group ${
                      isThisPlaying
                        ? 'bg-[#FFE043] border-[#141416] shadow-[2px_2px_0px_#141416]'
                        : 'bg-[#F7F4EB] hover:bg-[#FFFDE8] border-[#141416]/15 hover:border-[#141416] hover:shadow-[2px_2px_0px_#141416] hover:-translate-y-0.5'
                    } transition-all duration-300`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs font-mono font-black w-4 text-center ${
                        isThisPlaying ? 'text-[#2850ED]' : 'text-[#141416]/40'
                      }`}>
                        {isThisPlaying ? (
                          <span className="material-symbols-outlined text-[14px] animate-pulse">equalizer</span>
                        ) : (
                          idx + 1
                        )}
                      </span>

                      <div className="w-11 h-11 rounded-xl border border-[#141416] overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={getTrackCover(track)}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => handleImageFallback(e, track)}
                        />
                      </div>

                      <div className="min-w-0">
                        <h5 className="text-xs font-black text-[#141416] uppercase truncate leading-tight group-hover:text-[#2850ED] transition-colors">
                          {track.title}
                        </h5>
                        <p className="text-[10px] font-bold text-[#141416]/60 truncate mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          playTrack(track, chartTracks)
                          setIsLyricsModalOpen(true)
                        }}
                        className="w-7 h-7 rounded-full bg-white border border-[#141416] shadow-[1px_1px_0px_#141416] hover:bg-[#FFE043] flex items-center justify-center text-[#141416] btn-spring"
                        title="Buka Lirik"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[#2850ED]">mic</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isThisPlaying) {
                            togglePlay()
                          } else {
                            playTrack(track, chartTracks)
                          }
                        }}
                        className={`w-7 h-7 rounded-full border-2 border-[#141416] shadow-[1px_1px_0px_#141416] flex items-center justify-center btn-spring ${
                          isThisPlaying ? 'bg-[#2850ED] text-white' : 'bg-[#141416] text-white hover:bg-[#2850ED]'
                        }`}
                        title={isThisPlaying ? 'Jeda' : 'Putar'}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {isThisPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <span className={`material-symbols-outlined text-[32px] text-[#141416]/30 mb-2 ${chartLoading ? 'animate-spin' : ''}`}>
                {chartLoading ? 'progress_activity' : 'lyrics'}
              </span>
              <p className="text-xs font-bold text-[#141416]/50">
                {chartLoading ? 'Mencocokkan lagu dengan lirik sinkron...' : 'Chart belum tersedia, coba lagi nanti.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ====== EXPLORE CATEGORIES — 3D tilt cards with stagger ====== */}
      <section className="space-y-3">
        <div ref={genreHeaderReveal.ref} className={`flex items-center justify-between reveal-left ${genreHeaderReveal.isVisible ? 'visible' : ''}`}>
          <h3 className="text-sm font-black uppercase tracking-wider text-[#141416]/70">
            Jelajahi Genre
          </h3>
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="text-[11px] font-black uppercase tracking-wider text-[#2850ED] hover:underline flex items-center gap-1 cursor-pointer btn-spring"
          >
            <span>Semua Genre</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div ref={genreStagger.parentRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Pop & Viral', color: 'from-rose-500 to-pink-600', query: 'pop', icon: 'trending_up' },
            { name: 'Hip-Hop & R&B', color: 'from-orange-500 to-amber-600', query: 'hiphop', icon: 'mic' },
            { name: 'Lo-Fi Chill', color: 'from-purple-600 to-indigo-800', query: 'lofi', icon: 'headphones' },
            { name: 'K-Pop Hits', color: 'from-pink-500 to-rose-400', query: 'kpop', icon: 'star' },
          ].map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/search?q=${cat.query}`)}
              className={`stagger-item ${genreStagger.isChildVisible(idx) ? 'visible' : ''} tilt-card relative h-24 sm:h-28 rounded-2xl p-4 bg-gradient-to-br ${cat.color} border-2 border-[#141416] shadow-[3px_3px_0px_#141416] overflow-hidden cursor-pointer select-none group`}
            >
              <span className="text-sm font-black text-white tracking-tight leading-tight block drop-shadow-sm uppercase">
                {cat.name}
              </span>
              <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-[48px] text-white/20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                {cat.icon}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
