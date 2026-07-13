import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LeaderboardTable } from '../components/LeaderboardTable';

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  totalScore?: number;
  wins?: number;
  achievementsCount?: number;
}

export const Leaderboards: React.FC = () => {
  const { user, apiUrl } = useAuth();

  const [scoreLeaderboard, setScoreLeaderboard] = useState<LeaderboardUser[]>([]);
  const [winsLeaderboard, setWinsLeaderboard] = useState<LeaderboardUser[]>([]);
  const [achievementsLeaderboard, setAchievementsLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/leaderboard`);
        const data = await res.json();
        
        if (res.ok) {
          setScoreLeaderboard(data.scoreLeaderboard);
          setWinsLeaderboard(data.winsLeaderboard);
          setAchievementsLeaderboard(data.achievementsLeaderboard);
        } else {
          setError('Không thể tải dữ liệu xếp hạng.');
        }
      } catch (err) {
        console.error(err);
        setError('Có lỗi xảy ra khi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [apiUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="max-w-4xl mx-auto px-4 py-8 relative z-10 font-montserrat"
    >
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-history-gold hover:text-history-gold-bright mb-6 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại Sảnh chờ
      </Link>

      {/* Page Title */}
      <div className="text-center mb-8">
        <Trophy className="h-12 w-12 text-history-gold-bright mx-auto mb-3 drop-shadow-[0_0_10px_#FFD700]" />
        <h1 className="text-2xl sm:text-4xl font-cinzel font-black gold-gradient-text uppercase tracking-wider mb-2">
          Bảng Xếp Hạng Anh Hùng
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-montserrat max-w-md mx-auto leading-relaxed">
          Tôn vinh những kỳ thủ có thành tích học tập xuất sắc và kỹ năng gieo sỏi thượng thừa trong học viện Lịch sử Đảng.
        </p>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <Loader className="h-8 w-8 text-history-gold animate-spin" />
          <span>Đang tải bảng xếp hạng...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-history-red-deep/40 border border-history-red text-red-300 rounded text-center mb-6">
          {error}
        </div>
      ) : (
        /* Rankings Table */
        <LeaderboardTable
          scoreLeaderboard={scoreLeaderboard}
          winsLeaderboard={winsLeaderboard}
          achievementsLeaderboard={achievementsLeaderboard}
          currentUserId={user?.id}
        />
      )}
    </motion.div>
  );
};
