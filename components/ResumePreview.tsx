
import React, { useMemo } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { type ResumeData, type Template, type CustomTemplateSettings, type Diffs, type DiffViewMode } from '../types';
import { ResumePdfDocument } from './pdf/ResumePdfDocument';
import { ErrorBoundary } from './ErrorBoundary';

interface ResumePreviewProps {
  resumeData: ResumeData;
  template: Template;
  customTemplateSettings: CustomTemplateSettings;
  diffs?: Diffs | null;
  diffView?: DiffViewMode;
  originalResumeData?: ResumeData;
}

const PdfErrorFallback = () => (
    <div className="w-full h-[80vh] flex items-center justify-center bg-white rounded-md">
        <div className="text-center p-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Unable to render preview</h3>
            <p className="text-gray-500 text-sm mb-4">There was an error generating the PDF preview.</p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Reload Page
            </button>
        </div>
    </div>
);

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, template, customTemplateSettings, diffs, diffView, originalResumeData }) => {
    const pdfDocument = useMemo(() => (
        <ResumePdfDocument
            resumeData={resumeData}
            template={template}
            settings={customTemplateSettings}
            diffs={diffView === 'diff' ? diffs : null}
            diffView={diffView}
            originalResumeData={originalResumeData}
        />
    ), [resumeData, template, customTemplateSettings, diffs, diffView, originalResumeData]);

    // Validate resume data has minimum required fields
    const isValidResume = resumeData.name && resumeData.name.trim().length > 0;

    if (!isValidResume) {
        return (
            <div className="w-full bg-gray-100 rounded-md p-2 sm:p-4">
                <div className="w-full h-[80vh] flex items-center justify-center bg-white rounded-md">
                    <div className="text-center p-8">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Add your name to see preview</h3>
                        <p className="text-gray-400 text-sm">Fill in your resume details to generate a preview.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-100 rounded-md p-2 sm:p-4">
            <div className="w-full overflow-auto rounded-md shadow">
                <ErrorBoundary fallback={<PdfErrorFallback />}>
                    <PDFViewer style={{ width: '100%', height: '80vh' }}>
                        {pdfDocument}
                    </PDFViewer>
                </ErrorBoundary>
            </div>
        </div>
    );
};
