import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import AppLayout from './layouts/AppLayout'

import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import LibraryPage from './pages/LibraryPage'
import PlaylistDetailPage from './pages/PlaylistDetailPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: '#161722',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderRadius: '16px',
                fontSize: '12px',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="playlist/:id" element={<PlaylistDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
