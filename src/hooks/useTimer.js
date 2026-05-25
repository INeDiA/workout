import { useState, useEffect, useRef, useCallback } from 'react'

// Timer conto alla rovescia con vibrazione al termine
export function useTimer(defaultDuration = 90) {
  const [duration, setDuration] = useState(defaultDuration)
  const [remaining, setRemaining] = useState(defaultDuration)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  // Vibrazione al termine (pattern: 3 impulsi)
  const vibra = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 300])
    }
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setRunning(false)
            vibra()
            return duration
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, duration, vibra])

  const start = useCallback(() => {
    setRemaining(duration)
    setRunning(true)
  }, [duration])

  const pause = useCallback(() => setRunning(false), [])

  const reset = useCallback(() => {
    setRunning(false)
    setRemaining(duration)
  }, [duration])

  const changeDuration = useCallback((secs) => {
    setDuration(secs)
    setRemaining(secs)
    setRunning(false)
  }, [])

  return { remaining, running, duration, start, pause, reset, changeDuration }
}
