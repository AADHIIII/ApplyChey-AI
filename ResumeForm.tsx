import React, { useState, useEffect } from 'react';
import { type ResumeData } from '../types';
import { MotionCard } from './ui/Motion';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { useDebouncedCallback } from '../hooks/useDebounce';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  isLoading: boolean;
  isReturningUser: boolean;
  sectionVisibility: { projects: boolean; certifications: boolean; };
  onSectionToggle: (section: 'projects' | 'certifications') => void;
  errors: Record<string, string>;
}

const SectionTitle: React.FC<{ children: React.ReactNode, onToggle?: () => void, isEnabled?: boolean }> = ({ children, onToggle, isEnabled }) => (
  <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
    <h3 className="text-lg font-semibold text-card-foreground">{children}</h3>
    {onToggle && <ToggleSwitch isEnabled={isEnabled ?? false} onToggle={onToggle} />}
  </div>
);

const FieldWrapper: React.FC<{ children: React.ReactNode, error?: string }> = ({ children, error }) => (
  <div>
    {children}
    {error && <p className="text-sm text-destructive mt-1">{error}</p>}
  </div>
);

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string, error?: string }> = ({ label, value, onChange, placeholder, error }) => (
  <FieldWrapper error={error}>
    <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 bg-card border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition ${error ? 'border-destructive' : 'border-input'}`}
    />
  </FieldWrapper>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number, error?: string }> = ({ label, value, onChange, rows=4, error }) => (
 <FieldWrapper error={error}>
    <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full p-3 bg-card border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition ${error ? 'border-destructive' : 'border-input'}`}
    />
  </FieldWrapper>
);

const AddButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button onClick={onClick} type="button" className="flex items-center text-sm font-semibold text-primary hover:text-primary/90 transition mt-2">
        <PlusIcon className="w-4 h-4 mr-1" /> {children}
    </button>
);

const RemoveButton: React.FC<{ onClick: () => void; }> = ({ onClick }) => (
    <button onClick={onClick} type="button" className="text-destructive hover:text-destructive/90 transition">
        <TrashIcon className="w-5 h-5" />
    </button>
);

export const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData, jobDescription, setJobDescription, isLoading, isReturningUser, sectionVisibility, onSectionToggle, errors }) => {
  const [localData, setLocalData] = useState<ResumeData>(resumeData);
  
  const debouncedSetResumeData = useDebouncedCallback(setResumeData, 300);

  useEffect(() => {
    setLocalData(resumeData);
  }, [resumeData]);
  
  useEffect(() => {
    if (JSON.stringify(localData) !== JSON.stringify(resumeData)) {
      debouncedSetResumeData(localData);
    }
  }, [localData, resumeData, debouncedSetResumeData]);


  const handleBasicChange = (field: keyof ResumeData, value: string) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (value: string) => {
    setLocalData(prev => ({ ...prev, skills: value.split(',').map(s => s.trim()) }));
  };
  
  const handleArrayChange = <K extends 'experience' | 'education' | 'projects' | 'certifications'>(
    section: K,
    index: number,
    field: keyof ResumeData[K][number],
    value: string | string[]
  ) => {
    setLocalData(prev => {
        const newArray = [...(prev[section] as any[])];
        newArray[index] = {...newArray[index], [field]: value };
        return {...prev, [section]: newArray };
    });
  };

  const handleAddItem = <T extends object>(section: keyof ResumeData, newItem: T) => {
      setLocalData(prev => ({...prev, [section]: [...(prev[section] as T[]), newItem]}));
  };

  const handleRemoveItem = (section: keyof ResumeData, index: number) => {
      setLocalData(prev => ({...prev, [section]: (prev[section] as any[]).filter((_, i) => i !== index)}));
  };

  return (
    <div className="space-y-6">
      <MotionCard>
        <SectionTitle>Job Description</SectionTitle>
        <p className="text-sm text-muted-foreground mb-2">
           {isReturningUser ? 'Welcome back! Your resume is loaded. Paste a new job description to tailor it.' : 'Paste the job description here to tailor your resume.'}
        </p>
         <TextAreaField
          label=""
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          rows={8}
          error={errors.jobDescription}
        />
      </MotionCard>
      
      <MotionCard delay={0.05}>
        <SectionTitle>Personal Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Full Name" value={localData.name} onChange={e => handleBasicChange('name', e.target.value)} error={errors.name} />
          <InputField label="Email" value={localData.email} onChange={e => handleBasicChange('email', e.target.value)} error={errors.email}/>
          <InputField label="Phone Number" value={localData.phone} onChange={e => handleBasicChange('phone', e.target.value)} />
          <InputField label="LinkedIn Profile" value={localData.linkedin} onChange={e => handleBasicChange('linkedin', e.target.value)} />
          <InputField label="GitHub Profile" value={localData.github} onChange={e => handleBasicChange('github', e.target.value)} />
          <InputField label="Portfolio URL" value={localData.portfolio} onChange={e => handleBasicChange('portfolio', e.target.value)} />
        </div>
      </MotionCard>
      
      <MotionCard delay={0.1}>
        <SectionTitle>Professional Summary</SectionTitle>
        <TextAreaField label="" value={localData.summary} onChange={e => handleBasicChange('summary', e.target.value)} rows={4} error={errors.summary} />
      </MotionCard>
      
      <MotionCard delay={0.15}>
        <SectionTitle>Skills</SectionTitle>
        <p className="text-sm text-muted-foreground mb-2">Enter skills separated by commas.</p>
        <InputField label="" value={localData.skills.join(', ')} onChange={e => handleSkillsChange(e.target.value)} placeholder="React, Node.js, Python..." />
      </MotionCard>

      <MotionCard delay={0.2}>
        <SectionTitle>Work Experience</SectionTitle>
         <FieldWrapper error={errors.experience}>
            <div className="space-y-4">
              {localData.experience.map((exp, index) => (
                <div key={exp.id} className="p-4 border border-border rounded-lg space-y-3 relative">
                    <div className="absolute top-4 right-4"><RemoveButton onClick={() => handleRemoveItem('experience', index)}/></div>
                    <InputField label="Role" value={exp.role} onChange={e => handleArrayChange('experience', index, 'role', e.target.value)} />
                    <InputField label="Company" value={exp.company} onChange={e => handleArrayChange('experience', index, 'company', e.target.value)} />
                    <InputField label="Duration" value={exp.duration} onChange={e => handleArrayChange('experience', index, 'duration', e.target.value)} placeholder="e.g., Jan 2021 - Present" />
                    <TextAreaField label="Description" value={exp.description} onChange={e => handleArrayChange('experience', index, 'description', e.target.value)} rows={5}/>
                </div>
              ))}
              <AddButton onClick={() => handleAddItem('experience', {id: `exp${Date.now()}`, role: '', company: '', duration: '', description: ''})}>Add Experience</AddButton>
            </div>
        </FieldWrapper>
      </MotionCard>

      <MotionCard delay={0.25}>
        <SectionTitle onToggle={() => onSectionToggle('projects')} isEnabled={sectionVisibility.projects}>Projects</SectionTitle>
        {sectionVisibility.projects && (
          <div className="space-y-4 animate-fade-in">
            {localData.projects.map((proj, index) => (
              <div key={proj.id} className="p-4 border border-border rounded-lg space-y-3 relative">
                  <div className="absolute top-4 right-4"><RemoveButton onClick={() => handleRemoveItem('projects', index)}/></div>
                  <InputField label="Project Name" value={proj.name} onChange={e => handleArrayChange('projects', index, 'name', e.target.value)} />
                  <InputField label="Project URL" value={proj.url} onChange={e => handleArrayChange('projects', index, 'url', e.target.value)} />
                  <InputField label="Technologies (comma-separated)" value={proj.technologies.join(', ')} onChange={e => handleArrayChange('projects', index, 'technologies', e.target.value.split(',').map(s => s.trim()))} />
                  <TextAreaField label="Description" value={proj.description} onChange={e => handleArrayChange('projects', index, 'description', e.target.value)} rows={4}/>
              </div>
            ))}
            <AddButton onClick={() => handleAddItem('projects', {id: `proj${Date.now()}`, name: '', url: '', technologies: [], description: ''})}>Add Project</AddButton>
          </div>
        )}
      </MotionCard>

      <MotionCard delay={0.3}>
        <SectionTitle>Education</SectionTitle>
        <div className="space-y-4">
          {localData.education.map((edu, index) => (
            <div key={edu.id} className="p-4 border border-border rounded-lg space-y-3 relative">
                <div className="absolute top-4 right-4"><RemoveButton onClick={() => handleRemoveItem('education', index)}/></div>
                <InputField label="Institution" value={edu.institution} onChange={e => handleArrayChange('education', index, 'institution', e.target.value)} />
                <InputField label="Degree" value={edu.degree} onChange={e => handleArrayChange('education', index, 'degree', e.target.value)} />
                <InputField label="Duration" value={edu.duration} onChange={e => handleArrayChange('education', index, 'duration', e.target.value)} placeholder="e.g., 2015 - 2019" />
            </div>
          ))}
           <AddButton onClick={() => handleAddItem('education', {id: `edu${Date.now()}`, institution: '', degree: '', duration: ''})}>Add Education</AddButton>
        </div>
      </MotionCard>

       <MotionCard delay={0.35}>
        <SectionTitle onToggle={() => onSectionToggle('certifications')} isEnabled={sectionVisibility.certifications}>Certifications</SectionTitle>
        {sectionVisibility.certifications && (
          <div className="space-y-4 animate-fade-in">
            {localData.certifications.map((cert, index) => (
              <div key={cert.id} className="p-4 border border-border rounded-lg space-y-3 relative">
                  <div className="absolute top-4 right-4"><RemoveButton onClick={() => handleRemoveItem('certifications', index)}/></div>
                  <InputField label="Certification Name" value={cert.name} onChange={e => handleArrayChange('certifications', index, 'name', e.target.value)} />
                  <InputField label="Issuing Organization" value={cert.issuer} onChange={e => handleArrayChange('certifications', index, 'issuer', e.target.value)} />
                  <InputField label="Date" value={cert.date} onChange={e => handleArrayChange('certifications', index, 'date', e.target.value)} placeholder="e.g., 2022" />
              </div>
            ))}
            <AddButton onClick={() => handleAddItem('certifications', {id: `cert${Date.now()}`, name: '', issuer: '', date: ''})}>Add Certification</AddButton>
          </div>
        )}
      </MotionCard>
    </div>
  );
};