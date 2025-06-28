import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfills for browser environment
import { Buffer } from 'buffer';

// Make Buffer available globally for Solana libraries
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).Buffer = Buffer;
  (window as any).process = {
    env: {},
    version: '',
    platform: 'browser',
    nextTick: (fn: () => void) => setTimeout(fn, 0),
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);