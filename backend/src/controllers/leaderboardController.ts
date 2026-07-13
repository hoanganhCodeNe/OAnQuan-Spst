import { Request, Response } from 'express';
import { query } from '../config/db';

export const getLeaderboards = async (req: Request, res: Response) => {
  try {
    // 1. High Score Leaderboard
    const scoreResult = await query(
      `SELECT id, name, total_score as "totalScore", avatar, created_at as "createdAt"
       FROM users 
       ORDER BY total_score DESC, name ASC 
       LIMIT 10`
    );

    // 2. Wins Leaderboard
    const winsResult = await query(
      `SELECT u.id, u.name, u.avatar, COUNT(m.id) as "wins"
       FROM users u
       JOIN matches m ON u.id = m.winner_id
       GROUP BY u.id, u.name, u.avatar
       ORDER BY COUNT(m.id) DESC, u.name ASC
       LIMIT 10`
    );

    // 3. Achievements Leaderboard
    const achievementsResult = await query(
      `SELECT u.id, u.name, u.avatar, COUNT(ua.achievement_id) as "achievementsCount"
       FROM users u
       LEFT JOIN user_achievements ua ON u.id = ua.user_id
       GROUP BY u.id, u.name, u.avatar
       ORDER BY COUNT(ua.achievement_id) DESC, u.name ASC
       LIMIT 10`
    );

    res.status(200).json({
      scoreLeaderboard: scoreResult.rows,
      winsLeaderboard: winsResult.rows.map(row => ({
        ...row,
        wins: parseInt(row.wins, 10)
      })),
      achievementsLeaderboard: achievementsResult.rows.map(row => ({
        ...row,
        achievementsCount: parseInt(row.achievementsCount, 10)
      }))
    });
  } catch (err) {
    console.error('Error fetching leaderboards:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy bảng xếp hạng.' });
  }
};

export const getAchievements = async (req: Request, res: Response) => {
  try {
    const allAchievements = await query('SELECT id, title, description, badge_icon as "badgeIcon" FROM achievements ORDER BY id ASC');
    res.status(200).json(allAchievements.rows);
  } catch (err) {
    console.error('Error fetching achievements:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách thành tích.' });
  }
};
