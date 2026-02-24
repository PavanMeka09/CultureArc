import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Check, ArrowRight, Lock } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import OtpInput from '../components/common/OtpInput';
import PasswordRequirements from '../components/common/PasswordRequirements';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await api.post('/users/forgot-password', { email });
            setMessage(`We sent a code to ${email}`);
            setStep(2);
        } catch (err) {
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                const cleanErrors = err.response.data.errors.map(msg => msg.replace(/^[^:]+:\s*/, ''));
                setError(cleanErrors.join('. '));
            } else {
                setError(err.response?.data?.message || 'Failed to send reset code');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/users/verify-reset-otp', { email, otp });
            setResetToken(data.resetToken);
            setStep(3);
        } catch (err) {
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                const cleanErrors = err.response.data.errors.map(msg => msg.replace(/^[^:]+:\s*/, ''));
                setError(cleanErrors.join('. '));
            } else {
                setError(err.response?.data?.message || 'Invalid code');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password complexity
        const isPasswordValid =
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/reset-password', {
                resetToken,
                password
            });
            // Success
            setMessage('Password reset successfully! You can now login.');
            setStep(4); // Success state
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                const cleanErrors = err.response.data.errors.map(msg => msg.replace(/^[^:]+:\s*/, ''));
                setError(cleanErrors.join('. ')); // Display as dot-separated string for simplicity in this layout
            } else {
                setError(err.response?.data?.message || 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link
                    to="/login"
                    className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Login</span>
                </Link>

                <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                            {step === 3 ? (
                                <Lock className="h-6 w-6 text-primary" />
                            ) : (
                                <Mail className="h-6 w-6 text-primary" />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {step === 1 && 'Forgot Password?'}
                            {step === 2 && 'Verify Email'}
                            {step === 3 && 'New Password'}
                            {step === 4 && 'All Done!'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {step === 1 && "Enter your email and we'll send you a reset code."}
                            {step === 2 && `Enter the 6-digit code sent to ${email}`}
                            {step === 3 && "Create a secure new password for your account."}
                            {step === 4 && "Your password has been reset successfully."}
                        </p>
                    </div>

                    {message && step !== 4 && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm mb-6">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                            <Button type="submit" variant="primary" className="w-full" loading={loading}>
                                Send Reset Code <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <OtpInput
                                length={6}
                                value={otp}
                                onChange={(val) => setOtp(val)}
                            />
                            <Button type="submit" variant="primary" className="w-full" loading={loading}>
                                Verify Code <Check className="ml-2 h-4 w-4" />
                            </Button>
                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    Change Email
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <Input
                                label="New Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="******"
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="******"
                                required
                            />
                            <PasswordRequirements password={password} />

                            <Button type="submit" variant="primary" className="w-full" loading={loading}>
                                Reset Password <Check className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    )}

                    {step === 4 && (
                        <div className="text-center">
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => navigate('/login')}
                            >
                                Back to Login
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
