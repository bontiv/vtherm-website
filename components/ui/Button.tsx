import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-gradient-to-r from-[#00D9FF] to-[#00BCD4] text-white hover:shadow-lg hover:shadow-[#00D9FF]/30 hover:scale-105',
        secondary: 'border-2 border-[#7CFC00] text-[#7CFC00] hover:bg-[#7CFC00]/10',
        outline: 'border border-[#3a3a3a] text-[#ffffff] hover:border-[#7CFC00] hover:text-[#7CFC00]',
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm rounded-full',
        md: 'px-6 py-3 text-base rounded-full',
        lg: 'px-8 py-4 text-lg rounded-full',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
