import React from 'react'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import { getTrackCover, handleImageFallback } from '../services/imageHelper'

export default function TrackRow({ track, index, queue = [], onAddToPlaylist }) {
  const { currentTrack, isPlaying, playTrack, togglePlay, setIsLyricsModalOpen } = usePlayer()
  const { isFavorite, toggleFavorite } = useAuth()

  if (!track) return null

  const isCurrent =
    (currentTrack?.id && track.id && currentTrack.id === track.id) ||
    (currentTrack?.videoId && track.videoId && currentTrack.videoId === track.videoId) ||
    (Boolean(currentTrack?.title && track.title) &&
      currentTrack.title.trim().toLowerCase() === track.title.trim().toLowerCase())
  const isThisPlaying = isCurrent && isPlaying
  const fav = isFavorite(track)

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '3:45'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay()
    } else {
      playTrack(track, queue)
    }
  }

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between px-3 sm:px-4 py-2 rounded-xl transition-all select-none cursor-pointer border ${
        isCurrent
          ? 'bg-[#FFE043] border-[#141416] text-[#141416] shadow-[2px_2px_0px_#141416]'
          : 'bg-white hover:bg-[#F7F4EB] border-transparent hover:border-[#141416]/20 text-[#141416]'
      }`}
    >
      {/* Left: Index / Play Icon & Track Details */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Track Index or Play Icon */}
        <div className="w-5 text-center shrink-0">
          <span
            className={`text-xs font-mono font-bold group-hover:hidden ${
              isCurrent ? 'text-[#141416]' : 'text-[#141416]/40'
            }`}
          >
            {isThisPlaying ? (
              <span className="material-symbols-outlined text-[16px] text-[#2850ED] animate-pulse">
                equalizer
              </span>
            ) : (
              index + 1
            )}
          </span>
          <button
            type="button"
            className="hidden group-hover:flex items-center justify-center text-[#141416]"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isThisPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>

        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-[#141416]">
          <img
            src={getTrackCover(track)}
            alt={track.title}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => handleImageFallback(e, track)}
          />
        </div>

        {/* Title & Artist */}
        <div className="flex flex-col min-w-0 flex-1 pr-2">
          <span
            className={`text-xs font-black truncate leading-tight uppercase ${
              isCurrent ? 'text-[#141416]' : 'text-[#141416]'
            }`}
          >
            {track.title}
          </span>
          <span className="text-[11px] text-[#141416]/60 truncate mt-0.5 font-bold">{track.artist}</span>
        </div>
      </div>

      {/* Album name (Desktop only) */}
      <div className="hidden md:block w-1/4 min-w-0 pr-4">
        <span className="text-xs text-[#141416]/60 truncate block font-medium">
          {track.album || 'Single Release'}
        </span>
      </div>

      {/* Right: Actions & Duration */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Quick Lyrics Button */}
        <button
          type="button"
          onClick={() => {
            playTrack(track, queue)
            setIsLyricsModalOpen(true)
          }}
          className="p-1.5 rounded-lg text-[#141416]/40 hover:text-[#2850ED] hover:bg-white/80 transition-colors cursor-pointer"
          title="Buka Lirik Sinkron"
        >
          <span className="material-symbols-outlined text-[18px]">mic</span>
        </button>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={() => toggleFavorite(track)}
          className={`p-1.5 rounded-lg transition-transform active:scale-75 cursor-pointer ${
            fav ? 'text-[#FF6D60]' : 'text-[#141416]/30 hover:text-[#141416]'
          }`}
          title={fav ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
        >
          <span
            className="material-symbols-outlined text-[19px]"
            style={{ fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>

        {/* Add to Playlist Button */}
        {onAddToPlaylist && (
          <button
            type="button"
            onClick={() => onAddToPlaylist(track)}
            className="hidden sm:block p-1.5 rounded-lg text-[#141416]/40 hover:text-[#141416] transition-colors"
            title="Tambah ke Playlist"
          >
            <span className="material-symbols-outlined text-[18px]">playlist_add</span>
          </button>
        )}

        {/* Duration */}
        <span className="text-xs font-mono text-[#141416]/50 w-10 text-right font-bold">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  )
}
