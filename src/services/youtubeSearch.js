// Layanan pencarian lagu & integrasi API Musik (YouTube Data API v3 & Jamendo)

// Daftar lagu kosong secara default (siap diisi via API Key)
export const POPULAR_TRACKS = []

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

export async function searchYouTubeMusic(query, apiKey = null) {
  if (!query || !query.trim()) {
    return POPULAR_TRACKS
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
        album: 'Direct Audio Stream',
        youtubeId: directId,
        duration: 240,
        durationFormatted: 'Stream',
        coverArtUrl: `https://i.ytimg.com/vi/${directId}/hqdefault.jpg`,
        category: 'custom',
        categoryLabel: 'Direct Link',
      },
    ]
  }

  // 2. Fetch using YouTube Data API v3 if API key is provided
  const ytKey = apiKey || (typeof window !== 'undefined' ? localStorage.getItem('timbre:ytApiKey') : null) || import.meta.env.VITE_YOUTUBE_API_KEY
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
            duration: 210,
            durationFormatted: 'Stream',
            coverArtUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            category: 'api',
            categoryLabel: 'YouTube API',
          }))
        }
      }
    } catch (err) {
      console.warn('YouTube API fetch warning:', err.message)
    }
  }

  // 3. Fallback: filter local tracks if any
  return POPULAR_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(clean.toLowerCase()) ||
      t.artist.toLowerCase().includes(clean.toLowerCase())
  )
}

export const searchMusicCatalog = searchYouTubeMusic
export const TRENDING_YOUTUBE_HITS = POPULAR_TRACKS
