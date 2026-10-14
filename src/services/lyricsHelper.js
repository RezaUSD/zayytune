// Helper utilitas sinkronisasi lirik realtime ZayyTune

/**
 * Lead offset default dalam detik.
 * 0.0s untuk baseline akurat, pengguna dapat mengkalibrasi +/- secara instan.
 */
export const DEFAULT_LYRIC_OFFSET = 0.0

export const LYRIC_OFFSET_EVENT = 'timbre:lyric_offset_changed'

/**
 * Lead perseptual bawaan (detik). 0.0 untuk baseline akurat asli.
 */
export const LYRIC_PERCEPTUAL_LEAD = 0.0

/**
 * Menghitung indeks baris lirik yang aktif berdasarkan waktu audio saat ini.
 * @param {Array<{ time: number, text: string }>} lines
 * @param {number} currentTime - Waktu audio saat ini dalam detik
 * @param {number} offsetSeconds - Offset waktu (positif = lirik maju, negatif = lirik mundur)
 * @returns {number} Indeks baris aktif (-1 jika masih dalam intro musik)
 */
export function getActiveLyricIndex(lines, currentTime = 0, offsetSeconds = DEFAULT_LYRIC_OFFSET) {
  if (!lines || !Array.isArray(lines) || lines.length === 0) return -1

  const offset = typeof offsetSeconds === 'number' && !isNaN(offsetSeconds) ? offsetSeconds : 0
  const effectiveTime = currentTime + offset

  // 1. Sebelum vokal pertama: belum ada baris aktif (-1) persis seperti di Spotify
  if (effectiveTime < lines[0].time) {
    return -1
  }

  // 2. Cari baris yang sedang aktif sesuai detik lagu
  for (let i = lines.length - 1; i >= 0; i--) {
    if (effectiveTime >= lines[i].time) {
      return i
    }
  }

  return -1
}

/**
 * Mendapatkan offset tersimpan untuk trek tertentu atau default
 */
export function getSavedTrackOffset(trackId) {
  if (typeof window === 'undefined' || !trackId) return DEFAULT_LYRIC_OFFSET
  try {
    const saved = localStorage.getItem(`timbre:lyric_offset:${trackId}`)
    if (saved !== null) {
      const parsed = parseFloat(saved)
      if (!isNaN(parsed) && parsed >= -10 && parsed <= 10) {
        return parsed
      }
    }
  } catch (e) {}
  return DEFAULT_LYRIC_OFFSET
}

/**
 * Menyimpan offset kalibrasi untuk trek dan memancarkan event agar semua UI lirik sinkron otomatis
 */
export function saveTrackOffset(trackId, offset) {
  if (typeof window === 'undefined' || !trackId) return
  try {
    const clamped = Math.max(-10, Math.min(10, Math.round(offset * 10) / 10))
    localStorage.setItem(`timbre:lyric_offset:${trackId}`, clamped.toFixed(1))
    queueMicrotask(() => {
      window.dispatchEvent(
        new CustomEvent(LYRIC_OFFSET_EVENT, {
          detail: { trackId, offset: clamped },
        })
      )
    })
  } catch (e) {}
}

/**
 * Menyesuaikan offset relatif (+0.5s atau -0.5s) dan menyimpannya langsung
 */
export function adjustTrackOffset(trackId, delta) {
  const current = getSavedTrackOffset(trackId)
  const next = Math.round((current + delta) * 10) / 10
  const clamped = Math.max(-10, Math.min(10, next))
  saveTrackOffset(trackId, clamped)
  return clamped
}

