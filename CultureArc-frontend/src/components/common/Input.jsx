import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    label,
    error,
    id,
    icon: Icon,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="flex flex-col w-full gap-1.5">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    id={id}
                    type={inputType}
                    className={`
                        w-full rounded-lg bg-white dark:bg-background-dark border
                        ${error ? 'border-red-500 focus:ring-red-500' : 'border-border-light dark:border-border-dark focus:ring-primary/50'}
                        ${Icon ? 'pl-10' : 'px-4'} 
                        ${isPassword ? 'pr-10' : 'pr-4'} 
                        py-2.5
                        text-text-light dark:text-text-dark
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${props.className || ''}
                    `}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:text-slate-600 p-1"
                        tabIndex="-1"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default Input;
