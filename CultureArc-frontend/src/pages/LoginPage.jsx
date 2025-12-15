import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            // Handle validation errors from Zod
            const message = err.response?.data?.errors?.[0] || err.response?.data?.message || 'Failed to login';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-lg p-8 border border-slate-100 dark:border-slate-800">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Welcome Back</h1>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" variant="primary" className="w-full justify-center mt-6" loading={loading}>
                        Sign In
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
