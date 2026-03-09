import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
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
        primary: 'bg-gradient-to-r from-vtherm-tertiary/80 to-vtherm-secondary/80 dark:to-vtherm-primary text-white hover:shadow-lg hover:shadow-[#00D9FF]/30 hover:scale-105',
        secondary: 'border-2 border-vtherm-tertiary text-vtherm-tertiary hover:bg-vtherm-quaternary/20 text-center',
        outline: 'border border-[#3a3a3a] text-[#ffffff] hover:border-[#7CFC00] hover:text-[#7CFC00]',
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm rounded-full',
        md: 'px-6 py-3 text-base rounded-full',
        lg: 'px-8 py-4 text-lg rounded-full',
    };

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
