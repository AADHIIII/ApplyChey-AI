import React from 'react';
import { type ResumeData, Diffs } from '../../types';

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string, pageBreak?: boolean }> = ({ title, children, className, pageBreak }) => (
    <section className={`mb-5 ${pageBreak ? 'print:break-before-page' : ''} print:break-inside-avoid ${className}`}>
        <h2 className="text-xl font-bold font-charter text-gray-800 border-b-2 border-gray-400 pb-1 mb-3">{title}</h2>
        {children}
    </section>
);

const renderDescription = (description: string) => (
    <ul className="list-disc list-inside text-base text-gray-700 space-y-2 mt-2">
        {description.split('\n').filter(line => line.trim().length > 0).map((line, i) => (
            <li key={i} className="pl-2">{line.replace(/^- /, '')}</li>
        ))}
    </ul>
);

export const SeniorTemplate: React.FC<{ resumeData: ResumeData; diffs?: Diffs | null }> = ({ resumeData }) => {
    return (
        <div className="font-serif bg-white p-2 text-gray-900 text-base leading-relaxed">
            <header className="text-center mb-6">
                <h1 className="text-5xl font-bold font-charter tracking-tight">{resumeData.name}</h1>
                <h2 className="text-2xl text-gray-600 mt-1">{resumeData.experience[0]?.role || 'Executive Leader'}</h2>
                 <div className="flex justify-center flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 mt-3">
                    <span>{resumeData.email}</span>
                    <span>{resumeData.phone}</span>
                    {resumeData.linkedin && <a href={`https://${resumeData.linkedin}`} className="text-primary hover:underline">LinkedIn</a>}
                    {resumeData.github && <a href={`https://${resumeData.github}`} className="text-primary hover:underline">GitHub</a>}
                </div>
            </header>
            
            <Section title="Executive Summary">
                <p className="text-base text-gray-800">{resumeData.summary}</p>
            </Section>

            <Section title="Core Competencies">
                <div className="columns-2 md:columns-3">
                    <ul className="list-disc list-inside text-base text-gray-700">
                        {resumeData.skills.map(skill => (
                            <li key={skill} className="mb-1">{skill}</li>
                        ))}
                    </ul>
                </div>
            </Section>
            
            <Section title="Professional Experience" pageBreak>
                <div className="space-y-6">
                    {resumeData.experience.map(exp => (
                        <div key={exp.id} className="print:break-inside-avoid">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-lg font-semibold">{exp.role}, <span className="font-normal italic text-gray-700">{exp.company}</span></h3>
                                <span className="text-base font-light text-gray-600">{exp.duration}</span>
                            </div>
                            {renderDescription(exp.description)}
                        </div>
                    ))}
                </div>
            </Section>

            {resumeData.projects && resumeData.projects.length > 0 && (
                 <Section title="Key Projects & Accomplishments" pageBreak>
                    <div className="space-y-5">
                        {resumeData.projects.map(proj => (
                            <div key={proj.id} className="print:break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-semibold">{proj.name}</h3>
                                    {proj.url && <a href={proj.url} className="text-base text-primary hover:underline">Link</a>}
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">{proj.technologies.join(' · ')}</p>
                                <p className="text-base text-gray-700">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                 </Section>
            )}

            <Section title="Education & Certifications" pageBreak>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Education</h3>
                         {resumeData.education.map(edu => (
                            <div key={edu.id} className="mb-2">
                                <h4 className="font-semibold text-gray-800">{edu.institution}</h4>
                                <p className="text-gray-700">{edu.degree}, {edu.duration}</p>
                            </div>
                        ))}
                    </div>
                    {resumeData.certifications && resumeData.certifications.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                            <ul className="list-disc list-inside text-gray-700">
                                {resumeData.certifications.map(cert => (
                                    <li key={cert.id}>{cert.name} - {cert.issuer} ({cert.date})</li>
                                ))}
                            </ul>
                        </div>
                    )}
                 </div>
            </Section>

            {resumeData.publications && resumeData.publications.length > 0 && (
                <Section title="Publications & Thought Leadership">
                     <ul className="space-y-2">
                        {resumeData.publications.map(pub => (
                            <li key={pub.id}>
                                <span className="font-semibold">{pub.title}</span> ({pub.year}). {pub.authors.join(', ')}. <em>{pub.venue}</em>.
                                {pub.url && <a href={pub.url} className="text-primary hover:underline ml-1">[Link]</a>}
                            </li>
                        ))}
                    </ul>
                </Section>
            )}
        </div>
    );
};
