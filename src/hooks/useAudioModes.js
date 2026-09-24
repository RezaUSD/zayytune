import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export const LISTENING_MODES = [
  {
    id: 'original',
    name: 'Suara Asli',
    shortName: 'Suara Asli',
    icon: 'graphic_eq',
    badge: '1.0x Normal',
    badgeColor: 'border-rose-400/50 text-rose-300 bg-rose-500/15',
    description: 'Format rekaman asli studio dengan nada seimbang dan jernih tanpa manipulasi.',
    rate: 1.0,
    pitchShift: true,
    color: '#6366f1',
    accent: '#6366f1',
    accentContainer: '#4338ca',
    dspTag: 'DSP: DIRECT MASTER • 1.0x',
    energy: 'medium',
  },
  {
    id: 'slowed_reverb',
    name: 'Slowed & Lo-Fi',
    shortName: 'Slowed & Chill',
    icon: 'blur_on',
    badge: '0.85x Dreamy Pitch',
    badgeColor: 'border-indigo-400/50 text-indigo-300 bg-indigo-500/15',
    description: 'Tempo melambat santai (0.85x) dengan nada dalam & nuansa dreamy hangat.',
    rate: 0.85,
    pitchShift: false,
    color: '#818cf8',
    accent: '#818cf8',
    accentContainer: '#6366f1',
    dspTag: 'DSP: SLOWED & DAMPED • 0.85x',
    energy: 'low',
  },
  {
    id: 'sped_up',
    name: 'Sped Up (Party)',
    shortName: 'Sped Up',
    icon: 'bolt',
    badge: '1.22x Upbeat Party',
    badgeColor: 'border-amber-400/50 text-amber-300 bg-amber-500/15',
    description: 'Tempo dipercepat penuh energi (1.22x), ceria dan seru untuk bergoyang.',
    rate: 1.22,
    pitchShift: false,
    color: '#f59e0b',
    accent: '#f59e0b',
    accentContainer: '#d97706',
    dspTag: 'DSP: SPED UP PARTY • 1.22x',
    energy: 'high',
  },
  {
    id: 'nightcore',
    name: 'Nightcore Energy',
    shortName: 'Nightcore',
    icon: 'electric_bolt',
    badge: '1.32x Hyperbeat',
    badgeColor: 'border-violet-400/50 text-violet-300 bg-violet-500/15',
    description: 'Tempo 1.32x dengan vokal tinggi energik khas rave & electronic rave anime.',
    rate: 1.32,
    pitchShift: false,
    color: '#a855f7',
    accent: '#a855f7',
    accentContainer: '#7e22ce',
    dspTag: 'DSP: NIGHTCORE HYPER • 1.32x',
    energy: 'high',
  },
  {
    id: 'bass_boost',
    name: 'Bass Boost Drive',
    shortName: 'Bass Boost',
    icon: 'speaker',
    badge: '+8dB Sub-Bass',
    badgeColor: 'border-pink-400/50 text-pink-300 bg-pink-500/15',
    description: 'Hentakan frekuensi rendah dipompa kuat bertenaga untuk headphone & speaker.',
    rate: 1.02,
    pitchShift: true,
    color: '#fb7185',
    accent: '#fb7185',
    accentContainer: '#e11d48',
    dspTag: 'DSP: BASS DRIVE BOOST • 1.02x',
    energy: 'high',
  },
  {
    id: 'lofi_cafe',
    name: 'Lo-Fi Midnight',
    shortName: 'Lo-Fi Mellow',
    icon: 'coffee',
    badge: '0.88x Mellow Grain',
    badgeColor: 'border-teal-400/50 text-teal-300 bg-teal-500/15',
    description: 'Nuansa santai tengah malam tempo 0.88x dengan tekstur vinyl lembut & damai.',
    rate: 0.88,
    pitchShift: false,
    color: '#14b8a6',
    accent: '#14b8a6',
    accentContainer: '#0f766e',
    dspTag: 'DSP: LO-FI MIDNIGHT • 0.88x',
    energy: 'chill',
  },
  {
    id: 'vintage_vinyl',
    name: 'Vinyl Retro 70s',
    shortName: 'Retro 70s',
    icon: 'album',
    badge: '0.94x Analog Warmth',
    badgeColor: 'border-emerald-400/50 text-emerald-300 bg-emerald-500/15',
    description: 'Sensasi tempo hangat analog piringan hitam klasik era 70-an.',
    rate: 0.94,
    pitchShift: false,
    color: '#10b981',
    accent: '#10b981',
    accentContainer: '#059669',
    dspTag: 'DSP: WARM VINYL 70S • 0.94x',
    energy: 'chill',
  },
  {
    id: 'spatial_8d',
    name: '8D Spatial Audio',
    shortName: '8D Spatial',
    icon: 'headphones',
    badge: '360° Immersive',
    badgeColor: 'border-cyan-400/50 text-cyan-300 bg-cyan-500/15',
    description: 'Efek surround 3D imersif serasa panggung instrumen berputar di sekitar kepala.',
    rate: 1.0,
    pitchShift: true,
    color: '#06b6d4',
    accent: '#06b6d4',
    accentContainer: '#0891b2',
    dspTag: 'DSP: 3D SPATIAL FIELD • 360°',
    energy: 'medium',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Synth',
    shortName: 'Cyber Synth',
    icon: 'stadia_controller',
    badge: '1.12x Neon Pulse',
    badgeColor: 'border-fuchsia-400/50 text-fuchsia-300 bg-fuchsia-500/15',
    description: 'Tempo 1.12x dengan dorongan synthesizer tajam bertema neon futuristik.',
    rate: 1.12,
    pitchShift: false,
    color: '#d946ef',
    accent: '#d946ef',
    accentContainer: '#a21caf',
    dspTag: 'DSP: CYBERPUNK SYNTH • 1.12x',
    energy: 'high',
  },
]

export function getListeningModeById(id) {
  return LISTENING_MODES.find((m) => m.id === id) || LISTENING_MODES[0]
}

export function useAudioModes() {
  const [activeModeId, setActiveModeId] = useLocalStorage('timbre:listeningMode', 'original')

  const currentMode = getListeningModeById(activeModeId)

  const setMode = useCallback(
    (modeId) => {
      setActiveModeId(modeId)
    },
    [setActiveModeId]
  )

  // Sync mode effect with HTML5 audio and YouTube
  const syncPlaybackRate = useCallback(
    (audioEl, ytPlayer, currentTrack) => {
      const targetRate = currentMode.rate || 1.0
      const preservesPitch = currentMode.pitchShift !== false

      // For HTML5 Audio Element
      if (audioEl) {
        try {
          if ('preservesPitch' in audioEl) {
            audioEl.preservesPitch = preservesPitch
          }
          if ('mozPreservesPitch' in audioEl) {
            audioEl.mozPreservesPitch = preservesPitch
          }
          if ('webkitPreservesPitch' in audioEl) {
            audioEl.webkitPreservesPitch = preservesPitch
          }
          audioEl.playbackRate = targetRate
        } catch (e) {
          console.warn('Could not set HTML5 playbackRate:', e)
        }
      }

      // For YouTube IFrame Player
      if (ytPlayer && currentTrack?.youtubeId && ytPlayer.setPlaybackRate) {
        try {
          const ytRates = [0.5, 0.75, 1, 1.25, 1.5, 2]
          const closestYtRate = ytRates.reduce((prev, curr) =>
            Math.abs(curr - targetRate) < Math.abs(prev - targetRate) ? curr : prev
          )
          ytPlayer.setPlaybackRate(closestYtRate)
        } catch (e) {
          console.warn('Could not set YouTube playbackRate:', e)
        }
      }
    },
    [currentMode]
  )

  return {
    modes: LISTENING_MODES,
    currentMode,
    activeModeId,
    setMode,
    syncPlaybackRate,
  }
}
