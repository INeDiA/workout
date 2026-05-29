import { useState } from 'react'
import { loadGIS } from '../utils/googleDrive'

export function useGoogleAuth() {
  const [tokenData, setTokenData] = useState(() => {
    try {
      const stored = localStorage.getItem('sm_gdrive_token')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Il token è valido se non è scaduto (con 30 sec di margine)
  const tokenValido = !!(tokenData && Date.now() < tokenData.expires_at - 30_000)

  async function connetti() {
    await loadGIS()
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (resp) => {
          if (resp.error) { reject(new Error(resp.error)); return }
          try {
            // Recupera email dell'utente
            const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${resp.access_token}` },
            }).then((r) => r.json())

            const data = {
              access_token: resp.access_token,
              expires_at: Date.now() + resp.expires_in * 1000,
              email: info.email ?? '',
            }
            localStorage.setItem('sm_gdrive_token', JSON.stringify(data))
            setTokenData(data)
            resolve(data)
          } catch (e) {
            reject(e)
          }
        },
      })
      client.requestAccessToken()
    })
  }

  function scollega() {
    localStorage.removeItem('sm_gdrive_token')
    setTokenData(null)
  }

  return { tokenData, tokenValido, connetti, scollega }
}
