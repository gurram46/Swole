import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest();
    
    if (!session || !session.gym_id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { qr_code } = body;

    if (!qr_code) {
      return NextResponse.json(
        { success: false, error: 'QR code is required' },
        { status: 400 }
      );
    }

    // Strip GYMQR: prefix if present
    let cleanQrCode = qr_code;
    if (qr_code.startsWith('GYMQR:')) {
      cleanQrCode = qr_code.substring(6); // Remove "GYMQR:" prefix
    }

    // Find member by gym_id + qr_code
    const member = await prisma.member.findFirst({
      where: {
        gym_id: session.gym_id,
        qr_code: cleanQrCode,
      },
    });

    // Reject if member not found
    if (!member) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unknown QR code',
          message: 'Member not found for this QR code'
        },
        { status: 404 }
      );
    }

    // Reject if member is inactive
    if (!member.is_active) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Member inactive',
          message: `${member.name}'s membership is inactive`
        },
        { status: 403 }
      );
    }

    // Check if membership has expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const membershipEnd = new Date(member.membership_end);
    membershipEnd.setHours(0, 0, 0, 0);

    if (membershipEnd < today) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Membership expired',
          message: `${member.name}'s membership expired on ${membershipEnd.toLocaleDateString()}`
        },
        { status: 403 }
      );
    }

    // Check for open session (check_out_time IS NULL)
    const openSession = await prisma.attendance.findFirst({
      where: {
        member_id: member.id,
        gym_id: session.gym_id,
        check_out_time: null,
      },
      orderBy: {
        check_in_time: 'desc',
      },
    });

    if (openSession) {
      // Open session exists → CHECK-OUT
      const updatedSession = await prisma.attendance.update({
        where: {
          id: openSession.id,
        },
        data: {
          check_out_time: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        action: 'check-out',
        message: `${member.name} checked out successfully`,
        member: {
          id: member.id,
          name: member.name,
          phone: member.phone,
        },
        attendance: {
          id: updatedSession.id,
          check_in_time: updatedSession.check_in_time,
          check_out_time: updatedSession.check_out_time,
        },
      });
    } else {
      // No open session → CHECK-IN
      const newSession = await prisma.attendance.create({
        data: {
          gym_id: session.gym_id,
          member_id: member.id,
          check_in_time: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        action: 'check-in',
        message: `${member.name} checked in successfully`,
        member: {
          id: member.id,
          name: member.name,
          phone: member.phone,
        },
        attendance: {
          id: newSession.id,
          check_in_time: newSession.check_in_time,
          check_out_time: null,
        },
      });
    }
  } catch (error) {
    console.error('Attendance scan error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to process attendance scan'
      },
      { status: 500 }
    );
  }
}
