import { ClaimDetailsPage } from './components/ClaimDetailsPage'
import { VisionPage } from './components/VisionPage'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/vision') return <VisionPage />
  return <ClaimDetailsPage />
}

export default App
