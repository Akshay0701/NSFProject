import React from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';
import useLoginPage from '../../hooks/useLoginPage';

const LoginPage = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    showPassword,
    togglePasswordVisibility,
    handleLogin,
  } = useLoginPage();

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-illustration">
          <div className="illustration-content">
            <h1>Welcome to ResearchConnect</h1>
            <p>Collaborate with researchers worldwide to create impactful projects</p>
            <div className="illustration-image">
              <span role="img" aria-label="Science illustration">🔬</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="card-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to continue your research collaboration</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  className="input-field"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? (
                "Signing in..."
              ) : (
                'Sign In'
              )}
            </button>

            <div className="social-login">
              <p className="divider"><span>Or continue with</span></p>
              <div className="social-buttons">
                <button type="button" className="social-button google">G</button>
                <button type="button" className="social-button microsoft">M</button>
                <button type="button" className="social-button orcid">O</button>
              </div>
            </div>

            <p className="redirect-link">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
