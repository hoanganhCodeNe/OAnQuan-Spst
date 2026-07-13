import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Award, Shield, Trophy, ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MatchHistoryTable } from '../components/MatchHistoryTable';
import { AchievementList } from '../components/AchievementList';

interface Match {
  id: string;
  player1Id: string;
  player2Id: string | null;
  player1Name: string;
  player2Name: string;
  winnerId: string | null;
  winnerName: string | null;
  mode: string;
  p1Score: number;
  p2Score: number;
  createdAt: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  badgeIcon: string;
}

export const Profile: React.FC = () => {
  const { user, token, apiUrl, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<Match[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadProfileData = async () => {
      try {
        setLoading(true);

        if (user && user.id === '11111111-1111-1111-1111-111111111111') {
          // Guest User mock profile data bypass
          setMatches([]);
          const achRes = await fetch(`${apiUrl}/api/leaderboard/achievements-list`);
          const achData = await achRes.json();
          if (achRes.ok) {
            setAllAchievements(achData);
          } else {
            setError('Không thể tải thông tin hồ sơ.');
          }
          setLoading(false);
          return;
        }

        // Refresh User profile in context to get updated score & achievements
        await refreshUser();

        // 1. Fetch Match History
        const matchesRes = await fetch(`${apiUrl}/api/matches/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const matchesData = await matchesRes.json();

        // 2. Fetch all achievements catalog
        const achRes = await fetch(`${apiUrl}/api/leaderboard/achievements-list`);
        const achData = await achRes.json();

        if (matchesRes.ok && achRes.ok) {
          setMatches(matchesData);
          setAllAchievements(achData);
        } else {
          setError('Không thể tải thông tin hồ sơ.');
        }
      } catch (err) {
        console.error(err);
        setError('Có lỗi xảy ra khi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [token, apiUrl, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400 font-montserrat gap-2 relative z-10">
        <Loader className="h-8 w-8 text-history-gold animate-spin" />
        <span>Đang tải thông tin hồ sơ học viên...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-6 bg-history-charcoal-light border border-history-gold/20 rounded-xl relative z-10">
        <p className="text-red-400 mb-4 font-bold">{error || 'Chưa xác thực người dùng.'}</p>
        <Link to="/" className="gold-btn py-2 text-xs flex items-center justify-center gap-1.5 mx-auto w-36">
          <ArrowLeft className="h-4 w-4" />
          Về Sảnh
        </Link>
      </div>
    );
  }

  const unlockedAchievementsMapped = (user.achievements || []).map((ua) => ({
    id: ua.id,
    unlockedAt: ua.unlockedAt,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="max-w-5xl mx-auto px-4 py-8 relative z-10 font-montserrat"
    >
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-history-gold hover:text-history-gold-bright mb-6 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại Sảnh chờ
      </Link>

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-xl p-6 shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="w-16 h-16 rounded-full border border-history-gold text-2xl font-black text-history-charcoal-pure bg-gradient-to-tr from-history-gold-light via-history-gold-bright to-history-gold-dark flex items-center justify-center shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-history-gold-bright uppercase tracking-wide">
              {user.name}
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-mono">ID: {user.id}</p>
            <p className="text-xs text-gray-500 mt-0.5">Thành viên từ: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        {/* Highlight Stats columns */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          {/* Total Score */}
          <div className="bg-black/35 border border-history-gold/15 p-4 rounded-lg text-center min-w-[90px] sm:min-w-[120px]">
            <Trophy className="h-5 w-5 text-history-gold-bright mx-auto mb-1" />
            <span className="text-[10px] text-gray-500 font-bold uppercase block tracking-wider mb-0.5">Tổng điểm</span>
            <span className="text-lg font-mono font-bold text-history-gold-light">{user.totalScore}đ</span>
          </div>

          {/* Wins */}
          <div className="bg-black/35 border border-history-gold/15 p-4 rounded-lg text-center min-w-[90px] sm:min-w-[120px]">
            <Shield className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <span className="text-[10px] text-gray-500 font-bold uppercase block tracking-wider mb-0.5">Trận thắng</span>
            <span className="text-lg font-mono font-bold text-green-400">{user.totalWins || 0} trận</span>
          </div>

          {/* Achievements count */}
          <div className="bg-black/35 border border-history-gold/15 p-4 rounded-lg text-center min-w-[90px] sm:min-w-[120px]">
            <Award className="h-5 w-5 text-history-gold-bright mx-auto mb-1 animate-pulse" />
            <span className="text-[10px] text-gray-500 font-bold uppercase block tracking-wider mb-0.5">Thành tích</span>
            <span className="text-lg font-mono font-bold text-history-gold">{unlockedAchievementsMapped.length} danh hiệu</span>
          </div>
        </div>
      </div>

      {/* Grid containing Achievements Catalog and Match history */}
      <div className="flex flex-col gap-8">
        
        {/* Unlocked Achievements list component */}
        <AchievementList
          allAchievements={allAchievements}
          unlockedAchievements={unlockedAchievementsMapped}
        />

        {/* Match History logs table */}
        <MatchHistoryTable
          matches={matches}
          currentUserId={user.id}
        />
        
      </div>
    </motion.div>
  );
};
