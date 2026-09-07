import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const USER_KEY = 'touristo_user';
  const TOKEN_KEY = 'touristo_token';

  useEffect(() => {
    const storedUser =
      localStorage.getItem(USER_KEY);

    const storedToken =
      localStorage.getItem(TOKEN_KEY);

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && parsedUser.id) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch (error) {
        console.error(
          'Error parsing stored user:',
          error
        );

        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }

    setLoading(false);
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