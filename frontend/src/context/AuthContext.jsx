import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import authService from '../services/authService';

// Initialize context
const AuthContext = createContext(null);

// Configure global Axios request interceptor to automatically attach authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on page load / mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await authService.getMe();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session initialization failed:', err.message);
          logout();
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  /**
   * Authenticate admin session
   * @param {string} email 
   * @param {string} password 
   */
  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    if (response.success) {
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.data);
      setIsAuthenticated(true);
      return response;
    }
  };

  /**
   * Register a new admin account
   * @param {string} username 
   * @param {string} email 
   * @param {string} password 
   */
  const register = async (username, email, password, role, secretKey) => {
    const response = await authService.register({ username, email, password, role, secretKey });
    if (response.success) {
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.data);
      setIsAuthenticated(true);
      return response;
    }
  };

  /**
   * Log out session & wipe tokens
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to consume AuthContext easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed inside an AuthProvider');
  }
  return context;
};
