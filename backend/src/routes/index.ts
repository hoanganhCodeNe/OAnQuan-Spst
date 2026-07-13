import { Router } from 'express';
import authRouter from './auth';
import leaderboardRouter from './leaderboard';
import matchRouter from './match';
import materialsRouter from './materials';

const router = Router();

router.use('/auth', authRouter);
router.use('/leaderboard', leaderboardRouter);
router.use('/matches', matchRouter);
router.use('/materials', materialsRouter);

export default router;
