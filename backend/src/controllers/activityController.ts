import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { RequestWithUser } from '../middleware/auth';

/**
 * Reusable helper to recalculate and update trip totalBudget
 */
const recalculateTripBudget = async (tripId: string) => {
  const aggregate = await prisma.activity.aggregate({
    where: { tripId },
    _sum: {
      cost: true,
    },
  });

  const totalBudget = aggregate._sum.cost || 0;

  await prisma.trip.update({
    where: { id: tripId },
    data: { totalBudget },
  });

  return totalBudget;
};

// @desc    Get all activities for a trip
// @route   GET /api/trips/:tripId/activities
// @access  Private
export const getActivities = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const tripId = String(request.params.tripId);

    // Verify trip ownership
    const trip = await prisma.trip.findFirst({
      where: { id: String(tripId), userId: request.user?.id },
    });

    if (!trip) {
      return res.status(403).json({ success: false, message: 'Unauthorized or trip not found' });
    }

    const activities = await prisma.activity.findMany({
      where: { tripId: String(tripId) },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new activity
// @route   POST /api/trips/:tripId/activities
// @access  Private
export const createActivity = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const tripId = String(request.params.tripId);
    const { title, description, location, date, startTime, duration, cost, category } = request.body;

    if (!title || !date || !location || !category) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    // Verify trip ownership
    const trip = await prisma.trip.findFirst({
      where: { id: String(tripId), userId: request.user?.id },
    });

    if (!trip) {
      return res.status(403).json({ success: false, message: 'Unauthorized or trip not found' });
    }

    const activity = await prisma.activity.create({
      data: {
        tripId: String(tripId),
        title,
        description,
        location,
        date: new Date(date),
        startTime,
        duration,
        cost: cost || 0,
        category,
      },
    });

    // Recalculate budget
    await recalculateTripBudget(String(tripId));

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update an activity
// @route   PUT /api/activities/:id
// @access  Private
export const updateActivity = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const id = String(request.params.id);
    const { title, description, location, date, startTime, duration, cost, category, isCompleted } = request.body;

    // Verify activity existence and ownership through trip
    const activity = await prisma.activity.findUnique({
      where: { id: String(id) },
      include: { trip: true },
    }) as any;

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    if (activity.trip.userId !== request.user?.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this trip' });
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: String(id) },
      data: {
        title,
        description,
        location,
        date: date ? new Date(date) : undefined,
        startTime,
        duration,
        cost,
        category,
        isCompleted,
      },
    });

    // Recalculate budget if cost changed
    if (cost !== undefined && cost !== activity.cost) {
      await recalculateTripBudget(String(activity.tripId));
    }

    res.json({ success: true, data: updatedActivity });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
export const deleteActivity = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const id = String(request.params.id);

    const activity = await prisma.activity.findUnique({
      where: { id: String(id) },
      include: { trip: true },
    }) as any;

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    if (activity.trip.userId !== request.user?.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.activity.delete({ where: { id: String(id) } });
    await recalculateTripBudget(String(activity.tripId));

    res.json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle activity completion
// @route   PATCH /api/activities/:id/complete
// @access  Private
export const toggleComplete = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const id = String(request.params.id);

    const activity = await prisma.activity.findUnique({
      where: { id: String(id) },
      include: { trip: true },
    }) as any;

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    if (activity.trip.userId !== request.user?.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: String(id) },
      data: { isCompleted: !activity.isCompleted },
    });

    res.json({ success: true, data: updatedActivity });
  } catch (error) {
    console.error('Toggle complete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
