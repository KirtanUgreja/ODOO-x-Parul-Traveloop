import express from 'express';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleComplete,
} from '../controllers/activityController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Routes for activities within a trip
router.get('/trips/:tripId/activities', getActivities);
router.post('/trips/:tripId/activities', createActivity);

// Routes for specific activity management
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);
router.patch('/activities/:id/complete', toggleComplete);

export default router;
