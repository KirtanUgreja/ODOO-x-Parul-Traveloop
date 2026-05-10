import express from 'express';
import { getStats, getUsers, getAllTrips } from '../controllers/adminController';
import { protect } from '../middleware/auth';
import { adminProtect } from '../middleware/adminAuth';

const router = express.Router();

router.use(protect);
router.use(adminProtect);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/trips', getAllTrips);

export default router;
