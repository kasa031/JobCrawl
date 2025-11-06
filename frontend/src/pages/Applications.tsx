import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI } from '../services/api';
import LoginModal from '../components/LoginModal';
import { useToast } from '../components/Toast';
import { Skeleton } from '../components/Skeleton';
import jobOfferMail from '../assets/images/joboffermail.png';
import { exportToPDF, exportToWord } from '../utils/exportUtils';

export interface Application {
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
  const { isAuthenticated, showLoginModal, setShowLoginModal, user } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [exportMenuOpen, setExportMenuOpen] = useState<string | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Close export menu and status menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (exportMenuOpen && !target.closest('.relative')) {
        setExportMenuOpen(null);
      }
      if (statusMenuOpen && !target.closest('.relative')) {
        setStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportMenuOpen, statusMenuOpen]);

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

  const handleExportPDF = async (application: Application) => {
    try {
      await exportToPDF(application, user?.fullName);
      showToast('PDF eksportert!', 'success');
    } catch (error: any) {
      showToast('Kunne ikke eksportere til PDF', 'error');
    }
  };

  const handleExportWord = async (application: Application) => {
    try {
      await exportToWord(application, user?.fullName);
      showToast('Word-dokument eksportert!', 'success');
    } catch (error: any) {
      showToast('Kunne ikke eksportere til Word', 'error');
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedApplications(new Set());
  };

  const toggleApplicationSelection = (id: string) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedApplications(newSelected);
  };

  const selectAll = () => {
    if (selectedApplications.size === filteredAndSortedApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(filteredAndSortedApplications.map(app => app.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedApplications.size === 0) return;

    if (!confirm(`Er du sikker på at du vil slette ${selectedApplications.size} søknad(er)?`)) {
      return;
    }

    try {
      await applicationsAPI.bulkDeleteApplications(Array.from(selectedApplications));
      showToast(`${selectedApplications.size} søknad(er) slettet!`, 'success');
      setSelectedApplications(new Set());
      setIsSelectMode(false);
      await loadApplications();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Kunne ikke slette søknader';
      showToast(errorMsg, 'error');
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedApplications.size === 0) return;

    try {
      await applicationsAPI.bulkUpdateApplicationStatus(Array.from(selectedApplications), status);
      showToast(`${selectedApplications.size} søknad(er) oppdatert!`, 'success');
      setSelectedApplications(new Set());
      setIsSelectMode(false);
      await loadApplications();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Kunne ikke oppdatere søknader';
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
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={jobOfferMail} 
            alt="Job applications" 
            className="w-12 h-12 object-contain"
          />
          <motion.h1
            className="text-4xl font-bold text-dark-heading"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Mine søknader
          </motion.h1>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Bulk Actions Toolbar */}
        {isSelectMode && selectedApplications.size > 0 && (
          <motion.div
            className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow-md border border-blue-300 dark:border-blue-700 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                {selectedApplications.size} valgt
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
                >
                  🗑️ Slett valgte
                </button>
                <div className="relative">
                  <button
                    onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                    className="bg-mocca-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-600 transition-colors text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-mocca-400"
                    aria-label="Endre status"
                    aria-expanded={statusMenuOpen}
                  >
                    ✏️ Endre status
                    <svg className={`w-4 h-4 transition-transform ${statusMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {statusMenuOpen && (
                    <div className="absolute left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-mocca-200 dark:border-gray-700 overflow-hidden z-10 min-w-[150px]">
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <button
                          key={status}
                          onClick={() => {
                            handleBulkStatusUpdate(status);
                            setStatusMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-dark-text dark:text-gray-100 hover:bg-mocca-100 dark:hover:bg-gray-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-mocca-400"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        {applications.length > 0 && (
          <motion.div
            className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-8"
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
            <div className="flex justify-between items-center flex-wrap gap-4">
              <p className="text-dark-secondary dark:text-gray-300 text-sm">
                Viser {filteredAndSortedApplications.length} av {applications.length} søknader
              </p>
              <button
                onClick={toggleSelectMode}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  isSelectMode
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-mocca-400 text-white hover:bg-mocca-500'
                }`}
              >
                {isSelectMode ? '✕ Avslutt valg' : '✓ Velg flere'}
              </button>
            </div>
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
            {isSelectMode && filteredAndSortedApplications.length > 0 && (
              <div className="bg-mocca-100 dark:bg-gray-800 p-4 rounded-lg border border-mocca-200 dark:border-gray-700 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedApplications.size === filteredAndSortedApplications.length}
                    onChange={selectAll}
                    className="w-5 h-5 text-mocca-600 rounded focus:ring-2 focus:ring-mocca-400"
                  />
                  <span className="font-semibold text-dark-text dark:text-gray-100">
                    Velg alle ({filteredAndSortedApplications.length})
                  </span>
                </label>
              </div>
            )}
            {filteredAndSortedApplications.map((application, index) => (
              <motion.div
                key={application.id}
                className={`bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border transition-all ${
                  isSelectMode && selectedApplications.has(application.id)
                    ? 'border-blue-500 dark:border-blue-400 shadow-lg ring-2 ring-blue-300 dark:ring-blue-600'
                    : 'border-mocca-200 dark:border-gray-700 hover:shadow-lg'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  {isSelectMode && (
                    <label className="cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedApplications.has(application.id)}
                        onChange={() => toggleApplicationSelection(application.id)}
                        className="w-5 h-5 text-mocca-600 rounded focus:ring-2 focus:ring-mocca-400"
                      />
                    </label>
                  )}
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
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={application.jobListing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-mocca-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors text-sm"
                    >
                      Se stilling
                    </a>
                    <div className="relative">
                      <button
                        onClick={() => setExportMenuOpen(exportMenuOpen === application.id ? null : application.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="Eksporter søknad"
                        aria-expanded={exportMenuOpen === application.id}
                      >
                        📥 Eksporter
                        <svg className={`w-4 h-4 transition-transform ${exportMenuOpen === application.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {exportMenuOpen === application.id && (
                        <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-mocca-200 dark:border-gray-700 overflow-hidden z-10 min-w-[150px]">
                          <button
                            onClick={() => {
                              handleExportPDF(application);
                              setExportMenuOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-dark-text dark:text-gray-100 hover:bg-mocca-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-mocca-400"
                          >
                            📄 PDF
                          </button>
                          <button
                            onClick={() => {
                              handleExportWord(application);
                              setExportMenuOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-dark-text dark:text-gray-100 hover:bg-mocca-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-mocca-400"
                          >
                            📝 Word
                          </button>
                        </div>
                      )}
                    </div>
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

