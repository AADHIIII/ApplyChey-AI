
import React, { CSSProperties } from 'react';
import { type ResumeData, Diffs, CustomTemplateSettings, Experience } from '../../types';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { LinkedinIcon } from '../icons/LinkedinIcon';
import { LinkIcon } from '../icons/LinkIcon';

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <section className={`mb-3 print:break-inside-avoid ${className}`}>
        <h2 className="text-base font-semibold tracking-wider uppercase border-b pb-1 mb-2" style={{ color: 'var(--custom-primary-color)', borderColor: 'var(--custom-primary-color-translucent)' }}>{title}</h2>
        {children}
    </section>
);

const renderDiffContent = (original: string, diffHtml?: string) => {
    if (diffHtml) {
        return <div className="text-sm text-gray-700 space-y-1 mt-1" dangerouslySetInnerHTML={{ __html: diffHtml.replace(/\n/g, '<br />') }} />;
    }
    return (
        <div className="text-sm text-gray-700 space-y-1 mt-1">
            {original.split('\n').filter(line => line.trim().length > 0).map((line, i) => (
                <p key={i} className="pl-4">{line.replace(/^- /, '')}</p>
            ))}
        </div>
    );
};


export const AcademicTemplate: React.FC<{
    resumeData: ResumeData;
    diffs?: Diffs | null;
    settings: CustomTemplateSettings;
    originalResumeData?: ResumeData;
}> = ({ resumeData, diffs, settings, originalResumeData }) => {

    const fontFamilies = {
        charter: '"Charter", serif',
        sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    };

    const fontSizes = {
        sm: '12px',
        base: '14px',
        lg: '16px'
    };

    const templateStyle: CSSProperties = {
        '--custom-primary-color': settings.primaryColor,
        '--custom-primary-color-translucent': settings.primaryColor + '4D',
        '--custom-font-family': fontFamilies[settings.fontFamily],
        '--custom-font-size': fontSizes[settings.fontSize],
        fontFamily: 'var(--custom-font-family)',
        fontSize: 'var(--custom-font-size)',
        color: '#374151' // gray-700
    } as CSSProperties;

    return (
        <div style={templateStyle} className="bg-white p-10 text-gray-900 text-sm">
            <header className="text-center mb-4">
                <h1 className="text-4xl font-bold font-charter">{resumeData.name}</h1>
                <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
                    {resumeData.email && <a href={`mailto:${resumeData.email}`} className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><EnvelopeIcon className="w-3.5 h-3.5" />{resumeData.email}</a>}
                    {resumeData.phone && <span className="flex items-center gap-1.5"><PhoneIcon className="w-3.5 h-3.5" />{resumeData.phone}</span>}
                    {resumeData.linkedin && <a href={`https://${resumeData.linkedin}`} className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><LinkedinIcon className="w-3.5 h-3.5" />LinkedIn</a>}
                    {resumeData.portfolio && <a href={`https://${resumeData.portfolio}`} className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><LinkIcon className="w-3.5 h-3.5" />Portfolio</a>}
                </div>
            </header>

            <Section title="Education">
                {resumeData.education.map(edu => (
                    <div key={edu.id} className="mb-2">
                        <div className="flex justify-between items-baseline">
                            <p className="font-semibold">{edu.institution}</p>
                        </div>
                    </div>
                ))}
            </Section>
        </div>
    );
};