import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const email = localStorage.getItem('userEmail');

  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const isTokenValid = Date.now() < decoded.exp * 1000;

    if (isTokenValid) {
      return true;
    }

    // Attempt token refresh
    if (refreshToken && email) {
      return refreshSession(email, refreshToken);
    }

    return false;
  } catch {
    return false;
  }
};

const refreshSession = async (email, refreshToken) => {
  try {
    const data = await authService.refreshToken(email, refreshToken);
    localStorage.setItem('authToken', data.tokens.AccessToken);
    localStorage.setItem('idToken', data.tokens.IdToken || '');
    return true;
  } catch (err) {
    logout();
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');
};
