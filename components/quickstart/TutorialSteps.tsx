import React from 'react';

export interface TutorialStep {
    title: string;
    text: string;
    /** Optional element shown under the text, e.g. an install badge */
    action?: React.ReactNode;
}

/** Numbered tutorial steps */
export const TutorialSteps: React.FC<{ steps: TutorialStep[] }> = ({ steps }) => (
    <ol className="space-y-6">
        {steps.map((step, i) => <li key={i} className="flex gap-4">
            <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-vtherm-secondary text-white font-medium" aria-hidden="true">
                {i + 1}
            </span>
            <div>
                {/* leading-9 matches the number badge height so the title is centered on it */}
                <h3 className="py-0 text-lg leading-9 font-medium text-vtherm-primary dark:text-vtherm-light">{step.title}</h3>
                <p className="leading-relaxed whitespace-pre-line dark:text-vtherm-light/80">{step.text}</p>
                {step.action && <div className="mt-3">{step.action}</div>}
            </div>
        </li>)}
    </ol>
);
