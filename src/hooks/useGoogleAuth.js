import { useState, useEffect } from 'react'

const SCOPE = 'https://www.googleapis.com/auth/drive.file'

// Redirect URI = origine + base path dell'app (es. https://inedia.github.io/workout/)
function getRedirectUri() {
  return window.location.origin + import.meta.env.BASE_URL
}

export function useGoogleAuth() {
  const [tokenData, setTokenData] = useState(() => {
    try {
      const stored = localStorage.getItem('sm_gdrive_token')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Al montaggio: rileva il ritorno dal redirect OAuth (token nell'URL hash)
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('access_token=')) return

    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
    const access_token = params.get('access_token')
    const expires_in = parseInt(params.get('expires_in') || '3600', 10)

    // Pulisce subito l'URL per non riprocessare il token al prossimo mount
    window.history.replaceState(null, '', window.location.pathname + window.location.search)

    if (!access_token) return

    // Recupera email tramite userinfo
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then((r) => r.json())
      .then((info) => {
        const data = {
          access_token,
          expires_at: Date.now() + expires_in * 1000,
          email: info.email ?? '',
        }
        localStorage.setItem('sm_gdrive_token', JSON.stringify(data))
        setTokenData(data)
      })
      .catch(() => {})
  }, [])

  // Il token è valido se non è scaduto (con 30 sec di margine)
  const tokenValido = !!(tokenData && Date.now() < tokenData.expires_at - 30_000)

  // Avvia il flusso OAuth con redirect (funziona su tutti i browser/PWA, nessun popup)
  function connetti() {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: getRedirectUri(),
      response_type: 'token',
      scope: SCOPE,
      include_granted_scopes: 'true',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  function scollega() {
    localStorage.removeItem('sm_gdrive_token')
    setTokenData(null)
  }

  return { tokenData, tokenValido, connetti, scollega }
}
