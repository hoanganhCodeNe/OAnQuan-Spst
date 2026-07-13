import React, { createContext, useState, useEffect, useContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  totalScore: number;
  avatar: string;
  createdAt: string;
  totalWins?: number;
  achievements?: Array<{
    id: number;
    title: string;
    description: string;
    badgeIcon: string;
    unlockedAt: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  registerUser: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  apiUrl: string;
  playAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const VITE_API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentToken: string) => {
    if (currentToken === 'guest-token') {
      setUser({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Khách',
        email: 'guest@guest.com',
        totalScore: 0,
        avatar: 'default',
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${VITE_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const registerUser = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const playAsGuest = () => {
    const guestUser: User = {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Khách',
      email: 'guest@guest.com',
      totalScore: 0,
      avatar: 'default',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('token', 'guest-token');
    setToken('guest-token');
    setUser(guestUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token && token !== 'guest-token') {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerUser,
        logout,
        refreshUser,
        playAsGuest,
        apiUrl: VITE_API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
