import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { generateSignupOtpEmail } from '@/lib/emails/signupOtp';
import { z } from 'zod';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
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

    // DEBUG: Log environment variable status
    console.log('[RESEND DEBUG] API Key exists:', !!process.env.RESEND_API_KEY);
    console.log('[RESEND DEBUG] API Key length:', process.env.RESEND_API_KEY?.length || 0);
    console.log('[RESEND DEBUG] API Key prefix:', process.env.RESEND_API_KEY?.substring(0, 5) || 'NONE');

    // Send OTP email
    const emailHtml = generateSignupOtpEmail({ otp, email });
    
    try {
      console.log('[RESEND DEBUG] Attempting to send email to:', email);
      console.log('[RESEND DEBUG] From address:', 'Swole Gym <noreply@quantumworks.services>');
      
      const result = await resend.emails.send({
        from: 'Swole Gym <noreply@quantumworks.services>',
        to: email,
        subject: '🔐 Your Swole Gym Verification Code',
        html: emailHtml,
      });
      
      console.log('[RESEND DEBUG] Send result:', JSON.stringify(result, null, 2));
      console.log('[RESEND DEBUG] Email ID:', result.data?.id);
      console.log('[RESEND DEBUG] Error:', result.error);

      // Return detailed debug info in response
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        debug: {
          apiKeyExists: !!process.env.RESEND_API_KEY,
          apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
          apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 5) || 'NONE',
          emailId: result.data?.id,
          resendResult: result,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (emailError) {
      console.error('[RESEND DEBUG] Resend API error:', emailError);
      console.error('[RESEND DEBUG] Error type:', emailError instanceof Error ? emailError.constructor.name : typeof emailError);
      console.error('[RESEND DEBUG] Error message:', emailError instanceof Error ? emailError.message : String(emailError));
      
      // Delete the OTP record since email failed
      await prisma.signupOTP.deleteMany({
        where: { email },
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send OTP email. Please try again.',
          debug: {
            apiKeyExists: !!process.env.RESEND_API_KEY,
            apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
            errorType: emailError instanceof Error ? emailError.constructor.name : typeof emailError,
            errorMessage: emailError instanceof Error ? emailError.message : String(emailError),
            timestamp: new Date().toISOString(),
          },
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
