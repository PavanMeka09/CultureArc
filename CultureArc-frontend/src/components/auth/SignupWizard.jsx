import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../common/Input';
import OtpInput from '../common/OtpInput';
import Button from '../common/Button';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import PasswordRequirements from '../common/PasswordRequirements';

const SignupWizard = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [apiErrors, setApiErrors] = useState([]); // Store array of errors

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [signupToken, setSignupToken] = useState('');

    // Password Validation States
    const passwordRequirements = [
        { label: "At least 8 characters", valid: password.length >= 8 },
        { label: "At least one uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "At least one number", valid: /[0-9]/.test(password) },
        { label: "At least one special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const isPasswordValid = passwordRequirements.every(req => req.valid);

    const handleInitiateSignup = async (e) => {
        e.preventDefault();
        setError('');
        setApiErrors([]);
        setLoading(true);
        try {
            await api.post('/users/initiate-signup', { name, email });
            setStep(2);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setApiErrors([]);
        setLoading(true);
        try {
            const { data } = await api.post('/users/verify-signup-otp', { email, otp });
            setSignupToken(data.signupToken);
            setStep(3);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteSignup = async (e) => {
        e.preventDefault();
        setError('');
        setApiErrors([]);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            return;
        }

        setLoading(true);
        try {
            // Register user
            const { data } = await api.post('/users/complete-signup', {
                signupToken,
                password
            });

            // Auto login user
            setAuth(data);
            navigate('/');

        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApiError = (err) => {
        if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
            // Strip the "field: " prefix from messages for cleaner UI
            const cleanErrors = err.response.data.errors.map(msg => msg.replace(/^[^:]+:\s*/, ''));
            setApiErrors(cleanErrors);
        } else {
            setError(err.response?.data?.message || 'Something went wrong.');
        }
    };

    return (
        <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-lg p-8 border border-slate-100 dark:border-slate-800">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                {step === 1 && 'Create Account'}
                {step === 2 && 'Verify Email'}
                {step === 3 && 'Set Password'}
            </h1>

            <p className="text-slate-600 dark:text-slate-400 mb-6 text-center text-sm">
                {step === 1 && 'Enter your details to get started'}
                {step === 2 && `We sent a code to ${email}`}
                {step === 3 && 'Secure your account'}
            </p>

            {/* General Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Specific API Errors */}
            {apiErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                    <ul className="list-disc list-inside">
                        {apiErrors.map((err, index) => (
                            <li key={index}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {step === 1 && (
                <form onSubmit={handleInitiateSignup} className="space-y-4">
                    <Input
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                    <Button type="submit" variant="primary" className="w-full justify-center mt-6" loading={loading}>
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <OtpInput
                        length={6}
                        value={otp}
                        onChange={(val) => setOtp(val)}
                    />
                    <Button type="submit" variant="primary" className="w-full justify-center mt-6" loading={loading}>
                        Verify Email <Check className="w-4 h-4 ml-2" />
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
                <form onSubmit={handleCompleteSignup} className="space-y-4">
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        required
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                    />
                    <PasswordRequirements password={password} />

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center mt-6"
                        loading={loading}
                        disabled={!isPasswordValid || password !== confirmPassword}
                    >
                        Create Account
                    </Button>
                </form>
            )}

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                    Log in
                </Link>
            </p>
        </div>
    );
};

export default SignupWizard;
