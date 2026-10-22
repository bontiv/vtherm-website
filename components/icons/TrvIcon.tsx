import React from 'react';

/** Thermostatic radiator valve, outline style matching Heroicons 24px */
export const TrvIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" {...props}>
        <rect x="8" y="2.5" width="8" height="10.5" rx="2" />
        <path strokeLinecap="round" d="M10.5 5.5v4M13.5 5.5v4" />
        <path strokeLinejoin="round" d="M10 13v3h4v-3" />
        <rect x="2.5" y="16" width="19" height="5" rx="1.5" />
    </svg>
);
