import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'
import InstallBanner from './components/InstallBanner'
import TimerPill from './components/TimerPill'
import Oggi from './pages/Oggi'
import Storico from './pages/Storico'
import Impostazioni from './pages/Impostazioni'
import Onboarding from './pages/Onboarding'

function AppContent() {
  const [tab, setTab] = useState('oggi')
  const { activeSession, timer, necessitaOnboarding } = useApp()

  if (necessitaOnboarding) {
    return <Onboarding />
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <InstallBanner />

      {/* Rendering condizionale dei tab — solo il tab attivo è montato */}
      {tab === 'oggi' && <Oggi />}
      {tab === 'storico' && <Storico />}
      {tab === 'impostazioni' && <Impostazioni />}

      {/* Pill timer visibile sugli altri tab durante una sessione attiva */}
      {activeSession && tab !== 'oggi' && (
        <div
          className="fixed left-0 right-0 z-40 px-4 py-2"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' }}
        >
          <TimerPill timer={timer} />
        </div>
      )}

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
