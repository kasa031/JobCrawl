import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import jobsearch from '../assets/images/jobsearch.png';
import ineedajob from '../assets/images/ineedajob.png';
import office from '../assets/images/office.png';

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

function Home() {
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const handleFeatureClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await analyticsAPI.getAnalytics();
        setAnalytics(response.analytics);
      } catch (error: any) {
        // Analytics errors are non-critical, fail silently to avoid annoying users
        // The dashboard will simply not show if analytics fail to load
      }
    };

    loadAnalytics();
  }, [isAuthenticated]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-16">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <img 
            src={jobsearch} 
            alt="Job search illustration" 
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
        </motion.div>
        <motion.h1 
          className="text-5xl font-extrabold text-dark-heading mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Velkommen til JobCrawl
        </motion.h1>
        <motion.p 
          className="text-xl text-dark-subheading mb-8 max-w-2xl mx-auto"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Din intelligente jobbsøknadsassistent. 
          Vi finner relevante stillinger og hjelper deg med å lage personlige søknader.
        </motion.p>
      </section>

      {/* Analytics Dashboard */}
      {isAuthenticated && analytics && (
        <motion.section
          className="bg-mocca-100 dark:bg-gray-800 p-8 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-dark-heading dark:text-gray-100 mb-6 text-center">
            Din aktivitet
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-mocca-600 dark:text-mocca-400 mb-2">
                {analytics.overview.totalJobs.toLocaleString('no-NO')}
              </div>
              <div className="text-dark-text dark:text-gray-300 font-semibold">
                Jobber funnet
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {analytics.overview.totalApplications.toLocaleString('no-NO')}
              </div>
              <div className="text-dark-text dark:text-gray-300 font-semibold">
                Søknader sendt
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                {analytics.overview.totalFavorites.toLocaleString('no-NO')}
              </div>
              <div className="text-dark-text dark:text-gray-300 font-semibold">
                Favoritter
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          {Object.keys(analytics.statusBreakdown).length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-dark-heading dark:text-gray-100 mb-4">
                Statussammendrag
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                  <div
                    key={status}
                    className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md"
                  >
                    <div className="text-2xl font-bold text-mocca-600 dark:text-mocca-400 mb-1">
                      {count}
                    </div>
                    <div className="text-sm text-dark-secondary dark:text-gray-400 capitalize">
                      {status === 'PENDING' ? 'Venter' :
                       status === 'SENT' ? 'Sendt' :
                       status === 'VIEWED' ? 'Sett' :
                       status === 'REJECTED' ? 'Avslått' :
                       status === 'ACCEPTED' ? 'Akseptert' :
                       status === 'INTERVIEW' ? 'Intervju' :
                       status === 'OFFER' ? 'Tilbud' :
                       status === 'DRAFT' ? 'Utkast' : status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Breakdown */}
          {Object.keys(analytics.sourceBreakdown).length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-dark-heading dark:text-gray-100 mb-4">
                Jobber per kilde
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(analytics.sourceBreakdown).map(([source, count]) => (
                  <div
                    key={source}
                    className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md"
                  >
                    <div className="text-2xl font-bold text-mocca-600 dark:text-mocca-400 mb-1">
                      {count.toLocaleString('no-NO')}
                    </div>
                    <div className="text-sm text-dark-secondary dark:text-gray-400 capitalize">
                      {source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* Features Grid */}
      <motion.section 
        className="grid md:grid-cols-3 gap-6 mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* Feature 1 */}
        <motion.div 
          className={`p-8 rounded-lg shadow-md border transition-all relative ${
            isAuthenticated 
              ? 'bg-mocca-100 border-mocca-300' 
              : 'bg-mocca-100 border-mocca-200 hover:shadow-lg cursor-pointer'
          }`}
          onClick={handleFeatureClick}
          whileHover={!isAuthenticated ? { scale: 1.02 } : {}}
          whileTap={!isAuthenticated ? { scale: 0.98 } : {}}
        >
          {!isAuthenticated && (
            <div className="absolute top-4 right-4 bg-mocca-400 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
              Login Required
            </div>
          )}
          {isAuthenticated && (
            <div className="absolute top-4 right-4 bg-mocca-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
              ✓ Available
            </div>
          )}
          <div className="mb-4 flex justify-center">
            <img 
              src={ineedajob} 
              alt="AI job search" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h3 className="text-2xl font-bold text-dark-heading mb-3">
            AI-drevne søknader
          </h3>
          <p className="text-dark-text">
            Generer personlige søknadsbrev og søknader tilpasset hver stilling.
          </p>
        </motion.div>

        {/* Feature 2 */}
        <motion.div 
          className={`p-8 rounded-lg shadow-md border transition-all relative ${
            isAuthenticated 
              ? 'bg-mocca-100 border-mocca-300' 
              : 'bg-mocca-100 border-mocca-200 hover:shadow-lg cursor-pointer'
          }`}
          onClick={handleFeatureClick}
          whileHover={!isAuthenticated ? { scale: 1.02 } : {}}
          whileTap={!isAuthenticated ? { scale: 0.98 } : {}}
        >
          {!isAuthenticated && (
            <div className="absolute top-4 right-4 bg-mocca-400 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
              Login Required
            </div>
          )}
          {isAuthenticated && (
            <div className="absolute top-4 right-4 bg-mocca-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
              ✓ Available
            </div>
          )}
          <div className="mb-4 flex justify-center">
            <img 
              src={jobsearch} 
              alt="Smart job search" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h3 className="text-2xl font-bold text-dark-heading mb-3">
            Smart jobbsøk
          </h3>
          <p className="text-dark-text">
            Automatisk søk på Finn.no, Manpower og andre norske jobbsider.
          </p>
        </motion.div>

        {/* Feature 3 */}
        <motion.div 
          className={`p-8 rounded-lg shadow-md border transition-all relative ${
            isAuthenticated 
              ? 'bg-mocca-100 border-mocca-300' 
              : 'bg-mocca-100 border-mocca-200 hover:shadow-lg cursor-pointer'
          }`}
          onClick={handleFeatureClick}
          whileHover={!isAuthenticated ? { scale: 1.02 } : {}}
          whileTap={!isAuthenticated ? { scale: 0.98 } : {}}
        >
          {!isAuthenticated && (
            <div className="absolute top-4 right-4 bg-mocca-400 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
              Login Required
            </div>
          )}
          {isAuthenticated && (
            <div className="absolute top-4 right-4 bg-mocca-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
              ✓ Available
            </div>
          )}
          <div className="mb-4 flex justify-center">
            <img 
              src={office} 
              alt="Office and applications" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h3 className="text-2xl font-bold text-dark-heading mb-3">
            Følg søknader
          </h3>
          <p className="text-dark-text">
            Hold oversikt over søknadene dine og deres status på ett sted.
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
}

export default Home;
