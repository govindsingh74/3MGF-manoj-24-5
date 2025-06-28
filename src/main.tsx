import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfills for browser environment
import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer and process available globally
(globalThis as typeof globalThis & { Buffer: typeof Buffer; process: typeof process }).Buffer = Buffer;
(globalThis as typeof globalThis & { Buffer: typeof Buffer; process: typeof process }).process = process;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);