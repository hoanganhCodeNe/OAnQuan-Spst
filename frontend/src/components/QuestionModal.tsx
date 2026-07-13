import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

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

interface QuestionModalProps {
  quiz: PendingQuiz;
  isActivePlayer: boolean;
  onSubmitAnswer: (answer: string) => void;
  opponentName: string;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  quiz,
  isActivePlayer,
  onSubmitAnswer,
  opponentName,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(25); // 25 seconds timer
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  // Timer Countdown
  useEffect(() => {
    if (isSubmitted || !isActivePlayer) return;

    if (timeLeft === 0) {
      // Auto-submit a wrong answer if time runs out
      handleSubmit('TIMEOUT');
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isSubmitted, isActivePlayer]);

  const getChapterName = (chapterNum: number): string => {
    const chapters: Record<number, string> = {
      1: 'Bối cảnh Việt Nam trước năm 1930',
      2: 'Nguyễn Ái Quốc tìm đường cứu nước',
      3: 'Thành lập Đảng Cộng sản Việt Nam',
      4: 'Phong trào Xô Viết Nghệ Tĩnh',
      5: 'Mặt trận Việt Minh',
      6: 'Cách mạng tháng Tám 1945',
      7: 'Kháng chiến chống Pháp',
      8: 'Kháng chiến chống Mỹ',
      9: 'Đại thắng mùa Xuân 1975',
      10: 'Công cuộc Đổi mới 1986',
      11: 'Việt Nam hội nhập và phát triển',
    };
    return chapters[chapterNum] || 'Tư liệu Lịch sử Đảng';
  };

  const handleSubmit = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
    setIsSubmitted(true);

    const isCorrect = option.trim().toUpperCase() === quiz.correctAnswer.trim().toUpperCase();
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      // Fire confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#D4AF37', '#DC2626', '#8B0000']
      });
    }

    // Small delay to let local animations run before notifying server
    setTimeout(() => {
      onSubmitAnswer(option);
      setShowAnswerFeedback(true);
    }, 1000);
  };

  const options = [
    { key: 'A', value: quiz.option_a },
    { key: 'B', value: quiz.option_b },
    { key: 'C', value: quiz.option_c },
    { key: 'D', value: quiz.option_d },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-history-charcoal-pure/85 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/30 rounded-xl overflow-hidden shadow-2xl pulse-gold"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-history-red-dark via-history-red to-history-red-dark px-6 py-4 flex items-center justify-between border-b border-history-gold/30">
          <div className="flex items-center gap-3">
            <BookOpen className="text-history-gold-bright h-6 w-6" />
            <div>
              <span className="text-xs text-history-gold-light font-bold uppercase tracking-wider font-montserrat">
                Mốc Lịch Sử {quiz.chapter}
              </span>
              <h2 className="text-lg font-cinzel font-bold text-history-gold-bright line-clamp-1">
                {getChapterName(quiz.chapter)}
              </h2>
            </div>
          </div>
          {isActivePlayer && !isSubmitted && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/30 border border-history-gold/20 rounded-full">
              <Clock className="text-history-gold-light h-4 w-4 animate-pulse" />
              <span className="text-sm font-bold font-montserrat text-history-gold-bright w-6 text-center">
                {timeLeft}s
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Sowing Capture Alert Info */}
          <div className="mb-4 text-sm text-center py-2 bg-history-red-deep/40 border border-history-red/30 rounded text-gray-300">
            {isActivePlayer ? (
              <p>
                Bạn đang nỗ lực giành quyền sở hữu{' '}
                <span className="text-history-gold font-bold">{quiz.capturedStones} quân</span> tại các ô bị ăn. Trả lời đúng để nhận quân!
              </p>
            ) : (
              <p>
                <span className="text-history-gold font-bold">{opponentName}</span> đang trả lời câu hỏi để ăn{' '}
                <span className="text-history-gold font-bold">{quiz.capturedStones} quân</span>.
              </p>
            )}
          </div>

          {/* Question Text */}
          <div className="mb-6 bg-black/20 p-4 rounded border border-history-gold/10">
            <h3 className="text-base sm:text-lg font-medium leading-relaxed flex items-start gap-3 text-gray-100">
              <HelpCircle className="text-history-gold h-6 w-6 shrink-0 mt-0.5" />
              <span>{quiz.questionContent}</span>
            </h3>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 gap-3.5 mb-6">
            {options.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isCorrectOpt = opt.key === quiz.correctAnswer;
              
              let btnClass = 'border-history-gold/20 text-gray-300 hover:bg-history-gold/5';
              if (isSubmitted) {
                if (isSelected) {
                  btnClass = isAnswerCorrect 
                    ? 'bg-green-950/40 border-green-500 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                    : 'bg-red-950/40 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
                } else if (isCorrectOpt && showAnswerFeedback) {
                  btnClass = 'bg-green-950/20 border-green-500/50 text-green-400';
                } else {
                  btnClass = 'border-history-charcoal-light text-gray-500 opacity-60';
                }
              } else if (!isActivePlayer) {
                btnClass = 'border-history-charcoal-light text-gray-500 cursor-not-allowed';
              }

              return (
                <button
                  key={opt.key}
                  disabled={isSubmitted || !isActivePlayer}
                  onClick={() => handleSubmit(opt.key)}
                  className={`w-full text-left p-3.5 border rounded-lg transition-all duration-300 flex items-start gap-3 font-montserrat ${btnClass}`}
                >
                  <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-sm ${
                    isSelected ? 'bg-history-gold text-history-charcoal-pure' : 'bg-black/30 border border-history-gold/30 text-history-gold'
                  }`}>
                    {opt.key}
                  </span>
                  <span className="text-sm sm:text-base leading-tight mt-0.5">{opt.value}</span>
                </button>
              );
            })}
          </div>

          {/* Animated Answer Feedback & Historical Explanation */}
          <AnimatePresence>
            {showAnswerFeedback && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-6 border-t border-history-gold/20 pt-5 text-gray-200"
              >
                <div className="flex gap-3 mb-2">
                  {isAnswerCorrect ? (
                    <div className="flex items-center gap-1.5 text-green-400 font-bold text-sm">
                      <CheckCircle2 className="h-5 w-5" />
                      CHÍNH XÁC!
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-sm">
                      <AlertTriangle className="h-5 w-5" />
                      CHƯA CHÍNH XÁC! (Đáp án đúng: {quiz.correctAnswer})
                    </div>
                  )}
                </div>

                <div className="bg-black/35 p-4 rounded border border-history-gold/15 text-sm leading-relaxed text-gray-300">
                  <div className="font-semibold text-history-gold-light mb-1.5 flex items-center gap-1.5 font-cinzel">
                    <BookOpen className="h-4 w-4" />
                    BÀI HỌC LỊCH SỬ:
                  </div>
                  <p>{quiz.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Opponent is answering overlay overlay message */}
          {!isActivePlayer && (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400 italic">
              <Clock className="h-8 w-8 text-history-gold animate-spin mb-2" />
              Đang đợi {opponentName} suy nghĩ và chọn đáp án...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
