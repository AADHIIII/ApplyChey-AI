
import React from 'react';
import { type ResumeData, type Template, type CustomTemplateSettings, type Diffs, type DiffViewMode } from '../types';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { JuniorTemplate } from './templates/JuniorTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { ConsultantTemplate } from './templates/ConsultantTemplate';
import { ModernTechTemplate } from './templates/ModernTechTemplate';
import { FaangTemplate } from './templates/FaangTemplate';
import { CustomTemplate } from './templates/CustomTemplate';

interface ResumePreviewProps {
  resumeData: ResumeData;
  template: Template;
  customTemplateSettings: CustomTemplateSettings;
  diffs?: Diffs | null;
  diffView?: DiffViewMode;
  originalResumeData?: ResumeData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, template, customTemplateSettings, diffs, diffView, originalResumeData }) => {
    
    const getTemplateComponent = () => {
        const props = {
            resumeData,
            settings: customTemplateSettings,
            diffs: diffView === 'diff' ? diffs : null,
            originalResumeData,
        };

        switch (template) {
            case 'classic':
                return <ClassicTemplate {...props} />;
            case 'junior':
                return <JuniorTemplate {...props} />;
            case 'creative':
                // The "Mid-Level" option in the selector maps to 'creative'
                return <CreativeTemplate {...props} />;
            case 'consultant':
                return <ConsultantTemplate {...props} />;
            case 'modern-tech':
                return <ModernTechTemplate {...props} />;
            case 'faang':
                return <FaangTemplate {...props} />;
            case 'custom':
                return <CustomTemplate {...props} />;
            default:
                return <ModernTechTemplate {...props} />;
        }
    };

    return (
        <div className="w-full bg-transparent rounded-md">
            <div className="w-full max-w-[816px] bg-white shadow-xl mx-auto box-border overflow-x-hidden ring-1 ring-border">
                {getTemplateComponent()}
            </div>
        </div>
    );
};
