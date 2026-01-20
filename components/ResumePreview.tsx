
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
    const [containerRef, setContainerRef] = React.useState<HTMLDivElement | null>(null);
    const [contentHeight, setContentHeight] = React.useState(0);

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

    // Measure content height
    React.useEffect(() => {
        if (containerRef) {
            const height = containerRef.scrollHeight;
            setContentHeight(height);
        }
    }, [containerRef, resumeData]);

    const PAGE_HEIGHT = 1056; // A4 height in pixels at 96 DPI (11 inches)
    const hasMultiplePages = contentHeight > PAGE_HEIGHT;

    return (
        <div className="w-full bg-gray-100 rounded-md p-2 sm:p-4">
            <style>{`
                .resume-preview-container {
                    width: 100%;
                    overflow-x: auto;
                    overflow-y: auto;
                }

                .resume-pages-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                    padding-bottom: 24px;
                    min-width: fit-content;
                }

                .resume-page-container {
                    position: relative;
                    width: 816px;
                    flex-shrink: 0;
                }

                .resume-page {
                    width: 816px;
                    height: 1056px;
                    background: white;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                    position: relative;
                }

                .resume-content-wrapper {
                    position: absolute;
                    width: 816px;
                    left: 0;
                }

                /* Prevent awkward page breaks */
                .resume-content-wrapper section,
                .resume-content-wrapper > div > div,
                .resume-content-wrapper > div > aside > div,
                .resume-content-wrapper h1,
                .resume-content-wrapper h2,
                .resume-content-wrapper h3 {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }

                /* Keep experience items together */
                .resume-content-wrapper article,
                .resume-content-wrapper [class*="mb-"] {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }

                .page-number {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: rgba(0, 0, 0, 0.75);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    z-index: 100;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }
            `}</style>

            <div className="resume-preview-container">
                <div className="resume-pages-wrapper">
                    {/* Render actual content once to measure */}
                    <div
                        ref={setContainerRef}
                        style={{
                            position: 'absolute',
                            visibility: 'hidden',
                            width: '816px',
                            pointerEvents: 'none'
                        }}
                    >
                        {getTemplateComponent()}
                    </div>

                    {/* Page 1 */}
                    <div className="resume-page-container">
                        <div className="page-number">Page 1</div>
                        <div className="resume-page">
                            <div className="resume-content-wrapper" style={{ top: 0 }}>
                                {getTemplateComponent()}
                            </div>
                        </div>
                    </div>

                    {/* Page 2 - Only show if content overflows */}
                    {hasMultiplePages && (
                        <div className="resume-page-container">
                            <div className="page-number">Page 2</div>
                            <div className="resume-page">
                                <div className="resume-content-wrapper" style={{ top: `-${PAGE_HEIGHT}px` }}>
                                    {getTemplateComponent()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
