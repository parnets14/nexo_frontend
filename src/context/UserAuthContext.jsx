import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserAuthContext = createContext();

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
};

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (token) {
        console.log('Checking auth with token...');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Auth check response:', response.data);
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Store userId for easy access
        if (response.data.user?._id) {
          localStorage.setItem('userId', response.data.user._id);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/login/otp/verify`,
        credentials
      );
      localStorage.setItem('userToken', response.data.token);
      await checkAuth();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuth
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};

export default UserAuthContext;
