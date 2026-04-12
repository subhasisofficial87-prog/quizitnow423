import Razorpay from 'razorpay';
import crypto from 'crypto';

const PLANS = {
  basic: { amount: 29900, name: 'QuizItNow Basic' },
  pro: { amount: 49900, name: 'QuizItNow Pro' },
};

function getRazorpayInstance(): Razorpay {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID ?? '',
    key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
  });
}

export async function createOrder(plan: 'basic' | 'pro', userId: number) {
  const razorpay = getRazorpayInstance();
  const planDetails = PLANS[plan];

  const order = await razorpay.orders.create({
    amount: planDetails.amount,
    currency: 'INR',
    notes: {
      userId: userId.toString(),
      plan,
    },
  });

  return order;
}

export function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET ?? '';
  if (!secret || secret === 'placeholder_razorpay_secret') return false;

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

export { PLANS };
