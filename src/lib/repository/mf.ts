import { Scheme, SchemeNav, SchemeListItem} from "@/lib/types/mf";

let latestNavSchemeById: Map<string, SchemeNav> | null = null;
let historyNavSchemeBydId: Map<string, SchemeNav[]> | null = null;
let amfiByIsinId: Map<string, number> | null = null;

export async function getLatestNavBySchemeId(schemeCode: string): Promise<SchemeNav> {
  if(!latestNavSchemeById) {
    latestNavSchemeById = new Map<string, SchemeNav>();
  }
  const nav = latestNavSchemeById.get(schemeCode);
  if (nav) {
    return nav
  }
  const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NAV for scheme ${schemeCode}: ${response.statusText}`);
  }
  const res = (await response.json()) as Scheme;
  if (res.data && res.data[0]) {
    latestNavSchemeById.set(schemeCode, res.data[0])
     return res.data[0];
  }
  throw new Error(`Failed to fetch NAV for scheme ${schemeCode}}`);
 
}


export async function getHistoricalNavBySchemeId(schemeCode: string): Promise<SchemeNav[]> {
  if(!historyNavSchemeBydId) {
    historyNavSchemeBydId = new Map<string, SchemeNav[]>();
  }
  const historical = historyNavSchemeBydId.get(schemeCode);
  if (historical) {
    return historical
  }
  const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NAV for scheme ${schemeCode}: ${response.statusText}`);
  }
  const res = (await response.json()) as Scheme;
  if (res.data) {
    historyNavSchemeBydId.set(schemeCode, res.data)
    return res.data
  }
  throw new Error(`Failed to fetch historical NAV for scheme ${schemeCode}}`);
}

export async function getAmficCodeByIsin(isin: string): Promise<number> {
  if(!amfiByIsinId) {
    amfiByIsinId = new Map<string, number>();
  }
  const scheme = amfiByIsinId.get(isin);
  if (scheme) {
    return scheme
  }
  const response = await fetch("https://api.mfapi.in/mf");
  if (!response.ok) {
    throw new Error(`Failed to fetch all mutual fund schemes: ${response.statusText}`);
  }
  const res = (await response.json()) as SchemeListItem[]
  for (const scheme of res) {
     if (scheme.isinGrowth) {
      amfiByIsinId.set(scheme.isinGrowth, scheme.schemeCode);
    }
    if (scheme.isinDivReinvestment) {
        amfiByIsinId.set(scheme.isinDivReinvestment, scheme.schemeCode);
    }
  }
  const schemeCode = amfiByIsinId.get(isin);
  if (schemeCode) {
    return schemeCode
  }
   throw new Error(`Failed to fetch all mutual fund schemes`);
}
