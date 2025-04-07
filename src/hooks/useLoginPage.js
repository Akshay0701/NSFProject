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
      localStorage.setItem('authToken', data.tokens.AccessToken); // store token if needed
      localStorage.setItem('userEmail', email); // store token if needed
      navigate('/intro');
    } catch (error) {
      console.error('Login error:', error.message);
      toast.error(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    await loginUser(email, password);
    setLoading(false);
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
  };
};

export default useLoginPage;
