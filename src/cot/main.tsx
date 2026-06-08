import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import COTApp from './COTApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <COTApp />
  </StrictMode>,
)
