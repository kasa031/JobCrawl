import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import envelopeIcon from '../assets/images/envolope.png';
import orangeMailIcon from '../assets/images/orangemailicon.png';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Ingen verifiserings-token funnet');
      return;
    }

    // Verify email
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success');
        setMessage('Du er nå registrert og kan logge inn.');
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verifisering feilet');
      });
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-dark-text">Verifiserer din e-post...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-lg shadow-md border ${
          status === 'success'
            ? 'bg-champagne border-mocca-300'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <img 
              src={status === 'success' ? orangeMailIcon : envelopeIcon} 
              alt={status === 'success' ? 'Email verified' : 'Email verification'} 
              className="w-24 h-24 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-dark-heading mb-4">
            {status === 'success' ? 'Registrering fullført!' : 'Verifisering feilet'}
          </h1>
          <p className="text-dark-text text-lg">{message}</p>
        </div>

        {status === 'success' && (
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-mocca-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg"
            >
              Gå til innlogging
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default VerifyEmail;

