// Rinnovo silenzioso del token Google Drive tramite Google Identity Services (GIS).
// Il flusso di connessione iniziale resta il redirect OAuth implicit grant esistente
// (vedi useBackupProvider.js) — questo modulo si occupa solo di rinnovare il token
// in background, senza redirect/popup visibili, finché la sessione Google del
// browser resta valida.

const STORAGE_KEY = 'sm_backup_provider'
const GDRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const GDRIVE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '218821816699-othhqj9dngod4imr2qkiichno2jfn1v1.apps.googleusercontent.com'

let scriptPromise = null

// Carica lo script GIS una sola volta (cache a livello di modulo)
function caricaGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Impossibile caricare Google Identity Services'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

// Prova a ottenere un nuovo access token senza interazione dell'utente.
// Risolve { access_token, expires_in } se riesce, altrimenti rigetta.
export async function refreshGdriveTokenSilently(email) {
  await caricaGis()

  return new Promise((resolve, reject) => {
    let settled = false
    const timeout = setTimeout(() => {
      if (!settled) { settled = true; reject(new Error('silent_refresh_timeout')) }
    }, 8000)

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GDRIVE_CLIENT_ID,
        scope: GDRIVE_SCOPE,
        hint: email || undefined,
        callback: (response) => {
          if (settled) return
          settled = true
          clearTimeout(timeout)
          if (response.error) {
            reject(new Error(response.error))
          } else {
            resolve({
              access_token: response.access_token,
              expires_in: parseInt(response.expires_in || '3600', 10),
            })
          }
        },
        error_callback: (err) => {
          if (settled) return
          settled = true
          clearTimeout(timeout)
          reject(new Error(err?.type || 'silent_refresh_failed'))
        },
      })
      client.requestAccessToken({ prompt: '' })
    } catch (err) {
      if (!settled) { settled = true; clearTimeout(timeout); reject(err) }
    }
  })
}

// Rinnova e persiste subito il nuovo token in localStorage (letto sia dall'hook
// interattivo che dal percorso fire-and-forget di autoBackup) — restituisce la
// config aggiornata, o null se il rinnovo silenzioso non è riuscito.
export async function rinnovaESalvaTokenGdrive() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const config = JSON.parse(stored)
    if (config.type !== 'gdrive') return null

    const { access_token, expires_in } = await refreshGdriveTokenSilently(config.email)
    const aggiornata = { ...config, access_token, expires_at: Date.now() + expires_in * 1000 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aggiornata))
    return aggiornata
  } catch {
    return null
  }
}
