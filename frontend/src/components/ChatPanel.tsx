import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Scroll, ShieldAlert } from 'lucide-react';

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
}

interface ChatPanelProps {
  roomCode: string;
  chatMessages: ChatMessage[];
  gameLog: string[];
  senderName: string;
  onSendMessage: (message: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  roomCode,
  chatMessages,
  gameLog,
  senderName,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'log'>('chat');
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const logBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (activeTab === 'log' && logBottomRef.current) {
      logBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameLog, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full lg:w-[360px] h-[380px] lg:h-[600px] bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/20 rounded-xl flex flex-col shadow-2xl relative z-10 overflow-hidden">
      {/* Tabs Selector */}
      <div className="flex border-b border-history-gold/15 bg-black/25">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 font-montserrat uppercase transition-all duration-300 ${
            activeTab === 'chat'
              ? 'border-history-gold text-history-gold-bright bg-history-gold/5'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          Trò chuyện
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 font-montserrat uppercase transition-all duration-300 ${
            activeTab === 'log'
              ? 'border-history-gold text-history-gold-bright bg-history-gold/5'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Scroll className="h-4 w-4" />
          Nhật ký trận
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 bg-black/10">
        {activeTab === 'chat' ? (
          /* Chat List */
          <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-2.5">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 text-xs sm:text-sm my-auto flex flex-col items-center gap-2">
                <MessageCircle className="h-8 w-8 opacity-30 text-history-gold" />
                <span>Nhập tin nhắn để bắt đầu trò chuyện với đối thủ</span>
              </div>
            ) : (
              chatMessages.map((msg, i) => {
                const isMe = msg.sender === senderName;
                const isSystem = msg.sender === 'Hệ thống';

                if (isSystem) {
                  return (
                    <div key={i} className="text-center py-1 px-2.5 bg-history-gold/5 border border-history-gold/10 rounded-full text-[10px] sm:text-xs text-history-gold-light flex items-center justify-center gap-1.5 mx-auto max-w-[90%]">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>{msg.message}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <span className="text-[10px] text-gray-500 font-bold mb-0.5">{msg.sender}</span>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm font-montserrat ${
                        isMe
                          ? 'bg-history-red text-white rounded-tr-none border border-history-gold/20'
                          : 'bg-history-charcoal-light border border-history-gold/10 text-gray-200 rounded-tl-none'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>
        ) : (
          /* Game Logs List */
          <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-2">
            {gameLog.map((log, i) => {
              // Highlight based on action keywords
              let logColor = 'text-gray-400 border-history-charcoal-light';
              if (log.includes('ĐÚNG')) {
                logColor = 'text-green-400 border-green-500/20 bg-green-950/10';
              } else if (log.includes('SAI')) {
                logColor = 'text-red-400 border-red-500/20 bg-red-950/10';
              } else if (log.includes('đầu tiên')) {
                logColor = 'text-history-gold-bright border-history-gold/20 bg-history-gold/5';
              } else if (log.includes('kết thúc')) {
                logColor = 'text-yellow-500 border-yellow-500/20';
              }

              return (
                <div
                  key={i}
                  className={`text-xs p-2.5 rounded border leading-relaxed font-mono ${logColor}`}
                >
                  {log}
                </div>
              );
            })}
            <div ref={logBottomRef} />
          </div>
        )}
      </div>

      {/* Chat Footer Input */}
      {activeTab === 'chat' && (
        <form onSubmit={handleSend} className="p-3 border-t border-history-gold/15 bg-black/25 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập nội dung tin nhắn..."
            className="flex-grow px-3 py-2 bg-history-charcoal-pure text-white text-sm rounded border border-history-gold/20 focus:outline-none focus:border-history-gold font-montserrat placeholder-gray-600"
          />
          <button
            type="submit"
            className="p-2 bg-history-red text-white hover:bg-history-red-light rounded border border-history-gold/30 flex items-center justify-center transition-all"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      )}
    </div>
  );
};
