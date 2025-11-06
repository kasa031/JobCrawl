import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jobsAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { JobCardSkeleton } from '../components/Skeleton';

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
}

type SortOption = 'newest' | 'oldest' | 'title' | 'company' | 'location';

function JobsList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 20;
  
  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    loadJobs();
  }, [currentPage, searchTerm, locationFilter, sourceFilter]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getJobs({
        page: currentPage,
        limit: jobsPerPage,
        search: searchTerm || undefined,
        location: locationFilter || undefined,
        source: sourceFilter || undefined,
      });
      setJobs(response.jobs || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalJobs(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading jobs:', error);
      showToast('Kunne ikke laste inn stillinger', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshJobs = async () => {
    setRefreshing(true);
    try {
      const result = await jobsAPI.refreshJobs(searchTerm || undefined, locationFilter || undefined);
      console.log('Refresh result:', result);
      
      if (result.saved > 0) {
        const originalSearchTerm = searchTerm;
        const originalLocationFilter = locationFilter;
        
        setSearchTerm('');
        setLocationFilter('');
        setCurrentPage(1);
        
        setLoading(true);
        try {
          const response = await jobsAPI.getJobs({ page: 1, limit: jobsPerPage });
          setJobs(response.jobs || []);
          setTotalPages(response.pagination?.pages || 1);
          setTotalJobs(response.pagination?.total || 0);
        } catch (error) {
          console.error('Error loading jobs:', error);
          setSearchTerm(originalSearchTerm);
          setLocationFilter(originalLocationFilter);
        } finally {
          setLoading(false);
        }
        
        showToast(
          `Stillinger oppdatert! Funnet ${result.saved} ny${result.saved > 1 ? 'e' : ''} stilling${result.saved > 1 ? 'er' : ''}.`,
          'success'
        );
      } else {
        await loadJobs();
        showToast('Stillinger oppdatert! Ingen nye stillinger funnet med disse filtrene.', 'info');
      }
    } catch (error: any) {
      console.error('Error refreshing jobs:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Feil ved oppdatering av stillinger';
      showToast(`Feil: ${errorMsg}`, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    loadJobs();
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime();
      case 'oldest':
        return new Date(a.scrapedAt).getTime() - new Date(b.scrapedAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title, 'no');
      case 'company':
        return a.company.localeCompare(b.company, 'no');
      case 'location':
        return a.location.localeCompare(b.location, 'no');
      default:
        return 0;
    }
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-dark-heading mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Ledige stillinger
        </motion.h1>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1 
        className="text-4xl font-bold text-dark-heading mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Ledige stillinger
      </motion.h1>

      {/* Filters */}
      <motion.div 
        className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSearch}>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-dark-text font-semibold mb-2">
                Søk stillinger
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Stillingstittel, bedrift..."
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
              />
            </div>
            <div>
              <label className="block text-dark-text font-semibold mb-2">
                Sted
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="F.eks. Oslo"
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
              />
            </div>
            <div>
              <label className="block text-dark-text font-semibold mb-2">
                Kilde
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
              >
                <option value="">Alle kilder</option>
                <option value="finn.no">Finn.no</option>
                <option value="manpower">Manpower</option>
                <option value="adecco">Adecco</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-mocca-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg"
              >
                🔍 Søk i eksisterende stillinger
              </button>
            </div>
          </div>
        </form>
        <p className="text-dark-secondary text-xs mt-2 mb-4 text-center">
          Søk-knappen filtrerer jobber som allerede er lastet inn i systemet
        </p>
        
        <div className="mt-4 pt-4 border-t border-mocca-300">
          <button
            onClick={handleRefreshJobs}
            disabled={refreshing}
            className="w-full bg-mocca-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-mocca-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? '⏳ Oppdaterer stillinger...' : '🔄 Hent nye stillinger fra nettet'}
          </button>
          <p className="text-dark-secondary text-xs mt-2">
            🔍 <strong>Hva gjør denne knappen?</strong> Den crawler Finn.no, Manpower, Adecco og andre jobbsider for å finne nye stillinger basert på søkekriteriene dine. Bruk AI for intelligent matching.
          </p>
          <p className="text-dark-secondary text-xs mt-1">
            💡 <strong>Tip:</strong> Skriv "IT" og "Oslo" først, så henter den alle relevante IT-stillinger!
          </p>
        </div>
      </motion.div>

      {/* Sorting and Results Info */}
      {jobs.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-dark-text">
            Viser {((currentPage - 1) * jobsPerPage) + 1}-{Math.min(currentPage * jobsPerPage, totalJobs)} av {totalJobs} stillinger
          </div>
          <div className="flex items-center gap-4">
            <label className="text-dark-text font-semibold">Sorter etter:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400"
            >
              <option value="newest">Nyeste først</option>
              <option value="oldest">Eldste først</option>
              <option value="title">Tittel (A-Z)</option>
              <option value="company">Bedrift (A-Z)</option>
              <option value="location">Sted (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {sortedJobs.length === 0 ? (
          <div className="text-center py-16 bg-mocca-100 rounded-lg">
            <p className="text-dark-text text-lg">
              Ingen stillinger funnet. Prøv å justere filtrene eller klikk på "Oppdater stillinger fra nettet" for å hente nye stillinger.
            </p>
          </div>
        ) : (
          sortedJobs.map((job, index) => (
            <motion.div
              key={job.id}
              className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-dark-heading mb-2">
                    {job.title}
                  </h3>
                  <p className="text-dark-subheading text-lg">
                    {job.company} • {job.location}
                  </p>
                </div>
                <span className="bg-mocca-300 text-dark-text px-3 py-1 rounded-full text-sm font-semibold">
                  {job.source}
                </span>
              </div>
              <p className="text-dark-text mb-4 line-clamp-3">
                {job.description}
              </p>
              {job.requirements.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.requirements.slice(0, 5).map((req, i) => (
                    <span
                      key={i}
                      className="bg-mocca-200 text-dark-text px-2 py-1 rounded text-sm"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="bg-mocca-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors"
                >
                  Se detaljer
                </button>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-mocca-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Åpne original
                </a>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text hover:bg-mocca-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Forrige
          </button>
          
          {/* Page numbers */}
          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-mocca-600 text-white'
                      : 'border border-mocca-300 bg-white text-dark-text hover:bg-mocca-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text hover:bg-mocca-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Neste →
          </button>
        </div>
      )}
    </div>
  );
}

export default JobsList;
