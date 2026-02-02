import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import '../ts/config'; // Import i18n configuration
import { unregister } from '../ts/unregisterSW';

// Force unregister potential stale service workers
unregister();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
