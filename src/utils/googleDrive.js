import { serializeBackup, BACKUP_FILE_NAME } from './backupData'
import { rinnovaTokenGdrive } from './googleAuth'

const DRIVE_FILES = 'https://www.googleapis.com/drive/v3/files'
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files'

// Trova il file di backup su Drive — restituisce null se non esiste
async function findFile(token) {
  const q = encodeURIComponent(`name='${BACKUP_FILE_NAME}' and trashed=false`)
  const res = await fetch(`${DRIVE_FILES}?q=${q}&fields=files(id,name,modifiedTime)`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('Token Google scaduto. Riconnetti il tuo account.')
    throw new Error(`Errore Google Drive (${res.status})`)
  }
  const data = await res.json()
  return data.files?.[0] ?? null
}

// Carica il backup su Drive (crea o sovrascrive il file esistente)
export async function uploadBackup(token) {
  const json = serializeBackup()
  const existing = await findFile(token)
  const url = existing
    ? `${DRIVE_UPLOAD}/${existing.id}?uploadType=multipart`
    : `${DRIVE_UPLOAD}?uploadType=multipart`

  const form = new FormData()
  form.append(
    'metadata',
    new Blob([JSON.stringify({ name: BACKUP_FILE_NAME, mimeType: 'application/json' })], {
      type: 'application/json',
    })
  )
  form.append('file', new Blob([json], { type: 'application/json' }))

  const res = await fetch(url, {
    method: existing ? 'PATCH' : 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('Token Google scaduto. Riconnetti il tuo account.')
    throw new Error(`Upload fallito (${res.status})`)
  }
  localStorage.setItem('sm_ultimo_backup', new Date().toISOString())
}

// Scarica il backup da Drive
export async function downloadBackup(token) {
  const file = await findFile(token)
  if (!file) throw new Error('Nessun backup trovato su Drive.')
  const res = await fetch(`${DRIVE_FILES}/${file.id}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Drive download failed')
  return res.json()
}

// Fire-and-forget: chiamato dopo completaSessione() — legge sm_backup_provider
export async function autoBackup() {
  try {
    const stored = localStorage.getItem('sm_backup_provider')
    if (!stored) return
    const config = JSON.parse(stored)

    if (config.type === 'gdrive') {
      let tokenValido = config.access_token
      if (Date.now() >= (config.expires_at ?? 0) - 30_000) {
        const rinnovata = await rinnovaTokenGdrive(config)
        if (!rinnovata) return // rinnovo non riuscito (refresh_token revocato), rinuncia
        tokenValido = rinnovata.access_token
      }
      await uploadBackup(tokenValido)
    } else if (config.type === 'webdav') {
      const { webdavProvider } = await import('./webdav')
      const { serializeBackup: serialize } = await import('./backupData')
      await webdavProvider.upload(config, serialize())
      localStorage.setItem('sm_ultimo_backup', new Date().toISOString())
    }
  } catch (e) {
    console.warn('[Backup] auto-backup fallito:', e.message)
  }
}
