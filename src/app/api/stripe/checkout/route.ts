import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getActiveBetForUser, getUserById, updateUserStripeCustomerId, updateBetPaymentIntent } from '@/lib/db';
import { stripe, createCustomer, createPaymentIntent } from '@/lib/stripe';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's active bet
    const bet = getActiveBetForUser(session.userId);
    if (!bet) {
      return NextResponse.json({ error: 'No active bet found' }, { status: 400 });
    }

    // If already has payment intent, return error
    if (bet.stripe_payment_intent_id) {
      return NextResponse.json({ error: 'Payment already initiated' }, { status: 400 });
    }

    // Get or create Stripe customer
    const user = getUserById(session.userId)!;
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await createCustomer(user.email, user.name);
      customerId = customer.id;
      updateUserStripeCustomerId(user.id, customerId);
    }

    // Create payment intent with manual capture
    // This authorizes the payment but doesn't charge until we capture it
    const paymentIntent = await stripe.paymentIntents.create({
      amount: bet.amount,
      currency: 'usd',
      customer: customerId,
      capture_method: 'manual', // Hold the funds, capture later if user loses
      metadata: {
        bet_id: bet.id.toString(),
        user_id: session.userId.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store payment intent ID on bet
    updateBetPaymentIntent(bet.id, paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: bet.amount,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
