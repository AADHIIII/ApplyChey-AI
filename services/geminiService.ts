import { api } from './api';
import { type ResumeData, type TailoredResumeResponse, type Template, type Experience, type ChatMessage, type ChatUpdateResponse } from '../types';

export type GeminiErrorType = 'RATE_LIMIT' | 'INVALID_REQUEST' | 'SERVER_ERROR' | 'EMPTY_RESPONSE' | 'UNKNOWN';

export class GeminiApiError extends Error {
    constructor(message: string, public type: GeminiErrorType = 'UNKNOWN') {
        super(message);
        this.name = 'GeminiApiError';
    }
}

export const tailorResume = async (resumeData: ResumeData, jobDescription: string, resumeLength: number, targetScore: number, template: Template): Promise<TailoredResumeResponse> => {
    try {
        const result = await api.tailorResume({
            resumeData,
            jobDescription,
            resumeLength,
            targetScore,
            template
        });
        return result.data;
    } catch (error: any) {
        console.error("Error in tailorResume:", error);
        throw new GeminiApiError(error.message || 'Failed to tailor resume', 'SERVER_ERROR');
    }
};

export const enhanceSection = async (content: string | string[], jobDescription: string, sectionType: 'summary' | 'experience' | 'project' | 'skills' | 'technologies'): Promise<string> => {
    try {
        const result = await api.enhanceSection({
            content,
            jobDescription,
            sectionType
        });
        return result.data.text;
    } catch (error: any) {
        console.error("Error in enhanceSection:", error);
        throw new GeminiApiError(error.message || 'Failed to enhance section', 'SERVER_ERROR');
    }
};

export const deepDiveExperience = async (experience: Experience, jobDescription: string, numPoints: number = 15): Promise<string> => {
    try {
        const result = await api.deepDiveExperience({
            experience,
            jobDescription,
            numPoints
        });
        return result.data.text;
    } catch (error: any) {
        console.error("Error in deepDiveExperience:", error);
        throw new GeminiApiError(error.message || 'Failed to deep dive experience', 'SERVER_ERROR');
    }
};

export const updateResumeFromChat = async (instruction: string, currentResume: ResumeData, history: ChatMessage[]): Promise<ChatUpdateResponse> => {
    try {
        const result = await api.updateResumeFromChat({
            instruction,
            currentResume,
            history
        });
        return result.data;
    } catch (error: any) {
        console.error("Error in updateResumeFromChat:", error);
        throw new GeminiApiError(error.message || 'Failed to update resume from chat', 'SERVER_ERROR');
    }
};

export const getImprovementSuggestion = async (
    parameterName: string,
    parameterAnalysis: string,
    resumeData: ResumeData,
    jobDescription: string
): Promise<string> => {
    try {
        const result = await api.getImprovementSuggestion({
            parameterName,
            parameterAnalysis,
            resumeData,
            jobDescription
        });
        return result.data.text;
    } catch (error: any) {
        console.error("Error in getImprovementSuggestion:", error);
        throw new GeminiApiError(error.message || 'Failed to get improvement suggestion', 'SERVER_ERROR');
    }
};
