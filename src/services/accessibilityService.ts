// Accessibility Service - WCAG 2.1 AA Compliance
// Provides utilities for screen readers, keyboard navigation, and reduced motion

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  keyboardNavigationEnabled: boolean;
  focusIndicatorVisible: boolean;
}

// Default settings
const DEFAULT_SETTINGS: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderMode: false,
  keyboardNavigationEnabled: true,
  focusIndicatorVisible: true,
};

// Detect user preferences from system settings
function detectSystemPreferences(): Partial<AccessibilitySettings> {
  const preferences: Partial<AccessibilitySettings> = {};

  // Check for reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    preferences.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    preferences.highContrast = window.matchMedia('(prefers-contrast: more)').matches;
  }

  return preferences;
}

class AccessibilityService {
  private settings: AccessibilitySettings;
  private listeners: Set<(settings: AccessibilitySettings) => void> = new Set();
  private focusTrap: HTMLElement | null = null;
  private lastFocusedElement: HTMLElement | null = null;

  constructor() {
    // Merge default settings with system preferences
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...detectSystemPreferences(),
    };

    // Load saved settings from localStorage
    this.loadSettings();

    // Listen for system preference changes
    this.setupSystemListeners();

    // Apply initial settings
    this.applySettings();
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('phonics-kingdom-a11y');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (e) {
      console.warn('[A11y] Failed to load settings:', e);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('phonics-kingdom-a11y', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[A11y] Failed to save settings:', e);
    }
  }

  private setupSystemListeners(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    // Listen for reduced motion changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      this.updateSetting('reducedMotion', e.matches);
    });

    // Listen for high contrast changes
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    contrastQuery.addEventListener('change', (e) => {
      this.updateSetting('highContrast', e.matches);
    });
  }

  private applySettings(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply reduced motion
    if (this.settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply high contrast
    if (this.settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply large text
    if (this.settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Apply screen reader mode
    if (this.settings.screenReaderMode) {
      root.setAttribute('data-screen-reader', 'true');
    } else {
      root.removeAttribute('data-screen-reader');
    }

    // Apply focus indicator visibility
    if (this.settings.focusIndicatorVisible) {
      root.classList.add('show-focus');
    } else {
      root.classList.remove('show-focus');
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn(this.settings));
  }

  // ============================================
  // Public API
  // ============================================

  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  updateSetting<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ): void {
    this.settings[key] = value;
    this.saveSettings();
    this.applySettings();
    this.notifyListeners();
  }

  updateSettings(updates: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    this.applySettings();
    this.notifyListeners();
  }

  subscribe(callback: (settings: AccessibilitySettings) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // ============================================
  // Screen Reader Utilities
  // ============================================

  /**
   * Announce a message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcer = document.getElementById('a11y-announcer') || this.createAnnouncer();
    announcer.setAttribute('aria-live', priority);
    
    // Clear and set new message (triggers announcement)
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }

  private createAnnouncer(): HTMLElement {
    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(announcer);
    return announcer;
  }

  // ============================================
  // Focus Management
  // ============================================

  /**
   * Trap focus within an element (for modals)
   */
  trapFocus(element: HTMLElement): void {
    this.focusTrap = element;
    this.lastFocusedElement = document.activeElement as HTMLElement;

    const focusableElements = this.getFocusableElements(element);
    if (focusableElements.length === 0) return;

    // Focus first focusable element
    focusableElements[0].focus();

    // Handle tab key
    element.addEventListener('keydown', this.handleFocusTrap);
  }

  /**
   * Release focus trap
   */
  releaseFocus(): void {
    if (this.focusTrap) {
      this.focusTrap.removeEventListener('keydown', this.handleFocusTrap);
      this.focusTrap = null;
    }

    // Restore focus to previously focused element
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  }

  private handleFocusTrap = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab' || !this.focusTrap) return;

    const focusableElements = this.getFocusableElements(this.focusTrap);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(selector))
      .filter(el => el.offsetParent !== null); // Visible elements only
  }

  // ============================================
  // Keyboard Navigation
  // ============================================

  /**
   * Handle arrow key navigation in a grid/list
   */
  handleArrowNavigation(
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    options: { wrap?: boolean; horizontal?: boolean } = {}
  ): number {
    const { wrap = true, horizontal = false } = options;
    let newIndex = currentIndex;

    const isNext = horizontal ? e.key === 'ArrowRight' : e.key === 'ArrowDown';
    const isPrev = horizontal ? e.key === 'ArrowLeft' : e.key === 'ArrowUp';

    if (isNext) {
      newIndex = currentIndex + 1;
      if (newIndex >= items.length) {
        newIndex = wrap ? 0 : items.length - 1;
      }
    } else if (isPrev) {
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = wrap ? items.length - 1 : 0;
      }
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus();
    }

    return newIndex;
  }

  // ============================================
  // Animation Helpers
  // ============================================

  /**
   * Get animation duration based on reduced motion preference
   */
  getAnimationDuration(normalMs: number): number {
    return this.settings.reducedMotion ? 0 : normalMs;
  }

  /**
   * Get animation class based on reduced motion preference
   */
  shouldAnimate(): boolean {
    return !this.settings.reducedMotion;
  }
}

// Singleton instance
export const a11yService = new AccessibilityService();

// React hook for accessibility settings
export function useAccessibility() {
  // This is just the service interface - actual React hook is in hooks/useAccessibility.ts
  return a11yService;
}
