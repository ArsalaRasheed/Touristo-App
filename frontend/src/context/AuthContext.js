import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('touristo_user');
    const storedToken = localStorage.getItem('touristo_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('touristo_user', JSON.stringify(userData));
    localStorage.setItem('touristo_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('touristo_user');
    localStorage.removeItem('touristo_token');
  };

  // Function to get the authorization header with token
  const getAuthHeader = () => {
    const token = localStorage.getItem('touristo_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const value = {
    user,
    login,
    logout,
    getAuthHeader,
    loading,
    isAuthenticated: !!user,
    isHost: user?.role === 'host',
    isTraveler: user?.role === 'traveler'
  };

  return React.createElement(
    AuthContext.Provider,
    { value: value },
    children
  );
};