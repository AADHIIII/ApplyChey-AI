
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePdf } from './pdfService';
import { ResumeData, CustomTemplateSettings } from '../types';
import jsPDF from 'jspdf';

// Mock jsPDF
vi.mock('jspdf', () => {
    const jsPDFMock = vi.fn();
    jsPDFMock.prototype = {
        // Basic setup methods
        setFont: vi.fn(),
        setFontSize: vi.fn(),
        setTextColor: vi.fn(),
        setDrawColor: vi.fn(),
        setLineWidth: vi.fn(),
        setFillColor: vi.fn(),

        // Drawing methods
        text: vi.fn(),
        line: vi.fn(),
        rect: vi.fn(),
        addPage: vi.fn(),
        save: vi.fn(),
        output: vi.fn(),
        getNumberOfPages: vi.fn().mockReturnValue(1),

        // Critical layout methods
        // We mock these to simply return the input so the loops in the builder run at least once
        splitTextToSize: vi.fn((text) => {
            if (Array.isArray(text)) return text;
            return text ? [text] : [];
        }),
        getTextWidth: vi.fn((text) => {
            return text ? text.length * 2 : 0;
        })
    };
    return { default: jsPDFMock };
});

describe('pdfService', () => {
    const mockResumeData: ResumeData = {
        name: "Test User",
        email: "test@example.com",
        phone: "123-456-7890",
        linkedin: "linkedin.com/in/test",
        github: "github.com/test",
        portfolio: "test.com",
        summary: "This is a summary.",
        skills: ["Skill 1", "Skill 2"],
        technologies: [],
        coursework: [],
        societies: [],
        links: [],
        experience: [
            { id: '1', role: "Developer", company: "Tech Corp", duration: "2020-Present", description: "Built things." }
        ],
        education: [
            { id: 'e1', institution: "University", degree: "CS Degree", duration: "2016-2020" }
        ],
        projects: [
            { id: 'p1', name: "Project A", url: "", technologies: ["React"], description: "A cool project." }
        ],
        certifications: [],
        publications: [],
        internships: [],
        awards: [],
        service: []
    };

    const mockSettings: CustomTemplateSettings = {
        primaryColor: '#000000',
        fontFamily: 'sans',
        fontSize: 'base'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate a PDF for classic template', async () => {
        await generatePdf(mockResumeData, 'classic', mockSettings, 'save');

        expect(jsPDF).toHaveBeenCalled();
        const mockDoc = (jsPDF as any).mock.instances[0];

        // Verify name was written 
        // Note: The service might call text with array or string. checking calls.

        // The service calls: doc.text(data.name, ..., { align: 'center' })
        const textCalls = mockDoc.text.mock.calls;
        const nameCall = textCalls.find((call: any[]) => call[0].includes('Test User') || (Array.isArray(call[0]) && call[0].join('').includes('Test User')));

        expect(nameCall).toBeDefined();

        // Verify save was called
        expect(mockDoc.save).toHaveBeenCalledWith('Test_User_Resume.pdf');
    });

    it('should generate a PDF for executive template', async () => {
        // Executive uses 'charter' which maps to 'Times'
        await generatePdf(mockResumeData, 'executive', mockSettings, 'bloburl');

        const mockDoc = (jsPDF as any).mock.instances[0];

        // Check font setting
        // In the trace we expect setFont('charter' -> 'Times')
        expect(mockDoc.setFont).toHaveBeenCalledWith('Times', expect.anything());

        // output type
        expect(mockDoc.output).toHaveBeenCalledWith('bloburl');
    });

    it('should use correct font family mapping', async () => {
        const settings = { ...mockSettings, fontFamily: 'mono' as const };
        await generatePdf(mockResumeData, 'classic', settings, 'save');
        const mockDoc = (jsPDF as any).mock.instances[0];
        // 'mono' maps to 'Courier'
        expect(mockDoc.setFont).toHaveBeenCalledWith('Courier', expect.anything());
    });
});
