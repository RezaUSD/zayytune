import { useEffect, useState } from 'react'

// Hook generik untuk state yang otomatis tersimpan ke localStorage.
// Dipakai untuk: lastMood, customTheme, volume, queue (lihat App.jsx)
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage penuh/diblokir — abaikan, aplikasi tetap jalan tanpa persistensi
    }
  }, [key, value])

  return [value, setValue]
}
