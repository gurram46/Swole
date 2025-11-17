import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { generateSignupOtpEmail } from '@/lib/emails/signupOtp';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 OTP requests per 15 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`signup-otp:${clientIp}`, {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.success) {
      const resetInMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many OTP requests. Please try again in ${resetInMinutes} minute${resetInMinutes > 1 ? 's' : ''}.` 
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = sendOtpSchema.parse(body);

    // Check if email already exists in AdminUser
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Email already registered. Please use login instead.' },
        { status: 409 }
      );
    }

    // Generate cryptographically secure 6-digit OTP
    const otpBuffer = crypto.randomBytes(4);
    const otp = (otpBuffer.readUInt32BE(0) % 900000 + 100000).toString();
    
    // Hash OTP for storage (SHA256)
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTP for this email
    await prisma.signupOTP.deleteMany({
      where: { email },
    });

    // Create new OTP record
    await prisma.signupOTP.create({
      data: {
        email,
        otp_code: hashedOtp,
        otp_expires: expiresAt,
        verified: false,
      },
    });

    // Send OTP email
    const emailHtml = generateSignupOtpEmail({ otp, email });
    
    try {
      await resend.emails.send({
        from: 'Swole Gym <noreply@quantumworks.services>',
        to: email,
        subject: '🔐 Your Swole Gym Verification Code',
        html: emailHtml,
      });

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      
      // Delete the OTP record since email failed
      await prisma.signupOTP.deleteMany({
        where: { email },
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send OTP email. Please try again.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Send signup OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
