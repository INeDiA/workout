import { useState, useEffect } from 'react'

let _deferred = null
const _subs = new Set()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    _deferred = e
    _subs.forEach((cb) => cb(_deferred))
  })
  window.addEventListener('appinstalled', () => {
    _deferred = null
    _subs.forEach((cb) => cb(null))
  })
}

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState(_deferred)

  useEffect(() => {
    _subs.add(setPrompt)
    return () => _subs.delete(setPrompt)
  }, [])

  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true

  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  async function triggerInstall() {
    if (!prompt) return false
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      _deferred = null
      setPrompt(null)
    }
    return outcome === 'accepted'
  }

  return { prompt, isInstalled, isInstallable: !!prompt, isIOS, triggerInstall }
}
