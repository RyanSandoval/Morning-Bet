import { NextResponse } from 'next/server';
import { getCharities, searchCharities } from '@/lib/db';
import type { Charity } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category') as Charity['category'] | null;
    const controversial = searchParams.get('controversial');

    let charities: Charity[];

    if (search) {
      // Search by name or description
      charities = await searchCharities(search);
    } else {
      // Filter by options
      charities = await getCharities({
        category: category || undefined,
        isControversial: controversial === 'true' ? true : controversial === 'false' ? false : undefined,
        activeOnly: true,
      });
    }

    return NextResponse.json({ charities });
  } catch (error) {
    console.error('Get charities error:', error);
    return NextResponse.json({ error: 'Failed to get charities' }, { status: 500 });
  }
}
