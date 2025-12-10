import { NextResponse } from 'next/server';
import { getHistoricalPortfolioValue, getUpdatedPortfolio } from '@/lib/repository/portfolio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required.' }, { status: 400 });
  }

  try {
    // We need the updated portfolio to have the scheme codes
    const portfolio = await getUpdatedPortfolio();
    const historicalValue = await getHistoricalPortfolioValue(portfolio, date);
    return NextResponse.json({ historicalValue });
  } catch (error) {
    console.error(`API Error fetching historical value for date ${date}:`, error);
    return NextResponse.json(
      { error: 'Failed to load historical portfolio value.' },
      { status: 500 }
    );
  }
}
