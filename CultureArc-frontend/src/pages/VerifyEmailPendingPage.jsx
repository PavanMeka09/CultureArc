import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const VerifyEmailPendingPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleResend = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/users/resend-verification', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send verification email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-lg p-8 border border-slate-100 dark:border-slate-800">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Verify Your Email
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                    </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                        <strong>Didn't receive the email?</strong> Check your spam folder or enter your email below to resend the verification link.
                    </p>
                </div>

                {success ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-green-800 dark:text-green-200 text-sm">
                            Verification email sent! Please check your inbox.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleResend} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

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
                            className="w-full justify-center"
                            loading={loading}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Resend Verification Email
                        </Button>
                    </form>
                )}

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Already verified?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPendingPage;
