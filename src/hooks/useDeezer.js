import { useState, useEffect, useCallback } from 'react'
import { fetchDeezerTopChart, searchDeezerTracks } from '../services/deezerApi'

export function useDeezerChart(limit = 20) {
  const [tracks, setTracks] = useState([])
  const [status, setStatus] = useState('idle')

  const loadChart = useCallback(async () => {
    setStatus('loading')
    try {
      const hits = await fetchDeezerTopChart(limit)
      if (hits && hits.length > 0) {
        setTracks(hits)
        setStatus('success')
      } else {
        setTracks([])
        setStatus('empty')
      }
    } catch (e) {
      console.warn('Deezer chart hook error:', e)
      setTracks([])
      setStatus('error')
    }
  }, [limit])

  useEffect(() => {
    loadChart()
  }, [loadChart])

  return { tracks, status, refetch: loadChart }
}

export function useDeezerSearch() {
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
      const hits = await searchDeezerTracks(query, 20)
      setResults(hits || [])
      setStatus('success')
    } catch (e) {
      console.warn('Deezer search hook error:', e)
      setResults([])
      setStatus('error')
    }
  }, [])

  return { results, status, search }
}
