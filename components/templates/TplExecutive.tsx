
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { type ResumeData, Diffs, Experience } from '../../types';
import { useHighlightAnimation } from '../../hooks/useTransitions';

const sectionHeaderVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.16, ease: 'easeOut' } },
};

const Section: React.FC<{ title: string; id: string; children: React.ReactNode; className?: string }> = ({ title, id, children, className }) => (
    <section id={id} data-section={id} className={`py-4 ${className}`}>
        <motion.h2
            variants={sectionHeaderVariants}
            initial="hidden"
            animate="visible"
            className="text-sm font-semibold tracking-widest text-primary uppercase mb-4"
        >
            {title}
        </motion.h2>
        {children}
    </section>
);

const renderContent = (original: string, diffHtml?: string) => {
    if (diffHtml) {
        return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: diffHtml.replace(/\n/g, '<br />') }} />;
    }
    return <div className="prose prose-sm max-w-none">{original.split('\n').map((line, i) => <p key={i} className="mb-1">{line.replace(/- /g, '• ')}</p>)}</div>;
};

const ExperienceItem: React.FC<{ exp: Experience, diffs?: Diffs | null }> = ({ exp, diffs }) => {
    const expHighlightControls = useHighlightAnimation(!!diffs?.experience?.[exp.id]?.description);
    return (
        <div className="print:break-inside-avoid grid grid-cols-12 gap-x-6">
            <div className="col-span-3 text-right">
                 <h3 className="font-semibold text-sm text-gray-800">{exp.role}</h3>
                 <p className="italic text-gray-500 text-xs">{exp.company}</p>
                 <p className="text-gray-400 text-xs font-mono mt-1">{exp.duration}</p>
            </div>
            <div className="col-span-9 border-l-2 border-primary/20 pl-6">
                 <motion.div animate={expHighlightControls} className="text-gray-700 text-xs leading-relaxed rounded">
                    {renderContent(exp.description, diffs?.experience?.[exp.id]?.description)}
                </motion.div>
            </div>
        </div>
    );
};

export const TplExecutive: React.FC<{ resumeData: ResumeData; diffs?: Diffs | null }> = ({ resumeData, diffs }) => {
    const summaryHighlightControls = useHighlightAnimation(!!diffs?.summary);
    
    return (
        <div className="font-serif text-gray-800 bg-white p-4">
             <header className="mb-6">
                <h1 className="text-5xl font-bold text-gray-900">{resumeData.name}</h1>
                <motion.div animate={summaryHighlightControls} className="mt-4 text-gray-600 text-base leading-relaxed border-l-4 border-primary pl-4 rounded">
                    {renderContent(resumeData.summary, diffs?.summary)}
                </motion.div>
            </header>

            <div className="space-y-4">
                <Section title="Experience" id="experience" className="print:break-after-page">
                    <div className="space-y-6">
                        {resumeData.experience.map(exp => (
                            <ExperienceItem key={exp.id} exp={exp} diffs={diffs} />
                        ))}
                    </div>
                </Section>
                 <Section title="Education & Skills" id="education">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                             <h3 className="font-semibold text-gray-800 mb-2">Education</h3>
                            {resumeData.education.map(edu => (
                                <div key={edu.id} className="text-sm print:break-inside-avoid">
                                    <h4 className="font-semibold text-gray-900">{edu.institution}</h4>
                                    <p className="text-gray-600">{edu.degree}, {edu.duration}</p>
                                </div>
                            ))}
                        </div>
                         <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Key Skills</h3>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                                {resumeData.skills.map(skill => (
                                    <li key={skill}>{skill}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                 </Section>
            </div>
             <footer className="text-center mt-8 pt-4 border-t">
                 <div className="flex justify-center flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                    <a href={`mailto:${resumeData.email}`} className="hover:text-primary">{resumeData.email}</a>
                    <span>{resumeData.phone}</span>
                    {resumeData.linkedin && <a href={`https://${resumeData.linkedin}`} className="hover:text-primary">LinkedIn</a>}
                </div>
            </footer>
        </div>
    );
};
