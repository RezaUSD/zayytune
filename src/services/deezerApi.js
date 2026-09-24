// Layanan integrasi Deezer API (Gratis, Tanpa API Key, Tanpa Identifikasi)

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
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
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
  return []
}

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

