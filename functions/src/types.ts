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
    url: string;
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

export type Template = 'classic' | 'modern' | 'bold' | 'minimal' | 'creative' | 'executive' | 'academic' | 'technical' | 'junior' | 'mid-level' | 'consultant' | 'faang';

export interface TailoredResumeResponse {
    resume: ResumeData;
    report: TailoringReport;
}

export interface TailoringReport {
    overallScore: number;
    summary: {
        strengths: string;
        improvements: string;
    };
    detailedAnalysis: AnalysisParameter[];
    keywordAnalysis: {
        hardSkills: {
            present: string[];
            missing: string[];
        };
        softSkills: {
            present: string[];
            missing: string[];
        };
    };
}

export interface AnalysisParameter {
    name: string;
    score: number;
    takeaway: string;
    analysis: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface ChatUpdateResponse {
    resume: ResumeData;
    confirmationMessage: string;
}
