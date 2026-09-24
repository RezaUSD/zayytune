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
 * Universal safe fetch with strict timeout to avoid infinite loading spinners
 */
async function fetchWithTimeout(url, timeoutMs = 3500) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    return res
  } catch (e) {
    clearTimeout(timer)
    return null
  }
}

/**
 * Universal safe fetch for LRCLIB without forbidden headers (crucial for iOS Safari)
 */
async function fetchFromLrclib(endpoint) {
  // 1. Try same-origin proxy first (/api/lrclib/...)
  const proxyRes = await fetchWithTimeout(`/api/lrclib/${endpoint}`, 3000)
  if (proxyRes) {
    if (proxyRes.ok) {
      try {
        return await proxyRes.json()
      } catch (err) {
        return null
      }
    }
    // If the proxy explicitly returned 404, LRCLIB does not have this resource
    if (proxyRes.status === 404) {
      return null
    }
  }

  // 2. Direct fallback to lrclib.net ONLY if proxy was unreachable or network error
  const directRes = await fetchWithTimeout(`${LRCLIB_FALLBACK_BASE}/${endpoint}`, 3000)
  if (directRes && directRes.ok) {
    try {
      return await directRes.json()
    } catch (err) {
      return null
    }
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
 * Fetch lyrics from LRCLIB with iOS Safari compatibility, fast timeouts & negative caching
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

  const primaryTitle = title.trim()
  const primaryArtist = artist.trim()
  const cacheKey = `${primaryArtist.toLowerCase()}:::${primaryTitle.toLowerCase()}`

  // Check cache first (includes null cache to avoid re-fetching unavailable tracks)
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)
  }

  const cTitle = cleanTitle(primaryTitle)
  const cArtist = cleanArtist(primaryArtist)

  // Stage 1: Try exact match with cleaned title & artist
  const exactData = await fetchFromLrclib(
    `get?artist_name=${encodeURIComponent(cArtist || primaryArtist)}&track_name=${encodeURIComponent(cTitle || primaryTitle)}`
  )
  if (exactData) {
    const result = formatLyricsData(exactData)
    if (result) {
      lyricsCache.set(cacheKey, result)
      return result
    }
  }

  // Stage 2: One fast broad search fallback if exact match wasn't found
  const query = `${cTitle || primaryTitle} ${cArtist || primaryArtist}`.trim()
  const searchResults = await fetchFromLrclib(`search?q=${encodeURIComponent(query)}`)
  if (Array.isArray(searchResults) && searchResults.length > 0) {
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

  // Cache null so this track doesn't cause repeated network requests
  lyricsCache.set(cacheKey, null)
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
