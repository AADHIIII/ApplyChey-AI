
import React, { CSSProperties } from 'react';
import { type ResumeData, Diffs, CustomTemplateSettings, Experience } from '../../types';

const RSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <section className={`mb-2 print:break-inside-avoid ${className}`}>
        <h2 className="text-sm font-bold text-gray-700 tracking-widest uppercase pb-1" style={{ color: 'var(--custom-primary-color)' }}>{title}</h2>
        <div className="border-b-2" style={{ borderColor: 'var(--custom-primary-color)' }} />
        <div className="mt-2">
            {children}
        </div>
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

export const FaangTemplate: React.FC<{ 
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
        sm: '11px',
        base: '12px',
        lg: '13px'
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
                    <span>{resumeData.phone} | {resumeData.email}</span>
                    <br/>
                    <a href={`https://${resumeData.linkedin}`} className="hover:underline" style={{ color: 'var(--custom-primary-color)'}}>LinkedIn</a> | <a href={`https://${resumeData.github}`} className="hover:underline" style={{ color: 'var(--custom-primary-color)'}}>GitHub</a> | <a href={`https://${resumeData.portfolio}`} className="hover:underline" style={{ color: 'var(--custom-primary-color)'}}>Portfolio</a>
                </div>
            </header>
            
            <RSection title="Objective">
                <div className="text-sm text-gray-700">
                    {diffs?.summary ? (
                        <div dangerouslySetInnerHTML={{ __html: diffs.summary.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <p>{resumeData.summary}</p>
                    )}
                </div>
            </RSection>

            <RSection title="Education">
                {resumeData.education.map(edu => (
                    <div key={edu.id} className="mb-1 text-sm">
                        <div className="flex justify-between items-baseline">
                            <p className="font-bold">{edu.institution}</p>
                            {!edu.hideDuration && <span className="text-xs font-light text-gray-600">{edu.duration}</span>}
                        </div>
                        <p className="italic text-gray-700">{edu.degree}</p>
                    </div>
                ))}
                {resumeData.coursework.length > 0 && (
                     <p className="text-xs text-gray-600 mt-1">
                        <span className="font-bold">Relevant Coursework:</span> {resumeData.coursework.join(', ')}
                    </p>
                )}
            </RSection>
            
            <RSection title="Skills">
                <p className="text-sm text-gray-700">
                    {[...resumeData.skills, ...resumeData.technologies].join(' | ')}
                </p>
            </RSection>

            <RSection title="Experience">
                {resumeData.experience.map(exp => {
                    const originalExp = originalResumeData?.experience.find(e => e.id === exp.id);
                    return (
                    <div key={exp.id} className="mb-2 print:break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-sm font-bold">{exp.role}</h3>
                            <span className="text-xs font-light text-gray-600">{exp.duration}</span>
                        </div>
                        <h4 className="text-sm font-medium italic text-gray-700">{exp.company}</h4>
                        <div className="mt-1">
                            {renderExperienceDescription(exp.description, diffs?.experience?.[exp.id]?.description)}
                        </div>
                    </div>
                )})}
            </RSection>

            {resumeData.projects.length > 0 && (
                 <RSection title="Projects">
                    {resumeData.projects.map(proj => (
                        <div key={proj.id} className="mb-2 print:break-inside-avoid">
                             <div className="flex justify-between items-baseline">
                                <h3 className="text-sm font-bold">{proj.name}</h3>
                                {proj.url && <a href={proj.url} className="text-xs hover:underline" style={{ color: 'var(--custom-primary-color)' }}>Link</a>}
                            </div>
                            <p className="text-xs font-medium text-gray-600 mb-1">{proj.technologies.join(', ')}</p>
                            <p className="text-sm text-gray-700">{proj.description}</p>
                        </div>
                    ))}
                 </RSection>
            )}

            {(resumeData.service.length > 0 || resumeData.societies.length > 0) && (
                 <RSection title="Leadership & Activities">
                     <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                         {resumeData.service.map(s => <li key={s.id}>{s.role}, {s.organization} ({s.duration})</li>)}
                         {resumeData.societies.map(s => <li key={s}>{s}</li>)}
                     </ul>
                 </RSection>
            )}

        </div>
    );
};