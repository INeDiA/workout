// Rinnovo del token Google Drive tramite il Cloudflare Worker che tiene il
// client_secret al sicuro — scambia il refresh_token (ottenuto una sola volta
// al collegamento, vedi useBackupProvider.js) in un nuovo access_token,
// senza redirect/popup e senza dipendere da cookie di terze parti.

const STORAGE_KEY = 'sm_backup_provider'

// Rinnova e persiste subito il nuovo access_token in localStorage — restituisce
// la config aggiornata, o null se il rinnovo non è riuscito (refresh_token
// revocato/non valido: in quel caso serve un nuovo collegamento interattivo).
export async function rinnovaTokenGdrive(config) {
  try {
    const workerUrl = import.meta.env.VITE_BACKUP_WORKER_URL
    const res = await fetch(`${workerUrl}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: config.refresh_token }),
    })
    if (!res.ok) return null

    const { access_token, expires_in } = await res.json()
    const aggiornata = { ...config, access_token, expires_at: Date.now() + expires_in * 1000 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aggiornata))
    return aggiornata
  } catch {
    return null
  }
}
