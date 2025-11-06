import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI } from '../services/api';
import LoginModal from '../components/LoginModal';
import { useToast } from '../components/Toast';
import { Skeleton } from '../components/Skeleton';

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

type SortOption = 'newest' | 'oldest' | 'company' | 'status';

function Applications() {
  const { isAuthenticated, showLoginModal, setShowLoginModal } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

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
      const errorMsg = err.response?.data?.error || 'Kunne ikke laste søknader';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne søknaden?')) {
      return;
    }

    try {
      await applicationsAPI.deleteApplication(id);
      showToast('Søknad slettet!', 'success');
      await loadApplications();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Kunne ikke slette søknad';
      showToast(errorMsg, 'error');
    }
  };

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...applications];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.jobListing.title.toLowerCase().includes(searchLower) ||
        app.jobListing.company.toLowerCase().includes(searchLower) ||
        app.jobListing.location.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Company filter
    if (companyFilter) {
      filtered = filtered.filter(app =>
        app.jobListing.company.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'company':
          return a.jobListing.company.localeCompare(b.jobListing.company, 'no');
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [applications, searchTerm, statusFilter, companyFilter, sortBy]);

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-dark-heading mb-6">Mine søknader</h1>
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200">
            <p className="text-dark-text text-lg mb-6">
              Vennligst logg inn for å se dine søknader
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
        <h1 className="text-4xl font-bold text-dark-heading mb-6">Mine søknader</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200">
              <Skeleton variant="text" width="60%" height={28} className="mb-4" />
              <Skeleton variant="text" width="40%" height={20} className="mb-2" />
              <Skeleton variant="rectangular" width={100} height={32} className="rounded-full mb-4" />
              <div className="flex gap-2">
                <Skeleton variant="rectangular" width={120} height={40} className="rounded-lg" />
                <Skeleton variant="rectangular" width={100} height={40} className="rounded-lg" />
              </div>
            </div>
          ))}
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
          Mine søknader
        </motion.h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        {applications.length > 0 && (
          <motion.div
            className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-dark-text font-semibold mb-2">
                  Søk
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Søk i stilling, bedrift..."
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                />
              </div>
              <div>
                <label className="block text-dark-text font-semibold mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                >
                  <option value="">Alle statuser</option>
                  {Object.keys(statusLabels).map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-dark-text font-semibold mb-2">
                  Bedrift
                </label>
                <input
                  type="text"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  placeholder="Filtrer på bedrift..."
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                />
              </div>
              <div>
                <label className="block text-dark-text font-semibold mb-2">
                  Sorter
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
                >
                  <option value="newest">Nyeste først</option>
                  <option value="oldest">Eldste først</option>
                  <option value="company">Bedrift (A-Z)</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
            <p className="text-dark-secondary text-sm text-center">
              Viser {filteredAndSortedApplications.length} av {applications.length} søknader
            </p>
          </motion.div>
        )}

        {filteredAndSortedApplications.length === 0 ? (
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200 text-center">
            <p className="text-dark-text text-lg mb-6">
              {applications.length === 0
                ? "Du har ikke søkt på noen stillinger ennå."
                : "Ingen søknader matcher filtrene dine."}
            </p>
            {applications.length === 0 && (
              <a
                href="/jobs"
                className="bg-mocca-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg inline-block"
              >
                Bla gjennom stillinger
              </a>
            )}
            {(searchTerm || statusFilter || companyFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCompanyFilter('');
                }}
                className="mt-4 bg-mocca-200 text-dark-text px-6 py-2 rounded-lg font-semibold hover:bg-mocca-300 transition-colors"
              >
                Nullstill filtre
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedApplications.map((application, index) => (
              <motion.div
                key={application.id}
                className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200 hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-dark-heading mb-2">
                      {application.jobListing.title}
                    </h3>
                    <p className="text-dark-subheading text-lg mb-2">
                      {application.jobListing.company} • {application.jobListing.location}
                    </p>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          statusColors[application.status] || statusColors.PENDING
                        }`}
                      >
                        {statusLabels[application.status] || application.status}
                      </span>
                      <span className="text-dark-secondary text-sm">
                        Søkt {new Date(application.createdAt).toLocaleDateString('no-NO')}
                      </span>
                      {application.sentDate && (
                        <span className="text-dark-secondary text-sm">
                          • Sendt {new Date(application.sentDate).toLocaleDateString('no-NO')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={application.jobListing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-mocca-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors text-sm"
                    >
                      Se stilling
                    </a>
                    <button
                      onClick={() => handleDelete(application.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
                    >
                      Slett
                    </button>
                  </div>
                </div>

                {application.coverLetter && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-dark-heading font-semibold hover:text-mocca-600">
                      Søknadsbrev
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
                      <strong>Notater:</strong> {application.notes}
                    </p>
                  </div>
                )}

                {application.response && (
                  <div className="mt-4 p-4 bg-champagne rounded-lg">
                    <p className="text-dark-text">
                      <strong>Svar:</strong> {application.response}
                    </p>
                    {application.responseDate && (
                      <p className="text-dark-secondary text-sm mt-1">
                        Svar mottatt: {new Date(application.responseDate).toLocaleDateString('no-NO')}
                      </p>
                    )}
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

