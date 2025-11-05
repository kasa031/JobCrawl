import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!fullName) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        await register(email, password, fullName);
        setSuccessMessage('Account created! Check your email to verify.');
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
        // Switch to login mode
        setIsRegistering(false);
      } else {
        await login(email, password);
        onClose();
      }
      // Don't close modal if registering - user needs to verify email first
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-mocca-50 rounded-lg shadow-xl max-w-md w-full mx-4"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dark-heading">
                {isRegistering ? 'Create Account' : 'Sign In'}
              </h2>
              <button
                onClick={onClose}
                className="text-dark-text hover:text-mocca-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-champagne border border-mocca-300 p-4 rounded-lg mb-4">
                <p className="text-dark-text font-bold mb-2">✅ {successMessage}</p>
                <p className="text-dark-text text-sm">
                  📧 Please check your inbox to verify your email address.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-dark-text font-semibold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-dark-text font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                  required
                />
              </div>

              <div>
                <label className="block text-dark-text font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    !isRegistering
                      ? 'bg-mocca-400 text-white'
                      : 'bg-mocca-200 text-dark-text hover:bg-mocca-300'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isRegistering
                      ? 'bg-mocca-400 text-white'
                      : 'bg-mocca-200 text-dark-text hover:bg-mocca-300'
                  }`}
                >
                  Register
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mocca-400 text-white py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : isRegistering ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default LoginModal;

