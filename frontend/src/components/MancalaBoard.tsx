import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { Hole } from '../types/game';

interface MancalaBoardProps {
  board: Hole[];
  currentTurn: 'player1' | 'player2';
  player1Name: string;
  player2Name: string;
  isMyTurn: boolean;
  myPlayerKey: 'player1' | 'player2';
  onMove: (holeIndex: number, direction: 'cw' | 'ccw') => void;
  gameLog: string[];
}

export const MancalaBoard: React.FC<MancalaBoardProps> = ({
  board,
  currentTurn,
  player1Name,
  player2Name,
  isMyTurn,
  myPlayerKey,
  onMove,
  gameLog,
}) => {
  const [selectedHole, setSelectedHole] = useState<number | null>(null);

  // Chapters list for reference
  const chapterTitles: Record<number, string> = {
    0: 'Bối cảnh VN trước 1930',
    1: 'Nguyễn Ái Quốc tìm đường',
    2: 'Thành lập Đảng',
    3: 'Xô Viết Nghệ Tĩnh',
    4: 'Mặt trận Việt Minh',
    5: 'Cách mạng tháng Tám',
    6: 'Kháng chiến chống Pháp',
    7: 'Kháng chiến chống Mỹ',
    8: 'Đại thắng Xuân 1975',
    9: 'Công cuộc Đổi mới',
    10: 'Hội nhập & Phát triển',
    11: 'Hội nhập & Phát triển',
  };

  const handleHoleClick = (index: number) => {
    if (!isMyTurn) return;

    // Check ownership of citizen hole
    const isP1 = myPlayerKey === 'player1';
    if (isP1 && (index < 0 || index > 4)) return;
    if (!isP1 && (index < 5 || index > 9)) return;

    // Must have stones
    if (board[index].stones === 0) return;

    // Toggle direction selector
    setSelectedHole(selectedHole === index ? null : index);
  };

  const handleDirectionSelect = (direction: 'cw' | 'ccw') => {
    if (selectedHole !== null) {
      onMove(selectedHole, direction);
      setSelectedHole(null);
    }
  };

  // Render 3D pebbles inside a hole
  const renderPebbles = (count: number, isMandarin: boolean, holeIndex: number) => {
    if (count === 0) return null;

    // For Mandarin, render a larger gold coin/badge if it has the mandarin stone, plus normal stones
    const pebblesList = [];
    const maxRender = Math.min(count, 8); // limit rendering to prevent clutter

    // Generate stable random offsets based on holeIndex
    const getOffset = (seed: number) => {
      const x = Math.sin(seed + holeIndex) * 16;
      const y = Math.cos(seed * 1.5 + holeIndex) * 12;
      return { x, y };
    };

    if (isMandarin && board[holeIndex].isMandarin) {
      // Big mandarin stone
      pebblesList.push(
        <motion.div
          key={`mandarin-${holeIndex}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute w-7 h-7 bg-gradient-to-r from-history-gold-bright via-history-gold-light to-history-gold-dark rounded-full border border-yellow-200 shadow-md flex items-center justify-center z-10"
          style={{
            top: '40%',
            left: '40%',
          }}
        >
          <span className="text-[10px] text-history-charcoal-pure font-black">★</span>
        </motion.div>
      );
    }

    // Normal pebbles
    const pebbleColors = [
      'bg-gradient-to-br from-gray-300 to-gray-500 border-gray-200',
      'bg-gradient-to-br from-history-gold-light to-history-gold-dark border-yellow-600',
      'bg-gradient-to-br from-history-bronze-light to-history-bronze-dark border-history-bronze-dark',
    ];

    const countToRender = isMandarin && board[holeIndex].isMandarin ? count - 1 : count;

    for (let i = 0; i < Math.min(countToRender, maxRender); i++) {
      const offset = getOffset(i);
      const colorClass = pebbleColors[i % pebbleColors.length];
      pebblesList.push(
        <motion.div
          key={`pebble-${holeIndex}-${i}`}
          layoutId={`pebble-${holeIndex}-${i}`}
          className={`absolute w-3.5 h-3.5 rounded-full border shadow-sm ${colorClass}`}
          style={{
            top: `calc(48% + ${offset.y}px)`,
            left: `calc(48% + ${offset.x}px)`,
          }}
        />
      );
    }

    return <div className="absolute inset-0 pointer-events-none">{pebblesList}</div>;
  };

  // Helper to determine active state of citizen holes
  const isHoleInteractable = (index: number) => {
    if (!isMyTurn) return false;
    const isP1 = myPlayerKey === 'player1';
    if (isP1 && index >= 0 && index <= 4 && board[index].stones > 0) return true;
    if (!isP1 && index >= 5 && index <= 9 && board[index].stones > 0) return true;
    return false;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto my-6 px-2 select-none">
      {/* Board Headers */}
      <div className="flex justify-between w-full mb-5 font-cinzel">
        {/* Player 2 Header (Top Side) */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded border transition-all duration-300 ${
          currentTurn === 'player2' 
            ? 'bg-history-red border-history-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]' 
            : 'bg-black/35 border-transparent text-gray-400'
        }`}>
          <User className="h-4.5 w-4.5 text-history-gold-bright" />
          <span className="text-sm font-bold tracking-wide">
            {player2Name} {myPlayerKey === 'player2' && '(Bạn)'}
          </span>
          {currentTurn === 'player2' && <span className="ml-1 text-[10px] text-history-gold-bright uppercase animate-pulse">Lượt đi</span>}
        </div>

        {/* Player 1 Header (Bottom Side) */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded border transition-all duration-300 ${
          currentTurn === 'player1' 
            ? 'bg-history-red border-history-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]' 
            : 'bg-black/35 border-transparent text-gray-400'
        }`}>
          <User className="h-4.5 w-4.5 text-history-gold-bright" />
          <span className="text-sm font-bold tracking-wide">
            {player1Name} {myPlayerKey === 'player1' && '(Bạn)'}
          </span>
          {currentTurn === 'player1' && <span className="ml-1 text-[10px] text-history-gold-bright uppercase animate-pulse">Lượt đi</span>}
        </div>
      </div>

      {/* Main Mancala Board Wrapper */}
      <div className="relative w-full bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/30 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
        
        {/* Glowing radial backdrop inside board */}
        <div className="absolute inset-0 bg-radial-gradient from-history-gold/5 via-transparent to-transparent pointer-events-none rounded-2xl" />

        {/* Mancala Grid */}
        <div className="grid grid-cols-7 gap-2.5 sm:gap-4 w-full h-[180px] sm:h-[240px] relative z-10">
          
          {/* LEFT MANDARIN (Hole 11) */}
          <div className="col-span-1 row-span-2 bg-gradient-to-br from-black/55 to-black/25 rounded-l-full border border-history-gold/30 flex flex-col justify-between items-center py-4 relative shadow-inner overflow-hidden">
            <span className="text-[10px] sm:text-xs text-history-gold-light uppercase font-bold tracking-wide font-cinzel text-center px-1 mt-2 sm:mt-3">
              Quan Trái
            </span>
            {renderPebbles(board[11].stones, true, 11)}
            <div className="bg-history-gold-dark/20 border border-history-gold-light/30 px-2 py-0.5 rounded text-xs font-bold text-history-gold-bright relative z-20">
              {board[11].stones}
            </div>
            <div className="absolute top-1/2 left-2 text-[9px] text-gray-500 pointer-events-none uppercase tracking-wider origin-center -rotate-90 translate-y-[-50%] line-clamp-1 max-w-[140px]">
              {chapterTitles[11]}
            </div>
          </div>

          {/* CITIZEN HOLES */}
          <div className="col-span-5 grid grid-rows-2 gap-2 sm:gap-3.5 h-full">
            
            {/* ROW 1: Player 2 (Top side, indices 9, 8, 7, 6, 5 from left to right) */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3.5 h-full">
              {[9, 8, 7, 6, 5].map((index) => {
                const isInteractable = isHoleInteractable(index);
                const isSelected = selectedHole === index;

                return (
                  <div
                    key={index}
                    onClick={() => handleHoleClick(index)}
                    className={`relative bg-black/45 rounded-xl border flex flex-col justify-between items-center py-2 shadow-inner transition-all duration-300 overflow-hidden h-full ${
                      isInteractable 
                        ? 'border-history-gold/60 cursor-pointer hover:bg-history-gold/20 hover:shadow-gold-glow hover:scale-105 shadow-md shadow-history-gold/10' 
                        : 'border-history-gold/15'
                    } ${isSelected ? 'border-history-gold shadow-gold-glow bg-history-gold/15' : ''}`}
                  >
                    {/* Chapter indicator hover label */}
                    <span className="text-[8px] sm:text-[10px] text-gray-400 font-medium tracking-tight px-1 text-center font-montserrat truncate w-full">
                      Ô {index + 1}
                    </span>

                    {/* Pebbles */}
                    {renderPebbles(board[index].stones, false, index)}

                    {/* Stones Count */}
                    <div className="bg-black/50 border border-history-gold/20 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-history-gold relative z-20">
                      {board[index].stones}
                    </div>

                    {/* Direction controller popup */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute inset-0 z-30 bg-history-charcoal-dark/95 border border-history-gold flex items-center justify-around rounded-xl"
                          onClick={(e) => e.stopPropagation()} // prevent dismiss clicks
                        >
                          {/* Top Row direction triggers: CCW is Left (←), CW is Right (→) */}
                          <button
                            onClick={() => handleDirectionSelect('ccw')}
                            className="p-1.5 rounded bg-history-red text-white border border-history-gold/30 hover:bg-history-red-light transition-all"
                            title="Ngược chiều kim đồng hồ (Trái)"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDirectionSelect('cw')}
                            className="p-1.5 rounded bg-history-red text-white border border-history-gold/30 hover:bg-history-red-light transition-all"
                            title="Xuôi chiều kim đồng hồ (Phải)"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* ROW 2: Player 1 (Bottom side, indices 0, 1, 2, 3, 4 from left to right) */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3.5 h-full">
              {[0, 1, 2, 3, 4].map((index) => {
                const isInteractable = isHoleInteractable(index);
                const isSelected = selectedHole === index;

                return (
                  <div
                    key={index}
                    onClick={() => handleHoleClick(index)}
                    className={`relative bg-black/45 rounded-xl border flex flex-col justify-between items-center py-2 shadow-inner transition-all duration-300 overflow-hidden h-full ${
                      isInteractable 
                        ? 'border-history-gold/60 cursor-pointer hover:bg-history-gold/20 hover:shadow-gold-glow hover:scale-105 shadow-md shadow-history-gold/10' 
                        : 'border-history-gold/15'
                    } ${isSelected ? 'border-history-gold shadow-gold-glow bg-history-gold/15' : ''}`}
                  >
                    {/* Chapter indicator hover label */}
                    <span className="text-[8px] sm:text-[10px] text-gray-400 font-medium tracking-tight px-1 text-center font-montserrat truncate w-full">
                      Ô {index + 1}
                    </span>

                    {/* Pebbles */}
                    {renderPebbles(board[index].stones, false, index)}

                    {/* Stones Count */}
                    <div className="bg-black/50 border border-history-gold/20 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-history-gold relative z-20">
                      {board[index].stones}
                    </div>

                    {/* Direction controller popup */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute inset-0 z-30 bg-history-charcoal-dark/95 border border-history-gold flex items-center justify-around rounded-xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Bottom Row direction triggers: CW is Left (←), CCW is Right (→) */}
                          <button
                            onClick={() => handleDirectionSelect('cw')}
                            className="p-1.5 rounded bg-history-red text-white border border-history-gold/30 hover:bg-history-red-light transition-all"
                            title="Xuôi chiều kim đồng hồ (Trái)"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDirectionSelect('ccw')}
                            className="p-1.5 rounded bg-history-red text-white border border-history-gold/30 hover:bg-history-red-light transition-all"
                            title="Ngược chiều kim đồng hồ (Phải)"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT MANDARIN (Hole 10) */}
          <div className="col-span-1 row-span-2 bg-gradient-to-bl from-black/55 to-black/25 rounded-r-full border border-history-gold/30 flex flex-col justify-between items-center py-4 relative shadow-inner overflow-hidden">
            <span className="text-[10px] sm:text-xs text-history-gold-light uppercase font-bold tracking-wide font-cinzel text-center px-1 mt-2 sm:mt-3">
              Quan Phải
            </span>
            {renderPebbles(board[10].stones, true, 10)}
            <div className="bg-history-gold-dark/20 border border-history-gold-light/30 px-2 py-0.5 rounded text-xs font-bold text-history-gold-bright relative z-20">
              {board[10].stones}
            </div>
            <div className="absolute top-1/2 right-2 text-[9px] text-gray-500 pointer-events-none uppercase tracking-wider origin-center rotate-90 translate-y-[-50%] line-clamp-1 max-w-[140px]">
              {chapterTitles[10]}
            </div>
          </div>

        </div>
      </div>
      
      {/* Visual Guideline Hint */}
      {isMyTurn && !selectedHole && (
        <div className="mt-4 text-xs font-semibold text-history-gold-light animate-bounce">
          💡 Chọn một ô dân ở hàng của bạn và chọn hướng di chuyển để bắt đầu gieo sỏi!
        </div>
      )}
    </div>
  );
};
