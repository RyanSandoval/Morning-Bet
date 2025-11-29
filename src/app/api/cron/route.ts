import { NextResponse } from 'next/server';
import { getExpiredPendingBets, updateBetStatus } from '@/lib/db';
import { stripe } from '@/lib/stripe';

// This endpoint should be called by a cron job to process expired bets
// In production, you'd use Vercel Cron or a similar service

export async function GET(request: Request) {
  try {
    // Optional: Add a secret to protect this endpoint
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expiredBets = getExpiredPendingBets();
    const results: { betId: number; status: string; action: string }[] = [];

    for (const bet of expiredBets) {
      const allComplete = bet.tasks.every(t => t.completed);

      if (allComplete) {
        // User won - release the held funds (cancel the payment intent)
        if (bet.stripe_payment_intent_id) {
          try {
            await stripe.paymentIntents.cancel(bet.stripe_payment_intent_id);
          } catch (err) {
            console.error(`Failed to cancel payment for bet ${bet.id}:`, err);
          }
        }
        updateBetStatus(bet.id, 'won');
        results.push({ betId: bet.id, status: 'won', action: 'payment_released' });
      } else {
        // User lost - capture the held funds
        if (bet.stripe_payment_intent_id) {
          try {
            await stripe.paymentIntents.capture(bet.stripe_payment_intent_id);
            // In a full implementation, you'd transfer to the charity/friend here
            console.log(`Captured payment for bet ${bet.id}: $${bet.amount / 100}`);
            console.log(`Consequence: ${bet.consequence_type} - ${bet.consequence_target}`);
          } catch (err) {
            console.error(`Failed to capture payment for bet ${bet.id}:`, err);
          }
        }
        updateBetStatus(bet.id, 'lost');
        results.push({ betId: bet.id, status: 'lost', action: 'payment_captured' });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
