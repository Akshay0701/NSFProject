// src/hooks/useForgotPassword.js
import { useState, useCallback, useMemo } from 'react';
import authService from '../services/authService';

// --- Password Strength Validation ---
const hasNumber = (value) => new RegExp(/[0-9]/).test(value);
const hasMixed = (value) => new RegExp(/[a-z]/).test(value) && new RegExp(/[A-Z]/).test(value);
const hasSpecial = (value) => new RegExp(/[!#@$%^&*)(+=._-]/).test(value);
const MIN_LENGTH = 8;

const checkPasswordStrength = (password) => {
    const checks = {
        length: password.length >= MIN_LENGTH,
        number: hasNumber(password),
        mixedCase: hasMixed(password),
        specialChar: hasSpecial(password),
    };
    const strength = Object.values(checks).filter(Boolean).length;
    const allMet = strength === Object.keys(checks).length;
    return { checks, strength, allMet };
};
// --- ---

export function useForgotPassword() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [step, setStep] = useState('initial'); // 'initial' | 'confirm' | 'success'
    const [isLoadingInitiate, setIsLoadingInitiate] = useState(false);
    const [isLoadingConfirm, setIsLoadingConfirm] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(''));
    const passwordsMatch = useMemo(() => {
        return newPassword && newPassword === confirmPassword;
    }, [newPassword, confirmPassword]);

    // --- Handlers ---
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleCodeChange = (e) => setCode(e.target.value);

    const handleNewPasswordChange = (e) => {
        const currentPassword = e.target.value;
        setNewPassword(currentPassword);
        setPasswordStrength(checkPasswordStrength(currentPassword));
    };

    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

    const handleSendCode = useCallback(async (e) => {
        if (e) e.preventDefault(); // Prevent form submission if used in a form
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        setIsLoadingInitiate(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await authService.initiateForgotPassword(email);
            setSuccessMessage(response.message || 'Password reset code sent. Check your email.');
            setStep('confirm'); // Move to the next step
        } catch (err) {
            setError(err.message || 'Failed to send reset code.');
        } finally {
            setIsLoadingInitiate(false);
        }
    }, [email]);

    const handleResetPassword = useCallback(async (e) => {
        if (e) e.preventDefault(); // Prevent form submission

        // Client-side validation before API call
        if (!code || !newPassword || !confirmPassword) {
            setError('Please fill in the code, new password, and confirm password.');
            return;
        }
        if (!passwordsMatch) {
            setError('Passwords do not match.');
            return;
        }
        if (!passwordStrength.allMet) {
             setError('Password does not meet all strength requirements.');
             return;
        }

        setIsLoadingConfirm(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await authService.confirmResetPassword(email, code, newPassword);
            setSuccessMessage(response.message || 'Password successfully reset!');
            setStep('success'); // Indicate success
            // Optionally clear fields or navigate away after a delay
            // setEmail(''); setCode(''); setNewPassword(''); setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Failed to reset password.');
             // Keep step as 'confirm' on failure so user can retry
        } finally {
            setIsLoadingConfirm(false);
        }
    }, [email, code, newPassword, confirmPassword, passwordsMatch, passwordStrength.allMet]);

    return {
        // State
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

        // Handlers
        handleEmailChange,
        handleCodeChange,
        handleNewPasswordChange,
        handleConfirmPasswordChange,
        handleSendCode,
        handleResetPassword,
    };
}