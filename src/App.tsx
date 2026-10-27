import { ClaimDetailsPage } from './components/ClaimDetailsPage'
import { VisionPage } from './components/VisionPage'
import { Vision2Page } from './components/Vision2Page'
import { Vision2027Page } from './components/Vision2027Page'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/vision2027') return <Vision2027Page />
  if (path === '/vision2') return <Vision2Page />
  if (path === '/vision') return <VisionPage />
  return <ClaimDetailsPage />
}

export default App
