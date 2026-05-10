import express from 'express';
import { generateItinerary } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/generate-itinerary', generateItinerary);

export default router;
