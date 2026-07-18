import { useState, useEffect, useRef } from 'react'
import { webdavProvider } from '../utils/webdav'
import { serializeBackup } from '../utils/backupData'
import { rinnovaTokenGdrive } from '../utils/googleAuth'

const STORAGE_KEY = 'sm_backup_provider'
const GDRIVE_REDIRECT_URI = () => window.location.origin + import.meta.env.BASE_URL
const GDRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const GDRIVE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '218821816699-othhqj9dngod4imr2qkiichno2jfn1v1.apps.googleusercontent.com'

// Soglia entro cui tentare il rinnovo proattivo del token (prima che scada davvero)
const SOGLIA_RINNOVO_MS = 5 * 60 * 1000

// ── Migrazione dal vecchio formato sm_gdrive_token ──────────────────────────
function migrateOldToken() {
  try {
    const old = localStorage.getItem('sm_gdrive_token')
    if (old && !localStorage.getItem(STORAGE_KEY)) {
      const parsed = JSON.parse(old)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: 'gdrive', ...parsed }))
      localStorage.removeItem('sm_gdrive_token')
    }
  } catch {
    // localStorage non disponibile o dato corrotto: ignora, si riparte da zero
  }
}

function readConfig() {
  migrateOldToken()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

// Carica un backup usando esplicitamente la config passata (non lo stato del hook) —
// serve per il primo backup subito dopo il collegamento, quando lo stato React
// potrebbe non essere ancora aggiornato in modo sincrono.
async function caricaBackupConConfig(config) {
  const json = serializeBackup()
  if (config.type === 'gdrive') {
    const { uploadBackup: driveUpload } = await import('../utils/googleDrive')
    await driveUpload(config.access_token)
  } else if (config.type === 'webdav') {
    await webdavProvider.upload(config, json)
    localStorage.setItem('sm_ultimo_backup', new Date().toISOString())
  }
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useBackupProvider() {
  const [providerConfig, setProviderConfig] = useState(readConfig)
  const providerConfigRef = useRef(providerConfig)
  useEffect(() => {
    providerConfigRef.current = providerConfig
  }, [providerConfig])

  // Gestisce il ritorno dal redirect OAuth Google (authorization code flow):
  // scambia il code con access_token + refresh_token tramite il Worker, poi
  // esegue subito un primo backup.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    window.history.replaceState(null, '', window.location.pathname)
    if (!code) return

    const workerUrl = import.meta.env.VITE_BACKUP_WORKER_URL
    fetch(`${workerUrl}/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: GDRIVE_REDIRECT_URI() }),
    })
      .then((r) => r.json())
      .then(async ({ access_token, refresh_token, expires_in }) => {
        const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        }).then((r) => r.json())
        const config = {
          type: 'gdrive',
          access_token,
          refresh_token,
          expires_at: Date.now() + expires_in * 1000,
          email: info.email ?? '',
        }
        saveConfig(config)
        setProviderConfig(config)
        caricaBackupConConfig(config).catch(() => {})
      })
      .catch(() => {})
  }, [])

  // Prova il rinnovo del token gdrive tramite il Worker; aggiorna state+localStorage se riesce.
  // Restituisce la config aggiornata (o quella corrente se non serve/non riesce rinnovare).
  async function assicuraTokenValido() {
    const config = providerConfigRef.current
    if (!config || config.type !== 'gdrive') return config
    if (Date.now() < (config.expires_at ?? 0) - 30_000) return config

    const rinnovata = await rinnovaTokenGdrive(config)
    if (rinnovata) {
      setProviderConfig(rinnovata)
      return rinnovata
    }
    return config
  }

  // Rinnovo proattivo in background: al mount e quando l'app torna in primo piano,
  // se il token scade a breve prova a rinnovarlo senza attendere un'azione dell'utente.
  useEffect(() => {
    function controllaRinnovo() {
      const config = providerConfigRef.current
      if (!config || config.type !== 'gdrive') return
      if (Date.now() < (config.expires_at ?? 0) - SOGLIA_RINNOVO_MS) return
      rinnovaTokenGdrive(config).then((rinnovata) => {
        if (rinnovata) setProviderConfig(rinnovata)
      })
    }

    controllaRinnovo()
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') controllaRinnovo()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // true se il provider è configurato e il token (per gdrive) non è scaduto
  const providerValido =
    !!providerConfig &&
    (providerConfig.type === 'webdav' ||
      (providerConfig.type === 'gdrive' &&
        Date.now() < (providerConfig.expires_at ?? 0) - 30_000))

  // ── Connessione Google Drive (redirect OAuth, authorization code) ──────
  function connectGdrive() {
    const params = new URLSearchParams({
      client_id: GDRIVE_CLIENT_ID,
      redirect_uri: GDRIVE_REDIRECT_URI(),
      response_type: 'code',
      scope: GDRIVE_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  // ── Connessione WebDAV (testa prima di salvare, poi backup immediato) ──
  async function connectWebdav(config) {
    const result = await webdavProvider.test(config)
    if (!result.ok) throw new Error(result.error)
    const full = { type: 'webdav', ...config }
    saveConfig(full)
    setProviderConfig(full)
    caricaBackupConConfig(full).catch(() => {})
  }

  // ── Disconnessione ──────────────────────────────────────────────────────
  function disconnect() {
    localStorage.removeItem(STORAGE_KEY)
    setProviderConfig(null)
  }

  // ── Upload backup (delega al provider attivo) ───────────────────────────
  async function uploadBackup() {
    if (!providerConfig) throw new Error('Nessun provider configurato')
    let config = providerConfig
    if (config.type === 'gdrive') {
      config = await assicuraTokenValido()
      if (Date.now() >= (config.expires_at ?? 0) - 30_000) {
        throw new Error('Token Google scaduto. Riconnetti il tuo account.')
      }
    }
    await caricaBackupConConfig(config)
  }

  // ── Download backup (delega al provider attivo) ─────────────────────────
  async function downloadBackup() {
    if (!providerConfig) throw new Error('Nessun provider configurato')
    let config = providerConfig
    if (config.type === 'gdrive') {
      config = await assicuraTokenValido()
      if (Date.now() >= (config.expires_at ?? 0) - 30_000) {
        throw new Error('Token Google scaduto. Riconnetti il tuo account.')
      }
      const { downloadBackup: driveDownload } = await import('../utils/googleDrive')
      return driveDownload(config.access_token)
    } else if (config.type === 'webdav') {
      return webdavProvider.download(config)
    }
  }

  return {
    providerConfig,
    providerValido,
    connectGdrive,
    connectWebdav,
    disconnect,
    uploadBackup,
    downloadBackup,
  }
}
