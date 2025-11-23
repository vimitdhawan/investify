import { Scheme, SchemeListItem} from "@/lib/types/mf";

export async function getSchemeNav(schemeCode: string): Promise<Scheme> {
  const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NAV for scheme ${schemeCode}: ${response.statusText}`);
  }
  return response.json();
}

export async function getSchemeHistoricalNav(schemeCode: string): Promise<Scheme> {
  const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NAV for scheme ${schemeCode}: ${response.statusText}`);
  }
  return response.json();
}

export async function getAllMutualFundSchemes(): Promise<SchemeListItem[]> {
  const response = await fetch("https://api.mfapi.in/mf");
  if (!response.ok) {
    throw new Error(`Failed to fetch all mutual fund schemes: ${response.statusText}`);
  }
  return response.json();
}
