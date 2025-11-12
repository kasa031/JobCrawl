/**
 * PWA Utility Functions
 * Handles service worker registration and PWA features
 */

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      // Try to register service worker - works for both dev and prod
      // In dev, Vite PWA plugin serves sw.js from dev server
      // In prod, it's served from /JobCrawl/sw.js
      const swPath = import.meta.env.PROD ? '/JobCrawl/sw.js' : '/sw.js';
      const swScope = import.meta.env.PROD ? '/JobCrawl/' : '/';
      
      const registration = await navigator.serviceWorker.register(swPath, {
        scope: swScope
      });
      
      console.log('Service Worker registered:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
              // You can show a notification to the user here
            }
          });
        }
      });
      
      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('Service Worker unregistered');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
};

export const isPWAInstalled = (): boolean => {
  // Check if app is running in standalone mode (installed)
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

export const showInstallPrompt = async (): Promise<void> => {
  // This will be handled by the beforeinstallprompt event
  // See PWA_INSTALL_COMPONENT.md for implementation
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return 'denied';
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
};

