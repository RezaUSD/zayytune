import React, { useState, useEffect, useRef, useMemo } from 'react'
import { getLyrics } from '../services/lyricsApi'
import { usePlayer } from '../context/PlayerContext'
import { getTrackCover, handleImageFallback } from '../services/imageHelper'
import {
  getActiveLyricIndex,
  getSavedTrackOffset,
  saveTrackOffset,
  DEFAULT_LYRIC_OFFSET,
  LYRIC_OFFSET_EVENT,
} from '../services/lyricsHelper'

export default function SyncedLyricsModal({ isOpen, onClose }) {
  const { currentTrack, currentTime, duration, isPlaying, togglePlay, seek, nextTrack, prevTrack } =
    usePlayer()

  const [lyricsData, setLyricsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(DEFAULT_LYRIC_OFFSET)
  const containerRef = useRef(null)
  const activeLineRef = useRef(null)

  // Load offset for active track & listen for cross-component sync
  useEffect(() => {
    if (currentTrack) {
      const trackId = currentTrack.id || currentTrack.videoId
      setOffset(getSavedTrackOffset(trackId))
    }

    const handleOffsetEvent = (e) => {
      const trackId = currentTrack?.id || currentTrack?.videoId
      if (e.detail?.trackId === trackId && typeof e.detail?.offset === 'number') {
        setOffset(e.detail.offset)
      }
    }

    window.addEventListener(LYRIC_OFFSET_EVENT, handleOffsetEvent)
    return () => window.removeEventListener(LYRIC_OFFSET_EVENT, handleOffsetEvent)
  }, [currentTrack?.id, currentTrack?.videoId])

  const handleAdjustOffset = (delta) => {
    setOffset((prev) => {
      const next = Math.round((prev + delta) * 10) / 10
      const clamped = Math.max(-10, Math.min(10, next))
      const trackId = currentTrack?.id || currentTrack?.videoId
      saveTrackOffset(trackId, clamped)
      return clamped
    })
  }

  const handleResetOffset = () => {
    setOffset(DEFAULT_LYRIC_OFFSET)
    const trackId = currentTrack?.id || currentTrack?.videoId
    saveTrackOffset(trackId, DEFAULT_LYRIC_OFFSET)
  }

  useEffect(() => {
    if (!currentTrack || !isOpen) {
      if (!isOpen) setLyricsData(null)
      return
    }

    let isMounted = true
    setLoading(true)

    getLyrics(currentTrack.artist, currentTrack.title, currentTrack.duration)
      .then((data) => {
        if (isMounted) {
          setLyricsData(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setLyricsData(null)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentTrack?.title, currentTrack?.artist, currentTrack?.duration, isOpen])

  // Real-time active line calculation using calibrated offset
  const activeLineIdx = useMemo(() => {
    if (!lyricsData?.lines || lyricsData.lines.length === 0) return -1
    return getActiveLyricIndex(lyricsData.lines, currentTime, offset)
  }, [lyricsData, currentTime, offset])

  // Auto-scroll active line to center (or top during intro)
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    } else if (activeLineIdx === -1 && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activeLineIdx])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const effectiveDuration = duration || currentTrack?.duration || 200
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="neo-card bg-[#F7F4EB] border-2 border-[#141416] shadow-[6px_6px_0px_#141416] rounded-3xl w-full max-w-2xl h-[85vh] max-h-[720px] flex flex-col overflow-hidden relative">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-white border-b-2 border-[#141416] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl border-2 border-[#141416] shadow-[2px_2px_0px_#141416] overflow-hidden bg-gray-100 shrink-0">
              <img
                src={getTrackCover(currentTrack)}
                alt={currentTrack?.title || 'Track Art'}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => handleImageFallback(e, currentTrack)}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="neo-badge bg-[#FFE043] text-[#141416] text-[9px] px-2 py-0.2 transform -rotate-2">
                  LIRIK SINKRON
                </span>
                {lyricsData?.isSynced && (
                  <span className="neo-badge bg-[#98E8CE] text-[#141416] text-[9px] px-2 py-0.2">
                    KARAOKE
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#141416] uppercase truncate leading-tight mt-0.5">
                {currentTrack?.title || 'Tidak ada lagu diputar'}
              </h3>
              <p className="text-xs font-bold text-[#141416]/60 truncate">
                {currentTrack?.artist || 'Pilih lagu untuk memuat lirik'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border-2 border-[#141416] shadow-[2px_2px_0px_#141416] hover:bg-[#FFE043] active:scale-95 transition-all flex items-center justify-center text-[#141416] cursor-pointer shrink-0"
            title="Tutup"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Sync Calibration Strip (if lyrics are synced) */}
        {lyricsData?.isSynced && (
          <div className="bg-[#EFEAD8] border-b border-[#141416]/15 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-[#141416]/70 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#2850ED]">tune</span>
              <span>
                Kalibrasi Waktu Lirik:{' '}
                <strong className={`font-mono text-xs ${offset !== 0 ? 'text-[#2850ED]' : 'text-[#141416]'}`}>
                  {offset > 0 ? `+${offset.toFixed(1)}s (Lirik Maju)` : offset < 0 ? `${offset.toFixed(1)}s (Lirik Mundur)` : '0.0s (Selaras Normal)'}
                </strong>
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustOffset(-0.5)}
                className="px-2 py-0.5 rounded-lg bg-white border border-[#141416] hover:bg-[#FFE043] text-[#141416] font-mono text-[10px] cursor-pointer"
                title="Mundurkan lirik 0.5 detik"
              >
                -0.5s
              </button>
              <button
                type="button"
                onClick={() => handleAdjustOffset(-0.2)}
                className="px-2 py-0.5 rounded-lg bg-white border border-[#141416] hover:bg-[#FFE043] text-[#141416] font-mono text-[10px] cursor-pointer"
                title="Mundurkan lirik 0.2 detik"
              >
                -0.2s
              </button>
              <button
                type="button"
                onClick={handleResetOffset}
                className="px-2 py-0.5 rounded-lg bg-white border border-[#141416] hover:bg-gray-100 text-[#141416] text-[10px] cursor-pointer"
                title="Reset kalibrasi ke 0"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => handleAdjustOffset(+0.2)}
                className="px-2 py-0.5 rounded-lg bg-white border border-[#141416] hover:bg-[#FFE043] text-[#141416] font-mono text-[10px] cursor-pointer"
                title="Majukan lirik 0.2 detik"
              >
                +0.2s
              </button>
              <button
                type="button"
                onClick={() => handleAdjustOffset(+0.5)}
                className="px-2 py-0.5 rounded-lg bg-white border border-[#141416] hover:bg-[#FFE043] text-[#141416] font-mono text-[10px] cursor-pointer"
                title="Majukan lirik 0.5 detik"
              >
                +0.5s
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Synced Lyrics Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-4 no-scrollbar text-center select-text"
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-20">
              <span className="material-symbols-outlined text-[36px] animate-spin text-[#2850ED]">
                progress_activity
              </span>
              <p className="text-sm font-black uppercase tracking-wider text-[#141416]/60">
                Mencari lirik sinkron dari database...
              </p>
            </div>
          ) : lyricsData?.lines && lyricsData.lines.length > 0 ? (
            <>
              {lyricsData.lines.map((line, idx) => {
                const isActive = activeLineIdx === idx
                const isPast = activeLineIdx !== -1 && idx < activeLineIdx
                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => seek(Math.max(0, line.time - offset))}
                    className="py-1 px-2 transition-all duration-300 flex justify-center"
                  >
                    <span
                      className={`inline-block transition-all duration-300 cursor-pointer rounded-2xl max-w-full text-center leading-relaxed ${
                        isActive
                          ? 'bg-[#2850ED] text-white font-black text-lg sm:text-xl py-2 px-6 shadow-[2.5px_2.5px_0px_#141416] border-2 border-[#141416]'
                          : isPast
                          ? 'text-[#141416]/70 hover:text-[#141416] hover:bg-white/60 py-1 px-4 text-base sm:text-lg font-bold'
                          : 'text-[#141416]/35 hover:text-[#141416] hover:bg-white/40 py-1 px-4 text-base sm:text-lg font-bold'
                      }`}
                    >
                      {line.text}
                    </span>
                  </div>
                )
              })}
          </>
        ) : lyricsData?.plainLyrics ? (
            <div className="max-w-md mx-auto py-6 text-left whitespace-pre-line text-base font-bold text-[#141416]/80 leading-relaxed bg-white p-6 rounded-2xl border-2 border-[#141416] shadow-[3px_3px_0px_#141416]">
              {lyricsData.plainLyrics}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FFD1C7] border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center justify-center text-[#141416]">
                <span className="material-symbols-outlined text-[28px]">mic_off</span>
              </div>
              <h4 className="text-base font-black uppercase text-[#141416]">
                Lirik Belum Tersedia
              </h4>
              <p className="text-xs font-bold text-[#141416]/60 max-w-xs">
                Lirik lagu untuk trek ini belum ada di arsip LRCLIB. Lagu tetap dapat didengarkan secara penuh.
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Scrubber & Mini Player */}
        <div className="p-3 sm:p-4 bg-white border-t-2 border-[#141416] flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-black text-[#141416]/70 w-9 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={(e) => seek((parseFloat(e.target.value) / 100) * effectiveDuration)}
              className="flex-1 h-2 bg-[#E8E4D8] rounded-full appearance-none cursor-pointer accent-[#2850ED]"
            />
            <span className="text-[11px] font-mono font-black text-[#141416]/70 w-9 tabular-nums">
              {formatTime(effectiveDuration)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prevTrack}
              className="text-[#141416] hover:scale-110 active:scale-95 transition-transform p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">skip_previous</span>
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#141416] text-white border-2 border-[#141416] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              type="button"
              onClick={nextTrack}
              className="text-[#141416] hover:scale-110 active:scale-95 transition-transform p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">skip_next</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
