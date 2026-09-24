import React from 'react'

export default function CaseStudyModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0d1b]/85 backdrop-blur-md overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-surface-container-low border border-surface-container-high/80 rounded-[4px] shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-surface-container-high/60 flex items-center justify-between bg-surface-container-low/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[22px]">auto_stories</span>
            <div>
              <h2 className="font-headline-sm text-lg text-on-surface font-serif">Timbre: Product & Tech Case Study</h2>
              <p className="font-metric-mono text-outline text-[11px] uppercase tracking-wider">
                PRD v1.0 • Technical Architecture & Design Decisions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[3px] border border-surface-container-high text-outline hover:text-on-surface hover:border-primary/40 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[72vh] flex flex-col gap-6 text-on-surface-variant font-body-md text-[13.5px] leading-relaxed">
          {/* Executive Summary */}
          <div>
            <span className="font-metric-mono text-primary text-[11px] uppercase tracking-widest block mb-1">
              01 // Latar Belakang & Masalah
            </span>
            <p className="text-on-surface">
              Aplikasi pemutar musik portofolio umumnya meniru UI Spotify secara generik. Timbre membedakan diri lewat dua pilar utama:
              <strong> adaptasi tema visual dinamis berbasis mood</strong> dan <strong>visualizer audio real-time reaktif terhadap frekuensi Web Audio API</strong> tanpa menggunakan foto manusia, melainkan geometri akustik presisi studio.
            </p>
          </div>

          {/* Architecture */}
          <div className="p-4 rounded-[3px] bg-surface-container-lowest border border-surface-container-high/60 flex flex-col gap-3">
            <span className="font-metric-mono text-secondary text-[11px] uppercase tracking-widest">
              02 // Arsitektur Audio & Web Audio API
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] font-metric-mono">
              <div className="p-3 bg-surface-container-low rounded-[2px] border border-surface-container-high/40">
                <span className="text-primary font-semibold block mb-1">AnalyserNode Engine</span>
                <span>FFT Size: 256<br />Smoothing: 0.8<br />FrequencyBins: 128</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-[2px] border border-surface-container-high/40">
                <span className="text-secondary font-semibold block mb-1">Rendering Loop</span>
                <span>requestAnimationFrame<br />Canvas 2D Dual-Layer<br />Stable 60+ FPS</span>
              </div>
            </div>
          </div>

          {/* Design Token Rules */}
          <div>
            <span className="font-metric-mono text-primary text-[11px] uppercase tracking-widest block mb-1">
              03 // Aturan Desain: Deep Indigo & Studio Aesthetic
            </span>
            <ul className="list-disc list-inside space-y-1.5 text-on-surface-variant/90 pl-1">
              <li><strong>Radius Sudut 2px - 4px:</strong> Menolak estetika pill / rounded-full modern yang generik untuk menghadirkan nuansa instrumen perangkat keras audio profesional (*studio hardware console*).</li>
              <li><strong>Tanpa Foto Wajah/Manusia:</strong> Seluruh artwork menggunakan gelombang sinusoidal, cincin resonansi konsentris, dan piringan vinyl minimalis.</li>
              <li><strong>Pencahayaan Atmosferik:</strong> Gradien ungu-indigo gelap dengan aksen lavender `#cabeff`, cyan, dan warm amber adaptif sesuai mood.</li>
            </ul>
          </div>

          {/* MoSCoW Prioritization */}
          <div>
            <span className="font-metric-mono text-primary text-[11px] uppercase tracking-widest block mb-2">
              04 // Ruang Lingkup MoSCoW (PRD Sesi 6)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11.5px]">
              <div className="p-2.5 rounded-[2px] bg-primary/10 border border-primary/30">
                <span className="font-metric-mono text-primary font-bold block">MUST</span>
                <span className="text-on-surface-variant text-[11px]">Player Inti, Web Audio Visualizer, Jamendo Integration</span>
              </div>
              <div className="p-2.5 rounded-[2px] bg-secondary/10 border border-secondary/30">
                <span className="font-metric-mono text-secondary font-bold block">SHOULD</span>
                <span className="text-on-surface-variant text-[11px]">Theme Override, Antrean, Case Study In-App</span>
              </div>
              <div className="p-2.5 rounded-[2px] bg-surface-container-high/30 border border-surface-container-high">
                <span className="font-metric-mono text-outline font-bold block">COULD</span>
                <span className="text-on-surface-variant text-[11px]">Preset Visualizer Tambahan, Lirik Sinkron</span>
              </div>
              <div className="p-2.5 rounded-[2px] bg-surface-container-high/15 border border-surface-container-high/30">
                <span className="font-metric-mono text-outline font-bold block">WON'T (MVP)</span>
                <span className="text-on-surface-variant text-[11px]">Akun User Backend, Aplikasi Mobile Native</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-container-high/60 flex items-center justify-between bg-surface-container-low/95">
          <span className="font-metric-mono text-[11px] text-outline">
            Timbre Audio Project • Portfolio Ready
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[3px] bg-primary text-on-primary font-title-md text-[13px] hover:bg-primary-fixed transition-all"
          >
            Tutup Studi Kasus
          </button>
        </div>
      </div>
    </div>
  )
}
