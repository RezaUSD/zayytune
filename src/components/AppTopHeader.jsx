import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ApiKeyModal from './ApiKeyModal'

export default function AppTopHeader() {
  const navigate = useNavigate()
  const { user, setIsAuthModalOpen, setAuthMode } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-3 bg-[#F7F4EB]/90 backdrop-blur-md border-b-2 border-[#141416] flex items-center justify-between gap-4 select-none">
        {/* 1. Brand Logo: ZayyTune */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {/* Logo icon */}
          <div className="w-9 h-9 rounded-xl bg-[#141416] flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px] text-white transition-transform duration-500 group-hover:rotate-180">
              graphic_eq
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#141416] font-sans leading-none">
              <span>Zayy</span><span className="font-semibold text-[#141416]/70">Tune</span><span className="text-[#2850ED]">.</span>
            </h1>
            <span className="hidden sm:inline-block bg-[#FFE043] text-[#141416] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider transform -rotate-6 border border-[#141416] shadow-[1px_1px_0px_#141416]">
              BETA
            </span>
          </div>
        </div>

        {/* 2. Middle & Right: Search, API Key & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-40 sm:w-48 md:w-64 hidden sm:block"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari lagu, artis..."
              className="w-full pl-4 pr-9 py-1.5 bg-white border-2 border-[#141416] rounded-full text-xs font-bold text-[#141416] placeholder-[#141416]/40 shadow-[2px_2px_0px_#141416] focus:outline-none focus:bg-[#FFFDE8] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#141416]/60 hover:text-[#141416] hover:scale-110 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>
          </form>

          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="sm:hidden p-2 rounded-full bg-white border-2 border-[#141416] shadow-[1.5px_1.5px_0px_#141416] text-[#141416] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Cari Musik"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
          </button>

          {/* Full Audio / API Key Button */}
          <button
            type="button"
            onClick={() => setIsApiKeyOpen(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFE043] border-2 border-[#141416] shadow-[1.5px_1.5px_0px_#141416] flex items-center justify-center text-[#141416] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Pengaturan Full Audio (YouTube API)"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">key</span>
          </button>

          {/* User Profile Avatar */}
          {user ? (
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 cursor-pointer group"
              title={user.name}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#141416] shadow-[1.5px_1.5px_0px_#141416] overflow-hidden bg-[#C5C1FF] group-hover:scale-105 transition-transform">
                <img
                  src={
                    user.avatar ||
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23FFE043'/><circle cx='50' cy='38' r='18' fill='%23141416'/><path d='M 22 84 C 22 64 78 64 78 84 Z' fill='%23141416'/></svg>"
                  }
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src =
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23FFE043'/><circle cx='50' cy='38' r='18' fill='%23141416'/><path d='M 22 84 C 22 64 78 64 78 84 Z' fill='%23141416'/></svg>"
                  }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthMode('login')
                setIsAuthModalOpen(true)
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#141416] shadow-[1.5px_1.5px_0px_#141416] overflow-hidden bg-[#C5C1FF] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              title="Masuk / Buat Akun"
            >
              <span className="material-symbols-outlined text-[18px] text-[#141416]">person</span>
            </button>
          )}
        </div>
      </header>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
      />
    </>
  )
}
