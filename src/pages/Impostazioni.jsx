import { useState, useRef } from 'react'
import { ChevronRight, AlertTriangle, Upload, Share2, CloudUpload, CloudDownload, Unlink, Globe, Download, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { backupNecessario } from '../utils/backup'
import { useBackupProvider } from '../hooks/useBackupProvider'
import { deserializeBackup } from '../utils/backupData'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import SchedeSheet from '../components/SchedeSheet'
import SessioniManagerSheet from '../components/SessioniManagerSheet'

const DURATE_TIMER = [60, 90, 120, 150, 180]

export default function Impostazioni() {
  const { t, lingua, schedaAttiva, settings, setSettings, resetSchedaDefault } = useApp()
  const [showSchedeSheet, setShowSchedeSheet] = useState(false)
  const [showSessioniManager, setShowSessioniManager] = useState(false)
  const [passoResetScheda, setPassoResetScheda] = useState(0)
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
      setCloudSuccess(t.impostazioni.backupCompletato)
    } catch (err) {
      setCloudError(err.message || t.impostazioni.backupFallito)
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
      setCloudError(err.message || t.impostazioni.ripristinoFallito)
    } finally {
      setCloudLoading(false)
    }
  }

  const ultimoBackup = localStorage.getItem('sm_ultimo_backup')
  const ultimoBackupStr = ultimoBackup
    ? new Date(ultimoBackup).toLocaleDateString(t.storico.localeData, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null

  function set(campo, valore) {
    setSettings({ ...settings, [campo]: valore })
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
          await navigator.share({ files: [file], title: t.impostazioni.condividiBackupTitolo })
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
        await navigator.share({ title: t.impostazioni.condividiBackupTitolo, text: json })
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
        setErroreImport(t.impostazioni.fileNonRiconosciuto)
      }
    }
    reader.readAsText(file)
    // reset input così si può reimportare lo stesso file
    e.target.value = ''
  }

  // ── Reset scheda / reset totale ─────────────────────────────────────
  function handleResetScheda() {
    if (passoResetScheda < 1) { setPassoResetScheda(1); return }
    resetSchedaDefault()
    setPassoResetScheda(0)
  }

  function handleReset() {
    if (passoReset < 2) { setPassoReset((p) => p + 1); return }
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="pt-safe px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">{t.impostazioni.titolo}</h1>
        <p className="text-sm text-gray-400 mt-1">{t.impostazioni.sottotitolo}</p>
      </div>

      <div className="px-4 space-y-4">

        {/* ── App (solo se non installata) ─────────────────────────── */}
        {!isInstalled && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.impostazioni.app}</p>
            {isInstallable ? (
              <button
                onClick={triggerInstall}
                className="w-full flex items-center gap-3 bg-blue-950 hover:bg-blue-900 border border-blue-700 rounded-xl px-4 py-3 transition-colors active:scale-98"
              >
                <Download size={15} className="text-blue-400 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{t.impostazioni.installaApp}</p>
                  <p className="text-xs text-blue-300 mt-0.5">{t.impostazioni.installaAppDesc}</p>
                </div>
              </button>
            ) : isIOS ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-white mb-2">{t.impostazioni.installaIOSTitolo}</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  1. {t.impostazioni.installaIOS1} <span className="text-white">{t.impostazioni.installaIOSCondividi}</span> ⎙ {t.impostazioni.installaIOS1b}<br />
                  2. {t.impostazioni.installaIOS2} <span className="text-white">{t.impostazioni.installaIOSAggiungi}</span><br />
                  3. {t.impostazioni.installaIOS3} <span className="text-white">{t.impostazioni.installaIOSConferma}</span>
                </p>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-white mb-2">{t.impostazioni.installaAltroTitolo}</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  1. {t.impostazioni.installaAltro1}<br />
                  2. {t.impostazioni.installaAltro2} <span className="text-white">{t.impostazioni.installaIOSAggiungi}</span> {t.impostazioni.installaAltro2b}<br />
                  3. {t.impostazioni.installaAltro3}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Scheda attiva ────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.impostazioni.schedaAttiva}</p>
          <button
            onClick={() => setShowSchedeSheet(true)}
            className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3.5 transition-colors mb-2"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{schedaAttiva?.nome || t.impostazioni.nessunaScheda}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.impostazioni.gestisciSchede}</p>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </button>

          <button
            onClick={() => setShowSessioniManager(true)}
            className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3.5 transition-colors mb-2"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{t.impostazioni.sessioni}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.impostazioni.sessioniDesc.replace('{n}', schedaAttiva?.sessioni?.length || 0)}</p>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </button>

          {passoResetScheda > 0 && (
            <div className="flex items-start gap-2 bg-amber-950 border border-amber-800 rounded-xl p-3 mb-2">
              <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300 leading-relaxed">
                {t.impostazioni.ripristinaDefaultWarning}
              </p>
            </div>
          )}
          <button
            onClick={handleResetScheda}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium border transition-colors active:scale-98 ${
              passoResetScheda > 0
                ? 'bg-amber-900 border-amber-700 text-amber-200'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <RotateCcw size={13} />
            {passoResetScheda > 0 ? t.impostazioni.confermaRipristino : t.impostazioni.ripristinaDefault}
          </button>
        </div>

        {/* ── Allenamento ──────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.impostazioni.allenamento}</p>

          <div className="mb-4">
            <p className="text-sm font-semibold text-white mb-1">{t.impostazioni.giorniAllenamento}</p>
            <p className="text-xs text-gray-400 mb-3">{t.impostazioni.giorniAllenamentoDesc}</p>
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

          <div>
            <p className="text-sm font-semibold text-white mb-1">{t.impostazioni.durataRecupero}</p>
            <p className="text-xs text-gray-400 mb-3">{t.impostazioni.durataRecuperoDesc}</p>
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
        </div>

        {/* ── Lingua ───────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.impostazioni.lingua}</p>
          <div className="flex gap-2">
            <button
              onClick={() => set('lingua', 'it')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                lingua === 'it'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t.impostazioni.italiano}
            </button>
            <button
              onClick={() => set('lingua', 'en')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                lingua === 'en'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t.impostazioni.inglese}
            </button>
          </div>
        </div>

        {/* ── Backup e dati ────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.impostazioni.backupEDati}</p>
            {ultimoBackupStr && <p className="text-xs text-gray-600">{ultimoBackupStr}</p>}
          </div>

          {/* Warning backup mancante — solo se nessun provider attivo */}
          {backupNecessario() && !providerValido && (
            <button onClick={esportaDati}
              className="w-full flex items-center gap-3 bg-amber-950 border border-amber-800 rounded-xl px-3 py-2.5 text-left active:scale-98 transition-all mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                {ultimoBackup ? t.impostazioni.backupVecchio : t.impostazioni.nessunBackup}
              </p>
            </button>
          )}

          {/* Provider: token scaduto (solo gdrive) */}
          {providerConfig?.type === 'gdrive' && !providerValido && (
            <div className="flex items-center gap-2 bg-amber-950 border border-amber-800 rounded-xl px-3 py-2 mb-2">
              <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300 flex-1">{t.impostazioni.sessioneGDriveScaduta}</p>
              <button onClick={connectGdrive} className="text-xs font-medium text-amber-200 underline">{t.impostazioni.ricollegati}</button>
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
                placeholder={t.impostazioni.placeholderWebdavUrl}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 gap-2">
                <input value={wdUser} onChange={(e) => setWdUser(e.target.value)} required
                  placeholder={t.impostazioni.placeholderUtente}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                <input value={wdPass} onChange={(e) => setWdPass(e.target.value)} required
                  type="password" placeholder={t.impostazioni.placeholderAppPassword}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setShowWebdavForm(false); setCloudError(null) }}
                  className="py-2 rounded-xl text-xs font-medium text-gray-400 bg-gray-800 border border-gray-700 active:scale-98 transition-all">
                  {t.common.annulla}
                </button>
                <button type="submit" disabled={cloudLoading}
                  className="py-2 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:scale-98 transition-all disabled:opacity-50">
                  {cloudLoading ? t.impostazioni.connessione : t.impostazioni.connetti}
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
                    <CloudUpload size={13} />{cloudLoading ? '…' : t.impostazioni.backup}
                  </button>
                  <button onClick={ripristinaCloud} disabled={cloudLoading}
                    className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98 disabled:opacity-50">
                    <CloudDownload size={13} />{cloudLoading ? '…' : t.impostazioni.ripristina}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={connectGdrive}
                    className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98">
                    <CloudUpload size={13} />{t.impostazioni.googleDrive}
                  </button>
                  <button onClick={() => { setShowWebdavForm(true); setCloudError(null) }}
                    className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98">
                    <Globe size={13} />{t.impostazioni.webdav}
                  </button>
                </>
              )}
              <button onClick={esportaDati}
                className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98">
                <Share2 size={13} />{t.impostazioni.esporta}
              </button>
              <button onClick={() => inputFileRef.current?.click()}
                className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-2.5 text-xs font-medium text-white transition-colors active:scale-98">
                <Upload size={13} />{t.impostazioni.importa}
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

        {/* ── Zona pericolosa ──────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.impostazioni.zonaPericolosa}</p>

          {passoReset > 0 && (
            <div className="flex items-start gap-2 bg-red-950 border border-red-800 rounded-xl p-3 mb-3">
              <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 leading-relaxed">
                {passoReset === 1
                  ? t.impostazioni.cancellaAvviso
                  : t.impostazioni.ultimaConferma}
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
            {passoReset === 0 && t.impostazioni.cancellaTuttiIDati}
            {passoReset === 1 && t.impostazioni.seiSicuro}
            {passoReset === 2 && t.impostazioni.siCancellaTutto}
          </button>

          {passoReset > 0 && (
            <button
              onClick={() => setPassoReset(0)}
              className="w-full mt-2 py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              {t.common.annulla}
            </button>
          )}
        </div>

      </div>

      {showSchedeSheet && (
        <SchedeSheet onClose={() => setShowSchedeSheet(false)} />
      )}

      {showSessioniManager && (
        <SessioniManagerSheet onClose={() => setShowSessioniManager(false)} />
      )}
    </div>
  )
}
