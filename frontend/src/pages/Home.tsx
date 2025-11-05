import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated, setShowLoginModal } = useAuth();

  const handleFeatureClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-16">
        <motion.h1 
          className="text-5xl font-extrabold text-dark-heading mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Welcome to JobCrawl
        </motion.h1>
        <motion.p 
          className="text-xl text-dark-subheading mb-8 max-w-2xl mx-auto"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Your intelligent job application assistant. 
          We find relevant positions and help you create personalized applications.
        </motion.p>
      </section>

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
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-2xl font-bold text-dark-heading mb-3">
            AI-Powered Applications
          </h3>
          <p className="text-dark-text">
            Generate personalized cover letters and applications tailored to each job posting.
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
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-dark-heading mb-3">
            Smart Job Discovery
          </h3>
          <p className="text-dark-text">
            Automatically crawl Finn.no, Manpower, and other Norwegian job sites.
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
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-dark-heading mb-3">
            Track Applications
          </h3>
          <p className="text-dark-text">
            Keep track of your applications and their statuses in one place.
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
}

export default Home;
