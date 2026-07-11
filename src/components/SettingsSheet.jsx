import { useState, useRef } from 'react'
import { X, ChevronRight, AlertTriangle, Upload, Share2, CloudUpload, CloudDownload, Unlink, Globe, Download } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { backupNecessario } from '../utils/backup'
import { useBackupProvider } from '../hooks/useBackupProvider'
import { deserializeBackup } from '../utils/backupData'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

const DURATE_TIMER = [60, 90, 120, 150, 180]

export default function SettingsSheet({ settings, onUpdateSettings, onClose, onGestisciSchede }) {
  const { schedaAttiva } = useApp()
  const [passoReset, setPassoReset] = useState(0)
  const [erroreImport, setErroreImport] = useState(null)
  const inputFileRef = useRef(null)

  const { isInstalled, isInstallable, isIOS, triggerInstall } = useInstallPrompt()

  const {
    providerConfig, providerValido,
    connectGdrive, connectWebdav, disconnect,
    uploadBackup: providerUpload, downloadBackup: providerDownload,
  } = useBackupProvider()

  const [cloudLoading, setCloudLoading] = useState(false)
  const [cloudError, setCloudError] = useState(null)
  const [cloudSuccess, setCloudSuccess] = useState(null)

  // Form WebDAV inline
  const [showWebdavForm, setShowWebdavForm] = useState(false)
  const [wdUrl, setWdUrl] = useState('')
  const [wdUser, setWdUser] = useState('')
  const [wdPass, setWdPass] = useState('')

  async function handleConnectWebdav(e) {
    e.preventDefault()
    setCloudLoading(true); setCloudError(null)
    try {
      await connectWebdav({ url: wdUrl.trim(), username: wdUser.trim(), password: wdPass })
      setShowWebdavForm(false)
    } catch (err) {
      setCloudError(err.message)
    } finally {
      setCloudLoading(false)
    }
  }

  async function backupOra() {
    setCloudLoading(true); setCloudError(null); setCloudSuccess(null)
    try {
      await providerUpload()
      setCloudSuccess('Backup completato.')
    } catch (err) {
      setCloudError(err.message || 'Backup fallito. Riprova.')
    } finally {
      setCloudLoading(false)
    }
  }

  async function ripristinaCloud() {
    setCloudLoading(true); setCloudError(null); setCloudSuccess(null)
    try {
      const dati = await providerDownload()
      deserializeBackup(dati)
      window.location.reload()
    } catch (err) {
      setCloudError(err.message || 'Ripristino fallito.')
    } finally {
      setCloudLoading(false)
    }
  }

  const ultimoBackup = localStorage.getItem('sm_ultimo_backup')
  const ultimoBackupStr = ultimoBackup
    ? new Date(ultimoBackup).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null

  function set(campo, valore) {
    onUpdateSettings({ ...settings, [campo]: valore })
  }

  // ── Export ──────────────────────────────────────────────────────────
  async function esportaDati() {
    const { serializeBackup } = await import('../utils/backupData')
    const json = serializeBackup()
    const blob = new Blob([json], { type: 'application/json' })
    const fileName = `allenamento-backup-${new Date().toISOString().slice(0, 10)}.json`

    // Strategia 1: condivisione come file (iOS + Android moderni)
    if (navigator.canShare) {
      const file = new File([blob], fileName, { type: 'application/json' })
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Backup allenamento' })
          localStorage.setItem('sm_ultimo_backup', new Date().toISOString())
          return
        } catch (err) {
          if (err?.name === 'AbortError') return
          // Altro errore: prova la strategia testo
        }
      }
    }

    // Strategia 2: condivisione come testo (Android — apre il foglio di condivisione)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Backup allenamento', text: json })
        localStorage.setItem('sm_ultimo_backup', new Date().toISOString())
        return
      } catch (err) {
        if (err?.name === 'AbortError') return
        // Ancora errore: cade nel download
      }
    }

    // Strategia 3: download diretto (desktop / browser senza Share API)
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
        deserializeBackup(dati)
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
      <div className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl max-h-[92dvh] flex flex-col">
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

            {/* ── App ──────────────────────────────────────────────── */}
            <div className="border-t border-gray-800 pt-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">App</p>
              {isInstalled ? (
                <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                  <Download size={15} className="text-green-400 flex-shrink-0" />
                  <p className="text-sm text-gray-300">App installata</p>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={triggerInstall}
                  className="w-full flex items-center gap-3 bg-blue-950 hover:bg-blue-900 border border-blue-700 rounded-2xl px-4 py-3 transition-colors active:scale-98"
                >
                  <Download size={15} className="text-blue-400 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Installa app</p>
                    <p className="text-xs text-blue-300 mt-0.5">Aggiungi alla schermata Home per usarla offline</p>
                  </div>
                </button>
              ) : isIOS ? (
                <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                  <p className="text-sm font-semibold text-white mb-2">Installa su iPhone / iPad</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    1. Tocca il tasto <span className="text-white">Condividi</span> ⎙ nella barra di Safari<br />
                    2. Scorri e scegli <span className="text-white">Aggiungi a schermata Home</span><br />
                    3. Tocca <span className="text-white">Aggiungi</span>
                  </p>
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                  <p className="text-sm font-semibold text-white mb-2">Installa l'app</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    1. Tocca il menu <span className="text-white">⋮</span> in alto a destra nel browser<br />
                    2. Scegli <span className="text-white">Aggiungi a schermata Home</span> (o "Installa app")<br />
                    3. Conferma
                  </p>
                </div>
              )}
            </div>

            {/* ── Backup ───────────────────────────────────────────── */}
            <div className="border-t border-gray-800 pt-5">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Backup</p>
                {ultimoBackupStr && <p className="text-xs text-gray-600">{ultimoBackupStr}</p>}
              </div>

              {/* Warning backup mancante — solo se nessun provider attivo */}
              {backupNecessario() && !providerValido && (
                <button onClick={esportaDati}
                  className="w-full flex items-center gap-3 bg-amber-950 border border-amber-800 rounded-xl px-3 py-2.5 text-left active:scale-98 transition-all mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <p className="text-xs text-amber-300">
                    {ultimoBackup ? 'Ultimo backup > 30 giorni. Tocca per esportare.' : 'Nessun backup. Tocca per esportare.'}
                  </p>
                </button>
              )}

              {/* Provider: token scaduto (solo gdrive) */}
              {providerConfig?.type === 'gdrive' && !providerValido && (
                <div className="flex items-center gap-2 bg-amber-950 border border-amber-800 rounded-xl px-3 py-2 mb-2">
                  <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-300 flex-1">Sessione Google Drive scaduta</p>
                  <button onClick={connectGdrive} className="text-xs font-medium text-amber-200 underline">Ricollegati</button>
                </div>
              )}

              {/* Provider: connesso */}
              {providerConfig && providerValido && (
                <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 mb-2">
                  <p className="text-xs text-white">
                    {providerConfig.type === 'gdrive' ? `☁ ${providerConfig.email}` : `🌐 ${providerConfig.url}`}
                  </p>
                  <button onClick={disconnect} className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors">
                    <Unlink size={13} />
                  </button>
                </div>
              )}

              {/* Form WebDAV inline */}
              {showWebdavForm && (
                <form onSubmit={handleConnectWebdav} className="space-y-2 mb-2">
                  <input value={wdUrl} onChange={(e) => setWdUrl(e.target.value)} required
                    placeholder="https://nextcloud.example.com/remote.php/dav/files/user/"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={wdUser} onChange={(e) => setWdUser(e.target.value)} required
                      placeholder="Utente"
                      className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                    <input value={wdPass} onChange={(e) => setWdPass(e.target.value)} required
                      type="password" placeholder="App password"
                      className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => { setShowWebdavForm(false); setCloudError(null) }}
                      className="py-2 rounded-xl text-xs font-medium text-gray-400 bg-gray-800 border border-gray-700 active:scale-98 transition-all">
                      Annulla
                    </button>
                    <button type="submit" disabled={cloudLoading}
                      className="py-2 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:scale-98 transition-all disabled:opacity-50">
                      {cloudLoading ? 'Connessione…' : 'Connetti'}
                    </button>
                  </div>
                </form>
              )}

              {/* Pulsanti azioni */}
              {!showWebdavForm && (
                <div className="grid grid-cols-2 gap-2">
                  {providerValido ? (
                    <>
                      <button onClick={backupOra} disabled={cloudLoading}
                        className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98 disabled:opacity-50">
                        <CloudUpload size={13} />{cloudLoading ? '…' : 'Backup'}
                      </button>
                      <button onClick={ripristinaCloud} disabled={cloudLoading}
                        className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98 disabled:opacity-50">
                        <CloudDownload size={13} />{cloudLoading ? '…' : 'Ripristina'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={connectGdrive}
                        className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98">
                        <CloudUpload size={13} />Google Drive
                      </button>
                      <button onClick={() => { setShowWebdavForm(true); setCloudError(null) }}
                        className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98">
                        <Globe size={13} />WebDAV
                      </button>
                    </>
                  )}
                  <button onClick={esportaDati}
                    className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98">
                    <Share2 size={13} />Esporta
                  </button>
                  <button onClick={() => inputFileRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98">
                    <Upload size={13} />Importa
                  </button>
                </div>
              )}

              <input ref={inputFileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileImport} />

              {cloudSuccess && <p className="text-xs text-green-400 mt-2">{cloudSuccess}</p>}
              {(cloudError || erroreImport) && (
                <div className="flex items-start gap-2 bg-red-950 border border-red-800 rounded-xl p-3 mt-2">
                  <AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{cloudError || erroreImport}</p>
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
