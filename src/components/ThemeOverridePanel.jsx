import React from 'react'

const PRESET_PALETTES = [
  { name: 'Deep Indigo Hi-Fi', accent: '#6366f1', accentSoft: '#4338ca' },
  { name: 'Electric Violet', accent: '#a855f7', accentSoft: '#7e22ce' },
  { name: 'Cyber Neon Cyan', accent: '#06b6d4', accentSoft: '#0891b2' },
  { name: 'Default Emerald Hi-Fi', accent: '#1ed760', accentSoft: '#10b981' },
  { name: 'Sunset Warm Amber', accent: '#f59e0b', accentSoft: '#d97706' },
  { name: 'Hot Magenta Pink', accent: '#ec4899', accentSoft: '#be185d' },
]

export default function ThemeOverridePanel({
  isOpen,
  onClose,
  customTheme,
  onSetCustom,
  onFollowMood,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl transition-all">
      <div
        className="w-full max-w-md glass-panel border border-white/20 rounded-3xl shadow-glass-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px]">palette</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Aksen Warna Glass
              </h3>
              <p className="text-[11px] text-white/50 font-medium">
                Pilih Aura Cahaya Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl glass-pill hover:bg-white/[0.15] text-white/70 hover:text-white flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-xs text-white/70 leading-relaxed font-medium">
            Ubah warna aksen pencahayaan 3D glass secara manual atau biarkan menyesuaikan atmosfer mood lagu secara otomatis.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {PRESET_PALETTES.map((p) => {
              const isSelected = customTheme?.accent === p.accent

              return (
                <button
                  key={p.name}
                  onClick={() => onSetCustom(p)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? 'border-primary/60 bg-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)] text-white'
                      : 'glass-card border-white/10 hover:border-white/25 text-white/70 hover:text-white'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-xl border border-white/30 shadow-md flex-shrink-0 transition-transform"
                    style={{
                      backgroundColor: p.accent,
                      boxShadow: `0 0 10px ${p.accent}66`,
                    }}
                  />
                  <span className="text-xs font-bold truncate">{p.name}</span>
                </button>
              )
            })}
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onFollowMood()
                onClose()
              }}
              className="flex-1 px-4 py-2.5 rounded-2xl glass-pill hover:bg-white/[0.12] text-white/80 hover:text-white text-xs font-bold tracking-wide transition-all"
              type="button"
            >
              Ikuti Mood Lagu
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary via-emerald-400 to-primary text-black font-extrabold text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--primary),0.35)]"
              type="button"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

