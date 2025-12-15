import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        try {
            const { data } = await api.post('/users/forgot-password', { email });
            setMessage('Password reset instructions have been sent to your email.');
            // In development, show the token (remove in production)
            if (data.resetToken) {
                setMessage(`Reset link: /reset-password/${data.resetToken}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request');
        } finally {
            setIsSubmitting(false);
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
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    {message && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm mb-6">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            loading={isSubmitting}
                        >
                            Send Reset Link
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
