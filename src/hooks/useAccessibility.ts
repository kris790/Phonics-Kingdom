// Accessibility Hook - React integration for a11y features
import { useState, useEffect, useCallback } from 'react';
import { a11yService, AccessibilitySettings } from '../services/accessibilityService';

/**
 * Hook for accessing and updating accessibility settings
 */
export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(a11yService.getSettings());

  useEffect(() => {
    // Subscribe to settings changes
    const unsubscribe = a11yService.subscribe(setSettings);
    return unsubscribe;
  }, []);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    a11yService.updateSetting(key, value);
  }, []);

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    a11yService.updateSettings(updates);
  }, []);

  return {
    settings,
    updateSetting,
    updateSettings,
    announce: a11yService.announce.bind(a11yService),
    trapFocus: a11yService.trapFocus.bind(a11yService),
    releaseFocus: a11yService.releaseFocus.bind(a11yService),
    shouldAnimate: settings.reducedMotion === false,
    getAnimationDuration: (ms: number) => settings.reducedMotion ? 0 : ms,
  };
}

/**
 * Hook for screen reader announcements
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    a11yService.announce(message, priority);
  }, []);

  return announce;
}

/**
 * Hook for keyboard navigation in lists/grids
 */
export function useKeyboardNavigation(
  itemCount: number,
  options: {
    horizontal?: boolean;
    wrap?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const { horizontal = false, wrap = true, onSelect } = options;

    let newIndex = currentIndex;
    const isNext = horizontal ? e.key === 'ArrowRight' : e.key === 'ArrowDown';
    const isPrev = horizontal ? e.key === 'ArrowLeft' : e.key === 'ArrowUp';

    if (isNext) {
      e.preventDefault();
      newIndex = currentIndex + 1;
      if (newIndex >= itemCount) {
        newIndex = wrap ? 0 : itemCount - 1;
      }
    } else if (isPrev) {
      e.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = wrap ? itemCount - 1 : 0;
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(currentIndex);
      return;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = itemCount - 1;
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, itemCount, options]);

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
    getItemProps: (index: number) => ({
      tabIndex: index === currentIndex ? 0 : -1,
      'aria-selected': index === currentIndex,
      onFocus: () => setCurrentIndex(index),
    }),
  };
}

/**
 * Hook for focus trap in modals/dialogs
 */
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (isActive) {
      const activeElement = document.activeElement as HTMLElement;
      return () => {
        // Return focus when modal closes
        activeElement?.focus?.();
      };
    }
  }, [isActive]);

  const setTrapRef = useCallback((element: HTMLElement | null) => {
    if (element && isActive) {
      a11yService.trapFocus(element);
    } else if (!isActive) {
      a11yService.releaseFocus();
    }
  }, [isActive]);

  return setTrapRef;
}

/**
 * Hook for reduced motion detection
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
}

export default useAccessibility;
