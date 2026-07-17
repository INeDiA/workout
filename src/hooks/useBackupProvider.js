import { useState, useEffect, useRef } from 'react'
import { webdavProvider } from '../utils/webdav'
import { serializeBackup } from '../utils/backupData'
import { rinnovaESalvaTokenGdrive } from '../utils/googleAuth'

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

// ── Hook ────────────────────────────────────────────────────────────────────

export function useBackupProvider() {
  const [providerConfig, setProviderConfig] = useState(readConfig)
  const providerConfigRef = useRef(providerConfig)
  useEffect(() => {
    providerConfigRef.current = providerConfig
  }, [providerConfig])

  // Gestisce il ritorno dal redirect OAuth Google
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('access_token=')) return

    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
    const access_token = params.get('access_token')
    const expires_in = parseInt(params.get('expires_in') || '3600', 10)

    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    if (!access_token) return

    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then((r) => r.json())
      .then((info) => {
        const config = {
          type: 'gdrive',
          access_token,
          expires_at: Date.now() + expires_in * 1000,
          email: info.email ?? '',
        }
        saveConfig(config)
        setProviderConfig(config)
      })
      .catch(() => {})
  }, [])

  // Prova il rinnovo silenzioso del token gdrive; aggiorna state+localStorage se riesce.
  // Restituisce la config aggiornata (o quella corrente se non serve/non riesce rinnovare).
  async function assicuraTokenValido() {
    const config = providerConfigRef.current
    if (!config || config.type !== 'gdrive') return config
    if (Date.now() < (config.expires_at ?? 0) - 30_000) return config

    const rinnovata = await rinnovaESalvaTokenGdrive()
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
      rinnovaESalvaTokenGdrive().then((rinnovata) => {
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

  // ── Connessione Google Drive (redirect OAuth) ───────────────────────────
  function connectGdrive() {
    const params = new URLSearchParams({
      client_id: GDRIVE_CLIENT_ID,
      redirect_uri: GDRIVE_REDIRECT_URI(),
      response_type: 'token',
      scope: GDRIVE_SCOPE,
      include_granted_scopes: 'true',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  // ── Connessione WebDAV (testa prima di salvare) ─────────────────────────
  async function connectWebdav(config) {
    const result = await webdavProvider.test(config)
    if (!result.ok) throw new Error(result.error)
    const full = { type: 'webdav', ...config }
    saveConfig(full)
    setProviderConfig(full)
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
    const json = serializeBackup()
    if (config.type === 'gdrive') {
      const { uploadBackup: driveUpload } = await import('../utils/googleDrive')
      await driveUpload(config.access_token)
    } else if (config.type === 'webdav') {
      await webdavProvider.upload(config, json)
      localStorage.setItem('sm_ultimo_backup', new Date().toISOString())
    }
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
