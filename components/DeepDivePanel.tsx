
import React, { useState } from 'react';
import { type ResumeData, type Experience } from '../types';
import { BotMessageSquareIcon } from './icons/BotMessageSquareIcon';

interface DeepDivePanelProps {
    originalResume: ResumeData;
    onBatchDeepDive: (experiences: Experience[], numPoints: number) => void;
    isBatchDeepDiving: boolean;
}

const PointSlider: React.FC<{ value: number; onChange: (val: number) => void }> = ({ value, onChange }) => (
    <div className="flex items-center gap-3 bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
        <span className="text-xs font-medium text-muted-foreground w-12 text-center">{value} Pts</span>
        <input
            type="range"
            min="5"
            max="20"
            step="5"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-24 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
        />
    </div>
);

export const DeepDivePanel: React.FC<DeepDivePanelProps> = ({ originalResume, onBatchDeepDive, isBatchDeepDiving }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [numPoints, setNumPoints] = useState(15);

    const handleToggleSelection = (expId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(expId)) {
                newSet.delete(expId);
            } else {
                newSet.add(expId);
            }
            return newSet;
        });
    };

    const handleDeepDiveClick = () => {
        const selectedExperiences = originalResume.experience.filter(exp => selectedIds.has(exp.id));
        onBatchDeepDive(selectedExperiences, numPoints);
    };

    const hasSelection = selectedIds.size > 0;

    return (
        <div className="animate-fade-in space-y-4 text-sm flex flex-col h-full max-h-[calc(100vh-20rem)]">
            <div>
                <h4 className="font-semibold text-foreground mb-1">Expand Your Experience</h4>
                <p className="text-xs text-muted-foreground mb-4">
                    Select one or more work experiences to have the AI expand them. Choose the number of bullet points you want generated for each role.
                </p>
            </div>
            
            <div className="flex items-center justify-between bg-card border border-border p-2 rounded-md mb-2">
                <span className="text-xs font-medium text-muted-foreground">Points per role:</span>
                <PointSlider value={numPoints} onChange={setNumPoints} />
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                {originalResume.experience.length > 0 ? (
                    originalResume.experience.map(exp => (
                        <label
                            key={exp.id}
                            htmlFor={`checkbox-${exp.id}`}
                            className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                                selectedIds.has(exp.id)
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-secondary/50 border-border hover:bg-secondary'
                            }`}
                        >
                            <div className="flex items-center">
                                <input
                                    id={`checkbox-${exp.id}`}
                                    type="checkbox"
                                    checked={selectedIds.has(exp.id)}
                                    onChange={() => handleToggleSelection(exp.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-3"
                                    aria-labelledby={`experience-label-${exp.id}`}
                                />
                                <div id={`experience-label-${exp.id}`}>
                                    <p className="font-semibold text-foreground">{exp.role}</p>
                                    <p className="text-xs text-muted-foreground">{exp.company}</p>
                                </div>
                            </div>
                        </label>
                    ))
                ) : (
                    <p className="text-center text-xs text-muted-foreground py-4">No work experiences found in your original resume to perform a deep dive on.</p>
                )}
            </div>
            <div className="pt-4 mt-auto border-t border-border">
                <button
                    onClick={handleDeepDiveClick}
                    type="button"
                    disabled={isBatchDeepDiving || !hasSelection}
                    className="w-full flex items-center justify-center py-2 px-4 rounded-md text-sm font-semibold text-primary-foreground bg-accent hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-wait"
                >
                    {isBatchDeepDiving ? (
                        <div className="w-5 h-5 border-2 border-t-transparent border-primary-foreground rounded-full animate-spin mr-2"></div>
                    ) : (
                        <BotMessageSquareIcon className="w-5 h-5 mr-2" />
                    )}
                    {isBatchDeepDiving ? 'Analyzing...' : `Generate ${numPoints} Points & Re-Tailor`}
                </button>
            </div>
        </div>
    );
};
