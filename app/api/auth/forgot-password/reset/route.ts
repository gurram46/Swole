import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = resetPasswordSchema.parse(body);

    const normalizedEmail = email.toLowerCase();

    // Find OTP record
    const otpRecord = await prisma.signupOTP.findUnique({
      where: { email: normalizedEmail },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'No password reset request found' },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.otp_expires) {
      await prisma.signupOTP.delete({
        where: { email: normalizedEmail },
      });
      
      return NextResponse.json(
        { success: false, error: 'Password reset code has expired' },
        { status: 410 }
      );
    }

    // Check if OTP was verified
    if (!otpRecord.verified) {
      return NextResponse.json(
        { success: false, error: 'Please verify your code first' },
        { status: 400 }
      );
    }

    // Verify OTP one more time
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    if (hashedOtp !== otpRecord.otp_code) {
      return NextResponse.json(
        { success: false, error: 'Invalid password reset code' },
        { status: 400 }
      );
    }

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
      include: {
        gym: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        password_hash: newPasswordHash,
      },
    });

    // Delete the used OTP
    await prisma.signupOTP.delete({
      where: { email: normalizedEmail },
    });

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Swole Gym <noreply@quantumworks.services>',
        to: normalizedEmail,
        subject: '✅ Password Reset Successful',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Password Reset Successful</h1>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  <p>Your password for <strong>${adminUser.gym.name}</strong> has been successfully reset.</p>
                  <p><strong>When:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                  <p>You can now log in with your new password.</p>
                  <p>If you didn't make this change, please contact support immediately.</p>
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
    } catch (emailError) {
      console.error('Failed to send password reset confirmation:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
