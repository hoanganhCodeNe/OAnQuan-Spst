import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const { registerUser, apiUrl } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return setError('Vui lòng điền đầy đủ các thông tin yêu cầu.');
    }

    if (password !== confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp.');
    }

    if (password.length < 6) {
      return setError('Mật khẩu phải dài ít nhất 6 ký tự.');
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        registerUser(data.token, data.user);
        navigate('/');
      } else {
        setError(data.message || 'Đăng ký tài khoản thất bại.');
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
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-cinzel font-black gold-gradient-text leading-tight mb-2 uppercase tracking-wider">
            Đăng Ký
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-montserrat">
            Tạo tài khoản học viên để bắt đầu hành trình chinh phục
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-history-red-deep/40 border border-history-red text-red-300 text-xs sm:text-sm rounded text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-history-gold-light uppercase tracking-wider mb-1.5 font-montserrat">
              Họ và Tên
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-3 py-2.5 bg-history-charcoal-pure border border-history-gold/20 focus:border-history-gold focus:outline-none rounded text-white text-sm placeholder-gray-600 transition-all font-montserrat"
              />
            </div>
          </div>

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
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-10 pr-3 py-2.5 bg-history-charcoal-pure border border-history-gold/20 focus:border-history-gold focus:outline-none rounded text-white text-sm placeholder-gray-600 transition-all font-montserrat"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-history-gold-light uppercase tracking-wider mb-1.5 font-montserrat">
              Xác Nhận Mật Khẩu
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
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
                <UserPlus className="h-4.5 w-4.5" />
                Khởi Tạo Tài Khoản
              </>
            )}
          </button>
        </form>

        {/* Login Redirect */}
        <div className="mt-6 text-center text-xs sm:text-sm text-gray-500 border-t border-history-gold/10 pt-4 font-montserrat">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="text-history-gold font-bold hover:underline inline-flex items-center gap-0.5 ml-1 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại Đăng Nhập
          </Link>
        </div>

      </div>
    </motion.div>
  );
};
