import express from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getPublicTrip,
  duplicateTrip,
} from '../controllers/tripController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public route
router.get('/public/:shareToken', getPublicTrip);

// Protected routes
router.use(protect);

router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/duplicate', duplicateTrip);

export default router;
