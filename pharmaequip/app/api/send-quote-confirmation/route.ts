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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          
          <!-- Header with Logo -->
          <div style="background-color: #1e40af; padding: 24px 20px; text-align: center;">
            <img src="https://educaremed.com/logo.png" alt="Educare Medical Supplies" style="max-height: 55px; width: auto; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto;" />
            <div style="color: #ffffff; font-size: 18px; font-weight: 600; letter-spacing: 0.5px;">Educare Medical Supplies</div>
          </div>

          <!-- Main Content -->
          <div style="padding: 28px 24px 20px;">
            <h2 style="color: #1e40af; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">Quote Request Received</h2>
            <div style="color: #64748b; font-size: 13px; margin-bottom: 20px;">Request #${order_id}</div>
            
            <p style="font-size: 15px; color: #334155; margin: 0 0 18px 0; line-height: 1.5;">
              Dear ${customer_name},<br><br>
              Thank you for your quote request. We have received it and our team will review it shortly.
            </p>

            <!-- Request Details Box -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 22px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 5px 0; color: #64748b; width: 130px;">Request ID</td>
                  <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">#${order_id}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #64748b;">Date</td>
                  <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">${date}</td>
                </tr>
                ${interested_items ? `
                <tr>
                  <td style="padding: 5px 0; color: #64748b; vertical-align: top;">Interested Items</td>
                  <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">${interested_items}</td>
                </tr>` : ''}
              </table>
            </div>

            <p style="font-size: 14px; color: #334155; margin: 0 0 6px 0;"><strong>Your Message</strong></p>
            <div style="background-color: #f1f5f9; padding: 14px; border-radius: 6px; font-size: 14px; line-height: 1.5; color: #334155; border: 1px solid #e2e8f0;">
              ${message}
            </div>

            <p style="font-size: 15px; color: #334155; margin: 22px 0 0 0;">We will get back to you as soon as possible with a quotation.</p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
            Best regards,<br>
            <strong>Educare NG Team</strong> • Delta State, Asaba<br><br>
            <a href="https://educaremed.com" style="color: #1e40af; text-decoration: none;">www.educaremed.com</a>
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


