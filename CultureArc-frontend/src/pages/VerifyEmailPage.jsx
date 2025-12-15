import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';

const VerifyEmailPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const { data } = await api.get(`/users/verify/${token}`);
                setStatus('success');
                setMessage(data.message || 'Your email has been verified successfully!');
                // Redirect to login after 3 seconds
                setTimeout(() => navigate('/login'), 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
            }
        };

        if (token) {
            verifyEmail();
        } else {
            setStatus('error');
            setMessage('No verification token provided.');
        }
    }, [token, navigate]);

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-lg p-8 border border-slate-100 dark:border-slate-800 text-center">
                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Verifying Your Email
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Please wait while we verify your email address...
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Email Verified!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            {message}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                            Redirecting to login...
                        </p>
                        <Link to="/login">
                            <Button variant="primary" className="w-full justify-center">
                                Go to Login
                            </Button>
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Verification Failed
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            {message}
                        </p>
                        <div className="space-y-3">
                            <Link to="/verify-email-pending" className="block">
                                <Button variant="primary" className="w-full justify-center">
                                    Resend Verification Email
                                </Button>
                            </Link>
                            <Link to="/login" className="block">
                                <Button variant="secondary" className="w-full justify-center">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
