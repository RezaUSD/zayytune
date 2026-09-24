/**
 * LRCLIB Free Synced & Plain Lyrics Service
 * 100% Free, no API key, no registration required.
 * Provides real-time synced lyrics (.lrc timestamps) & plain text lyrics.
 */

const LRCLIB_BASE = 'https://lrclib.net/api'
const lyricsCache = new Map()

/**
 * Clean track title and artist name for better matching
 * E.g. "Dracula (feat. Jennie) - Remix" -> "Dracula"
 */
function cleanTitle(title = '') {
  return title
    .replace(/\s*\(feat\.[^)]+\)/gi, '')
    .replace(/\s*\(with[^)]+\)/gi, '')
    .replace(/\s*\[[^\]]+\]/g, '')
    .replace(/\s*-\s*.*remix.*$/gi, '')
    .trim()
}

function cleanArtist(artist = '') {
  return artist
    .replace(/\s*,\s*.*$/, '')
    .replace(/\s*feat\..*$/gi, '')
    .replace(/\s*&\s*.*$/, '')
    .trim()
}

/**
 * Parse standard LRC format string into array of timestamped lines
 * [mm:ss.xx] Lyric text
 */
export function parseLrc(lrcText = '') {
  if (!lrcText) return []
  const lines = []
  const regex = /\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)/

  for (const rawLine of lrcText.split('\n')) {
    const trimmed = rawLine.trim()
    const match = trimmed.match(regex)
    if (match) {
      const minutes = parseInt(match[1], 10)
      const seconds = parseFloat(match[2])
      const time = minutes * 60 + seconds
      const text = match[3].trim()
      if (text) {
        lines.push({ time, text })
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time)
}

/**
 * Fetch lyrics from LRCLIB
 * @param {string} artist
 * @param {string} title
 * @param {number} [duration]
 * @returns {Promise<{ plainLyrics?: string, syncedLyrics?: string, lines: Array<{ time: number, text: string }>, isSynced: boolean } | null>}
 */
export async function getLyrics(artist = '', title = '', duration = 0) {
  if (!artist && !title) return null
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null
  }

  const cacheKey = `${artist.toLowerCase()}:::${title.toLowerCase()}`
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)
  }

  const primaryTitle = title.trim()
  const primaryArtist = artist.trim()
  const durationParam = duration && duration > 0 ? `&duration=${Math.round(duration)}` : ''

  // 1. Try exact match first
  try {
    const url = `${LRCLIB_BASE}/get?artist_name=${encodeURIComponent(primaryArtist)}&track_name=${encodeURIComponent(primaryTitle)}${durationParam}`
    const res = await fetch(url, { headers: { 'User-Agent': 'TimbreeMusicApp/1.0' } })
    if (res.ok) {
      const data = await res.json()
      const result = formatLyricsData(data)
      if (result) {
        lyricsCache.set(cacheKey, result)
        return result
      }
    }
  } catch (err) {
    // Continue to fallback search
  }

  // 2. Try cleaned title / artist match
  const cTitle = cleanTitle(primaryTitle)
  const cArtist = cleanArtist(primaryArtist)
  if (cTitle !== primaryTitle || cArtist !== primaryArtist) {
    try {
      const url = `${LRCLIB_BASE}/get?artist_name=${encodeURIComponent(cArtist)}&track_name=${encodeURIComponent(cTitle)}`
      const res = await fetch(url, { headers: { 'User-Agent': 'TimbreeMusicApp/1.0' } })
      if (res.ok) {
        const data = await res.json()
        const result = formatLyricsData(data)
        if (result) {
          lyricsCache.set(cacheKey, result)
          return result
        }
      }
    } catch (err) {
      // Continue to search
    }
  }

  // 3. Fallback to broad search
  try {
    const query = `${cTitle} ${cArtist}`.trim()
    const searchUrl = `${LRCLIB_BASE}/search?q=${encodeURIComponent(query)}`
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'TimbreeMusicApp/1.0' } })
    if (searchRes.ok) {
      const items = await searchRes.json()
      if (Array.isArray(items) && items.length > 0) {
        // Pick best candidate with synced lyrics if available
        const best = items.find((item) => item.syncedLyrics) || items.find((item) => item.plainLyrics) || items[0]
        const result = formatLyricsData(best)
        if (result) {
          lyricsCache.set(cacheKey, result)
          return result
        }
      }
    }
  } catch (err) {
    // Silently ignore network failures (offline / rate limit)
  }

  return null
}

function formatLyricsData(data) {
  if (!data) return null
  const syncedLyrics = data.syncedLyrics || ''
  const plainLyrics = data.plainLyrics || ''

  if (!syncedLyrics && !plainLyrics) return null

  const lines = parseLrc(syncedLyrics)
  return {
    id: data.id,
    trackName: data.trackName,
    artistName: data.artistName,
    plainLyrics,
    syncedLyrics,
    lines,
    isSynced: lines.length > 0,
  }
}
