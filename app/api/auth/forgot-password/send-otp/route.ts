import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 password reset requests per 15 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`forgot-password:${clientIp}`, {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.success) {
      const resetInMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many password reset requests. Please try again in ${resetInMinutes} minute${resetInMinutes > 1 ? 's' : ''}.` 
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = sendOtpSchema.parse(body);

    const normalizedEmail = email.toLowerCase();

    // Check if admin user exists (but don't reveal if they don't)
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    // Always return success to prevent user enumeration
    // Only send email if user actually exists
    if (!adminUser) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent',
      });
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
      where: { email: normalizedEmail },
    });

    // Create new OTP record (reusing SignupOTP table)
    await prisma.signupOTP.create({
      data: {
        email: normalizedEmail,
        otp_code: hashedOtp,
        otp_expires: expiresAt,
        verified: false,
      },
    });

    // Send OTP email
    try {
      await resend.emails.send({
        from: 'Swole Gym <noreply@quantumworks.services>',
        to: normalizedEmail,
        subject: '🔐 Password Reset Code',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #667eea; color: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Password Reset</h1>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  <p>You requested to reset your password for your Swole Gym account.</p>
                  <p>Your password reset code is:</p>
                  <div class="otp-code">${otp}</div>
                  <p><strong>This code will expire in 10 minutes.</strong></p>
                  <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                  <div class="footer">
                    <p>This is an automated message from Swole Gym Management System.</p>
                    <p>© ${new Date().getFullYear()} Swole. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent',
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Delete the OTP record since email failed
      await prisma.signupOTP.deleteMany({
        where: { email: normalizedEmail },
      });
      
      return NextResponse.json(
        { success: false, error: 'Failed to send password reset email. Please try again.' },
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

    console.error('Send password reset OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send password reset code' },
      { status: 500 }
    );
  }
}
