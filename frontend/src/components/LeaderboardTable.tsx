import React, { useState } from 'react';
import { Award, Trophy, Star, Crown } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  totalScore?: number;
  wins?: number;
  achievementsCount?: number;
}

interface LeaderboardTableProps {
  scoreLeaderboard: LeaderboardUser[];
  winsLeaderboard: LeaderboardUser[];
  achievementsLeaderboard: LeaderboardUser[];
  currentUserId?: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  scoreLeaderboard,
  winsLeaderboard,
  achievementsLeaderboard,
  currentUserId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'score' | 'wins' | 'achievements'>('score');

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-history-gold-bright drop-shadow-[0_0_6px_#FFD700]" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-semibold text-gray-500 w-5 text-center">{rank}</span>;
  };

  const getActiveList = () => {
    if (activeSubTab === 'wins') return winsLeaderboard;
    if (activeSubTab === 'achievements') return achievementsLeaderboard;
    return scoreLeaderboard;
  };

  const activeList = getActiveList();

  return (
    <div className="w-full bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-xl overflow-hidden shadow-xl">
      {/* Sub Tabs */}
      <div className="flex border-b border-history-gold/15 bg-black/35">
        <button
          onClick={() => setActiveSubTab('score')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 font-montserrat uppercase transition-all duration-300 ${
            activeSubTab === 'score'
              ? 'border-history-gold text-history-gold-bright bg-history-gold/5'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Star className="h-4 w-4" />
          Điểm Tích Lũy
        </button>
        <button
          onClick={() => setActiveSubTab('wins')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 font-montserrat uppercase transition-all duration-300 ${
            activeSubTab === 'wins'
              ? 'border-history-gold text-history-gold-bright bg-history-gold/5'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Trophy className="h-4 w-4" />
          Số Trận Thắng
        </button>
        <button
          onClick={() => setActiveSubTab('achievements')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 font-montserrat uppercase transition-all duration-300 ${
            activeSubTab === 'achievements'
              ? 'border-history-gold text-history-gold-bright bg-history-gold/5'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Award className="h-4 w-4" />
          Thành Tích
        </button>
      </div>

      {/* Rankings List */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-history-gold/10 text-xs sm:text-sm text-history-gold-light font-bold font-montserrat uppercase tracking-wider">
              <th className="pb-3 pl-3 w-16">Hạng</th>
              <th className="pb-3">Kỳ Thủ</th>
              <th className="pb-3 text-right pr-3">
                {activeSubTab === 'score' && 'Tổng Điểm'}
                {activeSubTab === 'wins' && 'Số Trận Thắng'}
                {activeSubTab === 'achievements' && 'Thành Tích Đạt'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-history-gold/5 text-sm sm:text-base">
            {activeList.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500 italic">
                  Chưa có kỳ thủ nào ghi danh trên bảng xếp hạng này.
                </td>
              </tr>
            ) : (
              activeList.map((item, index) => {
                const rank = index + 1;
                const isMe = item.id === currentUserId;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-history-gold/5 ${
                      isMe ? 'bg-history-red/10 border-y border-history-gold/30' : ''
                    }`}
                  >
                    <td className="py-3.5 pl-3 flex items-center h-full">
                      {getRankBadge(rank)}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-history-gold/30 bg-black/40 flex items-center justify-center text-sm font-bold text-history-gold uppercase">
                          {item.name.charAt(0)}
                        </div>
                        <span className={`font-semibold ${isMe ? 'text-history-gold-bright font-bold' : 'text-gray-200'}`}>
                          {item.name} {isMe && '(Bạn)'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right pr-3 font-mono font-bold text-history-gold-light">
                      {activeSubTab === 'score' && `${item.totalScore} đ`}
                      {activeSubTab === 'wins' && `${item.wins} trận`}
                      {activeSubTab === 'achievements' && `${item.achievementsCount} huy hiệu`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
