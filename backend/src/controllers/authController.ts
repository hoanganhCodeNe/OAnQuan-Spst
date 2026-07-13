import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin: tên, email và mật khẩu.' });
  }

  try {
    // Check if email already exists
    const checkEmail = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: 'Email này đã được sử dụng. Vui lòng chọn email khác.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const userId = crypto.randomUUID();
    const insertUser = await query(
      'INSERT INTO users (id, name, email, password, total_score, avatar) VALUES ($1, $2, $3, $4, 0, $5) RETURNING id, name, email, total_score, avatar, created_at',
      [userId, name, email, hashedPassword, 'default']
    );

    const user = insertUser.rows[0];

    // Create JWT
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        totalScore: user.total_score,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra trên hệ thống.' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ email và mật khẩu.' });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Đăng nhập thành công.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        totalScore: user.total_score,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra trên hệ thống.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa xác thực.' });
  }

  try {
    // Get user details
    const userResult = await query(
      'SELECT id, name, email, total_score, avatar, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
    }

    const user = userResult.rows[0];

    // Get count of wins
    const winsResult = await query('SELECT COUNT(*) FROM matches WHERE winner_id = $1', [user.id]);
    const totalWins = parseInt(winsResult.rows[0].count, 10);

    // Get achievements
    const achievementsResult = await query(
      `SELECT a.id, a.title, a.description, a.badge_icon, ua.unlocked_at 
       FROM achievements a
       JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = $1`,
      [user.id]
    );

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        totalScore: user.total_score,
        avatar: user.avatar,
        createdAt: user.created_at,
        totalWins,
        achievements: achievementsResult.rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          badgeIcon: row.badge_icon,
          unlockedAt: row.unlocked_at,
        })),
      },
    });
  } catch (err) {
    console.error('Error getting profile:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra trên hệ thống.' });
  }
};
