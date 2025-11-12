import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, schedulerAPI } from '../services/api';
import LoginModal from '../components/LoginModal';
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

interface SchedulerStatus {
  isRunning: boolean;
  activeIntervals: number;
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

function Dashboard() {
  const { isAuthenticated, showLoginModal, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      // Refresh data every 30 seconds
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, schedulerResponse] = await Promise.allSettled([
        analyticsAPI.getAnalytics(),
        schedulerAPI.getStatus(),
      ]);

      if (analyticsResponse.status === 'fulfilled') {
        setAnalytics(analyticsResponse.value.analytics);
      }

      if (schedulerResponse.status === 'fulfilled') {
        setSchedulerStatus(schedulerResponse.value.status);
      }
    } catch (error: any) {
      // Silently fail - dashboard will show partial data
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-dark-heading mb-6">Dashboard</h1>
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200">
            <p className="text-dark-text text-lg mb-6">
              Vennligst logg inn for å se dashboard
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

  if (loading && !analytics) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-dark-heading mb-6">Dashboard</h1>
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <motion.h1
            className="text-4xl font-bold text-dark-heading"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Dashboard
          </motion.h1>
          <button
            onClick={loadDashboardData}
            className="bg-mocca-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors text-sm"
          >
            🔄 Oppdater
          </button>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              className="bg-gradient-to-br from-mocca-400 to-mocca-600 text-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl font-bold mb-2">
                {analytics.overview.totalJobs.toLocaleString('no-NO')}
              </div>
              <div className="text-mocca-100 font-semibold">Jobber tilgjengelig</div>
              <button
                onClick={() => navigate('/jobs')}
                className="mt-4 text-sm underline hover:text-white transition-colors"
              >
                Se alle jobber →
              </button>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl font-bold mb-2">
                {analytics.overview.totalApplications.toLocaleString('no-NO')}
              </div>
              <div className="text-blue-100 font-semibold">Søknader sendt</div>
              <button
                onClick={() => navigate('/applications')}
                className="mt-4 text-sm underline hover:text-white transition-colors"
              >
                Se søknader →
              </button>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-red-500 to-red-700 text-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl font-bold mb-2">
                {analytics.overview.totalFavorites.toLocaleString('no-NO')}
              </div>
              <div className="text-red-100 font-semibold">Favoritter</div>
              <button
                onClick={() => navigate('/jobs')}
                className="mt-4 text-sm underline hover:text-white transition-colors"
              >
                Se favoritter →
              </button>
            </motion.div>
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
            Hurtighandlinger
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/jobs')}
              className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-semibold text-dark-heading dark:text-gray-100">Søk jobber</div>
              <div className="text-sm text-dark-secondary dark:text-gray-400">Finn nye stillinger</div>
            </button>
            <button
              onClick={() => navigate('/ai-generate')}
              className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-2xl mb-2">✍️</div>
              <div className="font-semibold text-dark-heading dark:text-gray-100">Generer søknadsbrev</div>
              <div className="text-sm text-dark-secondary dark:text-gray-400">AI-drevet generering</div>
            </button>
            <button
              onClick={() => navigate('/applications')}
              className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold text-dark-heading dark:text-gray-100">Mine søknader</div>
              <div className="text-sm text-dark-secondary dark:text-gray-400">Se status</div>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-dark-heading dark:text-gray-100">Analytics</div>
              <div className="text-sm text-dark-secondary dark:text-gray-400">Detaljert statistikk</div>
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Scheduler Status */}
          {schedulerStatus && (
            <motion.div
              className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100">
                  Scheduler Status
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  schedulerStatus.isRunning
                    ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {schedulerStatus.isRunning ? '🟢 Kjørende' : '⚪ Stoppet'}
                </div>
              </div>
              <p className="text-dark-text dark:text-gray-300 mb-4">
                Automatisk scraping av jobber fra alle kilder
              </p>
              <button
                onClick={() => navigate('/scheduler')}
                className="bg-mocca-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors text-sm"
              >
                Administrer scheduler →
              </button>
            </motion.div>
          )}

          {/* Status Breakdown */}
          {analytics && Object.keys(analytics.statusBreakdown).length > 0 && (
            <motion.div
              className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
                Søknadsstatus
              </h2>
              <div className="space-y-3">
                {Object.entries(analytics.statusBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const total = Object.values(analytics.statusBreakdown).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={status} className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              statusColors[status] || statusColors.PENDING
                            }`}
                          >
                            {statusLabels[status] || status}
                          </span>
                          <span className="font-bold text-dark-heading dark:text-gray-100">
                            {count}
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
        </div>

        {/* Recent Applications */}
        {analytics && analytics.recentApplications.length > 0 && (
          <motion.div
            className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100">
                Nylige søknader
              </h2>
              <button
                onClick={() => navigate('/applications')}
                className="text-mocca-600 dark:text-mocca-400 hover:text-mocca-700 dark:hover:text-mocca-300 text-sm font-semibold"
              >
                Se alle →
              </button>
            </div>
            <div className="space-y-3">
              {analytics.recentApplications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-mocca-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/applications')}
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
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

        {/* Monthly Applications Chart */}
        {analytics && analytics.monthlyApplications.length > 0 && (
          <motion.div
            className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
              Søknader per måned
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
                    <div className="w-full bg-mocca-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-mocca-500 to-mocca-600 dark:from-mocca-400 dark:to-mocca-500 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default Dashboard;

