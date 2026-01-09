
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

// A local XIcon for the Toast component's dismiss button.
const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// FIX: Add a local WarningIcon to be used for the new 'warning' toast type.
const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

export interface ToastProps {
    // FIX: Add 'warning' to the allowed toast types to resolve the error in App.tsx.
    type?: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type = 'info', title, message, onDismiss }) => {
    const variantMap = {
        success: { bg: 'bg-success/10 border-success/40', text: 'text-success', icon: <CheckCircleIcon className="w-6 h-6" /> },
        error: { bg: 'bg-destructive/10 border-destructive/40', text: 'text-destructive', icon: <XCircleIcon className="w-6 h-6" /> },
        info: { bg: 'bg-accent/10 border-accent/40', text: 'text-accent', icon: <SparklesIcon className="w-6 h-6" /> },
        // FIX: Add a 'warning' variant to handle warning toasts.
        warning: { bg: 'bg-warning/10 border-warning/40', text: 'text-warning', icon: <WarningIcon className="w-6 h-6" /> },
    };
    const { bg, text, icon } = variantMap[type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`w-full p-4 rounded-lg border shadow-lg ${bg}`}
        >
            <div className="flex items-start">
                <div className={`flex-shrink-0 ${text}`}>{icon}</div>
                <div className="ml-3 flex-1">
                    <p className={`text-sm font-semibold ${text}`}>{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                </div>
                <button onClick={onDismiss} aria-label="Dismiss" className="ml-4 p-1 rounded-md text-muted-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};