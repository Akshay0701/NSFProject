// src/pages/ForgotPasswordPage.jsx
import React from 'react';
import './ForgetPasswordPage.css'; // Updated CSS file with unique class names
import { useForgotPassword } from '../../hooks/useForgetPassword';

// Helper component for Password Strength Indicator
const PasswordStrengthIndicator = ({ strengthChecks }) => {
    const criteria = [
        { label: `At least 8 characters`, met: strengthChecks.length },
        { label: 'Uppercase & Lowercase letters', met: strengthChecks.mixedCase },
        { label: 'At least one number', met: strengthChecks.number },
        { label: 'At least one special character (!#@$..)', met: strengthChecks.specialChar },
    ];

    return (
        <div className="fp-password-strength">
            <p>Password must contain:</p>
            <ul>
                {criteria.map((item, index) => (
                    <li key={index} className={item.met ? 'fp-met' : 'fp-unmet'}>
                        {item.met ? '✓' : '✗'} {item.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

function ForgotPasswordPage() {
    const {
        email,
        code,
        newPassword,
        confirmPassword,
        step,
        isLoadingInitiate,
        isLoadingConfirm,
        error,
        successMessage,
        passwordStrength,
        passwordsMatch,
        handleEmailChange,
        handleCodeChange,
        handleNewPasswordChange,
        handleConfirmPasswordChange,
        handleSendCode,
        handleResetPassword,
    } = useForgotPassword();

    return (
        <div className="fp-container">
            <h2>Forgot Password</h2>

            {/* Step 1: Enter Email */}
            {step === 'initial' && (
                <form onSubmit={handleSendCode} className="fp-form">
                    <p>Enter your email address to receive a password reset code.</p>
                    <div className="fp-form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            disabled={isLoadingInitiate}
                            placeholder="your.email@example.com"
                        />
                    </div>

                    {error && <p className="fp-error-message">{error}</p>}


                    <button className='login-button' type="submit" disabled={isLoadingInitiate}>
                        {isLoadingInitiate ? 'Sending Code...' : 'Send Reset Code'}
                    </button>
                </form>
            )}

            {/* Step 2: Enter Code and New Password */}
            {(step === 'confirm' || step === 'success') && (
                <form onSubmit={handleResetPassword} className="fp-reset-form">
                    {step === 'confirm' && !successMessage && (
                        <p>
                            A reset code has been sent to <strong>{email}</strong>. Please enter the code and your new password below.
                        </p>
                    )}
                    {/* Display Success/Error Messages */}
                    {error && <p className="fp-error-message">{error}</p>}
                    {successMessage && <p className="fp-success-message">{successMessage}</p>}

                    {/* Only show inputs if not yet successfully reset */}
                    {step !== 'success' && (
                        <>
                            <div className="fp-form-group">
                                <label htmlFor="code">Confirmation Code</label>
                                <input
                                    type="text"
                                    id="code"
                                    value={code}
                                    onChange={handleCodeChange}
                                    required
                                    disabled={isLoadingConfirm}
                                    placeholder="Enter code from email"
                                />
                            </div>

                            <div className="fp-form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={handleNewPasswordChange}
                                    required
                                    disabled={isLoadingConfirm}
                                />
                            </div>

                            {/* Show strength indicator only when password field is interacted with */}
                            {newPassword && <PasswordStrengthIndicator strengthChecks={passwordStrength.checks} />}

                            <div className="fp-form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    required
                                    disabled={isLoadingConfirm}
                                />
                                {confirmPassword && !passwordsMatch && (
                                    <p className="fp-error-message" style={{ marginTop: '5px' }}>
                                        Passwords do not match.
                                    </p>
                                )}
                                {confirmPassword && passwordsMatch && newPassword && (
                                    <p className="fp-success-message" style={{ marginTop: '5px' }}>
                                        ✓ Passwords match.
                                    </p>
                                )}
                            </div>

                            <button className='login-button' type="submit" disabled={isLoadingConfirm || !passwordStrength.allMet || !passwordsMatch}>
                                {isLoadingConfirm ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </>
                    )}

                    {/* Optionally, add a link back to login on success */}
                    {step === 'success' && (
                        <div style={{ marginTop: '20px' }}>
                            <a href="/login">Go to Login</a> {/* Replace with React Router Link if using Router */}
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}

export default ForgotPasswordPage;