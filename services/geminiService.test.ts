import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enhanceSection, GeminiApiError } from './geminiService';

// Mock the api module
vi.mock('./api', () => ({
    api: {
        enhanceSection: vi.fn()
    }
}));

import { api } from './api';

describe('geminiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('enhanceSection', () => {
        it('should return enhanced content on success', async () => {
            const mockResponse = { data: { text: 'Enhanced content' } };
            vi.mocked(api.enhanceSection).mockResolvedValue(mockResponse as any);

            const result = await enhanceSection('Original content', 'Job Description', 'summary');

            expect(api.enhanceSection).toHaveBeenCalledWith({
                content: 'Original content',
                jobDescription: 'Job Description',
                sectionType: 'summary'
            });
            expect(result).toBe('Enhanced content');
        });

        it('should throw GeminiApiError on failure', async () => {
            const mockError = new Error('API Error');
            vi.mocked(api.enhanceSection).mockRejectedValue(mockError);

            await expect(enhanceSection('Original content', 'Job Description', 'summary'))
                .rejects
                .toThrow(GeminiApiError);
        });
    });
});
