import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { validatePassword } from '../utils/validation';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    if (!token) {
      showToast('Ugyldig eller manglende tilbakestillingslenke', 'error');
      navigate('/');
    }
  }, [token, navigate, showToast]);

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error;
    } else {
      // Check password requirements
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        newErrors.password = 'Passord må inneholde minst én stor bokstav, én liten bokstav og ett tall';
      }
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passordene må være like';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!token) {
      showToast('Ugyldig tilbakestillingslenke', 'error');
      return;
    }
    
    if (!validateForm()) {
      showToast('Vennligst rett feilene i skjemaet', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      await authAPI.resetPassword(token, newPassword);
      showToast('Passordet ditt har blitt tilbakestilt! Du kan nå logge inn.', 'success');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Kunne ikke tilbakestille passord';
      setErrors({ password: errorMsg });
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-mocca-100 p-8 rounded-lg shadow-md border border-mocca-200"
      >
        <h1 className="text-3xl font-bold text-dark-heading mb-6 text-center">
          Tilbakestill passord
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-dark-text font-semibold mb-2">
              Nytt passord
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              className={`w-full px-4 py-2 rounded-lg border bg-white text-dark-text focus:outline-none ${
                errors.password ? 'border-red-500' : 'border-mocca-300 focus:border-mocca-400'
              }`}
              required
              minLength={8}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
            {!errors.password && (
              <p className="text-dark-secondary text-xs mt-1">
                Minimum 8 tegn, må inneholde stor bokstav, liten bokstav og tall
              </p>
            )}
          </div>

          <div>
            <label className="block text-dark-text font-semibold mb-2">
              Bekreft passord
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined });
                }
              }}
              className={`w-full px-4 py-2 rounded-lg border bg-white text-dark-text focus:outline-none ${
                errors.confirmPassword ? 'border-red-500' : 'border-mocca-300 focus:border-mocca-400'
              }`}
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mocca-400 text-white py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Tilbakestiller...' : 'Tilbakestill passord'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ResetPassword;

