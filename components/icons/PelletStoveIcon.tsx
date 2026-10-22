import React from 'react';

/** Pellet stove, outline style matching Heroicons 24px */
export const PelletStoveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" {...props}>
        <path strokeLinejoin="round" d="M13.5 6.5V2.5h3v4" />
        <rect x="5" y="6.5" width="14" height="13.5" rx="1.5" />
        <rect x="8" y="9.5" width="8" height="7.5" rx="1" />
        <path strokeLinejoin="round" d="M12 15.5c-1.2 0-1.75-.8-1.75-1.7 0-1.3 1.05-1.9 1.75-3 .7 1.1 1.75 1.7 1.75 3 0 .9-.55 1.7-1.75 1.7Z" />
        <path strokeLinecap="round" d="M7 20v1.5M17 20v1.5" />
    </svg>
);
