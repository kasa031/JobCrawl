import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { showLoginModal, setShowLoginModal } = useAuth();

  return (
    <div className="min-h-screen bg-mocca-50">
      {/* Header */}
      <header className="bg-mocca-100 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-dark-heading">
              JobCrawl
            </Link>
            <div className="flex gap-6">
              <Link 
                to="/jobs" 
                className="text-dark-text hover:text-mocca-600 transition-colors font-semibold"
              >
                Jobs
              </Link>
              <Link 
                to="/ai-generate" 
                className="text-dark-text hover:text-mocca-600 transition-colors font-semibold"
              >
                AI Generate
              </Link>
              <Link 
                to="/applications" 
                className="text-dark-text hover:text-mocca-600 transition-colors font-semibold"
              >
                Applications
              </Link>
              <Link 
                to="/profile" 
                className="text-dark-text hover:text-mocca-600 transition-colors font-semibold"
              >
                My Profile
              </Link>
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

