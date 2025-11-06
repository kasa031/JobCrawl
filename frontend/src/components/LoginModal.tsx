import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { validateEmail, validatePassword, validateName } from '../utils/validation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error;
    }
    
    if (isRegistering) {
      const nameValidation = validateName(fullName);
      if (!nameValidation.valid) {
        newErrors.fullName = nameValidation.error;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      if (isRegistering) {
        await register(email, password, fullName);
        setSuccessMessage('Konto opprettet! Sjekk e-posten din for å verifisere.');
        showToast('Konto opprettet! Sjekk e-posten din for å verifisere.', 'success');
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
        // Switch to login mode
        setIsRegistering(false);
      } else {
        await login(email, password);
        showToast('Innlogging vellykket!', 'success');
        onClose();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Noe gikk galt';
      setErrors({ email: errorMsg });
      showToast(errorMsg, 'error');
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
                {isRegistering ? 'Opprett konto' : 'Logg inn'}
              </h2>
              <button
                onClick={onClose}
                className="text-dark-text hover:text-mocca-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Error Messages */}
            {(errors.email || errors.password || errors.fullName) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 space-y-1">
                {errors.email && <p>• {errors.email}</p>}
                {errors.password && <p>• {errors.password}</p>}
                {errors.fullName && <p>• {errors.fullName}</p>}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-champagne border border-mocca-300 p-4 rounded-lg mb-4">
                <p className="text-dark-text font-bold mb-2">✅ {successMessage}</p>
                <p className="text-dark-text text-sm">
                  📧 Sjekk innboksen din for å verifisere e-postadressen din.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-dark-text font-semibold mb-2">
                    Fullt navn
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) {
                        setErrors({ ...errors, fullName: undefined });
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-lg border bg-white text-dark-text focus:outline-none ${
                      errors.fullName ? 'border-red-500' : 'border-mocca-300 focus:border-mocca-400'
                    }`}
                    required
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-dark-text font-semibold mb-2">
                  E-post
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-lg border bg-white text-dark-text focus:outline-none ${
                    errors.email ? 'border-red-500' : 'border-mocca-300 focus:border-mocca-400'
                  }`}
                  required
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-dark-text font-semibold mb-2">
                  Passord
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-lg border bg-white text-dark-text focus:outline-none ${
                    errors.password ? 'border-red-500' : 'border-mocca-300 focus:border-mocca-400'
                  }`}
                  required
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
                {isRegistering && !errors.password && (
                  <p className="text-dark-secondary text-xs mt-1">Minimum 6 tegn</p>
                )}
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
                  Logg inn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setErrors({});
                    setSuccessMessage('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isRegistering
                      ? 'bg-mocca-400 text-white'
                      : 'bg-mocca-200 text-dark-text hover:bg-mocca-300'
                  }`}
                >
                  Registrer
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mocca-400 text-white py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Laster...' : isRegistering ? 'Opprett konto' : 'Logg inn'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default LoginModal;

