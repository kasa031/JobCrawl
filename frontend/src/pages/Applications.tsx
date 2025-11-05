import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI } from '../services/api';
import LoginModal from '../components/LoginModal';

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  notes: string | null;
  sentDate: string | null;
  responseDate: string | null;
  response: string | null;
  createdAt: string;
  jobListing: {
    id: string;
    title: string;
    company: string;
    location: string;
    url: string;
  };
}

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

function Applications() {
  const { isAuthenticated, showLoginModal, setShowLoginModal } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getApplications();
      setApplications(response.applications || []);
      setError('');
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.response?.data?.error || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      await applicationsAPI.deleteApplication(id);
      await loadApplications();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete application');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-dark-heading mb-6">My Applications</h1>
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200">
            <p className="text-dark-text text-lg mb-6">
              Please sign in to view your applications
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-mocca-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg"
            >
              Sign In
            </button>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-dark-text">Loading applications...</p>
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
          My Applications
        </motion.h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200 text-center">
            <p className="text-dark-text text-lg mb-6">
              You haven't applied to any jobs yet.
            </p>
            <a
              href="/jobs"
              className="bg-mocca-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg inline-block"
            >
              Browse Jobs
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application, index) => (
              <motion.div
                key={application.id}
                className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-dark-heading mb-2">
                      {application.jobListing.title}
                    </h3>
                    <p className="text-dark-subheading text-lg mb-2">
                      {application.jobListing.company} • {application.jobListing.location}
                    </p>
                    <div className="flex gap-2 items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          statusColors[application.status] || statusColors.PENDING
                        }`}
                      >
                        {application.status}
                      </span>
                      <span className="text-dark-secondary text-sm">
                        Applied {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={application.jobListing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-mocca-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors text-sm"
                    >
                      View Job
                    </a>
                    <button
                      onClick={() => handleDelete(application.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {application.coverLetter && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-dark-heading font-semibold hover:text-mocca-600">
                      Cover Letter
                    </summary>
                    <div className="mt-2 p-4 bg-white rounded-lg border border-mocca-300">
                      <p className="text-dark-text whitespace-pre-wrap">
                        {application.coverLetter}
                      </p>
                    </div>
                  </details>
                )}

                {application.notes && (
                  <div className="mt-4 p-4 bg-mocca-200 rounded-lg">
                    <p className="text-dark-text">
                      <strong>Notes:</strong> {application.notes}
                    </p>
                  </div>
                )}

                {application.response && (
                  <div className="mt-4 p-4 bg-champagne rounded-lg">
                    <p className="text-dark-text">
                      <strong>Response:</strong> {application.response}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default Applications;
