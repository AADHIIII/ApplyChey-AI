
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ATSReport, type ResumeData, type Experience, AnalysisParameter, Template, CustomTemplateSettings } from '../types';
import { Card } from './ui/Card';
import { CompactScoreDisplay } from './CompactScoreDisplay';
import { KeywordAnalysisPanel } from './KeywordAnalysisPanel';
import { getImprovementSuggestion } from '../services/geminiService';
import { SuggestionModal } from './SuggestionModal';
import { AnalysisGroup } from './AnalysisGroup';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { CustomTemplateSettingsPanel } from './CustomTemplateSettingsPanel';


interface ActionToolbarProps {
    report: ATSReport | null;
    originalResume: ResumeData;
    jobDescription: string;
    onBatchDeepDive: (experiences: Experience[], numPoints: number) => void;
    isBatchDeepDiving: boolean;
    onApiError: (error: unknown) => void;
    selectedTemplate: Template;
    customTemplateSettings: CustomTemplateSettings;
    onCustomTemplateSettingsChange: (settings: CustomTemplateSettings) => void;
}

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

const AnalysisParameterItem: React.FC<{
    parameter: AnalysisParameter;
    onImprove: (name: string, analysis: string) => void;
}> = ({ parameter, onImprove }) => {
    const canImprove = parameter.score < 8;

    return (
        <div className="p-2 bg-card rounded-md border border-border flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{parameter.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{parameter.takeaway}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {canImprove && (
                    <button
                        onClick={() => onImprove(parameter.name, parameter.analysis)}
                        className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors"
                        title="Improve with AI"
                    >
                        <SparklesIcon className="w-4 h-4" />
                    </button>
                )}
                <ScorePill score={parameter.score} />
            </div>
        </div>
    );
};

export const ActionToolbar: React.FC<ActionToolbarProps> = ({ 
    report, 
    originalResume, 
    jobDescription, 
    onApiError,
    selectedTemplate,
    customTemplateSettings,
    onCustomTemplateSettingsChange
}) => {
    const [suggestion, setSuggestion] = useState<{ title: string; content: string } | null>(null);
    const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);

    const handleGetSuggestion = async (parameterName: string, parameterAnalysis: string) => {
        setIsFetchingSuggestion(true);
        setSuggestion({ title: `Improving: ${parameterName}`, content: '' });
        try {
            const suggestionText = await getImprovementSuggestion(parameterName, parameterAnalysis, originalResume, jobDescription);
            setSuggestion({ title: `Improving: ${parameterName}`, content: suggestionText });
        } catch (error) {
            onApiError(error);
            setSuggestion({
                title: 'Error',
                content: 'Sorry, I couldn\'t fetch a suggestion at this time. Please try again.'
            });
        } finally {
            setIsFetchingSuggestion(false);
        }
    };

    const handleCloseModal = () => {
        setSuggestion(null);
    };

    if (!report) {
        return (
            <div className="sticky top-24 space-y-4">
                <Card>
                    <div className="text-center p-8">
                        <h3 className="text-lg font-semibold text-card-foreground">AI Toolkit</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Tailor your resume with the AI to unlock your detailed analysis report and advanced tools.
                        </p>
                    </div>
                </Card>
                {selectedTemplate === 'custom' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 pl-1">Template Settings</h4>
                        <CustomTemplateSettingsPanel 
                            settings={customTemplateSettings} 
                            onChange={onCustomTemplateSettingsChange}
                            className="shadow-sm bg-card"
                        />
                    </motion.div>
                )}
            </div>
        );
    }
    
    const analysisGroups = {
        impact: {
            title: 'Clarity & Impact',
            parameters: report.detailedAnalysis.filter(p => ["Action Verb Usage", "Quantifiable Achievements", "Summary Strength", "Impact vs. Length"].includes(p.name)),
        },
        ats: {
            title: 'ATS Optimization',
            parameters: report.detailedAnalysis.filter(p => ["Keyword Alignment", "Skills Section Optimization", "ATS Readability"].includes(p.name)),
        },
        polish: {
            title: 'Professional Polish',
            parameters: report.detailedAnalysis.filter(p => ["Relevance of Experience", "Clarity & Conciseness", "Professional Tone"].includes(p.name)),
        }
    };

    return (
        <>
            <div className="sticky top-24">
                <div className="bg-card shadow-md rounded-lg border border-border max-h-[calc(100vh-140px)] flex flex-col">
                    <div className="p-4 text-center border-b border-border flex-shrink-0">
                        <h3 className="text-lg font-bold text-card-foreground">Analysis Report</h3>
                        <p className="text-xs text-muted-foreground mt-1">AI-driven insights & improvements.</p>
                    </div>

                     {/* Constant Settings Panel - Always visible for 'custom' template */}
                     {selectedTemplate === 'custom' && (
                        <div className="p-3 border-b border-border bg-secondary/20 flex-shrink-0">
                             <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Template Design</h4>
                             <CustomTemplateSettingsPanel 
                                settings={customTemplateSettings} 
                                onChange={onCustomTemplateSettingsChange}
                                className="border-none p-0 bg-transparent shadow-none"
                            />
                        </div>
                    )}

                    <div className="p-4 space-y-6 overflow-y-auto min-h-0">
                        
                        <CompactScoreDisplay score={report.overallScore} />

                        <div className="grid grid-cols-1 gap-4 text-left">
                            <div>
                                <div className="flex items-center text-success mb-2">
                                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                                    <h4 className="text-sm font-semibold">Key Strengths</h4>
                                </div>
                                <p className="text-xs text-muted-foreground bg-success/5 p-2 rounded-md border border-success/20">{report.summary.strengths}</p>
                            </div>
                            <div>
                                <div className="flex items-center text-warning mb-2">
                                    <LightbulbIcon className="w-5 h-5 mr-2" />
                                    <h4 className="text-sm font-semibold">Primary Improvements</h4>
                                </div>
                                <p className="text-xs text-muted-foreground bg-warning/5 p-2 rounded-md border border-warning/20">{report.summary.improvements}</p>
                            </div>
                        </div>

                        <div>
                             <h4 className="text-center text-sm font-semibold text-muted-foreground mb-3">Actionable Insights</h4>
                             <div className="space-y-3">
                                <AnalysisGroup title={analysisGroups.impact.title} defaultOpen>
                                    <div className="space-y-2 p-3">
                                        {analysisGroups.impact.parameters.map(param => (
                                            <AnalysisParameterItem key={param.name} parameter={param} onImprove={handleGetSuggestion} />
                                        ))}
                                    </div>
                                </AnalysisGroup>
                                 <AnalysisGroup title={analysisGroups.ats.title}>
                                    <div className="space-y-2 p-3">
                                        {analysisGroups.ats.parameters.map(param => (
                                            <AnalysisParameterItem key={param.name} parameter={param} onImprove={handleGetSuggestion} />
                                        ))}
                                    </div>
                                    <div className="mt-2 p-3 border-t border-border">
                                        <KeywordAnalysisPanel report={report} />
                                    </div>
                                </AnalysisGroup>
                                <AnalysisGroup title={analysisGroups.polish.title}>
                                    <div className="space-y-2 p-3">
                                        {analysisGroups.polish.parameters.map(param => (
                                            <AnalysisParameterItem key={param.name} parameter={param} onImprove={handleGetSuggestion} />
                                        ))}
                                    </div>
                                </AnalysisGroup>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <SuggestionModal
                isOpen={!!suggestion}
                onClose={handleCloseModal}
                title={suggestion?.title ?? ''}
                content={suggestion?.content ?? ''}
                isLoading={isFetchingSuggestion}
            />
        </>
    );
};
