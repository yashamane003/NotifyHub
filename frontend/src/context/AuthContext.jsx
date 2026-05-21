import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate state from LocalStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: jwt, id, name, email: userEmail, role } = response.data;

      const loggedUser = { id, name, email: userEmail, role };
      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      setToken(jwt);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please verify credentials.';
    }
  };

  const register = async (name, email, password, role = 'OPERATOR') => {
    try {
      await api.post('/auth/register', { name, email, password, role });
    } catch (error) {
      throw error.response?.data?.message || error.response?.data?.errors || 'Registration failed.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
