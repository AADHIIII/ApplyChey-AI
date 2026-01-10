import { api } from './api';
import { type ResumeData, type TailoredResumeResponse, type Template, type Experience, type ChatMessage, type ChatUpdateResponse } from '../types';
import { apiRateLimiter } from '../utils/rateLimiter';
import { errorTracker } from '../utils/errorTracking';
import { withApiRetry } from '../utils/retry';

export type GeminiErrorType = 'RATE_LIMIT' | 'INVALID_REQUEST' | 'SERVER_ERROR' | 'EMPTY_RESPONSE' | 'UNKNOWN';

export class GeminiApiError extends Error {
    constructor(message: string, public type: GeminiErrorType = 'UNKNOWN') {
        super(message);
        this.name = 'GeminiApiError';
    }
}

/**
 * Check rate limit before making API call
 */
const checkRateLimit = (): void => {
    if (!apiRateLimiter.canMakeCall()) {
        const waitTime = apiRateLimiter.getTimeUntilNextCall();
        const error = new GeminiApiError(
            `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`,
            'RATE_LIMIT'
        );
        errorTracker.logError(error, 'medium', { waitTime });
        throw error;
    }
    apiRateLimiter.recordCall();
};

export const tailorResume = async (resumeData: ResumeData, jobDescription: string, resumeLength: number, targetScore: number, template: Template): Promise<TailoredResumeResponse> => {
    checkRateLimit();
    
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
        const geminiError = new GeminiApiError(error.message || 'Failed to tailor resume', 'SERVER_ERROR');
        errorTracker.logError(geminiError, 'high', { resumeData, jobDescription });
        throw geminiError;
    }
};

export const enhanceSection = async (content: string | string[], jobDescription: string, sectionType: 'summary' | 'experience' | 'project' | 'skills' | 'technologies'): Promise<string> => {
    checkRateLimit();
    
    try {
        const result = await api.enhanceSection({
            content,
            jobDescription,
            sectionType
        });
        return result.data.text;
    } catch (error: any) {
        console.error("Error in enhanceSection:", error);
        const geminiError = new GeminiApiError(error.message || 'Failed to enhance section', 'SERVER_ERROR');
        errorTracker.logError(geminiError, 'medium', { sectionType, jobDescription });
        throw geminiError;
    }
};

export const deepDiveExperience = async (experience: Experience, jobDescription: string, numPoints: number = 15): Promise<string> => {
    checkRateLimit();
    
    try {
        const result = await api.deepDiveExperience({
            experience,
            jobDescription,
            numPoints
        });
        return result.data.text;
    } catch (error: any) {
        console.error("Error in deepDiveExperience:", error);
        const geminiError = new GeminiApiError(error.message || 'Failed to deep dive experience', 'SERVER_ERROR');
        errorTracker.logError(geminiError, 'medium', { experienceId: experience.id, numPoints });
        throw geminiError;
    }
};

export const updateResumeFromChat = async (instruction: string, currentResume: ResumeData, history: ChatMessage[]): Promise<ChatUpdateResponse> => {
    checkRateLimit();
    
    try {
        const result = await api.updateResumeFromChat({
            instruction,
            currentResume,
            history
        });
        return result.data;
    } catch (error: any) {
        console.error("Error in updateResumeFromChat:", error);
        const geminiError = new GeminiApiError(error.message || 'Failed to update resume from chat', 'SERVER_ERROR');
        errorTracker.logError(geminiError, 'medium', { instruction });
        throw geminiError;
    }
};

export const getImprovementSuggestion = async (
    parameterName: string,
    parameterAnalysis: string,
    resumeData: ResumeData,
    jobDescription: string
): Promise<string> => {
    checkRateLimit();
    
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
        const geminiError = new GeminiApiError(error.message || 'Failed to get improvement suggestion', 'SERVER_ERROR');
        errorTracker.logError(geminiError, 'medium', { parameterName });
        throw geminiError;
    }
};
