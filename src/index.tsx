import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { initializeNative, isNative } from './services/nativeService';
import { initializeNativeTTS, isNativeTTS } from './services/nativeTTSService';

// Initialize native features if running in Capacitor
Promise.all([
  initializeNative(),
  initializeNativeTTS(),
]).then(() => {
  console.log('[App] Native initialization complete');
  console.log('[App] Platform:', isNative() ? 'Native App' : 'Web/PWA');
  console.log('[App] TTS Engine:', isNativeTTS() ? 'Native (fast)' : 'Web Speech API');
}).catch(error => {
  console.warn('[App] Native initialization failed:', error);
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline functionality (web/PWA only)
// In native apps, Capacitor handles offline bundling
if (!isNative()) {
  serviceWorkerRegistration.register({
    onSuccess: () => {
      console.log('[App] Content cached for offline use');
    },
    onUpdate: () => {
      console.log('[App] New version available');
    },
    onOffline: () => {
      console.log('[App] Running in offline mode');
    },
    onOnline: () => {
      console.log('[App] Back online');
    },
  });
} else {
  console.log('[App] Native app - skipping service worker registration');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
