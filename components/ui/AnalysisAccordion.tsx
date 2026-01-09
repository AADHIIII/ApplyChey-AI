
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type AnalysisParameter } from '../../types';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

const ScorePill: React.FC<{ score: number }> = ({ score }) => {
    let colorClasses = 'text-destructive bg-destructive/10';
    if (score >= 8) {
        colorClasses = 'text-success bg-success/10';
    } else if (score >= 5) {
        colorClasses = 'text-yellow-600 bg-yellow-500/10';
    }
    
    return (
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md font-bold text-sm ${colorClasses}`}>
            {score}
        </div>
    );
};

const getBorderColor = (score: number) => {
    if (score >= 8) return 'border-success';
    if (score >= 5) return 'border-yellow-500';
    return 'border-destructive';
};

export const AnalysisAccordion: React.FC<{ parameter: AnalysisParameter }> = ({ parameter }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-md' : ''} ${getBorderColor(parameter.score)} border-l-4`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-semibold text-foreground">{parameter.name}</h4>
                     {!isOpen && <p className="text-xs text-muted-foreground mt-1 truncate">{parameter.takeaway}</p>}
                </div>
                <div className="flex items-center gap-3 ml-4">
                    <ScorePill score={parameter.score} />
                    <ChevronDownIcon
                        className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
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
                        <div className="px-4 pb-3 border-t border-border pt-3">
                             <p className="text-xs font-semibold text-muted-foreground mb-1">{parameter.takeaway}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{parameter.analysis}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};