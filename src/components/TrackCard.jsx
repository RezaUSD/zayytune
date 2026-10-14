import React from 'react'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import { getTrackCover, handleImageFallback } from '../services/imageHelper'

export default function TrackCard({ track, queue = [] }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const { isFavorite, toggleFavorite } = useAuth()

  if (!track) return null

  const isCurrent = (currentTrack?.id || currentTrack?.videoId) === (track.id || track.videoId)
  const isThisPlaying = isCurrent && isPlaying
  const fav = isFavorite(track)

  const handleCardClick = () => {
    if (isCurrent) {
      togglePlay()
    } else {
      playTrack(track, queue)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/10 transition-all duration-300 cursor-pointer flex flex-col gap-3 select-none"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#161722] shadow-md">
        <img
          src={getTrackCover(track)}
          alt={track.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isThisPlaying ? 'scale-105' : ''
          }`}
          onError={(e) => handleImageFallback(e, track)}
        />

        {/* Playing animated equalizer overlay */}
        {isThisPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex items-end gap-1 h-5">
              <span className="w-1 h-full bg-indigo-400 animate-pulse rounded-full" />
              <span className="w-1 h-3/4 bg-rose-400 animate-pulse delay-75 rounded-full" />
              <span className="w-1 h-4/5 bg-indigo-300 animate-pulse delay-150 rounded-full" />
            </div>
          </div>
        )}

        {/* Floating Play / Pause Button on Hover (Spotify style) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleCardClick()
          }}
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 transition-all duration-300 ${
            isThisPlaying
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 scale-95 hover:scale-105'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isThisPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Favorite Icon (top right) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(track)
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md transition-all duration-200 ${
            fav
              ? 'opacity-100 text-rose-400'
              : 'opacity-0 group-hover:opacity-100 text-white/70 hover:text-white'
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Title & Artist */}
      <div className="flex flex-col min-w-0">
        <h4
          className={`text-xs font-bold truncate leading-snug transition-colors ${
            isCurrent ? 'text-indigo-400' : 'text-white group-hover:text-indigo-200'
          }`}
        >
          {track.title}
        </h4>
        <p className="text-[11px] text-white/50 truncate mt-0.5">{track.artist}</p>
      </div>
    </div>
  )
}
