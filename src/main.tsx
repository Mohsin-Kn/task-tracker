import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PassphraseGate } from './components/PassphraseGate.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PassphraseGate>
      <App />
    </PassphraseGate>
  </StrictMode>,
)
