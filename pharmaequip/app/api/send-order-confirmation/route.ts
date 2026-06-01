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
      total,
      address,
      items_list,
    } = body;

    if (!to_email || !order_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Educare <onboarding@resend.dev>',
      to: [to_email],
      replyTo: 'info@educareng.com', // TODO: Replace with your actual website email
      subject: `Order Confirmation - Educare NG #${order_id}`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">Order Confirmation - Educare NG #${order_id}</h2>
          
          <p>Dear ${customer_name},</p>
          
          <p>Thank you for your order!</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
            <p style="margin: 6px 0;"><strong>Order ID:</strong> ${order_id}</p>
            <p style="margin: 6px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 6px 0;"><strong>Total Amount:</strong> ₦${total}</p>
          </div>
          
          <p>We have received your order and it is being processed.</p>
          
          <p><strong>Delivery Address:</strong><br>
          ${address}</p>
          
          <p>You will be contacted shortly for delivery confirmation.</p>
          
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
