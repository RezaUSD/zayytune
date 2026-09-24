import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Toaster, toast } from 'sonner'
import { MOODS, getMoodById } from './moods'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAudioAnalyser } from './hooks/useAudioAnalyser'
import { useJamendoByTag, useJamendoSearch } from './hooks/useJamendo'
import { useYouTubePlayer } from './hooks/useYouTubePlayer'
import { useAudioModes } from './hooks/useAudioModes'
import { useDeezerChart } from './hooks/useDeezer'
import { resolveFullTrack } from './services/deezerApi'
import { TRENDING_YOUTUBE_HITS } from './services/youtubeSearch'

import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MasterDeckHero from './components/MasterDeckHero'
import SpotifyPlayerBar from './components/SpotifyPlayerBar'
import SearchPanel from './components/SearchPanel'
import ThemeOverridePanel from './components/ThemeOverridePanel'
import CaseStudyModal from './components/CaseStudyModal'
import ApiKeyModal from './components/ApiKeyModal'

export default function App() {
  // ---------- Persisted Preferences ----------
  const [lastMoodId, setLastMoodId] = useLocalStorage('timbre:lastMood', 'chill')
  const [customTheme, setCustomTheme] = useLocalStorage('timbre:customTheme', null)
  const [favorites, setFavorites] = useLocalStorage('timbre:favorites', [])
  const [favoriteTracks, setFavoriteTracks] = useLocalStorage('timbre:favoriteTrackObjects', [])
  const [volume, setVolume] = useLocalStorage('timbre:volume', 0.8)

  // Current selected mood
  const mood = getMoodById(lastMoodId || 'chill')

  // Modals & Navigation state
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [isThemeOpen, setThemeOpen] = useState(false)
  const [isCaseStudyOpen, setCaseStudyOpen] = useState(false)
  const [isApiKeyOpen, setApiKeyOpen] = useState(false)
  const [isMobileRailOpen, setMobileRailOpen] = useState(false)
  const [activeRailView, setActiveRailView] = useState('master-console')
  const [activeBottomNav, setActiveBottomNav] = useState('home')
  const [isFavoritesFilterActive, setIsFavoritesFilterActive] = useState(false)
  const [isMobileOverlayOpen, setIsMobileOverlayOpen] = useState(false)

  // Audio Playback State
  const { tracks: moodTracks, status: tracksStatus } = useJamendoByTag(mood)
  const { tracks: deezerTracks, status: deezerStatus } = useDeezerChart(20)

  // Effective catalog: uses Jamendo when key is provided, or Deezer Simple API (free & no key)
  const effectiveTracks = useMemo(() => {
    if (moodTracks && moodTracks.length > 0) return moodTracks
    if (deezerTracks && deezerTracks.length > 0) return deezerTracks
    return []
  }, [moodTracks, deezerTracks])

  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(true) // Default to repeat/loop for continuous studio flow
  const [rpm, setRpm] = useState(33) // 33.33 or 45 RPM rotation speed

  const audioRef = useRef(null)
  const onEndedRef = useRef(null)

  // 3 Listening Modes Hook (Original, Slowed + Reverb, Bass Boost)
  const {
    modes: listeningModes,
    currentMode: activeListeningMode,
    activeModeId: activeListeningModeId,
    setMode: setListeningMode,
    syncPlaybackRate,
  } = useAudioModes()

  // YouTube Engine Instance with Auto-Fallback
  const ytPlayer = useYouTubePlayer({
    onEnded: () => onEndedRef.current?.(),
    onError: () => {
      if (currentTrack?.audioUrl && audioRef.current) {
        audioRef.current.src = currentTrack.audioUrl
        syncPlaybackRate(audioRef.current, null, currentTrack)
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
        toast.info(`Beralih ke audio langsung: ${currentTrack.title}`)
      }
    },
  })

  const { getFrequencyData, getTimeDomainData, resume } = useAudioAnalyser(audioRef)
  const { results: searchResults, status: searchStatus, search } = useJamendoSearch()

  // Initialize first track when tracks are fetched
  useEffect(() => {
    if (!currentTrack && effectiveTracks && effectiveTracks.length > 0) {
      setCurrentTrack(effectiveTracks[0])
      if (audioRef.current && !audioRef.current.src && effectiveTracks[0].audioUrl) {
        audioRef.current.src = effectiveTracks[0].audioUrl
      }
    }
  }, [effectiveTracks, currentTrack])

  // Sync listening mode playback rate whenever mode or track changes
  useEffect(() => {
    syncPlaybackRate(audioRef.current, ytPlayer, currentTrack)
  }, [activeListeningModeId, currentTrack, syncPlaybackRate, ytPlayer])

  const handleSelectListeningMode = (modeId) => {
    setListeningMode(modeId)
    const target = listeningModes.find((m) => m.id === modeId)
    toast(`Mode mendengarkan aktif: ${target?.name} (${target?.badge})`)
  }

  // Active accent color: customized or adapted from listening mode or mood
  const activeAccent =
    customTheme?.accent ||
    activeListeningMode?.color ||
    mood.accent

  // Apply theme accent to document root
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', activeAccent)
    document.documentElement.style.setProperty(
      '--primary-container',
      customTheme?.accentSoft || activeListeningMode?.accentContainer || mood.accentContainer
    )
  }, [activeAccent, customTheme, mood, activeListeningMode])

  // Sync volume with both engines
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
    ytPlayer.setVolume(volume)
  }, [volume, ytPlayer])

  // Handle Playback: Prioritize Direct Lossless Audio (Instant, Offline-Safe, WebAudio EQ Compatible)
  const playTrack = useCallback(
    async (track) => {
      if (!track) return
      resume()

      // Stop previous streams immediately
      try {
        ytPlayer.pause()
      } catch (e) {}
      audioRef.current?.pause()

      // 1. Explicit YouTube video already resolved or provided
      if (track.youtubeId) {
        setCurrentTrack(track)
        setIsPlaying(true)
        ytPlayer.playVideo(track.youtubeId)
        setTimeout(() => syncPlaybackRate(null, ytPlayer, track), 500)
        toast.success(`Memutar: ${track.title}`)
        return
      }

      // 2. Deezer tracks only provide 30-second previews -> resolve full audio via YouTube
      if (track.source === 'deezer' || !track.audioUrl) {
        try {
          const resolved = await resolveFullTrack(track)
          if (resolved && resolved.youtubeId) {
            setCurrentTrack(resolved)
            setIsPlaying(true)
            ytPlayer.playVideo(resolved.youtubeId)
            setTimeout(() => syncPlaybackRate(null, ytPlayer, resolved), 500)
            toast.success(`Memutar lagu penuh: ${resolved.title}`)
            return
          }
        } catch (e) {
          console.warn('Full audio resolve fallback notice:', e)
        }
      }

      // 3. Direct Audio Stream (Jamendo full tracks, or fallback Deezer preview if YouTube is unavailable)
      if (track.audioUrl && audioRef.current) {
        const directTrack = { ...track, youtubeId: null }
        setCurrentTrack(directTrack)
        setIsPlaying(true)
        const curSrc = audioRef.current.currentSrc || audioRef.current.src || ''
        if (!curSrc.endsWith(track.audioUrl)) {
          audioRef.current.src = track.audioUrl
        }
        syncPlaybackRate(audioRef.current, null, directTrack)
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn('Direct audio play notice:', err))
        toast.success(`Memutar: ${track.title}`)
        return
      }

      toast.error(`Tidak dapat memutar lagu: ${track.title}`)
    },
    [resume, ytPlayer, syncPlaybackRate]
  )

  const togglePlay = () => {
    if (!currentTrack) {
      if (displayedTracks.length > 0) {
        playTrack(displayedTracks[0])
      }
      return
    }
    resume()

    if (currentTrack.youtubeId) {
      if (ytPlayer.isPlaying) {
        ytPlayer.pause()
        setIsPlaying(false)
      } else {
        ytPlayer.resume()
        setIsPlaying(true)
      }
    } else {
      // If it's a Deezer track not yet resolved to full length, play via playTrack
      if (currentTrack.source === 'deezer') {
        playTrack(currentTrack)
        return
      }

      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        if (audioRef.current) {
          if (!audioRef.current.src && currentTrack.audioUrl) {
            audioRef.current.src = currentTrack.audioUrl
          }
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {})
        }
      }
    }
  }

  // Auto-sync initial favorites if any
  useEffect(() => {
    if (effectiveTracks.length > 0 && favoriteTracks.length === 0 && favorites.length > 0) {
      const matched = effectiveTracks.filter((t) => favorites.includes(t.id))
      if (matched.length > 0) {
        setFavoriteTracks(matched)
      }
    }
  }, [effectiveTracks, favorites, favoriteTracks.length])

  // Displayed tracks (optionally filtered by favorites)
  const displayedTracks = isFavoritesFilterActive
    ? (favoriteTracks.length > 0 ? favoriteTracks : effectiveTracks.filter((t) => favorites.includes(t.id)))
    : effectiveTracks

  const playNext = useCallback(() => {
    if (!currentTrack || displayedTracks.length === 0) return
    const currentIdx = displayedTracks.findIndex((t) => t.id === currentTrack.id)
    let nextIdx
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * displayedTracks.length)
    } else {
      nextIdx = (currentIdx + 1) % displayedTracks.length
    }
    playTrack(displayedTracks[nextIdx])
  }, [currentTrack, displayedTracks, isShuffle, playTrack])

  const playPrev = useCallback(() => {
    if (!currentTrack || displayedTracks.length === 0) return
    const currentIdx = displayedTracks.findIndex((t) => t.id === currentTrack.id)
    const prevIdx = (currentIdx - 1 + displayedTracks.length) % displayedTracks.length
    playTrack(displayedTracks[prevIdx])
  }, [currentTrack, displayedTracks, playTrack])

  const handleSeek = (newTime) => {
    if (currentTrack?.youtubeId) {
      ytPlayer.seekTo(newTime)
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current && !currentTrack?.youtubeId) {
      setCurrentTime(audioRef.current.currentTime)
      if (audioRef.current.duration) {
        setDuration(audioRef.current.duration)
      }
    }
  }

  const handleAudioEnded = useCallback(() => {
    if (isRepeat) {
      if (currentTrack?.youtubeId) {
        ytPlayer.seekTo(0)
        ytPlayer.resume()
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }
    } else {
      playNext()
    }
  }, [isRepeat, currentTrack, playNext, ytPlayer])

  useEffect(() => {
    onEndedRef.current = handleAudioEnded
  }, [handleAudioEnded])

  // Active Computed State (bridges YouTube and HTML5 seamlessly)
  const activeIsPlaying = currentTrack?.youtubeId ? ytPlayer.isPlaying : isPlaying
  const activeCurrentTime = currentTrack?.youtubeId ? ytPlayer.currentTime : currentTime
  const activeDuration = currentTrack?.youtubeId
    ? ytPlayer.duration || currentTrack.duration || 240
    : duration || currentTrack?.duration || 240

  // Favorites
  const isCurrentFavorite = currentTrack
    ? favorites.includes(currentTrack.id) || favoriteTracks.some((t) => t.id === currentTrack.id)
    : false

  const toggleFavorite = (trackToToggle) => {
    const target = trackToToggle || currentTrack
    if (!target || !target.id) return
    const id = target.id
    const exists = favorites.includes(id) || favoriteTracks.some((t) => t.id === id)

    if (exists) {
      setFavorites((prev) => prev.filter((item) => item !== id))
      setFavoriteTracks((prev) => prev.filter((t) => t.id !== id))
      toast('Dihapus dari lagu favorit')
    } else {
      setFavorites((prev) => [...prev, id])
      setFavoriteTracks((prev) => [target, ...prev.filter((t) => t.id !== id)])
      toast('Ditambahkan ke lagu favorit ❤️')
    }
  }

  // Mood Selection
  const handleSelectMood = (moodId) => {
    setLastMoodId(moodId)
    setCustomTheme(null) // Following PRD US-06, choosing new mood resets to mood theme
    const targetMood = getMoodById(moodId)
    if (targetMood.tracks && targetMood.tracks.length > 0) {
      setCurrentTrack(targetMood.tracks[0])
      if (audioRef.current) {
        audioRef.current.src = targetMood.tracks[0].audioUrl
        if (isPlaying) {
          audioRef.current.play().catch(() => {})
        }
      }
    }
    toast(`Beralih ke mood ${targetMood.name}`)
  }

  const handlePlayMood = (moodId) => {
    setLastMoodId(moodId)
    setCustomTheme(null)
    const targetMood = getMoodById(moodId)
    if (targetMood.tracks && targetMood.tracks.length > 0) {
      playTrack(targetMood.tracks[0])
    }
  }

  const handleSetCustomTheme = (palette) => {
    setCustomTheme(palette)
    toast(`Tema kustom diterapkan: ${palette.name}`)
  }

  const handleFollowMood = () => {
    setCustomTheme(null)
    toast('Warna aplikasi kembali mengikuti mood secara dinamis')
  }

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === '/') {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setThemeOpen(false)
        setCaseStudyOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, currentTrack])

  return (
    <div className="bg-[#08090e] text-[#f1f2f8] antialiased selection:bg-primary selection:text-black min-h-screen relative overflow-x-hidden">
      {/* Toast notifications */}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(20, 22, 35, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            color: '#f1f2f8',
            borderRadius: '16px',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.6)',
          },
        }}
      />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        loop={isRepeat}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleAudioEnded}
      />

      {/* 3D Atmospheric Glowing Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Ambient Top Dynamic Orb */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-25 animate-mesh-float-1 transition-all duration-1000"
          style={{ backgroundColor: activeAccent }}
        />
        {/* Ambient Left Violet Orb */}
        <div className="absolute top-1/3 -left-48 w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 orb-glow-2 animate-mesh-float-2" />
        {/* Ambient Bottom Right Magenta Orb */}
        <div className="absolute bottom-10 -right-48 w-[550px] h-[550px] rounded-full blur-[150px] opacity-15 orb-glow-3" />
        {/* Ambient Refraction Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
      </div>

      {/* Main Layout Shell - Strict 1-Page Viewport with Dynamic Mobile Height */}
      <div className="relative z-10 flex flex-col h-[100dvh] overflow-hidden">
        {/* Top Header - Pure Brand Logo, Favorites Toggle & Search Bar */}
        <Header
          accent={activeAccent}
          onOpenSearch={() => setSearchOpen(true)}
          isFavoritesActive={isFavoritesFilterActive}
          onToggleFavorites={() => setIsFavoritesFilterActive(!isFavoritesFilterActive)}
          favoritesCount={favoriteTracks.length}
          hiddenOnMobile={isMobileOverlayOpen}
        />

        {/* Main Canvas with Responsive Turntable Deck (Fluid Scroll on Mobile, Centered Fixed on Desktop) */}
        <main className="w-full flex-1 flex flex-col lg:items-center lg:justify-center pt-16 lg:pt-20 pb-20 lg:pb-[72px] bg-[#0c0a1f] overflow-y-auto lg:overflow-hidden no-scrollbar">
          <MasterDeckHero
            mood={mood}
            currentTrack={currentTrack}
            isPlaying={activeIsPlaying}
            currentTime={activeCurrentTime}
            onSeek={handleSeek}
            onTogglePlay={togglePlay}
            isFavorite={isCurrentFavorite}
            onToggleFavorite={() => toggleFavorite()}
            onOpenApiKey={() => setApiKeyOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            accent={activeAccent}
            activeListeningModeId={activeListeningModeId}
            onSelectListeningMode={handleSelectListeningMode}
            tracks={displayedTracks}
            onSelectTrack={playTrack}
            isFavoritesFilterActive={isFavoritesFilterActive}
            onToggleFavoritesFilter={(active) => setIsFavoritesFilterActive(typeof active === 'boolean' ? active : !isFavoritesFilterActive)}
            onMobileOverlayChange={setIsMobileOverlayOpen}
            favoritesCount={favoriteTracks.length}
            isShuffle={isShuffle}
            onToggleShuffle={() => {
              setIsShuffle(!isShuffle)
              toast(isShuffle ? 'Mode acak nonaktif' : 'Mode acak aktif')
            }}
            isRepeat={isRepeat}
            onToggleRepeat={() => {
              setIsRepeat(!isRepeat)
              toast(isRepeat ? 'Mode ulang nonaktif' : 'Mode ulang trek aktif')
            }}
            rpm={rpm}
            onToggleRpm={(val) => {
              setRpm(val)
              toast(`Kecepatan turntable disetel ke: ${val === 45 ? '45 RPM (Single / Maxi)' : '33⅓ RPM (LP / Album)'}`)
            }}
          />
        </main>
      </div>

      {/* 3. Persistent Spotify Bottom Player Bar */}
      <SpotifyPlayerBar
        currentTrack={currentTrack}
        isPlaying={activeIsPlaying}
        onTogglePlay={togglePlay}
        onNext={playNext}
        onPrev={playPrev}
        isShuffle={isShuffle}
        onToggleShuffle={() => {
          setIsShuffle(!isShuffle)
          toast(isShuffle ? 'Mode acak nonaktif' : 'Mode acak aktif')
        }}
        isRepeat={isRepeat}
        onToggleRepeat={() => {
          setIsRepeat(!isRepeat)
          toast(isRepeat ? 'Mode ulang nonaktif' : 'Mode ulang trek aktif')
        }}
        isFavorite={isCurrentFavorite}
        onToggleFavorite={() => toggleFavorite()}
        currentTime={activeCurrentTime}
        duration={activeDuration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={setVolume}
        activeListeningModeId={activeListeningModeId}
      />

      {/* Interactive Modals */}
      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        results={searchResults}
        status={searchStatus}
        onSearch={useCallback((q) => search(q), [search])}
        onSelectTrack={playTrack}
      />

      <ThemeOverridePanel
        isOpen={isThemeOpen}
        onClose={() => setThemeOpen(false)}
        customTheme={customTheme}
        onSetCustom={handleSetCustomTheme}
        onFollowMood={handleFollowMood}
      />

      <CaseStudyModal
        isOpen={isCaseStudyOpen}
        onClose={() => setCaseStudyOpen(false)}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setApiKeyOpen(false)}
        onKeySaved={() => toast.success('API Key berhasil disimpan! Memuat lagu...')}
      />
    </div>
  )
}
