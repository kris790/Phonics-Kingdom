import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.phonicskingdom.app',
  appName: 'Phonics Kingdom',
  webDir: 'build',
  
  // Server configuration for development
  server: {
    // Allow loading from localhost during development
    androidScheme: 'https',
    iosScheme: 'https',
  },
  
  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    // Disable bouncing for game feel
    scrollEnabled: false,
  },
  
  // Android specific configuration  
  android: {
    // Use dark splash screen to match app theme
    backgroundColor: '#0f172a',
    // Allow mixed content for local + remote resources
    allowMixedContent: true,
  },
  
  // Plugin configurations
  plugins: {
    // Splash screen configuration
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    
    // Keyboard configuration for input tasks
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    
    // Status bar configuration
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
