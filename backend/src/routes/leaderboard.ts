import { Router } from 'express';
import { getLeaderboards, getAchievements } from '../controllers/leaderboardController';

const router = Router();

router.get('/', getLeaderboards);
router.get('/achievements-list', getAchievements);

export default router;
