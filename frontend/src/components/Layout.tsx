import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import OfflineIndicator from './OfflineIndicator';
import InstallPrompt from './InstallPrompt';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Layout() {
  const { showLoginModal, setShowLoginModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/jobs', label: 'Jobs' },
    { path: '/ai-generate', label: 'AI Generate' },
    { path: '/applications', label: 'Applications' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/scheduler', label: 'Scheduler' },
    { path: '/settings', label: 'Settings' },
    { path: '/profile', label: 'My Profile' },
    { path: '/about', label: 'Om meg' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const showMenu = isHovered || isMenuOpen;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMenuOpen && !target.closest('.relative')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-mocca-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Header */}
      <header className="bg-mocca-100 dark:bg-gray-800 shadow-md relative transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            {/* JobCrawl Logo with Hover/Click Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="text-2xl font-bold text-dark-heading dark:text-gray-100 hover:text-mocca-600 dark:hover:text-mocca-400 transition-colors"
                >
                  JobCrawl
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="text-mocca-600 hover:text-mocca-700 dark:text-mocca-400 dark:hover:text-mocca-300 transition-colors"
                  aria-label="Toggle menu"
                  aria-expanded={showMenu}
                >
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      showMenu ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Dropdown Menu (Hover/Click) */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-mocca-200 dark:border-gray-700 overflow-hidden z-50 transition-colors duration-300"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => {
                      setIsHovered(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsHovered(false);
                          }}
                          className={`block px-4 py-3 text-dark-text dark:text-gray-100 hover:bg-mocca-100 dark:hover:bg-gray-700 transition-colors font-semibold border-b border-mocca-100 dark:border-gray-700 last:border-b-0 ${
                            isActive(item.path) ? 'bg-mocca-200 dark:bg-gray-700 text-mocca-700 dark:text-mocca-300' : ''
                          }`}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-mocca-200 dark:hover:bg-mocca-700 transition-colors"
                aria-label={theme === 'dark' ? 'Bytt til lyst modus' : 'Bytt til mørk modus'}
                title={theme === 'dark' ? 'Lys modus' : 'Mørk modus'}
              >
                {theme === 'dark' ? (
                  <svg className="w-6 h-6 text-dark-heading dark:text-mocca-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-dark-heading dark:text-mocca-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <motion.main 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.main>

      {/* Footer */}
      <footer className="bg-mocca-100 dark:bg-gray-800 mt-12 py-8 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center text-dark-secondary dark:text-gray-400">
          <p className="font-semibold">JobCrawl - Intelligent Job Application Assistant</p>
          <p className="text-sm mt-2">© 2026 ms.tery</p>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

export default Layout;

