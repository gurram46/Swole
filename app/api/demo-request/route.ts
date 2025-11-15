import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { fullName, gymName, phone, city, message } = body;

    // Validate required fields
    if (!fullName || !gymName || !phone || !city) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // TODO: Send email via Resend
    // For now, we'll just log and return success
    console.log('Demo Request Received:', {
      to: 'contact@quantumworks.services',
      subject: 'New Demo Request – Swole',
      body: {
        fullName,
        gymName,
        phone,
        city,
        message: message || 'No message provided',
      },
    });

    // Stub: Simulate email sending
    // In production, integrate Resend here:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'noreply@swole.app',
      to: 'contact@quantumworks.services',
      subject: 'New Demo Request – Swole',
      html: `
        <h2>New Demo Request</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Gym Name:</strong> ${gymName}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Message:</strong> ${message || 'No message'}</p>
      `,
    });
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Demo request error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reject non-POST requests
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
