import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AutoHealErrorBoundary } from './components/AutoHealErrorBoundary';
import { registerServiceWorker } from './utils/offlineStorage';

// Register Service Worker for offline PWA caching
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AutoHealErrorBoundary>
      <App />
    </AutoHealErrorBoundary>
  </StrictMode>,
);


