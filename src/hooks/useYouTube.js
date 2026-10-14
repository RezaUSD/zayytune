import { useState, useEffect, useCallback } from 'react'
import { fetchYouTubeTrending, searchYouTubeMusic, TRENDING_YOUTUBE_HITS } from '../services/youtubeSearch'

export function useYouTubeTrending(query = 'lagu pop trending indonesia official audio', limit = 20) {
  const [tracks, setTracks] = useState(TRENDING_YOUTUBE_HITS.slice(0, limit))
  const [status, setStatus] = useState('loading')

  const loadTrending = useCallback(async () => {
    setStatus('loading')
    try {
      const hits = await fetchYouTubeTrending(query, limit)
      if (hits && hits.length > 0) {
        setTracks(hits)
        setStatus('success')
      } else {
        setTracks(TRENDING_YOUTUBE_HITS.slice(0, limit))
        setStatus('empty')
      }
    } catch (e) {
      console.warn('YouTube trending hook error:', e)
      setTracks(TRENDING_YOUTUBE_HITS.slice(0, limit))
      setStatus('error')
    }
  }, [query, limit])

  useEffect(() => {
    loadTrending()
  }, [loadTrending])

  return { tracks, status, refetch: loadTrending }
}

export function useYouTubeSearch() {
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')

  const search = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setResults([])
      setStatus('idle')
      return
    }

    setStatus('loading')
    try {
      const hits = await searchYouTubeMusic(query)
      setResults(hits || [])
      setStatus('success')
    } catch (e) {
      console.warn('YouTube search hook error:', e)
      setResults([])
      setStatus('error')
    }
  }, [])

  return { results, status, search }
}
