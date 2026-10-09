import {
  useEffect,
  useState
} from 'react';

import { AuthContext } from './useAuth';

const USER_KEY = 'touristo_user';
const TOKEN_KEY = 'touristo_token';

const getInitialUser = () => {
  const storedUser = localStorage.getItem(USER_KEY);
  const storedToken = localStorage.getItem(TOKEN_KEY);

  if (!storedUser || !storedToken) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(storedUser);

    if (parsedUser && parsedUser.id) {
      return parsedUser;
    }
  } catch (error) {
    console.error(
      'Error parsing stored user:',
      error
    );
  }

  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);

  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const loading = false;

  // A 401 from the API means the session is no longer valid
  // (expired or revoked token). End it exactly once.
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    };

    window.addEventListener('touristo:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('touristo:unauthorized', handleUnauthorized);
  }, []);

  const login = (userData, token) => {
    if (!userData || !token) {
      console.error(
        'Login failed: user data or token missing.'
      );
      return;
    }

    setUser(userData);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(userData)
    );

    localStorage.setItem(
      TOKEN_KEY,
      token
    );
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const getAuthHeader = () => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`
    };
  };

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const value = {
    user,
    login,
    logout,
    getAuthHeader,
    getToken,
    loading,
    isAuthenticated: !!user,
    isHost: user?.role === 'host',
    isTraveler: user?.role === 'traveler'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
