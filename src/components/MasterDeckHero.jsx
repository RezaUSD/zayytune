import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { getLyrics } from '../services/lyricsApi'
import { LISTENING_MODES } from '../hooks/useAudioModes'

export default function MasterDeckHero({
  mood,
  currentTrack,
  isPlaying,
  currentTime = 0,
  onSeek,
  onTogglePlay,
  isFavorite,
  onToggleFavorite,
  onOpenApiKey,
  onOpenSearch,
  accent,
  activeListeningModeId = 'original',
  onSelectListeningMode,
  tracks = [],
  onSelectTrack,
  isShuffle = false,
  onToggleShuffle,
  isRepeat = false,
  onToggleRepeat,
  rpm = 33,
  onToggleRpm,
  isFavoritesFilterActive = false,
  onToggleFavoritesFilter,
  onMobileOverlayChange,
  favoritesCount = 0,
}) {
  const [isCueDown, setIsCueDown] = useState(true)
  const [showLyrics, setShowLyrics] = useState(false)
  const [lyricsData, setLyricsData] = useState(null)
  const [loadingLyrics, setLoadingLyrics] = useState(false)
  const [mobileOverlay, setMobileOverlay] = useState(null) // null | 'queue' | 'lyrics'
  const lyricsContainerRef = useRef(null)
  const activeLineRef = useRef(null)

  // Notify parent component whenever overlay opens/closes
  useEffect(() => {
    onMobileOverlayChange?.(Boolean(mobileOverlay))
  }, [mobileOverlay, onMobileOverlayChange])

  // Mobile Swipe-Down to Dismiss Handlers
  const touchStartY = useRef(0)
  const touchDeltaY = useRef(0)

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
    touchDeltaY.current = 0
  }

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY
    touchDeltaY.current = currentY - touchStartY.current
  }

  const handleTouchEnd = () => {
    if (touchDeltaY.current > 70) {
      setMobileOverlay(null)
    }
    touchStartY.current = 0
    touchDeltaY.current = 0
  }

  // Switch mobile view to queue when favorites filter changes
  useEffect(() => {
    if (isFavoritesFilterActive) {
      setMobileOverlay('queue')
    }
  }, [isFavoritesFilterActive])

  // Fetch lyrics whenever currentTrack changes
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
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist])

  // Calculate active line index in synced lyrics
  const activeLineIdx = useMemo(() => {
    if (!lyricsData?.lines || lyricsData.lines.length === 0) return -1
    const lines = lyricsData.lines
    for (let i = lines.length - 1; i >= 0; i--) {
      if (currentTime >= lines[i].time) {
        return i
      }
    }
    return 0
  }, [lyricsData, currentTime])

  // Auto-scroll active lyric into view
  useEffect(() => {
    if ((showLyrics || mobileOverlay === 'lyrics') && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeLineIdx, showLyrics, mobileOverlay])

  const handleCueToggle = () => {
    const nextCue = !isCueDown
    setIsCueDown(nextCue)
    if (nextCue && !isPlaying) {
      onTogglePlay()
    } else if (!nextCue && isPlaying) {
      onTogglePlay()
    }
  }

  // Realistic Turntable Tonearm Angle:
  // - Rest position: 0 deg (resting safely on outer arm rest)
  // - Playing grooves: 16 deg (lead-in groove) to 22 deg (runout groove) as song progresses
  const progressRatio = currentTrack?.duration
    ? Math.min(1, Math.max(0, currentTime / currentTrack.duration))
    : 0.25
  const tonearmAngle = isPlaying && isCueDown ? 16 + progressRatio * 6 : 0

  // 100% Unified, Robust Skeuomorphic Turntable (Used across Desktop & Mobile)
  const renderTurntable = (sizeClasses = 'w-[220px] h-[220px] sm:w-[270px] sm:h-[270px] lg:w-[330px] lg:h-[330px] xl:w-[360px] xl:h-[360px]') => (
    <div className={`relative ${sizeClasses} flex items-center justify-center pointer-events-auto`}>
      {/* Subtle Studio Optical Halo */}
      {isPlaying && isCueDown && (
        <div
          className="absolute inset-[-12px] rounded-full opacity-20 pointer-events-none blur-xl transition-opacity duration-1000"
          style={{
            background: 'radial-gradient(circle at center, transparent 40%, #6366f1 70%, transparent 100%)',
          }}
        />
      )}

      {/* Turntable Platter Base Shadow */}
      <div className="absolute inset-0 rounded-full bg-[#0b0a1a] shadow-[0_24px_64px_rgba(0,0,0,0.95),inset_0_4px_16px_rgba(0,0,0,0.95)] scale-105" />

      {/* Heavy Acrylic Outer Rim */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-[#1f1f24] via-[#2c2c33] to-[#121215] shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]" />

      {/* The Vinyl Record Disc with GPU Accelerated Rotation */}
      <div
        className={`relative w-full h-full rounded-full p-2 sm:p-2.5 shadow-[0_16px_45px_rgba(0,0,0,0.85)] cursor-pointer transition-transform duration-700 ${
          isPlaying && isCueDown
            ? rpm === 45
              ? 'vinyl-spin-45'
              : 'vinyl-spin-33'
            : 'vinyl-paused'
        }`}
        onClick={onTogglePlay}
        title={isPlaying ? 'Klik untuk jeda piringan' : 'Klik untuk putar piringan'}
      >
        {/* Vinyl Groove Base */}
        <div className="w-full h-full rounded-full relative overflow-hidden bg-[#0d0d0f] shadow-[inset_0_0_80px_rgba(0,0,0,0.95)]">
          {/* Microgroove Concentric Highlights */}
          <div
            className="absolute inset-0 rounded-full opacity-85"
            style={{
              background:
                'radial-gradient(circle at center, transparent 33%, #1b1b20 33.5%, #0b0b0e 34%, #1e1e24 38%, #0e0e12 39%, #222228 44%, #121215 45%, #25252c 51%, #0a0a0c 52%, #1e1e23 58%, #0f0f13 59%, #23232a 66%, #121215 67%, #1a1a20 74%, #0a0a0d 75%, #282830 82%, #141418 83%, #22222a 90%, #0d0d10 91%, #1e1e24 96%, #0b0b0e 97%)',
            }}
          />

          {/* Vinyl Specular Sheen */}
          <div
            className="absolute inset-0 rounded-full opacity-40 mix-blend-screen pointer-events-none"
            style={{
              background:
                'conic-gradient(from 45deg at 50% 50%, rgba(255,255,255,0.18) 0deg, transparent 55deg, rgba(255,255,255,0.02) 120deg, rgba(255,255,255,0.22) 180deg, transparent 235deg, rgba(255,255,255,0.03) 300deg, rgba(255,255,255,0.18) 360deg)',
            }}
          />

          {/* Vinyl Run-Out Matrix Area */}
          <div className="absolute inset-[28%] rounded-full border border-white/[0.04]" />

          {/* Center Paper Label */}
          <div className="absolute inset-[35%] rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center border-2 border-[#ffb3b1]/40">
            <img
              src={
                currentTrack?.coverArtUrl ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
              }
              alt={currentTrack?.title || 'Turntable'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
              }}
            />
            {/* Center Label Overlay Info Ring */}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-between py-1.5 sm:py-2.5 text-center pointer-events-none">
              <span className="font-label-sm text-[6px] sm:text-[7px] text-white tracking-widest uppercase font-bold drop-shadow font-mono">
                SIDE A • {rpm === 45 ? '45 RPM' : '33 ⅓ RPM'}
              </span>
              <span className="font-headline-sm text-[8px] sm:text-[10px] text-white font-black tracking-wider uppercase drop-shadow line-clamp-1 px-1">
                {currentTrack ? currentTrack.title : 'ZAYYTUNE'}
              </span>
              <span className="font-label-sm text-[6px] sm:text-[7px] text-[#ffdada] tracking-widest uppercase font-bold drop-shadow font-mono">
                STEREO DSD
              </span>
            </div>

            {/* Brass Spindle Hole Bushing */}
            <div className="absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-[#9c7a23] via-[#eac349] to-[#ffe088] shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#08080a] shadow-inner" />
            </div>
          </div>
        </div>
      </div>

      {/* SKEUOMORPHIC PRECISION CHROME TONEARM (100% Integrated SVG - Never Detached) */}
      <div
        className="absolute -right-5 -top-8 sm:-right-8 sm:-top-12 w-48 sm:w-56 lg:w-56 xl:w-60 h-68 sm:h-84 lg:h-84 xl:h-88 pointer-events-none transition-transform duration-700 z-40 tonearm-wand"
        style={{
          transform: `rotate(${tonearmAngle}deg)`,
          transformOrigin: '81.25% 13.33%',
          filter: isCueDown
            ? 'drop-shadow(0 14px 10px rgba(0,0,0,0.75))'
            : 'drop-shadow(0 26px 18px rgba(0,0,0,0.45))',
        }}
      >
        <svg className="absolute inset-0 w-full h-full drop-shadow-[0_16px_12px_rgba(0,0,0,0.75)]" fill="none" viewBox="0 0 240 360">
          {/* Base Gimbal Housing & Pivot Assembly */}
          <circle cx="195" cy="48" r="22" fill="#181820" stroke="#334155" strokeWidth="1.5" />
          <circle cx="195" cy="48" r="14" fill="#2d3345" stroke="#64748b" strokeWidth="1" />
          <circle cx="195" cy="48" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
          <rect x="189" y="16" width="12" height="15" rx="2" fill="#262630" stroke="#475569" strokeWidth="1" />

          {/* S-Shape Polished Mirror Chrome Arm Tube (Layered Solid Stroke for Guaranteed Rendering) */}
          {/* Dark tube contour */}
          <path
            d="M 195 48 C 175 110, 150 170, 115 225 C 100 248, 85 272, 78 290"
            stroke="#1e293b"
            strokeLinecap="round"
            strokeWidth="6"
          />
          {/* Polished chrome body */}
          <path
            d="M 195 48 C 175 110, 150 170, 115 225 C 100 248, 85 272, 78 290"
            stroke="#e2e8f0"
            strokeLinecap="round"
            strokeWidth="4"
          />
          {/* Top specular reflection line */}
          <path
            d="M 195 48 C 175 110, 150 170, 115 225 C 100 248, 85 272, 78 290"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeWidth="1.5"
          />

          {/* Headshell & Stylus strictly attached to wand end at (78, 290) */}
          <g transform="translate(78, 290) rotate(-24)">
            {/* Connector collar */}
            <rect x="-4" y="-3" width="8" height="6" rx="1.5" fill="#d1d5db" stroke="#475569" strokeWidth="0.8" />
            {/* Cartridge body */}
            <path d="M -5.5 3 L 5.5 3 L 4.5 28 L -4.5 28 Z" fill="#0f172a" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.8" />
            {/* Finger lift hook */}
            <path d="M 4.5 9 C 11 9, 13 4, 14 2" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Ortofon text */}
            <text x="0" y="15" fill="#ffffff" fontSize="3.5" fontFamily="monospace" fontWeight="bold" letterSpacing="0.4" textAnchor="middle">
              ORTOFON
            </text>
            {/* LED indicator */}
            <circle cx="0" cy="21" r="1.4" fill="#818cf8" />
            {/* Gold stylus cantilever */}
            <rect x="-0.8" y="28" width="1.6" height="8" rx="0.5" fill="#eab308" />
            {/* Diamond stylus needle tip */}
            <circle cx="0" cy="36" r="1.8" fill={isPlaying && isCueDown ? '#818cf8' : '#ffffff'} opacity={isPlaying && isCueDown ? '0.95' : '0.4'} />
          </g>
        </svg>
      </div>

      {/* 3D Tactile Glass Cue Lever Floating Pill */}
      <button
        onClick={handleCueToggle}
        type="button"
        className="absolute -bottom-3.5 sm:-bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/75 hover:bg-black/95 backdrop-blur-xl text-white px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-wider shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)] flex items-center gap-1.5 transition-all pointer-events-auto border-t border-l border-white/30 border-r border-b border-white/10 font-mono whitespace-nowrap active:scale-95 cursor-pointer"
        title="Tuas Jarum Turntable: Klik untuk menaikkan/menurunkan jarum vinyl"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isCueDown ? 'bg-indigo-400 shadow-[0_0_8px_#818cf8]' : 'bg-white/30'
          }`}
        />
        <span>{isCueDown ? 'Tuas Jarum: Aktif' : 'Tuas: Diangkat'}</span>
      </button>
    </div>
  )

  return (
    <div className="w-full h-auto min-h-full lg:h-full flex flex-col justify-start lg:justify-center relative select-none overflow-x-hidden">
      {/* Top Background Canvas - Deep Indigo Theme across the entire deck with Ocean Wave Flow */}
      <div className="relative w-full h-auto min-h-full lg:h-full flex flex-col overflow-visible lg:overflow-hidden bg-gradient-to-br from-[#1b1845] via-[#131131] to-[#0c0a1f]">
        
        {/* ========================================================
            ORGANIC OCEAN WAVE SPLIT (Desktop Only)
            ======================================================== */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block overflow-hidden select-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="ocean-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2c2668" />
                <stop offset="50%" stopColor="#201c4e" />
                <stop offset="100%" stopColor="#141136" />
              </linearGradient>
            </defs>
            <path
              d="M 500 0 C 535 140, 465 260, 480 380 C 495 480, 535 520, 525 620 C 515 720, 465 820, 485 920 C 495 960, 505 980, 500 1000 L 1000 1000 L 1000 0 Z"
              fill="url(#ocean-body-grad)"
            />
          </svg>
        </div>

        {/* ========================================================
            DESKTOP VIEW (Visible on lg and larger screens)
            Strict 1-page fixed studio 3-column layout
            ======================================================== */}
        <div className="hidden lg:grid lg:grid-cols-12 w-full h-full relative">
          {/* LEFT PANEL: Tracklist & Modes */}
          <div className="lg:col-span-6 w-full h-full px-4 sm:px-10 lg:pl-10 lg:pr-36 xl:pl-14 xl:pr-44 py-4 sm:py-6 relative z-10 flex flex-col justify-center items-start">
            <div className="relative z-10 max-w-sm sm:max-w-md w-full">
              {/* Section Header with Tabs */}
              <div className="flex items-center justify-between w-full pb-2 mb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                  <button
                    type="button"
                    onClick={() => onToggleFavoritesFilter?.(false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                      !isFavoritesFilterActive
                        ? 'bg-indigo-500/25 text-white border border-indigo-400/30 shadow-sm'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Top Hits 2026</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavoritesFilter?.(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                      isFavoritesFilterActive
                        ? 'bg-rose-500/25 text-rose-200 border border-rose-400/30 shadow-sm'
                        : 'text-white/40 hover:text-rose-300'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[13px] text-rose-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                    <span>Favorit {favoritesCount > 0 ? `(${favoritesCount})` : ''}</span>
                  </button>
                </div>

                <span className="text-[10px] text-white/40 font-mono hidden sm:inline">
                  {isFavoritesFilterActive ? 'Koleksi Tersimpan' : 'Billboard Hits'}
                </span>
              </div>

              {/* Tracklist Items */}
              {isFavoritesFilterActive && tracks.length === 0 ? (
                <div className="py-7 px-4 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-[28px] text-rose-400/50 mb-1.5">
                    favorite
                  </span>
                  <span className="text-xs text-white/80 font-medium">Belum ada lagu favorit</span>
                  <p className="text-[10px] text-white/40 max-w-xs mt-0.5 leading-relaxed">
                    Klik ikon hati (❤️) pada pemutar lagu atau turntable untuk menyimpannya ke daftar favorit ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {(tracks.length > 0 ? tracks.slice(0, 5) : [currentTrack]).map((track, idx) => {
                    if (!track) return null
                    const isActive = currentTrack?.id === track.id

                    return (
                      <div
                        key={track.id || idx}
                        onClick={() => onSelectTrack && onSelectTrack(track)}
                        className={`group flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer border ${
                          isActive
                            ? 'bg-white/[0.08] border-indigo-500/40 text-white shadow-sm'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.04] text-white/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-5 flex items-center justify-center shrink-0">
                            {isActive && isPlaying ? (
                              <span className="material-symbols-outlined text-[15px] text-indigo-400 animate-pulse">
                                volume_up
                              </span>
                            ) : (
                              <span className={`font-mono text-[11px] font-medium ${isActive ? 'text-indigo-300' : 'text-white/40 group-hover:text-white'}`}>
                                0{idx + 1}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs sm:text-[13px] font-semibold truncate ${isActive ? 'text-white' : 'text-white/90 group-hover:text-white transition-colors'}`}>
                                {track.title}
                              </span>
                              {isActive && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[8px] uppercase tracking-wider font-semibold">
                                  {isPlaying ? 'Diputar' : 'Dipilih'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-white/50 truncate">
                              {track.artist}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isActive && isPlaying && (
                            <div className="hidden sm:flex items-center gap-0.5 h-3 w-6 px-0.5 justify-center">
                              <span className="w-0.5 h-2 bg-indigo-400 animate-pulse" />
                              <span className="w-0.5 h-3 bg-indigo-300 animate-pulse" style={{ animationDelay: '120ms' }} />
                              <span className="w-0.5 h-1.5 bg-indigo-400 animate-pulse" style={{ animationDelay: '240ms' }} />
                            </div>
                          )}
                          <span className={`font-mono text-[10px] sm:text-[11px] font-medium ${isActive ? 'text-indigo-300' : 'text-white/40'}`}>
                            {track.durationFormatted || '03:45'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Audio Spectrum Indicator */}
              <div className="mt-2.5 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-white/50 font-medium">
                  Spektrum Frekuensi
                </span>
                <div className="flex items-end gap-1 h-3 px-1">
                  {[35, 70, 95, 60, 85, 40, 100, 75, 50, 90, 65, 45, 80].map((val, idx) => (
                    <span
                      key={idx}
                      className="w-0.5 rounded-t transition-all duration-150"
                      style={{
                        height: isPlaying ? `${val}%` : '20%',
                        backgroundColor: '#818cf8',
                        opacity: isPlaying ? 0.9 : 0.25,
                        animation: isPlaying ? `pulse ${0.35 + (idx % 4) * 0.12}s ease-in-out infinite alternate` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Audio Character Mode Selector */}
              <div className="mt-3 w-full">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                    Mode Karakter Audio
                  </span>
                  <span className="text-[10px] text-indigo-300 font-mono font-medium">
                    {LISTENING_MODES.find(m => m.id === activeListeningModeId)?.badge || '1.0x Normal'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto no-scrollbar py-0.5">
                  {LISTENING_MODES.map((mode) => {
                    const isModeActive = activeListeningModeId === mode.id
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => onSelectListeningMode && onSelectListeningMode(mode.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] transition-all font-medium flex items-center gap-1.5 cursor-pointer active:scale-95 select-none ${
                          isModeActive
                            ? 'bg-indigo-500/30 text-white border border-indigo-400/40 shadow-sm font-semibold'
                            : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/[0.06]'
                        }`}
                        title={mode.description}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: mode.color || '#818cf8' }}
                        />
                        <span>{mode.shortName || mode.name}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-1.5 text-[10px] text-white/45 truncate">
                  {LISTENING_MODES.find((m) => m.id === activeListeningModeId)?.description}
                </p>
              </div>

              {/* Playback Status & Speed Controls */}
              <div className="pt-2.5 flex items-center justify-between gap-3 border-t border-white/[0.06] mt-3 w-full">
                <div className="flex items-center gap-2 text-[10px] text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{isPlaying ? 'Memutar Audio Hi-Fi' : 'Siap Diputar'}</span>
                </div>

                <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
                  <button
                    onClick={() => onToggleRpm && onToggleRpm(33)}
                    type="button"
                    className={`px-2.5 py-0.5 text-[10px] font-medium rounded-md transition-all ${
                      rpm === 33
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                    title="Kecepatan standar LP (33 ⅓ RPM)"
                  >
                    33 ⅓ RPM
                  </button>
                  <button
                    onClick={() => onToggleRpm && onToggleRpm(45)}
                    type="button"
                    className={`px-2.5 py-0.5 text-[10px] font-medium rounded-md transition-all ${
                      rpm === 45
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                    title="Kecepatan single (45 RPM)"
                  >
                    45 RPM
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Track Showcase & Lyrics */}
          <div className="lg:col-span-6 w-full h-full relative overflow-hidden flex flex-col justify-center items-end px-4 sm:px-10 lg:pl-48 xl:pl-56 2xl:pl-64 lg:pr-10 xl:pr-14 py-4 sm:py-6">
            <div className="relative z-10 max-w-sm sm:max-w-md w-full rounded-2xl p-4 sm:p-5 backdrop-blur-2xl bg-gradient-to-b from-white/[0.09] via-white/[0.04] to-white/[0.02] border-t border-l border-white/25 border-r border-b border-white/[0.06] shadow-[0_25px_60px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.25)]">
              {/* Studio Metadata Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.08] backdrop-blur-md text-indigo-200 text-[10px] font-medium border-t border-l border-white/25 border-r border-b border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                  Piringan Hitam Hi-Fi
                </span>
                <span className="text-[10px] text-white/50 font-mono">
                  {currentTrack?.album || 'Single'}
                </span>
              </div>

              {/* Track Title */}
              <h1 className="text-2xl sm:text-3xl text-white font-bold tracking-tight leading-tight line-clamp-2">
                {currentTrack ? currentTrack.title : 'Pilih Trek Musik'}
              </h1>

              {/* Artist Info */}
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-indigo-200 font-medium">
                  {currentTrack ? currentTrack.artist : 'Artis Musik'}
                </span>
              </div>

              {/* Dynamic Area: Track Overview OR Interactive Lyrics */}
              {!showLyrics ? (
                <div className="mt-2.5">
                  <p className="text-xs text-white/70 leading-relaxed font-sans line-clamp-2">
                    {currentTrack?.description ||
                      'Format master piringan hitam resolusi tinggi dengan separasi instrumen studio analog alami.'}
                  </p>

                  {/* Technical Specs Bar */}
                  <div className="grid grid-cols-3 gap-3 mt-3.5 bg-black/30 backdrop-blur-xl px-3.5 py-2.5 rounded-xl border border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)] max-w-sm">
                    <div>
                      <span className="block text-[9px] text-white/50 uppercase font-medium tracking-wider">Format</span>
                      <span className="text-xs text-white font-semibold">{rpm === 45 ? 'Single 45 RPM' : 'Vinyl 33 ⅓ RPM'}</span>
                    </div>
                    <div className="border-l border-white/10 pl-3">
                      <span className="block text-[9px] text-white/50 uppercase font-medium tracking-wider">Kualitas</span>
                      <span className="text-xs text-white font-semibold">24-Bit Lossless</span>
                    </div>
                    <div className="border-l border-white/10 pl-3">
                      <span className="block text-[9px] text-white/50 uppercase font-medium tracking-wider">Durasi</span>
                      <span className="text-xs text-white font-semibold">{currentTrack?.durationFormatted || '03:45'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 w-full max-w-sm sm:max-w-md bg-transparent rounded-2xl flex flex-col h-52 sm:h-56 transition-all">
                  <div className="flex items-center justify-between pb-2 mb-1 border-b border-white/10 text-white/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_#818cf8]" />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-indigo-300 font-bold">
                        {lyricsData?.isSynced ? 'LIVE SYNCED KARAOKE' : 'STUDIO LYRICS'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowLyrics(false)}
                      type="button"
                      className="text-white/50 hover:text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors px-2 py-0.5 rounded-full hover:bg-white/10"
                      title="Tutup lirik"
                    >
                      <span>Tutup</span>
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </div>

                  <div
                    ref={lyricsContainerRef}
                    className="flex-1 overflow-y-auto no-scrollbar scroll-smooth py-2 pr-1 space-y-2 select-text [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_88%,transparent_100%)]"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {loadingLyrics ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-white/70 py-4">
                        <span className="material-symbols-outlined text-[20px] animate-spin text-indigo-300">progress_activity</span>
                        <span className="font-mono text-[10px] tracking-wider uppercase">Mengambil lirik studio...</span>
                      </div>
                    ) : lyricsData?.lines && lyricsData.lines.length > 0 ? (
                      lyricsData.lines.map((line, idx) => {
                        const isActive = activeLineIdx === idx
                        return (
                          <div
                            key={idx}
                            ref={isActive ? activeLineRef : null}
                            onClick={() => onSeek && line.time !== undefined && onSeek(line.time)}
                            className={`transition-all duration-300 cursor-pointer rounded-lg py-1 px-1.5 ${
                              isActive
                                ? 'text-white font-extrabold text-sm sm:text-[15px] tracking-wide scale-[1.02] origin-left drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]'
                                : 'text-white/35 hover:text-white/80 text-xs sm:text-[13px] font-medium hover:translate-x-0.5'
                            }`}
                            title={line.time !== undefined ? `Lompat ke menit ${Math.floor(line.time / 60)}:${String(Math.floor(line.time % 60)).padStart(2, '0')}` : undefined}
                          >
                            {line.text}
                          </div>
                        )
                      })
                    ) : lyricsData?.plainLyrics ? (
                      <div className="text-white/85 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line px-1.5 py-1 font-sans">
                        {lyricsData.plainLyrics}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-white/50 py-3 px-2">
                        <span className="material-symbols-outlined text-[22px] mb-1 text-white/40">queue_music</span>
                        <span className="font-mono text-[10px] uppercase font-bold text-white/70">Lirik belum tersedia</span>
                        <span className="text-[9px] text-white/40 mt-0.5 max-w-[220px]">
                          Lirik resmi untuk trek ini belum ada di arsip LRCLIB.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2.5">
                <button
                  onClick={onTogglePlay}
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-white via-white/95 to-white/85 hover:from-white hover:to-white/95 text-black font-semibold text-xs rounded-full border-t border-white shadow-[0_10px_25px_rgba(255,255,255,0.25),inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.4)] hover:shadow-[0_14px_30px_rgba(255,255,255,0.35)] transition-all active:scale-95 active:translate-y-0.5 cursor-pointer"
                  title={isPlaying ? 'Jeda pemutaran musik' : 'Mulai putar lagu di piringan hitam'}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isPlaying ? 'Jeda Musik' : 'Putar Lagu'}</span>
                </button>

                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs rounded-full transition-all active:scale-95 cursor-pointer ${
                    showLyrics
                      ? 'bg-white text-black border-t border-white shadow-[0_8px_20px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.9)]'
                      : 'bg-white/10 hover:bg-white/15 backdrop-blur-xl text-white border-t border-l border-white/25 border-r border-b border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)]'
                  }`}
                  title={showLyrics ? 'Kembali ke detail' : 'Buka lirik lagu'}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showLyrics ? 'info' : 'lyrics'}
                  </span>
                  <span>{showLyrics ? 'Tutup Lirik' : 'Lihat Lirik'}</span>
                </button>

                <button
                  onClick={onToggleFavorite}
                  type="button"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border-t border-l border-white/25 border-r border-b border-white/10 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] transition-all active:scale-95 cursor-pointer"
                  title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* DESKTOP CENTER TURNTABLE */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-center">
            {renderTurntable('w-[330px] h-[330px] xl:w-[360px] xl:h-[360px]')}
          </div>
        </div>

        {/* ========================================================
            MOBILE VIEW (Visible on screens < lg)
            Ultra-Clean, Breathable & Luxury Apple/Spotify Aesthetic
            ======================================================== */}
        <div className="flex lg:hidden flex-col items-center w-full px-4 sm:px-6 pt-3 pb-8 z-10">
          
          {/* 1. MAIN CLEAN PLAYER VIEW (When no drawer is open) */}
          {!mobileOverlay && (
            <div className="w-full max-w-sm flex flex-col items-center space-y-4 animate-in fade-in duration-200">
              
              {/* Turntable Platter Hero with Soft Ambient Glow */}
              <div className="relative w-full flex items-center justify-center pt-2 pb-2">
                <div className="absolute w-56 h-56 rounded-full bg-indigo-500/[0.14] blur-3xl pointer-events-none" />
                {renderTurntable('w-[220px] h-[220px] xs:w-[250px] xs:h-[250px] sm:w-[280px] sm:h-[280px]')}
              </div>

              {/* Clean Now Playing Typography Row */}
              <div className="w-full flex items-center justify-between px-1 pt-1">
                <div className="flex flex-col min-w-0 pr-3">
                  <h2 className="text-xl text-white font-black tracking-tight truncate leading-tight">
                    {currentTrack ? currentTrack.title : 'Pilih Trek Musik'}
                  </h2>
                  <p className="text-xs text-zinc-400 font-medium truncate mt-0.5">
                    {currentTrack ? currentTrack.artist : 'Artis Musik'}
                  </p>
                </div>

                {/* Favorite Heart Button */}
                <button
                  onClick={onToggleFavorite}
                  type="button"
                  className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
                  title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${isFavorite ? 'text-rose-400' : 'text-white/60'}`}
                    style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>
              </div>

              {/* Audio Vibe Chips & RPM Bar (Single Sleek Row - No Clunky Box) */}
              <div className="w-full space-y-2 pt-1">
                {/* Active Mode & RPM Indicator */}
                <div className="w-full flex items-center justify-between px-1 text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                      style={{ backgroundColor: LISTENING_MODES.find(m => m.id === activeListeningModeId)?.color || '#818cf8' }}
                    />
                    <span className="text-zinc-200 font-medium truncate">
                      {LISTENING_MODES.find(m => m.id === activeListeningModeId)?.name}
                    </span>
                    <span className="text-indigo-300/80 font-mono text-[10px] shrink-0">
                      ({LISTENING_MODES.find(m => m.id === activeListeningModeId)?.badge})
                    </span>
                  </div>

                  {/* Minimalist 33 / 45 RPM Switch */}
                  <div className="flex items-center gap-1 bg-white/[0.05] p-0.5 rounded-full border border-white/10 shrink-0">
                    <button
                      onClick={() => onToggleRpm && onToggleRpm(33)}
                      type="button"
                      className={`px-2.5 py-0.5 text-[9px] font-semibold font-mono rounded-full transition-all cursor-pointer ${
                        rpm === 33 ? 'bg-white text-black font-bold shadow-sm' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      33 RPM
                    </button>
                    <button
                      onClick={() => onToggleRpm && onToggleRpm(45)}
                      type="button"
                      className={`px-2.5 py-0.5 text-[9px] font-semibold font-mono rounded-full transition-all cursor-pointer ${
                        rpm === 45 ? 'bg-white text-black font-bold shadow-sm' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      45 RPM
                    </button>
                  </div>
                </div>

                {/* 1-Row Horizontal Scrollable Vibe Chips */}
                <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
                  {LISTENING_MODES.map((mode) => {
                    const isActive = activeListeningModeId === mode.id
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => onSelectListeningMode && onSelectListeningMode(mode.id)}
                        className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 select-none ${
                          isActive
                            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)] font-bold'
                            : 'bg-white/[0.05] text-zinc-300 hover:text-white border border-white/10 hover:bg-white/[0.1]'
                        }`}
                        title={mode.description}
                      >
                        <span
                          className="material-symbols-outlined text-[14px]"
                          style={{ color: isActive ? '#000' : (mode.color || '#818cf8') }}
                        >
                          {mode.icon || 'graphic_eq'}
                        </span>
                        <span>{mode.shortName || mode.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quick Action Navigation Pills (Antrean & Lirik) */}
              <div className="w-full flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMobileOverlay('queue')}
                  className="flex-1 max-w-[170px] py-2 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-xs font-semibold text-white/90 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-indigo-300">queue_music</span>
                  <span>Antrean ({tracks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileOverlay('lyrics')}
                  className="flex-1 max-w-[170px] py-2 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-xs font-semibold text-white/90 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-indigo-300">lyrics</span>
                  <span>Lirik Lagu</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. OVERLAY: ANTREAN & FAVORIT (Sleek Full-Bleed Sheet via Portal - z-[9999]) */}
          {mobileOverlay === 'queue' && typeof document !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0c0a1f] animate-in slide-in-from-bottom-5 duration-200">
              {/* Top Drag Handle Indicator with Touch Swipe */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none shrink-0"
              >
                <div className="w-12 h-1.5 rounded-full bg-white/30" />
                <span className="text-[10px] text-white/50 font-mono mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
                  <span>Tarik ke bawah atau tekan kembali</span>
                </span>
              </div>

              {/* Sheet Header with Prominent Back Button */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] shrink-0 bg-[#0c0a1f]">
                <button
                  type="button"
                  onClick={() => setMobileOverlay(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white active:scale-95 transition-all text-xs font-semibold cursor-pointer border border-white/10"
                  title="Kembali ke Pemutar"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Kembali</span>
                </button>

                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Daftar Putar</h3>
                  <span className="text-[10px] font-mono text-zinc-300 font-bold bg-white/[0.08] px-2 py-0.5 rounded-full border border-white/10">
                    {tracks.length}
                  </span>
                </div>

                {/* Circular Close Button */}
                <button
                  type="button"
                  onClick={() => setMobileOverlay(null)}
                  className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  title="Tutup antrean"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Segmented Filter Control (Top Hits vs Favorit) */}
              <div className="px-4 pt-3 pb-2 shrink-0">
                <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/10">
                  <button
                    type="button"
                    onClick={() => onToggleFavoritesFilter?.(false)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      !isFavoritesFilterActive
                        ? 'bg-indigo-600 text-white shadow-md font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-300" />
                    <span>Top Hits 2026</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavoritesFilter?.(true)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFavoritesFilterActive
                        ? 'bg-rose-500 text-white shadow-md font-bold'
                        : 'text-zinc-400 hover:text-rose-300'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[15px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                    <span>Favorit ({favoritesCount})</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Tracklist (Borderless, Clean, Spotify Rows) */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={(e) => {
                  if (e.currentTarget.scrollTop <= 5 && touchDeltaY.current > 70) {
                    setMobileOverlay(null)
                  }
                  handleTouchEnd()
                }}
                className="flex-1 overflow-y-auto no-scrollbar px-3 py-1 space-y-1 pb-28"
              >
                {isFavoritesFilterActive && tracks.length === 0 ? (
                  <div className="py-20 px-4 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center my-4">
                    <span className="material-symbols-outlined text-[36px] text-rose-400/50 mb-2">favorite</span>
                    <span className="text-sm text-white/90 font-semibold">Belum ada lagu favorit</span>
                    <p className="text-xs text-white/40 mt-1 max-w-[220px] leading-relaxed">
                      Ketuk ikon hati (❤️) pada lagu untuk menyimpannya ke daftar ini.
                    </p>
                  </div>
                ) : (
                  (tracks.length > 0 ? tracks : [currentTrack]).map((track, idx) => {
                    if (!track) return null
                    const isActive = currentTrack?.id === track.id
                    return (
                      <div
                        key={track.id || idx}
                        onClick={() => {
                          onSelectTrack && onSelectTrack(track)
                          setMobileOverlay(null)
                        }}
                        className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all cursor-pointer group active:scale-[0.99] ${
                          isActive
                            ? 'bg-white/[0.12] text-white shadow-sm'
                            : 'hover:bg-white/[0.04] text-zinc-300 active:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                          {/* Cover Art Thumbnail with Guaranteed Fallback */}
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/10 flex items-center justify-center shadow-sm">
                            <img
                              src={track.coverArtUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'}
                              alt={track.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'
                              }}
                            />
                            {isActive && isPlaying && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                <div className="flex items-end gap-0.5 h-3.5">
                                  <span className="w-0.5 h-full bg-indigo-400 animate-pulse rounded-full" />
                                  <span className="w-0.5 h-2/3 bg-indigo-300 animate-pulse delay-75 rounded-full" />
                                  <span className="w-0.5 h-4/5 bg-indigo-400 animate-pulse delay-150 rounded-full" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Track Titles */}
                          <div className="flex flex-col min-w-0">
                            <span className={`text-[13px] font-semibold truncate leading-tight ${isActive ? 'text-indigo-300 font-bold' : 'text-white'}`}>
                              {track.title}
                            </span>
                            <span className="text-[11px] text-zinc-400 truncate mt-1">
                              {track.artist}
                            </span>
                          </div>
                        </div>

                        {/* Duration & Play Icon */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className={`font-mono text-xs ${isActive ? 'text-indigo-300 font-semibold' : 'text-zinc-500'}`}>
                            {track.durationFormatted || '03:45'}
                          </span>
                          <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-indigo-400' : 'text-white/20'}`}>
                            {isActive && isPlaying ? 'pause_circle' : 'play_circle'}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>,
            document.body
          )}

          {/* 3. OVERLAY: LIRIK KARAOKE (Sleek Full-Bleed Karaoke Sheet via Portal - z-[9999]) */}
          {mobileOverlay === 'lyrics' && typeof document !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0c0a1f] animate-in slide-in-from-bottom-5 duration-200">
              {/* Top Drag Handle Indicator with Touch Swipe */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none shrink-0"
              >
                <div className="w-12 h-1.5 rounded-full bg-white/30" />
                <span className="text-[10px] text-white/50 font-mono mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
                  <span>Tarik ke bawah atau tekan kembali</span>
                </span>
              </div>

              {/* Sheet Header with Prominent Back Button */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] shrink-0 bg-[#0c0a1f]">
                <button
                  type="button"
                  onClick={() => setMobileOverlay(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white active:scale-95 transition-all text-xs font-semibold cursor-pointer border border-white/10"
                  title="Kembali ke Pemutar Lagu"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Kembali</span>
                </button>

                <div className="flex flex-col items-center text-center">
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    {lyricsData?.isSynced ? 'Karaoke Live Synced' : 'Lirik Lagu'}
                  </h3>
                  <span className="text-[10px] font-mono text-indigo-300/80 uppercase">LRCLIB STUDIO</span>
                </div>

                {/* Clean Circular Close Button */}
                <button
                  type="button"
                  onClick={() => setMobileOverlay(null)}
                  className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  title="Tutup lirik"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Track Info Bar */}
              <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                  <img
                    src={currentTrack?.coverArtUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'}
                    alt={currentTrack?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'
                    }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">{currentTrack?.title || 'Memuat Trek'}</span>
                  <span className="text-[11px] text-zinc-400 truncate mt-0.5">{currentTrack?.artist || 'Artis Musik'}</span>
                </div>
              </div>

              {/* Scrollable Lyrics Container with Pull-Down to Close */}
              <div
                ref={lyricsContainerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={(e) => {
                  if (lyricsContainerRef.current?.scrollTop <= 5 && touchDeltaY.current > 70) {
                    setMobileOverlay(null)
                  }
                  handleTouchEnd()
                }}
                className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-6 py-6 space-y-5 select-text pb-32 [mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_90%,transparent_100%)]"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loadingLyrics ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-white/70 py-16">
                    <span className="material-symbols-outlined text-[28px] animate-spin text-indigo-300">progress_activity</span>
                    <span className="font-mono text-xs tracking-wider uppercase">Mengambil lirik studio...</span>
                  </div>
                ) : lyricsData?.lines && lyricsData.lines.length > 0 ? (
                  lyricsData.lines.map((line, idx) => {
                    const isActive = activeLineIdx === idx
                    return (
                      <div
                        key={idx}
                        ref={isActive ? activeLineRef : null}
                        onClick={() => onSeek && line.time !== undefined && onSeek(line.time)}
                        className={`transition-all duration-300 cursor-pointer rounded-xl py-2 px-3 ${
                          isActive
                            ? 'text-white font-black text-xl tracking-wide scale-[1.02] origin-left drop-shadow-[0_2px_16px_rgba(255,255,255,0.6)]'
                            : 'text-white/35 hover:text-white/80 text-sm font-medium'
                        }`}
                      >
                        {line.text}
                      </div>
                    )
                  })
                ) : lyricsData?.plainLyrics ? (
                  <div className="text-white/85 text-sm leading-relaxed whitespace-pre-line px-1 py-1 font-sans">
                    {lyricsData.plainLyrics}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-white/50 py-16">
                    <span className="material-symbols-outlined text-[32px] mb-2 text-white/40">queue_music</span>
                    <span className="font-mono text-xs uppercase font-bold text-white/70">Lirik belum tersedia</span>
                    <span className="text-[11px] text-white/40 mt-1 max-w-[200px]">
                      Lirik resmi belum tersedia di arsip studio.
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Floating Quick Exit Button for Effortless Mobile Navigation */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setMobileOverlay(null)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs shadow-[0_8px_25px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.5)] active:scale-95 transition-all border border-indigo-400/40 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                  <span>Tutup Lirik & Kembali</span>
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>

      </div>
    </div>
  )
}
