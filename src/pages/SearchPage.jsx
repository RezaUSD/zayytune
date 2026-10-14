import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useYouTubeSearch } from '../hooks/useYouTube'
import { useScrollReveal, useStaggerChildren } from '../hooks/useAnimations'
import { getTrackCover, handleImageFallback } from '../services/imageHelper'
import TrackRow from '../components/TrackRow'

const BROWSE_CATEGORIES = [
  { name: 'Pop & Viral', color: 'from-rose-500 to-pink-600', query: 'pop', icon: 'trending_up' },
  { name: 'Hip-Hop & R&B', color: 'from-orange-500 to-amber-600', query: 'hiphop', icon: 'mic' },
  { name: 'Indie & Alternative', color: 'from-emerald-500 to-teal-700', query: 'indie', icon: 'music_note' },
  { name: 'Rock & Metal', color: 'from-red-600 to-rose-900', query: 'rock', icon: 'electric_bolt' },
  { name: 'Electronic & Dance', color: 'from-indigo-500 to-cyan-600', query: 'edm', icon: 'equalizer' },
  { name: 'Lo-Fi Chill Beats', color: 'from-purple-600 to-indigo-800', query: 'lofi', icon: 'headphones' },
  { name: 'Acoustic & Folk', color: 'from-amber-600 to-yellow-700', query: 'acoustic', icon: 'piano' },
  { name: 'Jazz & Soul', color: 'from-sky-600 to-blue-800', query: 'jazz', icon: 'nightlife' },
  { name: 'K-Pop & Asian Hits', color: 'from-pink-500 to-rose-400', query: 'kpop', icon: 'star' },
  { name: 'Santai & Tidur', color: 'from-blue-700 to-indigo-950', query: 'sleep', icon: 'bedtime' },
  { name: 'Fokus & Belajar', color: 'from-teal-600 to-emerald-900', query: 'focus', icon: 'psychology' },
  { name: 'Workout & Fitness', color: 'from-red-500 to-orange-600', query: 'workout', icon: 'fitness_center' },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const { results, status, search } = useYouTubeSearch()

  // Animation hooks
  const headerReveal = useScrollReveal({ threshold: 0.1 })
  const resultsReveal = useScrollReveal({ threshold: 0.05 })
  const catHeaderReveal = useScrollReveal({ threshold: 0.1 })
  const catStagger = useStaggerChildren(BROWSE_CATEGORIES.length, 70)

  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery)
      search(initialQuery)
    }
  }, [initialQuery, search])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() })
      search(searchTerm.trim())
    }
  }

  const handleCategoryClick = (catQuery) => {
    setSearchTerm(catQuery)
    setSearchParams({ q: catQuery })
    search(catQuery)
  }

  return (
    <div className="space-y-6 pb-12 select-none page-enter">
      {/* Search Header */}
      <div ref={headerReveal.ref} className="space-y-3">
        <h2 className="text-2xl font-black text-[#141416] uppercase tracking-tight text-reveal">Cari Musik</h2>
        <p className="text-xs font-bold text-[#141416]/50 text-reveal-delay-1">Temukan lagu, artis, dan genre favoritmu</p>
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl text-reveal-delay-2">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#141416]/40">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (e.target.value.length >= 3) {
                search(e.target.value)
              }
            }}
            placeholder="Ketik judul lagu, musisi, atau genre..."
            className="w-full pl-11 pr-10 py-3 bg-white border-2 border-[#141416] rounded-2xl text-sm font-bold text-[#141416] placeholder-[#141416]/40 shadow-[3px_3px_0px_#141416] focus:outline-none focus:bg-[#FFFDE8] focus:shadow-[4px_4px_0px_#141416] transition-all duration-300"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setSearchParams({})
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#141416]/50 hover:text-[#141416] btn-spring"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </form>
      </div>

      {/* Results or Category Grid */}
      {searchTerm && results.length > 0 ? (
        <section ref={resultsReveal.ref} className={`space-y-4 reveal ${resultsReveal.isVisible ? 'visible' : ''}`}>
          <h3 className="text-lg font-black text-[#141416] flex items-center justify-between uppercase">
            <span>Hasil untuk &ldquo;{searchTerm}&rdquo;</span>
            <span className="text-xs text-[#141416]/50 font-mono font-bold normal-case">{results.length} hasil</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Top Result Featured Card */}
            <div className="lg:col-span-1 neo-card p-5 flex flex-col justify-between group">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#141416]/50 mb-3 block">
                  Hasil Teratas
                </span>
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#141416] shadow-[2px_2px_0px_#141416] mb-4 bg-gray-100">
                  <img
                    src={getTrackCover(results[0])}
                    alt={results[0].title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => handleImageFallback(e, results[0])}
                  />
                </div>
                <h4 className="text-xl font-black text-[#141416] uppercase truncate leading-snug">{results[0].title}</h4>
                <p className="text-xs font-bold text-[#141416]/60 mt-1">{results[0].artist}</p>
              </div>
            </div>

            {/* List Results */}
            <div className="lg:col-span-2 neo-card p-3 sm:p-4 space-y-1.5 !transform-none">
              {results.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} queue={results} />
              ))}
            </div>
          </div>
        </section>
      ) : searchTerm && status === 'loading' ? (
        <div className="p-12 text-center reveal visible">
          <span className="material-symbols-outlined text-[32px] text-[#141416]/30 animate-spin mb-2">
            progress_activity
          </span>
          <p className="text-sm font-bold text-[#141416]/50">Mencari lagu...</p>
        </div>
      ) : (
        /* Browse Categories Section — staggered 3D tilt cards */
        <section className="space-y-4">
          <div ref={catHeaderReveal.ref} className={`reveal-left ${catHeaderReveal.isVisible ? 'visible' : ''}`}>
            <h3 className="text-lg font-black text-[#141416] tracking-tight uppercase">Jelajahi Kategori</h3>
            <p className="text-xs font-bold text-[#141416]/50 mt-1">Pilih genre dan temukan musik baru</p>
          </div>

          <div ref={catStagger.parentRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {BROWSE_CATEGORIES.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => handleCategoryClick(cat.query)}
                className={`stagger-item ${catStagger.isChildVisible(idx) ? 'visible' : ''} tilt-card relative h-28 sm:h-32 rounded-2xl p-4 bg-gradient-to-br ${cat.color} border-2 border-[#141416] shadow-[3px_3px_0px_#141416] overflow-hidden cursor-pointer select-none group`}
              >
                <span className="text-sm sm:text-base font-black text-white tracking-tight leading-tight block max-w-[80%] drop-shadow-sm uppercase">
                  {cat.name}
                </span>
                <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-[56px] text-white/20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  {cat.icon}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
