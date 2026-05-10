import express from 'express';
import { getChecklist, createChecklistItem, toggleChecklistItem, deleteChecklistItem } from '../controllers/checklistController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.get('/trips/:tripId/checklist', getChecklist);
router.post('/trips/:tripId/checklist', createChecklistItem);
router.patch('/checklist/:id/toggle', toggleChecklistItem);
router.delete('/checklist/:id', deleteChecklistItem);

export default router;
