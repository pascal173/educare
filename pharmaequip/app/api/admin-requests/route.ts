import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [orders, quotes] = await Promise.all([
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const normalizedOrders = orders.map((order) => ({
    id: order.id,
    date: order.date.toLocaleDateString('en-GB'),
    customer: order.customer,
    email: order.email,
    phone: order.phone,
    total: order.total,
    status: order.status,
    reference: order.reference,
    paymentMethod: order.paymentMethod,
    deliveryType: order.deliveryType,
    delivery: {
      type: order.deliveryType,
      fullName: order.customer,
      email: order.email,
      phone: order.phone,
      address: order.address || '',
      city: order.city || '',
      state: order.state || '',
    },
    items: order.items.map((item) => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    createdAt: order.createdAt.toISOString(),
  }));

  const normalizedQuotes = quotes.map((quote) => ({
    id: quote.id,
    date: quote.date.toLocaleDateString('en-GB'),
    customer: quote.customer,
    email: quote.email,
    phone: quote.phone || '',
    company: quote.company || '',
    interestedItems: quote.interestedItems || '',
    quoteMessage: quote.message,
    message: quote.message,
    total: 0,
    items: [],
    status: quote.status,
    reference: 'Request for Quote',
    delivery: null,
    createdAt: quote.createdAt.toISOString(),
  }));

  return NextResponse.json(
    [...normalizedOrders, ...normalizedQuotes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
}
