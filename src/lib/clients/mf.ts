import { config } from '@/lib/config';
import { Scheme, SchemeListItem, SchemeNav } from '@/lib/types/mf';

let cachedSchemeMap: Map<string, number> | null = null;

async function fetchFromMF<T>(path: string): Promise<T> {
  const response = await fetch(`${config.mfApiBaseUrl}${path}`, {
    next: { revalidate: 60 }, // cache 60 seconds
  });

  if (!response.ok) {
    throw new Error(`MF API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getLatestNavBySchemeId(
  schemeCode: string
): Promise<SchemeNav> {
  const res = await fetchFromMF<Scheme>(`/mf/${schemeCode}/latest`);
  if (!res.data?.[0]) {
    throw new Error(`No NAV found for scheme ${schemeCode}`);
  }
  return res.data[0];
}

export async function getHistoricalNavBySchemeId(
  schemeCode: string
): Promise<SchemeNav[]> {
  const res = await fetchFromMF<Scheme>(`/mf/${schemeCode}`);
  if (!res.data) {
    throw new Error(`No historical NAV found`);
  }
  return res.data;
}

export async function getAmficCodeByIsin(isin: string): Promise<number> {
  if (!cachedSchemeMap) {
    const schemes = await fetchFromMF<SchemeListItem[]>(`/mf`);
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
    throw new Error(`Scheme not found for ISIN ${isin}`);
  }
  return schemeCode;
}
