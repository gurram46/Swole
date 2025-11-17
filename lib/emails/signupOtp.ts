interface SignupOtpEmailProps {
  otp: string;
  email: string;
}

export function generateSignupOtpEmail({ otp, email }: SignupOtpEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Swole</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">
        SWOLE
      </h1>
      <p style="color: #9ca3af; margin-top: 8px; font-size: 14px;">Gym Management Made Strong</p>
    </div>

    <!-- Main Card -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">Verify Your Email</h2>
      <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
        Welcome to Swole! Use the code below to complete your gym registration.
      </p>

      <!-- OTP Box -->
      <div style="background: linear-gradient(135deg, #a855f7, #3b82f6); padding: 2px; border-radius: 12px; margin-bottom: 32px;">
        <div style="background: #18181b; border-radius: 10px; padding: 24px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Your Verification Code</p>
          <div style="font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">
            ${otp}
          </div>
        </div>
      </div>

      <!-- Expiry Notice -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="color: #92400e; font-size: 14px; margin: 0;">
          ⏰ This code expires in <strong>10 minutes</strong>
        </p>
      </div>

      <!-- Security Notice -->
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
        If you didn't request this code, please ignore this email. Never share your verification code with anyone.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 32px; border-top: 1px solid #27272a;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
        This email was sent to <strong style="color: #9ca3af;">${email}</strong>
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} Swole Gym Management
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        Need help? Contact us at <a href="mailto:contact@quantumworks.services" style="color: #a855f7; text-decoration: none;">contact@quantumworks.services</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
