import { Router } from 'express';
import { getUserMatches } from '../controllers/matchController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/history', authenticateToken, getUserMatches);

export default router;
