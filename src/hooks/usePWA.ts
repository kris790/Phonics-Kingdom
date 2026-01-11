// usePWA Hook - PWA functionality for React components
import { useState, useEffect, useCallback } from 'react';
import { pwaUtils } from '../serviceWorkerRegistration';

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  cacheSize: number;
  updateAvailable: boolean;
}

interface UsePWAReturn extends PWAState {
  promptInstall: () => Promise<boolean>;
  refreshApp: () => void;
}

export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<PWAState>({
    isOnline: navigator.onLine,
    isInstalled: pwaUtils.isInstalled(),
    isInstallable: false,
    cacheSize: 0,
    updateAvailable: false,
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    const handleInstallAvailable = () => {
      setState((prev) => ({ ...prev, isInstallable: true }));
    };

    const handleInstalled = () => {
      setState((prev) => ({ ...prev, isInstalled: true, isInstallable: false }));
    };

    // Listen for custom PWA events
    document.addEventListener('pwa-online', handleOnline);
    document.addEventListener('pwa-offline', handleOffline);
    document.addEventListener('pwa-install-available', handleInstallAvailable);
    document.addEventListener('pwa-installed', handleInstalled);

    // Also listen to native events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check cache size on mount
    pwaUtils.getCacheSize().then((size) => {
      setState((prev) => ({ ...prev, cacheSize: size }));
    });

    return () => {
      document.removeEventListener('pwa-online', handleOnline);
      document.removeEventListener('pwa-offline', handleOffline);
      document.removeEventListener('pwa-install-available', handleInstallAvailable);
      document.removeEventListener('pwa-installed', handleInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Prompt install
  const promptInstall = useCallback(async (): Promise<boolean> => {
    try {
      const accepted = await pwaUtils.promptInstall();
      if (accepted) {
        setState((prev) => ({ ...prev, isInstalled: true, isInstallable: false }));
      }
      return accepted;
    } catch {
      return false;
    }
  }, []);

  // Refresh the app
  const refreshApp = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    ...state,
    promptInstall,
    refreshApp,
  };
}

export default usePWA;
