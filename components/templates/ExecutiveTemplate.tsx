
import React, { CSSProperties } from 'react';
import { type ResumeData, Diffs, CustomTemplateSettings, Experience } from '../../types';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { LinkedinIcon } from '../icons/LinkedinIcon';
import { GithubIcon } from '../icons/GithubIcon';
import { LinkIcon } from '../icons/LinkIcon';

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <section className={`mb-4 print:break-inside-avoid ${className}`}>
        <h2 className="text-sm font-bold uppercase tracking-widest pb-1 mb-3" style={{ borderBottom: '1px solid var(--custom-primary-color)', color: 'var(--custom-primary-color)' }}>
            {title}
        </h2>
        {children}
    </section>
);

const renderExperienceDescription = (original: string, diffHtml?: string) => {
    if (diffHtml) {
        return <div className="text-gray-700 space-y-1" dangerouslySetInnerHTML={{ __html: diffHtml.replace(/\n/g, '<br />') }} />;
    }
    return (
        <div className="text-gray-700 space-y-1">
            {original.split('\n').filter(line => line.trim().length > 0).map((line, i) => (
                <p key={i} className="pl-4">{line.replace(/^- /, '')}</p>
            ))}
        </div>
    );
};

export const ExecutiveTemplate: React.FC<{
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
            <header className="text-center mb-6">
                <h1 className="text-4xl font-extrabold font-charter tracking-tight" style={{ color: '#111827' }}>{resumeData.name}</h1>
                <h2 className="text-lg text-gray-600 mt-1 font-medium">{resumeData.experience[0]?.role || 'Professional'}</h2>
                <div className="flex justify-center flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 mt-2">
                    {resumeData.email && <a href={`mailto:${resumeData.email}`} className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><EnvelopeIcon className="w-3.5 h-3.5" />{resumeData.email}</a>}
                    {resumeData.phone && <span className="flex items-center gap-1.5"><PhoneIcon className="w-3.5 h-3.5" />{resumeData.phone}</span>}
                    {resumeData.linkedin && <a href={`https://${resumeData.linkedin}`} className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><LinkedinIcon className="w-3.5 h-3.5" />LinkedIn</a>}
                    {resumeData.github && <a href={`https://${resumeData.github}`} className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><GithubIcon className="w-3.5 h-3.5" />GitHub</a>}
                    {resumeData.portfolio && <a href={`https://${resumeData.portfolio}`} className="flex items-center gap-1.5 hover:text-[var(--custom-primary-color)]"><LinkIcon className="w-3.5 h-3.5" />Portfolio</a>}
                </div>
            </header>

            <Section title="Summary">
                <div className="text-sm text-gray-700 leading-relaxed">
                    {diffs?.summary ? (
                        <div dangerouslySetInnerHTML={{ __html: diffs.summary.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <p>{resumeData.summary}</p>
                    )}
                </div>
            </Section>

            <Section title="Experience">
                <div className="space-y-4">
                    {resumeData.experience.map(exp => {
                        const originalExp = originalResumeData?.experience.find(e => e.id === exp.id);
                        return (
                            <div key={exp.id} className="print:break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-base font-bold text-gray-800">{exp.role}</h3>
                                    <span className="text-sm font-light text-gray-600">{exp.duration}</span>
                                </div>
                                <h4 className="text-sm font-semibold italic" style={{ color: 'var(--custom-primary-color)' }}>{exp.company}</h4>
                                <div className="mt-1 text-sm">
                                    {renderExperienceDescription(exp.description, diffs?.experience?.[exp.id]?.description)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Section>

            {resumeData.projects.length > 0 && (
                <Section title="Projects">
                    <div className="space-y-3">
                        {resumeData.projects.map(proj => (
                            <div key={proj.id} className="print:break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-base font-bold text-gray-800">{proj.name}</h3>
                                    {proj.url && <a href={proj.url} className="text-sm hover:underline" style={{ color: 'var(--custom-primary-color)' }}>Link</a>}
                                </div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">{proj.technologies.join(' · ')}</p>
                                <p className="text-sm text-gray-700">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            <Section title="Education & Skills">
                <div className="grid grid-cols-2 gap-x-8">
                    <div>
                        {resumeData.education.map(edu => (
                            <div key={edu.id} className="mb-2 text-sm">
                                <h3 className="text-base font-bold text-gray-800">{edu.institution}</h3>
                                <p className="italic text-gray-700">{edu.degree}</p>
                                {!edu.hideDuration && <p className="text-xs font-light text-gray-600">{edu.duration}</p>}
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map(skill => (
                                <span key={skill} className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{skill}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
};