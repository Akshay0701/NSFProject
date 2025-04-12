import React from 'react';
import { Link } from 'react-router-dom';
import './RegisterPage.css';
import useRegisterPage from '../../hooks/useRegisterPage';

const RegisterPage = () => {
  const {
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
    handleRegister
  } = useRegisterPage();

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-illustration">
          <div className="illustration-content">
            <h1>Join ResearchConnect</h1>
            <p>Start collaborating with researchers worldwide</p>
            <div className="illustration-image">
              <span role="img" aria-label="Team collaboration">👥</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="card-header">
            <h1 className="login-title">Create Account</h1>
            <p className="login-subtitle">Get started with your research journey</p>
          </div>

          <form className="login-form" onSubmit={handleRegister}>
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
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className="input-field"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleShowConfirmPassword}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="terms-agreement">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? (
                <span className="loading-indicator">
                  <span className="loading-spinner" /> Creating account...
                </span>
              ) : (
                'Register'
              )}
            </button>

            <p className="redirect-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;