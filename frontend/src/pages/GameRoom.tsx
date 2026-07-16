import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Users, Swords, Home, HelpCircle, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MancalaBoard } from '../components/MancalaBoard';
import { ChatPanel } from '../components/ChatPanel';
import { QuestionModal } from '../components/QuestionModal';
import { Hole } from '../types/game';
import confetti from 'canvas-confetti';

interface Player {
  id: string;
  name: string;
  socketId: string;
}

interface Room {
  roomCode: string;
  mode: 'pvp' | 'ai_easy' | 'ai_medium' | 'ai_hard';
  host: Player;
  guest?: Player;
  status: 'waiting' | 'playing' | 'finished';
  matchId?: string;
}

interface PlayerState {
  id: string;
  name: string;
  stonesCaptured: number;
  quizPoints: number;
  unlockedChapters: number[];
}

interface CapturedHoleInfo {
  index: number;
  stones: number;
  isMandarin: boolean;
}

interface PendingQuiz {
  playerIndex: 1 | 2;
  chapter: number;
  questionId: number;
  questionContent: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correctAnswer: string;
  explanation: string;
  capturedStones: number;
  capturedHoles: CapturedHoleInfo[];
}

interface MatchState {
  matchId: string;
  mode: 'pvp' | 'ai_easy' | 'ai_medium' | 'ai_hard';
  board: Hole[];
  player1: PlayerState;
  player2: PlayerState;
  currentTurn: 'player1' | 'player2';
  status: 'waiting' | 'playing' | 'finished';
  winnerId: string | null;
  winnerName: string | null;
  pendingQuiz: PendingQuiz | null;
  gameLog: string[];
}

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
}

export const GameRoom: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user, refreshUser } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<MatchState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [copied, setCopied] = useState(false);
  const [showResultFeedback, setShowResultFeedback] = useState<{
    show: boolean;
    correct: boolean;
    correctAnswer: string;
    explanation: string;
  } | null>(null);

  // Auto trigger reconnection if room already active on mount
  useEffect(() => {
    if (!socket || !isConnected || !roomCode || !user) return;

    socket.emit('reconnect_match', { roomCode: roomCode.toUpperCase(), userId: user.id });
  }, [socket, isConnected, roomCode, user]);

  // Handle socket event subscriptions
  useEffect(() => {
    if (!socket) return;

    // Room joined update (in lobby)
    socket.on('room_joined', (data: { room: Room }) => {
      setRoom(data.room);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'Hệ thống',
          message: `${data.room.guest?.name} đã tham gia sảnh chờ.`,
          timestamp: Date.now(),
        },
      ]);
    });

    // Game initial and update states
    socket.on('game_state', (state: MatchState) => {
      setGameState(state);
      if (room) {
        setRoom((prev) => (prev ? { ...prev, status: state.status } : null));
      }
    });

    // Quiz Result Feedback broadcasts
    socket.on('quiz_result', (data: { correct: boolean; correctAnswer: string; explanation: string }) => {
      setShowResultFeedback({
        show: true,
        correct: data.correct,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
      });

      // Dismiss feedback modal after 5 seconds automatically
      setTimeout(() => {
        setShowResultFeedback(null);
      }, 5000);
    });

    // Chat broadcasts
    socket.on('chat_received', (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Match reconnection success
    socket.on('reconnect_success', (data: { room: Room; gameState: MatchState }) => {
      setRoom(data.room);
      setGameState(data.gameState);
    });

    // Match finished and winner celebration
    socket.on('match_finished', (data: { winnerName: string | null; winnerId: string | null; gameState: MatchState }) => {
      setGameState(data.gameState);
      refreshUser();
      
      // Fire celebration confetti if local user won
      if (data.winnerId === user?.id) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    });

    socket.on('player_disconnected', (data: { playerId: string; message: string }) => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'Hệ thống',
          message: data.message,
          timestamp: Date.now(),
        },
      ]);
    });

    // Handle connection failures redirect
    socket.on('reconnect_failed', () => {
      navigate('/');
    });

    socket.on('error_message', (data: { message: string }) => {
      alert(data.message);
    });

    return () => {
      socket.off('room_joined');
      socket.off('game_state');
      socket.off('quiz_result');
      socket.off('chat_received');
      socket.off('reconnect_success');
      socket.off('match_finished');
      socket.off('player_disconnected');
      socket.off('reconnect_failed');
      socket.off('error_message');
    };
  }, [socket, room, user, navigate]);

  // Action: Copy room code
  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Action: Start game
  const handleStartGame = () => {
    if (!socket || !roomCode) return;
    socket.emit('start_game', { roomCode: roomCode.toUpperCase() });
  };

  // Action: Move stone sowing
  const handleMove = (holeIndex: number, direction: 'cw' | 'ccw') => {
    if (!socket || !roomCode) return;
    socket.emit('make_move', { roomCode: roomCode.toUpperCase(), holeIndex, direction });
  };

  // Action: Answer Quiz submit
  const handleQuizAnswer = (answer: string) => {
    if (!socket || !roomCode) return;
    socket.emit('submit_answer', { roomCode: roomCode.toUpperCase(), answer });
  };

  // Action: Chat Send Message
  const handleSendMessage = (message: string) => {
    if (!socket || !roomCode || !user) return;
    socket.emit('chat_message', {
      roomCode: roomCode.toUpperCase(),
      message,
      senderName: user.name,
    });
    // Add locally immediately for real-time responsiveness
    setChatMessages((prev) => [
      ...prev,
      {
        sender: user.name,
        message,
        timestamp: Date.now(),
      },
    ]);
  };

  // Action: Surrender (GG) in PVP
  const handleSurrender = () => {
    if (!socket || !roomCode) return;
    const confirmGG = window.confirm("Xác nhận đầu hàng (GG)? Bạn sẽ bị tính thua cuộc và lưu kết quả trận đấu.");
    if (confirmGG) {
      socket.emit('surrender', { roomCode: roomCode.toUpperCase() });
    }
  };

  // Action: Exit game in AI mode
  const handleExit = () => {
    const confirmExit = window.confirm("Xác nhận thoát? Trận đấu này sẽ bị hủy bỏ và không lưu kết quả.");
    if (confirmExit) {
      navigate('/');
    }
  };

  if (!roomCode) return null;

  // Determine local user key ('player1' or 'player2')
  let myPlayerKey: 'player1' | 'player2' = 'player1';
  let isHost = true;
  
  if (room) {
    isHost = room.host.id === user?.id;
    myPlayerKey = isHost ? 'player1' : 'player2';
  }

  const isMyTurn = gameState ? gameState.currentTurn === myPlayerKey : false;

  // Render Waiting Lobby Screen
  if (room && room.status === 'waiting') {
    const hasGuestJoined = !!room.guest;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto my-12 px-4 relative z-10"
      >
        <div className="bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl pulse-gold">
          <h2 className="text-xl sm:text-2xl font-cinzel font-black gold-gradient-text uppercase tracking-wider mb-2">
            Sảnh Chờ Trận Đấu
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-montserrat mb-8">
            Phòng đấu online - Tối đa 2 người chơi thi đấu trực tiếp.
          </p>

          {/* Room Code Display */}
          <div className="bg-black/35 border border-history-gold/25 p-5 rounded-xl max-w-sm mx-auto mb-8 flex flex-col items-center">
            <span className="text-[10px] text-history-gold-light uppercase font-bold tracking-widest font-montserrat mb-1">
              Mã phòng của bạn
            </span>
            <div className="flex items-center gap-3.5 mt-1">
              <span className="text-3xl font-mono font-black tracking-widest text-history-gold-bright">
                {roomCode.toUpperCase()}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 border border-history-gold/30 hover:border-history-gold bg-history-gold/10 hover:bg-history-gold/25 rounded text-history-gold transition-all"
                title="Sao chép mã phòng"
              >
                <Copy className="h-4.5 w-4.5" />
              </button>
            </div>
            {copied && <span className="text-[10px] text-green-400 font-bold mt-2 animate-pulse">Đã sao chép vào bộ nhớ đệm!</span>}
          </div>

          {/* Players slots card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
            {/* Host Slot */}
            <div className="p-4 bg-history-gold/5 border border-history-gold/25 rounded-lg flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-history-gold font-bold uppercase block mb-0.5">Chủ phòng</span>
                <span className="text-sm font-bold text-gray-200">{room.host.name}</span>
              </div>
              <Users className="h-5 w-5 text-history-gold-bright" />
            </div>

            {/* Guest Slot */}
            <div className={`p-4 rounded-lg border flex items-center justify-between ${
              hasGuestJoined 
                ? 'bg-history-gold/5 border-history-gold/25' 
                : 'bg-black/25 border-history-charcoal-light border-dashed'
            }`}>
              <div className="text-left">
                <span className="text-[10px] text-gray-500 font-bold uppercase block mb-0.5">Thách đấu</span>
                <span className="text-sm font-bold text-gray-400">
                  {hasGuestJoined ? room.guest?.name : 'Đang chờ bạn bè...'}
                </span>
              </div>
              <Users className="h-5 w-5 text-gray-600" />
            </div>
          </div>

          {/* Action Button */}
          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={!hasGuestJoined}
              className={`w-full max-w-sm py-3.5 uppercase font-bold tracking-wide rounded font-montserrat transition-all duration-300 flex items-center justify-center gap-2 mx-auto ${
                hasGuestJoined 
                  ? 'gold-btn' 
                  : 'bg-gray-800 text-gray-500 border border-gray-700/50 cursor-not-allowed'
              }`}
            >
              <Swords className="h-4.5 w-4.5" />
              Khai Cuộc Trận Đấu
            </button>
          ) : (
            <div className="text-xs sm:text-sm text-history-gold animate-pulse font-montserrat">
              🔔 Thách đấu đã tham gia phòng. Đang đợi chủ phòng khai cuộc trận đấu...
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Active Game State layout
  if (gameState) {
    const isPvp = gameState.mode === 'pvp';
    
    // Identify players labels
    const p1Name = gameState.player1.name;
    const p2Name = gameState.player2.name;

    const p1Stones = gameState.player1.stonesCaptured;
    const p1QuizPts = gameState.player1.quizPoints;
    const p1TotalScore = p1Stones + p1QuizPts;

    const p2Stones = gameState.player2.stonesCaptured;
    const p2QuizPts = gameState.player2.quizPoints;
    const p2TotalScore = p2Stones + p2QuizPts;

    // Active quiz tracking
    const quiz = gameState.pendingQuiz;
    const isQuizActive = !!quiz;
    
    // Check if the current client is the one who has to answer the quiz
    const isActivePlayerForQuiz = isQuizActive && (
      (quiz.playerIndex === 1 && myPlayerKey === 'player1') ||
      (quiz.playerIndex === 2 && myPlayerKey === 'player2')
    );

    const quizOpponentName = myPlayerKey === 'player1' ? p2Name : p1Name;

    return (
      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        
        {/* Game Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          
          {/* Main Board Col */}
          <div className="flex-grow w-full flex flex-col items-center">
            
            {/* Round info card */}
            <div className="bg-gradient-to-r from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-xl p-4 w-full flex flex-wrap items-center justify-between gap-4 mb-4 shadow-md font-montserrat">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block tracking-wider">
                  Chế độ chơi
                </span>
                <span className="text-xs sm:text-sm font-bold text-history-gold-light">
                  {isPvp ? 'Song đấu Online (PVP)' : `Đối đầu với Máy (${gameState.mode === 'ai_easy' ? 'Dễ' : gameState.mode === 'ai_medium' ? 'Vừa' : 'Khó'})`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center bg-black/45 border border-history-gold/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="text-xs font-bold text-history-gold-bright uppercase tracking-wider">Mã phòng:</span>
                  <span className="font-mono text-sm font-black text-history-gold-bright">{roomCode.toUpperCase()}</span>
                </div>
                
                {gameState.status === 'playing' && (
                  isPvp ? (
                    <button
                      onClick={handleSurrender}
                      className="px-4 py-1.5 border border-red-600/40 hover:border-red-500 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 text-xs font-bold uppercase rounded transition-all transform active:scale-95 flex items-center gap-1 font-montserrat"
                    >
                      🏳️ Đầu hàng (GG)
                    </button>
                  ) : (
                    <button
                      onClick={handleExit}
                      className="px-4 py-1.5 border border-gray-600/40 hover:border-gray-500 bg-gray-950/20 hover:bg-gray-800/30 text-gray-400 hover:text-gray-300 text-xs font-bold uppercase rounded transition-all transform active:scale-95 flex items-center gap-1 font-montserrat"
                    >
                      🚪 Thoát trận
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Mancala Board Component */}
            <MancalaBoard
              board={gameState.board}
              currentTurn={gameState.currentTurn}
              player1Name={p1Name}
              player2Name={p2Name}
              isMyTurn={isMyTurn}
              myPlayerKey={myPlayerKey}
              onMove={handleMove}
              gameLog={gameState.gameLog}
            />

            {/* Scores Cards */}
            <div className="grid grid-cols-2 gap-4 w-full my-6 font-montserrat">
              
              {/* Player 1 Score details */}
              <div className={`p-4 rounded-xl border flex flex-col items-center shadow transition-all duration-300 ${
                gameState.currentTurn === 'player1'
                  ? 'bg-history-red/10 border-history-gold/50 shadow-gold-glow'
                  : 'bg-black/35 border-history-gold/10'
              }`}>
                <span className="text-xs text-gray-400 font-bold uppercase truncate max-w-full mb-1">
                  {p1Name} {myPlayerKey === 'player1' && '(Bạn)'}
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-history-gold-bright">
                  {p1TotalScore}đ
                </div>
                <div className="flex gap-2 text-[10px] sm:text-xs text-gray-500 mt-1">
                  <span>Sỏi: <strong>{p1Stones}</strong></span>
                  <span>|</span>
                  <span>Đố vui: <strong>{p1QuizPts}đ</strong></span>
                </div>
              </div>

              {/* Player 2 Score details */}
              <div className={`p-4 rounded-xl border flex flex-col items-center shadow transition-all duration-300 ${
                gameState.currentTurn === 'player2'
                  ? 'bg-history-red/10 border-history-gold/50 shadow-gold-glow'
                  : 'bg-black/35 border-history-gold/10'
              }`}>
                <span className="text-xs text-gray-400 font-bold uppercase truncate max-w-full mb-1">
                  {p2Name} {myPlayerKey === 'player2' && '(Bạn)'}
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-history-gold-bright">
                  {p2TotalScore}đ
                </div>
                <div className="flex gap-2 text-[10px] sm:text-xs text-gray-500 mt-1">
                  <span>Sỏi: <strong>{p2Stones}</strong></span>
                  <span>|</span>
                  <span>Đố vui: <strong>{p2QuizPts}đ</strong></span>
                </div>
              </div>

            </div>

          </div>

          {/* Chat Panel Col */}
          <div className="w-full lg:w-auto shrink-0 flex justify-center">
            <ChatPanel
              roomCode={roomCode}
              chatMessages={chatMessages}
              gameLog={gameState.gameLog}
              senderName={user?.name || 'Kỳ thủ'}
              onSendMessage={handleSendMessage}
            />
          </div>

        </div>

        {/* Modal Overlay: Question Quiz */}
        <AnimatePresence>
          {isQuizActive && (
            <QuestionModal
              quiz={quiz}
              isActivePlayer={isActivePlayerForQuiz}
              opponentName={quizOpponentName}
              onSubmitAnswer={handleQuizAnswer}
            />
          )}
        </AnimatePresence>

        {/* Modal Overlay: Feedback after Quiz Answer submitted */}
        <AnimatePresence>
          {showResultFeedback && showResultFeedback.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/30 rounded-xl p-6 shadow-2xl text-center font-montserrat"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 border ${
                    showResultFeedback.correct 
                      ? 'bg-green-950/20 border-green-500 text-green-400' 
                      : 'bg-red-950/20 border-red-500 text-red-400'
                  }`}>
                    {showResultFeedback.correct ? (
                      <span className="text-2xl font-bold">✓</span>
                    ) : (
                      <span className="text-2xl font-bold">✗</span>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold font-cinzel ${showResultFeedback.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {showResultFeedback.correct ? 'TRẢ LỜI ĐÚNG!' : 'TRẢ LỜI CHƯA ĐÚNG!'}
                  </h3>
                  {!showResultFeedback.correct && (
                    <span className="text-sm font-semibold text-gray-300">
                      Đáp án chính xác: <strong className="text-green-400">{showResultFeedback.correctAnswer}</strong>
                    </span>
                  )}
                  <div className="mt-3 bg-black/25 border border-history-gold/15 p-4 rounded text-left text-xs leading-normal text-gray-300">
                    <p className="font-bold text-history-gold-light flex items-center gap-1 mb-1 font-cinzel">
                      <HelpCircle className="h-3.5 w-3.5" />
                      Giải thích sự kiện:
                    </p>
                    <p>{showResultFeedback.explanation}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Overlay: Match Finished Screen */}
        <AnimatePresence>
          {gameState.status === 'finished' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center font-montserrat relative overflow-hidden"
              >
                {/* Glowing star burst backdrop */}
                <div className="absolute top-0 left-1/2 translate-x-[-50%] w-64 h-64 bg-history-gold/5 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-4">
                  <Trophy className="h-14 w-14 text-history-gold-bright drop-shadow-[0_0_10px_#FFD700] mb-2 animate-bounce" />
                  
                  <h2 className="text-2xl sm:text-3xl font-cinzel font-black gold-gradient-text uppercase tracking-widest">
                    Trận Đấu Kết Thúc!
                  </h2>

                  <div className="my-5 w-full bg-black/45 border border-history-gold/25 p-4 rounded-xl">
                    {gameState.winnerId ? (
                      <div className="text-center">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                          Anh hùng thắng cuộc
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-history-gold-bright flex items-center justify-center gap-1.5 font-cinzel">
                          {gameState.winnerName}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center font-bold text-gray-400 font-cinzel uppercase text-lg">
                        Trận Đấu Hòa Nhau!
                      </div>
                    )}

                    {/* Final detailed score rows */}
                    <div className="grid grid-cols-2 gap-4 border-t border-history-gold/15 mt-4 pt-4 text-sm">
                      <div>
                        <span className="text-xs text-gray-500 block truncate max-w-full font-bold uppercase mb-0.5">{p1Name}</span>
                        <strong className="text-lg text-history-gold-light font-mono font-bold">{p1TotalScore}đ</strong>
                        <span className="text-[10px] text-gray-600 block mt-0.5">Sỏi: {p1Stones} | Đố: {p1QuizPts}đ</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block truncate max-w-full font-bold uppercase mb-0.5">{p2Name}</span>
                        <strong className="text-lg text-history-gold-light font-mono font-bold">{p2TotalScore}đ</strong>
                        <span className="text-[10px] text-gray-600 block mt-0.5">Sỏi: {p2Stones} | Đố: {p2QuizPts}đ</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-normal mb-4">
                    Kết quả đã được cập nhật lên hệ thống xếp hạng thành tích học tập trực tuyến.
                  </p>

                  <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 gold-btn text-sm font-black tracking-wide flex items-center justify-center gap-2 font-montserrat"
                  >
                    <Home className="h-4.5 w-4.5" />
                    Quay về Sảnh Chính
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  // Loading indicator on disconnect/reconnect wait
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400 font-montserrat relative z-10 gap-3">
      <div className="h-10 w-10 border-4 border-history-gold/30 border-t-history-gold rounded-full animate-spin" />
      <span>Đang thiết lập kết nối phòng chơi...</span>
    </div>
  );
};
