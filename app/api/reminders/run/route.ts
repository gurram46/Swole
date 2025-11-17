import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { generateExpiryReminderEmail } from '@/lib/emails/expiryReminder';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Vercel Cron Configuration:
 * 
 * Add this to vercel.json in your project root:
 * 
 * {
 *   "crons": [
 *     {
 *       "path": "/api/reminders/run",
 *       "schedule": "0 7 * * *",
 *       "timezone": "Asia/Kolkata"
 *     }
 *   ]
 * }
 * 
 * This will run daily at 7:00 AM IST
 */

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isManual = searchParams.get('manual') === '1';

    console.log(`[Reminder] Starting reminder job (manual: ${isManual})`);

    // Get current date in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istNow = new Date(now.getTime() + istOffset);
    
    // Set to start of day in IST
    const todayIST = new Date(istNow);
    todayIST.setHours(0, 0, 0, 0);
    
    // Calculate date range (today to today + 3 days)
    const threeDaysFromNow = new Date(todayIST);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    console.log(`[Reminder] Date range: ${todayIST.toISOString()} to ${threeDaysFromNow.toISOString()}`);

    // Find all members with memberships expiring in the next 3 days
    const expiringMembers = await prisma.member.findMany({
      where: {
        is_active: true,
        membership_end: {
          gte: todayIST,
          lte: threeDaysFromNow,
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        membership_end: true,
        gym_id: true,
        gym: {
          select: {
            id: true,
            name: true,
            owner_email: true,
          },
        },
      },
      orderBy: {
        membership_end: 'asc',
      },
    });

    console.log(`[Reminder] Found ${expiringMembers.length} expiring members`);

    // Group members by gym
    const membersByGym = expiringMembers.reduce((acc, member) => {
      if (!acc[member.gym_id]) {
        acc[member.gym_id] = {
          gym: member.gym,
          members: [],
        };
      }
      acc[member.gym_id].members.push(member);
      return acc;
    }, {} as Record<string, { gym: any; members: any[] }>);

    const gymIds = Object.keys(membersByGym);
    console.log(`[Reminder] Processing ${gymIds.length} gyms`);

    let emailsSent = 0;
    let emailsFailed = 0;
    const results: any[] = [];

    // Process each gym
    for (const gymId of gymIds) {
      const { gym, members } = membersByGym[gymId];

      try {
        // Separate expired today vs expiring soon
        const endOfTodayIST = new Date(todayIST);
        endOfTodayIST.setHours(23, 59, 59, 999);

        const expiredToday = members.filter((m) => {
          const membershipEnd = new Date(m.membership_end);
          return membershipEnd >= todayIST && membershipEnd <= endOfTodayIST;
        });

        const expiringSoon = members.filter((m) => {
          const membershipEnd = new Date(m.membership_end);
          return membershipEnd > endOfTodayIST;
        });

        console.log(
          `[Reminder] Gym: ${gym.name} - Expired today: ${expiredToday.length}, Expiring soon: ${expiringSoon.length}`
        );

        // Skip if no members to report
        if (expiredToday.length === 0 && expiringSoon.length === 0) {
          console.log(`[Reminder] Skipping ${gym.name} - no expiring members`);
          continue;
        }

        // Generate email HTML
        const emailHtml = generateExpiryReminderEmail({
          gymName: gym.name,
          expiredToday: expiredToday.map((m) => ({
            name: m.name,
            phone: m.phone,
            membership_end: m.membership_end,
          })),
          expiringSoon: expiringSoon.map((m) => ({
            name: m.name,
            phone: m.phone,
            membership_end: m.membership_end,
          })),
        });

        // Send email via Resend
        const emailResult = await resend.emails.send({
          from: 'Swole Gym <noreply@quantumworks.services>',
          to: gym.owner_email,
          subject: `⚠️ Membership Expiry Alert - ${gym.name}`,
          html: emailHtml,
        });

        console.log(`[Reminder] Email sent to ${gym.owner_email} for ${gym.name}`);

        emailsSent++;
        results.push({
          gymId: gym.id,
          gymName: gym.name,
          ownerEmail: gym.owner_email,
          expiredToday: expiredToday.length,
          expiringSoon: expiringSoon.length,
          emailId: emailResult.data?.id,
          success: true,
        });
      } catch (error) {
        console.error(`[Reminder] Failed to send email for gym ${gym.name}:`, error);
        emailsFailed++;
        results.push({
          gymId: gym.id,
          gymName: gym.name,
          ownerEmail: gym.owner_email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log reminder run
    await prisma.reminderLog.create({
      data: {
        run_at: new Date(),
        manual: isManual,
      },
    });

    console.log(
      `[Reminder] Job complete - Sent: ${emailsSent}, Failed: ${emailsFailed}`
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalGyms: gymIds.length,
        totalMembers: expiringMembers.length,
        emailsSent,
        emailsFailed,
        manual: isManual,
        timestamp: new Date().toISOString(),
      },
      results,
    });
  } catch (error) {
    console.error('[Reminder] Job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
