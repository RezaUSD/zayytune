// Layanan pencarian lagu & integrasi YouTube Music Catalog
import { getLyrics } from './lyricsApi'

export const TRENDING_YOUTUBE_HITS = [
  {
    id: 'yt-7Jm2Il2U-c0',
    videoId: '7Jm2Il2U-c0',
    title: 'Satu Bulan',
    artist: 'Bernadya',
    album: 'Sialnya, Hidup Harus Tetap Berjalan',
    duration: 199,
    durationFormatted: '3:19',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/f5809041de170abd4c84dcdede0d202a/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-eUx-BHUhGLA',
    videoId: 'eUx-BHUhGLA',
    title: 'Untungnya, Hidup Harus Tetap Berjalan',
    artist: 'Bernadya',
    album: 'Sialnya, Hidup Harus Tetap Berjalan',
    duration: 184,
    durationFormatted: '3:04',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/870667b82b372984ba65f023eb74f4a6/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-PfH7jq_uSCM',
    videoId: 'PfH7jq_uSCM',
    title: 'Die With A Smile',
    artist: 'Lady Gaga & Bruno Mars',
    album: 'Die With A Smile',
    duration: 251,
    durationFormatted: '4:11',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/4bd5903f4ce8f2601916bfadb44efe8a/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-_m6l5nKEGIA',
    videoId: '_m6l5nKEGIA',
    title: 'Sialan',
    artist: 'Juicy Luicy ft. Adrian Khalif',
    album: 'Nonfiksi',
    duration: 255,
    durationFormatted: '4:15',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/681e2dbdb5d2f9bac3e8a988f4d72577/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-kv2WIY8RLQQ',
    videoId: 'kv2WIY8RLQQ',
    title: 'Gala Bunga Matahari',
    artist: 'Sal Priadi',
    album: 'MARKERS AND SUCH PENS FLASHDISKS',
    duration: 210,
    durationFormatted: '3:30',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/ddb241f21b1a7ecf03412a5c0db0a4d7/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-uyGxjaiiqGA',
    videoId: 'uyGxjaiiqGA',
    title: 'Mati-Matian',
    artist: 'Mahalini',
    album: 'Mati-Matian',
    duration: 247,
    durationFormatted: '4:07',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/5dffb2dfe2c9c96df497fe6a5a0817c4/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-1IUCyniCWzg',
    videoId: '1IUCyniCWzg',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    duration: 210,
    durationFormatted: '3:30',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/5d284b31cb9ddeb1a0c79aede5a94e1c/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-2I9eC2MRhto',
    videoId: '2I9eC2MRhto',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n\' Sweet',
    duration: 175,
    durationFormatted: '2:55',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/e3221287a77eb262944e6528766eeba4/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-DrulgpXAGCA',
    videoId: 'DrulgpXAGCA',
    title: 'Kita Ke Sana',
    artist: 'Hindia',
    album: 'Lagipula Hidup Akan Berakhir',
    duration: 283,
    durationFormatted: '4:43',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/d5ff68831d11f794e18bca6a155ddc82/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt--USxZuH3kes',
    videoId: '-USxZuH3kes',
    title: 'Bunga Abadi',
    artist: 'Rio Clappy',
    album: 'Bunga Abadi',
    duration: 243,
    durationFormatted: '4:03',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/4e058244e9645906f24b0ffb37731a62/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-u3lz7oSd6JE',
    videoId: 'u3lz7oSd6JE',
    title: 'Nothin\' On You',
    artist: 'B.o.B ft. Bruno Mars',
    album: 'The Adventures of Bobby Ray',
    duration: 268,
    durationFormatted: '4:28',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/fa7df5ad2466a0d8b837188407457666/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-60ItHLz5WEA',
    videoId: '60ItHLz5WEA',
    title: 'Faded',
    artist: 'Alan Walker',
    album: 'Different World',
    duration: 212,
    durationFormatted: '3:32',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/e50540d7f752c93e0695ebae272be0c3/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-DjMu_4O_EYk',
    videoId: 'DjMu_4O_EYk',
    title: 'penjaga hati',
    artist: 'Nadhif Basalamah',
    album: 'penjaga hati',
    duration: 260,
    durationFormatted: '4:20',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/0e0a2dfc982357c7e5f66e4a3539ef0d/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-YrtS8MESh0I',
    videoId: 'YrtS8MESh0I',
    title: 'Runtuh',
    artist: 'Feby Putri ft. Fiersa Besari',
    album: 'Runtuh',
    duration: 223,
    durationFormatted: '3:43',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/32f2e6d8b7833663100f9ea92183332c/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-IWvo2fld3s4',
    videoId: 'IWvo2fld3s4',
    title: 'Dan...',
    artist: 'Sheila On 7',
    album: 'Sheila On 7',
    duration: 284,
    durationFormatted: '4:44',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/bb35130431c8c23b8b8f5010bd199f2b/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-_N6vSc_mT6I',
    videoId: '_N6vSc_mT6I',
    title: 'Hati-Hati di Jalan',
    artist: 'Tulus',
    album: 'Manusia',
    duration: 242,
    durationFormatted: '4:02',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/ec4b98e50b1c776c71774097eb1aee95/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-ic8j13piAhQ',
    videoId: 'ic8j13piAhQ',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    duration: 178,
    durationFormatted: '2:58',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/6111c5ab9729c8eac47883e4e50e9cf8/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-yKNxeF4KMsY',
    videoId: 'yKNxeF4KMsY',
    title: 'Yellow',
    artist: 'Coldplay',
    album: 'Parachutes',
    duration: 266,
    durationFormatted: '4:26',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/970dce98eeea6729244c0ae71707a83d/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-mFysRJ5Cj6Q',
    videoId: 'mFysRJ5Cj6Q',
    title: 'Jiwa Yang Bersedih',
    artist: 'Ghea Indrawari',
    album: 'Jiwa Yang Bersedih',
    duration: 278,
    durationFormatted: '4:38',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/c87114b5faa639eb85994631a3f151c2/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-OPUTzPAluig',
    videoId: 'OPUTzPAluig',
    title: 'Satu-Satu',
    artist: 'Idgitaf',
    album: 'Satu-Satu',
    duration: 284,
    durationFormatted: '4:44',
    coverArtUrl: 'https://cdn-images.dzcdn.net/images/cover/ef0abd19f7ee7b0f138327fb2ee3de99/500x500-000000-80-0-0.jpg',
    source: 'youtube',
  },
]

export const POPULAR_TRACKS = TRENDING_YOUTUBE_HITS

export function extractYouTubeId(input) {
  if (!input) return null
  const cleaned = input.trim()

  if (/^[a-zA-Z0-9_-]{11}$/.test(cleaned)) {
    return cleaned
  }

  const match = cleaned.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  )
  return match ? match[1] : null
}

const ytCache = new Map()
const ytDurCache = new Map()

/** Durasi versi lagu yang cocok dengan lirik LRCLIB (setelah resolve). */
export function getResolvedDuration(artist = '', title = '') {
  const cleanA = artist.replace(/\s*feat\..*$/i, '').trim()
  const cleanT = title.replace(/\s*\(feat\.[^)]+\)/i, '').replace(/\s*\[[^\]]+\]/g, '').trim()
  return ytDurCache.get(`${cleanA.toLowerCase()} - ${cleanT.toLowerCase()}`) || 0
}

export async function resolveFullTrackYouTube(artist = '', title = '', duration = 0) {
  if (!artist && !title) return null
  const cleanA = artist.replace(/\s*feat\..*$/i, '').trim()
  const cleanT = title.replace(/\s*\(feat\.[^)]+\)/i, '').replace(/\s*\[[^\]]+\]/g, '').trim()
  const cacheKey = `${cleanA.toLowerCase()} - ${cleanT.toLowerCase()}`

  if (ytCache.has(cacheKey)) {
    return ytCache.get(cacheKey)
  }

  // 0. Lyrics-first: use the LRCLIB synced entry's duration as the target,
  //    so the chosen audio is the exact version the timestamps were made for.
  //    Same args as the UI call → UI hits the cache and shows this same entry.
  const roundDur = await getLyricsTargetDuration(artist, title, duration)
  if (roundDur > 30) ytDurCache.set(cacheKey, roundDur)

  // 1. Server-side resolver (scores Topic/official audio + duration match)
  try {
    const q = `${cleanA} ${cleanT}`
    const durParam = roundDur > 30 ? `&duration=${roundDur}` : ''
    const res = await fetch(`/api/yt-search?q=${encodeURIComponent(q)}${durParam}`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.candidates)) {
        ytCandidatesCache.set(cacheKey, data.candidates)
      }
      if (data.videoId) {
        ytCache.set(cacheKey, data.videoId)
        return data.videoId
      }
    }
  } catch (err) {
    console.warn('Auto resolve error (proxy):', err.message)
  }

  // 2. Fallback: official YouTube Data API if user configured key
  const ytKey =
    (typeof window !== 'undefined' ? localStorage.getItem('timbre:ytApiKey') : null) ||
    import.meta.env.VITE_YOUTUBE_API_KEY
  if (ytKey && ytKey !== 'your_youtube_api_key_here') {
    try {
      const q = `${cleanA} ${cleanT} official audio`
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(
        q
      )}&type=video&key=${ytKey}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.items && data.items.length > 0) {
          const vid = data.items[0].id.videoId
          ytCache.set(cacheKey, vid)
          return vid
        }
      }
    } catch (err) {
      console.warn('Auto resolve error (API key):', err.message)
    }
  }

  return null
}

async function getLyricsTargetDuration(artist, title, duration) {
  const fallback = Math.round(duration || 0)
  try {
    const lyr = await getLyrics(artist, title, duration)
    if (lyr?.isSynced && lyr.duration > 30) return Math.round(lyr.duration)
  } catch {
    /* ignore — fall back to catalog duration */
  }
  return fallback
}

const ytCandidatesCache = new Map()

/**
 * Daftar videoId alternatif (urut skor terbaik) untuk fallback otomatis
 * saat video tidak bisa diputar (dihapus / embed dinonaktifkan pemilik).
 */
export async function resolveYouTubeCandidates(artist = '', title = '', duration = 0) {
  if (!artist && !title) return []
  const cleanA = artist.replace(/\s*feat\..*$/i, '').trim()
  const cleanT = title.replace(/\s*\(feat\.[^)]+\)/i, '').replace(/\s*\[[^\]]+\]/g, '').trim()
  const cacheKey = `${cleanA.toLowerCase()} - ${cleanT.toLowerCase()}`
  if (ytCandidatesCache.has(cacheKey)) return ytCandidatesCache.get(cacheKey)

  try {
    const roundDur = await getLyricsTargetDuration(artist, title, duration)
    const durParam = roundDur > 30 ? `&duration=${roundDur}` : ''
    const res = await fetch(`/api/yt-search?q=${encodeURIComponent(`${cleanA} ${cleanT}`)}${durParam}`)
    if (res.ok) {
      const data = await res.json()
      const list = Array.isArray(data.candidates) ? data.candidates : data.videoId ? [data.videoId] : []
      ytCandidatesCache.set(cacheKey, list)
      return list
    }
  } catch (err) {
    console.warn('Candidate resolve error:', err.message)
  }
  return []
}

// Fetch YouTube Trending tracks
export async function fetchYouTubeTrending(query = 'lagu pop trending indonesia official audio', limit = 20) {
  try {
    const res = await fetch(`/api/yt-trending?q=${encodeURIComponent(query)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.tracks && data.tracks.length > 0) {
        return data.tracks.slice(0, limit)
      }
    }
  } catch (err) {
    console.warn('YouTube trending fetch error:', err)
  }

  return TRENDING_YOUTUBE_HITS.slice(0, limit)
}

// Search YouTube Music tracks
export async function searchYouTubeMusic(query, apiKey = null) {
  if (!query || !query.trim()) {
    return TRENDING_YOUTUBE_HITS
  }

  const clean = query.trim()

  // 1. Direct YouTube link / ID
  const directId = extractYouTubeId(clean)
  if (directId) {
    return [
      {
        id: `yt-${directId}`,
        title: `YouTube Video (${directId})`,
        artist: 'YouTube Stream',
        album: 'Direct Stream',
        youtubeId: directId,
        videoId: directId,
        duration: 240,
        durationFormatted: 'Stream',
        coverArtUrl: `https://i.ytimg.com/vi/${directId}/hqdefault.jpg`,
        source: 'youtube',
      },
    ]
  }

  // 2. Try server-side YouTube search proxy
  try {
    const res = await fetch(`/api/yt-search?q=${encodeURIComponent(clean)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.tracks && data.tracks.length > 0) {
        return data.tracks
      }
    }
  } catch (err) {
    console.warn('YouTube search proxy warning:', err.message)
  }

  // 3. Fallback: Official YouTube Data API if key provided
  const ytKey =
    apiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem('timbre:ytApiKey') : null) ||
    import.meta.env.VITE_YOUTUBE_API_KEY
  if (ytKey && ytKey !== 'your_youtube_api_key_here') {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(
        clean + ' music audio'
      )}&type=video&key=${ytKey}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.items && data.items.length > 0) {
          return data.items.map((item) => ({
            id: `yt-${item.id.videoId}`,
            title: item.snippet.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
            artist: item.snippet.channelTitle,
            album: 'YouTube Music API',
            youtubeId: item.id.videoId,
            videoId: item.id.videoId,
            duration: 210,
            durationFormatted: 'Stream',
            coverArtUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            source: 'youtube',
          }))
        }
      }
    } catch (err) {
      console.warn('YouTube API fetch warning:', err.message)
    }
  }

  // 4. Local filter fallback
  return TRENDING_YOUTUBE_HITS.filter(
    (t) =>
      t.title.toLowerCase().includes(clean.toLowerCase()) ||
      t.artist.toLowerCase().includes(clean.toLowerCase())
  )
}

export const searchMusicCatalog = searchYouTubeMusic
