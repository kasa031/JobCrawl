import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI, aiAPI } from '../services/api';
import LoginModal from '../components/LoginModal';

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
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) {
      loadJob();
      if (isAuthenticated) {
        checkIfApplied();
      }
    }
  }, [id, isAuthenticated]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobData = await jobsAPI.getJobById(id!);
      setJob(jobData);
      setError('');
    } catch (err: any) {
      console.error('Error loading job:', err);
      setError(err.response?.data?.error || 'Failed to load job');
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
      alert('Unable to apply. Please try again.');
      return;
    }

    setApplying(true);
    setError('');

    try {
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
      alert('Application created successfully! You can view it in the Applications page.');
      navigate('/applications');
    } catch (err: any) {
      console.error('Error applying:', err);
      setError(err.response?.data?.error || 'Failed to create application');
      alert(err.response?.data?.error || 'Failed to create application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-dark-text">Loading job details...</p>
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
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <div className="text-center">
          <p className="text-dark-text text-lg mb-4">Job not found</p>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-mocca-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors"
          >
            Back to Jobs
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
            ← Back to Jobs
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
            <div className="flex gap-4 mt-6">
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-mocca-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg"
              >
                View on Source Website
              </a>
              {hasApplied ? (
                <Link
                  to="/applications"
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                >
                  View Application
                </Link>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying || !isAuthenticated}
                  className="bg-mocca-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-mocca-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Applying...' : 'Apply with AI Cover Letter'}
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
              Job Description
            </h2>
            <div className="prose max-w-none text-dark-text whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-mocca-100 p-8 rounded-lg shadow-md border border-mocca-200 mb-6">
              <h2 className="text-2xl font-bold text-dark-heading mb-4">
                Requirements
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
                <strong className="text-dark-heading">Source:</strong>{' '}
                <span className="text-dark-text">{job.source}</span>
              </div>
              {job.publishedDate && (
                <div>
                  <strong className="text-dark-heading">Published:</strong>{' '}
                  <span className="text-dark-text">
                    {new Date(job.publishedDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div>
                <strong className="text-dark-heading">Scraped:</strong>{' '}
                <span className="text-dark-text">
                  {new Date(job.scrapedAt).toLocaleDateString()}
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

