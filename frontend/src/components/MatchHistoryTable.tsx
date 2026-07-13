import React from 'react';
import { Calendar, User, UserCheck, Shield } from 'lucide-react';

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

interface MatchHistoryTableProps {
  matches: Match[];
  currentUserId: string;
}

export const MatchHistoryTable: React.FC<MatchHistoryTableProps> = ({ matches, currentUserId }) => {
  
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'ai_easy':
        return <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold border border-green-600/30 bg-green-950/15 text-green-400 rounded">AI Dễ</span>;
      case 'ai_medium':
        return <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold border border-yellow-600/30 bg-yellow-950/15 text-yellow-400 rounded">AI Vừa</span>;
      case 'ai_hard':
        return <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold border border-red-600/30 bg-red-950/15 text-red-400 rounded">AI Khó</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold border border-blue-600/30 bg-blue-950/15 text-blue-400 rounded">Đối kháng</span>;
    }
  };

  const getMatchOutcome = (match: Match) => {
    if (!match.winnerId) {
      return <span className="text-gray-400 font-bold uppercase text-xs sm:text-sm">Hòa</span>;
    }
    const isWinner = match.winnerId === currentUserId;
    if (isWinner) {
      return <span className="text-green-400 font-bold uppercase text-xs sm:text-sm shadow-green-400/10">Thắng</span>;
    }
    return <span className="text-red-400 font-bold uppercase text-xs sm:text-sm">Thua</span>;
  };

  return (
    <div className="w-full bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-xl overflow-hidden shadow-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 border-b border-history-gold/10 pb-3">
        <Shield className="text-history-gold h-5 w-5" />
        <h3 className="text-base sm:text-lg font-cinzel font-bold text-history-gold-bright uppercase tracking-wide">
          Lịch sử chiến trường
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-history-gold/10 text-xs sm:text-sm text-history-gold-light font-bold font-montserrat uppercase tracking-wider">
              <th className="pb-3 pl-3">Thời Gian</th>
              <th className="pb-3">Chế Độ</th>
              <th className="pb-3">Kỳ Thủ</th>
              <th className="pb-3 text-center">Tỉ Số</th>
              <th className="pb-3 text-right pr-3">Kết Quả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-history-gold/5 text-xs sm:text-sm">
            {matches.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 italic">
                  Bạn chưa tham gia trận đấu nào. Vào sảnh tạo phòng để chơi ngay!
                </td>
              </tr>
            ) : (
              matches.map((match) => {
                const isP1 = match.player1Id === currentUserId;
                const myScore = isP1 ? match.p1Score : match.p2Score;
                const oppScore = isP1 ? match.p2Score : match.p1Score;
                const opponentName = isP1 ? match.player2Name : match.player1Name;

                return (
                  <tr key={match.id} className="transition-colors hover:bg-history-gold/5">
                    <td className="py-3.5 pl-3 text-gray-400">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {formatDate(match.createdAt)}
                      </div>
                    </td>
                    <td className="py-3.5">
                      {getModeLabel(match.mode)}
                    </td>
                    <td className="py-3.5 text-gray-200">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-history-gold-light shrink-0" />
                        <span className="font-semibold">{opponentName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold text-gray-200">
                      <span className="text-history-gold">{myScore}</span>
                      <span className="mx-1 text-gray-600">-</span>
                      <span>{oppScore}</span>
                    </td>
                    <td className="py-3.5 text-right pr-3 font-semibold">
                      <div className="flex items-center justify-end gap-1.5">
                        {match.winnerId === currentUserId && <UserCheck className="h-4.5 w-4.5 text-green-400 shrink-0" />}
                        {getMatchOutcome(match)}
                      </div>
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
