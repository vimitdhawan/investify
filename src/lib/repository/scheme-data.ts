import fs from "fs/promises";
import path from "path";

export interface SchemeData {
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

let cachedData: SchemeData[] | null = null;

async function parseCSV(csvContent: string): Promise<SchemeData[]> {
  const lines = csvContent.split("\n");
  const headers = lines[0].split(",");
  // A rough way to handle the merged header.
  if (headers.length === 10) {
    headers.push("ISIN Div Reinvestment");
    headers[9] = "ISIN Div Payout/ ISIN Growth";
  }


  const data: SchemeData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = line.split(",");
    if (values.length < headers.length -1) continue; // Skip lines that don't have enough columns

    const scheme: SchemeData = {
      amc: values[0] || "",
      code: values[1] || "",
      schemeName: values[2] || "",
      schemeType: values[3] || "",
      schemeCategory: values[4] || "",
      schemeNavName: values[5] || "",
      schemeMinimumAmount: values[6] || "",
      launchDate: values[7] || "",
      closureDate: values[8] || "",
      isinDivPayoutOrGrowth: values[9] || "",
      isinDivReinvestment: values[10] || "",
    };
    data.push(scheme);
  }
  return data;
}

export async function getAllSchemeData(): Promise<SchemeData[]> {
  if (cachedData) {
    return cachedData;
  }

  const filePath = path.join(process.cwd(), "SchemeData1112251219SS.csv");
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const parsedData = await parseCSV(fileContent);
    cachedData = parsedData;
    return cachedData;
  } catch (error) {
    console.error("Error reading or parsing scheme data CSV:", error);
    return [];
  }
}
