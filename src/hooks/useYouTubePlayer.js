import { useState, useEffect, useRef, useCallback } from 'react'

export function useYouTubePlayer({ onEnded, onError } = {}) {
  const playerRef = useRef(null)
  const isReadyRef = useRef(false)
  const pendingVideoIdRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeVideoId, setActiveVideoId] = useState(null)

  // Track playback time
  useEffect(() => {
    let interval = null
    if (isPlaying) {
      interval = setInterval(() => {
        try {
          if (playerRef.current && isReadyRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            const cur = playerRef.current.getCurrentTime() || 0
            const dur = playerRef.current.getDuration() || 0
            setCurrentTime(cur)
            if (dur > 0) setDuration(dur)
          }
        } catch (e) {
          // ignore tracking error
        }
      }, 300)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  const initPlayer = useCallback(() => {
    if (typeof window === 'undefined') return
    if (playerRef.current) return
    if (!window.YT || !window.YT.Player) return

    let container = document.getElementById('timbre-yt-iframe-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'timbre-yt-iframe-container'
      container.style.position = 'fixed'
      container.style.bottom = '-9999px'
      container.style.right = '-9999px'
      container.style.width = '200px'
      container.style.height = '200px'
      container.style.opacity = '0.01'
      container.style.pointerEvents = 'none'
      container.style.zIndex = '-9999'
      document.body.appendChild(container)
    }

    try {
      playerRef.current = new window.YT.Player('timbre-yt-iframe-container', {
        height: '200',
        width: '200',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            isReadyRef.current = true
            if (pendingVideoIdRef.current) {
              const vId = pendingVideoIdRef.current
              pendingVideoIdRef.current = null
              playVideo(vId)
            }
          },
          onStateChange: (event) => {
            if (event.data === 1) {
              setIsPlaying(true)
            } else if (event.data === 2) {
              setIsPlaying(false)
            } else if (event.data === 0) {
              setIsPlaying(false)
              if (onEnded) onEnded()
            }
          },
          onError: (err) => {
            console.warn('YouTube Player note:', err?.data)
            setIsPlaying(false)
            if (typeof onError === 'function') {
              onError(err)
            }
          },
        },
      })
    } catch (e) {
      console.warn('YouTube Player init notice:', e)
      if (typeof onError === 'function') {
        onError(e)
      }
    }
  }, [onEnded, onError])

  // Initialize YouTube API safely
  useEffect(() => {
    if (typeof window === 'undefined') return

    // If already available
    if (window.YT && window.YT.Player) {
      initPlayer()
      return
    }

    // Hook to global callback
    const prevOnReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevOnReady === 'function') prevOnReady()
      initPlayer()
    }

    // Ensure script tag exists
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      document.head.appendChild(tag)
    }

    // Polling fallback in case onYouTubeIframeAPIReady fired early
    let attempts = 0
    const pollInterval = setInterval(() => {
      attempts++
      if (window.YT && window.YT.Player) {
        clearInterval(pollInterval)
        initPlayer()
      } else if (attempts > 30) {
        clearInterval(pollInterval)
      }
    }, 200)

    return () => clearInterval(pollInterval)
  }, [initPlayer])

  const playVideo = useCallback((videoId) => {
    setActiveVideoId(videoId)
    setCurrentTime(0)

    if (!isReadyRef.current || !playerRef.current || typeof playerRef.current.loadVideoById !== 'function') {
      pendingVideoIdRef.current = videoId
      return
    }

    try {
      playerRef.current.loadVideoById(videoId)
      playerRef.current.playVideo()
      setIsPlaying(true)
    } catch (err) {
      console.warn('YouTube play error:', err)
    }
  }, [])

  const pause = useCallback(() => {
    try {
      if (playerRef.current && isReadyRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo()
        setIsPlaying(false)
      }
    } catch (e) {}
  }, [])

  const resume = useCallback(() => {
    try {
      if (playerRef.current && isReadyRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo()
        setIsPlaying(true)
      }
    } catch (e) {}
  }, [])

  const seekTo = useCallback((seconds) => {
    try {
      if (playerRef.current && isReadyRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, true)
        setCurrentTime(seconds)
      }
    } catch (e) {}
  }, [])

  const setVolume = useCallback((vol) => {
    try {
      if (playerRef.current && isReadyRef.current && typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(Math.round(vol * 100))
      }
    } catch (e) {}
  }, [])

  const setPlaybackRate = useCallback((rate) => {
    try {
      if (playerRef.current && isReadyRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
        playerRef.current.setPlaybackRate(rate)
      }
    } catch (e) {}
  }, [])

  return {
    playVideo,
    pause,
    resume,
    seekTo,
    setVolume,
    setPlaybackRate,
    isPlaying,
    currentTime,
    duration,
    activeVideoId,
  }
}
