import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type OrderPayload = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  total: number;
  status: 'Pending' | 'Paid';
  reference: string;
  paymentMethod: 'paystack' | 'cod';
  deliveryType: 'door' | 'pickup' | 'whatsapp';
  delivery?: {
    address?: string;
    city?: string;
    state?: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
};

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    orders.map((order) => ({
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
    }))
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as OrderPayload;

  if (!body.customer || !body.email || !body.phone || !body.items?.length) {
    return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      id: body.id,
      customer: body.customer,
      email: body.email,
      phone: body.phone,
      total: body.total,
      status: body.status,
      reference: body.reference,
      paymentMethod: body.paymentMethod,
      deliveryType: body.deliveryType,
      address: body.delivery?.address || '',
      city: body.delivery?.city || '',
      state: body.delivery?.state || '',
      items: {
        create: body.items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id?: string; status?: string };

  if (!body.id || !body.status) {
    return NextResponse.json({ error: 'Missing order status details' }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: body.id },
    data: { status: body.status },
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
