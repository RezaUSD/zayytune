import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { DEFAULT_FALLBACK_COVER, getAestheticFallback } from '../services/imageHelper'

const AuthContext = createContext(null)

const STORAGE_KEY_USER = 'timbre:auth:user'
const STORAGE_KEY_PLAYLISTS = 'timbre:auth:playlists'
const STORAGE_KEY_FAVORITES = 'timbre:auth:favorites'
const STORAGE_KEY_HISTORY = 'timbre:auth:history'

export function AuthProvider({ children }) {
  // User session (null = guest)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Auth modal toggle
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'register'

  // User's custom playlists
  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYLISTS)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return [
      {
        id: 'pl-favorites',
        name: 'Lagu yang Disukai',
        description: 'Kumpulan lagu favorit kamu',
        coverUrl: getAestheticFallback('favorites'),
        isDefaultFavorites: true,
        tracks: [],
      },
      {
        id: 'pl-chill-mix',
        name: 'Late Night Chill',
        description: 'Vibes santai untuk malam hari',
        coverUrl: getAestheticFallback('chill'),
        tracks: [],
      },
    ]
  })

  // User's liked track objects
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // User's listening history
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY_USER)
    }
  }, [user])

  // Persist playlists
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(playlists))
  }, [playlists])

  // Persist favorites
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites))
  }, [favorites])

  // Persist history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 50)))
  }, [history])

  // Login handler
  const login = (email, password) => {
    if (!email) {
      toast.error('Masukkan email yang valid')
      return false
    }
    const username = email.split('@')[0] || 'Music Explorer'
    const newUser = {
      id: 'usr_' + Date.now(),
      name: username.charAt(0).toUpperCase() + username.slice(1),
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      role: 'Premium Member',
      joinedAt: new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
    }
    setUser(newUser)
    setIsAuthModalOpen(false)
    toast.success(`Selamat datang kembali, ${newUser.name}!`)
    return true
  }

  // Register handler
  const register = (name, email, password) => {
    if (!email || !name) {
      toast.error('Lengkapi nama dan email')
      return false
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      role: 'Free Plan',
      joinedAt: new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
    }
    setUser(newUser)
    setIsAuthModalOpen(false)
    toast.success(`Akun berhasil dibuat! Halo ${name}`)
    return true
  }

  // Logout handler
  const logout = () => {
    setUser(null)
    toast.info('Kamu telah keluar dari akun')
  }

  // Toggle favorite track
  const toggleFavorite = (track) => {
    if (!track) return
    const id = track.id || track.videoId
    setFavorites((prev) => {
      const exists = prev.some((t) => (t.id || t.videoId) === id)
      let next
      if (exists) {
        next = prev.filter((t) => (t.id || t.videoId) !== id)
        toast.info(`Dihapus dari Lagu Favorit`)
      } else {
        next = [track, ...prev]
        toast.success(`Ditambahkan ke Lagu Favorit`)
      }
      return next
    })
  }

  const isFavorite = (track) => {
    if (!track) return false
    const id = track.id || track.videoId
    return favorites.some((t) => (t.id || t.videoId) === id)
  }

  // Create new custom playlist
  const createPlaylist = (name, description = '') => {
    if (!name.trim()) {
      toast.error('Beri nama playlist terlebih dahulu')
      return null
    }
    const newPl = {
      id: 'pl_' + Date.now(),
      name: name.trim(),
      description: description.trim() || 'Dibuat oleh ' + (user?.name || 'Kamu'),
      coverUrl: getAestheticFallback(name.trim()),
      tracks: [],
      createdAt: new Date().toISOString(),
    }
    setPlaylists((prev) => [newPl, ...prev])
    toast.success(`Playlist "${newPl.name}" berhasil dibuat!`)
    return newPl
  }

  // Add track to existing playlist
  const addTrackToPlaylist = (playlistId, track) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          const trackId = track.id || track.videoId
          if (pl.tracks.some((t) => (t.id || t.videoId) === trackId)) {
            toast.info(`Lagu sudah ada di playlist ${pl.name}`)
            return pl
          }
          toast.success(`Ditambahkan ke playlist "${pl.name}"`)
          return {
            ...pl,
            tracks: [track, ...pl.tracks],
          }
        }
        return pl
      })
    )
  }

  // Record playback history
  const addToHistory = (track) => {
    if (!track) return
    const id = track.id || track.videoId
    setHistory((prev) => {
      const filtered = prev.filter((t) => (t.id || t.videoId) !== id)
      return [track, ...filtered].slice(0, 50)
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        login,
        register,
        logout,
        playlists,
        favorites,
        history,
        toggleFavorite,
        isFavorite,
        createPlaylist,
        addTrackToPlaylist,
        addToHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
