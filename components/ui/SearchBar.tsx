'use client';

import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onSearch?: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search...',
    onSearch,
    className = '',
    ...props
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]">
                <MagnifyingGlassIcon className="w-[18px] h-[18px]" />
            </div>
            <input
                type="search"
                className="
          w-full pl-10 pr-4 py-2.5
          bg-[#1f1f23]
          border border-[#3a3a3a]
          rounded-lg
          text-[#ffffff] text-sm
          placeholder:text-[#71717a]
          transition-all duration-200
          focus:outline-none
          focus:border-[#00D9FF]
          focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]
          hover:border-[#a1a1aa]
        "
                placeholder={placeholder}
                onChange={handleChange}
                {...props}
            />
        </div>
    );
};
