import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const refreshingRef = useRef(null);

  // Silently exchange the refresh token for a new access token.
  // Called by the interceptor below whenever a request 401s with an expired token,
  // so a user who's been logged in for days isn't kicked out mid-session.
  const doRefresh = async () => {
    if (refreshingRef.current) return refreshingRef.current;
    const storedRefresh = localStorage.getItem('refreshToken');
    if (!storedRefresh) throw new Error('No refresh token');
    refreshingRef.current = axios
      .post(`${API_URL}/api/auth/refresh`, { refreshToken: storedRefresh })
      .then(({ data }) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setToken(data.token);
        return data.token;
      })
      .finally(() => { refreshingRef.current = null; });
    return refreshingRef.current;
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
          original._retry = true;
          try {
            const newToken = await doRefresh();
            original.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(original);
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setToken(null);
            setUser(null);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_URL}/api/auth/me`).then((r) => setUser(r.data)).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    // Login is always direct now — no OTP step, for any role.
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const verifyLoginOtp = async (email, otp) => {
    const { data } = await axios.post(`${API_URL}/api/auth/verify-login-otp`, { email, otp });
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, extra = {}) => {
    const { data } = await axios.post(`${API_URL}/api/auth/register`, { name, email, password, ...extra });
    // Registration logs the user straight in — no OTP step.
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const verifyOtp = async (email, otp) => {
    const { data } = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const resendOtp = async (email) => {
    const { data } = await axios.post(`${API_URL}/api/auth/resend-otp`, { email });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, verifyLoginOtp, register, verifyOtp, resendOtp, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
