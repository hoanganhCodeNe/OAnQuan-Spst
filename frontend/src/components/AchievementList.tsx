import React from 'react';
import { Shield, Award, Flag, Crown, Lock, CheckCircle2 } from 'lucide-react';

interface Achievement {
  id: number;
  title: string;
  description: string;
  badgeIcon: string;
}

interface UserUnlockedAchievement {
  id: number;
  unlockedAt: string;
}

interface AchievementListProps {
  allAchievements: Achievement[];
  unlockedAchievements: UserUnlockedAchievement[];
}

export const AchievementList: React.FC<AchievementListProps> = ({
  allAchievements,
  unlockedAchievements,
}) => {
  const getIcon = (badgeIcon: string, isUnlocked: boolean) => {
    const sizeClass = "h-7 w-7";
    const colorClass = isUnlocked ? "text-history-gold-bright" : "text-gray-600";
    
    switch (badgeIcon) {
      case 'shield':
        return <Shield className={`${sizeClass} ${colorClass}`} />;
      case 'award':
        return <Award className={`${sizeClass} ${colorClass}`} />;
      case 'flag':
        return <Flag className={`${sizeClass} ${colorClass}`} />;
      case 'crown':
        return <Crown className={`${sizeClass} ${colorClass}`} />;
      default:
        return <Award className={`${sizeClass} ${colorClass}`} />;
    }
  };

  const isUnlocked = (achId: number) => {
    return unlockedAchievements.some((ua) => ua.id === achId);
  };

  const getUnlockDate = (achId: number) => {
    const ua = unlockedAchievements.find((u) => u.id === achId);
    if (!ua) return '';
    try {
      const d = new Date(ua.unlockedAt);
      return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-5 border-b border-history-gold/10 pb-3">
        <Award className="text-history-gold h-5 w-5" />
        <h3 className="text-base sm:text-lg font-cinzel font-bold text-history-gold-bright uppercase tracking-wide">
          Bảng Vàng Danh Hiệu
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {allAchievements.map((ach) => {
          const unlocked = isUnlocked(ach.id);
          const unlockDate = getUnlockDate(ach.id);

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-lg border transition-all duration-300 flex items-start gap-4 ${
                unlocked
                  ? 'bg-history-gold/5 border-history-gold/45 shadow-[0_0_10px_rgba(212,175,55,0.1)]'
                  : 'bg-black/35 border-history-gold/5 grayscale'
              }`}
            >
              {/* Badge Icon Container */}
              <div className={`p-3 rounded-lg border shrink-0 flex items-center justify-center relative ${
                unlocked 
                  ? 'bg-history-gold/10 border-history-gold/30' 
                  : 'bg-black/40 border-history-charcoal-light'
              }`}>
                {getIcon(ach.badgeIcon, unlocked)}
                {!unlocked && (
                  <div className="absolute -bottom-1.5 -right-1.5 p-0.5 bg-history-charcoal-dark rounded-full border border-gray-600">
                    <Lock className="h-3 w-3 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Text info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className={`text-sm sm:text-base font-bold font-cinzel ${
                    unlocked ? 'text-history-gold-bright' : 'text-gray-500'
                  }`}>
                    {ach.title}
                  </h4>
                  {unlocked && (
                    <span className="text-[10px] text-green-400 font-bold flex items-center gap-1 shrink-0 font-montserrat">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      ĐÃ ĐẠT
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 leading-normal line-clamp-2">
                  {ach.description}
                </p>
                {unlocked && unlockDate && (
                  <span className="text-[10px] text-history-gold-light/60 font-mono mt-1.5 block">
                    Đạt được ngày: {unlockDate}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
