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

// In-memory cache for ISIN to SchemeCode mapping
let isinSchemeCodeCache: Map<string, string> | null = null;
let lastFetchedIsinMapTime: Date | null = null;
const ISIN_MAP_CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function fetchAndCacheAllSchemesMap(): Promise<Map<string, string>> {
  if (isinSchemeCodeCache && lastFetchedIsinMapTime && (new Date().getTime() - lastFetchedIsinMapTime.getTime() < ISIN_MAP_CACHE_DURATION_MS)) {
    console.log("Using cached ISIN to SchemeCode map.");
    return isinSchemeCodeCache;
  }

  console.log("Fetching and building comprehensive ISIN to SchemeCode map for the first time or after expiry...");
  const newMap = new Map<string, string>();
  
  // Strategy: Query the search API with broad terms (e.g., each letter of the alphabet)
  // to get a comprehensive list of schemes with ISINs and scheme codes.
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

export async function fetchLatestNav(amfi: string | null): Promise<number | null> {
  if (!amfi) {
    return null;
  }

  try {
    const response = await fetch(`https://api.mfapi.in/mf/${amfi}/latest`);
    if (!response.ok) {
      console.error(`Failed to fetch latest NAV for AMFI ${amfi}: ${response.statusText}`);
      return null;
    }
    const data: MfApiResponse = await response.json();
    if (data.status === "SUCCESS" && data.data.length > 0) {
      return parseFloat(data.data[0].nav);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching latest NAV for AMFI ${amfi}:`, error);
    return null;
  }
}