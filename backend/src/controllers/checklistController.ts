import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { RequestWithUser } from '../middleware/auth';

const verifyTripOwnership = async (tripId: string, userId: string) => {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  return !!trip;
};

export const getChecklist = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const tripId = String(request.params.tripId);
    if (!(await verifyTripOwnership(tripId, request.user!.id))) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const items = await prisma.checklistItem.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Get checklist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createChecklistItem = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const tripId = String(request.params.tripId);
    const { item, category } = request.body;
    if (!item) return res.status(400).json({ success: false, message: 'Item text is required' });
    if (!(await verifyTripOwnership(tripId, request.user!.id))) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const created = await prisma.checklistItem.create({
      data: { tripId, item, category: category || 'General' },
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Create checklist item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const toggleChecklistItem = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const id = String(request.params.id);
    const checklistItem = await prisma.checklistItem.findUnique({
      where: { id },
      include: { trip: true },
    }) as any;
    if (!checklistItem) return res.status(404).json({ success: false, message: 'Item not found' });
    if (checklistItem.trip.userId !== request.user!.id) return res.status(403).json({ success: false, message: 'Unauthorized' });
    const updated = await prisma.checklistItem.update({
      where: { id },
      data: { isPacked: !checklistItem.isPacked },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Toggle checklist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteChecklistItem = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const id = String(request.params.id);
    const checklistItem = await prisma.checklistItem.findUnique({
      where: { id },
      include: { trip: true },
    }) as any;
    if (!checklistItem) return res.status(404).json({ success: false, message: 'Item not found' });
    if (checklistItem.trip.userId !== request.user!.id) return res.status(403).json({ success: false, message: 'Unauthorized' });
    await prisma.checklistItem.delete({ where: { id } });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Delete checklist item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
