/// <reference types="vite/client" />
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { app } from './firebase';
import { ResumeData, TailoredResumeResponse, Template, Experience, ChatMessage, ChatUpdateResponse } from '../types';

const functions = getFunctions(app);

// Use local emulator if in dev mode
if (import.meta.env.DEV) {
    connectFunctionsEmulator(functions, 'localhost', 5001);
}

export const api = {
    tailorResume: httpsCallable<{
        resumeData: ResumeData;
        jobDescription: string;
        resumeLength: number;
        targetScore: number;
        template: Template;
    }, TailoredResumeResponse>(functions, 'tailorResume'),

    enhanceSection: httpsCallable<{
        content: string | string[];
        jobDescription: string;
        sectionType: 'summary' | 'experience' | 'project' | 'skills' | 'technologies';
    }, { text: string }>(functions, 'enhanceSection'),

    deepDiveExperience: httpsCallable<{
        experience: Experience;
        jobDescription: string;
        numPoints?: number;
    }, { text: string }>(functions, 'deepDiveExperience'),

    updateResumeFromChat: httpsCallable<{
        instruction: string;
        currentResume: ResumeData;
        history: ChatMessage[];
    }, ChatUpdateResponse>(functions, 'updateResumeFromChat'),

    getImprovementSuggestion: httpsCallable<{
        parameterName: string;
        parameterAnalysis: string;
        resumeData: ResumeData;
        jobDescription: string;
    }, { text: string }>(functions, 'getImprovementSuggestion'),
};
