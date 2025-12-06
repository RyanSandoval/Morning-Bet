import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getBetById, updateBetStatus } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { betId, status } = await request.json();

    if (!betId || !status || !['won', 'lost'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid request. betId and status (won/lost) required.' },
        { status: 400 }
      );
    }

    // Verify the bet belongs to this user
    const bet = await getBetById(betId);
    if (!bet || bet.user_id !== session.userId) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    // Update the bet status
    await updateBetStatus(betId, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Close bet error:', error);
    return NextResponse.json(
      { error: 'Failed to close bet' },
      { status: 500 }
    );
  }
}
