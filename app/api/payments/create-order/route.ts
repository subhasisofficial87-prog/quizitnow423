import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { createOrder, PLANS } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { plan?: 'basic' | 'pro' };
    const { plan } = body;

    if (!plan || !['basic', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const order = await createOrder(plan, user.id);

    // Record pending payment
    await query(
      'INSERT INTO payments (user_id, razorpay_order_id, plan, amount, status) VALUES (?, ?, ?, ?, ?)',
      [user.id, order.id, plan, PLANS[plan].amount, 'pending']
    );

    return NextResponse.json({
      orderId: order.id,
      amount: PLANS[plan].amount,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
