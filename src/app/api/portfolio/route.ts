import { NextResponse } from 'next/server';
import { processPortfolio } from '@/lib/repository/portfolio';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const portfolio = await processPortfolio(date ? new Date(date) : undefined);
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error populating portfolio cache:', error);
    return NextResponse.json({ error: 'Failed to populate portfolio cache' }, { status: 500 });
  }
}