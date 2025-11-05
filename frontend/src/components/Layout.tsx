import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { showLoginModal, setShowLoginModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/jobs', label: 'Jobs' },
    { path: '/ai-generate', label: 'AI Generate' },
    { path: '/applications', label: 'Applications' },
    { path: '/profile', label: 'My Profile' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const showMenu = isMenuOpen || isHovered;

  return (
    <div className="min-h-screen bg-mocca-50">
      {/* Header */}
      <header className="bg-mocca-100 shadow-md relative">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            {/* JobCrawl Logo with Hover Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Link 
                to="/" 
                className="text-2xl font-bold text-dark-heading hover:text-mocca-600 transition-colors flex items-center gap-2"
              >
                JobCrawl
                <svg
                  className={`w-5 h-5 text-mocca-600 transition-transform duration-200 ${
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
              </Link>

              {/* Desktop Dropdown Menu (Hover) */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-mocca-200 overflow-hidden z-50"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
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
                          className={`block px-4 py-3 text-dark-text hover:bg-mocca-100 transition-colors font-semibold border-b border-mocca-100 last:border-b-0 ${
                            isActive(item.path) ? 'bg-mocca-200 text-mocca-700' : ''
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

            {/* Mobile/Tablet Menu Button */}
            <div className="md:hidden relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-mocca-200 transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-dark-heading"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Mobile Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-mocca-200 overflow-hidden z-50"
                    onMouseLeave={() => setIsMenuOpen(false)}
                  >
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-4 py-3 text-dark-text hover:bg-mocca-100 transition-colors font-semibold ${
                            isActive(item.path) ? 'bg-mocca-200 text-mocca-700' : ''
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
      <footer className="bg-mocca-100 mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-dark-secondary">
          <p className="font-semibold">JobCrawl - Intelligent Job Application Assistant</p>
          <p className="text-sm mt-2">© 2026 Bachelor Project</p>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

export default Layout;

