import React, { CSSProperties } from 'react';
import { type ResumeData, Diffs, CustomTemplateSettings, Experience } from '../../types';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { LinkedinIcon } from '../icons/LinkedinIcon';
import { GithubIcon } from '../icons/GithubIcon';
import { LinkIcon } from '../icons/LinkIcon';

const MainSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
     <section className="mb-6 print:break-inside-avoid">
        <h2 className="text-xl font-bold uppercase tracking-wider pb-2 mb-4" style={{ color: 'var(--custom-primary-color)', borderBottom: '2px solid var(--custom-primary-color-translucent)' }}>{title}</h2>
        {children}
    </section>
);

const renderExperienceDescription = (description: string, diffHtml?: string) => {
    if (diffHtml) {
        return <div className="text-sm text-gray-700 space-y-1.5 mt-2" dangerouslySetInnerHTML={{ __html: diffHtml.replace(/\n/g, '<br />') }} />;
    }
    return (
        <div className="text-sm text-gray-700 space-y-1.5 mt-2">
            {description.split('\n').filter(line => line.trim().length > 0).map((line, i) => <p key={i} className="pl-4">{line.replace(/^- /, '')}</p>)}
        </div>
    );
};

export const CreativeTemplate: React.FC<{ 
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
        <div style={templateStyle} className="bg-white text-gray-900 text-sm">
            <div className="grid grid-cols-12 gap-8 p-10">
                {/* Sidebar */}
                <aside className="col-span-4 py-4">
                     <div className="text-left mb-8">
                        <h1 className="text-4xl font-bold font-charter" style={{ color: 'var(--custom-primary-color)' }}>{resumeData.name}</h1>
                        <h2 className="text-lg text-gray-600 mt-1">{resumeData.experience[0]?.role || 'Professional'}</h2>
                    </div>
                    
                    <div className="space-y-5">
                        <div>
                            <h3 className="font-bold text-sm uppercase mb-2">About Me</h3>
                            <div className="text-sm text-gray-700">
                                {diffs?.summary ? (
                                    <div dangerouslySetInnerHTML={{ __html: diffs.summary.replace(/\n/g, '<br/>') }} />
                                ) : (
                                    <p>{resumeData.summary}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm uppercase mb-2">Contact</h3>
                            <div className="space-y-2 text-xs">
                                 {resumeData.email && <p className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--custom-primary-color)' }}/> <a href={`mailto:${resumeData.email}`} className="hover:underline break-all">{resumeData.email}</a></p>}
                                 {resumeData.phone && <p className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--custom-primary-color)' }}/> {resumeData.phone}</p>}
                                 {resumeData.linkedin && <p className="flex items-center gap-2"><LinkedinIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--custom-primary-color)' }}/> <a href={`https://${resumeData.linkedin}`} className="hover:underline break-words">{resumeData.linkedin.replace('linkedin.com/in/','')}</a></p>}
                                 {resumeData.github && <p className="flex items-center gap-2"><GithubIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--custom-primary-color)' }}/> <a href={`https://${resumeData.github}`} className="hover:underline break-words">{resumeData.github.replace('github.com/','')}</a></p>}
                                 {resumeData.portfolio && <p className="flex items-center gap-2"><LinkIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--custom-primary-color)' }}/> <a href={`https://${resumeData.portfolio}`} className="hover:underline break-words">Portfolio</a></p>}
                            </div>
                        </div>
                         <div>
                            <h3 className="font-bold text-sm uppercase mb-2">Skills</h3>
                             <div className="flex flex-wrap gap-1.5">
                                {resumeData.skills.map(skill => (
                                    <span key={skill} className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: 'var(--custom-primary-color-translucent)', color: 'var(--custom-primary-color)' }}>{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="col-span-8 py-4">
                    <MainSection title="Work Experience">
                        <div className="space-y-6">
                            {resumeData.experience.map(exp => {
                                const originalExp = originalResumeData?.experience.find(e => e.id === exp.id);
                                return (
                                <div key={exp.id} className="print:break-inside-avoid">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-lg font-semibold text-gray-800">{exp.role}</h3>
                                        <span className="text-sm font-medium text-gray-500">{exp.duration}</span>
                                    </div>
                                    <h4 className="text-md font-semibold text-gray-600 italic mb-1">{exp.company}</h4>
                                    {renderExperienceDescription(exp.description, diffs?.experience?.[exp.id]?.description)}
                                </div>
                            )})}
                        </div>
                    </MainSection>
                    
                     {resumeData.projects && resumeData.projects.length > 0 && (
                        <MainSection title="Projects">
                             <div className="space-y-5">
                                {resumeData.projects.map(proj => (
                                    <div key={proj.id} className="print:break-inside-avoid">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-lg font-semibold">{proj.name}</h3>
                                            {proj.url && <a href={proj.url} className="text-sm font-semibold hover:underline" style={{ color: 'var(--custom-primary-color)' }}>Visit Project</a>}
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">{proj.technologies.join(' · ')}</p>
                                        <p className="text-sm text-gray-700">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </MainSection>
                    )}
                </main>
            </div>
        </div>
    );
};