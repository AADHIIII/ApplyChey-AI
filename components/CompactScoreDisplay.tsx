import React from 'react';
import { motion } from 'framer-motion';

const getScoreRating = (score: number): { rating: string; color: string } => {
    if (score >= 90) return { rating: 'Excellent', color: 'bg-success' };
    if (score >= 80) return { rating: 'Great', color: 'bg-green-500' };
    if (score >= 70) return { rating: 'Good', color: 'bg-yellow-500' };
    if (score >= 60) return { rating: 'Fair', color: 'bg-orange-500' };
    return { rating: 'Needs Work', color: 'bg-destructive' };
};

export const CompactScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
    const { rating, color } = getScoreRating(score);
    
    return (
        <div className="bg-secondary/50 p-4 rounded-lg border border-border">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-muted-foreground">Overall Score</span>
                <span className={`text-sm font-bold ${color.replace('bg-', 'text-')}`}>{rating}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-foreground">{score}</span>
                <div className="w-full bg-border rounded-full h-2.5">
                    <motion.div
                        className={`h-2.5 rounded-full ${color}`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>
            </div>
        </div>
    );
};
