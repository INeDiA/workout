import { useState, useEffect, useRef, useCallback } from 'react'

// Timer conto alla rovescia con vibrazione al termine.
// Il tempo residuo è sempre ricalcolato da un timestamp di fine (endTime) invece che
// decrementato tick-per-tick: così il countdown resta corretto anche se il browser
// sospende/rallenta il setInterval mentre l'app è in background (cambio app, schermo bloccato).
export function useTimer(defaultDuration = 90) {
  const [duration, setDuration] = useState(defaultDuration)
  const [remaining, setRemaining] = useState(defaultDuration)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const endTimeRef = useRef(null) // timestamp (ms) a cui il timer arriva a 0
  const firedRef = useRef(false) // evita di far vibrare due volte allo stesso arrivo a 0
  const runningRef = useRef(false)

  useEffect(() => { runningRef.current = running }, [running])

  // Vibrazione al termine (pattern: 3 impulsi)
  const vibra = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 300])
    }
  }, [])

  const tick = useCallback(() => {
    if (endTimeRef.current === null) return
    const secsLeft = Math.ceil((endTimeRef.current - Date.now()) / 1000)
    if (secsLeft <= 0) {
      if (!firedRef.current) {
        firedRef.current = true
        endTimeRef.current = null
        setRunning(false)
        setRemaining(duration)
        vibra()
      }
      return
    }
    setRemaining(secsLeft)
  }, [duration, vibra])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, tick])

  // Ricalcola subito il tempo residuo quando l'app torna in primo piano,
  // senza aspettare il prossimo tick dell'interval (che sui mobile può tardare).
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'visible' && runningRef.current) tick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [tick])

  const start = useCallback(() => {
    endTimeRef.current = Date.now() + duration * 1000
    firedRef.current = false
    setRemaining(duration)
    setRunning(true)
  }, [duration])

  const pause = useCallback(() => {
    setRunning(false)
    endTimeRef.current = null
  }, [])

  const reset = useCallback(() => {
    setRunning(false)
    endTimeRef.current = null
    setRemaining(duration)
  }, [duration])

  const changeDuration = useCallback((secs) => {
    setDuration(secs)
    setRemaining(secs)
    setRunning(false)
    endTimeRef.current = null
  }, [])

  return { remaining, running, duration, start, pause, reset, changeDuration }
}
