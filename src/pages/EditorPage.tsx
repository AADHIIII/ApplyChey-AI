import React from 'react';
import { ResumeFormStepper } from '../../components/ResumeFormStepper';
import { ResumePreview } from '../../components/ResumePreview';
import { ActionToolbar } from '../../components/ActionToolbar';
import { ResumeData, ATSReport, Diffs, DiffViewMode, Template, SectionVisibility, Experience, CustomTemplateSettings } from '../../types';

interface EditorPageProps {
    originalResume: ResumeData;
    tailoredResume: ResumeData | null;
    jobDescription: string;
    setJobDescription: (jd: string) => void;
    handleResumeDataChange: (data: ResumeData) => void;
    isLoading: boolean;
    isEnhancing: Record<string, boolean>;
    isDeepDiving: Record<string, boolean>;
    sectionVisibility: SectionVisibility;
    setSectionVisibility: React.Dispatch<React.SetStateAction<SectionVisibility>>;
    handleEnhanceSection: (section: 'summary' | `experience.${string}` | `project.${string}` | 'skills' | 'technologies', content: string | string[]) => void;
    handleDeepDiveExperience: (exp: Experience, numPoints: number) => void;
    handleBatchDeepDiveAndRetailor: (experiences: Experience[], numPoints: number) => void;
    isBatchDeepDiving: boolean;
    errors: Record<string, string>;
    atsReport: ATSReport | null;
    diffView: DiffViewMode;
    setDiffView: (mode: DiffViewMode) => void;
    selectedTemplate: Template;
    customTemplateSettings: CustomTemplateSettings;
    setCustomTemplateSettings: (settings: CustomTemplateSettings) => void;
    diffs: Diffs | null;
    handleApiError: (error: unknown) => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({
    originalResume,
    tailoredResume,
    jobDescription,
    setJobDescription,
    handleResumeDataChange,
    isLoading,
    isEnhancing,
    isDeepDiving,
    sectionVisibility,
    setSectionVisibility,
    handleEnhanceSection,
    handleDeepDiveExperience,
    handleBatchDeepDiveAndRetailor,
    isBatchDeepDiving,
    errors,
    atsReport,
    diffView,
    setDiffView,
    selectedTemplate,
    customTemplateSettings,
    setCustomTemplateSettings,
    diffs,
    handleApiError
}) => {
    const hasResults = !!(tailoredResume && atsReport);

    // Smart Layout Logic:
    const layout = hasResults ? {
        // Analysis Mode
        editor: "col-span-12 lg:col-span-4 xl:col-span-3 space-y-6 pb-20",
        preview: "col-span-12 lg:col-span-8 xl:col-span-6 space-y-6",
        commandDesktop: "hidden xl:block xl:col-span-3",
        commandMobile: "col-span-12 xl:hidden"
    } : {
        // Edit Mode
        editor: "col-span-12 lg:col-span-6 space-y-6 pb-20",
        preview: "col-span-12 lg:col-span-6 space-y-6",
        commandDesktop: "hidden",
        commandMobile: "hidden"
    };

    return (
        <>
            {/* 1. Resume Editor Form (Tailoring Mode) */}
            <div className={layout.editor}>
                <ResumeFormStepper
                    resumeData={originalResume}
                    setResumeData={handleResumeDataChange}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    isLoading={isLoading}
                    isEnhancing={isEnhancing}
                    isDeepDiving={isDeepDiving}
                    isReturningUser={true}
                    sectionVisibility={sectionVisibility}
                    onSectionToggle={(section) => setSectionVisibility(prev => ({ ...prev, [section]: !prev[section] }))}
                    onEnhanceSection={handleEnhanceSection}
                    onDeepDiveExperience={handleDeepDiveExperience}
                    onBatchDeepDive={handleBatchDeepDiveAndRetailor}
                    isBatchDeepDiving={isBatchDeepDiving}
                    errors={errors}
                    atsReport={atsReport}
                />
            </div>

            {/* 2. Resume Preview */}
            <div className={layout.preview}>
                <ResumePreview
                    resumeData={diffView === 'tailored' && tailoredResume ? tailoredResume : originalResume}
                    template={selectedTemplate}
                    customTemplateSettings={customTemplateSettings}
                    diffs={diffView === 'diff' ? diffs : null}
                    diffView={diffView}
                    originalResumeData={originalResume}
                />

                {tailoredResume && (
                    <div className="flex justify-center mt-4 bg-card p-2 rounded-lg border border-border shadow-sm w-fit mx-auto">
                        <button onClick={() => setDiffView('original')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${diffView === 'original' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Original</button>
                        <button onClick={() => setDiffView('tailored')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${diffView === 'tailored' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Tailored</button>
                        <button onClick={() => setDiffView('diff')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${diffView === 'diff' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Diff View</button>
                    </div>
                )}
            </div>

            {/* 3. Command Center (Desktop XL) */}
            {hasResults && atsReport && (
                <div className={layout.commandDesktop}>
                    <ActionToolbar
                        report={atsReport}
                        originalResume={originalResume}
                        jobDescription={jobDescription}
                        onBatchDeepDive={handleBatchDeepDiveAndRetailor}
                        isBatchDeepDiving={isBatchDeepDiving}
                        onApiError={handleApiError}
                        selectedTemplate={selectedTemplate}
                        customTemplateSettings={customTemplateSettings}
                        onCustomTemplateSettingsChange={setCustomTemplateSettings}
                    />
                </div>
            )}

            {/* 3. Command Center (Tablet/Mobile - moves to bottom) */}
            {hasResults && atsReport && (
                <div className={layout.commandMobile}>
                    <ActionToolbar
                        report={atsReport}
                        originalResume={originalResume}
                        jobDescription={jobDescription}
                        onBatchDeepDive={handleBatchDeepDiveAndRetailor}
                        isBatchDeepDiving={isBatchDeepDiving}
                        onApiError={handleApiError}
                        selectedTemplate={selectedTemplate}
                        customTemplateSettings={customTemplateSettings}
                        onCustomTemplateSettingsChange={setCustomTemplateSettings}
                    />
                </div>
            )}
        </>
    );
};
