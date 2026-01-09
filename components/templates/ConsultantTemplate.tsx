import React, { CSSProperties } from 'react';
import { type ResumeData, Diffs, CustomTemplateSettings, Experience } from '../../types';

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <section className={`mb-3 print:break-inside-avoid ${className}`}>
        <h2 className="text-sm font-semibold tracking-widest text-gray-800 uppercase pb-1 mb-2 border-b-2 border-gray-300">{title}</h2>
        {children}
    </section>
);

const renderExperienceDescription = (original: string, diffHtml?: string) => {
    if (diffHtml) {
        return <div className="text-sm text-gray-700 space-y-1" dangerouslySetInnerHTML={{ __html: diffHtml.replace(/\n/g, '<br />') }} />;
    }
    return (
        <div className="text-sm text-gray-700 space-y-1">
            {original.split('\n').filter(line => line.trim().length > 0).map((line, i) => (
                <p key={i} className="pl-4">{line.replace(/^- /, '')}</p>
            ))}
        </div>
    );
};

export const ConsultantTemplate: React.FC<{ 
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
        base: '13px',
        lg: '14px'
    };

    const templateStyle: CSSProperties = {
        '--custom-primary-color': settings.primaryColor,
        '--custom-font-family': fontFamilies[settings.fontFamily],
        '--custom-font-size': fontSizes[settings.fontSize],
        fontFamily: 'var(--custom-font-family)',
        fontSize: 'var(--custom-font-size)',
        color: '#1f2937' // gray-800
    } as CSSProperties;
    
    return (
        <div style={templateStyle} className="bg-white p-10">
            <header className="text-center mb-3">
                <h1 className="text-3xl font-bold">{resumeData.name}</h1>
                <div className="text-xs text-gray-600 mt-1">
                    <span>{resumeData.phone}</span>
                    <span className="mx-2">|</span>
                    <span>{resumeData.email}</span>
                    <span className="mx-2">|</span>
                    <a href={`https://${resumeData.linkedin}`} className="hover:underline" style={{ color: 'var(--custom-primary-color)'}}>LinkedIn</a>
                    {resumeData.portfolio && <> <span className="mx-2">|</span> <a href={`https://${resumeData.portfolio}`} className="hover:underline" style={{ color: 'var(--custom-primary-color)'}}>Portfolio</a></>}
                </div>
            </header>
            <div className="border-b border-gray-400 mb-3" />
            
            <Section title="Professional Profile">
                <div className="text-sm text-gray-700">
                    {diffs?.summary ? (
                        <div dangerouslySetInnerHTML={{ __html: diffs.summary.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <p>{resumeData.summary}</p>
                    )}
                </div>
            </Section>

            <Section title="Experience">
                {resumeData.experience.map(exp => {
                    const originalExp = originalResumeData?.experience.find(e => e.id === exp.id);
                    return (
                    <div key={exp.id} className="mb-2 print:break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-sm font-bold">{exp.company} &mdash; <span className="italic font-normal">{exp.role}</span></h3>
                            <span className="text-xs font-light text-gray-600">{exp.duration}</span>
                        </div>
                        <div className="mt-1">
                            {renderExperienceDescription(exp.description, diffs?.experience?.[exp.id]?.description)}
                        </div>
                    </div>
                )})}
            </Section>

            <Section title="Education">
                {resumeData.education.map(edu => (
                    <div key={edu.id} className="mb-1 text-sm">
                        <div className="flex justify-between items-baseline">
                            <p><span className="font-bold">{edu.institution}</span> &mdash; {edu.degree}</p>
                            {!edu.hideDuration && <span className="text-xs font-light text-gray-600">{edu.duration}</span>}
                        </div>
                    </div>
                ))}
            </Section>

            <Section title="Skills & Certifications">
                 <div className="flex flex-wrap gap-1">
                    {resumeData.skills.map(skill => (
                        <span key={skill} className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">{skill}</span>
                    ))}
                </div>
                {resumeData.certifications.length > 0 && (
                     <p className="text-sm text-gray-700 mt-2">
                        <span className="font-bold">Certifications:</span> {resumeData.certifications.map(c => `${c.name} (${c.issuer})`).join(', ')}.
                    </p>
                )}
            </Section>

        </div>
    );
};