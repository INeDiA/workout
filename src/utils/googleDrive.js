const CHIAVI_BACKUP = ['sm_sessions', 'sm_schede', 'sm_scheda_attiva_id', 'sm_esercizi_custom', 'sm_settings']
const FILE_NAME = 'allenamento-backup.json'

// Carica la libreria Google Identity Services dinamicamente (solo al momento del login)
export function loadGIS() {
  return new Promise((resolve) => {
    if (window.google?.accounts) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.onload = resolve
    document.head.appendChild(s)
  })
}

// Trova il file di backup su Drive — restituisce null se non esiste
async function findFile(token) {
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`)
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error('Drive list failed')
  const data = await res.json()
  return data.files?.[0] ?? null
}

// Carica i dati da localStorage e li sovrascrive (PATCH) o li crea (POST) su Drive
export async function uploadBackup(token) {
  const dati = { _version: 1, _exportDate: new Date().toISOString() }
  for (const k of CHIAVI_BACKUP) {
    const v = localStorage.getItem(k)
    if (v !== null) dati[k] = JSON.parse(v)
  }
  const json = JSON.stringify(dati, null, 2)

  const existing = await findFile(token)
  const url = existing
    ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'

  const form = new FormData()
  form.append(
    'metadata',
    new Blob([JSON.stringify({ name: FILE_NAME, mimeType: 'application/json' })], { type: 'application/json' })
  )
  form.append('file', new Blob([json], { type: 'application/json' }))

  const res = await fetch(url, {
    method: existing ? 'PATCH' : 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) throw new Error('Drive upload failed')

  localStorage.setItem('sm_ultimo_backup', new Date().toISOString())
}

// Scarica il file di backup da Drive e lo restituisce come oggetto JSON
export async function downloadBackup(token) {
  const file = await findFile(token)
  if (!file) throw new Error('Nessun backup trovato su Drive')
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error('Drive download failed')
  return res.json()
}

// Fire-and-forget: chiamato dopo completaSessione() — fallisce silenziosamente se il token è scaduto
export async function autoBackupToDrive() {
  try {
    const stored = localStorage.getItem('sm_gdrive_token')
    if (!stored) return
    const { access_token, expires_at } = JSON.parse(stored)
    if (Date.now() >= expires_at - 30_000) return  // token scaduto o in scadenza
    await uploadBackup(access_token)
  } catch (e) {
    console.warn('[Drive] auto-backup fallito:', e.message)
  }
}
