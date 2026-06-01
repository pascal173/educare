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
      from: 'Educare <no-reply@educaremed.com>',
      to: [to_email],
      replyTo: 'educaresupplies21@gmail.com',
      subject: `Order Confirmation - Educare NG #${order_id}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          
          <!-- Header with Logo -->
          <div style="background-color: #1e40af; padding: 28px 24px; text-align: center;">
            <img src="https://educaremed.com/logo.png" alt="Educare Medical Supplies" width="170" style="max-width: 170px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" />
            <div style="color: #ffffff; font-size: 19px; font-weight: 600; letter-spacing: 0.4px;">Educare Medical Supplies</div>
          </div>

          <!-- Greeting & Intro -->
          <div style="padding: 32px 28px 8px;">
            <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.5;">
              Dear ${customer_name},<br><br>
              Thank you for your order!
            </p>

            <!-- Order Summary Card -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
              <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 10px; letter-spacing: 0.5px;">ORDER DETAILS</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 14.5px;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; width: 135px;">Order ID</td>
                  <td style="padding: 4px 0; color: #1e293b; font-weight: 700;">#${order_id}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Date</td>
                  <td style="padding: 4px 0; color: #1e293b; font-weight: 600;">${date}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Total Amount</td>
                  <td style="padding: 4px 0; color: #1e293b; font-weight: 700; font-size: 15.5px;">₦${total}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0 4px 0; color: #64748b; vertical-align: top;">Delivery Address</td>
                  <td style="padding: 8px 0 4px 0; color: #1e293b; font-weight: 600; white-space: pre-line; line-height: 1.4;">${address}</td>
                </tr>
              </table>
            </div>

            <!-- Items -->
            <div style="margin-bottom: 8px;">
              <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px;">ITEMS ORDERED</div>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.5; color: #334155; white-space: pre-wrap; font-family: monospace;">${items_list}</div>
            </div>

            <p style="font-size: 15px; color: #334155; margin: 20px 0 0 0;">We have received your order and it is being processed.<br>You will be contacted shortly for delivery confirmation.</p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 22px 24px; border-top: 1px solid #e2e8f0; font-size: 12.5px; color: #64748b; text-align: center;">
            <div style="margin-bottom: 6px;">
              Best regards,<br>
              <strong style="color: #1e40af;">Educare NG Team</strong><br>
              Delta State, Asaba
            </div>
            <a href="https://educaremed.com" style="color: #1e40af; text-decoration: none; font-weight: 500;">www.educaremed.com</a>
          </div>

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




