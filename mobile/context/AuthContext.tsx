import React, { createContext, useContext, useEffect, useState } from 'react';
import { setItemAsync, getItemAsync, deleteItemAsync } from '../utils/storage';
import api from '../utils/axiosConfig';

type AuthContextType = {
  user: any;
  loading: boolean;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await getItemAsync('token');
      if (token) {
        const res = await api.get('/api/auth/me');
        setUser(res.data);
      }
    } catch (error) {
      console.log('No valid token found');
      await deleteItemAsync('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, userData: any) => {
    await setItemAsync('token', token);
    setUser(userData);
  };

  const logout = async () => {
    await deleteItemAsync('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
