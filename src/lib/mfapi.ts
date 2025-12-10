export interface MfApiResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
    isin_growth: string;
  };
  data: {
    date: string;
    nav: string;
  }[];
  status: string;
}

// Interface for the search API response from mfapi.in/mf/search?q=
interface MfSearchScheme {
  schemeCode: number;
  schemeName: string;
  isinGrowth: string;
  isinDivReinvestment: string | null;
}

// Helper to parse DD-MM-YYYY date strings
function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// In-memory cache for ISIN to SchemeCode mapping
let isinSchemeCodeCache: Map<string, string> | null = null;
let lastFetchedIsinMapTime: Date | null = null;
const ISIN_MAP_CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

// In-memory cache for historical NAV data
export const historicalNavCache: Map<string, MfApiResponse['data']> = new Map();


export async function fetchAndCacheAllSchemesMap(): Promise<Map<string, string>> {
  if (isinSchemeCodeCache && lastFetchedIsinMapTime && (new Date().getTime() - lastFetchedIsinMapTime.getTime() < ISIN_MAP_CACHE_DURATION_MS)) {
    console.log("Using cached ISIN to SchemeCode map.");
    return isinSchemeCodeCache;
  }

  console.log("Fetching and building comprehensive ISIN to SchemeCode map for the first time or after expiry...");
  const newMap = new Map<string, string>();
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const queryPromises: Promise<MfSearchScheme[]>[] = [];

  for (const char of alphabet) {
    queryPromises.push(
      fetch(`https://api.mfapi.in/mf/search?q=${char}`)
        .then(res => {
          if (!res.ok) {
            console.error(`Failed to fetch schemes for query ${char}: ${res.statusText}`);
            return [];
          }
          return res.json();
        })
        .catch(error => {
          console.error(`Error fetching schemes for query ${char}:`, error);
          return [];
        })
    );
  }

  try {
    const allSearchResults = await Promise.all(queryPromises);
    allSearchResults.flat().forEach(scheme => {
      if (scheme.isinGrowth && scheme.schemeCode) {
        newMap.set(scheme.isinGrowth, scheme.schemeCode.toString());
      }
    });
    
    isinSchemeCodeCache = newMap;
    lastFetchedIsinMapTime = new Date();
    console.log(`ISIN to SchemeCode map built with ${newMap.size} entries.`);
    return newMap;
  } catch (error) {
    console.error("Critical error building comprehensive ISIN to SchemeCode map:", error);
    return isinSchemeCodeCache || new Map<string, string>();
  }
}

export async function fetchLatestNavData(schemeCode: string | null): Promise<MfApiResponse | null> {
  if (!schemeCode) {
    return null;
  }

  try {
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!response.ok) {
      console.error(`Failed to fetch latest NAV for scheme ${schemeCode}: ${response.statusText}`);
      return null;
    }
    const data: MfApiResponse = await response.json();
    if (data.status === "SUCCESS") {
      historicalNavCache.set(schemeCode, data.data); // Cache the full history
      return data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching latest NAV for scheme ${schemeCode}:`, error);
    return null;
  }
}

export async function getSchemeNavOnDate(schemeCode: string, date: string): Promise<{ nav: number; date: string } | null> {
    let navHistory = historicalNavCache.get(schemeCode);

    if (!navHistory) {
        const data = await fetchLatestNavData(schemeCode);
        if (data) {
            navHistory = data.data;
        } else {
            return null; // Could not fetch history
        }
    }

    const targetDate = new Date(date);
    for (const navEntry of navHistory) {
        const entryDate = parseDateString(navEntry.date);
        if (entryDate <= targetDate) {
            return { nav: parseFloat(navEntry.nav), date: navEntry.date };
        }
    }

    return null; // No NAV found on or before the date
}