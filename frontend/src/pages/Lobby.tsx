import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Users, BookOpen, Trophy, PlusCircle, LogIn, Swords, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const Lobby: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const [aiMode, setAiMode] = useState<'ai_easy' | 'ai_medium' | 'ai_hard'>('ai_easy');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Setup socket listeners for room setup
  useEffect(() => {
    if (!socket) return;

    socket.on('room_created', (data: { roomCode: string }) => {
      setLoading(false);
      navigate(`/game/${data.roomCode}`);
    });

    socket.on('room_joined', (data: { roomCode: string }) => {
      setLoading(false);
      navigate(`/game/${data.roomCode}`);
    });

    socket.on('error_message', (data: { message: string }) => {
      setLoading(false);
      setError(data.message);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('error_message');
    };
  }, [socket, navigate]);

  const handleCreateRoom = () => {
    if (!socket || !isConnected) {
      return setError('Lỗi kết nối mạng. Vui lòng thử lại sau.');
    }
    setLoading(true);
    setError(null);
    socket.emit('create_room', { userId: user?.id, userName: user?.name });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) {
      return setError('Vui lòng nhập mã phòng gồm 6 ký tự.');
    }
    if (!socket || !isConnected) {
      return setError('Lỗi kết nối mạng. Vui lòng thử lại sau.');
    }

    setLoading(true);
    setError(null);
    socket.emit('join_room', {
      roomCode: roomCodeInput.trim().toUpperCase(),
      userId: user?.id,
      userName: user?.name,
    });
  };

  const handleCreateAIRoom = () => {
    if (!socket || !isConnected) {
      return setError('Lỗi kết nối mạng. Vui lòng thử lại sau.');
    }
    setLoading(true);
    setError(null);
    socket.emit('create_ai_room', {
      mode: aiMode,
      userId: user?.id,
      userName: user?.name,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto px-4 py-8 relative z-10"
    >
      {/* Header Profile Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-xl p-5 mb-8 shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-history-gold text-lg font-black text-history-charcoal-pure bg-gradient-to-tr from-history-gold-light via-history-gold-bright to-history-gold-dark flex items-center justify-center shadow-lg">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-cinzel font-bold text-history-gold-bright">
              Kỳ thủ: {user?.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-400 font-montserrat mt-0.5">
              <span>Học hàm: <strong className="text-history-gold-light">Tân binh Lịch sử</strong></span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>Điểm xếp hạng: <strong className="text-history-gold-bright font-mono">{user?.totalScore || 0}đ</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/study"
            className="px-4 py-2 border border-history-gold/30 hover:border-history-gold bg-black/30 hover:bg-history-gold/10 text-history-gold-light hover:text-history-gold-bright text-xs sm:text-sm font-bold font-montserrat rounded flex items-center gap-1.5 transition-all"
          >
            <BookOpen className="h-4 w-4" />
            Tư liệu lịch sử
          </Link>
          <Link
            to="/leaderboard"
            className="px-4 py-2 border border-history-gold/30 hover:border-history-gold bg-black/30 hover:bg-history-gold/10 text-history-gold-light hover:text-history-gold-bright text-xs sm:text-sm font-bold font-montserrat rounded flex items-center gap-1.5 transition-all"
          >
            <Trophy className="h-4 w-4" />
            Xếp hạng
          </Link>
          <Link
            to={`/profile/${user?.id}`}
            className="px-4 py-2 border border-history-gold/30 hover:border-history-gold bg-black/30 hover:bg-history-gold/10 text-history-gold-light hover:text-history-gold-bright text-xs sm:text-sm font-bold font-montserrat rounded flex items-center gap-1.5 transition-all"
          >
            Hồ sơ cá nhân
          </Link>
          <button
            onClick={logout}
            className="p-2 border border-red-900/30 hover:border-red-600 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded transition-all"
            title="Đăng xuất"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Main Banner */}
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-cinzel font-black gold-gradient-text tracking-wider uppercase mb-3 leading-tight drop-shadow-lg">
          Hành Trình Độc Lập
        </h1>
        <p className="text-sm sm:text-base font-cinzel text-history-red border-y border-history-red/30 py-2 inline-block tracking-widest font-black mb-4">
          Ô ĂN QUAN LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM
        </p>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-montserrat">
          Sử dụng tư duy chiến thuật dân gian để giải mã các mốc son lịch sử chói lọi, trả lời các câu hỏi giáo trình Lịch sử Đảng để tích lũy điểm số và thăng cấp danh hiệu.
        </p>
      </div>

      {/* Connection State Info Alert */}
      {!isConnected && (
        <div className="mb-6 p-3 bg-red-950/30 border border-red-700/40 text-red-400 text-xs sm:text-sm rounded text-center font-montserrat animate-pulse">
          ⚠️ Đang ngắt kết nối với máy chủ Socket.IO. Vui lòng làm mới trang hoặc chờ giây lát...
        </div>
      )}

      {/* Error Info Alert */}
      {error && (
        <div className="mb-6 p-3 bg-history-red-deep/40 border border-history-red text-red-300 text-xs sm:text-sm rounded text-center font-montserrat">
          {error}
        </div>
      )}

      {/* Game Modes Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        
        {/* Play VS AI Card */}
        <div className="bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            <Swords className="h-28 w-28 text-history-gold" />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Play className="text-history-gold-bright h-6 w-6" />
              <h3 className="text-xl font-cinzel font-black text-history-gold-bright uppercase tracking-wide">
                Chơi Với Máy
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-montserrat leading-relaxed mb-6">
              Rèn luyện kiến thức Lịch sử Đảng của bạn bằng cách so tài với trí tuệ nhân tạo ở 3 mức độ khó khác nhau. AI càng khó sẽ có tỉ lệ trả lời câu hỏi lịch sử chính xác càng cao.
            </p>

            {/* AI Levels selector */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {[
                { key: 'ai_easy', label: 'Dễ', color: 'border-green-600/30 text-green-400 bg-green-950/10' },
                { key: 'ai_medium', label: 'Vừa', color: 'border-yellow-600/30 text-yellow-400 bg-yellow-950/10' },
                { key: 'ai_hard', label: 'Khó', color: 'border-red-600/30 text-red-400 bg-red-950/10' },
              ].map((lvl) => {
                const isSelected = aiMode === lvl.key;
                return (
                  <button
                    key={lvl.key}
                    type="button"
                    onClick={() => setAiMode(lvl.key as any)}
                    className={`py-2 px-3 border rounded text-xs sm:text-sm font-bold uppercase transition-all duration-300 font-montserrat ${
                      isSelected
                        ? 'border-history-gold bg-history-gold text-history-charcoal-pure shadow-gold-glow scale-105'
                        : lvl.color
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCreateAIRoom}
            disabled={loading || !isConnected}
            className="w-full py-3.5 red-btn text-sm font-black tracking-wide flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Swords className="h-4.5 w-4.5" />
                Vào Trận Đối Đầu Máy
              </>
            )}
          </button>
        </div>

        {/* Play PVP / Friends Card */}
        <div className="bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            <Users className="h-28 w-28 text-history-gold" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-history-gold-bright h-6 w-6" />
              <h3 className="text-xl font-cinzel font-black text-history-gold-bright uppercase tracking-wide">
                Chơi Với Bạn Bè
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-montserrat leading-relaxed mb-6">
              Thách đấu bạn cùng lớp trực tuyến bằng cách tạo phòng hoặc nhập mã phòng 6 ký tự để cùng nhau học tập và tranh tài trực tiếp thời gian thực.
            </p>

            {/* PVP Join Room Form */}
            <form onSubmit={handleJoinRoom} className="space-y-4 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value)}
                  placeholder="MÃ PHÒNG (VD: A72DF9)"
                  className="flex-grow px-3 py-2.5 bg-history-charcoal-pure text-center text-sm font-bold border border-history-gold/20 rounded focus:border-history-gold focus:outline-none placeholder-gray-600 uppercase tracking-widest text-white font-mono"
                />
                <button
                  type="submit"
                  disabled={loading || !isConnected}
                  className="px-4 bg-history-charcoal-light hover:bg-history-gold/15 text-history-gold font-bold border border-history-gold/30 rounded text-sm flex items-center gap-1.5 transition-all duration-300 hover:shadow-gold-glow"
                >
                  <LogIn className="h-4 w-4" />
                  Vào
                </button>
              </div>
            </form>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={loading || !isConnected}
            className="w-full py-3.5 gold-btn text-sm font-black tracking-wide flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-history-charcoal-pure border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <PlusCircle className="h-4.5 w-4.5" />
                Tạo Phòng Thi Đấu Mới
              </>
            )}
          </button>
        </div>

      </div>
    </motion.div>
  );
};
