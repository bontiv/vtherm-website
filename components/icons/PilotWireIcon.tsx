import React from 'react';

/** Electric radiator with pilot wire, outline style matching Heroicons 24px */
export const PilotWireIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" {...props}>
        <rect x="2.5" y="6" width="12.5" height="13" rx="1.5" />
        <path strokeLinecap="round" d="M6.5 8.5v8M10.75 8.5v8M5 19v2.5M12.5 19v2.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 2.5 17.75 7.5h3.5L18.5 12.5" />
    </svg>
);
