import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'mf_details.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error reading mf_details.json:", error);
    return NextResponse.json(
      { error: "Failed to load portfolio data from server." },
      { status: 500 }
    );
  }
}
