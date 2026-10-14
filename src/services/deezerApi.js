// Layanan integrasi Deezer API (Gratis, Tanpa API Key, Tanpa Identifikasi)
import { DEFAULT_FALLBACK_COVER, getAestheticFallback } from './imageHelper'

function fetchJsonp(url) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve(null)
    const callbackName = 'deezer_cb_' + Math.random().toString(36).substring(2, 9)
    const script = document.createElement('script')

    const sep = url.includes('?') ? '&' : '?'
    script.src = `${url}${sep}output=jsonp&callback=${callbackName}`

    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('Deezer JSONP timeout'))
    }, 10000)

    function cleanup() {
      clearTimeout(timeout)
      if (script.parentNode) script.parentNode.removeChild(script)
      delete window[callbackName]
    }

    window[callbackName] = (data) => {
      cleanup()
      resolve(data)
    }

    script.onerror = () => {
      cleanup()
      reject(new Error('Deezer JSONP load error'))
    }

    document.body.appendChild(script)
  })
}

async function requestDeezer(path) {
  // 1. Coba melalui Vite local dev proxy /api/deezer
  try {
    const res = await fetch(`/api/deezer${path}`)
    if (res.ok) {
      const json = await res.json()
      if (json && !json.error) return json
    }
  } catch (e) {
    // Abaikan jika bukan di dev server
  }

  // 2. Fallback melalui JSONP resmi Deezer (Bebas CORS di browser)
  try {
    const jsonpUrl = `https://api.deezer.com${path}`
    const data = await fetchJsonp(jsonpUrl)
    if (data && !data.error) return data
  } catch (e) {
    console.warn('Deezer JSONP fallback note:', e.message)
  }

  // 3. Fallback melalui CORS proxy jika perlu
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://api.deezer.com${path}`)}`
    const res = await fetch(proxyUrl)
    if (res.ok) return await res.json()
  } catch (e) {}

  return null
}

function formatTrack(item) {
  if (!item) return null
  const duration = item.duration || 30
  const m = Math.floor(duration / 60)
  const s = Math.floor(duration % 60)
  const durationFormatted = `${m}:${s < 10 ? '0' : ''}${s}`

  return {
    id: `dz-${item.id}`,
    deezerId: item.id,
    title: item.title,
    artist: item.artist?.name || 'Artis Deezer',
    album: item.album?.title || 'Deezer Single',
    duration: duration,
    durationFormatted: durationFormatted,
    audioUrl: item.preview, // Direct MP3 stream audio (30s high quality preview)
    coverArtUrl:
      item.album?.cover_medium ||
      item.album?.cover_big ||
      item.album?.cover_xl ||
      DEFAULT_FALLBACK_COVER,
    source: 'deezer',
    previewUrl: item.preview,
    link: item.link,
  }
}

// 1. Ambil Top Hits & Billboard 2026 Playlist Deezer
export async function fetchDeezerTopChart(limit = 25) {
  // Coba ambil dari playlist resmi Hot Billboard 2026
  try {
    const pData = await requestDeezer(`/playlist/8182633662/tracks?limit=${limit}`)
    if (pData && pData.data && pData.data.length > 0) {
      const valid = pData.data.filter((t) => t.preview).map(formatTrack)
      if (valid.length > 0) return valid
    }
  } catch (err) {
    console.warn('Deezer 2026 billboard playlist error:', err)
  }

  // Alternatif: Playlist Top Hits 2026
  try {
    const pData2 = await requestDeezer(`/playlist/1045527501/tracks?limit=${limit}`)
    if (pData2 && pData2.data && pData2.data.length > 0) {
      const valid = pData2.data.filter((t) => t.preview).map(formatTrack)
      if (valid.length > 0) return valid
    }
  } catch (err) {
    console.warn('Deezer 2026 top hits playlist error:', err)
  }

  // Fallback ke Global Chart
  try {
    const data = await requestDeezer(`/chart/0/tracks?limit=${limit}`)
    if (data && data.data && data.data.length > 0) {
      return data.data.map(formatTrack)
    }
  } catch (err) {
    console.warn('Deezer chart error:', err)
  }

  // Curated fallback hits if network/proxy is unavailable
  return FALLBACK_CHART_TRACKS.slice(0, limit)
}

const FALLBACK_CHART_TRACKS = [
  {
    id: 'dz-fb-1',
    deezerId: 3135556,
    title: 'Harder, Better, Faster, Stronger',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 224,
    durationFormatted: '3:44',
    audioUrl: 'https://cdns-preview-d.dzcdn.net/stream/c-deda7fac9a38158525e656d0937a0cce-7.mp3',
    coverArtUrl: getAestheticFallback('Harder, Better, Faster, Stronger'),
    source: 'deezer',
  },
  {
    id: 'dz-fb-2',
    deezerId: 1109731,
    title: 'Around the World',
    artist: 'Daft Punk',
    album: 'Homework',
    duration: 238,
    durationFormatted: '3:58',
    audioUrl: 'https://cdns-preview-f.dzcdn.net/stream/c-f4b66dfba3be7e72b4f9746dfa996f27-6.mp3',
    coverArtUrl: getAestheticFallback('Around the World'),
    source: 'deezer',
  },
  {
    id: 'dz-fb-3',
    deezerId: 142986206,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    durationFormatted: '3:20',
    audioUrl: 'https://cdns-preview-b.dzcdn.net/stream/c-b705663738cf94c5026e6c2cb98404a3-4.mp3',
    coverArtUrl: getAestheticFallback('Blinding Lights'),
    source: 'deezer',
  },
  {
    id: 'dz-fb-4',
    deezerId: 1109735,
    title: 'One More Time',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 320,
    durationFormatted: '5:20',
    audioUrl: 'https://cdns-preview-e.dzcdn.net/stream/c-e9ff6b349f485be2ca972b22ec3ef6ee-6.mp3',
    coverArtUrl: getAestheticFallback('One More Time'),
    source: 'deezer',
  },
  {
    id: 'dz-fb-5',
    deezerId: 1109740,
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell Williams',
    album: 'Random Access Memories',
    duration: 248,
    durationFormatted: '4:08',
    audioUrl: 'https://cdns-preview-d.dzcdn.net/stream/c-deda7fac9a38158525e656d0937a0cce-7.mp3',
    coverArtUrl: getAestheticFallback('Get Lucky'),
    source: 'deezer',
  },
  {
    id: 'dz-fb-6',
    deezerId: 1109745,
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    duration: 230,
    durationFormatted: '3:50',
    audioUrl: 'https://cdns-preview-b.dzcdn.net/stream/c-b705663738cf94c5026e6c2cb98404a3-4.mp3',
    coverArtUrl: getAestheticFallback('Starboy'),
    source: 'deezer',
  },
  {
    id: 'dz-fb-7',
    deezerId: 1109750,
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 215,
    durationFormatted: '3:35',
    audioUrl: 'https://cdns-preview-b.dzcdn.net/stream/c-b705663738cf94c5026e6c2cb98404a3-4.mp3',
    coverArtUrl: getAestheticFallback('Save Your Tears'),
    source: 'deezer',
  },
  {
    id: 'dz-fb-8',
    deezerId: 1109755,
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    duration: 244,
    durationFormatted: '4:04',
    audioUrl: 'https://cdns-preview-d.dzcdn.net/stream/c-deda7fac9a38158525e656d0937a0cce-7.mp3',
    coverArtUrl: getAestheticFallback('Midnight City'),
    source: 'deezer',
  },
  {
    id: 'dz-fb-9',
    deezerId: 1109760,
    title: 'Instant Crush',
    artist: 'Daft Punk ft. Julian Casablancas',
    album: 'Random Access Memories',
    duration: 337,
    durationFormatted: '5:37',
    audioUrl: 'https://cdns-preview-e.dzcdn.net/stream/c-e9ff6b349f485be2ca972b22ec3ef6ee-6.mp3',
    coverArtUrl: getAestheticFallback('Instant Crush'),
    source: 'deezer',
  },
]

export async function fetchDeezerPlaylist(playlistId, limit = 25) {
  try {
    const data = await requestDeezer(`/playlist/${playlistId}/tracks?limit=${limit}`)
    if (data && data.data && data.data.length > 0) {
      return data.data.filter((t) => t.preview).map(formatTrack)
    }
  } catch (err) {
    console.warn('Deezer playlist error:', err)
  }
  return []
}

// 2. Pencarian Lagu / Artis Deezer
export async function searchDeezerTracks(query, limit = 20) {
  if (!query || !query.trim()) return []
  try {
    const data = await requestDeezer(`/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`)
    if (data && data.data && data.data.length > 0) {
      return data.data.map(formatTrack)
    }
  } catch (err) {
    console.warn('Deezer search error:', err)
  }
  return []
}

// 3. Ambil Playlist Rekomendasi berdasarkan genre
export async function fetchDeezerEditorial(limit = 20) {
  try {
    const data = await requestDeezer(`/chart/0/playlists?limit=${limit}`)
    if (data && data.data) return data.data
  } catch (e) {}
  return []
}

const ytCache = new Map()

// 4. Resolves full-length YouTube audio stream for any Deezer track
export async function resolveFullTrack(track) {
  if (!track) return null
  if (track.youtubeId) return track
  if (typeof navigator !== 'undefined' && !navigator.onLine) return track

  const cacheKey = `${track.artist}:::${track.title}`.toLowerCase()
  if (ytCache.has(cacheKey)) {
    const cachedId = ytCache.get(cacheKey)
    if (cachedId) {
      return {
        ...track,
        youtubeId: cachedId,
        isFullLength: true,
      }
    }
  }

  try {
    const q = `${track.artist} ${track.title}`
    const res = await fetch(`/api/yt-search?q=${encodeURIComponent(q)}`)
    if (res.ok) {
      const data = await res.json()
      if (data && data.videoId) {
        ytCache.set(cacheKey, data.videoId)
        return {
          ...track,
          youtubeId: data.videoId,
          isFullLength: true,
        }
      }
    }
  } catch (e) {
    // Silent fallback
  }

  return track
}

