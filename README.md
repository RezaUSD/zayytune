# ZayyTune 🎧

Aplikasi pemutar musik Hi-Fi modern dengan turntable deck visualizer real-time, lirik terintegrasi, dan audio mode mutakhir.

## Menjalankan project

### 1. Install dependencies
```bash
npm install
```

### 2. Siapkan Client ID Jamendo
Copy file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Lalu isi `VITE_JAMENDO_CLIENT_ID` dengan Client ID kamu sendiri (daftar gratis di https://devportal.jamendo.com/).

Untuk testing cepat tanpa daftar dulu, kamu bisa pakai client ID publik dari dokumentasi resmi Jamendo: `709fa152` — tapi ini shared dan bisa kena rate limit, jangan dipakai untuk demo final.

### 3. Jalankan development server
```bash
npm run dev
```
Buka browser ke alamat yang muncul di terminal (biasanya `http://localhost:5173`).

## Struktur project

```
src/
  moods.js                     -> definisi 4 mood, warna aksen, tag Jamendo
  App.jsx                      -> state utama (mood, playback, tema, favorit)
  hooks/
    useLocalStorage.js         -> persistensi preferensi (US-06)
    useAudioAnalyser.js        -> koneksi ke Web Audio API AnalyserNode
    useJamendo.js               -> fetch lagu by mood tag + search
  components/
    MoodSelect.jsx             -> layar pemilihan mood
    PlayerScreen.jsx           -> layar utama (hero + visualizer + layout)
    Visualizer.jsx             -> Canvas: radial pulse + gelombang halus
    PlaylistPanel.jsx          -> panel daftar lagu (kolom kanan)
    MiniPlayer.jsx             -> player mengambang dengan efek vinyl
    SearchPanel.jsx            -> modal pencarian lagu/artis
    ThemeOverridePanel.jsx     -> panel ganti tema manual
```

## Status fitur (sesuai MoSCoW di PRD)

- [x] Player inti (play/pause/skip)
- [x] Integrasi Jamendo API (katalog by mood + search)
- [x] Mood -> mapping tema warna (Deep Indigo base + aksen dinamis)
- [x] Visualizer audio real-time (Canvas + Web Audio API)
- [x] Pencarian lagu/artis
- [x] Custom theme override manual
- [x] Preferensi tersimpan di localStorage (mood terakhir, tema kustom, favorit)
- [ ] Antrean (queue) manual — saat ini next/prev otomatis mengikuti urutan playlist mood aktif
- [ ] Halaman Case Study di dalam app — bisa ditambahkan sebagai section baru nanti

## Catatan teknis

- **Visualizer** dibuat custom di atas Canvas API (bukan library instan) supaya warnanya benar-benar ikut token mood — lihat `src/components/Visualizer.jsx`.
- **AudioContext** butuh interaksi user sebelum bisa jalan (kebijakan browser modern) — makanya `resume()` dipanggil setiap kali user menekan tombol play.
- Kalau visualizer terasa berat di device lemah, kurangi `analyser.fftSize` di `useAudioAnalyser.js` (misal dari 256 ke 128).
