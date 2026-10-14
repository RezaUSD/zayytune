// Helper utilitas gambar album & thumbnail artis Timbre (100% Offline-Ready & Bebas Error Network)

function createSvgDataUri(bg1, bg2, accent, label = 'TIMBRE') {
  const cleanLabel = (label || 'TIMBRE').toUpperCase().slice(0, 14)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <linearGradient id="g_${bg1.replace('#', '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g_${bg1.replace('#', '')})" />
    <circle cx="200" cy="200" r="145" fill="#141416" stroke="#ffffff" stroke-opacity="0.12" stroke-width="4" />
    <circle cx="200" cy="200" r="110" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2" />
    <circle cx="200" cy="200" r="75" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2" />
    <circle cx="200" cy="200" r="48" fill="${accent}" stroke="#141416" stroke-width="4" />
    <circle cx="200" cy="200" r="14" fill="#141416" />
    <text x="200" y="372" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="15" fill="#ffffff" fill-opacity="0.9" text-anchor="middle" letter-spacing="3">${cleanLabel}</text>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(/\s+/g, ' ').trim())
}

// Koleksi Cover Offline bergaya Neo-Brutalist Vinyl (0 HTTP Request, Tidak akan kena ERR_INTERNET_DISCONNECTED)
export const AESTHETIC_COVERS = [
  createSvgDataUri('#2850ED', '#0E1D56', '#FFE043', 'TIMBRE MUSIC'),
  createSvgDataUri('#FF6D60', '#991B1B', '#FFE043', 'CHILL BEATS'),
  createSvgDataUri('#10B981', '#064E3B', '#FACC15', 'GROOVE VIBE'),
  createSvgDataUri('#8B5CF6', '#4C1D95', '#F472B6', 'LATE NIGHT'),
  createSvgDataUri('#F59E0B', '#78350F', '#6EE7B7', 'SOLAR ACOUSTIC'),
  createSvgDataUri('#EC4899', '#831843', '#FDE047', 'POP ANTHEM'),
  createSvgDataUri('#141416', '#26262A', '#FFE043', 'VINYL MASTER'),
  createSvgDataUri('#06B6D4', '#164E63', '#F43F5E', 'SYNTH WAVE'),
]

export const DEFAULT_FALLBACK_COVER = AESTHETIC_COVERS[0]

export function getAestheticFallback(seed = '') {
  if (!seed) return DEFAULT_FALLBACK_COVER
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const idx = Math.abs(hash) % AESTHETIC_COVERS.length
  return AESTHETIC_COVERS[idx]
}

export function getTrackCover(track) {
  if (!track) return DEFAULT_FALLBACK_COVER

  if (track.coverArtUrl && typeof track.coverArtUrl === 'string' && track.coverArtUrl.trim().length > 5) {
    return track.coverArtUrl
  }
  if (track.albumCover && typeof track.albumCover === 'string' && track.albumCover.trim().length > 5) {
    return track.albumCover
  }
  if (track.picture && typeof track.picture === 'string' && track.picture.trim().length > 5) {
    return track.picture
  }

  const vId = track.videoId || track.youtubeId
  if (vId) {
    return `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`
  }

  return getAestheticFallback(track.title || track.artist || 'music')
}

export function handleImageFallback(e, track) {
  // Cegah infinite loop error
  e.currentTarget.onerror = null

  const vId = track?.videoId || track?.youtubeId
  const currentSrc = e.currentTarget.src || ''

  // Jika thumbnail YouTube awal gagal dan bukan fallback lokal, coba mqdefault sekali saja
  if (vId && !currentSrc.includes('mqdefault') && !currentSrc.startsWith('data:image')) {
    e.currentTarget.onerror = () => {
      e.currentTarget.onerror = null
      e.currentTarget.src = getAestheticFallback(track?.title || track?.artist || 'album')
    }
    e.currentTarget.src = `https://img.youtube.com/vi/${vId}/mqdefault.jpg`
    return
  }

  // Fallback langsung ke SVG lokal (0 network request, 0 console error)
  e.currentTarget.src = getAestheticFallback(track?.title || track?.artist || 'album')
}
