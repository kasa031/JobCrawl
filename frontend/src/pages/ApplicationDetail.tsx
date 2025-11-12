import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI } from '../services/api';
import LoginModal from '../components/LoginModal';
import { useToast } from '../components/Toast';
import { Skeleton } from '../components/Skeleton';
import { exportToPDF, exportToWord } from '../utils/exportUtils';

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  notes: string | null;
  sentDate: string | null;
  responseDate: string | null;
  response: string | null;
  createdAt: string;
  updatedAt: string;
  jobListing: {
    id: string;
    title: string;
    company: string;
    location: string;
    url: string;
    description: string;
    requirements: string[];
    source: string;
  };
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

function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, showLoginModal, setShowLoginModal, user } = useAuth();
  const { showToast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [response, setResponse] = useState('');
  const [sentDate, setSentDate] = useState('');
  const [responseDate, setResponseDate] = useState('');

  useEffect(() => {
    if (isAuthenticated && id) {
      loadApplication();
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, id]);

  const loadApplication = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await applicationsAPI.getApplication(id);
      const app = response.application;
      setApplication(app);
      setStatus(app.status);
      setNotes(app.notes || '');
      setResponse(app.response || '');
      setSentDate(app.sentDate ? app.sentDate.split('T')[0] : '');
      setResponseDate(app.responseDate ? app.responseDate.split('T')[0] : '');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Kunne ikke laste søknad';
      showToast(errorMsg, 'error');
      if (error.response?.status === 404) {
        navigate('/applications');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      await applicationsAPI.updateApplication(id, {
        status,
        notes: notes || undefined,
        response: response || undefined,
        sentDate: sentDate || undefined,
        responseDate: responseDate || undefined,
      });
      showToast('Søknad oppdatert!', 'success');
      setIsEditing(false);
      await loadApplication();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Kunne ikke oppdatere søknad';
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (!confirm('Er du sikker på at du vil slette denne søknaden?')) {
      return;
    }

    try {
      await applicationsAPI.deleteApplication(id);
      showToast('Søknad slettet!', 'success');
      navigate('/applications');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Kunne ikke slette søknad';
      showToast(errorMsg, 'error');
    }
  };

  const handleExportPDF = async () => {
    if (!application) return;
    try {
      await exportToPDF(application, user?.fullName);
      showToast('PDF eksportert!', 'success');
    } catch (error: any) {
      showToast('Kunne ikke eksportere til PDF', 'error');
    }
  };

  const handleExportWord = async () => {
    if (!application) return;
    try {
      await exportToWord(application, user?.fullName);
      showToast('Word-dokument eksportert!', 'success');
    } catch (error: any) {
      showToast('Kunne ikke eksportere til Word', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-dark-heading mb-6">Søknadsdetaljer</h1>
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200">
            <p className="text-dark-text text-lg mb-6">
              Vennligst logg inn for å se søknadsdetaljer
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-dark-heading mb-6">Søknadsdetaljer</h1>
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

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-dark-heading mb-6">Søknadsdetaljer</h1>
        <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200 text-center">
          <p className="text-dark-text text-lg mb-6">Søknad ikke funnet</p>
          <button
            onClick={() => navigate('/applications')}
            className="bg-mocca-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors"
          >
            Tilbake til søknader
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => navigate('/applications')}
            className="text-mocca-600 hover:text-mocca-700 dark:text-mocca-400 dark:hover:text-mocca-300 font-semibold flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            ← Tilbake til søknader
          </motion.button>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm"
            >
              📄 PDF
            </button>
            <button
              onClick={handleExportWord}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm"
            >
              📝 Word
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
            >
              🗑️ Slett
            </button>
          </div>
        </div>

        {/* Job Info */}
        <motion.div
          className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-dark-heading dark:text-gray-100 mb-2">
            {application.jobListing.title}
          </h1>
          <p className="text-xl text-dark-subheading dark:text-gray-300 mb-4">
            {application.jobListing.company} • {application.jobListing.location}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                statusColors[application.status] || statusColors.PENDING
              }`}
            >
              {statusLabels[application.status] || application.status}
            </span>
            <a
              href={application.jobListing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mocca-600 dark:text-mocca-400 hover:text-mocca-700 dark:hover:text-mocca-300 font-semibold underline"
            >
              Se stillingsutlysning →
            </a>
          </div>
        </motion.div>

        {/* Edit Form or View Mode */}
        {isEditing ? (
          <motion.div
            className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
              Rediger søknad
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-dark-text dark:text-gray-300 font-semibold mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-dark-text dark:text-gray-100 focus:outline-none focus:border-mocca-400"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-dark-text dark:text-gray-300 font-semibold mb-2">
                  Notater
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-dark-text dark:text-gray-100 focus:outline-none focus:border-mocca-400 resize-none"
                  placeholder="Legg til notater om søknaden..."
                />
              </div>
              <div>
                <label className="block text-dark-text dark:text-gray-300 font-semibold mb-2">
                  Svar fra arbeidsgiver
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-dark-text dark:text-gray-100 focus:outline-none focus:border-mocca-400 resize-none"
                  placeholder="Legg inn svar fra arbeidsgiver..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-text dark:text-gray-300 font-semibold mb-2">
                    Sendt dato
                  </label>
                  <input
                    type="date"
                    value={sentDate}
                    onChange={(e) => setSentDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-mocca-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-dark-text dark:text-gray-100 focus:outline-none focus:border-mocca-400"
                  />
                </div>
                <div>
                  <label className="block text-dark-text dark:text-gray-300 font-semibold mb-2">
                    Svar mottatt dato
                  </label>
                  <input
                    type="date"
                    value={responseDate}
                    onChange={(e) => setResponseDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-mocca-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-dark-text dark:text-gray-100 focus:outline-none focus:border-mocca-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-mocca-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Lagrer...' : '💾 Lagre'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadApplication();
                  }}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Application Details */}
            <motion.div
              className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100">
                  Søknadsdetaljer
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-mocca-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors text-sm"
                >
                  ✏️ Rediger
                </button>
              </div>
              <div className="space-y-3 text-dark-text dark:text-gray-300">
                <div>
                  <span className="font-semibold">Opprettet:</span>{' '}
                  {new Date(application.createdAt).toLocaleDateString('no-NO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {application.sentDate && (
                  <div>
                    <span className="font-semibold">Sendt:</span>{' '}
                    {new Date(application.sentDate).toLocaleDateString('no-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
                {application.responseDate && (
                  <div>
                    <span className="font-semibold">Svar mottatt:</span>{' '}
                    {new Date(application.responseDate).toLocaleDateString('no-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <motion.div
                className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
                  Søknadsbrev
                </h2>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-mocca-300 dark:border-gray-600">
                  <p className="text-dark-text dark:text-gray-300 whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Notes */}
            {application.notes && (
              <motion.div
                className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
                  Notater
                </h2>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-mocca-300 dark:border-gray-600">
                  <p className="text-dark-text dark:text-gray-300 whitespace-pre-wrap">
                    {application.notes}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Response */}
            {application.response && (
              <motion.div
                className="bg-mocca-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-mocca-200 dark:border-gray-700 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-dark-heading dark:text-gray-100 mb-4">
                  Svar fra arbeidsgiver
                </h2>
                <div className="bg-champagne dark:bg-yellow-900 p-4 rounded-lg border border-mocca-300 dark:border-gray-600">
                  <p className="text-dark-text dark:text-gray-300 whitespace-pre-wrap">
                    {application.response}
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default ApplicationDetail;

