import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { RequestWithUser } from '../middleware/auth';

// @desc    Get all trips for authenticated user
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: request.user?.id },
      include: {
        _count: {
          select: { activities: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: trips.map(trip => ({
        ...trip,
        activityCount: trip._count.activities,
      })),
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const trip = await prisma.trip.findFirst({
      where: { 
        id: String(request.params.id),
        userId: request.user?.id 
      },
      include: {
        activities: { orderBy: { date: 'asc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        checklists: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.json({ success: true, data: trip });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const { name, description, startDate, endDate, coverImage, isPublic } = request.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Name and dates are required' });
    }

    const shareToken = isPublic ? Math.random().toString(36).substring(2, 10) : null;

    const trip = await prisma.trip.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverImage,
        isPublic: isPublic || false,
        shareToken,
        userId: request.user!.id,
      },
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const { name, description, startDate, endDate, coverImage, isPublic } = request.body;

    let trip = await prisma.trip.findFirst({
      where: { id: String(request.params.id), userId: request.user?.id }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    // Handle share token generation if trip is made public
    let shareToken = trip.shareToken;
    if (isPublic && !trip.isPublic && !shareToken) {
      shareToken = Math.random().toString(36).substring(2, 10);
    }

    trip = await prisma.trip.update({
      where: { id: String(request.params.id) },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        coverImage,
        isPublic,
        shareToken,
      },
    });

    res.json({ success: true, data: trip });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: String(request.params.id), userId: request.user?.id }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    await prisma.trip.delete({ where: { id: String(request.params.id) } });

    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get public trip by share token
// @route   GET /api/trips/public/:shareToken
// @access  Public
export const getPublicTrip = async (req: Request, res: Response) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { shareToken: String(req.params.shareToken) },
      include: {
        activities: { orderBy: { date: 'asc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        checklists: { orderBy: { createdAt: 'asc' } },
        user: {
          select: { name: true, profilePicture: true }
        }
      },
    });

    if (!trip || !trip.isPublic) {
      return res.status(404).json({ success: false, message: 'Public trip not found' });
    }

    res.json({ success: true, data: trip });
  } catch (error) {
    console.error('Get public trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Duplicate a trip
// @route   POST /api/trips/:id/duplicate
// @access  Private
export const duplicateTrip = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const originalTrip = await prisma.trip.findFirst({
      where: { id: String(request.params.id), userId: request.user?.id },
      include: {
        activities: true,
        notes: true,
        checklists: true,
      }
    }) as any;

    if (!originalTrip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    const newTrip = await prisma.trip.create({
      data: {
        name: `${originalTrip.name} (Copy)`,
        description: originalTrip.description,
        startDate: originalTrip.startDate,
        endDate: originalTrip.endDate,
        coverImage: originalTrip.coverImage,
        userId: request.user!.id,
        activities: {
          create: originalTrip.activities.map((a: any) => ({
            title: a.title,
            description: a.description,
            location: a.location,
            date: a.date,
            startTime: a.startTime,
            duration: a.duration,
            cost: a.cost,
            category: a.category,
          }))
        },
        notes: {
          create: originalTrip.notes.map((n: any) => ({
            content: n.content,
            date: n.date,
          }))
        },
        checklists: {
          create: originalTrip.checklists.map((c: any) => ({
            item: c.item,
            category: c.category,
            isPacked: false,
          }))
        }
      }
    });

    res.status(201).json({ success: true, data: newTrip });
  } catch (error) {
    console.error('Duplicate trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
