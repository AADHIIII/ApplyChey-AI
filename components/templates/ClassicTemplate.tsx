
import React, { CSSProperties } from 'react';
import { type ResumeData, Diffs, CustomTemplateSettings, Experience } from '../../types';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { LinkedinIcon } from '../icons/LinkedinIcon';
import { GithubIcon } from '../icons/GithubIcon';
import { LinkIcon } from '../icons/LinkIcon';

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <section className={`mb-4 print:break-inside-avoid ${className}`}>
        <h2 className="text-xl font-bold pb-1 mb-2 font-charter" style={{ borderBottom: '2px solid var(--custom-primary-color)', color: 'var(--custom-primary-color)' }}>{title}</h2>
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


export const ClassicTemplate: React.FC<{ 
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
        '--custom-font-family': fontFamilies[settings.fontFamily],
        '--custom-font-size': fontSizes[settings.fontSize],
        fontFamily: 'var(--custom-font-family)',
        fontSize: 'var(--custom-font-size)',
        color: '#374151' // gray-700
    } as CSSProperties;
    
    return (
        <div style={templateStyle} className="bg-white p-10">
            <header className="text-center mb-4">
                <h1 className="text-4xl font-bold font-charter" style={{ color: '#111827'}}>{resumeData.name}</h1>
                <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
                    {resumeData.email && <a href={`mailto:${resumeData.email}`} className="flex items-center gap-1 hover:text-[var(--custom-primary-color)]"><EnvelopeIcon className="w-3 h-3"/>{resumeData.email}</a>}
                    {resumeData.phone && <span className="flex items-center gap-1"><PhoneIcon className="w-3 h-3"/>{resumeData.phone}</span>}
                    {resumeData.linkedin && <a href={resumeData.linkedin} className="flex items-center gap-1 hover:text-[var(--custom-primary-color)]"><LinkedinIcon className="w-3 h-3"/>LinkedIn</a>}
                    {resumeData.github && <a href={resumeData.github} className="flex items-center gap-1 hover:text-[var(--custom-primary-color)]"><GithubIcon className="w-3 h-3"/>GitHub</a>}
                    {resumeData.portfolio && <a href={resumeData.portfolio} className="flex items-center gap-1 hover:text-[var(--custom-primary-color)]"><LinkIcon className="w-3 h-3"/>Portfolio</a>}
                </div>
            </header>
            
            <Section title="Summary">
                <div className="text-sm text-gray-700">
                    {diffs?.summary ? (
                        <div dangerouslySetInnerHTML={{ __html: diffs.summary.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <p>{resumeData.summary}</p>
                    )}
                </div>
            </Section>

            <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map(skill => (
                        <span key={skill} className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{skill}</span>
                    ))}
                </div>
            </Section>

            <Section title="Experience">
                {resumeData.experience.map(exp => {
                    const originalExp = originalResumeData?.experience.find(e => e.id === exp.id);
                    return (
                    <div key={exp.id} className="mb-3 print:break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-base font-semibold">{exp.role}</h3>
                            <span className="text-sm font-light text-gray-600">{exp.duration}</span>
                        </div>
                        <h4 className="text-sm font-medium italic text-gray-700">{exp.company}</h4>
                        <div className="mt-1">
                            {renderExperienceDescription(exp.description, diffs?.experience?.[exp.id]?.description)}
                        </div>
                    </div>
                )})}
            </Section>

            {resumeData.projects.length > 0 && (
                 <Section title="Projects">
                    {resumeData.projects.map(proj => (
                        <div key={proj.id} className="mb-3 print:break-inside-avoid">
                             <div className="flex justify-between items-baseline">
                                <h3 className="text-base font-semibold">{proj.name}</h3>
                                {proj.url && <a href={proj.url} className="text-sm hover:underline" style={{ color: 'var(--custom-primary-color)' }}>Link</a>}
                            </div>
                            <p className="text-xs font-medium text-gray-600 mb-1">{proj.technologies.join(', ')}</p>
                            <p className="text-sm text-gray-700">{proj.description}</p>
                        </div>
                    ))}
                 </Section>
            )}

            <Section title="Education">
                {resumeData.education.map(edu => (
                    <div key={edu.id} className="mb-2 print:break-inside-avoid">
                         <div className="flex justify-between items-baseline">
                            <h3 className="text-base font-semibold">{edu.institution}</h3>
                            {!edu.hideDuration && <span className="text-sm font-light text-gray-600">{edu.duration}</span>}
                        </div>
                        <p className="text-sm italic text-gray-700">{edu.degree}</p>
                    </div>
                ))}
            </Section>

             {resumeData.certifications.length > 0 && (
                <Section title="Certifications">
                    <ul className="list-disc list-inside text-sm text-gray-700">
                        {resumeData.certifications.map(cert => (
                            <li key={cert.id}>{cert.name} ({cert.issuer}, {cert.date})</li>
                        ))}
                    </ul>
                </Section>
            )}
        </div>
    );
};