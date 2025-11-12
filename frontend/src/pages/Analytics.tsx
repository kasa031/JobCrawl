import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import LoginModal from '../components/LoginModal';
import { useToast } from '../components/Toast';
import { Skeleton } from '../components/Skeleton';

interface Analytics {
  overview: {
    totalJobs: number;
    totalApplications: number;
    totalFavorites: number;
  };
  statusBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  monthlyApplications: Array<{ month: string; count: number }>;
  recentApplications: Array<{
    id: string;
    status: string;
    createdAt: string;
    jobTitle: string;
    company: string;
  }>;
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Utkast',
  PENDING: 'Venter',
  SENT: 'Sendt',
  VIEWED: 'Sett',
  REJECTED: 'Avslått',
  ACCEPTED: 'Akseptert',
  INTERVIEW: 'Intervju',
  OFFER: 'Tilbud',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-200 text-gray-700',
  PENDING: 'bg-yellow-200 text-yellow-700',
  SENT: 'bg-blue-200 text-blue-700',
  VIEWED: 'bg-purple-200 text-purple-700',
  REJECTED: 'bg-red-200 text-red-700',
  ACCEPTED: 'bg-green-200 text-green-700',
  INTERVIEW: 'bg-indigo-200 text-indigo-700',
  OFFER: 'bg-emerald-200 text-emerald-700',
};

function Analytics() {
  const { isAuthenticated, showLoginModal, setShowLoginModal } = useAuth();
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAnalytics();
      setAnalytics(response.analytics);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Kunne ikke laste analytics';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-dark-heading mb-6">Analytics</h1>
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200">
            <p className="text-dark-text text-lg mb-6">
              Vennligst logg inn for å se analytics
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-dark-heading mb-6">Analytics</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200">
              <Skeleton variant="text" width="60%" height={28} className="mb-4" />
              <Skeleton variant="text" width="40%" height={20} className="mb-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-dark-heading mb-6">Analytics</h1>
        <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200 text-center">
          <p className="text-dark-text text-lg">
            Ingen analytics data tilgjengelig
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-dark-heading mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Analytics
        </motion.h1>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-4xl font-bold text-mocca-600 dark:text-mocca-400 mb-2">
              {analytics.overview.totalJobs.toLocaleString('no-NO')}
            </div>
            <div className="text-dark-text dark:text-gray-300 font-semibold">
              Jobber funnet
            </div>
          </motion.div>
          <motion.div
            className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {analytics.overview.totalApplications.toLocaleString('no-NO')}
            </div>
            <div className="text-dark-text dark:text-gray-300 font-semibold">
              Søknader sendt
            </div>
          </motion.div>
          <motion.div
            className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
              {analytics.overview.totalFavorites.toLocaleString('no-NO')}
            </div>
            <div className="text-dark-text dark:text-gray-300 font-semibold">
              Favoritter
            </div>
          </motion.div>
        </div>

        {/* Status Breakdown */}
        {Object.keys(analytics.statusBreakdown).length > 0 && (
          <motion.div
            className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
              Søknadsstatus
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                <div
                  key={status}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-mocca-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        statusColors[status] || statusColors.PENDING
                      }`}
                    >
                      {statusLabels[status] || status}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-dark-heading dark:text-gray-100">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Source Breakdown */}
        {Object.keys(analytics.sourceBreakdown).length > 0 && (
          <motion.div
            className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
              Jobber etter kilde
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.sourceBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => (
                  <div
                    key={source}
                    className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-mocca-200 dark:border-gray-600"
                  >
                    <div className="text-sm text-dark-secondary dark:text-gray-400 mb-1">
                      {source}
                    </div>
                    <div className="text-2xl font-bold text-dark-heading dark:text-gray-100">
                      {count.toLocaleString('no-NO')}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Monthly Applications */}
        {analytics.monthlyApplications.length > 0 && (
          <motion.div
            className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
              Søknader per måned (siste 6 måneder)
            </h2>
            <div className="space-y-3">
              {analytics.monthlyApplications.map((item) => {
                const maxCount = Math.max(...analytics.monthlyApplications.map((m) => m.count));
                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item.month} className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-dark-text dark:text-gray-300 font-semibold">
                        {new Date(item.month + '-01').toLocaleDateString('no-NO', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </span>
                      <span className="text-dark-heading dark:text-gray-100 font-bold">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-mocca-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-mocca-600 dark:bg-mocca-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recent Applications */}
        {analytics.recentApplications.length > 0 && (
          <motion.div
            className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
              Nylige søknader
            </h2>
            <div className="space-y-3">
              {analytics.recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-mocca-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-dark-heading dark:text-gray-100">
                        {app.jobTitle}
                      </div>
                      <div className="text-sm text-dark-secondary dark:text-gray-400">
                        {app.company}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          statusColors[app.status] || statusColors.PENDING
                        }`}
                      >
                        {statusLabels[app.status] || app.status}
                      </span>
                      <span className="text-sm text-dark-secondary dark:text-gray-400">
                        {new Date(app.createdAt).toLocaleDateString('no-NO')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default Analytics;

