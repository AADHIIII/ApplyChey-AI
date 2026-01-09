import React from 'react';
import { type ATSReport } from '../types';
import { Pill } from './ui/Pill';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

const KeywordList: React.FC<{ keywords: string[], variant: 'success' | 'warning' }> = ({ keywords, variant }) => (
    <div className="flex flex-wrap gap-2">
        {keywords.map(keyword => <Pill key={keyword} variant={variant}>{keyword}</Pill>)}
    </div>
);

export const KeywordAnalysisPanel: React.FC<{ report: ATSReport }> = ({ report }) => {
    const { hardSkills, softSkills } = report.keywordAnalysis;

    return (
        <div className="animate-fade-in space-y-6 text-sm max-h-[calc(100vh-20rem)] overflow-y-auto">
            <div>
                <h4 className="font-semibold text-foreground mb-3">Hard Skills Analysis</h4>
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center font-medium text-success mb-2">
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                            <span>Keywords Matched</span>
                        </div>
                        {hardSkills.present.length > 0 ? (
                            <KeywordList keywords={hardSkills.present} variant="success" />
                        ) : (
                            <p className="text-xs text-muted-foreground ml-6">No primary hard skills were matched.</p>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center font-medium text-warning mb-2">
                            <XCircleIcon className="w-4 h-4 mr-2" />
                            <span>Opportunities for Improvement</span>
                        </div>
                        {hardSkills.missing.length > 0 ? (
                             <KeywordList keywords={hardSkills.missing} variant="warning" />
                        ) : (
                             <p className="text-xs text-muted-foreground ml-6">All key hard skills appear to be covered!</p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="border-t border-border pt-6">
                <h4 className="font-semibold text-foreground mb-3">Soft Skills Analysis</h4>
                 <div className="space-y-4">
                    <div>
                        <div className="flex items-center font-medium text-success mb-2">
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                            <span>Keywords Matched</span>
                        </div>
                        {softSkills.present.length > 0 ? (
                             <KeywordList keywords={softSkills.present} variant="success" />
                        ) : (
                             <p className="text-xs text-muted-foreground ml-6">No primary soft skills were matched.</p>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center font-medium text-warning mb-2">
                             <XCircleIcon className="w-4 h-4 mr-2" />
                            <span>Opportunities for Improvement</span>
                        </div>
                        {softSkills.missing.length > 0 ? (
                             <KeywordList keywords={softSkills.missing} variant="warning" />
                        ) : (
                             <p className="text-xs text-muted-foreground ml-6">All key soft skills appear to be covered!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};