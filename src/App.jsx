import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import BottomNav from './components/BottomNav'
import InstallBanner from './components/InstallBanner'
import Oggi from './pages/Oggi'
import Storico from './pages/Storico'
import Nutrizione from './pages/Nutrizione'

function AppContent() {
  const [tab, setTab] = useState('oggi')

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <InstallBanner />

      {/* Rendering condizionale dei tab — solo il tab attivo è montato */}
      {tab === 'oggi' && <Oggi />}
      {tab === 'storico' && <Storico />}
      {tab === 'nutrizione' && <Nutrizione />}

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
