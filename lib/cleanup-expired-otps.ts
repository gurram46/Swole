import { prisma } from './db';

/**
 * Cleanup expired signup OTPs
 * This can be run as a cron job or scheduled task
 */
export async function cleanupExpiredOTPs() {
  try {
    const result = await prisma.signupOTP.deleteMany({
      where: {
        otp_expires: {
          lt: new Date(),
        },
      },
    });

    console.log(`Cleaned up ${result.count} expired OTPs`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
    throw error;
  }
}
