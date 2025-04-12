// ProtectedRoutes.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';

const ProtectedRoute = ({ element }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await isAuthenticated();
      setAllowed(result);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem'
      }}>
        <div className="spinner"></div>
        <span style={{ marginLeft: '0.75rem' }}>Checking authentication...</span>
      </div>
    );
  }

  return allowed ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
