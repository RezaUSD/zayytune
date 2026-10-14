import React from 'react'

export default function MobileBottomNav({
  activeTab = 'home',
  onSelectTab,
  favoritesCount = 0,
  hasActiveTrack = false,
  isPlaying = false,
  currentTrack = null,
}) {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Beranda', color: 'bg-[#FFE043]' },
    { id: 'search', icon: 'search', label: 'Cari', color: 'bg-[#98E8CE]' },
    { id: 'library', icon: 'library_music', label: 'Koleksi', color: 'bg-[#C5C1FF]' },
  ]

  // Tampilkan tab "Diputar" saat lagu sedang aktif / diputar
  if (hasActiveTrack || currentTrack) {
    tabs.push({
      id: 'player',
      icon: isPlaying ? 'equalizer' : 'play_circle',
      label: 'Diputar',
      color: 'bg-[#FF6D60]',
      isPlayer: true,
    })
  }

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#F7F4EB]/95 backdrop-blur-md border-t-2 border-[#141416] px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-3px_0px_#141416]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer border-2 btn-spring ${
                isSelected
                  ? `${tab.color} border-[#141416] shadow-[2px_2px_0px_#141416] text-[#141416]`
                  : 'border-transparent text-[#141416]/50 hover:text-[#141416]'
              }`}
            >
              <div className="relative">
                {tab.isPlayer && isPlaying ? (
                  <div className="flex items-end justify-center gap-0.5 h-[20px] w-[20px]">
                    <span className="w-1 bg-[#141416] rounded-full wave-bar-1 h-3.5" />
                    <span className="w-1 bg-[#141416] rounded-full wave-bar-2 h-4.5" />
                    <span className="w-1 bg-[#141416] rounded-full wave-bar-3 h-2.5" />
                  </div>
                ) : (
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {tab.icon}
                  </span>
                )}

                {tab.id === 'library' && favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-2.5 px-1 min-w-[14px] h-3.5 rounded-full bg-[#FF6D60] text-white font-mono text-[8px] font-black flex items-center justify-center border border-[#141416] leading-none">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider leading-tight">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
