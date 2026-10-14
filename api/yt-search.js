const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

function parseDuration(raw = '') {
  const parts = raw.replace(/\./g, ':').split(':').map((n) => parseInt(n, 10))
  if (parts.some(isNaN)) return 0
  return parts.reduce((acc, n) => acc * 60 + n, 0)
}

function parseYouTubeItems(html, limit = 20) {
  const match = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/)
  if (!match) return []
  try {
    const data = JSON.parse(match[1])
    const sections =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || []
    const results = []
    for (const sec of sections) {
      for (const it of sec.itemSectionRenderer?.contents || []) {
        const v = it.videoRenderer
        if (!v || !v.videoId || results.length >= limit) continue
        const secCount = parseDuration(v.lengthText?.simpleText || '')
        if (!secCount || secCount > 600) continue // skip live streams & compilations

        const rawTitle = v.title?.runs?.[0]?.text || ''
        const cleanTitle = rawTitle
          .replace(/\s*[([](Official|Lyric|Audio|Music Video)[^)\]]*[)\]]/gi, '')
          .trim()
        const channel = v.ownerText?.runs?.[0]?.text || 'YouTube Music'
        let artist = channel.replace(/\s*-\s*Topic$/i, '')
        let title = cleanTitle
        if (cleanTitle.includes(' - ')) {
          const parts = cleanTitle.split(' - ')
          artist = parts[0].trim()
          title = parts.slice(1).join(' - ').trim()
        }
        results.push({
          id: `yt-${v.videoId}`,
          videoId: v.videoId,
          youtubeId: v.videoId,
          title: title || cleanTitle,
          artist,
          album: 'YouTube Music',
          duration: secCount,
          coverArtUrl: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          source: 'youtube',
          rawTitle,
          channel,
        })
      }
    }
    return results
  } catch {
    return []
  }
}

const BAD_WORDS = ['cover', 'reaction', 'karaoke', 'live', 'sped up', 'slowed', 'reverb', 'nightcore', 'remix', 'acoustic', '8d', 'instrumental', 'tiktok', 'mashup', 'extended', 'loop']

/** Score candidates so the studio master (same audio as Spotify) wins. */
function scoreTrack(t, qLower, targetDuration) {
  let score = 0
  const tLower = (t.rawTitle || t.title || '').toLowerCase()
  const cLower = (t.channel || '').toLowerCase()

  if (cLower.endsWith('- topic')) score += 120 // auto-generated studio master
  if (cLower.includes('official') || cLower.includes('vevo')) score += 20
  if (/official audio|\(audio\)|\[audio\]/.test(tLower)) score += 80
  if (tLower.includes('lyric') || tLower.includes('lirik')) score += 25
  if (/official (music )?video|\bm\/?v\b|music video/.test(tLower)) score -= 40 // MVs often have intros

  for (const w of BAD_WORDS) {
    if (new RegExp(`\\b${w}\\b`).test(tLower) && !qLower.includes(w)) score -= 150
  }

  // Title words must actually appear
  const words = qLower.split(/\s+/).filter((w) => w.length > 2)
  const hits = words.filter((w) => tLower.includes(w) || cLower.includes(w)).length
  if (words.length) score += Math.round((hits / words.length) * 40)

  if (targetDuration > 30 && t.duration) {
    const diff = Math.abs(t.duration - targetDuration)
    score += diff <= 2 ? 100 : diff <= 5 ? 40 - diff * 4 : -diff * 8
  }
  return score
}

export default async function handler(req, res) {
  const { q, duration } = req.query
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required' })
  }

  try {
    const cleanQuery = String(q).replace(/\s+audio\s*$/i, '').trim()
    const targetDuration = parseInt(duration || '0', 10)
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery + ' official audio')}`
    const response = await fetch(ytUrl, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7' },
    })
    const html = await response.text()
    const tracks = parseYouTubeItems(html, 15)

    const qLower = cleanQuery.toLowerCase()
    const scored = tracks
      .map((t) => ({ t, score: scoreTrack(t, qLower, targetDuration) }))
      .sort((a, b) => b.score - a.score)

    let videoId = scored[0]?.t.videoId || null
    // Last-resort fallback if ytInitialData parsing failed
    if (!videoId) {
      const m = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)
      videoId = m ? m[1] : null
    }

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
    return res.status(200).json({
      videoId,
      candidates: scored.map((s) => s.t.videoId),
      tracks,
      query: cleanQuery,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
