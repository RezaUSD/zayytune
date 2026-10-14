import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { useDeezerChart } from '../hooks/useDeezer'
import TrackRow from '../components/TrackRow'
import { DEFAULT_FALLBACK_COVER, getAestheticFallback } from '../services/imageHelper'

export default function PlaylistDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playlists, favorites } = useAuth()
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer()
  const { tracks: chartTracks } = useDeezerChart(30)

  // Resolve playlist metadata & tracks
  let playlist = null
  let tracks = []

  if (id === 'liked-songs') {
    playlist = {
      name: 'Lagu yang Disukai',
      description: 'Kumpulan seluruh lagu yang kamu beri tanda suka',
      coverUrl: getAestheticFallback('liked-songs'),
      gradient: 'from-indigo-600 via-purple-700 to-rose-600',
    }
    tracks = favorites
  } else if (id === 'chart') {
    playlist = {
      name: 'Global Top 50 Hits',
      description: 'Tangga musik global paling banyak diputar minggu ini',
      coverUrl: DEFAULT_FALLBACK_COVER,
      gradient: 'from-amber-600 via-rose-600 to-indigo-900',
    }
    tracks = chartTracks
  } else {
    playlist = playlists.find((p) => p.id === id)
    tracks = playlist?.tracks || []
  }

  if (!playlist) {
    return (
      <div className="p-12 text-center text-white/50">
        <h3 className="text-lg font-bold text-white mb-2">Playlist tidak ditemukan</h3>
        <button
          type="button"
          onClick={() => navigate('/library')}
          className="text-xs text-indigo-400 font-bold hover:underline"
        >
          Kembali ke Koleksi
        </button>
      </div>
    )
  }

  const isCurrentPlaylistPlaying =
    isPlaying && tracks.some((t) => (t.id || t.videoId) === (currentTrack?.id || currentTrack?.videoId))

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      if (isCurrentPlaylistPlaying) {
        togglePlay()
      } else {
        playTrack(tracks[0], tracks)
      }
    }
  }

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Big Hero Header */}
      <div
        className="p-6 sm:p-8 rounded-3xl bg-[#FF6D60] border-2 border-[#141416] flex flex-col sm:flex-row items-center sm:items-end gap-6 shadow-[4px_4px_0px_#141416] text-white"
      >
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-md bg-black/40 shrink-0 border-2 border-[#141416]">
          <img
            src={playlist.coverUrl || DEFAULT_FALLBACK_COVER}
            alt={playlist.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = getAestheticFallback(playlist.name)
            }}
          />
        </div>

        <div className="flex flex-col text-center sm:text-left min-w-0">
          <span className="neo-badge bg-[#FFE043] text-[#141416] text-[10px] px-3 py-0.5 self-center sm:self-start mb-2">
            PLAYLIST
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            {playlist.name}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl mt-1 font-bold">{playlist.description}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-xs text-white/80 font-mono font-bold">
            <span>{tracks.length} lagu</span>
            <span>•</span>
            <span>Kualitas Lossless Hi-Fi</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4 px-2">
        <button
          type="button"
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="w-13 h-13 rounded-full bg-[#141416] text-white border-2 border-[#141416] shadow-[2.5px_2.5px_0px_rgba(0,0,0,0.3)] flex items-center justify-center active:scale-90 hover:scale-105 transition-all cursor-pointer disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isCurrentPlaylistPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (tracks.length > 0) {
              const randomIdx = Math.floor(Math.random() * tracks.length)
              playTrack(tracks[randomIdx], tracks)
            }
          }}
          disabled={tracks.length === 0}
          className="p-2.5 rounded-full bg-white border-2 border-[#141416] shadow-[2px_2px_0px_#141416] text-[#141416] hover:bg-[#FFE043] transition-colors cursor-pointer disabled:opacity-40"
          title="Putar Acak"
        >
          <span className="material-symbols-outlined text-[20px]">shuffle</span>
        </button>
      </div>

      {/* Track List */}
      <div className="bg-white border-2 border-[#141416] shadow-[3.5px_3.5px_0px_#141416] rounded-3xl p-3 sm:p-4 space-y-1.5">
        {tracks.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-[#141416]/50">
            Belum ada lagu di dalam playlist ini. Cari lagu dan tambahkan ke sini!
          </div>
        ) : (
          tracks.map((track, idx) => (
            <TrackRow key={track.id || idx} track={track} index={idx} queue={tracks} />
          ))
        )}
      </div>
    </div>
  )
}
