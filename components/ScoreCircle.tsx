import React from 'react';
import { motion } from 'framer-motion';

export const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    let strokeColor = 'stroke-destructive';
    if (score >= 85) {
        strokeColor = 'stroke-success';
    } else if (score >= 70) {
        strokeColor = 'stroke-yellow-500';
    }

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 140 140">
                <circle
                    className="stroke-current text-border"
                    strokeWidth="12"
                    fill="transparent"
                    r={radius}
                    cx="70"
                    cy="70"
                />
                <motion.circle
                    className={`transform -rotate-90 origin-center ${strokeColor}`}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="70"
                    cy="70"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <motion.span 
                    className="text-4xl font-bold text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {score}
                </motion.span>
                <span className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Overall Score</span>
            </div>
        </div>
    );
};
