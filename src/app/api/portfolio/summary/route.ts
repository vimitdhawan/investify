import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// The SchemeInfo type here needs to match the data being read from the file,
// which includes the 'transactions' property.
interface SchemeInfo {
  name: string;
  isin: string;
  units: number;
  nav: number;
  cost: number;
  type: string;
  additional_info?: {
    amfi: string | null;
  };
  transactions: any[]; // This was missing
}

interface FolioInfo {
  folio_number: string;
  amc: string;
  schemes: SchemeInfo[];
}

interface ParsedData {
  investor: any;
  mutual_funds: FolioInfo[];
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'mf_details.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: ParsedData = JSON.parse(fileContents);

    // Create a summary: map over funds and schemes, but exclude the 'transactions' array
    const summaryData = {
      investor: data.investor,
      mutual_funds: data.mutual_funds.map(folio => ({
        ...folio,
        schemes: folio.schemes.map(scheme => {
          // This destructuring is now valid because the interface includes 'transactions'
          const { transactions, ...schemeWithoutTransactions } = scheme;
          return schemeWithoutTransactions;
        }),
      })),
    };
    
    return NextResponse.json(summaryData);
  } catch (error) {
    console.error("API Error reading mf_details.json for summary:", error);
    return NextResponse.json(
      { error: "Failed to load portfolio summary from server." },
      { status: 500 }
    );
  }
}