import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../db';

// GET /api/admin/overview
export const getAdminOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalUsers,
      approvedOwners,
      pendingOwners,
      activeMatches,
      completedMatches,
      pendingReports,
      totalReviews
    ] = await Promise.all([
      prisma.user.count(),
      prisma.venue.count({ where: { status: 'APPROVED' } }),
      prisma.venue.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.match.count({ where: { status: 'AVAILABLE' } }),
      prisma.match.count({ where: { status: 'COMPLETED' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.venueReview.count()
    ]);

    res.json({
      totalUsers,
      approvedOwners,
      pendingOwners,
      activeMatches,
      completedMatches,
      pendingReports,
      totalReviews
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
};

// GET /api/admin/owners/pending
export const getPendingOwners = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pendingVenues = await prisma.venue.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ venues: pendingVenues });
  } catch (error) {
    console.error('Error fetching pending owners:', error);
    res.status(500).json({ error: 'Failed to fetch pending applications' });
  }
};

// POST /api/admin/owners/:id/approve
export const approveOwner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const venue = await prisma.venue.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { owner: true }
    });

    if (venue.owner.role === 'USER') {
      await prisma.user.update({
        where: { id: venue.ownerId },
        data: { role: 'GROUND_OWNER' }
      });
    }

    await prisma.notification.create({
      data: {
        userId: venue.ownerId,
        title: '🏟️ Venue Approved!',
        body: `Your venue "${venue.name}" has been approved and is now live on GAMEVIA.`,
        link: '/owner/dashboard'
      }
    });

    res.json({ message: 'Venue approved successfully', venue });
  } catch (error) {
    console.error('Error approving owner:', error);
    res.status(500).json({ error: 'Failed to approve venue' });
  }
};

// POST /api/admin/owners/:id/reject
export const rejectOwner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    const venue = await prisma.venue.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || 'Application did not meet venue verification standards.'
      }
    });

    await prisma.notification.create({
      data: {
        userId: venue.ownerId,
        title: '⚠️ Venue Application Status Update',
        body: `Your application for "${venue.name}" was not approved: ${venue.rejectionReason}`,
        link: '/owner/dashboard'
      }
    });

    res.json({ message: 'Venue rejected', venue });
  } catch (error) {
    console.error('Error rejecting owner:', error);
    res.status(500).json({ error: 'Failed to reject venue' });
  }
};

// GET /api/admin/owners
export const getAllOwners = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            isSuspended: true,
            profile: { select: { name: true } }
          }
        },
        _count: { select: { matches: true, venueReviews: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ venues });
  } catch (error) {
    console.error('Error fetching all owners:', error);
    res.status(500).json({ error: 'Failed to fetch venue list' });
  }
};

// POST /api/admin/owners/:id/suspend
export const suspendOwner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const venue = await prisma.venue.update({
      where: { id },
      data: { status: 'SUSPENDED' }
    });

    await prisma.notification.create({
      data: {
        userId: venue.ownerId,
        title: '🚨 Venue Status Suspended',
        body: `Your venue listing "${venue.name}" has been temporarily suspended by moderation.`,
        link: '/owner/dashboard'
      }
    });

    res.json({ message: 'Venue suspended', venue });
  } catch (error) {
    console.error('Error suspending owner:', error);
    res.status(500).json({ error: 'Failed to suspend venue' });
  }
};

// POST /api/admin/owners/:id/reinstate
export const reinstateOwner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const venue = await prisma.venue.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    res.json({ message: 'Venue reinstated', venue });
  } catch (error) {
    console.error('Error reinstating owner:', error);
    res.status(500).json({ error: 'Failed to reinstate venue' });
  }
};

// GET /api/admin/reports
export const getAdminReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// POST /api/admin/reports/:id/action
export const handleReportAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { action, suspendUser } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: {
        status: action === 'DISMISSED' ? 'DISMISSED' : 'ACTION_TAKEN',
        adminAction: action === 'DISMISSED' ? 'Dismissed by Admin' : 'Action taken by Admin',
        resolvedAt: new Date()
      }
    });

    if (suspendUser && report.targetType === 'USER') {
      await prisma.user.update({
        where: { id: report.targetId },
        data: { isSuspended: true }
      });
    }

    res.json({ message: 'Report action processed', report });
  } catch (error) {
    console.error('Error handling report:', error);
    res.status(500).json({ error: 'Failed to process report' });
  }
};

// GET /api/admin/reviews
export const getAdminReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviews = await prisma.venueReview.findMany({
      include: {
        author: { select: { email: true, profile: { select: { name: true } } } },
        venue: { select: { name: true, locality: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// DELETE /api/admin/reviews/:id
export const deleteAdminReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const review = await prisma.venueReview.delete({ where: { id } });

    const remainingReviews = await prisma.venueReview.findMany({
      where: { venueId: review.venueId }
    });

    const avgRating = remainingReviews.length > 0
      ? remainingReviews.reduce((acc, r) => acc + r.rating, 0) / remainingReviews.length
      : 5.0;

    await prisma.venue.update({
      where: { id: review.venueId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: remainingReviews.length
      }
    });

    res.json({ message: 'Review removed successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
