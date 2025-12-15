import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { path: '/explore', label: 'Explore' },
        { path: '/collections', label: 'Collections' },
        { path: '/upload', label: 'Upload' },
    ];

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
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

                {/* Desktop Navigation */}
                <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
                    {navLinks.map(({ path, label }) => (
                        <Link
                            key={path}
                            className={`text-sm font-medium hover:text-primary dark:hover:text-accent ${location.pathname === path ? 'text-primary dark:text-accent' : 'text-text-light dark:text-text-dark'}`}
                            to={path}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Desktop User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Log In</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="primary" size="sm">Sign Up</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobileMenu}
                            className="md:hidden fixed inset-0 bg-black/50 z-40"
                        />

                        {/* Slide-out Menu */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="md:hidden fixed top-0 right-0 bottom-0 w-72 bg-card-light dark:bg-card-dark shadow-2xl z-50 p-6"
                        >
                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={closeMobileMenu}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Mobile Nav Links */}
                            <nav className="flex flex-col gap-2 mb-8">
                                {navLinks.map(({ path, label }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        onClick={closeMobileMenu}
                                        className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${location.pathname === path
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Mobile User Section */}
                            <div className="border-t border-border-light dark:border-border-dark pt-6">
                                {user ? (
                                    <div className="flex flex-col gap-4">
                                        <Link
                                            to="/profile"
                                            onClick={closeMobileMenu}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                <p className="text-sm text-slate-500">View Profile</p>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => { logout(); closeMobileMenu(); }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut size={20} />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link to="/login" onClick={closeMobileMenu}>
                                            <Button variant="outline" className="w-full justify-center">Log In</Button>
                                        </Link>
                                        <Link to="/signup" onClick={closeMobileMenu}>
                                            <Button variant="primary" className="w-full justify-center">Sign Up</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
