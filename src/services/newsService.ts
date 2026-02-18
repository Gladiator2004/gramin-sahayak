// News service with in-memory caching and auto-refresh
// When backend is ready, replace fetchFromSource with real API calls
// Supports: data.gov.in, PIB RSS, NewsAPI fallback

import { fetchNews, type NewsItem } from "@/data/api";

interface CacheEntry {
  data: NewsItem[];
  timestamp: number;
}

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
let cache: CacheEntry | null = null;
let refreshInterval: ReturnType<typeof setInterval> | null = null;

// Fetch news with caching — returns cached data if fresh
export function getNews(): NewsItem[] {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_DURATION_MS) {
    return cache.data;
  }

  // Fetch from source (currently local data, swap for API later)
  // Real implementation: fetch("https://api.data.gov.in/...") with fallback
  const data = fetchNews();
  cache = { data, timestamp: now };
  return data;
}

// Get single news item by ID
export function getNewsById(id: number): NewsItem | undefined {
  const all = getNews();
  return all.find((item) => item.id === id);
}

// Start auto-refresh timer (call once on app mount)
export function startAutoRefresh(onUpdate?: (data: NewsItem[]) => void) {
  if (refreshInterval) return;

  refreshInterval = setInterval(() => {
    // Invalidate cache
    cache = null;
    const freshData = getNews();
    onUpdate?.(freshData);
  }, CACHE_DURATION_MS);
}

// Cleanup
export function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Force refresh (e.g., pull-to-refresh)
export function forceRefresh(): NewsItem[] {
  cache = null;
  return getNews();
}
