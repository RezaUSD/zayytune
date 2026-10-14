import { useEffect, useState } from 'react'
import { getSavedTrackOffset, LYRIC_OFFSET_EVENT } from '../services/lyricsHelper'

/**
 * Mengambil offset kalibrasi lirik untuk trek & ikut berubah saat dikalibrasi dari UI mana pun.
 */
export function useLyricOffset(currentTrack) {
  const trackId = currentTrack?.id || currentTrack?.videoId
  const [offset, setOffset] = useState(() => getSavedTrackOffset(trackId))

  useEffect(() => {
    setOffset(getSavedTrackOffset(trackId))
    const handler = (e) => {
      if (e.detail?.trackId === trackId && typeof e.detail?.offset === 'number') {
        setOffset(e.detail.offset)
      }
    }
    window.addEventListener(LYRIC_OFFSET_EVENT, handler)
    return () => window.removeEventListener(LYRIC_OFFSET_EVENT, handler)
  }, [trackId])

  return offset
}
