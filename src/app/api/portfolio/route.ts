// import { NextResponse } from 'next/server';
// import { processPortfolio } from '@/lib/repository/portfolio';
// import { getSessionUserId } from '@/lib/session';

// export async function GET(request: Request) {
//   try {
//     const userId = await getSessionUserId();
//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const date = searchParams.get('date');
//     const portfolio = await processPortfolio(
//       userId,
//       date ? new Date(date) : undefined
//     );
//     return NextResponse.json(portfolio);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to populate portfolio cache' },
//       { status: 500 }
//     );
//   }
// }
