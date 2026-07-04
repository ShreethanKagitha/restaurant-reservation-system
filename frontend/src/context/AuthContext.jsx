import React, { createContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore user session on application load
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          
          // Verify session with server in background
          const response = await authApi.getMe();
          if (response.success && response.data.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Token is likely invalid or expired; clean up
          handleSessionClear();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const handleSessionClear = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Log in user (Step 1)
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);
      
      if (response.success && response.data) {
        if (response.data.requires2FA) {
          // Return the 2FA requirement to the UI so it can switch forms
          return { success: true, requires2FA: true, email: response.data.email, message: response.message };
        }

        const { user: loggedUser, token: sessionToken } = response.data;
        
        localStorage.setItem('token', sessionToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        
        setToken(sessionToken);
        setUser(loggedUser);
        setIsAuthenticated(true);
        return { success: true, message: response.message || 'Login successful' };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      handleSessionClear();
      const message = error.response?.data?.message || 'Invalid email or password';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP (Step 2)
   */
  const verifyOTP = async (data) => {
    try {
      setLoading(true);
      const response = await authApi.verifyOTP(data);
      if (response.success && response.data) {
        const { user: loggedUser, token: sessionToken } = response.data;
        
        localStorage.setItem('token', sessionToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        
        setToken(sessionToken);
        setUser(loggedUser);
        setIsAuthenticated(true);
        return { success: true, message: response.message || '2FA Verification successful' };
      }
      return { success: false, message: response.message || 'Verification failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid or expired OTP';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new Customer user
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authApi.register(userData);
      if (response.success && response.data) {
        const { user: registeredUser, token: sessionToken } = response.data;

        localStorage.setItem('token', sessionToken);
        localStorage.setItem('user', JSON.stringify(registeredUser));

        setToken(sessionToken);
        setUser(registeredUser);
        setIsAuthenticated(true);
        return { success: true, message: response.message || 'Registration successful' };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      handleSessionClear();
      // Extract validator fields error messages if present
      const errors = error.response?.data?.errors;
      const message = errors && errors.length > 0
        ? errors[0].message
        : (error.response?.data?.message || 'Registration failed. Please check inputs.');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user
   */
  const logout = () => {
    handleSessionClear();
  };

  /**
   * Manual session status check
   */
  const checkAuth = async () => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return true;
      }
      return false;
    } catch (error) {
      handleSessionClear();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        verifyOTP,
        logout,
        register,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
