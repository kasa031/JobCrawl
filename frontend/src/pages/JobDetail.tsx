import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI, aiAPI, favoritesAPI } from '../services/api';
import LoginModal from '../components/LoginModal';
import { useToast } from '../components/Toast';
import { Skeleton } from '../components/Skeleton';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  requirements: string[];
  source: string;
  scrapedAt: string;
  publishedDate?: string;
}

function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, showLoginModal, setShowLoginModal, user } = useAuth();
  const { showToast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadJob();
      if (isAuthenticated) {
        checkIfApplied();
        checkIfFavorite();
      }
    }
  }, [id, isAuthenticated]);

  const checkIfFavorite = async () => {
    if (!id) return;
    try {
      const response = await favoritesAPI.checkFavorite(id);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      // Silent fail
    }
  };

  const toggleFavorite = async () => {
    if (!id || !isAuthenticated) {
      showToast('Du må være innlogget for å legge til favoritter', 'info');
      return;
    }

    setTogglingFavorite(true);
    try {
      if (isFavorite) {
        await favoritesAPI.removeFavorite(id);
        setIsFavorite(false);
        showToast('Fjernet fra favoritter', 'success');
      } else {
        await favoritesAPI.addFavorite(id);
        setIsFavorite(true);
        showToast('Lagt til i favoritter', 'success');
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Kunne ikke oppdatere favoritter', 'error');
    } finally {
      setTogglingFavorite(false);
    }
  };

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobData = await jobsAPI.getJobById(id!);
      setJob(jobData);
      setError('');
    } catch (err: any) {
      console.error('Error loading job:', err);
      const errorMsg = err.response?.data?.error || 'Kunne ikke laste stilling';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const response = await applicationsAPI.getApplications();
      const hasAppliedForJob = response.applications?.some(
        (app: any) => app.jobListingId === id
      );
      setHasApplied(hasAppliedForJob || false);
    } catch (err) {
      // Ignore errors when checking
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!user?.id || !job) {
      showToast('Kunne ikke søke. Prøv igjen.', 'error');
      return;
    }

    setApplying(true);
    setError('');

    try {
      showToast('Genererer søknadsbrev med AI...', 'info');
      
      // Generate cover letter
      const letterResponse = await aiAPI.generateCoverLetter(job.id);
      const coverLetter = letterResponse.coverLetter;

      // Create application
      await applicationsAPI.createApplication({
        jobListingId: job.id,
        coverLetter,
        status: 'DRAFT',
      });

      setHasApplied(true);
      showToast('Søknad opprettet! Du kan se den i Mine søknader.', 'success');
      setTimeout(() => {
        navigate('/applications');
      }, 1500);
    } catch (err: any) {
      console.error('Error applying:', err);
      const errorMsg = err.response?.data?.error || 'Kunne ikke opprette søknad';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton variant="rectangular" width={100} height={40} className="mb-6 rounded-lg" />
        <div className="bg-mocca-100 p-8 rounded-lg shadow-md border border-mocca-200 mb-6">
          <Skeleton variant="text" width="70%" height={40} className="mb-4" />
          <Skeleton variant="text" width="50%" height={28} className="mb-2" />
          <Skeleton variant="text" width="40%" height={24} className="mb-4" />
          <Skeleton variant="rectangular" width={200} height={48} className="rounded-lg" />
        </div>
        <div className="bg-mocca-100 p-8 rounded-lg shadow-md border border-mocca-200">
          <Skeleton variant="text" width="40%" height={32} className="mb-4" />
          <Skeleton variant="text" width="100%" height={16} className="mb-2" />
          <Skeleton variant="text" width="95%" height={16} className="mb-2" />
          <Skeleton variant="text" width="90%" height={16} />
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg">
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 bg-mocca-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors"
          >
            Tilbake til stillinger
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <div className="text-center">
          <p className="text-dark-text text-lg mb-4">Stilling ikke funnet</p>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-mocca-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors"
          >
            Tilbake til stillinger
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate('/jobs')}
            className="mb-6 text-mocca-600 hover:text-mocca-700 font-semibold flex items-center gap-2"
          >
            ← Tilbake til stillinger
          </button>

          {/* Job Header */}
          <div className="bg-mocca-100 p-8 rounded-lg shadow-md border border-mocca-200 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-dark-heading mb-3">
                  {job.title}
                </h1>
                <p className="text-dark-subheading text-2xl mb-2">
                  {job.company}
                </p>
                <p className="text-dark-text text-lg mb-4">
                  📍 {job.location}
                </p>
                <span className="bg-mocca-300 text-dark-text px-3 py-1 rounded-full text-sm font-semibold">
                  {job.source}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6 flex-wrap">
              {isAuthenticated && (
                <button
                  onClick={toggleFavorite}
                  disabled={togglingFavorite}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mocca-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFavorite
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label={isFavorite ? 'Fjern fra favoritter' : 'Legg til i favoritter'}
                >
                  {togglingFavorite ? (
                    '⏳'
                  ) : isFavorite ? (
                    '❤️ Favoritt'
                  ) : (
                    '🤍 Legg til favoritt'
                  )}
                </button>
              )}
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-mocca-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg"
              >
                Se på original nettsted
              </a>
              {hasApplied ? (
                <Link
                  to="/applications"
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Se søknad
                </Link>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying || !isAuthenticated}
                  className="bg-mocca-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-mocca-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Søker...' : 'Søk med AI-generert søknadsbrev'}
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 bg-red-100 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-mocca-100 p-8 rounded-lg shadow-md border border-mocca-200 mb-6">
            <h2 className="text-2xl font-bold text-dark-heading mb-4">
              Stillingsbeskrivelse
            </h2>
            <div className="prose max-w-none text-dark-text whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-mocca-100 p-8 rounded-lg shadow-md border border-mocca-200 mb-6">
              <h2 className="text-2xl font-bold text-dark-heading mb-4">
                Krav
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.requirements.map((req, i) => (
                  <span
                    key={i}
                    className="bg-mocca-200 text-dark-text px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Metadata */}
          <div className="bg-champagne p-6 rounded-lg border border-mocca-200">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-dark-heading">Kilde:</strong>{' '}
                <span className="text-dark-text">{job.source}</span>
              </div>
              {job.publishedDate && (
                <div>
                  <strong className="text-dark-heading">Publisert:</strong>{' '}
                  <span className="text-dark-text">
                    {new Date(job.publishedDate).toLocaleDateString('no-NO')}
                  </span>
                </div>
              )}
              <div>
                <strong className="text-dark-heading">Hentet:</strong>{' '}
                <span className="text-dark-text">
                  {new Date(job.scrapedAt).toLocaleDateString('no-NO')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default JobDetail;

