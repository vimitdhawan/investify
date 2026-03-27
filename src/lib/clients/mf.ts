import { config } from '@/lib/config';
import { firestore } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export interface SchemeListItem {
  schemeCode: number;
  schemeName: string;
  isinGrowth: string | null;
  isinDivReinvestment: string | null;
}

export interface SchemeNav {
  date: string;
  nav: string;
}

export interface Scheme {
  meta: SchemeMeta;
  data: SchemeNav[];
  status: string;
}

interface SchemeMeta {
  fund_house: string;
  scheme_type: string;
  scheme_category: string;

  scheme_code: number;
  scheme_name: string;
  isin_growth: string;
  isin_div_reinvestment: string | null;
}

interface NavCacheDoc<T> {
  data: T;
  cachedAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

let cachedSchemeMap: Map<string, number> | null = null;

export async function fetchWithRetry<T>(
  path: string,
  retries = 3,
  timeoutMs = 5000,
  currentDelay = 100
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${config.mfApiBaseUrl}${path}`;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    if (retries > 0) {
      logger.warn({ url, retries, nextRetryDelay: currentDelay }, 'Retrying fetch with backoff');
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      return fetchWithRetry(path, retries - 1, timeoutMs, currentDelay * 2);
    }
    logger.error({ url, error }, 'NAV fetch permanently failed');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getFromCache<T>(cacheKey: string): Promise<T | null> {
  try {
    const doc = await firestore.collection('nav_cache').doc(cacheKey).get();
    if (doc.exists) {
      const cacheData = doc.data() as NavCacheDoc<T>;
      const now = Date.now();
      if (now - cacheData.cachedAt < CACHE_TTL_MS) {
        return cacheData.data;
      }
    }
  } catch (error) {
    logger.error({ cacheKey, error }, 'Error reading from cache');
  }
  return null;
}

async function saveToCache<T>(cacheKey: string, data: T): Promise<void> {
  try {
    await firestore.collection('nav_cache').doc(cacheKey).set({
      data,
      cachedAt: Date.now(),
    });
  } catch (error) {
    logger.error({ cacheKey, error }, 'Error saving to cache');
  }
}

export async function getLatestNavBySchemeId(schemeCode: string): Promise<SchemeNav | undefined> {
  try {
    const doc = await firestore.collection('mf_schemes_latest').doc(schemeCode).get();

    if (!doc.exists) {
      logger.error({ schemeCode }, 'scheme not found in Firestore');
      return;
    }

    const data = doc.data();
    return {
      date: data?.navDate,
      nav: data?.nav,
    };
  } catch (error) {
    logger.error({ schemeCode, error }, 'Error fetching latest NAV from Firestore');
    return;
  }
}

// OLD IMPLEMENTATION (using external API):
// export async function getLatestNavBySchemeId(schemeCode: string): Promise<SchemeNav | undefined> {
//   const cacheKey = `latest-${schemeCode}`;
//   const cachedData = await getFromCache<SchemeNav>(cacheKey);
//   if (cachedData) {
//     return cachedData;
//   }
//
//   const res = await fetchWithRetry<Scheme>(`/mf/${schemeCode}/latest`);
//   if (!res.data?.[0]) {
//     logger.error({ schemeCode }, 'empty response from latest nav api');
//     return;
//   }
//
//   const latestNav = res.data[0];
//   await saveToCache(cacheKey, latestNav);
//   return latestNav;
// }

export async function getHistoricalNavBySchemeId(schemeCode: string): Promise<SchemeNav[]> {
  try {
    const doc = await firestore.collection('mf_schemes_history').doc(schemeCode).get();

    if (!doc.exists) {
      logger.error({ schemeCode }, 'scheme history not found in Firestore');
      return [];
    }

    const data = doc.data();
    return data?.navHistory || [];
  } catch (error) {
    logger.error({ schemeCode, error }, 'Error fetching historical NAV from Firestore');
    return [];
  }
}

// OLD IMPLEMENTATION (using external API):
// export async function getHistoricalNavBySchemeId(schemeCode: string): Promise<SchemeNav[]> {
//   const cacheKey = `historical-${schemeCode}`;
//   const cachedData = await getFromCache<SchemeNav[]>(cacheKey);
//   if (cachedData) {
//     return cachedData;
//   }
//
//   const res = await fetchWithRetry<Scheme>(`/mf/${schemeCode}`);
//   if (!res.data) {
//     logger.error({ schemeCode }, 'empty response from historical nav api');
//     return [];
//   }
//
//   await saveToCache(cacheKey, res.data);
//   return res.data;
// }

export async function getAmficCodeByIsin(isin: string): Promise<number | undefined> {
  try {
    const doc = await firestore.collection('mf_isin_map').doc(isin).get();

    if (!doc.exists) {
      logger.error({ isin }, 'scheme not found for ISIN');
      return;
    }

    return doc.data()?.schemeCode;
  } catch (error) {
    logger.error({ isin, error }, 'Error fetching scheme code from Firestore');
    return;
  }
}

// OLD IMPLEMENTATION (using external API):
// export async function getAmficCodeByIsin(isin: string): Promise<number | undefined> {
//   if (!cachedSchemeMap) {
//     const cacheKey = 'scheme-map';
//     const cachedData = await getFromCache<[string, number][]>(cacheKey);
//
//     if (cachedData) {
//       cachedSchemeMap = new Map(cachedData);
//     } else {
//       const schemes = await fetchWithRetry<SchemeListItem[]>(`/mf`);
//       cachedSchemeMap = new Map();
//       for (const scheme of schemes) {
//         if (scheme.isinGrowth) {
//           cachedSchemeMap.set(scheme.isinGrowth, scheme.schemeCode);
//         } else if (scheme.isinDivReinvestment) {
//           cachedSchemeMap.set(scheme.isinDivReinvestment, scheme.schemeCode);
//         }
//       }
//       await saveToCache(cacheKey, Array.from(cachedSchemeMap.entries()));
//     }
//   }
//
//   const schemeCode = cachedSchemeMap.get(isin);
//   if (!schemeCode) {
//     logger.error({ isin }, 'scheme not found for ISIN');
//     return;
//   }
//   return schemeCode;
// }
