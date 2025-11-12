import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { schedulerAPI } from '../services/api';
import LoginModal from '../components/LoginModal';
import { useToast } from '../components/Toast';
import { Skeleton } from '../components/Skeleton';

interface SchedulerStatus {
  isRunning: boolean;
  activeIntervals: number;
}

function Scheduler() {
  const { isAuthenticated, showLoginModal, setShowLoginModal } = useAuth();
  const { showToast } = useToast();
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form state
  const [intervalHours, setIntervalHours] = useState(6);
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadStatus();
      // Poll status every 5 seconds when authenticated
      const interval = setInterval(loadStatus, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadStatus = async () => {
    try {
      const response = await schedulerAPI.getStatus();
      setStatus(response.status);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Kunne ikke laste scheduler status';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!keywords.trim() && !location.trim()) {
      showToast('Vennligst fyll inn søkeord eller lokasjon', 'error');
      return;
    }

    try {
      setActionLoading(true);
      await schedulerAPI.start(
        intervalHours || undefined,
        keywords.trim() || undefined,
        location.trim() || undefined
      );
      showToast('Scheduled scraping startet!', 'success');
      await loadStatus();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Kunne ikke starte scheduler';
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    if (!confirm('Er du sikker på at du vil stoppe scheduled scraping?')) {
      return;
    }

    try {
      setActionLoading(true);
      await schedulerAPI.stop();
      showToast('Scheduled scraping stoppet!', 'success');
      await loadStatus();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Kunne ikke stoppe scheduler';
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-dark-heading mb-6">Scheduler</h1>
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200">
            <p className="text-dark-text text-lg mb-6">
              Vennligst logg inn for å administrere scheduler
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-mocca-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg"
            >
              Logg inn
            </button>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-dark-heading mb-6">Scheduler</h1>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200">
              <Skeleton variant="text" width="60%" height={28} className="mb-4" />
              <Skeleton variant="text" width="40%" height={20} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-dark-heading mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Scheduler
        </motion.h1>

        {/* Status Card */}
        <motion.div
          className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
            Status
          </h2>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              status?.isRunning
                ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {status?.isRunning ? '🟢 Kjørende' : '⚪ Stoppet'}
            </div>
            <div className="text-dark-text dark:text-gray-300">
              Aktive intervaller: {status?.activeIntervals || 0}
            </div>
          </div>
        </motion.div>

        {/* Configuration Form */}
        <motion.div
          className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
            Konfigurasjon
          </h2>
          
          <div className="space-y-4">
            {/* Interval Hours */}
            <div>
              <label className="block text-dark-text dark:text-gray-300 font-semibold mb-2">
                Intervall (timer)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={intervalHours}
                onChange={(e) => setIntervalHours(parseInt(e.target.value) || 6)}
                disabled={status?.isRunning || actionLoading}
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-dark-text dark:text-gray-100 focus:outline-none focus:border-mocca-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-sm text-dark-secondary dark:text-gray-400 mt-1">
                Hvor ofte skal scraping kjøres (1-24 timer)
              </p>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-dark-text dark:text-gray-300 font-semibold mb-2">
                Søkeord (valgfritt)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={status?.isRunning || actionLoading}
                placeholder="F.eks. utvikler, designer, markedsføring"
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-dark-text dark:text-gray-100 focus:outline-none focus:border-mocca-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-sm text-dark-secondary dark:text-gray-400 mt-1">
                Søkeord for å filtrere jobber
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-dark-text dark:text-gray-300 font-semibold mb-2">
                Lokasjon (valgfritt)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={status?.isRunning || actionLoading}
                placeholder="F.eks. Oslo, Bergen, Trondheim"
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-dark-text dark:text-gray-100 focus:outline-none focus:border-mocca-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-sm text-dark-secondary dark:text-gray-400 mt-1">
                Lokasjon for å filtrere jobber
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {status?.isRunning ? (
            <button
              onClick={handleStop}
              disabled={actionLoading}
              className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Stopper...' : '⏹️ Stopp Scheduler'}
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={actionLoading || (!keywords.trim() && !location.trim())}
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Starter...' : '▶️ Start Scheduler'}
            </button>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          className="mt-6 bg-blue-100 dark:bg-blue-900 p-4 rounded-lg border border-blue-300 dark:border-blue-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            ℹ️ Informasjon
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Scheduler kjører automatisk scraping fra alle jobbkilder</li>
            <li>Nye jobber sendes automatisk til brukere med e-post varsler aktivert</li>
            <li>Scheduler kjører kontinuerlig til den stoppes manuelt</li>
            <li>Du kan konfigurere søkeord og lokasjon for å filtrere resultater</li>
          </ul>
        </motion.div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default Scheduler;

