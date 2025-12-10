import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <header className="flex items-center justify-between whitespace-nowrap py-6">
            <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-3">
                    <div className="size-6 text-primary">
                        <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"></path>
                        </svg>
                    </div>
                    <h2 className="text-text-light dark:text-text-dark text-xl font-bold tracking-tight">CultureArc</h2>
                </Link>
            </div>
            <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
                <Link className={`text-sm font-medium hover:text-primary dark:hover:text-accent ${location.pathname === '/explore' ? 'text-primary dark:text-accent' : 'text-text-light dark:text-text-dark'}`} to="/explore">Explore</Link>
                <Link className={`text-sm font-medium hover:text-primary dark:hover:text-accent ${location.pathname === '/collections' ? 'text-primary dark:text-accent' : 'text-text-light dark:text-text-dark'}`} to="/collections">Collections</Link>
                <Link className={`text-sm font-medium hover:text-primary dark:hover:text-accent ${location.pathname === '/upload' ? 'text-primary dark:text-accent' : 'text-text-light dark:text-text-dark'}`} to="/upload">Upload</Link>
            </nav>
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {user.name}
                        </span>
                        <Link to="/profile" className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 text-text-light dark:text-text-dark border-2 border-transparent hover:border-primary transition-all">
                            <User size={24} />
                        </Link>
                        <button
                            onClick={logout}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button variant="primary" size="sm">Sign Up</Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
