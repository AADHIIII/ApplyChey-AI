
import React, { CSSProperties } from 'react';
import { type ResumeData, Diffs, CustomTemplateSettings, Experience } from '../../types';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { LinkedinIcon } from '../icons/LinkedinIcon';
import { GithubIcon } from '../icons/GithubIcon';
import { LinkIcon } from '../icons/LinkIcon';

const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-5 print:break-inside-avoid">
        <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: 'var(--custom-primary-color)', borderColor: 'var(--custom-primary-color-translucent)' }}>{title}</h3>
        {children}
    </div>
);

const MainSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
     <section className="mb-5 print:break-inside-avoid">
        <h2 className="text-xl font-bold uppercase tracking-wide pb-2 mb-3" style={{ color: 'var(--custom-primary-color)', borderBottom: '1px solid var(--custom-primary-color-translucent)' }}>{title}</h2>
        {children}
    </section>
);

const renderDescription = (description: string) => (
    <div className="space-y-1.5 mt-2 opacity-90">
        {description.split('\n').filter(line => line.trim().length > 0).map((line, i) => (
            <p key={i} className="pl-4">{line.replace(/^- /, '')}</p>
        ))}
    </div>
);

export const CustomTemplate: React.FC<{ 
    resumeData: ResumeData; 
    diffs?: Diffs | null; 
    settings: CustomTemplateSettings;
    originalResumeData?: ResumeData;
}> = ({ resumeData, settings, originalResumeData }) => {
    
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
        <div style={templateStyle} className="bg-white p-10">
            <div className="grid grid-cols-12 gap-8">
                {/* Sidebar */}
                <aside className="col-span-4 pr-4 border-r" style={{ borderColor: 'var(--custom-primary-color-translucent)' }}>
                    <div className="text-center mt-2 mb-6">
                        <h1 className="text-3xl font-bold font-charter" style={{ color: 'var(--custom-primary-color)' }}>{resumeData.name}</h1>
                        <h2 className="text-md opacity-80 mt-1">{resumeData.experience[0]?.role || 'Professional'}</h2>
                    </div>
                    
                    <SidebarSection title="Profile">
                        <div className="space-y-2 text-xs">
                             {resumeData.email && <p className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--custom-primary-color)' }}/><a href={`mailto:${resumeData.email}`} className="hover:underline break-all">{resumeData.email}</a></p>}
                             {resumeData.phone && <p className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--custom-primary-color)' }}/> {resumeData.phone}</p>}
                             {resumeData.linkedin && <p className="flex items-center gap-2"><LinkedinIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--custom-primary-color)' }}/> <a href={`https://${resumeData.linkedin}`} className="hover:underline break-all">{resumeData.linkedin}</a></p>}
                             {resumeData.github && <p className="flex items-center gap-2"><GithubIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--custom-primary-color)' }}/> <a href={`https://${resumeData.github}`} className="hover:underline break-all">{resumeData.github}</a></p>}
                             {resumeData.portfolio && <p className="flex items-center gap-2"><LinkIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--custom-primary-color)' }}/> <a href={`https://${resumeData.portfolio}`} className="hover:underline break-all">{resumeData.portfolio}</a></p>}
                        </div>
                    </SidebarSection>
                    
                    <SidebarSection title="Skills">
                         <div className="flex flex-wrap gap-1.5">
                            {resumeData.skills.map(skill => (
                                <span key={skill} className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: 'var(--custom-primary-color-translucent)', color: 'var(--custom-primary-color)' }}>{skill}</span>
                            ))}
                        </div>
                    </SidebarSection>

                    <SidebarSection title="Education">
                         {resumeData.education.map(edu => (
                            <div key={edu.id} className="mb-2 text-xs">
                                <h4 className="font-semibold" style={{color: '#111827'}}>{edu.institution}</h4>
                                <p className="opacity-80">{edu.degree}</p>
                                {!edu.hideDuration && <p className="opacity-70 italic">{edu.duration}</p>}
                            </div>
                        ))}
                    </SidebarSection>
                </aside>

                 {/* Main Content */}
                <main className="col-span-8 py-2">
                    <MainSection title="Summary">
                        <p className="opacity-90 leading-relaxed">{resumeData.summary}</p>
                    </MainSection>
                    
                    <MainSection title="Experience">
                        <div className="space-y-5">
                            {resumeData.experience.map(exp => {
                                const originalExp = originalResumeData?.experience.find(e => e.id === exp.id);
                                return (
                                <div key={exp.id} className="print:break-inside-avoid">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-base font-semibold" style={{color: '#111827'}}>{exp.role}</h3>
                                        <span className="text-sm font-medium opacity-70">{exp.duration}</span>
                                    </div>
                                    <h4 className="text-md font-semibold opacity-80 italic mb-1">{exp.company}</h4>
                                    {renderDescription(exp.description)}
                                </div>
                            )})}
                        </div>
                    </MainSection>
                    
                     {resumeData.projects.length > 0 && (
                        <MainSection title="Projects">
                             <div className="space-y-4">
                                {resumeData.projects.map(proj => (
                                    <div key={proj.id} className="print:break-inside-avoid">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-base font-semibold">{proj.name}</h3>
                                            {proj.url && <a href={proj.url} className="text-sm font-semibold hover:underline" style={{ color: 'var(--custom-primary-color)' }}>Visit Project</a>}
                                        </div>
                                        <p className="text-xs font-medium opacity-70 mb-1">{proj.technologies.join(' · ')}</p>
                                        <p className="opacity-90">{proj.description}</p>
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