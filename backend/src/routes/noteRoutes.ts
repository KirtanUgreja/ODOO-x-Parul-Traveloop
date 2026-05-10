import express from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/noteController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.get('/trips/:tripId/notes', getNotes);
router.post('/trips/:tripId/notes', createNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

export default router;
