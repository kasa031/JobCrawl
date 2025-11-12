import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import LoginModal from '../components/LoginModal';
import { useToast } from '../components/Toast';
import { Skeleton } from '../components/Skeleton';

function Settings() {
  const { isAuthenticated, showLoginModal, setShowLoginModal } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const profile = await profileAPI.getProfile();
      setEmailNotificationsEnabled(
        profile?.emailNotificationsEnabled !== undefined
          ? profile.emailNotificationsEnabled
          : true
      );
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Kunne ikke laste innstillinger';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await profileAPI.updateProfile({
        emailNotificationsEnabled,
      });
      showToast('Innstillinger lagret!', 'success');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Kunne ikke lagre innstillinger';
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-dark-heading mb-6">Innstillinger</h1>
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200">
            <p className="text-dark-text text-lg mb-6">
              Vennligst logg inn for å se innstillinger
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
        <h1 className="text-4xl font-bold text-dark-heading mb-6">Innstillinger</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
          Innstillinger
        </motion.h1>

        {/* Email Notifications */}
        <motion.div
          className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
            E-post varsler
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label
                htmlFor="emailNotifications"
                className="block text-dark-text dark:text-gray-300 font-semibold mb-2"
              >
                Motta e-post varsler om nye relevante jobber
              </label>
              <p className="text-sm text-dark-secondary dark:text-gray-400">
                Når aktivert, vil du motta e-post når vi finner nye jobber som matcher din profil
              </p>
            </div>
            <div className="ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={emailNotificationsEnabled}
                  onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mocca-300 dark:peer-focus:ring-mocca-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-mocca-600"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-mocca-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Lagrer...' : '💾 Lagre innstillinger'}
          </button>
        </motion.div>

        {/* Info Box */}
        <motion.div
          className="mt-6 bg-blue-100 dark:bg-blue-900 p-4 rounded-lg border border-blue-300 dark:border-blue-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            ℹ️ Informasjon
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>E-post varsler sendes kun når vi finner nye relevante jobber</li>
            <li>Jobber matches basert på din profil (ferdigheter, lokasjon, etc.)</li>
            <li>Du kan alltid endre disse innstillingene når som helst</li>
            <li>For å endre profilinformasjon, gå til "My Profile"</li>
          </ul>
        </motion.div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default Settings;

