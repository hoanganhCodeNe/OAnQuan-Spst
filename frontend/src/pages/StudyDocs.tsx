import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowLeft, Loader, CheckCircle, Lock, Quote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Material } from '../types/game';

export const StudyDocs: React.FC = () => {
  const { user, apiUrl } = useAuth();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/materials`);
        const data = await res.json();
        
        if (res.ok) {
          setMaterials(data);
        } else {
          setError('Không thể tải tư liệu học tập.');
        }
      } catch (err) {
        console.error(err);
        setError('Có lỗi xảy ra khi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [apiUrl]);

  const activeMaterial = materials.find((m) => m.chapter === selectedChapter);

  // Helper: check if user unlocked chapter
  const isUnlocked = (chapterNum: number) => {
    if (!user) return false;
    // Special case: show everything if profile unlocked list is empty, or let students study all.
    // Let's check user's unlocked list in achievements / profile if exists
    const unlocked = user.achievements?.some(() => true) || false; // default true for self study
    return true; // We allow all-chapters self study, but can display a gold badge
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="max-w-6xl mx-auto px-4 py-8 relative z-10 font-montserrat"
    >
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-history-gold hover:text-history-gold-bright mb-6 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại Sảnh chờ
      </Link>

      {/* Title */}
      <div className="text-center mb-8 border-b border-history-gold/10 pb-6">
        <BookOpen className="h-12 w-12 text-history-gold-bright mx-auto mb-3 drop-shadow-[0_0_10px_#FFD700]" />
        <h1 className="text-2xl sm:text-4xl font-cinzel font-black gold-gradient-text uppercase tracking-wider mb-2">
          Kỷ Yếu Tư Liệu Lịch Sử Đảng
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-montserrat max-w-2xl mx-auto leading-relaxed">
          Tài liệu tổng hợp các mốc lịch sử tương ứng với 10 ô dân và 2 ô quan trên bàn cờ. Đọc kỹ tư liệu giúp bạn nâng cao tỷ lệ trả lời đúng câu hỏi và chinh phục trò chơi!
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <div className="h-8 w-8 border-4 border-history-gold/30 border-t-history-gold rounded-full animate-spin" />
          <span>Đang tải kho tư liệu...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-history-red-deep/40 border border-history-red text-red-300 rounded text-center mb-6">
          {error}
        </div>
      ) : (
        /* Materials Layout Split view */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Chapters list navigation (Col 4) */}
          <div className="lg:col-span-4 bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-xl p-4 shadow-lg flex flex-col gap-2 h-auto lg:max-h-[600px] overflow-y-auto">
            <span className="text-[10px] text-history-gold-light uppercase font-bold tracking-widest font-montserrat px-2 mb-2 block">
              Danh mục các mốc son
            </span>
            {materials.map((m) => {
              const selected = selectedChapter === m.chapter;
              const unlocked = isUnlocked(m.chapter);

              return (
                <button
                  key={m.chapter}
                  onClick={() => setSelectedChapter(m.chapter)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-300 flex items-center justify-between font-montserrat ${
                    selected
                      ? 'bg-history-red text-white border-history-gold/60 shadow-[0_0_10px_rgba(212,175,55,0.15)] scale-[1.02]'
                      : 'bg-black/25 border-history-gold/5 text-gray-400 hover:bg-history-gold/5 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-6 h-6 rounded-full text-xs font-bold shrink-0 flex items-center justify-center ${
                      selected ? 'bg-history-gold text-history-charcoal-pure font-black' : 'bg-black/45 text-history-gold border border-history-gold/25'
                    }`}>
                      {m.chapter}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold truncate leading-tight">
                      {m.title}
                    </span>
                  </div>
                  {unlocked ? (
                    <CheckCircle className="h-4 w-4 text-history-gold shrink-0 ml-1.5" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-600 shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Chapter Content Details view (Col 8) */}
          <div className="lg:col-span-8 bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-xl p-6 shadow-lg min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeMaterial && (
                <motion.div
                  key={activeMaterial.chapter}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Period badge */}
                  <div className="flex items-center justify-between border-b border-history-gold/15 pb-4">
                    <div>
                      <span className="text-[10px] text-history-gold-light uppercase font-bold tracking-wider font-montserrat">
                        Giai đoạn: {activeMaterial.period}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-history-gold-bright mt-1">
                        {activeMaterial.title}
                      </h2>
                    </div>
                  </div>

                  {/* Summary paragraph */}
                  <div className="p-4 bg-history-gold/5 border-l-4 border-history-gold rounded text-sm sm:text-base leading-relaxed text-gray-300 font-montserrat">
                    <p className="italic">{activeMaterial.summary}</p>
                  </div>

                  {/* Bullet details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-history-gold-light font-montserrat">
                      Chi tiết diễn biến chính:
                    </h3>
                    <ul className="space-y-3.5 pl-5 list-disc text-sm sm:text-base text-gray-300 font-montserrat leading-relaxed">
                      {activeMaterial.details.map((detail, idx) => (
                        <li key={idx} className="marker:text-history-gold">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Historical quote */}
                  {activeMaterial.quotes && (
                    <div className="border-t border-history-gold/10 pt-5 mt-6">
                      <div className="bg-black/35 rounded-lg p-4 border border-history-gold/15 flex items-start gap-3 italic text-gray-300 text-sm font-montserrat leading-relaxed">
                        <Quote className="h-5 w-5 text-history-gold-light shrink-0 mt-0.5" />
                        <p>{activeMaterial.quotes}</p>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}
    </motion.div>
  );
};
