
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { type ResumeData, SectionVisibility, Experience, ATSReport } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { SparklesIcon } from './icons/SparklesIcon';
import { BotMessageSquareIcon } from './icons/BotMessageSquareIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { Pill } from './ui/Pill';

interface ResumeFormStepperProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  isLoading: boolean;
  isEnhancing: Record<string, boolean>;
  isDeepDiving: Record<string, boolean>;
  isReturningUser: boolean;
  sectionVisibility: SectionVisibility;
  onSectionToggle: (section: keyof SectionVisibility) => void;
  onEnhanceSection: (section: 'summary' | `experience.${string}` | `project.${string}` | 'skills' | 'technologies', content: string | string[]) => void;
  onDeepDiveExperience: (experience: Experience, numPoints: number) => void;
  onBatchDeepDive: (experiences: Experience[], numPoints: number) => void;
  isBatchDeepDiving: boolean;
  errors: Record<string, string>;
  atsReport?: ATSReport | null;
}

const EnhanceButton: React.FC<{ onClick: () => void; isEnhancing?: boolean; label?: string; }> = ({ onClick, isEnhancing, label = "Enhance" }) => (
    <button onClick={onClick} type="button" disabled={isEnhancing} className="flex items-center text-xs font-semibold text-primary hover:text-primary/90 transition disabled:opacity-50 disabled:cursor-wait">
        {isEnhancing ? (
            <div className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin mr-1"></div>
        ) : (
             <SparklesIcon className="w-4 h-4 mr-1" />
        )}
       {isEnhancing ? 'Enhancing...' : `${label} with AI`}
    </button>
);


const SectionTitle: React.FC<{ children: React.ReactNode, onToggle?: () => void, isEnabled?: boolean, onEnhance?: () => void, isEnhancing?: boolean }> = ({ children, onToggle, isEnabled, onEnhance, isEnhancing }) => (
  <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
    <h3 className="text-lg font-semibold text-card-foreground">{children}</h3>
    <div className="flex items-center gap-4">
        {onEnhance && <EnhanceButton onClick={onEnhance} isEnhancing={isEnhancing} />}
        {onToggle && <ToggleSwitch isEnabled={isEnabled ?? false} onToggle={onToggle} />}
    </div>
  </div>
);

const FieldWrapper: React.FC<{ children: React.ReactNode, error?: string }> = ({ children, error }) => (
  <div className="mb-3">
    {children}
    {error && <p className="text-sm text-destructive mt-1">{error}</p>}
  </div>
);

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string, error?: string }> = ({ label, value, onChange, placeholder, error }) => (
  <FieldWrapper error={error}>
    <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 bg-background border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition ${error ? 'border-destructive' : 'border-input'}`}
    />
  </FieldWrapper>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number, error?: string, onEnhance?: () => void, isEnhancing?: boolean }> = ({ label, value, onChange, rows=4, error, onEnhance, isEnhancing }) => (
 <FieldWrapper error={error}>
    <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-muted-foreground">{label}</label>
        {onEnhance && <EnhanceButton onClick={onEnhance} isEnhancing={isEnhancing} />}
    </div>
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full p-3 bg-background border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition ${error ? 'border-destructive' : 'border-input'}`}
    />
  </FieldWrapper>
);

const AddButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button onClick={onClick} type="button" className="flex items-center text-sm font-semibold text-primary hover:text-primary/90 transition mt-2">
        <PlusIcon className="w-4 h-4 mr-1" /> {children}
    </button>
);

const RemoveButton: React.FC<{ onClick: () => void; }> = ({ onClick }) => (
    <button onClick={onClick} type="button" className="text-destructive hover:text-destructive/90 transition p-1" aria-label="Remove item">
        <TrashIcon className="w-4 h-4" />
    </button>
);

// Slider Component with visual ticks
const PointSlider: React.FC<{ value: number; onChange: (val: number) => void }> = ({ value, onChange }) => (
    <div className="flex items-center gap-3 bg-background px-3 py-1.5 rounded-full border border-input shadow-sm">
        <span className="text-xs font-medium text-muted-foreground w-12 text-center">{value} Pts</span>
        <div className="relative w-24 h-4 flex items-center">
            <input
                type="range"
                min="5"
                max="20"
                step="5"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary z-10"
                list="point-markers"
            />
            <div className="absolute w-full flex justify-between px-1 pointer-events-none top-1/2 -translate-y-1/2">
                {[5, 10, 15, 20].map(p => (
                    <div key={p} className="w-1 h-1 rounded-full bg-border"></div>
                ))}
            </div>
        </div>
    </div>
);


export const ResumeFormStepper: React.FC<ResumeFormStepperProps> = (props) => {
    const [deepDiveSelections, setDeepDiveSelections] = useState<Record<string, number>>({});
    const [expandedExperience, setExpandedExperience] = useState<string | null>(null);
    const [batchSelection, setBatchSelection] = useState<Set<string>>(new Set());
    const [batchPoints, setBatchPoints] = useState<number>(15);

    const { 
        resumeData, setResumeData, jobDescription, setJobDescription, errors, 
        onEnhanceSection, isEnhancing, onDeepDiveExperience, isDeepDiving, atsReport,
        onBatchDeepDive, isBatchDeepDiving
    } = props;

    const handleCommaSeparatedChange = (field: 'skills' | 'technologies', value: string) => {
        setResumeData({ ...resumeData, [field]: value.split(',').map(s => s.trim()) });
    };

    const handleArrayChange = (section: keyof ResumeData, index: number, field: string, value: any) => {
        setResumeData({
            ...resumeData,
            [section]: (resumeData[section] as any[]).map((item, i) => i === index ? { ...item, [field]: value } : item)
        });
    };
    
    const handleAddItem = (section: keyof ResumeData, newItem: any) => {
        setResumeData({ ...resumeData, [section]: [...(resumeData[section] as any[]), newItem] });
    };

    const handleRemoveItem = (section: keyof ResumeData, index: number) => {
        setResumeData({ ...resumeData, [section]: (resumeData[section] as any[]).filter((_, i) => i !== index) });
    };

    const toggleExperienceExpand = (id: string) => {
        setExpandedExperience(prev => prev === id ? null : id);
    };

    const toggleBatchSelection = (id: string) => {
        setBatchSelection(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleBatchDeepDiveClick = () => {
        const selectedExps = resumeData.experience.filter(e => batchSelection.has(e.id));
        if (selectedExps.length > 0) {
            onBatchDeepDive(selectedExps, batchPoints);
            setBatchSelection(new Set());
        }
    };

    return (
        <div className="space-y-6 pb-10">
            
            {/* 1. Context: Job Description */}
            <div className="bg-card p-6 shadow-md rounded-lg border border-border">
                 <SectionTitle>Job Description Context</SectionTitle>
                 <p className="text-sm text-muted-foreground -mt-2 mb-3">
                    Paste the job description here. The AI uses this to tailor your resume.
                </p>
                <TextAreaField label="" value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={6} error={errors.jobDescription} />
            </div>

            {/* 2. Skills */}
            <div className="bg-card p-6 shadow-md rounded-lg border border-border">
                <SectionTitle onEnhance={() => onEnhanceSection('skills', resumeData.skills)} isEnhancing={isEnhancing['skills']}>
                    Skills & Keywords
                </SectionTitle>
                {atsReport && atsReport.keywordAnalysis.hardSkills.missing.length > 0 && (
                    <div className="mb-4">
                            <h5 className="text-xs font-semibold text-warning uppercase mb-2">Missing Keywords</h5>
                            <div className="flex flex-wrap gap-2">
                            {atsReport.keywordAnalysis.hardSkills.missing.map(kw => (
                                <Pill key={kw} variant="warning">{kw}</Pill>
                            ))}
                            </div>
                    </div>
                )}
                <TextAreaField label="Core Skills (comma-separated)" value={resumeData.skills.join(', ')} onChange={e => handleCommaSeparatedChange('skills', e.target.value)} rows={3} />
            </div>
            
            {/* 3. Work Experience */}
            <div className="bg-card p-6 shadow-md rounded-lg border border-border">
                <SectionTitle>Work Experience</SectionTitle>

                {/* AI Deep Dive Console */}
                <div className="mb-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
                     <div className="flex items-center gap-2 mb-2">
                        <BotMessageSquareIcon className="w-5 h-5 text-accent" />
                        <h4 className="font-semibold text-sm text-foreground">AI Deep Dive Console</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                        Select roles to automatically expand into detailed, achievement-based bullet points tailored to the JD.
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <PointSlider value={batchPoints} onChange={setBatchPoints} />

                        <button 
                            onClick={handleBatchDeepDiveClick}
                            disabled={isBatchDeepDiving || batchSelection.size === 0}
                            className="flex items-center px-4 py-1.5 bg-accent text-accent-foreground text-xs font-bold rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {isBatchDeepDiving ? (
                                <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2" />
                            ) : (
                                <SparklesIcon className="w-4 h-4 mr-2" />
                            )}
                            {isBatchDeepDiving ? 'Deep Diving...' : `Deep Dive (${batchSelection.size})`}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {resumeData.experience.map((exp, index) => {
                        const isExpanded = expandedExperience === exp.id;
                        const currentPoints = deepDiveSelections[exp.id] || 15;
                        const isSelected = batchSelection.has(exp.id);
                        
                        return (
                            <div key={exp.id} className={`border rounded-lg bg-background overflow-hidden transition-all duration-200 ${isSelected ? 'border-accent ring-1 ring-accent/30' : 'border-border'}`}>
                                <div className="flex items-stretch">
                                    {/* Dedicated Selection Area - Large Click Target */}
                                    <div 
                                        className={`w-12 flex items-center justify-center border-r border-border cursor-pointer transition-colors ${isSelected ? 'bg-accent/10' : 'hover:bg-secondary/50'}`}
                                        onClick={() => toggleBatchSelection(exp.id)}
                                        title="Select for Deep Dive"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {}} // Controlled by parent div click
                                            className="h-5 w-5 rounded border-input text-accent focus:ring-accent cursor-pointer pointer-events-none"
                                        />
                                    </div>

                                    {/* Main Content Area - Expands Row */}
                                    <div className="flex-1 min-w-0">
                                        <div 
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors h-full"
                                            onClick={() => toggleExperienceExpand(exp.id)}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="font-semibold text-sm text-foreground truncate">{exp.role || 'New Role'}</h4>
                                                    <span className="text-muted-foreground">at</span>
                                                    <span className="font-medium text-sm text-foreground truncate">{exp.company || 'Company'}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{exp.duration}</p>
                                            </div>
                                            <div className="flex items-center gap-3 pl-4">
                                                {!isExpanded && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">Edit</span>}
                                                <ChevronDownIcon className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Editor */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-border p-4 bg-secondary/10"
                                        >
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <InputField label="Role" value={exp.role} onChange={e => handleArrayChange('experience', index, 'role', e.target.value)} />
                                                <InputField label="Company" value={exp.company} onChange={e => handleArrayChange('experience', index, 'company', e.target.value)} />
                                                <InputField label="Duration" value={exp.duration} onChange={e => handleArrayChange('experience', index, 'duration', e.target.value)} />
                                            </div>
                                            
                                            <TextAreaField 
                                                label="Description" 
                                                value={exp.description} 
                                                onChange={e => handleArrayChange('experience', index, 'description', e.target.value)} 
                                                rows={6}
                                            />
                                            
                                            <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                                                <EnhanceButton 
                                                    onClick={() => onEnhanceSection(`experience.${exp.id}`, exp.description)} 
                                                    isEnhancing={isEnhancing[`experience.${exp.id}`]}
                                                    label="Rewrite"
                                                />
                                                
                                                {/* Single Item AI Deep Dive Controls */}
                                                <div className="flex items-center ml-auto gap-2">
                                                    <PointSlider 
                                                        value={currentPoints} 
                                                        onChange={(val) => setDeepDiveSelections(prev => ({...prev, [exp.id]: val}))} 
                                                    />
                                                    <button 
                                                        onClick={() => onDeepDiveExperience(exp, currentPoints)} 
                                                        type="button" 
                                                        disabled={isDeepDiving[exp.id]} 
                                                        className="flex items-center text-xs font-semibold text-accent-foreground hover:bg-accent/20 transition disabled:opacity-50 disabled:cursor-wait px-3 py-1.5 border border-accent/20 bg-accent/5 rounded-md h-9"
                                                    >
                                                        {isDeepDiving[exp.id] ? (
                                                            <div className="w-3 h-3 border-2 border-t-transparent border-accent-foreground rounded-full animate-spin mr-1.5"></div>
                                                        ) : (
                                                            <BotMessageSquareIcon className="w-3 h-3 mr-1.5" />
                                                        )}
                                                        {isDeepDiving[exp.id] ? 'Thinking...' : 'Deep Dive'}
                                                    </button>
                                                </div>
                                                    <div className="h-6 w-px bg-border mx-1"></div>
                                                <RemoveButton onClick={() => handleRemoveItem('experience', index)}/>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                    <AddButton onClick={() => handleAddItem('experience', {id: `exp${Date.now()}`, role: '', company: '', duration: '', description: ''})}>Add Experience</AddButton>
                </div>
            </div>
        </div>
    );
};
