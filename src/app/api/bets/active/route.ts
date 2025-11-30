import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getActiveBetForUser } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bet = await getActiveBetForUser(session.userId);
    return NextResponse.json({ bet: bet || null });
  } catch (error) {
    console.error('Get active bet error:', error);
    return NextResponse.json({ error: 'Failed to get active bet' }, { status: 500 });
  }
}
