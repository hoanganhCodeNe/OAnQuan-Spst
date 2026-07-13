import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getUserMatches = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa xác thực.' });
  }

  try {
    const userId = req.user.id;
    const matchesResult = await query(
      `SELECT id, player1_id as "player1Id", player2_id as "player2Id", 
              player1_name as "player1Name", player2_name as "player2Name",
              winner_id as "winnerId", winner_name as "winnerName", 
              mode, p1_score as "p1Score", p2_score as "p2Score", created_at as "createdAt"
       FROM matches
       WHERE player1_id = $1 OR player2_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json(matchesResult.rows);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra khi tải lịch sử đấu.' });
  }
};

// Helper function to save match results and award achievements
export const saveMatchResult = async (matchData: {
  player1Id: string;
  player2Id: string | null;
  player1Name: string;
  player2Name: string;
  winnerId: string | null;
  winnerName: string | null;
  mode: string;
  p1Score: number;
  p2Score: number;
}) => {
  const { player1Id, player2Id, player1Name, player2Name, winnerId, winnerName, mode, p1Score, p2Score } = matchData;

  try {
    // 1. Insert Match into DB
    await query(
      `INSERT INTO matches (player1_id, player2_id, player1_name, player2_name, winner_id, winner_name, mode, p1_score, p2_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [player1Id, player2Id, player1Name, player2Name, winnerId, winnerName, mode, p1Score, p2Score]
    );

    // 2. Update user(s) total score
    // Player 1
    await query(
      'UPDATE users SET total_score = total_score + $1 WHERE id = $2',
      [p1Score, player1Id]
    );
    await checkAndAwardAchievements(player1Id, mode, winnerId === player1Id);

    // Player 2 (if real player)
    if (player2Id && player2Id !== '00000000-0000-0000-0000-000000000000') {
      await query(
        'UPDATE users SET total_score = total_score + $1 WHERE id = $2',
        [p2Score, player2Id]
      );
      await checkAndAwardAchievements(player2Id, mode, winnerId === player2Id);
    }
  } catch (err) {
    console.error('Error saving match result:', err);
  }
};

// Check and award achievements to a user
const checkAndAwardAchievements = async (userId: string, mode: string, isWinner: boolean) => {
  try {
    const achievementsToAward: number[] = [];

    // Get current achievements for user
    const currentUA = await query('SELECT achievement_id FROM user_achievements WHERE user_id = $1', [userId]);
    const ownedIds = currentUA.rows.map((row) => row.achievement_id);

    // 1. Tân Binh Lịch Sử (achievement_id = 1)
    if (!ownedIds.includes(1)) {
      achievementsToAward.push(1);
    }

    // Get updated user score and win count
    const userResult = await query('SELECT total_score FROM users WHERE id = $1', [userId]);
    const totalScore = userResult.rows[0]?.total_score || 0;

    const winsResult = await query('SELECT COUNT(*) FROM matches WHERE winner_id = $1', [userId]);
    const totalWins = parseInt(winsResult.rows[0].count, 10);

    // 2. Nhà Cách Mạng (achievement_id = 2) - score >= 100
    if (totalScore >= 100 && !ownedIds.includes(2)) {
      achievementsToAward.push(2);
    }

    // 3. Anh Hùng Dân Tộc (achievement_id = 3) - wins >= 10
    if (totalWins >= 10 && !ownedIds.includes(3)) {
      achievementsToAward.push(3);
    }

    // 4. Huyền Thoại Lịch Sử (achievement_id = 4) - beat Hard AI
    if (mode === 'ai_hard' && isWinner && !ownedIds.includes(4)) {
      achievementsToAward.push(4);
    }

    // Insert newly unlocked achievements
    for (const achId of achievementsToAward) {
      await query(
        'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, achId]
      );
    }
  } catch (err) {
    console.error('Error in checkAndAwardAchievements:', err);
  }
};
