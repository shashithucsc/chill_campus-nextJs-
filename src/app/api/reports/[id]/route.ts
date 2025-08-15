import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import User from '@/models/User';

export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
  const user = await User.findById((session.user as any).id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

  const { status, adminNotes } = await req.json();
  const { id } = context?.params || {};

    // Validate status
    if (!['Pending', 'Resolved', 'Ignored'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update report
    report.status = status;
  report.reviewedBy = (session.user as any).id;
    report.reviewedAt = new Date();
    if (adminNotes) report.adminNotes = adminNotes;

    await report.save();

    return NextResponse.json({ 
      success: true,
      message: 'Report updated successfully',
      report
    });

  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
  const user = await User.findById((session.user as any).id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

  const { id } = context?.params || {};
    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
