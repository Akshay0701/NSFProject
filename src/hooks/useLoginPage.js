import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const useLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const loginUser = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      toast.success('Login successful!');
      localStorage.setItem('authToken', data.tokens.AccessToken); 
      localStorage.setItem('refreshToken', data.tokens.RefreshToken);
      localStorage.setItem('userEmail', email); 
      navigate('/intro');
    } catch (error) {
      console.error('Login error:', error.message);
      toast.error(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    // Basic validations
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
  
    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
  
    // Password strength (at least 6 characters, you can customize)
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
  
    try {
      setLoading(true);
      await loginUser(email, password);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async() => {
    const email = localStorage.getItem('userEmail');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!email || !refreshToken) {
      toast.error('Missing refresh token or user email');
      return false;
    }

    try {
      const data = await authService.refreshToken(email, refreshToken);
      localStorage.setItem('authToken', data.tokens.AccessToken);
      localStorage.setItem('idToken', data.tokens.IdToken || '');
      toast.success('Session refreshed');
      return true;
    } catch (error) {
      console.error('Token refresh error:', error.message);
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userEmail');
      return false;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    showPassword,
    togglePasswordVisibility,
    handleLogin,
    refreshToken,
  };
};

export default useLoginPage;
