import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import NavigationSidebar from '../components/NavigationSidebar'
import AppTopHeader from '../components/AppTopHeader'
import DesktopPlayerPanel from '../components/DesktopPlayerPanel'
import SpotifyPlayerBar from '../components/SpotifyPlayerBar'
import MobileBottomNav from '../components/MobileBottomNav'
import MobileNowPlayingModal from '../components/MobileNowPlayingModal'
import AuthModal from '../components/AuthModal'
import CreatePlaylistModal from '../components/CreatePlaylistModal'
import SyncedLyricsModal from '../components/SyncedLyricsModal'

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    isRepeat,
    queue,
    isMobileNowPlayingOpen,
    setIsMobileNowPlayingOpen,
    isLyricsModalOpen,
    setIsLyricsModalOpen,
    activeListeningModeId,
    setActiveListeningModeId,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    playTrack,
  } = usePlayer()

  const { favorites, isFavorite, toggleFavorite } = useAuth()
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false)

  // Derive mobile tab from pathname
  const getActiveTab = () => {
    if (location.pathname === '/search') return 'search'
    if (location.pathname.startsWith('/library') || location.pathname.startsWith('/playlist'))
      return 'library'
    return 'home'
  }

  const handleMobileTabSelect = (tab) => {
    if (tab === 'home') navigate('/')
    else if (tab === 'search') navigate('/search')
    else if (tab === 'library') navigate('/library')
  }

  return (
    <div className="flex h-screen w-full bg-[#F7F4EB] text-[#141416] overflow-hidden font-sans">
      {/* 1. Desktop & Laptop Sidebar (Left) */}
      <NavigationSidebar onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)} />

      {/* 2. Main Content Viewport (Center) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <AppTopHeader />

        {/* Scrollable Page Body with padding for Player & Nav */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 pt-4 pb-44 lg:pb-16 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 3. Dedicated Right Studio Player Card when not on Home */}
      {location.pathname !== '/' && <DesktopPlayerPanel />}

      {/* 4. Persistent Player Bar for screens < xl (Desktop < 1280px & Mobile Floating Mini Player) */}
      <SpotifyPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onNext={nextTrack}
        onPrev={prevTrack}
        isShuffle={isShuffle}
        onToggleShuffle={toggleShuffle}
        isRepeat={isRepeat}
        onToggleRepeat={toggleRepeat}
        isFavorite={currentTrack ? isFavorite(currentTrack) : false}
        onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack)}
        currentTime={currentTime}
        duration={duration}
        onSeek={seek}
        volume={volume}
        onVolumeChange={setVolume}
        activeListeningModeId={activeListeningModeId}
        onOpenNowPlaying={() => setIsMobileNowPlayingOpen(true)}
      />

      {/* 5. Mobile Bottom Navigation (screens < lg) */}
      <MobileBottomNav
        activeTab={isMobileNowPlayingOpen ? 'player' : getActiveTab()}
        onSelectTab={(tab) => {
          if (tab === 'player') {
            setIsMobileNowPlayingOpen(true)
          } else {
            handleMobileTabSelect(tab)
          }
        }}
        favoritesCount={favorites.length}
        hasActiveTrack={Boolean(currentTrack)}
        isPlaying={isPlaying}
        currentTrack={currentTrack}
      />

      {/* 6. Mobile / Expanded Fullscreen Now Playing Modal */}
      <MobileNowPlayingModal
        isOpen={isMobileNowPlayingOpen}
        onClose={() => setIsMobileNowPlayingOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onNext={nextTrack}
        onPrev={prevTrack}
        isShuffle={isShuffle}
        onToggleShuffle={toggleShuffle}
        isRepeat={isRepeat}
        onToggleRepeat={toggleRepeat}
        isFavorite={currentTrack ? isFavorite(currentTrack) : false}
        onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack)}
        currentTime={currentTime}
        duration={duration}
        onSeek={seek}
        activeListeningModeId={activeListeningModeId}
        onSelectListeningMode={setActiveListeningModeId}
        tracks={queue}
        onSelectTrack={(t) => playTrack(t, queue)}
      />

      {/* 7. Modals */}
      <SyncedLyricsModal
        isOpen={isLyricsModalOpen}
        onClose={() => setIsLyricsModalOpen(false)}
      />
      <AuthModal />
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />
    </div>
  )
}
