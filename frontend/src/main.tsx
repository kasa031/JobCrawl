import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary.tsx'

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
