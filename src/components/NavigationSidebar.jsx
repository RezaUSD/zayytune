import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavigationSidebar({ onOpenCreatePlaylist }) {
  const navigate = useNavigate()
  const { playlists, favorites } = useAuth()

  const navItems = [
    { label: 'Beranda', to: '/', icon: 'home' },
    { label: 'Cari', to: '/search', icon: 'search' },
    { label: 'Koleksi', to: '/library', icon: 'library_music' },
    { label: 'Disukai', to: '/playlist/liked-songs', icon: 'favorite', count: favorites.length },
  ]

  return (
    <aside className="w-52 flex-shrink-0 hidden lg:flex flex-col justify-between bg-[#F7F4EB] border-r-2 border-[#141416] p-4 select-none h-screen sticky top-0 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-5">
        {/* Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group px-1 pt-1"
        >
          <div className="w-8 h-8 rounded-lg bg-[#141416] flex items-center justify-center group-hover:scale-105 transition-transform shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.15)]">
            <span className="material-symbols-outlined text-[16px] text-white transition-transform duration-500 group-hover:rotate-180">
              graphic_eq
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black tracking-tight text-[#141416] leading-none">
              Zayy<span className="font-semibold text-[#141416]/70">Tune</span><span className="text-[#2850ED]">.</span>
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#141416]/40 px-3 mb-1">
            MENU
          </span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                  isActive
                    ? 'bg-[#FFE043] border-[#141416] text-[#141416] shadow-[2px_2px_0px_#141416] font-black'
                    : 'border-transparent text-[#141416]/60 hover:text-[#141416] hover:bg-white hover:border-[#141416]/20'
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="material-symbols-outlined text-[19px] shrink-0"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-[10px] font-black bg-[#FF6D60] text-white px-1.5 py-0.5 rounded-full border border-[#141416] leading-none">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Playlists Section */}
        <div className="pt-2 border-t-2 border-[#141416]/10">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#141416]/40">
              PLAYLIST
            </span>
            <button
              type="button"
              onClick={onOpenCreatePlaylist}
              className="p-1 rounded-lg border border-[#141416]/30 bg-white text-[#141416] hover:bg-[#FFE043] hover:border-[#141416] shadow-[1px_1px_0px_rgba(0,0,0,0.1)] active:scale-90 transition-all cursor-pointer"
              title="Buat Playlist Baru"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar">
            {playlists.length === 0 ? (
              <button
                type="button"
                onClick={onOpenCreatePlaylist}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border-2 border-dashed border-[#141416]/20 text-[#141416]/50 hover:text-[#141416] hover:border-[#141416]/40 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[15px]">add_box</span>
                <span>Buat Playlist Baru</span>
              </button>
            ) : (
              playlists.map((pl) => (
                <NavLink
                  key={pl.id}
                  to={`/playlist/${pl.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold truncate transition-all border ${
                      isActive
                        ? 'bg-white border-[#141416] text-[#141416] shadow-[1.5px_1.5px_0px_#141416]'
                        : 'border-transparent text-[#141416]/60 hover:text-[#141416] hover:bg-white/60'
                    }`
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2850ED] shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </NavLink>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Explore Button */}
      <div className="pt-3">
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="w-full neo-btn bg-white hover:bg-[#98E8CE] text-[#141416] text-xs font-black py-2 px-3 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">explore</span>
          <span>Jelajahi Musik</span>
        </button>
      </div>
    </aside>
  )
}
