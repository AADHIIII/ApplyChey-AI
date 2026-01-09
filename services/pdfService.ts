
import jsPDF from 'jspdf';
import { ResumeData, Template, CustomTemplateSettings } from '../types';

// --- Constants and Configuration ---
const PAGE_MARGIN = 14; // Slightly increased margin for better framing
const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const CONTENT_WIDTH = A4_WIDTH - (PAGE_MARGIN * 2);
const PAGE_BREAK_THRESHOLD = A4_HEIGHT - (PAGE_MARGIN + 12);

const PRIMARY_COLOR = '#111827'; // gray-900
const SECONDARY_COLOR = '#4B5563'; // gray-600

interface PdfLayoutConfig {
    lineHeightRatio: number;
    spacingScale: number;
    fontSizeScale: number;
}

class PdfBuilder {
    doc: jsPDF;
    cursorY: number;
    settings: CustomTemplateSettings;
    layout: PdfLayoutConfig;
    onPageAdded: (() => void) | null = null;

    constructor(settings: CustomTemplateSettings, layout: PdfLayoutConfig = { lineHeightRatio: 1.4, spacingScale: 1.0, fontSizeScale: 1.0 }) {
        this.doc = new jsPDF('p', 'mm', 'a4');
        this.cursorY = PAGE_MARGIN;
        this.settings = settings;
        this.layout = layout;
    }

    // --- UTILITIES ---
    public ptToMm(pt: number): number {
        return pt * 0.352778;
    }

    public getFontSize(size: 'sm' | 'base' | 'lg'): number {
        const sizes = { sm: 10, base: 11, lg: 12.5 };
        let baseSize = sizes[this.settings.fontSize] || sizes.base;

        if (size === 'lg') baseSize += 1.5;
        if (size === 'sm') baseSize -= 1;

        // Apply intelligent scaling
        return baseSize * this.layout.fontSizeScale;
    }

    public getSpacing(size: 'xs' | 'sm' | 'md' | 'lg'): number {
        const baseSpacing = { xs: 2, sm: 4, md: 6, lg: 10 }[size];
        return baseSpacing * this.layout.spacingScale;
    }


    public setFont(style: 'normal' | 'bold' = 'normal') {
        const families = {
            charter: 'Times',
            sans: 'Helvetica',
            mono: 'Courier',
        };
        const family = families[this.settings.fontFamily] || 'Helvetica';
        this.doc.setFont(family, style);
    }

    public splitText(text: string, width: number): string[] {
        return this.doc.splitTextToSize(text, width);
    }

    // --- HEIGHT CALCULATION ---
    public calculateTextHeight(text: string | string[], width: number, fontSizePt: number): number {
        const lines = Array.isArray(text) ? text : this.splitText(text, width);
        // Apply dynamic line height ratio
        return lines.length * this.ptToMm(fontSizePt) * this.layout.lineHeightRatio;
    }

    // --- PAGE MANAGEMENT ---
    public checkPageBreak(requiredHeight: number, mainContentY?: { value: number }) {
        const y = mainContentY ? mainContentY.value : this.cursorY;

        // Ensure we don't write too close to the bottom
        if (y + requiredHeight > PAGE_BREAK_THRESHOLD) {
            this.doc.addPage();
            if (this.onPageAdded) {
                this.onPageAdded();
            }
            if (mainContentY) {
                mainContentY.value = PAGE_MARGIN;
            } else {
                this.cursorY = PAGE_MARGIN;
            }
            return true;
        }
        return false;
    }

    public getPageUsage(): { pageCount: number, lastPageY: number } {
        return {
            pageCount: this.doc.getNumberOfPages(),
            lastPageY: this.cursorY
        };
    }

    // --- DRAWING METHODS ---
    public addSectionHeader(title: string, x: number, width: number, cursorYRef?: { value: number }) {
        const headerHeight = this.getFontSize('lg') + this.getSpacing('xs') + this.getSpacing('md');
        // Prevent orphan headers by checking for slightly more space than just the header
        this.checkPageBreak(headerHeight + 15, cursorYRef);

        const finalY = cursorYRef ? cursorYRef.value : this.cursorY;

        this.setFont('bold');
        this.doc.setFontSize(this.getFontSize('lg'));
        this.doc.setTextColor(this.settings.primaryColor);
        this.doc.text(title, x, finalY);

        const newY = finalY + this.getSpacing('xs');

        this.doc.setDrawColor(this.settings.primaryColor);
        this.doc.setLineWidth(0.5);
        this.doc.line(x, newY, x + width, newY);

        if (cursorYRef) {
            cursorYRef.value = newY + this.getSpacing('md');
        } else {
            this.cursorY = newY + this.getSpacing('md');
        }
    }

    public addTextWithSplitting(text: string, x: number, width: number, fontSizePt: number, color: string, cursorYRef?: { value: number }) {
        this.setFont('normal');
        this.doc.setFontSize(fontSizePt);
        this.doc.setTextColor(color);

        const lines = this.splitText(text, width);
        const textHeight = this.calculateTextHeight(lines, width, fontSizePt);
        this.checkPageBreak(textHeight, cursorYRef);

        const y = cursorYRef ? cursorYRef.value : this.cursorY;
        this.doc.text(lines, x, y);

        if (cursorYRef) {
            cursorYRef.value += textHeight;
        } else {
            this.cursorY += textHeight;
        }
    }

    public addBulletPoints(description: string, xOffset: number, width: number, cursorYRef?: { value: number }) {
        const bulletFontSize = this.getFontSize('base') - 0.5; // Slightly smaller for bullets
        this.setFont('normal');
        this.doc.setFontSize(bulletFontSize);
        this.doc.setTextColor(PRIMARY_COLOR);

        const bullets = description.split('\n').filter(line => line.trim().length > 0);

        bullets.forEach(bullet => {
            const cleanedBullet = bullet.replace(/^- /, '').trim();
            const lines = this.splitText(cleanedBullet, width - 5); // 5mm indent
            const bulletHeight = this.calculateTextHeight(lines, width - 5, bulletFontSize);
            const bulletSpacing = 1.5 * this.layout.spacingScale;
            const totalItemHeight = bulletHeight + bulletSpacing;

            this.checkPageBreak(totalItemHeight, cursorYRef);

            const y = cursorYRef ? cursorYRef.value : this.cursorY;

            this.doc.text('•', xOffset, y);
            this.doc.text(lines, xOffset + 5, y);

            if (cursorYRef) {
                cursorYRef.value += totalItemHeight;
            } else {
                this.cursorY += totalItemHeight;
            }
        });
    }

    public save(filename: string) {
        this.doc.save(filename);
    }
}

// --- ITEM RENDERERS (with height calculation) ---

const renderExperienceItem = (builder: PdfBuilder, exp: ResumeData['experience'][0], x: number, width: number, cursorYRef?: { value: number }) => {
    const roleFontSize = builder.getFontSize('base');

    // Header logic
    const itemHeaderHeight = builder.calculateTextHeight(`${exp.role}${exp.company}`, width, roleFontSize) + builder.getSpacing('xs') + builder.getSpacing('md');

    builder.checkPageBreak(itemHeaderHeight, cursorYRef);

    const { doc } = builder;
    let y = cursorYRef ? cursorYRef.value : builder.cursorY;

    builder.setFont('bold');
    doc.setFontSize(roleFontSize);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text(exp.role, x, y);

    builder.setFont('normal');
    doc.text(exp.duration, x + width, y, { align: 'right' });
    y += builder.ptToMm(roleFontSize) * builder.layout.lineHeightRatio;

    doc.setTextColor(SECONDARY_COLOR);
    doc.text(exp.company, x, y);
    y += builder.ptToMm(roleFontSize) * builder.layout.lineHeightRatio + builder.getSpacing('xs');

    // Update cursor before bullet points
    if (cursorYRef) {
        cursorYRef.value = y;
        builder.addBulletPoints(exp.description, x, width, cursorYRef);
        cursorYRef.value += builder.getSpacing('sm');
    } else {
        builder.cursorY = y;
        builder.addBulletPoints(exp.description, x, width);
        builder.cursorY += builder.getSpacing('sm');
    }
};

const renderProjectItem = (builder: PdfBuilder, proj: ResumeData['projects'][0], x: number, width: number, cursorYRef?: { value: number }) => {
    const nameFontSize = builder.getFontSize('base');
    const techFontSize = builder.getFontSize('sm');
    const descFontSize = builder.getFontSize('base') - 0.5;
    const itemHeaderHeight = builder.calculateTextHeight(proj.name, width, nameFontSize) + builder.calculateTextHeight(proj.technologies.join(', '), width, techFontSize) + 5;
    builder.checkPageBreak(itemHeaderHeight, cursorYRef);

    let y = cursorYRef ? cursorYRef.value : builder.cursorY;
    const { doc } = builder;

    builder.setFont('bold');
    doc.setFontSize(nameFontSize);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text(proj.name, x, y);
    y += builder.ptToMm(nameFontSize) * builder.layout.lineHeightRatio;

    builder.setFont('normal');
    doc.setFontSize(techFontSize);
    doc.setTextColor(SECONDARY_COLOR);
    const techText = proj.technologies.join(' · ');
    doc.text(techText, x, y);
    y += builder.ptToMm(techFontSize) * builder.layout.lineHeightRatio + 1;

    if (cursorYRef) {
        cursorYRef.value = y;
        builder.addTextWithSplitting(proj.description, x, width, descFontSize, PRIMARY_COLOR, cursorYRef);
        cursorYRef.value += builder.getSpacing('sm');
    } else {
        builder.cursorY = y;
        builder.addTextWithSplitting(proj.description, x, width, descFontSize, PRIMARY_COLOR);
        builder.cursorY += builder.getSpacing('sm');
    }
};


// --- TEMPLATE GENERATORS ---

const classicGenerator = (builder: PdfBuilder, data: ResumeData) => {
    const { doc } = builder;
    builder.cursorY += builder.getSpacing('xs');

    builder.setFont('bold');
    doc.setFontSize(28); // Title doesn't scale with text settings
    doc.setTextColor(PRIMARY_COLOR);
    doc.text(data.name, A4_WIDTH / 2, builder.cursorY, { align: 'center' });
    builder.cursorY += builder.ptToMm(28) * 0.8;

    const professionalTitle = data.experience[0]?.role;
    if (professionalTitle) {
        const titleFontSize = 14;
        builder.setFont('normal');
        doc.setFontSize(titleFontSize);
        doc.setTextColor(SECONDARY_COLOR);
        doc.text(professionalTitle, A4_WIDTH / 2, builder.cursorY, { align: 'center' });
        builder.cursorY += builder.ptToMm(titleFontSize) * 1.2;
    } else {
        builder.cursorY += builder.getSpacing('xs');
    }

    const contactLine = [data.email, data.phone, data.linkedin].filter(Boolean).join('  |  ');
    builder.setFont('normal');
    doc.setFontSize(builder.getFontSize('base'));
    doc.setTextColor(SECONDARY_COLOR);
    doc.text(contactLine, A4_WIDTH / 2, builder.cursorY, { align: 'center' });
    builder.cursorY += builder.getSpacing('lg');

    builder.addSectionHeader('Summary', PAGE_MARGIN, CONTENT_WIDTH);
    builder.addTextWithSplitting(data.summary, PAGE_MARGIN, CONTENT_WIDTH, builder.getFontSize('base'), PRIMARY_COLOR);
    builder.cursorY += builder.getSpacing('sm');

    builder.addSectionHeader('Skills', PAGE_MARGIN, CONTENT_WIDTH);
    builder.addTextWithSplitting(data.skills.join(', '), PAGE_MARGIN, CONTENT_WIDTH, builder.getFontSize('base'), PRIMARY_COLOR);
    builder.cursorY += builder.getSpacing('sm');

    builder.addSectionHeader('Experience', PAGE_MARGIN, CONTENT_WIDTH);
    data.experience.forEach(exp => renderExperienceItem(builder, exp, PAGE_MARGIN, CONTENT_WIDTH));

    if (data.projects.length > 0) {
        builder.addSectionHeader('Projects', PAGE_MARGIN, CONTENT_WIDTH);
        data.projects.forEach(proj => renderProjectItem(builder, proj, PAGE_MARGIN, CONTENT_WIDTH));
    }

    builder.addSectionHeader('Education', PAGE_MARGIN, CONTENT_WIDTH);
    data.education.forEach(edu => {
        const eduFontSize = builder.getFontSize('base');
        const eduHeight = builder.calculateTextHeight([edu.institution, edu.degree], CONTENT_WIDTH, eduFontSize);
        builder.checkPageBreak(eduHeight + builder.getSpacing('sm'));

        builder.setFont('bold');
        doc.setFontSize(eduFontSize);
        doc.setTextColor(PRIMARY_COLOR);
        doc.text(edu.institution, PAGE_MARGIN, builder.cursorY);
        if (!edu.hideDuration) {
            doc.text(edu.duration, A4_WIDTH - PAGE_MARGIN, builder.cursorY, { align: 'right' });
        }
        builder.cursorY += builder.ptToMm(eduFontSize) * builder.layout.lineHeightRatio;

        builder.setFont('normal');
        doc.text(edu.degree, PAGE_MARGIN, builder.cursorY);
        builder.cursorY += builder.ptToMm(eduFontSize) * builder.layout.lineHeightRatio + builder.getSpacing('sm');
    });
};

const executiveGenerator = (builder: PdfBuilder, data: ResumeData) => {
    builder.settings.fontFamily = 'charter';
    classicGenerator(builder, data);
};

const consultantGenerator = (builder: PdfBuilder, data: ResumeData) => {
    const { doc } = builder;
    builder.settings.fontSize = 'sm';

    // Header
    builder.setFont('bold');
    doc.setFontSize(22);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text(data.name, A4_WIDTH / 2, builder.cursorY, { align: 'center' });
    builder.cursorY += builder.ptToMm(22) * 0.9;

    const contactParts = [data.phone, data.email, data.linkedin ? 'LinkedIn' : null, data.portfolio ? 'Portfolio' : null].filter(Boolean);
    const contactLine = contactParts.join('  |  ');
    builder.setFont('normal');
    doc.setFontSize(builder.getFontSize('sm'));
    doc.setTextColor(SECONDARY_COLOR);
    doc.text(contactLine, A4_WIDTH / 2, builder.cursorY, { align: 'center' });
    builder.cursorY += builder.getSpacing('sm');

    doc.setDrawColor('#374151');
    doc.setLineWidth(0.2);
    doc.line(PAGE_MARGIN, builder.cursorY, A4_WIDTH - PAGE_MARGIN, builder.cursorY);
    builder.cursorY += builder.getSpacing('md');

    // Override section header
    const originalAddSectionHeader = builder.addSectionHeader;
    const consultantSectionHeader = (title: string) => {
        const headerFontSize = builder.getFontSize('base');
        const headerHeight = headerFontSize + builder.getSpacing('sm') * 2;
        builder.checkPageBreak(headerHeight);

        builder.setFont('bold');
        doc.setFontSize(headerFontSize);
        doc.setTextColor(PRIMARY_COLOR);
        doc.text(title.toUpperCase(), PAGE_MARGIN, builder.cursorY);
        builder.cursorY += builder.ptToMm(headerFontSize) * 0.8;

        doc.setDrawColor('#cbd5e1');
        doc.setLineWidth(0.3);
        doc.line(PAGE_MARGIN, builder.cursorY, A4_WIDTH - PAGE_MARGIN, builder.cursorY);
        builder.cursorY += builder.getSpacing('sm');
    };

    consultantSectionHeader('Professional Profile');
    builder.addTextWithSplitting(data.summary, PAGE_MARGIN, CONTENT_WIDTH, builder.getFontSize('base'), PRIMARY_COLOR);
    builder.cursorY += builder.getSpacing('sm');

    consultantSectionHeader('Experience');
    data.experience.forEach(exp => {
        const expFontSize = builder.getFontSize('base');
        let itemHeight = builder.calculateTextHeight([`${exp.company} — ${exp.role}`], CONTENT_WIDTH, expFontSize);
        const bullets = exp.description.split('\n').filter(line => line.trim().length > 0);
        bullets.forEach(bullet => itemHeight += builder.calculateTextHeight(bullet, CONTENT_WIDTH - 4, expFontSize - 1));

        builder.checkPageBreak(itemHeight + builder.getSpacing('sm'));

        builder.setFont('bold');
        doc.setFontSize(expFontSize);
        doc.setTextColor(PRIMARY_COLOR);
        doc.text(`${exp.company} — `, PAGE_MARGIN, builder.cursorY);
        const companyWidth = doc.getTextWidth(`${exp.company} — `);

        builder.setFont('normal');
        doc.setFontSize(expFontSize);
        doc.setTextColor(SECONDARY_COLOR);
        doc.text(exp.role, PAGE_MARGIN + companyWidth, builder.cursorY);

        doc.setFontSize(builder.getFontSize('sm'));
        doc.text(exp.duration, A4_WIDTH - PAGE_MARGIN, builder.cursorY, { align: 'right' });
        builder.cursorY += builder.ptToMm(expFontSize) * builder.layout.lineHeightRatio;

        builder.addBulletPoints(exp.description, PAGE_MARGIN, CONTENT_WIDTH);
        builder.cursorY += builder.getSpacing('sm');
    });

    consultantSectionHeader('Education');
    data.education.forEach(edu => {
        const eduFontSize = builder.getFontSize('base');
        builder.checkPageBreak(builder.ptToMm(eduFontSize) * 2);

        builder.setFont('bold');
        doc.setFontSize(eduFontSize);
        doc.setTextColor(PRIMARY_COLOR);
        doc.text(`${edu.institution} — `, PAGE_MARGIN, builder.cursorY);
        const institutionWidth = doc.getTextWidth(`${edu.institution} — `);

        builder.setFont('normal');
        doc.setTextColor(SECONDARY_COLOR);
        doc.text(edu.degree, PAGE_MARGIN + institutionWidth, builder.cursorY);

        doc.setFontSize(builder.getFontSize('sm'));
        if (!edu.hideDuration) {
            doc.text(edu.duration, A4_WIDTH - PAGE_MARGIN, builder.cursorY, { align: 'right' });
        }
        builder.cursorY += builder.ptToMm(eduFontSize) * builder.layout.lineHeightRatio + builder.getSpacing('xs');
    });
    builder.cursorY += builder.getSpacing('sm');

    consultantSectionHeader('Skills & Certifications');
    builder.addTextWithSplitting(`Skills: ${data.skills.join(', ')}`, PAGE_MARGIN, CONTENT_WIDTH, builder.getFontSize('base'), PRIMARY_COLOR);
    builder.cursorY += builder.getSpacing('xs');
    if (data.certifications.length > 0) {
        builder.addTextWithSplitting(`Certifications: ${c.map(c => `${c.name} (${c.issuer})`).join(', ')}`, PAGE_MARGIN, CONTENT_WIDTH, builder.getFontSize('base'), PRIMARY_COLOR);
    }

    builder.addSectionHeader = originalAddSectionHeader;
};

const modernTechGenerator = (builder: PdfBuilder, data: ResumeData) => {
    const { doc } = builder;
    const SIDEBAR_WIDTH = 55;
    const MAIN_WIDTH = CONTENT_WIDTH - SIDEBAR_WIDTH - 10;
    const SIDEBAR_X = PAGE_MARGIN;
    const MAIN_X = PAGE_MARGIN + SIDEBAR_WIDTH + 10;

    const mainContentY = { value: PAGE_MARGIN };
    let sidebarY = PAGE_MARGIN;

    // --- SIDEBAR BACKGROUND CALLBACK ---
    builder.onPageAdded = () => {
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(0, 0, SIDEBAR_X + SIDEBAR_WIDTH + 5, A4_HEIGHT, 'F');
    };
    // Initialize for first page
    builder.onPageAdded();

    // --- SIDEBAR CONTENT ---
    builder.setFont('bold');
    doc.setFontSize(20);
    doc.setTextColor(builder.settings.primaryColor);
    const nameLines = builder.splitText(data.name, SIDEBAR_WIDTH);
    doc.text(nameLines, SIDEBAR_X, sidebarY);
    sidebarY += builder.calculateTextHeight(nameLines, SIDEBAR_WIDTH, 20) + 1;

    const professionalTitle = data.experience[0]?.role;
    if (professionalTitle) {
        builder.setFont('normal');
        doc.setFontSize(11);
        doc.setTextColor(SECONDARY_COLOR);
        doc.text(professionalTitle, SIDEBAR_X, sidebarY);
        sidebarY += builder.ptToMm(11) + 5;
    }
    builder.cursorY = sidebarY;

    builder.addSectionHeader('Contact', SIDEBAR_X, SIDEBAR_WIDTH);
    const contactInfo = [data.email, data.phone, data.linkedin, data.github, data.portfolio].filter(Boolean);
    contactInfo.forEach(info => {
        builder.addTextWithSplitting(info, SIDEBAR_X, SIDEBAR_WIDTH, builder.getFontSize('sm'), PRIMARY_COLOR);
        builder.cursorY += 1;
    });
    builder.cursorY += builder.getSpacing('sm');

    builder.addSectionHeader('Skills', SIDEBAR_X, SIDEBAR_WIDTH);
    builder.addTextWithSplitting(data.skills.join(', '), SIDEBAR_X, SIDEBAR_WIDTH, builder.getFontSize('sm'), PRIMARY_COLOR);
    builder.cursorY += builder.getSpacing('sm');

    builder.addSectionHeader('Education', SIDEBAR_X, SIDEBAR_WIDTH);
    data.education.forEach(edu => {
        builder.setFont('bold');
        builder.addTextWithSplitting(edu.institution, SIDEBAR_X, SIDEBAR_WIDTH, builder.getFontSize('sm'), PRIMARY_COLOR);
        builder.setFont('normal');
        builder.addTextWithSplitting(edu.degree, SIDEBAR_X, SIDEBAR_WIDTH, builder.getFontSize('sm') - 1, SECONDARY_COLOR);
        if (!edu.hideDuration) {
            builder.addTextWithSplitting(edu.duration, SIDEBAR_X, SIDEBAR_WIDTH, builder.getFontSize('sm') - 1, SECONDARY_COLOR);
        }
        builder.cursorY += builder.getSpacing('xs');
    });

    // --- MAIN CONTENT ---
    builder.addSectionHeader('Summary', MAIN_X, MAIN_WIDTH, mainContentY);
    builder.addTextWithSplitting(data.summary, MAIN_X, MAIN_WIDTH, builder.getFontSize('base'), PRIMARY_COLOR, mainContentY);
    mainContentY.value += builder.getSpacing('sm');

    builder.addSectionHeader('Experience', MAIN_X, MAIN_WIDTH, mainContentY);
    data.experience.forEach(exp => renderExperienceItem(builder, exp, MAIN_X, MAIN_WIDTH, mainContentY));

    if (data.projects.length > 0) {
        builder.addSectionHeader('Projects', MAIN_X, MAIN_WIDTH, mainContentY);
        data.projects.forEach(proj => renderProjectItem(builder, proj, MAIN_X, MAIN_WIDTH, mainContentY));
    }

    // Update the final cursor to be the max of both columns so the builder knows where the page ends
    builder.cursorY = Math.max(builder.cursorY, mainContentY.value);
};

/**
 * Generates a high-quality, ATS-friendly PDF for the given resume data and template.
 * Uses an Intelligent "Dry Run" system to optimize layout density.
 */
export const generatePdf = async (
    resumeData: ResumeData,
    template: Template,
    settings: CustomTemplateSettings,
    outputType: 'save' | 'bloburl' = 'save'
): Promise<string | void> => {

    const generators: Record<Template, (b: PdfBuilder, d: ResumeData) => void> = {
        'executive': executiveGenerator,
        'consultant': consultantGenerator,
        'modern-tech': modernTechGenerator,
        'custom': modernTechGenerator,
        'creative': modernTechGenerator,
        'classic': classicGenerator,
        'junior': classicGenerator,
        'mid-level': classicGenerator,
        'faang': classicGenerator,
        'academic': classicGenerator,
    };

    const selectedGenerator = generators[template] || classicGenerator;

    // Helper to run a simulation
    const simulateRun = (config: PdfLayoutConfig): PdfBuilder => {
        const builder = new PdfBuilder(settings, config);
        selectedGenerator(builder, resumeData);
        return builder;
    };

    // 1. Standard Run
    let finalBuilder = simulateRun({ lineHeightRatio: 1.4, spacingScale: 1.0, fontSizeScale: 1.0 });
    const standardUsage = finalBuilder.getPageUsage();

    console.log(`Standard PDF Run: ${standardUsage.pageCount} pages, Last Page Y: ${standardUsage.lastPageY.toFixed(0)}mm`);

    // 2. Intelligent Optimization Logic

    // Scenario A: Auto-Compress
    // If we are just barely onto a new page (e.g., < 25% of the last page used), try to squeeze it.
    if (standardUsage.pageCount > 1 && standardUsage.lastPageY < (PAGE_BREAK_THRESHOLD * 0.25)) {
        console.log("Optimization: Attempting Auto-Compression (Smaller font, tighter spacing)...");
        const compactBuilder = simulateRun({ lineHeightRatio: 1.25, spacingScale: 0.85, fontSizeScale: 0.95 });
        const compactUsage = compactBuilder.getPageUsage();

        // If we successfully reduced pages
        if (compactUsage.pageCount < standardUsage.pageCount) {
            console.log("Optimization: Compression successful. Using compact layout.");
            finalBuilder = compactBuilder;
        }
    }
    // Scenario B: Auto-Expand (Smart Fill)
    // If we are on 1 page (or any page count) and have a lot of empty space at bottom (> 20% empty), expand to fill.
    // We now slightly increase font size (1.05x) to make it look professional, not just spaced out.
    else if (standardUsage.lastPageY < (PAGE_BREAK_THRESHOLD * 0.80)) {
        console.log("Optimization: Page has whitespace. Attempting Smart Fill (Larger font, relaxed spacing)...");
        const relaxedBuilder = simulateRun({ lineHeightRatio: 1.55, spacingScale: 1.25, fontSizeScale: 1.05 });
        const relaxedUsage = relaxedBuilder.getPageUsage();

        // Only accept expansion if it didn't force a new page
        if (relaxedUsage.pageCount === standardUsage.pageCount) {
            console.log("Optimization: Expansion successful. Using relaxed layout.");
            finalBuilder = relaxedBuilder;
        }
    }

    if (outputType === 'bloburl') {
        return String(finalBuilder.doc.output('bloburl'));
    } else {
        finalBuilder.save(`${resumeData.name.replace(/\s/g, '_')}_Resume.pdf`);
    }
};
