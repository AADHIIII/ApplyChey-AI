
import React from 'react';
import { type ResumeData } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface ProfileEditorProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  onBack: () => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex justify-between items-center border-b border-border pb-2 mb-4 mt-8 first:mt-0">
    <h3 className="text-lg font-semibold text-card-foreground">{children}</h3>
  </div>
);

const FieldWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-3">
    {children}
  </div>
);

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
  <FieldWrapper>
    <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
    />
  </FieldWrapper>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number }> = ({ label, value, onChange, rows=4 }) => (
 <FieldWrapper>
    <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full p-3 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
    />
  </FieldWrapper>
);

const RemoveButton: React.FC<{ onClick: () => void; }> = ({ onClick }) => (
    <button onClick={onClick} type="button" className="text-destructive hover:text-destructive/90 transition p-1" aria-label="Remove item">
        <TrashIcon className="w-4 h-4" />
    </button>
);

const AddButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button onClick={onClick} type="button" className="flex items-center text-sm font-semibold text-primary hover:text-primary/90 transition mt-2">
        <PlusIcon className="w-4 h-4 mr-1" /> {children}
    </button>
);

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ resumeData, setResumeData, onBack }) => {

  const handleBasicChange = (field: keyof ResumeData, value: string) => {
    setResumeData({ ...resumeData, [field]: value });
  };

  const handleArrayChange = (section: keyof ResumeData, index: number, field: string, value: any) => {
    setResumeData({
        ...resumeData,
        [section]: (resumeData[section] as any[]).map((item, i) => i === index ? { ...item, [field]: value } : item)
    });
  };

  const handleAddItem = (section: keyof ResumeData, newItem: any) => {
    setResumeData({ ...resumeData, [section]: [...(resumeData[section] as any[]), newItem] });
  };

  const handleRemoveItem = (section: keyof ResumeData, index: number) => {
    setResumeData({ ...resumeData, [section]: (resumeData[section] as any[]).filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-secondary transition-colors">
                <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-2xl font-bold font-charter">Manage Profile</h1>
        </div>

        <div className="bg-card p-6 shadow-md rounded-lg border border-border">
            {/* Personal Details */}
            <SectionTitle>Personal Details</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Full Name" value={resumeData.name} onChange={e => handleBasicChange('name', e.target.value)} />
                <InputField label="Email" value={resumeData.email} onChange={e => handleBasicChange('email', e.target.value)} />
                <InputField label="Phone Number" value={resumeData.phone} onChange={e => handleBasicChange('phone', e.target.value)} />
                <InputField label="LinkedIn URL" value={resumeData.linkedin} onChange={e => handleBasicChange('linkedin', e.target.value)} />
                <InputField label="GitHub URL" value={resumeData.github} onChange={e => handleBasicChange('github', e.target.value)} />
                <InputField label="Portfolio URL" value={resumeData.portfolio} onChange={e => handleBasicChange('portfolio', e.target.value)} />
            </div>

            {/* Summary */}
            <SectionTitle>Professional Summary</SectionTitle>
            <p className="text-sm text-muted-foreground mb-2">This is your base summary. The AI will tailor this for specific jobs.</p>
            <TextAreaField label="" value={resumeData.summary} onChange={e => handleBasicChange('summary', e.target.value)} rows={4} />

            {/* Education */}
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                    <div key={edu.id} className="p-4 border border-border rounded-lg bg-secondary/20 relative">
                            <div className="absolute top-3 right-3"><RemoveButton onClick={() => handleRemoveItem('education', index)}/></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Institution" value={edu.institution} onChange={e => handleArrayChange('education', index, 'institution', e.target.value)} />
                            <InputField label="Degree" value={edu.degree} onChange={e => handleArrayChange('education', index, 'degree', e.target.value)} />
                            <InputField label="Duration" value={edu.duration} onChange={e => handleArrayChange('education', index, 'duration', e.target.value)} />
                            <div className="flex items-end pb-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={!!edu.hideDuration} onChange={e => handleArrayChange('education', index, 'hideDuration', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span className="text-sm text-muted-foreground">Hide Duration</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
                <AddButton onClick={() => handleAddItem('education', {id: `edu${Date.now()}`, institution: '', degree: '', duration: ''})}>Add Education</AddButton>
            </div>

            {/* Projects */}
            <SectionTitle>Projects</SectionTitle>
             <div className="space-y-4">
                {resumeData.projects.map((proj, index) => (
                    <div key={proj.id} className="p-4 border border-border rounded-lg bg-secondary/20 relative">
                            <div className="absolute top-3 right-3"><RemoveButton onClick={() => handleRemoveItem('projects', index)}/></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <InputField label="Project Name" value={proj.name} onChange={e => handleArrayChange('projects', index, 'name', e.target.value)} />
                                <InputField label="Project URL" value={proj.url} onChange={e => handleArrayChange('projects', index, 'url', e.target.value)} />
                                <div className="col-span-1 md:col-span-2">
                                     <InputField label="Technologies (comma-separated)" value={proj.technologies.join(', ')} onChange={e => handleArrayChange('projects', index, 'technologies', e.target.value.split(',').map((s: string) => s.trim()))} />
                                </div>
                            </div>
                            <TextAreaField label="Description" value={proj.description} onChange={e => handleArrayChange('projects', index, 'description', e.target.value)} rows={3} />
                    </div>
                ))}
                <AddButton onClick={() => handleAddItem('projects', {id: `proj${Date.now()}`, name: '', url: '', technologies: [], description: ''})}>Add Project</AddButton>
            </div>

            {/* Certifications */}
            <SectionTitle>Certifications</SectionTitle>
            <div className="space-y-4">
                {resumeData.certifications.map((cert, index) => (
                    <div key={cert.id} className="p-4 border border-border rounded-lg bg-secondary/20 relative">
                            <div className="absolute top-3 right-3"><RemoveButton onClick={() => handleRemoveItem('certifications', index)}/></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Name" value={cert.name} onChange={e => handleArrayChange('certifications', index, 'name', e.target.value)} />
                            <InputField label="Issuer" value={cert.issuer} onChange={e => handleArrayChange('certifications', index, 'issuer', e.target.value)} />
                            <InputField label="Date" value={cert.date} onChange={e => handleArrayChange('certifications', index, 'date', e.target.value)} />
                            </div>
                    </div>
                ))}
                    <AddButton onClick={() => handleAddItem('certifications', {id: `cert${Date.now()}`, name: '', issuer: '', date: ''})}>Add Certification</AddButton>
            </div>

             {/* Publications */}
            <SectionTitle>Publications</SectionTitle>
            <div className="space-y-4">
                {resumeData.publications.map((pub, index) => (
                    <div key={pub.id} className="p-4 border border-border rounded-lg bg-secondary/20 relative">
                            <div className="absolute top-3 right-3"><RemoveButton onClick={() => handleRemoveItem('publications', index)}/></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Title" value={pub.title} onChange={e => handleArrayChange('publications', index, 'title', e.target.value)} />
                            <InputField label="Venue" value={pub.venue} onChange={e => handleArrayChange('publications', index, 'venue', e.target.value)} />
                            <InputField label="Year" value={pub.year} onChange={e => handleArrayChange('publications', index, 'year', e.target.value)} />
                            <InputField label="Authors" value={pub.authors.join(', ')} onChange={e => handleArrayChange('publications', index, 'authors', e.target.value.split(',').map((s: string) => s.trim()))} />
                            </div>
                    </div>
                ))}
                    <AddButton onClick={() => handleAddItem('publications', {id: `pub${Date.now()}`, title: '', venue: '', year: '', authors: []})}>Add Publication</AddButton>
            </div>
            
             {/* Awards */}
            <SectionTitle>Awards</SectionTitle>
            <div className="space-y-4">
                {resumeData.awards.map((award, index) => (
                    <div key={award.id} className="p-4 border border-border rounded-lg bg-secondary/20 relative">
                            <div className="absolute top-3 right-3"><RemoveButton onClick={() => handleRemoveItem('awards', index)}/></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Award Name" value={award.name} onChange={e => handleArrayChange('awards', index, 'name', e.target.value)} />
                            <InputField label="Issuer" value={award.issuer} onChange={e => handleArrayChange('awards', index, 'issuer', e.target.value)} />
                            <InputField label="Date" value={award.date} onChange={e => handleArrayChange('awards', index, 'date', e.target.value)} />
                            </div>
                    </div>
                ))}
                    <AddButton onClick={() => handleAddItem('awards', {id: `award${Date.now()}`, name: '', issuer: '', date: ''})}>Add Award</AddButton>
            </div>

        </div>
    </div>
  );
};
