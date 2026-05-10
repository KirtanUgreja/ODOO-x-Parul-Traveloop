import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { RequestWithUser } from '../middleware/auth';

const verifyTripOwnership = async (tripId: string, userId: string) => {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  return !!trip;
};

export const getNotes = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const tripId = String(request.params.tripId);
    if (!(await verifyTripOwnership(tripId, request.user!.id))) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const notes = await prisma.note.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const tripId = String(request.params.tripId);
    const { content, date } = request.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });
    if (!(await verifyTripOwnership(tripId, request.user!.id))) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const note = await prisma.note.create({
      data: { tripId, content, date: date ? new Date(date) : null },
    });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const id = String(request.params.id);
    const { content } = request.body;
    const note = await prisma.note.findUnique({ where: { id }, include: { trip: true } }) as any;
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.trip.userId !== request.user!.id) return res.status(403).json({ success: false, message: 'Unauthorized' });
    const updated = await prisma.note.update({ where: { id }, data: { content } });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  const request = req as RequestWithUser;
  try {
    const id = String(request.params.id);
    const note = await prisma.note.findUnique({ where: { id }, include: { trip: true } }) as any;
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.trip.userId !== request.user!.id) return res.status(403).json({ success: false, message: 'Unauthorized' });
    await prisma.note.delete({ where: { id } });
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
