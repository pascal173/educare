import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature || !PAYSTACK_SECRET) {
      return NextResponse.json({ error: 'Invalid signature or missing secret key' }, { status: 400 });
    }

    // Verify signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle successful charge
    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      // Update order status in database
      const updatedOrder = await prisma.order.updateMany({
        where: { reference },
        data: { status: 'Paid' },
      });

      console.log(`Webhook: Order with reference ${reference} marked as Paid`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
