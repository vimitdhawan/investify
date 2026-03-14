// scripts/ingest-schemes.ts
import { bucket, firestore } from '@/lib/firebase';

// Corrected import (removed fs and path)

// --- All scheme ingestion logic is now in this file ---

interface SchemeData {
  amc: string;
  code: string;
  schemeName: string;
  schemeType: string;
  schemeCategory: string;
  schemeNavName: string;
  schemeMinimumAmount: string;
  launchDate: string;
  closureDate: string;
  isinDivPayoutOrGrowth: string;
  isinDivReinvestment: string;
}

async function parseCSV(csvContent: string): Promise<SchemeData[]> {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  // A rough way to handle the merged header.
  if (headers.length === 10) {
    headers.push('ISIN Div Reinvestment');
    headers[9] = 'ISIN Div Payout/ ISIN Growth';
  }

  const data: SchemeData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = line.split(',');
    if (values.length < headers.length - 1) continue; // Skip lines that don't have enough columns

    const scheme: SchemeData = {
      amc: values[0] || '',
      code: values[1] || '',
      schemeName: values[2] || '',
      schemeType: values[3] || '',
      schemeCategory: values[4] || '',
      schemeNavName: values[5] || '',
      schemeMinimumAmount: values[6] || '',
      launchDate: values[7] || '',
      closureDate: values[8] || '',
      isinDivPayoutOrGrowth: (values[9] || '').trim(),
      isinDivReinvestment: (values[10] || '').trim(),
    };
    data.push(scheme);
  }
  return data;
}

async function readSchemeFile(): Promise<SchemeData[]> {
  const fileName = 'SchemeData.csv';
  try {
    const file = bucket.file(fileName);
    const [fileContent] = await file.download();
    const parsedData = await parseCSV(fileContent.toString('utf-8'));
    return parsedData;
  } catch (error) {
    console.error('Error reading or parsing scheme data CSV from Firebase Storage:', error); // Updated error message
    if ((error as any).code === 404) {
      console.error(`File '${fileName}' not found in the bucket.`); // More specific error
    }
    return [];
  }
}

async function ingestSchemes() {
  const allSchemes = await readSchemeFile();
  if (!allSchemes || allSchemes.length === 0) {
    console.log('No scheme data found to ingest.');
    return;
  }

  const batch = firestore.batch();
  let count = 0;

  for (const scheme of allSchemes) {
    // Use scheme 'code' (likely AMFI code) as the document ID.
    if (scheme.code) {
      const schemeRef = firestore.collection('schemes').doc(scheme.code);
      batch.set(schemeRef, scheme, { merge: true });
      count++;
    }
  }

  try {
    await batch.commit();
    console.log(`Successfully ingested ${count} schemes into Firestore.`);
  } catch (error) {
    console.error('Error ingesting schemes to Firestore:', error);
  }
}

async function main() {
  console.log('Starting scheme data ingestion...');
  await ingestSchemes();
  console.log('Scheme data ingestion finished.');
}

main().catch((error) => {
  console.error('An error occurred during scheme data ingestion:', error);
  process.exit(1);
});
