import { NextResponse } from 'next/server';
import { fetchAndCacheAllSchemesMap } from '@/lib/mfapi';

export async function GET() {
  try {
    const isinToSchemeCodeMap = await fetchAndCacheAllSchemesMap();
    // Convert Map to a plain object for JSON serialization
    return NextResponse.json(Object.fromEntries(isinToSchemeCodeMap));
  } catch (error) {
    console.error("API Error in /api/isin-scheme-map:", error);
    return NextResponse.json(
      { error: "Failed to provide ISIN to SchemeCode map." },
      { status: 500 }
    );
  }
}