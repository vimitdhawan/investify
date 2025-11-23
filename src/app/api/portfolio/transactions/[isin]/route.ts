import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Simplified types for this specific API route
interface SchemeInfo {
  isin: string;
  transactions: any[];
}

interface FolioInfo {
  schemes: SchemeInfo[];
}

interface ParsedData {
  mutual_funds: FolioInfo[];
}

export async function GET(
  request: Request,
  { params }: { params: { isin: string } }
) {
  const isin = params.isin;

  if (!isin) {
    return NextResponse.json({ error: 'ISIN parameter is missing.' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'mf_details.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: ParsedData = JSON.parse(fileContents);

    let foundTransactions: any[] | null = null;

    // Search for the matching scheme
    for (const folio of data.mutual_funds) {
      const foundScheme = folio.schemes.find(scheme => scheme.isin === isin);
      if (foundScheme) {
        foundTransactions = foundScheme.transactions;
        break; // Exit loop once found
      }
    }

    if (foundTransactions !== null) {
      return NextResponse.json(foundTransactions);
    } else {
      return NextResponse.json({ error: `Scheme with ISIN ${isin} not found.` }, { status: 404 });
    }
  } catch (error) {
    console.error(`API Error reading transactions for ISIN ${isin}:`, error);
    return NextResponse.json(
      { error: "Failed to load transaction data from server." },
      { status: 500 }
    );
  }
}
