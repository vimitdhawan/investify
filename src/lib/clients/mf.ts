import { config } from '@/lib/config';
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

let cachedSchemeMap: Map<string, number> | null = null;

export async function fetchWithRetry<T>(
  path: string,
  retries = 2,
  timeoutMs = 10000
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
      logger.warn({ url, retriesLeft: retries }, 'NAV fetch failed, retrying');
      return fetchWithRetry(path, retries - 1, timeoutMs);
    }
    logger.error({ url, error }, 'NAV fetch permanently failed');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLatestNavBySchemeId(
  schemeCode: string
): Promise<SchemeNav | null> {
  const res = await fetchWithRetry<Scheme>(`/mf/${schemeCode}/latest`);
  if (!res.data?.[0]) {
    logger.error({ schemeCode }, 'empty response from latest nav api');
    return null;
  }
  return res.data[0];
}

export async function getHistoricalNavBySchemeId(
  schemeCode: string
): Promise<SchemeNav[]> {
  const res = await fetchWithRetry<Scheme>(`/mf/${schemeCode}`);
  if (!res.data) {
    logger.error({ schemeCode }, 'empty response from historical nav api');
    return [];
  }
  return res.data;
}

export async function getAmficCodeByIsin(isin: string): Promise<number | null> {
  if (!cachedSchemeMap) {
    const schemes = await fetchWithRetry<SchemeListItem[]>(`/mf`);
    cachedSchemeMap = new Map();
    for (const scheme of schemes) {
      if (scheme.isinGrowth) {
        cachedSchemeMap.set(scheme.isinGrowth, scheme.schemeCode);
      } else if (scheme.isinDivReinvestment) {
        cachedSchemeMap.set(scheme.isinDivReinvestment, scheme.schemeCode);
      }
    }
  }

  const schemeCode = cachedSchemeMap.get(isin);
  if (!schemeCode) {
    logger.error({ isin }, 'scheme not found for ISIN');
    return null;
  }
  return schemeCode;
}
