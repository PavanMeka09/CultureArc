import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-20 py-8 border-t border-border-light dark:border-border-dark">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">© 2025 CultureArc. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <a className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent transition-colors" href="#">About Us</a>
                    <a className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent transition-colors" href="#">Contact</a>
                    <a className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent transition-colors" href="#">Privacy Policy</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
