import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, apiUrl } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Vui lòng nhập đầy đủ email và mật khẩu.');
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.message || 'Đăng nhập thất bại.');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="max-w-md w-full mx-auto my-12 px-4 relative z-10"
    >
      <div className="bg-gradient-to-b from-history-charcoal-light to-history-charcoal-dark border border-history-gold/30 rounded-2xl p-6 sm:p-8 shadow-2xl pulse-gold">
        
        {/* Brand/Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-cinzel font-black gold-gradient-text leading-tight mb-2 uppercase tracking-wider">
            Đăng Nhập
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-montserrat">
            Chinh phục hành trình độc lập - Ô ăn quan lịch sử Đảng
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-history-red-deep/40 border border-history-red text-red-300 text-xs sm:text-sm rounded text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-history-gold-light uppercase tracking-wider mb-1.5 font-montserrat">
              Email Học Viên
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@fpt.edu.vn"
                className="w-full pl-10 pr-3 py-2.5 bg-history-charcoal-pure border border-history-gold/20 focus:border-history-gold focus:outline-none rounded text-white text-sm placeholder-gray-600 transition-all font-montserrat"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-history-gold-light uppercase tracking-wider mb-1.5 font-montserrat">
              Mật Khẩu
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 bg-history-charcoal-pure border border-history-gold/20 focus:border-history-gold focus:outline-none rounded text-white text-sm placeholder-gray-600 transition-all font-montserrat"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 gold-btn flex items-center justify-center gap-2 mt-6 text-sm font-black"
          >
            {loading ? (
              <span className="h-4.5 w-4.5 border-2 border-history-charcoal-pure border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-4.5 w-4.5" />
                Vào Chiến Trường
              </>
            )}
          </button>
        </form>

        {/* Register Redirect */}
        <div className="mt-6 text-center text-xs sm:text-sm text-gray-500 border-t border-history-gold/10 pt-4 font-montserrat">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="text-history-gold font-bold hover:underline inline-flex items-center gap-0.5 ml-1 transition-all"
          >
            Đăng Ký Ngay
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </motion.div>
  );
};
