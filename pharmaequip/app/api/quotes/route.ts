import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type QuotePayload = {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  company?: string;
  interestedItems?: string;
  message: string;
};

export async function GET() {
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    quotes.map((quote) => ({
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
    }))
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as QuotePayload;

  if (!body.customer || !body.email || !body.message) {
    return NextResponse.json({ error: 'Missing quote request details' }, { status: 400 });
  }

  const quote = await prisma.quoteRequest.create({
    data: {
      id: body.id,
      customer: body.customer,
      email: body.email,
      phone: body.phone || '',
      company: body.company || '',
      interestedItems: body.interestedItems || '',
      message: body.message,
    },
  });

  return NextResponse.json({ ok: true, quoteId: quote.id });
}
