import { useState, useRef } from 'react'
import { X, ChevronRight, AlertTriangle, Upload, Share2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { backupNecessario } from '../utils/backup'

const DURATE_TIMER = [60, 90, 120, 150, 180]
const CHIAVI_BACKUP = ['sm_sessions', 'sm_schede', 'sm_scheda_attiva_id', 'sm_esercizi_custom', 'sm_settings']

export default function SettingsSheet({ settings, onUpdateSettings, onClose, onGestisciSchede }) {
  const { schedaAttiva } = useApp()
  const [passoReset, setPassoReset] = useState(0)
  const [erroreImport, setErroreImport] = useState(null)
  const inputFileRef = useRef(null)

  const ultimoBackup = localStorage.getItem('sm_ultimo_backup')
  const ultimoBackupStr = ultimoBackup
    ? new Date(ultimoBackup).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  function set(campo, valore) {
    onUpdateSettings({ ...settings, [campo]: valore })
  }

  // ── Export ──────────────────────────────────────────────────────────
  async function esportaDati() {
    const dati = { _version: 1, _exportDate: new Date().toISOString() }
    for (const key of CHIAVI_BACKUP) {
      const val = localStorage.getItem(key)
      if (val !== null) dati[key] = JSON.parse(val)
    }

    const json = JSON.stringify(dati, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const fileName = `allenamento-backup-${new Date().toISOString().slice(0, 10)}.json`

    // Web Share API (iOS / Android) — tenta prima la condivisione file
    if (navigator.canShare) {
      const file = new File([blob], fileName, { type: 'application/json' })
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Backup allenamento' })
          localStorage.setItem('sm_ultimo_backup', new Date().toISOString())
          return
        } catch (err) {
          if (err?.name === 'AbortError') return  // utente ha annullato
          // Altro errore (es. Android non supporta .json): cade nel fallback
        }
      }
    }

    // Fallback: download diretto
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    localStorage.setItem('sm_ultimo_backup', new Date().toISOString())
  }

  // ── Import ──────────────────────────────────────────────────────────
  function handleFileImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setErroreImport(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const dati = JSON.parse(ev.target.result)
        if (!dati._version) throw new Error('formato non valido')
        for (const key of CHIAVI_BACKUP) {
          if (dati[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(dati[key]))
          }
        }
        window.location.reload()
      } catch {
        setErroreImport('File non riconosciuto. Assicurati di usare un backup generato da questa app.')
      }
    }
    reader.readAsText(file)
    // reset input così si può reimportare lo stesso file
    e.target.value = ''
  }

  // ── Reset ────────────────────────────────────────────────────────────
  function handleReset() {
    if (passoReset < 2) { setPassoReset((p) => p + 1); return }
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl max-h-[92vh] flex flex-col">
        {/* Intestazione fissa */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Impostazioni</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenuto scrollabile */}
        <div className="overflow-y-auto flex-1 px-5 pb-10">
          <div className="space-y-5">

            {/* Scheda attiva */}
            <button
              onClick={() => { onClose(); onGestisciSchede?.() }}
              className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl px-4 py-3.5 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Scheda attiva</p>
                <p className="text-xs text-gray-400 mt-0.5">{schedaAttiva?.nome || 'Nessuna scheda'}</p>
              </div>
              <ChevronRight size={18} className="text-gray-500" />
            </button>

            {/* Giorni per settimana */}
            <div>
              <p className="text-sm font-semibold text-white mb-1">Giorni di allenamento</p>
              <p className="text-xs text-gray-400 mb-3">Quante sessioni ruotano nella settimana.</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => set('giorniSettimana', n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      (settings.giorniSettimana ?? 3) === n
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer recupero */}
            <div>
              <p className="text-sm font-semibold text-white mb-1">Durata recupero default</p>
              <p className="text-xs text-gray-400 mb-3">Durata del timer che parte dopo ogni serie.</p>
              <div className="flex gap-2 flex-wrap">
                {DURATE_TIMER.map((d) => (
                  <button
                    key={d}
                    onClick={() => set('timerDuration', d)}
                    className={`flex-1 min-w-0 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      settings.timerDuration === d
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* ── Backup ───────────────────────────────────────────── */}
            <div className="border-t border-gray-800 pt-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Backup dati</p>
              {ultimoBackupStr && (
                <p className="text-xs text-gray-600 mb-3">Ultimo backup: {ultimoBackupStr}</p>
              )}
              {!ultimoBackupStr && (
                <p className="text-xs text-gray-600 mb-3">Nessun backup effettuato su questo dispositivo.</p>
              )}

              {backupNecessario() && (
                <button
                  onClick={esportaDati}
                  className="w-full flex items-start gap-3 bg-amber-950 border border-amber-800 rounded-2xl px-4 py-3 text-left active:scale-98 transition-all mb-3"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-200">Fai un backup dei tuoi dati</p>
                    <p className="text-xs text-amber-400 mt-0.5">
                      {localStorage.getItem('sm_ultimo_backup')
                        ? "L'ultimo backup risale a più di un mese fa. Tocca per esportare ora."
                        : 'Non hai ancora salvato nessun backup. Tocca per esportare ora.'}
                    </p>
                  </div>
                </button>
              )}

              <div className="flex gap-2">
                {/* Esporta / Condividi */}
                <button
                  onClick={esportaDati}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl py-3 text-sm font-medium text-white transition-colors active:scale-98"
                >
                  <Share2 size={15} />
                  Esporta
                </button>

                {/* Importa */}
                <button
                  onClick={() => inputFileRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl py-3 text-sm font-medium text-white transition-colors active:scale-98"
                >
                  <Upload size={15} />
                  Importa
                </button>
                <input
                  ref={inputFileRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileImport}
                />
              </div>

              {erroreImport && (
                <div className="flex items-start gap-2 bg-red-950 border border-red-800 rounded-xl p-3 mt-2">
                  <AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{erroreImport}</p>
                </div>
              )}
            </div>

            {/* ── Zona pericolosa ──────────────────────────────────── */}
            <div className="border-t border-gray-800 pt-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Zona pericolosa</p>

              {passoReset > 0 && (
                <div className="flex items-start gap-2 bg-red-950 border border-red-800 rounded-xl p-3 mb-3">
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 leading-relaxed">
                    {passoReset === 1
                      ? 'Verranno cancellati tutti gli allenamenti, le schede personalizzate e le impostazioni. Questa azione è irreversibile.'
                      : 'Ultima conferma — dopo non si torna indietro.'}
                  </p>
                </div>
              )}

              <button
                onClick={handleReset}
                className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-98 border ${
                  passoReset === 0
                    ? 'bg-gray-900 border-gray-700 text-gray-400 hover:border-red-800 hover:text-red-400'
                    : passoReset === 1
                    ? 'bg-red-950 border-red-700 text-red-300'
                    : 'bg-red-700 border-red-600 text-white'
                }`}
              >
                {passoReset === 0 && 'Cancella tutti i dati'}
                {passoReset === 1 && 'Sei sicuro? Tocca ancora per continuare'}
                {passoReset === 2 && 'Sì, cancella tutto e ricomincia'}
              </button>

              {passoReset > 0 && (
                <button
                  onClick={() => setPassoReset(0)}
                  className="w-full mt-2 py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Annulla
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
