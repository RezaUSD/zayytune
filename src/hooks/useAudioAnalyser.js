import { useEffect, useRef } from 'react'

// Menghubungkan elemen <audio> ke Web Audio API AnalyserNode.
// Mengembalikan sebuah ref berisi fungsi getData() yang bisa dipanggil
// tiap frame animasi (lihat Visualizer.jsx) untuk ambil data frekuensi terbaru.
export function useAudioAnalyser(audioRef) {
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const audioCtxRef = useRef(null)
  const sourceRef = useRef(null)

  const timeDataArrayRef = useRef(null)

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    let audioCtx = audioCtxRef.current
    if (!audioCtx || audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return
      audioCtx = new AudioContextClass()
      audioCtxRef.current = audioCtx
    }

    if (!analyserRef.current) {
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.75
      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      timeDataArrayRef.current = new Uint8Array(analyser.fftSize)
    }

    if (!sourceRef.current) {
      try {
        const source = audioCtx.createMediaElementSource(audioEl)
        source.connect(analyserRef.current)
        analyserRef.current.connect(audioCtx.destination)
        sourceRef.current = source
      } catch (e) {
        console.warn('Audio analyser node connection warning:', e)
      }
    }
  }, [audioRef])

  function resume() {
    // Browser modern butuh interaksi user sebelum AudioContext bisa jalan.
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {})
    }
  }

  function getFrequencyData() {
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    if (!analyser || !dataArray) return null
    analyser.getByteFrequencyData(dataArray)
    return dataArray
  }

  function getTimeDomainData() {
    const analyser = analyserRef.current
    const timeArray = timeDataArrayRef.current
    if (!analyser || !timeArray) return null
    analyser.getByteTimeDomainData(timeArray)
    return timeArray
  }

  return { getFrequencyData, getTimeDomainData, resume }
}
