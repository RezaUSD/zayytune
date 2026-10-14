import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'

function parseYouTubeItemsFromHtml(html, limit = 20) {
  const match = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/)
  if (!match) return []
  try {
    const data = JSON.parse(match[1])
    const sections =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || []
    const results = []

    for (const sec of sections) {
      const items = sec.itemSectionRenderer?.contents || []
      for (const it of items) {
        const v = it.videoRenderer
        if (v && v.videoId && results.length < limit) {
          const rawDuration = v.lengthText?.simpleText || '3:30'
          const durParts = rawDuration.replace(/\./g, ':').split(':')
          if (durParts.length > 2) continue // Skip compilations longer than an hour
          let secCount = 210
          if (durParts.length === 2) {
            secCount = parseInt(durParts[0], 10) * 60 + parseInt(durParts[1], 10)
          }
          if (secCount > 600) continue // Skip compilations longer than 10 mins

          const rawTitle = v.title?.runs?.[0]?.text || ''
          const cleanTitle = rawTitle
            .replace(/\s*\(Official.*?\)/gi, '')
            .replace(/\s*\[Official.*?\]/gi, '')
            .replace(/\s*\(Lyric.*?\)/gi, '')
            .replace(/\s*\[Lyric.*?\]/gi, '')
            .replace(/\s*\(Audio.*?\)/gi, '')
            .replace(/\s*\(Music Video.*?\)/gi, '')
            .trim()

          const channel = v.ownerText?.runs?.[0]?.text || 'YouTube Music'
          let artist = channel
          let title = cleanTitle
          if (cleanTitle.includes(' - ')) {
            const parts = cleanTitle.split(' - ')
            artist = parts[0].trim()
            title = parts.slice(1).join(' - ').trim()
          }

          results.push({
            id: `yt-${v.videoId}`,
            videoId: v.videoId,
            title: title || cleanTitle,
            artist: artist || channel,
            album: 'YouTube Trending',
            duration: secCount,
            coverArtUrl: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
            source: 'youtube',
            rawTitle,
            channel,
          })
        }
      }
    }
    return results
  } catch (err) {
    return []
  }
}

function youtubeResolverPlugin() {
  return {
    name: 'youtube-full-audio-resolver',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. YouTube Trending Music
        if (req.url && req.url.startsWith('/api/yt-trending')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:5173')
            const q = urlObj.searchParams.get('q') || 'lagu pop trending indonesia official audio'
            const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
            const ytRes = await fetch(ytUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
              },
            })
            const html = await ytRes.text()
            const tracks = parseYouTubeItemsFromHtml(html, 20)
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            return res.end(JSON.stringify({ tracks }))
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ error: e.message, tracks: [] }))
          }
        }

        // 2. YouTube Search & Single Resolver
        if (req.url && req.url.startsWith('/api/yt-search')) {
          const urlObj = new URL(req.url, 'http://localhost:5173')
          const query = urlObj.searchParams.get('q')
          if (!query) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ error: 'Query is required' }))
          }

          try {
            const cleanQuery = query.replace(/\s+audio\s*$/i, '').trim()
            const targetDuration = parseInt(urlObj.searchParams.get('duration') || '0', 10)
            const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery + ' official audio')}`
            const ytRes = await fetch(ytUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
              },
            })
            const html = await ytRes.text()
            const tracks = parseYouTubeItemsFromHtml(html, 15)

            // Select best video matching studio audio timing (crucial for synced lyrics)
            const qLower = cleanQuery.toLowerCase()
            const allowIf = (word) => qLower.includes(word)
            let bestTrack = tracks[0] || null
            const scored = []
            for (const t of tracks) {
              let score = 0
              const tLower = (t.rawTitle || t.title || '').toLowerCase()
              const cLower = (t.channel || t.artist || '').toLowerCase()

              // Auto-generated "Artist - Topic" = exact studio master (same as Spotify)
              if (cLower.endsWith('- topic')) score += 120
              if (cLower.includes('official') || cLower.includes('vevo')) score += 20
              if (tLower.includes('official audio') || tLower.includes('(audio)') || tLower.includes('[audio]')) score += 80
              if (tLower.includes('lyric') || tLower.includes('lirik')) score += 25
              if (/official (music )?video|\bm\/?v\b|music video/.test(tLower)) score -= 40

              const badWords = ['cover', 'reaction', 'karaoke', 'live', 'sped up', 'slowed', 'reverb', 'nightcore', 'remix', 'acoustic', '8d', 'instrumental', 'tiktok']
              for (const w of badWords) {
                if (new RegExp(`\\b${w}\\b`).test(tLower) && !allowIf(w)) score -= 150
              }

              if (targetDuration > 30 && t.duration) {
                const diff = Math.abs(t.duration - targetDuration)
                score += diff <= 2 ? 100 : diff <= 5 ? 40 - diff * 4 : -diff * 8
              }

              scored.push({ t, score })
            }
            scored.sort((a, b) => b.score - a.score)
            if (scored.length > 0) bestTrack = scored[0].t
            const candidates = scored.map((s) => s.t.videoId)

            const chosenId = bestTrack?.videoId || tracks[0]?.videoId || null
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            return res.end(JSON.stringify({ videoId: chosenId, candidates, tracks, query: cleanQuery }))
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ error: e.message }))
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), youtubeResolverPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/jamendo-audio': {
        target: 'https://prod-1.storage.jamendo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jamendo-audio/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
      '/api/deezer': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deezer/, ''),
      },
      '/api/lrclib': {
        target: 'https://lrclib.net/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lrclib/, ''),
      },
    },
  },
})
