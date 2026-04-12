import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { verifySignature } from '@/lib/razorpay';

interface PaymentRow {
  id: number;
  plan: 'basic' | 'pro';
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    };
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      await query(
        'UPDATE payments SET status = ? WHERE razorpay_order_id = ?',
        ['failed', razorpayOrderId]
      );
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Get payment record to know the plan
    const payments = await query<PaymentRow[]>(
      'SELECT id, plan FROM payments WHERE razorpay_order_id = ? AND user_id = ?',
      [razorpayOrderId, user.id]
    );

    if (payments.length === 0) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    const { plan } = payments[0];

    // Update payment
    await query(
      'UPDATE payments SET razorpay_payment_id = ?, razorpay_signature = ?, status = ? WHERE razorpay_order_id = ?',
      [razorpayPaymentId, razorpaySignature, 'success', razorpayOrderId]
    );

    // Update user plan (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await query(
      'UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?',
      [plan, expiresAt.toISOString().slice(0, 19).replace('T', ' '), user.id]
    );

    return NextResponse.json({ success: true, plan });
  } catch (err) {
    console.error('Verify payment error:', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
