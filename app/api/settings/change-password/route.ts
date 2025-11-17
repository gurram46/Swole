import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest, signToken, setSessionCookie } from '@/lib/auth';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = changePasswordSchema.parse(body);

    // Get current admin user
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.admin_id },
      include: {
        gym: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(data.oldPassword, admin.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(data.newPassword, 12);

    // Update password
    await prisma.adminUser.update({
      where: { id: session.admin_id },
      data: {
        password_hash: newPasswordHash,
      },
    });

    // Create new session token
    const newToken = await signToken({
      admin_id: admin.id,
      gym_id: admin.gym_id,
      email: admin.email,
      role: admin.role,
    });

    // Set new session cookie
    await setSessionCookie(newToken);

    // Send notification email
    try {
      await resend.emails.send({
        from: 'Swole Gym <noreply@quantumworks.services>',
        to: admin.email,
        subject: '🔒 Password Changed Successfully',
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
                  <h1>🔒 Password Changed</h1>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  <p>Your password for <strong>${admin.gym.name}</strong> has been changed successfully.</p>
                  <p><strong>When:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                  <p>If you didn't make this change, please contact support immediately.</p>
                  <p>For security reasons, you've been logged out of all other devices. You'll need to log in again with your new password.</p>
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
      console.error('Failed to send password change notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. Your session has been refreshed.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
