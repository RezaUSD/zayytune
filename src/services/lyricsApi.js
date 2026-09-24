/**
 * LRCLIB Free Synced & Plain Lyrics Service
 * 100% Free, no API key, no registration required.
 * Provides real-time synced lyrics (.lrc timestamps) & plain text lyrics.
 */

const LRCLIB_FALLBACK_BASE = 'https://lrclib.net/api'
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
    .replace(/\s*-\s*.*version.*$/gi, '')
    .replace(/\s*\(official.*?\)/gi, '')
    .replace(/\s*\(audio.*?\)/gi, '')
    .replace(/\s*\(video.*?\)/gi, '')
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
 * Universal safe fetch for LRCLIB without forbidden headers (crucial for iOS Safari)
 */
async function fetchFromLrclib(endpoint) {
  // 1. Try same-origin proxy first (/api/lrclib/...)
  try {
    const proxyRes = await fetch(`/api/lrclib/${endpoint}`)
    if (proxyRes.ok) {
      return await proxyRes.json()
    }
  } catch (err) {
    // Continue to direct fallback
  }

  // 2. Direct fallback to lrclib.net without any custom headers
  try {
    const directRes = await fetch(`${LRCLIB_FALLBACK_BASE}/${endpoint}`)
    if (directRes.ok) {
      return await directRes.json()
    }
  } catch (err) {
    // Network error or blocked
  }

  return null
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
 * Fetch lyrics from LRCLIB with iOS Safari compatibility & multi-stage fallbacks
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

  // 1. Try exact match first without duration (avoids 404 from small duration discrepancies)
  const exactData = await fetchFromLrclib(
    `get?artist_name=${encodeURIComponent(primaryArtist)}&track_name=${encodeURIComponent(primaryTitle)}`
  )
  if (exactData) {
    const result = formatLyricsData(exactData)
    if (result) {
      lyricsCache.set(cacheKey, result)
      return result
    }
  }

  // 2. Try cleaned title / artist match
  const cTitle = cleanTitle(primaryTitle)
  const cArtist = cleanArtist(primaryArtist)
  if (cTitle !== primaryTitle || cArtist !== primaryArtist) {
    const cleanData = await fetchFromLrclib(
      `get?artist_name=${encodeURIComponent(cArtist)}&track_name=${encodeURIComponent(cTitle)}`
    )
    if (cleanData) {
      const result = formatLyricsData(cleanData)
      if (result) {
        lyricsCache.set(cacheKey, result)
        return result
      }
    }
  }

  // 3. Fallback to broad search (q=title artist)
  const query = `${cTitle} ${cArtist}`.trim()
  const searchResults = await fetchFromLrclib(`search?q=${encodeURIComponent(query)}`)
  if (Array.isArray(searchResults) && searchResults.length > 0) {
    // Pick candidate with syncedLyrics first, then plainLyrics
    const best =
      searchResults.find((item) => item.syncedLyrics) ||
      searchResults.find((item) => item.plainLyrics) ||
      searchResults[0]
    const result = formatLyricsData(best)
    if (result) {
      lyricsCache.set(cacheKey, result)
      return result
    }
  }

  // 4. Fallback search just with title if multi-artist or unusual format
  if (cTitle.length >= 3) {
    const titleOnlyResults = await fetchFromLrclib(`search?q=${encodeURIComponent(cTitle)}`)
    if (Array.isArray(titleOnlyResults) && titleOnlyResults.length > 0) {
      const best =
        titleOnlyResults.find((item) => item.syncedLyrics) ||
        titleOnlyResults.find((item) => item.plainLyrics)
      if (best) {
        const result = formatLyricsData(best)
        if (result) {
          lyricsCache.set(cacheKey, result)
          return result
        }
      }
    }
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
