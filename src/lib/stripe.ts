import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Stripe functionality will not work.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-11-17.clover',
});

export async function createPaymentIntent(
  amount: number, // in cents
  customerId?: string,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  const params: Stripe.PaymentIntentCreateParams = {
    amount,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  };

  if (customerId) {
    params.customer = customerId;
  }

  return stripe.paymentIntents.create(params);
}

export async function createCustomer(email: string, name: string): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email,
    name,
  });
}

export async function capturePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.capture(paymentIntentId);
}

export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.cancel(paymentIntentId);
}

// For transferring money when user loses (to charity or friend)
export async function createTransfer(
  amount: number,
  destination: string, // connected account ID
  metadata?: Record<string, string>
): Promise<Stripe.Transfer> {
  return stripe.transfers.create({
    amount,
    currency: 'usd',
    destination,
    metadata,
  });
}
