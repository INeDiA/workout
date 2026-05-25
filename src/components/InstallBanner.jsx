import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

// Banner "Aggiungi alla Home Screen" — visibile solo la prima volta
export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Già ignorato in precedenza
    if (localStorage.getItem('sm_install_dismissed') === 'true') return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function installa() {
    deferredPrompt?.prompt()
    deferredPrompt?.userChoice.then(() => setVisible(false))
  }

  function nascondi() {
    setVisible(false)
    localStorage.setItem('sm_install_dismissed', 'true')
  }

  if (!visible) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-950 border border-blue-700 rounded-2xl p-4 flex items-center gap-3 shadow-2xl animate-slide-down">
      <div className="w-9 h-9 bg-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
        <Download size={18} className="text-blue-200" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">Aggiungi alla Home Screen</p>
        <p className="text-xs text-blue-300 mt-0.5">Usa l'app offline, sempre con te</p>
      </div>
      <button
        onClick={installa}
        className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all flex-shrink-0"
      >
        Installa
      </button>
      <button onClick={nascondi} className="text-blue-400 hover:text-blue-200 p-1 flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}
