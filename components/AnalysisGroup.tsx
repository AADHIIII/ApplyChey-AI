import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface AnalysisGroupProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export const AnalysisGroup: React.FC<AnalysisGroupProps> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-secondary/70 transition-colors"
                aria-expanded={isOpen}
            >
                <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                <ChevronDownIcon
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 },
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border bg-card">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};