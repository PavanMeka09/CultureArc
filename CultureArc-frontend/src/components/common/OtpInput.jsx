import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const OtpInput = ({ length = 6, value, onChange }) => {
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, e) => {
        const val = e.target.value;
        if (isNaN(val)) return;

        const newOtp = value.split('');
        // Allow only the last entered character if multiple are present (though maxLength handles this mostly)
        newOtp[index] = val.substring(val.length - 1);
        const newValue = newOtp.join('');
        onChange(newValue);

        // Move to next input if value is entered
        if (val && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !value[index] && index > 0 && inputRefs.current[index - 1]) {
            // Move back on backspace if current is empty
            inputRefs.current[index - 1].focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
        if (!/^\d+$/.test(pastedData)) return;

        onChange(pastedData);

        // Focus either the last filled index or the end
        const nextFocusInfo = Math.min(pastedData.length, length - 1);
        if (inputRefs.current[nextFocusInfo]) {
            inputRefs.current[nextFocusInfo].focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center w-full" onPaste={handlePaste}>
            {Array.from({ length }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="relative"
                >
                    <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={value[index] || ''}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`
                            w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200
                            bg-white dark:bg-card-dark
                            text-slate-800 dark:text-white
                            ${value[index]
                                ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                                : 'border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:shadow-md'
                            }
                        `}
                    />
                    {/* Animated underscore or indicator for active input could go here if requested, but box styling is cleaner */}
                </motion.div>
            ))}
        </div>
    );
};

export default OtpInput;
