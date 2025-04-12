import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const useRegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const registerUser = async (email, password) => {
    try {
      const data = await authService.register(email, password);
      toast.success('Registration successful! Please log in.');
      localStorage.setItem('authToken', data.tokens.AccessToken);
      localStorage.setItem('refreshToken', data.tokens.RefreshToken);
      localStorage.setItem('userEmail', email); // store token if needed
      navigate('/intro');
    } catch (error) {
      console.error('Register error:', error.message);
      toast.error(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
  
    // Empty fields check
    if (!trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      toast.error('Please fill out all fields.');
      return;
    }
  
    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
  
    // Password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(trimmedPassword)) {
      toast.error(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
      );
      return;
    }
  
    // Confirm password match
    if (trimmedPassword !== trimmedConfirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
  
    try {
      setLoading(true);
      await registerUser(trimmedEmail, trimmedPassword);
    } finally {
      setLoading(false);
    }
  };
  

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  return {
    email,
    password,
    confirmPassword,
    setEmail,
    setPassword,
    setConfirmPassword,
    loading,
    showPassword,
    showConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    handleRegister,
    registerUser,
  };
};

export default useRegisterPage;
