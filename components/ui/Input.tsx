import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-4 py-3 
          bg-[#1f1f23] 
          border border-[#3a3a3a] 
          rounded-lg 
          text-[#ffffff] 
          placeholder:text-[#71717a]
          transition-all duration-200
          focus:outline-none 
          focus:border-[#00D9FF] 
          focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]
          hover:border-[#a1a1aa]
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};
