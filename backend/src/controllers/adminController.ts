import { Response } from 'express';
import { prisma } from '../config/db';
import { RequestWithUser } from '../middleware/auth';

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req: RequestWithUser, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const tripsThisMonth = await prisma.trip.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Top destinations (grouped by location)
    const topDestinations = await prisma.trip.groupBy({
      by: ['name'], // Using name as proxy for destination in this schema
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const recentTrips = await prisma.trip.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTrips,
        tripsThisMonth,
        topDestinations: topDestinations.map((d) => ({
          location: d.name,
          count: d._count.id,
        })),
        recentTrips,
      },
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users with trip counts
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req: RequestWithUser, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: { trips: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: users.map((u) => ({
        ...u,
        tripCount: u._count.trips,
      })),
    });
  } catch (error) {
    console.error('Admin Get Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all trips with user info
// @route   GET /api/admin/trips
// @access  Private/Admin
export const getAllTrips = async (req: RequestWithUser, res: Response) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: { activities: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: trips,
    });
  } catch (error) {
    console.error('Admin Get Trips Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
