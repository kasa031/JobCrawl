import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiAPI, profileAPI } from '../services/api';
import LoginModal from '../components/LoginModal';
import { useToast } from '../components/Toast';

function AIGenerate() {
  const { isAuthenticated, showLoginModal, setShowLoginModal, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [hasCV, setHasCV] = useState(false);

  // Load profile on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const profile = await profileAPI.getProfile();
      setHasCV(!!profile?.cvPath);
    } catch (error) {
      // Silently fail - CV status is not critical for this page
      // User can still generate cover letters without CV
    }
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!jobDescription.trim()) {
      showToast('Vennligst lim inn stillingsbeskrivelsen først', 'error');
      return;
    }

    if (!user?.id) {
      showToast('Bruker ikke funnet. Vennligst logg inn igjen.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Generate cover letter with job description text
      const letterResponse = await aiAPI.generateCoverLetterFromText({
        jobTitle: jobTitle || 'Stillingsutlysning',
        company: company || 'Bedrift',
        jobDescription: jobDescription,
      });
      setGeneratedLetter(letterResponse.coverLetter);
      showToast('Søknadsbrev generert!', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Kunne ikke generere søknadsbrev';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-dark-heading mb-6">AI-Powered Cover Letter Generator</h1>
          <div className="bg-mocca-100 p-12 rounded-lg shadow-md border border-mocca-200">
            <p className="text-dark-text text-lg mb-6">
              Please sign in to use AI features
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

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-dark-heading mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AI-Powered Cover Letter Generator
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Job Selection */}
          <motion.div 
            className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-bold text-dark-heading mb-4">Stillingsutlysning</h2>
            
            {/* CV Status */}
            <div className={`mb-4 p-3 rounded-lg ${hasCV ? 'bg-champagne border border-mocca-300' : 'bg-yellow-50 border border-yellow-200'}`}>
              {hasCV ? (
                <p className="text-dark-text text-sm">
                  ✅ CV lastet opp. AI-en vil bruke CV-innholdet for å generere søknadsbrev.
                </p>
              ) : (
                <p className="text-dark-text text-sm">
                  ⚠️ Ingen CV lastet opp. Last opp CV i profilen for bedre søknadsbrev.
                  <button
                    onClick={() => navigate('/profile')}
                    className="ml-2 text-mocca-600 hover:text-mocca-700 underline font-semibold"
                  >
                    Gå til profil →
                  </button>
                </p>
              )}
            </div>

            {/* Job Title (optional) */}
            <div className="mb-4">
              <label className="block text-dark-text font-semibold mb-2">
                Stillingstittel (valgfritt)
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="F.eks. Frontend Utvikler"
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
              />
            </div>

            {/* Company (optional) */}
            <div className="mb-4">
              <label className="block text-dark-text font-semibold mb-2">
                Bedrift (valgfritt)
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="F.eks. Tech Solutions AS"
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
              />
            </div>

            {/* Job Description */}
            <div className="mb-4">
              <label className="block text-dark-text font-semibold mb-2">
                Stillingsbeskrivelse *
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Lim inn hele stillingsbeskrivelsen her..."
                rows={12}
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400 resize-none"
              />
              <p className="text-dark-secondary text-xs mt-2">
                Du kan kopiere teksten direkte fra stillingsannonsen eller en lenke.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !jobDescription.trim()}
              className="w-full bg-mocca-400 text-white py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Genererer...' : 'Generer søknadsbrev'}
            </button>
          </motion.div>

          {/* Generated Letter */}
          <motion.div 
            className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-bold text-dark-heading mb-4">Generated Cover Letter</h2>
            
            {generatedLetter ? (
              <div className="bg-white p-4 rounded-lg border border-mocca-300">
                <textarea
                  value={generatedLetter}
                  readOnly
                  rows={20}
                  className="w-full resize-none bg-white text-dark-text focus:outline-none"
                />
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(generatedLetter);
                      showToast('Kopiert til utklippstavle!', 'success');
                    } catch (error) {
                      showToast('Kunne ikke kopiere til utklippstavle', 'error');
                    }
                  }}
                  className="mt-4 bg-mocca-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-700 transition-colors"
                >
                  Kopier til utklippstavle
                </button>
              </div>
            ) : (
              <div className="bg-mocca-200 p-8 rounded-lg text-center">
                <p className="text-dark-secondary">
                  Lim inn stillingsbeskrivelsen og klikk "Generer søknadsbrev" for å få et personlig søknadsbrev.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default AIGenerate;

