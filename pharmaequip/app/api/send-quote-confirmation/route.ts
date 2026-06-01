import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      to_email,
      customer_name,
      order_id,
      date,
      interested_items,
      message,
    } = body;

    if (!to_email || !order_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Educare <no-reply@educaremed.com>',
      to: [to_email],
      replyTo: 'educaresupplies21@gmail.com'
      subject: `Quote Request Received - Educare NG #${order_id}`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">Quote Request Received - Educare NG #${order_id}</h2>
          
          <p>Dear ${customer_name},</p>
          
          <p>Thank you for your quote request. We have received it and our team will review it shortly.</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
            <p style="margin: 6px 0;"><strong>Request ID:</strong> ${order_id}</p>
            <p style="margin: 6px 0;"><strong>Date:</strong> ${date}</p>
            ${interested_items ? `<p style="margin: 6px 0;"><strong>Interested Items:</strong> ${interested_items}</p>` : ''}
          </div>
          
          <p><strong>Your Message:</strong></p>
          <p style="background-color: #f8fafc; padding: 12px; border-radius: 6px;">${message}</p>
          
          <p style="margin-top: 25px;">We will get back to you as soon as possible with a quotation.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>
          <strong>Educare NG Team</strong><br>
          Delta State, Asaba</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


