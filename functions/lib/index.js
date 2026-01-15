"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImprovementSuggestion = exports.updateResumeFromChat = exports.deepDiveExperience = exports.enhanceSection = exports.tailorResume = exports.GeminiApiError = void 0;
const https_1 = require("firebase-functions/v2/https");
const genai_1 = require("@google/genai");
// Initialize GoogleGenAI lazily to avoid deployment timeouts
// Read from environment variable (set via Firebase Console or CLI)
const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    return new genai_1.GoogleGenAI({ apiKey });
};
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
class GeminiApiError extends Error {
    constructor(message, type = 'UNKNOWN') {
        super(message);
        this.type = type;
        this.name = 'GeminiApiError';
    }
}
exports.GeminiApiError = GeminiApiError;
const categorizeError = (error) => {
    if (error instanceof GeminiApiError) {
        return error;
    }
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('400') || message.includes('invalid argument') || message.includes('schema')) {
            return new GeminiApiError(`Invalid request to AI: ${error.message}`, 'INVALID_REQUEST');
        }
        if (message.includes('429') || message.includes('rate limit')) {
            return new GeminiApiError(error.message, 'RATE_LIMIT');
        }
        if (message.includes('500') || message.includes('server error')) {
            return new GeminiApiError(error.message, 'SERVER_ERROR');
        }
        return new GeminiApiError(error.message, 'UNKNOWN');
    }
    return new GeminiApiError('An unknown API error occurred', 'UNKNOWN');
};
const callGeminiApiWithRetry = async (model, contents, config = {}) => {
    const ai = getAI();
    let lastError = null;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await ai.models.generateContent({ model, contents, config });
            if (!response.text || response.text.trim() === '') {
                throw new GeminiApiError('API returned an empty response.', 'EMPTY_RESPONSE');
            }
            return response;
        }
        catch (error) {
            const categorizedError = categorizeError(error);
            if (categorizedError.type === 'INVALID_REQUEST') {
                throw categorizedError;
            }
            lastError = categorizedError;
            console.warn(`API call attempt ${i + 1} failed with ${categorizedError.type}:`, categorizedError.message);
            if (i < MAX_RETRIES - 1) {
                const delay = INITIAL_BACKOFF_MS * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError !== null && lastError !== void 0 ? lastError : new GeminiApiError(`API call failed after ${MAX_RETRIES} attempts.`, 'UNKNOWN');
};
// --- Schemas (Copied from geminiService.ts) ---
// Note: In a real monorepo, these would be shared.
const resumeSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        name: { type: genai_1.Type.STRING },
        email: { type: genai_1.Type.STRING },
        phone: { type: genai_1.Type.STRING },
        linkedin: { type: genai_1.Type.STRING },
        github: { type: genai_1.Type.STRING },
        portfolio: { type: genai_1.Type.STRING },
        summary: { type: genai_1.Type.STRING, description: "An improved, concise, and impactful professional summary tailored to the job description, between 2-4 sentences." },
        skills: {
            type: genai_1.Type.ARRAY,
            items: { type: genai_1.Type.STRING },
            description: "A comprehensive list of skills. Prioritize skills from the resume, augment heavily with keywords from the job description, and proactively add 2-3 advanced, related skills that a top candidate for this role would possess, even if not explicitly mentioned."
        },
        technologies: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        coursework: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        societies: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        links: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    id: { type: genai_1.Type.STRING },
                    name: { type: genai_1.Type.STRING },
                    url: { type: genai_1.Type.STRING },
                },
                required: ['id', 'name', 'url']
            }
        },
        experience: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    id: { type: genai_1.Type.STRING },
                    role: { type: genai_1.Type.STRING },
                    company: { type: genai_1.Type.STRING },
                    duration: { type: genai_1.Type.STRING },
                    description: { type: genai_1.Type.STRING, description: "Rewrite the description to be more achievement-oriented, using metrics and keywords from the job description. You MUST generate a minimum of 5 high-impact bullet points. Start each bullet point with an action verb. IMPORTANT: Format the entire description as a single string where each bullet point is on a new line and starts with a hyphen (e.g., '- First point.\\n- Second point.')." },
                },
                required: ['id', 'role', 'company', 'duration', 'description']
            }
        },
        education: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    id: { type: genai_1.Type.STRING },
                    institution: { type: genai_1.Type.STRING },
                    degree: { type: genai_1.Type.STRING },
                    duration: { type: genai_1.Type.STRING },
                },
                required: ['id', 'institution', 'degree', 'duration']
            }
        },
        projects: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    id: { type: genai_1.Type.STRING },
                    name: { type: genai_1.Type.STRING },
                    url: { type: genai_1.Type.STRING },
                    technologies: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                    description: { type: genai_1.Type.STRING, description: "Rewrite project descriptions to emphasize impact and alignment with the job description's required skills and technologies." },
                    sponsor: { type: genai_1.Type.STRING },
                    date: { type: genai_1.Type.STRING },
                },
                required: ['id', 'name', 'url', 'technologies', 'description']
            }
        },
        certifications: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    id: { type: genai_1.Type.STRING },
                    name: { type: genai_1.Type.STRING },
                    issuer: { type: genai_1.Type.STRING },
                    date: { type: genai_1.Type.STRING },
                },
                required: ['id', 'name', 'issuer', 'date']
            }
        },
        publications: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    id: { type: genai_1.Type.STRING },
                    authors: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                    title: { type: genai_1.Type.STRING },
                    venue: { type: genai_1.Type.STRING },
                    year: { type: genai_1.Type.STRING },
                    url: { type: genai_1.Type.STRING },
                },
                required: ['id', 'authors', 'title', 'venue', 'year']
            }
        },
        internships: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    id: { type: genai_1.Type.STRING },
                    role: { type: genai_1.Type.STRING },
                    company: { type: genai_1.Type.STRING },
                    duration: { type: genai_1.Type.STRING },
                    description: { type: genai_1.Type.STRING, description: "Rewrite the internship description to be achievement-oriented, using metrics and keywords. You MUST generate a minimum of 5 bullet points. Format as a single string with each bullet point on a new line starting with a hyphen (e.g., '- First point.\\n- Second point.')." },
                },
                required: ['id', 'role', 'company', 'duration', 'description']
            }
        },
        awards: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    id: { type: genai_1.Type.STRING },
                    name: { type: genai_1.Type.STRING },
                    issuer: { type: genai_1.Type.STRING },
                    date: { type: genai_1.Type.STRING },
                },
                required: ['id', 'name', 'issuer', 'date']
            }
        },
        service: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    id: { type: genai_1.Type.STRING },
                    role: { type: genai_1.Type.STRING },
                    organization: { type: genai_1.Type.STRING },
                    duration: { type: genai_1.Type.STRING },
                },
                required: ['id', 'role', 'organization', 'duration']
            }
        }
    },
    required: ['name', 'email', 'phone', 'summary', 'skills', 'experience', 'education']
};
const tailoredResumeResponseSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        resume: resumeSchema,
        report: {
            type: genai_1.Type.OBJECT,
            properties: {
                overallScore: { type: genai_1.Type.NUMBER, description: "An overall ATS and hiring manager score from 0-100 based on how well the tailored resume matches the job description." },
                summary: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        strengths: { type: genai_1.Type.STRING, description: "A paragraph summarizing the key strengths of the tailored resume against the job description." },
                        improvements: { type: genai_1.Type.STRING, description: "A paragraph outlining the most critical areas of improvement that were addressed in the tailoring process." }
                    },
                    required: ['strengths', 'improvements']
                },
                detailedAnalysis: {
                    type: genai_1.Type.ARRAY,
                    description: "A detailed analysis of the resume based on 10 expert parameters.",
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            name: { type: genai_1.Type.STRING, description: "The name of the analysis parameter." },
                            score: { type: genai_1.Type.NUMBER, description: "A score from 0 to 10 for this specific parameter." },
                            takeaway: { type: genai_1.Type.STRING, description: "A single, concise, actionable sentence summarizing the key insight for this parameter." },
                            analysis: { type: genai_1.Type.STRING, description: "A concise, expert analysis (2-3 sentences) explaining the score and the improvements made for this parameter." }
                        },
                        required: ["name", "score", "takeaway", "analysis"]
                    }
                },
                keywordAnalysis: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        hardSkills: {
                            type: genai_1.Type.OBJECT,
                            properties: {
                                present: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: "Hard skills from the JD that are now present in the resume." },
                                missing: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: "Critical hard skills from the JD that are still missing or underrepresented." }
                            },
                            required: ['present', 'missing']
                        },
                        softSkills: {
                            type: genai_1.Type.OBJECT,
                            properties: {
                                present: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: "Soft skills from the JD that are now present in the resume." },
                                missing: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: "Critical soft skills from the JD that are still missing or underrepresented." }
                            },
                            required: ['present', 'missing']
                        }
                    },
                    required: ['hardSkills', 'softSkills']
                }
            },
            required: ['overallScore', 'summary', 'detailedAnalysis', 'keywordAnalysis']
        },
        jobDetails: {
            type: genai_1.Type.OBJECT,
            properties: {
                company: { type: genai_1.Type.STRING, description: "The name of the company from the job description." },
                role: { type: genai_1.Type.STRING, description: "The job title or role from the job description." },
                location: { type: genai_1.Type.STRING, description: "The location of the job from the job description (e.g., 'Remote', 'New York, NY')." }
            },
            required: ['company', 'role', 'location']
        }
    },
    required: ['resume', 'report', 'jobDetails']
};
const chatUpdateResponseSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        resume: resumeSchema,
        confirmationMessage: {
            type: genai_1.Type.STRING,
            description: "A short, friendly message confirming the action taken or explaining why it couldn't be done."
        }
    },
    required: ['resume', 'confirmationMessage']
};
// --- Cloud Functions ---
exports.tailorResume = (0, https_1.onCall)({ cors: true, }, async (request) => {
    const { resumeData, jobDescription, resumeLength, targetScore, template } = request.data;
    if (!resumeData || !jobDescription) {
        throw new https_1.HttpsError('invalid-argument', 'Missing resumeData or jobDescription');
    }
    const prompt = `
        You are a 15-year veteran hiring manager at a top-tier tech company (like Google or Apple) and an expert resume writer. 
        
        **CRITICAL GOAL: Transform the candidate's profile to be a perfect fit for the provided Job Description. The JD is the ultimate source of truth. The current resume provides the factual history (employers, dates), but the content, skills, and framing MUST be completely rewritten to match the target role.**

        **Job Description:**
        ---
        ${jobDescription}
        ---

        **Current Resume (use for facts like employment history, not for content style):**
        ---
        ${JSON.stringify(resumeData, null, 2)}
        ---

        **PART 1: RESUME REWRITING INSTRUCTIONS**
        1.  **Analyze & Align:** Thoroughly analyze the job description to identify the target role (e.g., Software Engineer, Data Scientist), key skills, qualifications, keywords, and underlying company values.
        2.  **Rewrite Summary:** Craft a dynamic, 2-3 sentence professional summary that grabs attention. Frame the candidate as an expert in the field described in the job description. Write in a confident, professional third-person voice (e.g., "A results-driven Software Engineer with...").
        3.  **Optimize Experience (Deep Dive):** For each work experience entry, rewrite the descriptions to showcase skills and achievements *directly relevant to the job description*. Reframe accomplishments from the candidate's past roles to highlight their transferable skills and impact in the context of the *target role*. For example, if the current resume says 'Analyzed data to find trends,' and the target role is SDE, rewrite it as 'Developed Python scripts to automate data processing and analysis, improving efficiency for the engineering team by 20%.' Each of the 5 bullet points MUST be a high-impact statement using the STAR method. Quantify every possible achievement.
        4.  **Skills Transformation:** This is critical. Discard skills from the original resume that are not relevant to the job description. Build a new skills list primarily from the requirements and technologies mentioned in the JD.
        5.  **Enhance Projects, Leadership & Activities:** Analyze the candidate's existing projects, leadership (\`service\`), and activities (\`societies\`). Rewrite their descriptions to align with the company's vision and the job description. If these sections are sparse or not well-aligned, you MUST enhance them by adding 1-2 new, highly relevant project or leadership examples that a candidate with this background might plausibly have. These generated items should be unique, technically impressive, and directly support the narrative that the candidate is a perfect fit.
        6.  **Structural Integrity & Creative License:** You have creative license to modify the content within the following sections to maximize alignment: \`summary\`, \`skills\`, \`technologies\`, \`experience\` (descriptions only), \`projects\`, \`service\`, and \`societies\`. For \`projects\` and \`service\`, you can enhance existing entries or add 1-2 new, plausible entries. **Crucially, you must preserve all existing IDs.** Personal details (name, email, etc.) and the education section must remain unchanged. Do not remove existing experience or education entries.
        7.  **Resume Length:** Condense the content to fit strictly within a ${resumeLength}-page limit. Prioritize content with the most impact relative to the job description.
        
        **PART 2: SENIORITY LEVEL & TONE**
        You MUST adjust the tone, focus, and language of the entire rewritten resume to match the candidate's target seniority level, which is **'${template}'**.

        - **If 'junior'**:
            - **Focus:** Emphasize potential, eagerness to learn, academic projects, and foundational skills.
            - **Tone:** Enthusiastic and coachable.
            - **Summary:** Highlight academic achievements and core skills, connecting them to the role's requirements.
            - **Experience:** Frame descriptions around learning, contributing to team goals, and mastering new technologies.

        - **If 'mid-level'**:
            - **Focus:** Highlight demonstrated competence, growing responsibilities, independent project contributions, and successful outcomes.
            - **Tone:** Confident and capable.
            - **Summary:** Start with 2-5 years of experience and showcase key accomplishments.
            - **Experience:** Descriptions should be achievement-oriented, showing a clear impact on projects. Use stronger action verbs.

        - **If 'classic' or other professional templates**:
            - **Focus:** A balanced, professional approach.
            - **Tone:** Professional and clear.
            - **Summary & Experience:** Use a standard, professional tone suitable for a wide range of corporate roles without aggressively targeting a specific seniority level.

        **PART 3: TARGET SCORE & IMPACT LEVEL**
        You must tailor the resume to achieve a target ATS score of approximately **${targetScore} out of 100**. Use this target to guide the intensity of your edits:
        - **Score 70-80 (Solid Match):** Focus on strong alignment of key skills and experience. Ensure descriptions are achievement-oriented but maintain a very natural tone.
        - **Score 80-90 (Highly Optimized):** Aggressively integrate keywords from the job description. Quantify achievements wherever possible, even if it requires making reasonable assumptions. The tone should be highly professional and impactful. This is the ideal range for most competitive roles.
        - **Score 90-100 (Maximum Optimization):** Prioritize keyword density and ATS compatibility above all else. The resume must match the job description's terminology as closely as possible. While still readable, the primary goal is to pass the most rigorous ATS filters.

        **PART 4: EXPERT ANALYSIS & METADATA INSTRUCTIONS**
        After rewriting the resume, you must provide a detailed report AND extract metadata from the job description.
        1.  **Overall Score:** Your generated \`overallScore\` MUST be within 2 points of the requested target score of ${targetScore}.
        2.  **Report Summary:** Provide a concise \`summary\` with two fields: \`strengths\` (a paragraph on key strengths) and \`improvements\` (a paragraph on what was improved).
        3.  **Keyword Analysis:** Provide a \`keywordAnalysis\`. Analyze the job description for hard and soft skills. Compare them to the tailored resume. Populate the \`present\` and \`missing\` arrays for both skill types. This is critical for user feedback.
        4.  **Detailed Analysis:** Provide a \`detailedAnalysis\` array with exactly 10 analysis parameters. For each parameter, provide:
            - \`name\`: The name of the parameter.
            - \`score\`: A score from 0-10.
            - \`takeaway\`: A single, concise, actionable sentence summarizing the key insight for this parameter.
            - \`analysis\`: A concise expert analysis (2-3 sentences) explaining the score and improvements.
        5.  **Job Details Extraction:** You MUST extract the following details from the provided Job Description:
            - \`company\`: The name of the hiring company. If not explicitly stated, infer it or use "Unknown Company".
            - \`role\`: The job title.
            - \`location\`: The job location (e.g., "Remote", "San Francisco, CA"). If not stated, use "Unknown Location".
        
        The 10 parameters you MUST use are:
        - "Keyword Alignment"
        - "Quantifiable Achievements"
        - "Action Verb Usage"
        - "Summary Strength"
        - "Relevance of Experience"
        - "Clarity & Conciseness"
        - "ATS Readability"
        - "Skills Section Optimization"
        - "Professional Tone"
        - "Impact vs. Length"

        **Output JSON:** Return the entire updated resume, the detailed expert analysis report, and the extracted job details in the specified JSON format.
    `;
    try {
        const response = await callGeminiApiWithRetry('gemini-2.5-flash', prompt, {
            responseMimeType: 'application/json',
            responseSchema: tailoredResumeResponseSchema,
        });
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        // Ensure all original sections are present even if the model omits them
        const originalSections = {
            projects: resumeData.projects,
            certifications: resumeData.certifications,
            publications: resumeData.publications,
            internships: resumeData.internships,
            awards: resumeData.awards,
            service: resumeData.service,
            technologies: resumeData.technologies,
            coursework: resumeData.coursework,
            societies: resumeData.societies,
            links: resumeData.links
        };
        parsedResponse.resume = Object.assign(Object.assign({}, originalSections), parsedResponse.resume);
        return parsedResponse;
    }
    catch (error) {
        console.error("Error in tailorResume:", error);
        throw new https_1.HttpsError('internal', error.message || 'An error occurred while tailoring the resume.');
    }
});
exports.enhanceSection = (0, https_1.onCall)({ cors: true, }, async (request) => {
    const { content, jobDescription, sectionType } = request.data;
    const isList = Array.isArray(content);
    const contentString = isList ? content.join(', ') : content;
    let instructions = '';
    let outputFormat = 'Return only the rewritten text for this section as a single string. Do not include any other explanatory text or JSON formatting.';
    switch (sectionType) {
        case 'summary':
            instructions = `Rewrite it to be a powerful, concise professional statement (2-3 sentences) that directly addresses the core requirements of the job description.`;
            break;
        case 'experience':
            instructions = `Rewrite the bullet points to be achievement-oriented. Use the STAR method (Situation, Task, Action, Result) and quantify results with metrics where possible. Start each bullet with a strong action verb. Aim for at least 5 bullet points.`;
            break;
        case 'project':
            instructions = `Rewrite the project description to highlight the technologies and outcomes most relevant to the job description. Focus on impact and technical challenges.`;
            break;
        case 'skills':
        case 'technologies':
            instructions = `Analyze the provided list of ${sectionType} and the job description. Generate an improved, comma-separated list. Add key ${sectionType} from the job description and remove irrelevant ones. Also suggest 2-3 advanced, related ${sectionType} a top candidate would have.`;
            outputFormat = `Return only a single, comma-separated string of the enhanced ${sectionType}. Do not include any other text.`;
            break;
    }
    const prompt = `
        You are an expert resume writer. Your task is to rewrite a single section of a resume to be more impactful and tailored to the provided job description.

        **Job Description:**
        ---
        ${jobDescription}
        ---

        **Resume Section Content to Enhance:**
        ---
        ${contentString}
        ---

        **Instructions:**
        1.  **Analyze & Align:** Identify key skills and keywords from the job description relevant to this section.
        2.  **Rewrite for Impact:** ${instructions}
        3.  **Natural Language:** Integrate keywords from the job description naturally. Avoid keyword stuffing.
        4.  **Output:** ${outputFormat}
    `;
    try {
        const response = await callGeminiApiWithRetry('gemini-2.5-flash', prompt);
        return { text: response.text.trim() };
    }
    catch (error) {
        throw new https_1.HttpsError('internal', error.message);
    }
});
exports.deepDiveExperience = (0, https_1.onCall)({ cors: true, }, async (request) => {
    const { experience, jobDescription, numPoints = 15 } = request.data;
    const prompt = `
        You are an expert resume writer and career strategist. Your task is to expand a brief work experience description into a highly detailed, comprehensive, and compelling list of achievements and responsibilities, tailored specifically to a target job description.

        **Target Job Description:**
        ---
        ${jobDescription}
        ---

        **Current Work Experience Entry:**
        ---
        Role: ${experience.role}
        Company: ${experience.company}
        Original Description: ${experience.description}
        ---

        **CRITICAL INSTRUCTIONS:**
        1.  **QUANTITY: You MUST generate EXACTLY ${numPoints} bullet points.** This is a hard constraint.
        2.  **DEEP DIVE & HALLUCINATE:** Go deep into the role. Based on the provided role, company, and the target job description, you MUST creatively hallucinate and infer specific projects, technologies, methodologies (e.g., Agile, SCRUM), and quantifiable achievements. For example, if the role is 'Software Engineer' and the JD mentions 'cloud', infer projects related to AWS/GCP, CI/CD pipelines, and serverless architecture.
        3.  **QUANTIFY EVERYTHING:** Make up realistic and impressive metrics (e.g., "reduced average API response time by 45%").
        4.  **ALIGNMENT:** Meticulously analyze the job description and weave its keywords, skills, and required qualifications into the bullet points.
        5.  **ACTION VERBS:** Every single bullet point must start with a powerful action verb (e.g., Architected, Spearheaded, Engineered).
        6.  **FORMAT:** Return a SINGLE plain text string. Each bullet point MUST appear on a new line and start with a hyphen and a space.
            Example:
            - First detailed point here.
            - Second detailed point here.
            ...
            - Final detailed point here.
        7.  **NO JSON/MARKDOWN:** Do not return a JSON object, code blocks, or stringified JSON. Return only the raw list text.
        8.  **NO BOLDING:** Do not use asterisks (** or *) to bold words. The output must be pure plain text.
    `;
    try {
        const response = await callGeminiApiWithRetry('gemini-2.5-flash', prompt);
        let text = response.text.trim();
        // Cleanup logic
        text = text.replace(/^```(text|markdown)?\s*/i, '').replace(/\s*```$/, '');
        if (text.startsWith('"') && text.endsWith('"')) {
            try {
                const parsed = JSON.parse(text);
                if (typeof parsed === 'string')
                    text = parsed;
            }
            catch (e) {
                text = text.slice(1, -1);
            }
        }
        text = text.replace(/\\n/g, '\n').replace(/\\r/g, '');
        text = text.replace(/\*\*\*(.*?)\*\*\*/g, '$1');
        text = text.replace(/\*\*(.*?)\*\*/g, '$1');
        text = text.replace(/\*(.*?)\*/g, '$1');
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const formatted = lines.map(l => {
            if (l.match(/^[-*•]/)) {
                return `- ${l.replace(/^[-*•]\s*/, '')}`;
            }
            return `- ${l}`;
        }).join('\n');
        return { text: formatted };
    }
    catch (error) {
        throw new https_1.HttpsError('internal', error.message);
    }
});
exports.updateResumeFromChat = (0, https_1.onCall)({ cors: true, }, async (request) => {
    const { instruction, currentResume, history } = request.data;
    const prompt = `
        You are an intelligent resume assistant. Your task is to update a resume based on a user's instruction.

        **User Instruction:**
        ---
        ${instruction}
        ---

        **Current Resume JSON:**
        ---
        ${JSON.stringify(currentResume, null, 2)}
        ---

        **Recent Conversation History (for context):**
        ---
        ${JSON.stringify(history.slice(-4), null, 2)}
        ---

        **CRITICAL INSTRUCTIONS:**
        1.  **Analyze and Update:** Carefully analyze the user's instruction and the current resume JSON. Modify the JSON object to reflect the requested change.
        2.  **Return the Full Object:** You MUST return the entire, complete, updated resume JSON object. Do not return only the changed part.
        3.  **Preserve Data Integrity:** Be very careful not to delete or corrupt other parts of the resume. Preserve all existing IDs. If you add a new item to an array (like a new experience or skill), generate a new unique ID for it (e.g., \`exp${Date.now()}\`).
        4.  **Handle Ambiguity:** If the user's request is ambiguous or you cannot fulfill it (e.g., "make it better" or asking to delete a required field like 'name'), you MUST return the original, unchanged resume object and explain why in the \`confirmationMessage\`.
        5.  **Provide Confirmation:** After updating the resume (or deciding not to), provide a short, friendly \`confirmationMessage\` (1-2 sentences) confirming what you did. Examples: "Done! I've updated your name to Jane Smith.", "Okay, I've added TypeScript to your skills.", "I couldn't identify a specific skill to remove. Could you please be more precise?".

        **OUTPUT FORMAT:**
        Return a single JSON object containing the updated resume and your confirmation message.
    `;
    try {
        const response = await callGeminiApiWithRetry('gemini-2.5-flash', prompt, {
            responseMimeType: 'application/json',
            responseSchema: chatUpdateResponseSchema,
        });
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse;
    }
    catch (error) {
        throw new https_1.HttpsError('internal', error.message);
    }
});
exports.getImprovementSuggestion = (0, https_1.onCall)({ cors: true, }, async (request) => {
    const { parameterName, parameterAnalysis, resumeData, jobDescription } = request.data;
    const prompt = `
        You are a helpful AI resume assistant. The user wants to improve a specific aspect of their resume based on an analysis they received.

        **Analysis Parameter:** ${parameterName}
        **The AI's Analysis:** "${parameterAnalysis}"

        **Task:**
        Based on this analysis, review the user's current resume and the target job description. Provide a single, highly actionable suggestion for improvement.

        **Format Instructions:**
        - Start with a single sentence that directly addresses the problem.
        - If applicable, provide a "Before" and "After" example from the user's resume.
        - Keep the entire response concise (under 100 words).
        - Use markdown for formatting (e.g., bolding, bullet points).
        - Return only the suggestion text. Do not include any preamble like "Here is my suggestion:".

        **Current Resume:**
        ---
        ${JSON.stringify(resumeData, null, 2)}
        ---

        **Job Description:**
        ---
        ${jobDescription}
        ---
    `;
    try {
        const response = await callGeminiApiWithRetry('gemini-2.5-flash', prompt);
        return { text: response.text.trim() };
    }
    catch (error) {
        throw new https_1.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=index.js.map