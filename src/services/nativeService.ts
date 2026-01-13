// Native Service - Capacitor bridge for native app features
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { App } from '@capacitor/app';
import { nativeStorageService } from './nativeStorageService';

// Check if running in native app
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Get current platform
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

// Native initialization
export const initializeNative = async (): Promise<void> => {
  if (!isNative()) {
    console.log('🌐 Running in web mode');
    return;
  }

  console.log(`📱 Running in native mode (${getPlatform()})`);

  try {
    // Migrate localStorage to native storage (first launch after install)
    const migrated = await nativeStorageService.migrateFromLocalStorage();
    if (migrated) {
      console.log('📦 Data migrated to native storage');
    }

    // Log storage info
    const storageInfo = await nativeStorageService.getStorageInfo();
    console.log('📦 Storage:', storageInfo);

    // Configure status bar
    await StatusBar.setStyle({ style: Style.Dark });
    if (getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0f172a' });
    }

    // Hide splash screen after app is ready
    await SplashScreen.hide();

    // Set up keyboard listeners for form inputs
    Keyboard.addListener('keyboardWillShow', (info) => {
      console.log('⌨️ Keyboard will show, height:', info.keyboardHeight);
      document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      console.log('⌨️ Keyboard will hide');
      document.body.style.setProperty('--keyboard-height', '0px');
    });

    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log(`📱 App ${isActive ? 'resumed' : 'backgrounded'}`);
      // Pause audio when app backgrounds
      if (!isActive) {
        document.dispatchEvent(new CustomEvent('app-backgrounded'));
      } else {
        document.dispatchEvent(new CustomEvent('app-resumed'));
      }
    });

    // Handle back button (Android)
    App.addListener('backButton', ({ canGoBack }) => {
      console.log('🔙 Back button pressed, canGoBack:', canGoBack);
      if (canGoBack) {
        window.history.back();
      } else {
        // Optionally exit app or show confirmation
        document.dispatchEvent(new CustomEvent('app-back-pressed'));
      }
    });

    console.log('✅ Native initialization complete');
  } catch (error) {
    console.error('❌ Native initialization failed:', error);
  }
};

// Haptic feedback for game interactions
export const haptics = {
  // Light tap - for button presses
  tap: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available
    }
  },

  // Medium impact - for correct answers
  success: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      // Haptics not available
    }
  },

  // Warning vibration - for incorrect answers
  warning: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {
      // Haptics not available
    }
  },

  // Error vibration - for errors
  error: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {
      // Haptics not available
    }
  },

  // Heavy impact - for level complete
  celebrate: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      // Double tap for celebration
      setTimeout(() => Haptics.impact({ style: ImpactStyle.Medium }), 100);
    } catch (e) {
      // Haptics not available
    }
  },
};

// Keyboard control
export const keyboard = {
  hide: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await Keyboard.hide();
    } catch (e) {
      // Keyboard not available
    }
  },

  show: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await Keyboard.show();
    } catch (e) {
      // Keyboard not available
    }
  },
};

// Splash screen control
export const splash = {
  show: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await SplashScreen.show({
        autoHide: false,
      });
    } catch (e) {
      // Splash screen not available
    }
  },

  hide: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await SplashScreen.hide();
    } catch (e) {
      // Splash screen not available
    }
  },
};

// Status bar control
export const statusBar = {
  hide: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await StatusBar.hide();
    } catch (e) {
      // Status bar not available
    }
  },

  show: async (): Promise<void> => {
    if (!isNative()) return;
    try {
      await StatusBar.show();
    } catch (e) {
      // Status bar not available
    }
  },
};

// Export all as default service
export const nativeService = {
  isNative,
  getPlatform,
  initialize: initializeNative,
  haptics,
  keyboard,
  splash,
  statusBar,
};

export default nativeService;
