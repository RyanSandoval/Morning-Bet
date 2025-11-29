import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createBet, getBetsForUser, getActiveBetForUser } from '@/lib/db';
import { z } from 'zod';
import { addDays, setHours, setMinutes, setSeconds } from 'date-fns';

const createBetSchema = z.object({
  amount: z.number().min(5).max(20),
  tasks: z.array(z.string().min(1)).length(3),
  consequence_type: z.enum(['charity', 'friend']),
  consequence_target: z.string().min(1),
  consequence_message: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bets = getBetsForUser(session.userId);
    return NextResponse.json({ bets });
  } catch (error) {
    console.error('Get bets error:', error);
    return NextResponse.json({ error: 'Failed to get bets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = createBetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if user already has an active bet
    const activeBet = getActiveBetForUser(session.userId);
    if (activeBet) {
      return NextResponse.json(
        { error: 'You already have an active bet. Complete or wait for it to expire first.' },
        { status: 400 }
      );
    }

    const { amount, tasks, consequence_type, consequence_target, consequence_message } = result.data;

    // Calculate deadline: noon tomorrow
    const now = new Date();
    const tomorrow = addDays(now, 1);
    const deadline = setSeconds(setMinutes(setHours(tomorrow, 12), 0), 0);

    const bet = createBet(
      session.userId,
      amount * 100, // Convert to cents
      deadline.toISOString(),
      consequence_type,
      consequence_target,
      consequence_message || null,
      tasks
    );

    return NextResponse.json({ bet });
  } catch (error) {
    console.error('Create bet error:', error);
    return NextResponse.json({ error: 'Failed to create bet' }, { status: 500 });
  }
}
