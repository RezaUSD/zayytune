import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function CreatePlaylistModal({ isOpen, onClose }) {
  const { createPlaylist } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    createPlaylist(name, description)
    setName('')
    setDescription('')
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md p-6 bg-[#141522] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400">queue_music</span>
              Buat Playlist Baru
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                Nama Playlist
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Lagu Pengantar Tidur / Workout Beat"
                className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                Deskripsi (Opsional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan catatan atau suasana musik..."
                className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-400 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
              >
                Simpan Playlist
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
