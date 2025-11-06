import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import jobsearch from '../assets/images/jobsearch.png';
import ineedajob from '../assets/images/ineedajob.png';
import office from '../assets/images/office.png';

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
