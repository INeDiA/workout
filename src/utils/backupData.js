export const CHIAVI_BACKUP = [
  'sm_sessions',
  'sm_schede',
  'sm_scheda_attiva_id',
  'sm_esercizi_custom',
  'sm_settings',
  'sm_peso_log',
  'sm_recovery_log',
]

export const BACKUP_FILE_NAME = 'allenamento-backup.json'

/** Legge tutte le chiavi di backup da localStorage e restituisce il JSON serializzato. */
export function serializeBackup() {
  const dati = { _version: 1, _exportDate: new Date().toISOString() }
  for (const k of CHIAVI_BACKUP) {
    const v = localStorage.getItem(k)
    if (v !== null) dati[k] = JSON.parse(v)
  }
  return JSON.stringify(dati, null, 2)
}

/** Scrive i dati del backup nel localStorage. Lancia un errore se il formato non è valido. */
export function deserializeBackup(dati) {
  if (!dati._version) throw new Error('formato non valido')
  for (const k of CHIAVI_BACKUP) {
    if (dati[k] !== undefined) localStorage.setItem(k, JSON.stringify(dati[k]))
  }
}
