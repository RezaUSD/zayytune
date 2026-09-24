import { useEffect, useState, useCallback } from 'react'

const BASE_URL = 'https://api.jamendo.com/v3.0'

export function getJamendoClientId() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('timbre:jamendoClientId') || localStorage.getItem('timbre:apiKey')
    if (stored && stored.trim()) return stored.trim()
  }
  return (import.meta.env.VITE_JAMENDO_CLIENT_ID || import.meta.env.VITE_API_KEY || '').trim()
}

export function setJamendoClientId(key) {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('timbre:jamendoClientId', key.trim())
    } else {
      localStorage.removeItem('timbre:jamendoClientId')
      localStorage.removeItem('timbre:apiKey')
    }
    window.dispatchEvent(new Event('timbre:apiKeyChanged'))
  }
}

function mapTrack(t) {
  return {
    id: String(t.id),
    title: t.name,
    artist: t.artist_name,
    duration: t.duration,
    durationFormatted: `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2, '0')}`,
    audioUrl: t.audio,
    coverArtUrl: t.image,
    coverGradient: 'from-[#12162E] to-[#4826b8]',
    quality: '48kHz / 24-bit',
    album: t.album_name || 'Jamendo Audio Stream',
    moodTags: (t.musicinfo?.tags?.genres || []),
  }
}

// Ambil daftar lagu berdasarkan mood / tag Jamendo
export function useJamendoByTag(moodObj, limit = 15) {
  const [tracks, setTracks] = useState([])
  const [status, setStatus] = useState('idle')

  const fetchTracks = useCallback(async () => {
    const clientId = getJamendoClientId()

    // Jika belum ada API key, biarkan kosong bersih sesuai permintaan user
    if (!clientId || clientId === 'your_client_id_here') {
      setTracks([])
      setStatus('empty_key')
      return
    }

    if (!moodObj) return

    setStatus('loading')
    try {
      const url = `${BASE_URL}/tracks/?client_id=${clientId}&format=json&limit=${limit}&tags=${encodeURIComponent(
        moodObj.jamendoTag || 'chillout'
      )}&include=musicinfo&audioformat=mp32`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.results && json.results.length > 0) {
        setTracks(json.results.map(mapTrack))
        setStatus('success')
      } else {
        setTracks([])
        setStatus('no_results')
      }
    } catch (err) {
      console.warn('Jamendo API fetch notification:', err.message)
      setTracks([])
      setStatus('error')
    }
  }, [moodObj, limit])

  useEffect(() => {
    fetchTracks()

    const onKeyChange = () => fetchTracks()
    window.addEventListener('timbre:apiKeyChanged', onKeyChange)
    return () => window.removeEventListener('timbre:apiKeyChanged', onKeyChange)
  }, [fetchTracks])

  return { tracks, status, refetch: fetchTracks }
}

// Pencarian lagu/artis
export function useJamendoSearch() {
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')

  const search = useCallback(async (query) => {
    const q = query?.trim()
    if (!q) {
      setResults([])
      setStatus('idle')
      return
    }

    const clientId = getJamendoClientId()
    if (!clientId || clientId === 'your_client_id_here') {
      setResults([])
      setStatus('empty_key')
      return
    }

    setStatus('loading')
    try {
      const url = `${BASE_URL}/tracks/?client_id=${clientId}&format=json&limit=20&namesearch=${encodeURIComponent(
        q
      )}&audioformat=mp32`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Jamendo search error')
      const json = await res.json()
      setResults((json.results || []).map(mapTrack))
      setStatus('success')
    } catch (err) {
      console.warn('Jamendo search error:', err.message)
      setResults([])
      setStatus('error')
    }
  }, [])

  return { results, status, search }
}
