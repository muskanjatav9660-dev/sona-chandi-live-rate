import { BullionRates, CityRate, PriceHistoryPoint, NewsItem } from '../types';

const STORAGE_KEYS = {
  RATES: 'sonachandi_cached_rates',
  CITIES: 'sonachandi_cached_cities',
  HISTORY: 'sonachandi_cached_history',
  NEWS: 'sonachandi_cached_news',
  LAST_SYNC: 'sonachandi_last_sync_timestamp',
};

export interface CachedData {
  rates: BullionRates | null;
  cities: CityRate[] | null;
  history: PriceHistoryPoint[] | null;
  news: NewsItem[] | null;
  lastSyncTimestamp: number | null;
  lastSyncFormatted: string | null;
}

/**
 * Saves all bullion data to local storage for instant offline availability
 */
export function saveBullionDataToCache(
  rates?: BullionRates,
  cities?: CityRate[],
  history?: PriceHistoryPoint[],
  news?: NewsItem[]
) {
  if (typeof window === 'undefined') return;

  try {
    const now = Date.now();
    const formatted = new Date().toLocaleString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    }) + ' IST';

    if (rates) {
      localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
    }
    if (cities && cities.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));
    }
    if (history && history.length > 0) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }
    if (news && news.length > 0) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
    }

    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, JSON.stringify({ timestamp: now, formatted }));
  } catch (err) {
    console.warn('[OfflineStorage] Notice while saving to localStorage cache:', err);
  }
}

/**
 * Loads cached bullion data from local storage
 */
export function loadBullionDataFromCache(): CachedData {
  if (typeof window === 'undefined') {
    return {
      rates: null,
      cities: null,
      history: null,
      news: null,
      lastSyncTimestamp: null,
      lastSyncFormatted: null,
    };
  }

  let rates: BullionRates | null = null;
  let cities: CityRate[] | null = null;
  let history: PriceHistoryPoint[] | null = null;
  let news: NewsItem[] | null = null;
  let lastSyncTimestamp: number | null = null;
  let lastSyncFormatted: string | null = null;

  try {
    const rawRates = localStorage.getItem(STORAGE_KEYS.RATES);
    if (rawRates) rates = JSON.parse(rawRates);

    const rawCities = localStorage.getItem(STORAGE_KEYS.CITIES);
    if (rawCities) cities = JSON.parse(rawCities);

    const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (rawHistory) history = JSON.parse(rawHistory);

    const rawNews = localStorage.getItem(STORAGE_KEYS.NEWS);
    if (rawNews) news = JSON.parse(rawNews);

    const rawSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (rawSync) {
      const parsedSync = JSON.parse(rawSync);
      lastSyncTimestamp = parsedSync.timestamp;
      lastSyncFormatted = parsedSync.formatted;
    }
  } catch (err) {
    console.warn('[OfflineStorage] Error reading cache:', err);
  }

  return {
    rates,
    cities,
    history,
    news,
    lastSyncTimestamp,
    lastSyncFormatted,
  };
}

/**
 * Helper to register Service Worker in browser
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[ServiceWorker] Successfully registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.log('[ServiceWorker] Registration skipped or failed:', err);
        });
    });
  }
}
