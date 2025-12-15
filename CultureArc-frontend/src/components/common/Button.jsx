import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    className = '',
    icon: Icon
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-white hover:bg-opacity-90 focus:ring-primary shadow-md hover:shadow-lg",
        secondary: "bg-card-light dark:bg-card-dark text-slate-700 dark:text-slate-200 border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-500",
        outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary",
        ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
        accent: "bg-accent text-white hover:bg-opacity-90 focus:ring-accent shadow-md hover:shadow-lg",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "p-2",
    };

    const isDisabled = disabled || loading;

    return (
        <motion.button
            whileHover={{ scale: isDisabled ? 1 : 1.02 }}
            whileTap={{ scale: isDisabled ? 1 : 0.98 }}
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            onClick={onClick}
            disabled={isDisabled}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>{children}</span>
                </>
            ) : (
                <>
                    {Icon && <Icon className={`mr-2 h-5 w-5 ${size === 'icon' ? 'mr-0' : ''}`} />}
                    {children}
                </>
            )}
        </motion.button>
    );
};

export default Button;
