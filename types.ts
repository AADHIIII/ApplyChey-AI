
export interface Link {
  id: string;
  name: string;
  url: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  duration: string;
  hideDuration?: boolean;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  technologies: string[];
  description: string;
  sponsor?: string;
  date?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Publication {
  id: string;
  authors: string[];
  title: string;
  venue: string;
  year: string;
  url?: string;
}

export interface Internship {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Award {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Service {
  id: string;
  role: string;
  organization: string;
  duration: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  skills: string[];
  technologies: string[];
  coursework: string[];
  societies: string[];
  links: Link[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  publications: Publication[];
  internships: Internship[];
  awards: Award[];
  service: Service[];
}

export interface AnalysisParameter {
  name: string;
  score: number; // Score from 0 to 10
  takeaway: string;
  analysis: string;
}

export interface KeywordAnalysis {
  hardSkills: {
    present: string[];
    missing: string[];
  };
  softSkills: {
    present: string[];
    missing: string[];
  };
}

export interface ATSReport {
  overallScore: number;
  summary: {
    strengths: string;
    improvements: string;
  };
  detailedAnalysis: AnalysisParameter[];
  keywordAnalysis: KeywordAnalysis;
}


export interface JobDetails {
  company: string;
  role: string;
  location: string;
}

export interface TailoredResumeResponse {
  resume: ResumeData;
  report: ATSReport;
  jobDetails: JobDetails;
}

export interface Diffs {
  summary?: string;
  experience?: { [id: string]: { description: string } };
  internships?: { [id: string]: { description: string } };
  projects?: { [id: string]: { description: string } };
}

export type DiffViewMode = 'original' | 'tailored' | 'diff';

export type Template = 'classic' | 'junior' | 'mid-level' | 'custom' | 'faang' | 'executive' | 'academic' | 'creative' | 'consultant' | 'modern-tech';

export interface CustomTemplateSettings {
  primaryColor: string;
  fontFamily: 'charter' | 'sans' | 'mono';
  fontSize: 'sm' | 'base' | 'lg';
}

export type ViewMode = 'dashboard' | 'editor' | 'analysis' | 'profile';

export interface SectionVisibility {
  projects: boolean;
  certifications: boolean;
  publications: boolean;
  internships: boolean;
  awards: boolean;
  service: boolean;
  technologies: boolean;
  coursework: boolean;
  societies: boolean;
  links: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export interface ChatUpdateResponse {
  resume: ResumeData;
  confirmationMessage: string;
}

export interface ResumeEntry {
  id: string;
  date: string;
  jobDetails: JobDetails;
  resume: ResumeData;
  report: ATSReport;
}

/**
 * DATABASE SCHEMA
 * This interface defines the structure of the user document stored in Firestore.
 * Collection: "users"
 * Document ID: User's UID
 */
export interface UserProfile {
  originalResume: ResumeData;
  jobDescription: string;
  settings: {
    template: Template;
    customTemplateSettings: CustomTemplateSettings;
  };
  history?: ResumeEntry[];
  lastUpdated: string;
  createdAt?: string;
}
