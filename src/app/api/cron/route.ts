import { NextResponse } from 'next/server';
import {
  getExpiredPendingBets,
  updateBetStatus,
  getCharityById,
  createDonation,
  updateDonationStatus,
} from '@/lib/db';
import { stripe, createTransfer } from '@/lib/stripe';

// Platform fee percentage (e.g., 5% for operating costs)
const PLATFORM_FEE_PERCENT = 5;

// This endpoint should be called by a cron job to process expired bets
// In production, you'd use Vercel Cron or a similar service

interface CronResult {
  betId: number;
  status: string;
  action: string;
  transferId?: string;
  donationId?: number;
  error?: string;
}

export async function GET(request: Request) {
  try {
    // Optional: Add a secret to protect this endpoint
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expiredBets = getExpiredPendingBets();
    const results: CronResult[] = [];

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
        // User lost - capture the held funds and transfer to charity/friend
        const result: CronResult = { betId: bet.id, status: 'lost', action: 'payment_captured' };

        if (bet.stripe_payment_intent_id) {
          try {
            // Capture the payment
            await stripe.paymentIntents.capture(bet.stripe_payment_intent_id);
            console.log(`Captured payment for bet ${bet.id}: $${bet.amount / 100}`);

            // Handle charity donation
            if (bet.consequence_type === 'charity' && bet.charity_id) {
              const charity = getCharityById(bet.charity_id);

              if (charity) {
                // Create donation record
                const donation = createDonation({
                  bet_id: bet.id,
                  charity_id: charity.id,
                  user_id: bet.user_id,
                  amount: bet.amount,
                });
                result.donationId = donation.id;

                // Calculate transfer amount (minus platform fee)
                const platformFee = Math.round(bet.amount * (PLATFORM_FEE_PERCENT / 100));
                const transferAmount = bet.amount - platformFee;

                // Transfer to charity if they have a Stripe Connect account
                if (charity.stripe_connect_account_id) {
                  try {
                    const transfer = await createTransfer(
                      transferAmount,
                      charity.stripe_connect_account_id,
                      {
                        bet_id: String(bet.id),
                        charity_id: String(charity.id),
                        charity_name: charity.name,
                        user_id: String(bet.user_id),
                      }
                    );
                    result.transferId = transfer.id;
                    updateDonationStatus(donation.id, 'completed', transfer.id);
                    console.log(`Transferred $${transferAmount / 100} to ${charity.name} (${transfer.id})`);
                  } catch (transferErr) {
                    console.error(`Failed to transfer to charity ${charity.name}:`, transferErr);
                    const errorMessage = transferErr instanceof Error ? transferErr.message : 'Transfer failed';
                    updateDonationStatus(donation.id, 'failed', undefined, errorMessage);
                    result.error = errorMessage;
                  }
                } else {
                  // Charity doesn't have Stripe Connect - mark donation as pending manual transfer
                  console.log(`Charity ${charity.name} has no Stripe Connect account - manual transfer required`);
                  updateDonationStatus(
                    donation.id,
                    'pending',
                    undefined,
                    'Manual transfer required - charity not connected to Stripe'
                  );
                }
              } else {
                console.warn(`Charity ID ${bet.charity_id} not found for bet ${bet.id}`);
              }
            } else if (bet.consequence_type === 'friend') {
              // TODO: Implement friend payment handling
              // Options: Stripe Payment Links, direct transfer, etc.
              console.log(`Friend payment pending for bet ${bet.id}: ${bet.consequence_target}`);
            }
          } catch (err) {
            console.error(`Failed to capture payment for bet ${bet.id}:`, err);
            result.error = err instanceof Error ? err.message : 'Capture failed';
          }
        }
        updateBetStatus(bet.id, 'lost');
        results.push(result);
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
