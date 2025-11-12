import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Filter out browser extension errors from console
// These errors come from password managers, autofill extensions, etc.
// and are not related to JobCrawl
const filterBrowserExtensionErrors = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const errorString = args.join(' ');
    // Ignore errors from browser extensions
    if (errorString.includes('content_script.js') || 
        errorString.includes('extension://') ||
        errorString.includes('moz-extension://') ||
        errorString.includes('chrome-extension://')) {
      return; // Don't log browser extension errors
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args: any[]) => {
    const warnString = args.join(' ');
    // Ignore warnings from browser extensions
    if (warnString.includes('content_script.js') || 
        warnString.includes('extension://') ||
        warnString.includes('moz-extension://') ||
        warnString.includes('chrome-extension://')) {
      return; // Don't log browser extension warnings
    }
    originalWarn.apply(console, args);
  };
  
  // Also catch unhandled errors and promises
  window.addEventListener('error', (event) => {
    if (event.filename && (
      event.filename.includes('content_script.js') ||
      event.filename.includes('extension://') ||
      event.filename.includes('moz-extension://') ||
      event.filename.includes('chrome-extension://')
    )) {
      event.preventDefault(); // Prevent error from showing in console
      return false;
    }
  }, true);
  
  window.addEventListener('unhandledrejection', (event) => {
    const errorString = event.reason?.toString() || '';
    if (errorString.includes('content_script.js') ||
        errorString.includes('extension://') ||
        errorString.includes('moz-extension://') ||
        errorString.includes('chrome-extension://')) {
      event.preventDefault(); // Prevent error from showing in console
      return false;
    }
  });
};

// Initialize error filtering
filterBrowserExtensionErrors();

// Register Service Worker for PWA (both dev and prod for Brave compatibility)
import('./utils/pwa').then(({ registerServiceWorker }) => {
  registerServiceWorker().catch(console.error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
