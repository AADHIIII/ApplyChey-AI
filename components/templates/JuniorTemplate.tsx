
import React, { CSSProperties } from 'react';
import { type ResumeData, Diffs, CustomTemplateSettings, Experience } from '../../types';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { LinkedinIcon } from '../icons/LinkedinIcon';
import { GithubIcon } from '../icons/GithubIcon';
import { LinkIcon } from '../icons/LinkIcon';

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <section className={`mb-4 print:break-inside-avoid ${className}`}>
        <h2 className="text-lg font-semibold tracking-wider uppercase border-b-2 pb-1 mb-2" style={{ borderColor: 'var(--custom-primary-color-translucent)', color: 'var(--custom-primary-color)' }}>{title}</h2>
        {children}
    </section>
);

const renderExperienceDescription = (original: string, diffHtml?: string) => {
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


export const JuniorTemplate: React.FC<{ 
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
            <header className="text-center mb-4 border-b pb-4">
                <h1 className="text-4xl font-bold font-charter" style={{ color: 'var(--custom-primary-color)' }}>{resumeData.name}</h1>
                <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
                    {resumeData.email && <a href={`mailto:${resumeData.email}`} className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><EnvelopeIcon className="w-3.5 h-3.5"/>{resumeData.email}</a>}
                    {resumeData.phone && <a href={`tel:${resumeData.phone}`} className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><PhoneIcon className="w-3.5 h-3.5"/>{resumeData.phone}</a>}
                    {resumeData.linkedin && <a href={`https://${resumeData.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><LinkedinIcon className="w-3.5 h-3.5"/>{resumeData.linkedin.replace('linkedin.com/in/', '')}</a>}
                    {resumeData.github && <a href={`https://${resumeData.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><GithubIcon className="w-3.5 h-3.5"/>{resumeData.github.replace('github.com/', '')}</a>}
                    {resumeData.portfolio && <a href={`https://${resumeData.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><LinkIcon className="w-3.5 h-3.5"/>Portfolio</a>}
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

            <Section title="Work Experience">
                {resumeData.experience.map(exp => {
                    const originalExp = originalResumeData?.experience.find(e => e.id === exp.id);
                    return (
                    <div key={exp.id} className="mb-3 print:break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-base font-semibold">{exp.role} at <span className="font-normal">{exp.company}</span></h3>
                            <span className="text-sm font-light text-gray-600">{exp.duration}</span>
                        </div>
                        {renderExperienceDescription(exp.description, diffs?.experience?.[exp.id]?.description)}
                    </div>
                )})}
            </Section>

            {resumeData.projects && resumeData.projects.length > 0 && (
                 <Section title="Projects">
                    {resumeData.projects.map(proj => (
                        <div key={proj.id} className="mb-3 print:break-inside-avoid">
                             <div className="flex justify-between items-baseline">
                                <div>
                                    <h3 className="text-base font-semibold">{proj.name}</h3>
                                    <p className="text-xs font-medium text-gray-600 mb-1">{proj.technologies.join(' · ')}</p>
                                </div>
                                {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:underline" style={{ color: 'var(--custom-primary-color)' }}>Link to Demo</a>}
                            </div>
                            <p className="text-sm text-gray-700">{proj.description}</p>
                        </div>
                    ))}
                 </Section>
            )}

            <Section title="Education">
                {resumeData.education.map(edu => (
                     <div key={edu.id} className="flex justify-between items-baseline mb-1">
                        <p><span className="font-semibold">{edu.degree}</span> at {edu.institution}</p>
                        {!edu.hideDuration && <span className="text-sm font-light text-gray-600">{edu.duration}</span>}
                    </div>
                ))}
            </Section>
            
            {resumeData.publications && resumeData.publications.length > 0 && (
                <Section title="Publications">
                    {resumeData.publications.map(pub => (
                        <div key={pub.id} className="mb-2">
                             <p className="text-sm text-gray-800">
                                <span className="font-semibold">{pub.title}</span> ({pub.year}). {pub.authors.join(', ')}. <em>{pub.venue}</em>.
                                {pub.url && <a href={pub.url} className="ml-1" style={{ color: 'var(--custom-primary-color)' }}>[Link]</a>}
                            </p>
                        </div>
                    ))}
                </Section>
            )}

            <Section title="Skills">
                <p className="text-sm text-gray-700">{resumeData.skills.join(' · ')}</p>
            </Section>

            <footer className="text-center text-xs text-gray-400 mt-6">
                Last updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </footer>
        </div>
    );
};