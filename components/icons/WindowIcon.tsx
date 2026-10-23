import React from 'react';

/** Window with an open sash, outline style matching Heroicons 24px */
export const WindowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="1.5" />
        <path strokeLinejoin="round" d="M12 3v18M12 4.5l-5 2.5v11l5 2.5" />
        <path strokeLinecap="round" d="M15 12h2" />
    </svg>
);
