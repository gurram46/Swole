import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const otpRateLimit = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid email' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    const lastRequest = otpRateLimit.get(normalizedEmail);
    const now = Date.now();
    if (lastRequest && now - lastRequest < 30000) {
      return NextResponse.json(
        { success: false, error: 'Rate_limit' },
        { status: 429 }
      );
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, userNotFound: true },
        { status: 404 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        otp_code: otp,
        otp_expires: expiresAt,
      },
    });

    try {
      await resend.emails.send({
        from: 'Swole Auth <contact@quantumworks.services>',
        to: normalizedEmail,
        subject: 'Your Swole Login Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Your Swole Login Code</h2>
            <p style="color: #4b5563; margin-bottom: 24px;">Use this code to log in to your Swole dashboard:</p>
            <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
              <div style="color: #1f2937; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otp}</div>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">This code will expire in 10 minutes.</p>
            <p style="color: #9ca3af; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });

      otpRateLimit.set(normalizedEmail, now);

      setTimeout(() => {
        otpRateLimit.delete(normalizedEmail);
      }, 30000);

    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return NextResponse.json(
        { success: false, error: 'Email_failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
