import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Users, BookOpen, Trophy, PlusCircle, LogIn, Swords, LogOut, Lock, HelpCircle, Info } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'modes' | 'guide'>('modes');

  const isGuest = user?.id === '11111111-1111-1111-1111-111111111111';

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
    if (isGuest) {
      return setError('Tính năng Chơi với bạn bè yêu cầu đăng ký/đăng nhập tài khoản để kết nối trực tuyến!');
    }
    if (!socket || !isConnected) {
      return setError('Lỗi kết nối mạng. Vui lòng thử lại sau.');
    }
    setLoading(true);
    setError(null);
    socket.emit('create_room', { userId: user?.id, userName: user?.name });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      return setError('Tính năng Chơi với bạn bè yêu cầu đăng ký/đăng nhập tài khoản để kết nối trực tuyến!');
    }
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
            {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
          </div>
          <div>
            <h2 className="text-lg font-cinzel font-bold text-history-gold-bright">
              Kỳ thủ: {user?.name || 'Khách'}
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-400 font-montserrat mt-0.5">
              <span>Học hàm: <strong className="text-history-gold-light">{isGuest ? 'Khách vãng lai' : 'Tân binh Lịch sử'}</strong></span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>Điểm xếp hạng: <strong className="text-history-gold-bright font-mono">{isGuest ? 'Không tích lũy' : `${user?.totalScore || 0}đ`}</strong></span>
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
          {!isGuest && (
            <Link
              to={`/profile/${user?.id}`}
              className="px-4 py-2 border border-history-gold/30 hover:border-history-gold bg-black/30 hover:bg-history-gold/10 text-history-gold-light hover:text-history-gold-bright text-xs sm:text-sm font-bold font-montserrat rounded flex items-center gap-1.5 transition-all"
            >
              Hồ sơ cá nhân
            </Link>
          )}
          <button
            onClick={logout}
            className="p-2 border border-red-900/30 hover:border-red-600 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded transition-all"
            title={isGuest ? "Thoát chế độ khách" : "Đăng xuất"}
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

      {/* Tab Selectors */}
      <div className="flex justify-center border-b border-history-gold/10 mb-8 max-w-md mx-auto font-cinzel">
        <button
          onClick={() => setActiveTab('modes')}
          className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold tracking-wider uppercase border-b-2 transition-all duration-300 ${
            activeTab === 'modes'
              ? 'border-history-gold text-history-gold-bright font-black'
              : 'border-transparent text-gray-500 hover:text-gray-400'
          }`}
        >
          ⚔️ Chế Độ Chơi
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold tracking-wider uppercase border-b-2 transition-all duration-300 ${
            activeTab === 'guide'
              ? 'border-history-gold text-history-gold-bright font-black'
              : 'border-transparent text-gray-500 hover:text-gray-400'
          }`}
        >
          📖 Hướng Dẫn Trò Chơi
        </button>
      </div>

      {activeTab === 'modes' ? (
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
            {isGuest && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
                <Lock className="h-10 w-10 text-history-gold-bright mb-3 animate-bounce" />
                <h4 className="text-sm font-cinzel font-black text-history-gold-bright uppercase tracking-wider mb-1">Đã khóa chế độ online</h4>
                <p className="text-[11px] text-gray-400 font-montserrat max-w-[220px] mb-4">Bạn cần đăng nhập tài khoản học viên để chơi trực tuyến với bạn bè và lưu thành tích học tập.</p>
                <Link
                  to="/login"
                  onClick={logout}
                  className="px-4 py-2 border border-history-gold/30 hover:border-history-gold bg-gradient-to-r from-history-gold via-history-gold-bright to-history-gold text-history-charcoal-pure font-black text-xs font-montserrat rounded transition-all shadow-md"
                >
                  Đăng Nhập Ngay
                </Link>
              </div>
            )}

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
      ) : (
        <div className="bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <BookOpen className="h-28 w-28 text-history-gold" />
          </div>

          <h3 className="text-xl font-cinzel font-black text-history-gold-bright uppercase tracking-wide mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-history-gold" />
            Luật Chơi Ô Ăn Quan Lịch Sử Đảng
          </h3>
          
          <div className="space-y-4 text-xs sm:text-sm text-gray-300 font-montserrat leading-relaxed max-w-4xl">
            <div className="p-4 bg-black/25 border border-history-gold/10 rounded-xl">
              <h4 className="text-history-gold-bright font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 font-cinzel">
                <span className="w-5.5 h-5.5 rounded-full bg-history-gold/15 border border-history-gold text-xs flex items-center justify-center text-history-gold font-mono font-bold">1</span>
                Sắp Xếp Bàn Cờ Cổ Điển
              </h4>
              <p className="text-gray-400 pl-7">
                Bàn cờ có **10 ô dân** nằm đối xứng hai bên (mỗi người điều khiển 5 ô dân thuộc hàng của mình) và **2 ô quan** hình bán nguyệt ở hai đầu.
                Mỗi ô dân xếp sẵn **5 viên sỏi**. Mỗi ô quan xếp sẵn **1 quân quan** (tương đương trị giá 10 viên sỏi dân).
              </p>
            </div>

            <div className="p-4 bg-black/25 border border-history-gold/10 rounded-xl">
              <h4 className="text-history-gold-bright font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 font-cinzel">
                <span className="w-5.5 h-5.5 rounded-full bg-history-gold/15 border border-history-gold text-xs flex items-center justify-center text-history-gold font-mono font-bold">2</span>
                Gieo Cờ Gieo Sỏi (Lượt Đi)
              </h4>
              <p className="text-gray-400 pl-7">
                Khi đến lượt, chọn một ô dân bất kỳ còn sỏi trên hàng của mình và chọn hướng di chuyển: **Thuận** hoặc **Ngược chiều kim đồng hồ**.
                Hệ thống sẽ lấy toàn bộ sỏi trong ô đó gieo lần lượt từng viên vào các ô tiếp theo. Khi gieo hết sỏi:
              </p>
              <ul className="list-disc list-inside text-gray-500 pl-11 mt-2 space-y-1.5 text-xs">
                <li>Nếu ô tiếp theo có sỏi (và không phải ô quan): Hệ thống tự lấy số sỏi đó gieo tiếp (Gieo dồn).</li>
                <li>Nếu ô tiếp theo là ô trống và ô kế tiếp là ô có sỏi: Bạn được **ăn toàn bộ sỏi** ở ô kế tiếp đó (Ăn quân).</li>
                <li>Nếu ô tiếp theo là ô quan: Lượt đi của bạn lập tức kết thúc, nhường quyền đi cho đối thủ.</li>
              </ul>
            </div>

            <div className="p-4 bg-black/25 border border-history-gold/10 rounded-xl">
              <h4 className="text-history-gold-bright font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 font-cinzel">
                <span className="w-5.5 h-5.5 rounded-full bg-history-gold/15 border border-history-gold text-xs flex items-center justify-center text-history-gold font-mono font-bold">3</span>
                Đố Vui Tranh Chấp Lịch Sử Đảng
              </h4>
              <p className="text-gray-400 pl-7">
                Đây là điểm khác biệt giáo dục! Mỗi khi bạn ăn được một ô bất kỳ, một câu hỏi trắc nghiệm Lịch sử Đảng sẽ hiện ra tương ứng với mốc sự kiện của ô đó:
              </p>
              <ul className="list-disc list-inside text-gray-500 pl-11 mt-2 space-y-1.5 text-xs">
                <li><strong className="text-green-400">Trả lời ĐÚNG</strong>: Nhận điểm số của ô dân đó, cộng thêm <strong className="text-green-400">+10 điểm học tập</strong>, nhận **thêm 1 lượt đi** và mở khóa tư liệu lịch sử tương ứng để đọc.</li>
                <li><strong className="text-red-400">Trả lời SAI</strong>: Bạn bị **mất lượt đi** ngay lập tức và bị trừ <strong className="text-red-400">-5 điểm học tập</strong>.</li>
              </ul>
            </div>

            <div className="p-4 bg-black/25 border border-history-gold/10 rounded-xl">
              <h4 className="text-history-gold-bright font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 font-cinzel">
                <span className="w-5.5 h-5.5 rounded-full bg-history-gold/15 border border-history-gold text-xs flex items-center justify-center text-history-gold font-mono font-bold">4</span>
                Xác Định Người Thắng
              </h4>
              <p className="text-gray-400 pl-7">
                Trận đấu kết thúc khi **cả hai ô quan đều bị ăn sạch**. Điểm số cuối cùng của bạn sẽ được tính bằng: *Số sỏi dân thu được + (Số quân Quan x 10) + Điểm học tập trả lời câu hỏi*. Ai có tổng điểm lớn hơn sẽ giành chiến thắng anh hùng!
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
