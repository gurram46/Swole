import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';
import crypto from 'crypto';

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 verification attempts per 15 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`verify-otp:${clientIp}`, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.success) {
      const resetInMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many verification attempts. Please try again in ${resetInMinutes} minute${resetInMinutes > 1 ? 's' : ''}.` 
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, otp } = verifyOtpSchema.parse(body);

    // Find OTP record
    const otpRecord = await prisma.signupOTP.findUnique({
      where: { email },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'No OTP found for this email. Please request a new one.' },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.otp_expires) {
      // Delete expired OTP
      await prisma.signupOTP.delete({
        where: { email },
      });
      
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Hash provided OTP and compare using secure comparison
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Use timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(hashedOtp),
      Buffer.from(otpRecord.otp_code)
    );
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await prisma.signupOTP.update({
      where: { email },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Verify signup OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
