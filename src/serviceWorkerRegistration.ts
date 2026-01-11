// Service Worker Registration for Phonics Kingdom PWA
// Handles registration, updates, and offline status

type UpdateCallback = (registration: ServiceWorkerRegistration) => void;

interface Config {
  onSuccess?: UpdateCallback;
  onUpdate?: UpdateCallback;
  onOffline?: () => void;
  onOnline?: () => void;
}

// Check if service workers are supported
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config?: Config): void {
  // Only register service worker in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[PWA] Service worker disabled in development mode');
    return;
  }

  if ('serviceWorker' in navigator) {
    // Wait for page load to not block initial render
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Running on localhost - check if SW is valid
        checkValidServiceWorker(swUrl, config);
        
        navigator.serviceWorker.ready.then(() => {
          console.log('[PWA] App is being served cache-first by service worker.');
        });
      } else {
        // Production - register service worker
        registerValidSW(swUrl, config);
      }
    });

    // Listen for online/offline events
    setupNetworkListeners(config);
  } else {
    console.log('[PWA] Service workers not supported');
  }
}

function registerValidSW(swUrl: string, config?: Config): void {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[PWA] Service worker registered');

      // Check for updates periodically (every 5 minutes)
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available - notify user
              console.log('[PWA] New content available; please refresh.');
              
              if (config?.onUpdate) {
                config.onUpdate(registration);
              }

              // Show update prompt to user
              showUpdatePrompt(registration);
            } else {
              // Content cached for offline use
              console.log('[PWA] Content cached for offline use.');
              
              if (config?.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[PWA] Service worker registration failed:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config): void {
  // Check if the service worker can be found
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found - probably a different app
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found - proceed with registration
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[PWA] No internet connection. App running in offline mode.');
      if (config?.onOffline) {
        config.onOffline();
      }
    });
}

function setupNetworkListeners(config?: Config): void {
  window.addEventListener('online', () => {
    console.log('[PWA] Back online');
    if (config?.onOnline) {
      config.onOnline();
    }
    // Notify the app about network status
    document.dispatchEvent(new CustomEvent('pwa-online'));
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] Gone offline');
    if (config?.onOffline) {
      config.onOffline();
    }
    // Notify the app about network status
    document.dispatchEvent(new CustomEvent('pwa-offline'));
  });
}

function showUpdatePrompt(registration: ServiceWorkerRegistration): void {
  // Create a subtle update banner
  const banner = document.createElement('div');
  banner.id = 'pwa-update-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #2dd4bf 0%, #a855f7 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: system-ui, sans-serif;
      z-index: 10000;
      animation: slideUp 0.3s ease-out;
    ">
      <span>✨ New version available!</span>
      <button id="pwa-update-btn" style="
        background: white;
        color: #2dd4bf;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      ">Update Now</button>
      <button id="pwa-dismiss-btn" style="
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
      ">×</button>
    </div>
    <style>
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    </style>
  `;

  document.body.appendChild(banner);

  document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
    // Tell service worker to skip waiting
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    banner.remove();
    window.location.reload();
  });

  document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
    banner.remove();
  });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[PWA] Unregister failed:', error);
      });
  }
}

// Utility functions for the app to interact with the service worker
export const pwaUtils = {
  // Check if app is installed
  isInstalled: (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  },

  // Check if online
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  // Request cache size from service worker
  getCacheSize: (): Promise<number> => {
    return new Promise((resolve) => {
      if (!navigator.serviceWorker.controller) {
        resolve(0);
        return;
      }

      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data.cacheSize || 0);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [channel.port2]
      );

      // Timeout after 1 second
      setTimeout(() => resolve(0), 1000);
    });
  },

  // Pre-cache audio files
  cacheAudioFiles: (urls: string[]): void => {
    navigator.serviceWorker.controller?.postMessage({
      type: 'CACHE_AUDIO',
      urls,
    });
  },

  // Show install prompt (for browsers that support it)
  promptInstall: async (): Promise<boolean> => {
    const deferredPrompt = (window as Window & { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
    
    if (!deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clear the prompt
    (window as Window & { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = undefined;
    
    return outcome === 'accepted';
  },
};

// Capture the install prompt for later use
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as Window & { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = e as BeforeInstallPromptEvent;
  console.log('[PWA] Install prompt captured');
  
  // Dispatch event so app can show custom install button
  document.dispatchEvent(new CustomEvent('pwa-install-available'));
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');
  (window as Window & { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = undefined;
  document.dispatchEvent(new CustomEvent('pwa-installed'));
});
