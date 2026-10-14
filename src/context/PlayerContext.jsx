import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useYouTubePlayer } from '../hooks/useYouTubePlayer'
import { resolveFullTrackYouTube, resolveYouTubeCandidates, getResolvedDuration } from '../services/youtubeSearch'
import { LISTENING_MODES } from '../hooks/useAudioModes'
import { useAuth } from './AuthContext'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const { addToHistory } = useAuth()

  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [queue, setQueue] = useState([])
  const [queueIndex, setQueueIndex] = useState(-1)
  const [isMobileNowPlayingOpen, setIsMobileNowPlayingOpen] = useState(false)
  const [isLyricsModalOpen, setIsLyricsModalOpen] = useState(false)
  const [activeListeningModeId, setActiveListeningModeId] = useState('original')

  const audioRef = useRef(null)
  const currentTrackRef = useRef(null)

  useEffect(() => {
    currentTrackRef.current = currentTrack
  }, [currentTrack])

  // Initialize HTML5 Audio once
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const handleTimeUpdate = () => {
      if (!currentTrackRef.current?.videoId) {
        setCurrentTime(audio.currentTime || 0)
      }
    }

    const handleLoadedMetadata = () => {
      if (!currentTrackRef.current?.videoId && audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    const handleEnded = () => {
      if (!currentTrackRef.current?.videoId) {
        handleTrackEnded()
      }
    }

    const handleError = () => {
      if (!audio.getAttribute('src')) return
      console.warn('HTML5 Audio error, will attempt fallback if available')
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    // High-precision ticker for HTML5 audio when active
    let animId = null
    const tickAudio = () => {
      if (audioRef.current && !audioRef.current.paused && !currentTrackRef.current?.videoId) {
        setCurrentTime(audioRef.current.currentTime || 0)
        if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          setDuration(audioRef.current.duration)
        }
      }
      animId = requestAnimationFrame(tickAudio)
    }
    animId = requestAnimationFrame(tickAudio)

    return () => {
      if (animId) cancelAnimationFrame(animId)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audio.src = ''
    }
  }, [])

  // YouTube player hook
  const ytPlayerRef = useRef(null)
  const failedVideoIdsRef = useRef(new Set())
  const fallbackAttemptsRef = useRef(0)

  // Use stable refs for callbacks so useYouTubePlayer never reinitializes
  const onEndedRef = useRef(null)
  const onErrorRef = useRef(null)

  // Stable callback wrappers — these refs are updated each render but the
  // functions passed to useYouTubePlayer never change identity
  const stableOnEnded = useCallback(() => {
    if (onEndedRef.current) onEndedRef.current()
  }, [])

  const stableOnError = useCallback((err) => {
    if (onErrorRef.current) onErrorRef.current(err)
  }, [])

  const ytPlayer = useYouTubePlayer({
    onEnded: stableOnEnded,
    onError: stableOnError,
  })
  ytPlayerRef.current = ytPlayer

  // Fallback otomatis: video dihapus (100), privat (2/5), atau embed diblokir pemilik (101/150)
  const handleYouTubeError = useCallback(async (err) => {
    const track = currentTrackRef.current
    if (!track) return
    const failedId = err?.videoId || track.videoId
    if (failedId) failedVideoIdsRef.current.add(failedId)

    if (fallbackAttemptsRef.current >= 6) {
      toast.error(`"${track.title}" tidak tersedia untuk diputar`)
      return
    }
    fallbackAttemptsRef.current += 1

    const candidates = await resolveYouTubeCandidates(track.artist, track.title, track.duration)
    // Pastikan user belum pindah lagu selama menunggu
    if (currentTrackRef.current !== track && currentTrackRef.current?.id !== track.id) return
    const next = candidates.find((id) => !failedVideoIdsRef.current.has(id))

    if (next) {
      console.info(`[Player] Video ${failedId} tidak bisa diputar (kode ${err?.code}), beralih ke ${next}`)
      setCurrentTrack((prev) => (prev ? { ...prev, videoId: next } : prev))
      ytPlayerRef.current?.playVideo(next)
      setIsPlaying(true)
    } else {
      toast.error(`"${track.title}" tidak tersedia untuk diputar`)
    }
  }, [])

  // Sync YouTube player time when active
  useEffect(() => {
    if (currentTrack?.videoId) {
      setIsPlaying(ytPlayer.isPlaying)
      setCurrentTime(ytPlayer.currentTime)
      if (ytPlayer.duration > 0) {
        setDuration(ytPlayer.duration)
      }
    }
  }, [ytPlayer.isPlaying, ytPlayer.currentTime, ytPlayer.duration, currentTrack?.videoId])

  // Sync listening mode DSP / playback rate
  // NOTE: ytPlayerRef.current used intentionally to avoid ytPlayer object as dep
  useEffect(() => {
    const mode = LISTENING_MODES.find((m) => m.id === activeListeningModeId)
    const targetRate = mode?.rate || 1.0
    const ytRates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const closestYtRate = ytRates.reduce((prev, curr) =>
      Math.abs(curr - targetRate) < Math.abs(prev - targetRate) ? curr : prev
    )

    // Apply to YouTube via ref (stable, not reactive)
    try {
      ytPlayerRef.current?.setPlaybackRate(closestYtRate)
    } catch (e) {}

    // Apply to HTML5 Audio
    if (audioRef.current) {
      try {
        audioRef.current.playbackRate = targetRate
      } catch (e) {}
    }
  }, [activeListeningModeId])

  // Use refs so handleTrackEnded always sees latest state without stale closure
  const isRepeatRef = useRef(isRepeat)
  const isShuffle_Ref = useRef(isShuffle)
  const queueRef = useRef(queue)
  const queueIndexRef = useRef(queueIndex)
  useEffect(() => { isRepeatRef.current = isRepeat }, [isRepeat])
  useEffect(() => { isShuffle_Ref.current = isShuffle }, [isShuffle])
  useEffect(() => { queueRef.current = queue }, [queue])
  useEffect(() => { queueIndexRef.current = queueIndex }, [queueIndex])

  // Ref to nextTrack so handleTrackEnded can call it without stale closure
  const nextTrackRef = useRef(null)

  // Track Ended Handler — uses refs to always have fresh state
  const handleTrackEnded = useCallback(() => {
    if (isRepeatRef.current) {
      if (currentTrackRef.current?.videoId) {
        ytPlayerRef.current?.seek(0)
        ytPlayerRef.current?.play()
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }
      return
    }
    // nextTrack via ref to avoid stale closure
    nextTrackRef.current?.()
  }, [])

  // Wire up the stable refs each render
  useEffect(() => {
    onEndedRef.current = handleTrackEnded
    onErrorRef.current = handleYouTubeError
  })

  // Play track with optional queue
  const playTrack = useCallback(
    (track, newQueue = null) => {
      if (!track) return

      if (newQueue && Array.isArray(newQueue)) {
        setQueue(newQueue)
        const idx = newQueue.findIndex((t) => (t.id || t.videoId) === (track.id || track.videoId))
        setQueueIndex(idx !== -1 ? idx : 0)
      } else if (queue.length === 0) {
        setQueue([track])
        setQueueIndex(0)
      }

      setCurrentTrack(track)
      addToHistory(track)
      setCurrentTime(0)
      setDuration(track.duration || 200)
      fallbackAttemptsRef.current = 0

      // Route playback based on track source
      if (track.videoId && track.source === 'youtube' && track.artist && track.title) {
        // Trending/search results are often MVs (intro/outro) → re-resolve to the
        // studio audio that matches LRCLIB synced lyrics, fallback to original video.
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ''
        }
        const originalId = track.videoId
        resolveFullTrackYouTube(track.artist, track.title, track.duration).then((resolvedId) => {
          if (currentTrackRef.current && currentTrackRef.current.id !== track.id) return
          const finalId = resolvedId || originalId
          const lyricDur = getResolvedDuration(track.artist, track.title)
          setCurrentTrack((prev) =>
            prev ? { ...prev, videoId: finalId, ...(lyricDur ? { duration: lyricDur } : {}) } : prev
          )
          ytPlayer.playVideo(finalId)
          setIsPlaying(true)
        })
      } else if (track.videoId) {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ''
        }
        ytPlayer.playVideo(track.videoId)
        setIsPlaying(true)
      } else {
        // Prioritize full YouTube stream resolution
        resolveFullTrackYouTube(track.artist, track.title, track.duration).then((resolvedId) => {
          if (resolvedId) {
            track.videoId = resolvedId
            const lyricDur = getResolvedDuration(track.artist, track.title)
            setCurrentTrack((prev) => {
              const base = prev || track
              return { ...base, videoId: resolvedId, ...(lyricDur ? { duration: lyricDur } : {}) }
            })
            if (audioRef.current) {
              audioRef.current.pause()
              audioRef.current.src = ''
            }
            ytPlayer.playVideo(resolvedId)
            setIsPlaying(true)
          } else {
            // Fallback to audio preview only if YouTube stream resolution fails
            const url = track.audioUrl || track.previewUrl || track.preview
            if (url && audioRef.current) {
              audioRef.current.src = url
              audioRef.current.volume = volume
              audioRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch((e) => {
                  console.warn('Playback error:', e)
                })
            }
          }
        })
      }
    },
    [queue, volume, addToHistory, ytPlayer]
  )

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0])
      }
      return
    }

    if (currentTrack.videoId) {
      if (isPlaying) {
        ytPlayer.pause()
        setIsPlaying(false)
      } else {
        ytPlayer.play()
        setIsPlaying(true)
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e) => console.warn('Play error:', e))
      }
    }
  }, [currentTrack, isPlaying, queue, ytPlayer, playTrack])

  // Next Track — reads from refs so it can be called from handleTrackEnded safely
  const nextTrack = useCallback(() => {
    const q = queueRef.current
    const qi = queueIndexRef.current
    const shuffle = isShuffle_Ref.current
    if (q.length === 0) return

    let nextIdx = qi + 1
    if (shuffle && q.length > 1) {
      nextIdx = Math.floor(Math.random() * q.length)
      if (nextIdx === qi) {
        nextIdx = (nextIdx + 1) % q.length
      }
    } else if (nextIdx >= q.length) {
      nextIdx = 0
    }

    setQueueIndex(nextIdx)
    playTrack(q[nextIdx])
  }, [playTrack])

  // Keep nextTrackRef in sync
  useEffect(() => { nextTrackRef.current = nextTrack }, [nextTrack])

  // Previous Track
  const prevTrack = useCallback(() => {
    if (currentTime > 3) {
      seek(0)
      return
    }
    if (queue.length === 0) return

    let prevIdx = queueIndex - 1
    if (prevIdx < 0) {
      prevIdx = queue.length - 1
    }

    setQueueIndex(prevIdx)
    playTrack(queue[prevIdx])
  }, [currentTime, queue, queueIndex, playTrack])

  // Seek time
  const seek = useCallback(
    (seconds) => {
      const target = Math.max(0, Math.min(seconds, duration || 300))
      setCurrentTime(target)
      if (currentTrack?.videoId) {
        ytPlayer.seek(target)
      } else if (audioRef.current) {
        audioRef.current.currentTime = target
      }
    },
    [currentTrack?.videoId, duration, ytPlayer]
  )

  // Volume Change
  const setVolume = useCallback(
    (val) => {
      const clamped = Math.max(0, Math.min(1, val))
      setVolumeState(clamped)
      if (audioRef.current) {
        audioRef.current.volume = clamped
      }
      if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(clamped)
      }
    },
    [ytPlayer]
  )

  // Add to Queue
  const addToQueue = (track) => {
    if (!track) return
    setQueue((prev) => [...prev, track])
    toast.success(`"${track.title}" ditambahkan ke antrean`)
  }

  // Toggle Shuffle
  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev)
    toast.info(!isShuffle ? 'Mode acak aktif' : 'Mode acak nonaktif')
  }

  // Toggle Repeat
  const toggleRepeat = () => {
    setIsRepeat((prev) => !prev)
    toast.info(!isRepeat ? 'Ulangi lagu aktif' : 'Ulangi lagu nonaktif')
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffle,
        isRepeat,
        queue,
        queueIndex,
        isMobileNowPlayingOpen,
        setIsMobileNowPlayingOpen,
        isLyricsModalOpen,
        setIsLyricsModalOpen,
        activeListeningModeId,
        setActiveListeningModeId,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        addToQueue,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
