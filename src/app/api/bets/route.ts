import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { addDays, setHours, setMinutes, setSeconds } from 'date-fns';
import type { BetWithTasks } from '@/types';

// Safe database imports - may fail on Vercel
let createBet: any = null;
let getBetsForUser: any = null;
let getActiveBetForUser: any = null;

try {
  const db = require('@/lib/db');
  createBet = db.createBet;
  getBetsForUser = db.getBetsForUser;
  getActiveBetForUser = db.getActiveBetForUser;
} catch {
  // Database not available
}

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

    if (getBetsForUser) {
      try {
        const bets = getBetsForUser(session.userId);
        return NextResponse.json({ bets });
      } catch {
        // Database error
      }
    }

    // Return empty bets if database unavailable
    return NextResponse.json({ bets: [] });
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

    const { amount, tasks, consequence_type, consequence_target, consequence_message } = result.data;

    // Calculate deadline: noon tomorrow
    const now = new Date();
    const tomorrow = addDays(now, 1);
    const deadline = setSeconds(setMinutes(setHours(tomorrow, 12), 0), 0);

    // Try database first
    if (createBet && getActiveBetForUser) {
      try {
        const activeBet = getActiveBetForUser(session.userId);
        if (activeBet) {
          return NextResponse.json(
            { error: 'You already have an active bet. Complete or wait for it to expire first.' },
            { status: 400 }
          );
        }

        const bet = createBet(
          session.userId,
          amount * 100,
          deadline.toISOString(),
          consequence_type,
          consequence_target,
          consequence_message || null,
          tasks
        );

        return NextResponse.json({ bet });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Fall through to demo mode
      }
    }

    // Demo mode: return mock bet without database
    const mockBet: BetWithTasks = {
      id: Math.floor(Math.random() * 10000),
      user_id: session.userId,
      amount: amount * 100,
      deadline: deadline.toISOString(),
      status: 'pending',
      consequence_type,
      consequence_target,
      consequence_message: consequence_message || null,
      stripe_payment_intent_id: null,
      created_at: now.toISOString(),
      tasks: tasks.map((title, index) => ({
        id: Math.floor(Math.random() * 10000) + index,
        bet_id: 0,
        title,
        completed: false,
        completed_at: null,
        created_at: now.toISOString(),
      })),
    };

    return NextResponse.json({ bet: mockBet, demo: true });
  } catch (error) {
    console.error('Create bet error:', error);
    return NextResponse.json({ error: 'Failed to create bet' }, { status: 500 });
  }
}
