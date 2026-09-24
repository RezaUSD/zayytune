# ZayyTune 🎧 — Modern Hi-Fi Turntable Deck & Music Web App

<p align="center">
  <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80" alt="ZayyTune Banner" width="100%" style="border-radius: 16px; max-height: 380px; object-fit: cover;" />
</p>

<p align="center">
  <strong>Pengalaman mendengarkan musik analog modern dengan turntable piringan hitam interaktif, lirik karaoke tersinkronisasi, dan pemutar audio berkualitas studio.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Web_Audio_API-DSP-FF4081?style=for-the-badge&logo=soundcharts&logoColor=white" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/Responsive-Mobile_Ready-10B981?style=for-the-badge&logo=pwa&logoColor=white" alt="Mobile Ready" />
</p>

---

## ✨ Fitur Unggulan

### 🎛️ 1. Skeuomorphic Turntable Vinyl Deck
* **Piringan Hitam Interaktif**: Animasi rotasi vinyl berbasis GPU yang berputar halus saat musik berjalan.
* **Pengaturan Kecepatan RPM**: Pilihan kecepatan putar `33 ⅓ RPM` (standar album LP) dan `45 RPM` (Single/Maxi).
* **Tuas Jarum Presisi (*Chrome Tonearm*)**: Visualisasi lengan jarum *Ortofon* yang bergerak dinamis mengikuti alur lagu (*lead-in* ke *runout groove*).

### 🔊 2. Tiga Mode Mendengarkan Studio (*Listening Modes*)
* **Original Hi-Fi**: Suara jernih standar rekaman studio asli (*flat curve*).
* **Slowed + Reverb**: Efek tempo melambat (*0.88x*) dengan dimensi reverb yang estetik dan menenangkan.
* **Bass Boost**: Penguatan frekuensi rendah (*low-end punch*) untuk dentuman bass yang bertenaga.

### 🎶 3. Pemutar Lagu Penuh Otomatis (*Full-Length Engine*)
* **Katalog Billboard & Hits Global**: Mengambil metadata, artis, dan cover art beresolusi tinggi langsung dari Deezer API tanpa perlu login.
* **YouTube Background Resolver**: Otomatis me-resolve dan memutar lagu versi **penuh (full duration)** di latar belakang.
* **Bebas Hambatan (*Zero Friction*)**: Pengguna tidak perlu mendaftar, login akun, atau menyiapkan API Key untuk langsung memutar lagu.

### 🎤 4. Lirik Karaoke Real-Time (*Synced Lyrics*)
* **Live Line-by-Line Lyrics**: Sinkronisasi lirik kata per kata secara otomatis dari arsip LRCLIB.
* **Lirik Interaktif**: Klik pada baris lirik mana pun untuk langsung melompat (*seek*) ke bagian menit lagu tersebut.

### 📱 5. Desain 100% Responsif & Mobile-First
* **Mobile Slide-up Sheets**: Antrean lagu (*Queue*) dan lirik (*Lyrics*) meluncur mulus dari bawah layar HP layaknya Apple Music dan Spotify.
* **Touch-Friendly Scrubber & Chips**: Pilihan audio mode dapat digeser (*horizontal scroll*) dengan sentuhan jari.
* **Dynamic Viewport Height (`100dvh`)**: Tampilan stabil dan tidak terpotong saat address bar browser mobile muncul atau hilang.

### 💾 6. Penyimpanan Lokal (*Offline-Safe Favorites*)
* Tandai lagu favorit dengan ikon hati (❤️).
* Data lagu favorit, level volume, dan preferensi tersimpan secara privat di browser masing-masing menggunakan `localStorage`.

---

## 🚀 Panduan Memulai Cepat

### Prasyarat
Pastikan Anda telah menginstal **Node.js** (versi 18 ke atas) di perangkat Anda.

### 1. Clone Repositori
```bash
git clone https://github.com/RezaUSD/zayytune.git
cd zayytune
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Buka browser ke alamat yang ditampilkan di terminal (default: `http://localhost:5173`).

### 4. Build untuk Produksi
```bash
npm run build
```

---

## ⌨️ Pintasan Keyboard (*Shortcuts*)

| Tombol | Fungsi |
| :--- | :--- |
| <kbd>Spasi</kbd> | Putar / Jeda musik (*Play / Pause*) |
| <kbd>/</kbd> atau <kbd>Ctrl</kbd> + <kbd>K</kbd> | Buka panel pencarian lagu & artis |
| <kbd>Esc</kbd> | Menutup modal pencarian atau popup yang terbuka |

---

## 📂 Struktur Proyek

```text
zayytune/
├── public/                 # Aset statis & audio fallback
├── src/
│   ├── components/         # Komponen UI Modular
│   │   ├── Header.jsx              # Navbar atas, logo ZayyTune & search trigger
│   │   ├── MasterDeckHero.jsx      # Turntable deck, tonearm, lirik & mobile layout
│   │   ├── SpotifyPlayerBar.jsx    # Player bar bawah persisten dengan scrubber & kontrol
│   │   ├── PlaylistPanel.jsx       # Panel tabel daftar putar lagu
│   │   ├── SearchPanel.jsx         # Modal pencarian lagu YouTube & Deezer
│   │   ├── Sidebar.jsx             # Navigasi samping
│   │   ├── ThemeOverridePanel.jsx  # Palet kustomisasi tema
│   │   └── ApiKeyModal.jsx         # Konfigurasi opsional API eksternal
│   ├── hooks/              # Custom React Hooks
│   │   ├── useAudioAnalyser.js     # Web Audio API AnalyserNode
│   │   ├── useAudioModes.js        # Engine Slowed + Reverb & Bass Boost
│   │   ├── useDeezer.js            # Fetcher chart musik Deezer
│   │   ├── useJamendo.js           # Fetcher katalog Jamendo (opsional)
│   │   ├── useLocalStorage.js      # Persistensi preferensi & favorit
│   │   └── useYouTubePlayer.js     # Engine pemutar background YouTube
│   ├── services/           # Service & Integrasi API
│   │   ├── deezerApi.js            # Deezer endpoints & auto-resolver
│   │   ├── lyricsApi.js            # Sinkronisasi lirik via LRCLIB
│   │   └── youtubeSearch.js        # Pencarian katalog YouTube
│   ├── styles/
│   │   └── global.css              # Custom styling, animasi rotasi vinyl & glow
│   ├── App.jsx             # Komponen inti & orkestrasi pemutar musik
│   ├── main.jsx            # Entry point aplikasi React
│   └── moods.js            # Konfigurasi preset tema & mood audio
├── index.html              # HTML template dengan import font Syne & Material Symbols
├── tailwind.config.js      # Konfigurasi tema warna Deep Indigo & breakpoint
└── vite.config.js          # Konfigurasi Vite & proxy middleware pencarian lagu
```

---

## 🛠️ Teknologi yang Digunakan

* **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan palet warna Deep Indigo & Glassmorphism
* **Audio Engine**: Web Audio API (AnalyserNode, BiquadFilterNode, ConvolverNode)
* **API Penyedia Musik**: Deezer API, YouTube Audio Stream Engine
* **API Lirik**: [LRCLIB](https://lrclib.net/) (Sinkronisasi lirik real-time)
* **Notifikasi**: [Sonner](https://sonner.emilkowal.ski/)
* **Ikon**: Google Material Symbols Outlined

---

## 📄 Lisensi

Proyek ini dikembangkan di bawah lisensi [MIT](LICENSE). Silakan gunakan dan kembangkan untuk kebutuhan pribadi maupun portofolio Anda.
