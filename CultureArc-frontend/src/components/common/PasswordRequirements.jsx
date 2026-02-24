import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordRequirements = ({ password }) => {
    const requirements = [
        { label: "At least 8 characters", valid: password.length >= 8 },
        { label: "At least one uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "At least one number", valid: /[0-9]/.test(password) },
        { label: "At least one special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    return (
        <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Password Requirements
            </p>
            {requirements.map((req, idx) => (
                <div key={idx} className={`flex items-center text-xs transition-colors duration-200 ${req.valid ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 border transition-colors duration-200 ${req.valid
                        ? 'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800'
                        : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                        }`}>
                        {req.valid ? (
                            <Check className="w-3 h-3" />
                        ) : (
                            <X className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        )}
                    </div>
                    <span>{req.label}</span>
                </div>
            ))}
        </div>
    );
};

export default PasswordRequirements;
