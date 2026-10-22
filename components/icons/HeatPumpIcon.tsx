import React from 'react';

/** Heat pump outdoor unit, outline style matching Heroicons 24px */
export const HeatPumpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" {...props}>
        <rect x="2.5" y="4.5" width="19" height="14" rx="1.5" />
        <circle cx="9" cy="11.5" r="4.5" />
        <path strokeLinecap="round" d="M9 7v9M4.5 11.5h9M15.5 8.5h3.5M15.5 11.5h3.5M15.5 14.5h3.5M5 18.5v2.5M19 18.5v2.5" />
    </svg>
);
