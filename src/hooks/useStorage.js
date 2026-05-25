import { useState, useEffect } from 'react'

// Hook generico per sincronizzare stato React con localStorage
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage pieno o non disponibile (modalità privata)
    }
  }, [key, value])

  return [value, setValue]
}
