export interface GoldRateItem {
  gram: string; // "1", "8", "10", "100"
  today_24k: number;
  change_24k: number | null;
  today_22k: number;
  change_22k: number | null;
  today_18k: number;
  change_18k: number | null;
}

export interface GoldRatesData {
  items: GoldRateItem[];
}

export interface GoldRateResponse {
  status: string; // "success" or "error"
  data: GoldRatesData;
  timestamp?: number; // Added locally for UI reference
}

const CACHE_KEY = 'tpg_gold_rates';
const CACHE_TIMESTAMP_KEY = 'tpg_gold_rates_timestamp';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const DEFAULT_API_KEY = 'pmx_ec6aa2844f803d811d1ef0fabc125f04';

// Direct Parse Bot API endpoint
const DIRECT_API_URL = 'https://api.parse.bot/scraper/cdcf99d0-b178-4dda-880c-6a531cfda453/get_india_gold_rates';

/**
 * Helper to fetch gold rates either via development proxy or direct fallback.
 */
async function fetchFromApi(): Promise<GoldRateResponse> {
  const apiKey = import.meta.env.VITE_GOLD_API_KEY || DEFAULT_API_KEY;

  // 1. Try dev server proxy first
  try {
    const res = await fetch('/api/gold-rates', {
      method: 'GET',
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.data && data.data.items) {
        return data as GoldRateResponse;
      }
    }
  } catch (e) {
    console.warn('Vite proxy fetch failed, falling back to direct API fetch:', e);
  }

  // 2. Direct client-side fetch fallback
  const res = await fetch(DIRECT_API_URL, {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch gold rates from API. Status: ${res.status}`);
  }

  const data = await res.json();
  if (!data || data.status !== 'success' || !data.data || !data.data.items) {
    throw new Error('API response returned success but missing rates items.');
  }

  return data as GoldRateResponse;
}

/**
 * Retrieves cached gold rates from localStorage, if valid.
 */
function getCachedRates(): GoldRateResponse | null {
  try {
    const cachedDataStr = localStorage.getItem(CACHE_KEY);
    const cachedTimeStr = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cachedDataStr || !cachedTimeStr) return null;

    const data = JSON.parse(cachedDataStr) as GoldRateResponse;
    const timestamp = parseInt(cachedTimeStr, 10);

    if (isNaN(timestamp) || Date.now() - timestamp > CACHE_DURATION) {
      return null; // Cache expired
    }

    return { ...data, timestamp };
  } catch (e) {
    console.error('Error reading gold rates cache:', e);
    return null;
  }
}

/**
 * Saves gold rates and current timestamp into localStorage cache.
 */
function cacheRates(data: GoldRateResponse) {
  try {
    const timestamp = Date.now();
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
  } catch (e) {
    console.error('Failed to write gold rates cache:', e);
  }
}

/**
 * Main function to fetch live gold rates with 1-hour client-side caching.
 * @param forceRefresh Ignore cache and fetch live rates
 */
export async function getGoldRates(forceRefresh = false): Promise<GoldRateResponse> {
  if (!forceRefresh) {
    const cached = getCachedRates();
    if (cached) {
      return cached;
    }
  }

  // Cache miss or force refresh: fetch new rates
  const data = await fetchFromApi();
  cacheRates(data);
  return { ...data, timestamp: Date.now() };
}
