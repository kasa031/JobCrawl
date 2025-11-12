import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { jobsAPI, favoritesAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { JobCardSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { 
  saveSearchHistory, 
  getSearchHistory, 
  clearSearchHistory, 
  removeSearchHistoryItem,
  formatSearchHistoryItem,
  type SearchHistoryItem 
} from '../utils/searchHistory';
import { formatSource } from '../utils/formatSource';

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
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 20;
  
  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Search history
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search - wait 500ms after user stops typing before loading jobs
  useEffect(() => {
    // Clear previous timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Set new timeout for debounced search
    searchDebounceRef.current = setTimeout(() => {
      loadJobs();
    }, 500); // Wait 500ms after user stops typing

    // Cleanup function
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm, locationFilter, sourceFilter]); // Removed currentPage from dependencies

  // Load jobs immediately when page changes (no debounce needed)
  useEffect(() => {
    loadJobs();
  }, [currentPage]);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getFavorites();
      const favoriteIds = new Set<string>(response.favorites?.map((j: Job) => j.id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      // Silent fail - favorites are optional
    }
  };

  const toggleFavorite = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Du må være innlogget for å legge til favoritter', 'info');
      return;
    }

    try {
      const isFavorite = favorites.has(jobId);
      if (isFavorite) {
        await favoritesAPI.removeFavorite(jobId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        showToast('Fjernet fra favoritter', 'success');
      } else {
        await favoritesAPI.addFavorite(jobId);
        setFavorites(prev => new Set(prev).add(jobId));
        showToast('Lagt til i favoritter', 'success');
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Kunne ikke oppdatere favoritter', 'error');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    if (showHistory) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showHistory]);

  const loadJobs = async () => {
    // Don't show loading spinner for debounced searches (only for initial load and page changes)
    const isInitialLoad = jobs.length === 0 && loading;
    if (isInitialLoad || currentPage !== 1) {
      setLoading(true);
    }
    
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
    } catch (error: any) {
      // Ignore errors from browser extensions
      if (error.stack && error.stack.includes('content_script.js')) {
        return;
      }
      
      console.error('Error loading jobs:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Kunne ikke laste inn stillinger';
      
      // Only show toast for actual errors, not network issues that might be temporary
      if (error.response?.status !== 503 || isInitialLoad) {
        showToast(errorMessage, 'error');
      }
      
      // Set empty state if error
      setJobs([]);
      setTotalPages(1);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshJobs = async () => {
    setRefreshing(true);
    try {
      const result = await jobsAPI.refreshJobs(searchTerm || undefined, locationFilter || undefined);
      
      // Save to search history
      if (searchTerm || locationFilter) {
        saveSearchHistory(searchTerm, locationFilter);
        setSearchHistory(getSearchHistory());
      }
      
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
        } catch (error: any) {
          console.error('Error loading jobs:', error);
          setSearchTerm(originalSearchTerm);
          setLocationFilter(originalLocationFilter);
          const errorMsg = error.response?.data?.error || 'Kunne ikke laste inn stillinger';
          showToast(errorMsg, 'error');
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
    setShowHistory(false);
    
    // Save to search history
    if (searchTerm || locationFilter) {
      saveSearchHistory(searchTerm, locationFilter);
      setSearchHistory(getSearchHistory());
    }
    
    loadJobs();
  };

  const handleHistoryItemClick = (item: SearchHistoryItem) => {
    setSearchTerm(item.keywords);
    setLocationFilter(item.location);
    setCurrentPage(1);
    setShowHistory(false);
    setTimeout(() => {
      loadJobs();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowHistory(false);
    }
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
            <div className="relative" ref={historyRef}>
              <label htmlFor="search-input" className="block text-dark-text font-semibold mb-2">
                Søk stillinger
              </label>
              <div className="relative">
                <input
                  id="search-input"
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowHistory(true);
                  }}
                  onFocus={() => setShowHistory(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Stillingstittel, bedrift..."
                  className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400 focus:ring-2 focus:ring-mocca-400"
                  aria-label="Søk etter stillinger"
                  aria-expanded={showHistory}
                  aria-haspopup="listbox"
                />
                {searchHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-mocca-600 hover:text-mocca-700"
                    aria-label="Vis søkehistorikk"
                    aria-expanded={showHistory}
                  >
                    {showHistory ? '▲' : '▼'}
                  </button>
                )}
              </div>
              <AnimatePresence>
                {showHistory && searchHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-white border border-mocca-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    role="listbox"
                    aria-label="Søkehistorikk"
                  >
                    <div className="p-2 border-b border-mocca-200 flex justify-between items-center">
                      <span className="text-sm font-semibold text-dark-text">Søkehistorikk</span>
                      <button
                        type="button"
                        onClick={() => {
                          clearSearchHistory();
                          setSearchHistory([]);
                        }}
                        className="text-xs text-mocca-600 hover:text-mocca-700"
                        aria-label="Slett all søkehistorikk"
                      >
                        Slett alt
                      </button>
                    </div>
                    {searchHistory.map((item) => (
                      <div
                        key={`${item.keywords}-${item.location}-${item.timestamp}`}
                        onClick={() => handleHistoryItemClick(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleHistoryItemClick(item);
                          }
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-mocca-100 transition-colors flex justify-between items-center group cursor-pointer"
                        role="option"
                        tabIndex={0}
                        aria-label={`Søk: ${formatSearchHistoryItem(item)}`}
                      >
                        <span className="text-dark-text">{formatSearchHistoryItem(item)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeSearchHistoryItem(item.keywords, item.location);
                            setSearchHistory(getSearchHistory());
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 ml-2"
                          aria-label={`Slett søk: ${formatSearchHistoryItem(item)}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <label htmlFor="location-input" className="block text-dark-text font-semibold mb-2">
                Sted
              </label>
              <input
                id="location-input"
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="F.eks. Oslo"
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400 focus:ring-2 focus:ring-mocca-400"
                aria-label="Filtrer etter sted"
              />
            </div>
            <div>
              <label htmlFor="source-select" className="block text-dark-text font-semibold mb-2">
                Kilde
              </label>
              <select
                id="source-select"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400 focus:ring-2 focus:ring-mocca-400"
                aria-label="Filtrer etter kilde"
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
                className="w-full bg-mocca-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mocca-400 focus:ring-offset-2"
                aria-label="Søk i eksisterende stillinger"
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
            className="w-full bg-mocca-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-mocca-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-mocca-400 focus:ring-offset-2"
            aria-label="Hent nye stillinger fra nettet"
            aria-busy={refreshing}
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
              className="px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text focus:outline-none focus:border-mocca-400 focus:ring-2 focus:ring-mocca-400"
              aria-label="Sorter stillinger"
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
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-dark-heading mb-2">
                    {job.title}
                  </h3>
                  <p className="text-dark-subheading text-lg">
                    {job.company} • {job.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isAuthenticated && (
                    <button
                      onClick={(e) => toggleFavorite(job.id, e)}
                      className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-mocca-400 ${
                        favorites.has(job.id)
                          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-gray-400 hover:bg-mocca-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label={favorites.has(job.id) ? 'Fjern fra favoritter' : 'Legg til i favoritter'}
                      title={favorites.has(job.id) ? 'Fjern fra favoritter' : 'Legg til i favoritter'}
                    >
                      <svg className="w-6 h-6" fill={favorites.has(job.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  )}
                  <span className="bg-mocca-300 dark:bg-mocca-600 text-dark-text dark:text-gray-100 px-3 py-1 rounded-full text-sm font-semibold">
                    {formatSource(job.source)}
                  </span>
                </div>
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
                  className="bg-mocca-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-500 transition-colors focus:outline-none focus:ring-2 focus:ring-mocca-400 focus:ring-offset-2"
                  aria-label={`Se detaljer for ${job.title} hos ${job.company}`}
                >
                  Se detaljer
                </button>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-mocca-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-mocca-700 transition-colors focus:outline-none focus:ring-2 focus:ring-mocca-400 focus:ring-offset-2"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Åpne original stilling hos ${job.company} i ny fane`}
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
            className="px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text hover:bg-mocca-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-mocca-400"
            aria-label="Forrige side"
            aria-disabled={currentPage === 1}
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
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-mocca-400 ${
                    currentPage === pageNum
                      ? 'bg-mocca-600 text-white'
                      : 'border border-mocca-300 bg-white text-dark-text hover:bg-mocca-100'
                  }`}
                  aria-label={`Side ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-mocca-300 bg-white text-dark-text hover:bg-mocca-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-mocca-400"
            aria-label="Neste side"
            aria-disabled={currentPage === totalPages}
          >
            Neste →
          </button>
        </div>
      )}
    </div>
  );
}

export default JobsList;
