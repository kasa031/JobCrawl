export interface SearchHistoryItem {
  keywords: string;
  location: string;
  timestamp: number;
}

const MAX_HISTORY_ITEMS = 10;
const STORAGE_KEY = 'jobcrawl_search_history';

export const saveSearchHistory = (keywords: string, location: string): void => {
  try {
    const history = getSearchHistory();
    
    // Remove duplicates
    const filtered = history.filter(
      item => !(item.keywords === keywords && item.location === location)
    );
    
    // Add new item at the beginning
    const newItem: SearchHistoryItem = {
      keywords,
      location,
      timestamp: Date.now(),
    };
    
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

export const getSearchHistory = (): SearchHistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored) as SearchHistoryItem[];
    return history.filter(item => item.timestamp && item.keywords !== undefined);
  } catch (error) {
    console.error('Error reading search history:', error);
    return [];
  }
};

export const clearSearchHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

export const removeSearchHistoryItem = (keywords: string, location: string): void => {
  try {
    const history = getSearchHistory();
    const filtered = history.filter(
      item => !(item.keywords === keywords && item.location === location)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing search history item:', error);
  }
};

export const formatSearchHistoryItem = (item: SearchHistoryItem): string => {
  const parts: string[] = [];
  if (item.keywords) parts.push(item.keywords);
  if (item.location) parts.push(item.location);
  return parts.join(' • ') || 'Tomt søk';
};

