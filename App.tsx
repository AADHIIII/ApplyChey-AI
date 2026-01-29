
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './src/layouts/MainLayout';
import { DashboardPage } from './src/pages/DashboardPage';
import { EditorPage } from './src/pages/EditorPage';
import { ProfilePage } from './src/pages/ProfilePage';
import { AppShell } from './components/AppShell';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ResumeFormStepper } from './components/ResumeFormStepper';
import { ResumePreview } from './components/ResumePreview';
import { ActionToolbar } from './components/ActionToolbar';
import { CommandPalette } from './components/CommandPalette';
import { ChatbotWidget } from './components/ChatbotWidget';
import { ProfileEditor } from './components/ProfileEditor';
import { type ResumeData, type ATSReport, type Diffs, type DiffViewMode, type Template, type SectionVisibility, type ViewMode, type Experience, type CustomTemplateSettings, type UserProfile, type ResumeEntry } from './types';
import { tailorResume, enhanceSection, deepDiveExperience, GeminiApiError } from './services/geminiService';
import { generatePdf } from './services/pdfService';
import { useToast } from './contexts/ToastContext';
import { diffToHtml } from './utils/diff';
import { initialResumeData, initialSectionVisibility } from './utils/initialData';
import { Card } from './components/ui/Card';

// Firebase imports
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';

const App: React.FC = () => {
    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(false);

    // App State
    const [originalResume, setOriginalResume] = useState<ResumeData>(initialResumeData);
    const [tailoredResume, setTailoredResume] = useState<ResumeData | null>(null);
    const [jobDescription, setJobDescription] = useState<string>('');
    const [atsReport, setAtsReport] = useState<ATSReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState<Record<string, boolean>>({});
    const [isDeepDiving, setIsDeepDiving] = useState<Record<string, boolean>>({});
    const [isBatchDeepDiving, setIsBatchDeepDiving] = useState(false);
    const [diffs, setDiffs] = useState<Diffs | null>(null);
    const [diffView, setDiffView] = useState<DiffViewMode>('tailored');
    const [selectedTemplate, setSelectedTemplate] = useState<Template>('modern-tech');
    const [customTemplateSettings, setCustomTemplateSettings] = useState<CustomTemplateSettings>({
        primaryColor: '#4F46E5', // indigo-600
        fontFamily: 'sans',
        fontSize: 'base'
    });
    const [resumeLength, setResumeLength] = useState<number>(1);
    const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(initialSectionVisibility);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
    const [targetScore, setTargetScore] = useState<number>(85);
    const [highlightTailorButton, setHighlightTailorButton] = useState(false);
    const [deepDiveRetailorRequestId, setDeepDiveRetailorRequestId] = useState<string | null>(null);


    const { addToast } = useToast();

    const [history, setHistory] = useState<ResumeEntry[]>([]);

    // 1. Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setIsAuthLoading(false);
            if (currentUser) {
                // Load user data from Firestore
                setIsDataLoading(true);
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data() as UserProfile;
                        setOriginalResume(userData.originalResume || initialResumeData);
                        setJobDescription(userData.jobDescription || '');
                        if (userData.settings) {
                            if (userData.settings.template) setSelectedTemplate(userData.settings.template);
                            if (userData.settings.customTemplateSettings) setCustomTemplateSettings(userData.settings.customTemplateSettings);
                        }
                        if (userData.history) {
                            setHistory(userData.history);
                        }
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                    addToast({ type: 'error', title: 'Error', message: 'Failed to load your profile.' });
                } finally {
                    setIsDataLoading(false);
                }
            } else {
                setOriginalResume(initialResumeData);
                setJobDescription('');
                setHistory([]);
            }
        });

        return () => unsubscribe();
    }, [addToast]);

    // 2. Fetch User Data from Firestore on Login
    // This useEffect is now partially redundant with the updated Auth Listener,
    // but keeps the debounced save logic separate.
    useEffect(() => {
        const loadUserData = async () => {
            if (!user) return;
            setIsDataLoading(true);
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Cast the data to our schema interface
                    const data = docSnap.data() as UserProfile;

                    if (data.originalResume) setOriginalResume(data.originalResume);
                    if (data.jobDescription) setJobDescription(data.jobDescription);
                    if (data.settings) {
                        if (data.settings.template) setSelectedTemplate(data.settings.template);
                        if (data.settings.customTemplateSettings) setCustomTemplateSettings(data.settings.customTemplateSettings);
                    }
                    // History is now loaded in the auth listener
                } else {
                    // New user: Save initial data immediately conforming to schema
                    const initialProfile: UserProfile = {
                        originalResume: initialResumeData,
                        jobDescription: '',
                        settings: {
                            template: 'modern-tech',
                            customTemplateSettings: {
                                primaryColor: '#4F46E5',
                                fontFamily: 'sans',
                                fontSize: 'base'
                            }
                        },
                        createdAt: new Date().toISOString(),
                        lastUpdated: new Date().toISOString()
                    };
                    await setDoc(docRef, initialProfile, { merge: true });
                }
            } catch (error) {
                console.error("Error loading data:", error);
                addToast({ type: 'error', title: 'Data Error', message: 'Failed to load your profile. Check your connection.' });
            } finally {
                setIsDataLoading(false);
            }
        };

        if (user) loadUserData();
    }, [user, addToast]);

    // 3. Debounced Sync to Firestore
    useEffect(() => {
        if (!user || isDataLoading) return;

        const handler = setTimeout(async () => {
            try {
                const docRef = doc(db, "users", user.uid);

                // Construct object matching UserProfile schema
                const updateData: UserProfile = {
                    originalResume: originalResume,
                    jobDescription: jobDescription,
                    settings: {
                        template: selectedTemplate,
                        customTemplateSettings: customTemplateSettings
                    },
                    lastUpdated: new Date().toISOString()
                };

                await setDoc(docRef, updateData, { merge: true });
            } catch (error: any) {
                console.error("Error saving data:", error);
                if (error.code === 'permission-denied') {
                    addToast({ type: 'warning', title: 'Save Failed', message: 'Permission denied. Please enable Firestore in the Firebase Console and set rules to public or authenticated.' });
                }
            }
        }, 1500); // Debounce save by 1.5s

        return () => clearTimeout(handler);
    }, [originalResume, jobDescription, selectedTemplate, customTemplateSettings, user, isDataLoading, addToast]);


    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Reset local state
            setOriginalResume(initialResumeData);
            setTailoredResume(null);
            setJobDescription('');
            setViewMode('dashboard');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleResumeDataChange = (data: ResumeData) => {
        setOriginalResume(data);
    }

    const handleChatResumeUpdate = (data: ResumeData) => {
        setOriginalResume(data);
        if (diffView !== 'original') setDiffView('original');
        if (tailoredResume) {
            setHighlightTailorButton(true);
            addToast({ type: 'info', title: 'Resume Updated', message: 'Switched to Original View. Re-tailor to apply changes.' });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!originalResume.name) newErrors.name = "Full Name is required";
        if (!originalResume.email) newErrors.email = "Email is required";
        // Relaxed validation: Summary and Experience are not strictly required to start editing, 
        // but are needed for tailoring.
        if (originalResume.experience.length === 0) newErrors.experience = "At least one experience is recommended for tailoring";
        if (!jobDescription) newErrors.jobDescription = "Job Description is required to tailor resume";

        setErrors(newErrors);
        // We only block if JD is missing for tailoring.
        if (!jobDescription) {
            addToast({ type: 'error', title: 'Validation Error', message: 'Please enter a job description to start tailoring.' });
            return false;
        }
        return true;
    };

    const handleApiError = (error: unknown) => {
        console.error("API Error:", error);
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error instanceof GeminiApiError) {
            errorMessage = error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        addToast({ type: 'error', title: 'AI Service Error', message: errorMessage });
        return errorMessage;
    };

    const handleTailorResume = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const response = await tailorResume(originalResume, jobDescription, resumeLength, targetScore, selectedTemplate);
            setTailoredResume(response.resume);
            setAtsReport(response.report);
            setDiffView('tailored');

            const newDiffs: Diffs = {
                summary: diffToHtml(originalResume.summary, response.resume.summary),
                experience: {},
                projects: {}
            };

            response.resume.experience.forEach(exp => {
                const originalExp = originalResume.experience.find(e => e.id === exp.id);
                if (originalExp) {
                    newDiffs.experience![exp.id] = { description: diffToHtml(originalExp.description, exp.description) };
                }
            });

            setDiffs(newDiffs);
            addToast({ type: 'success', title: 'Resume Tailored!', message: `Achieved an ATS score of ${response.report.overallScore}` });

        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnhanceSection = async (section: 'summary' | `experience.${string}` | `project.${string}` | 'skills' | 'technologies', content: string | string[]) => {
        if (!jobDescription) {
            addToast({ type: 'error', title: 'Missing Input', message: 'Please enter a job description first.' });
            setErrors(prev => ({ ...prev, jobDescription: 'Required for AI enhancement' }));
            return;
        }

        setIsEnhancing(prev => ({ ...prev, [section]: true }));

        try {
            let sectionType: 'summary' | 'experience' | 'project' | 'skills' | 'technologies' = 'summary';
            if (section.startsWith('experience.')) sectionType = 'experience';
            else if (section.startsWith('project.')) sectionType = 'project';
            else if (section === 'skills') sectionType = 'skills';
            else if (section === 'technologies') sectionType = 'technologies';

            const enhancedContent = await enhanceSection(content, jobDescription, sectionType);

            if (section === 'summary') {
                setOriginalResume(prev => ({ ...prev, summary: enhancedContent }));
            } else if (section === 'skills') {
                setOriginalResume(prev => ({ ...prev, skills: enhancedContent.split(',').map(s => s.trim()) }));
            } else if (section === 'technologies') {
                setOriginalResume(prev => ({ ...prev, technologies: enhancedContent.split(',').map(s => s.trim()) }));
            } else if (section.startsWith('experience.')) {
                const expId = section.split('.')[1];
                setOriginalResume(prev => ({
                    ...prev,
                    experience: prev.experience.map(e => e.id === expId ? { ...e, description: enhancedContent } : e)
                }));
            } else if (section.startsWith('project.')) {
                const projId = section.split('.')[1];
                setOriginalResume(prev => ({
                    ...prev,
                    projects: prev.projects.map(p => p.id === projId ? { ...p, description: enhancedContent } : p)
                }));
            }
            addToast({ type: 'success', title: 'Section Enhanced', message: 'Content updated with AI improvements.' });

        } catch (error) {
            handleApiError(error);
        } finally {
            setIsEnhancing(prev => ({ ...prev, [section]: false }));
        }
    };

    const handleDeepDiveExperience = async (exp: Experience, numPoints: number) => {
        if (!jobDescription) {
            addToast({ type: 'error', title: 'Missing Input', message: 'Please enter a job description first.' });
            return;
        }

        setIsDeepDiving(prev => ({ ...prev, [exp.id]: true }));

        try {
            const newDescription = await deepDiveExperience(exp, jobDescription, numPoints);
            setOriginalResume(prev => ({
                ...prev,
                experience: prev.experience.map(e => e.id === exp.id ? { ...e, description: newDescription } : e)
            }));
            addToast({ type: 'success', title: 'Deep Dive Complete', message: `Generated ${numPoints} detailed bullet points for ${exp.role}.` });
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsDeepDiving(prev => ({ ...prev, [exp.id]: false }));
        }
    }

    const handleBatchDeepDiveAndRetailor = async (experiences: Experience[], numPoints: number) => {
        if (!jobDescription) {
            addToast({ type: 'error', title: 'Missing Input', message: 'Job description is required.' });
            return;
        }

        setIsBatchDeepDiving(true);
        setDeepDiveRetailorRequestId(Date.now().toString());
        let failureCount = 0;

        try {
            const promises = experiences.map(async (exp) => {
                try {
                    const newDesc = await deepDiveExperience(exp, jobDescription, numPoints);
                    return { id: exp.id, description: newDesc };
                } catch (e) {
                    console.error(`Deep dive failed for ${exp.role}`, e);
                    failureCount++;
                    return { id: exp.id, description: exp.description }; // Fallback to original
                }
            });

            const results = await Promise.all(promises);

            setOriginalResume(prev => {
                const newExperience = prev.experience.map(exp => {
                    const result = results.find(r => r.id === exp.id);
                    return result ? { ...exp, description: result.description } : exp;
                });
                return { ...prev, experience: newExperience };
            });

            if (failureCount > 0) {
                addToast({ type: 'warning', title: 'Partial Success', message: `Deep dive completed with ${failureCount} errors. Re-tailoring successful updates.` });
            } else {
                addToast({ type: 'success', title: 'Batch Deep Dive Complete', message: 'Experiences updated. Re-tailoring now...' });
            }

        } catch (error) {
            handleApiError(error);
            setDeepDiveRetailorRequestId(null);
        } finally {
            setIsBatchDeepDiving(false);
        }
    };

    useEffect(() => {
        if (deepDiveRetailorRequestId && !isBatchDeepDiving) {
            handleTailorResume().then(() => {
                setDeepDiveRetailorRequestId(null);
            });
        }
    }, [originalResume, deepDiveRetailorRequestId, isBatchDeepDiving]);

    const handleDownload = async () => {
        const dataToPrint = diffView === 'tailored' && tailoredResume ? tailoredResume : originalResume;

        // Validate minimum required fields before PDF generation
        if (!dataToPrint.name || dataToPrint.name.trim().length === 0) {
            addToast({ type: 'error', title: 'Missing Information', message: 'Please add your name before downloading.' });
            return;
        }

        setIsDownloading(true);
        try {
            await generatePdf(dataToPrint, selectedTemplate, customTemplateSettings);
            addToast({ type: 'success', title: 'Download Started', message: 'Your resume PDF is generating.' });
        } catch (error) {
            console.error(error);
            addToast({ type: 'error', title: 'Download Failed', message: 'Could not generate PDF. Please try again.' });
        } finally {
            setIsDownloading(false);
        }
    };

    // ... (keep all state and handlers)

    // Derived state for layout
    const hasResults = !!(tailoredResume && atsReport);

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground font-charter mb-4">ApplyChey</h1>
                    <div className="w-12 h-12 border-4 border-t-transparent border-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground animate-pulse text-sm">Initializing Application...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Auth onLogin={() => { /* State handled by onAuthStateChanged */ }} />;
    }

    if (isDataLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground font-charter mb-4">ApplyChey</h1>
                    <div className="w-12 h-12 border-4 border-t-transparent border-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">Syncing your data...</p>
                </div>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route element={
                    <MainLayout
                        user={user.email || 'User'}
                        viewMode={viewMode}
                        hasTailoredResult={!!tailoredResume}
                        handleResetView={() => { setTailoredResume(null); setAtsReport(null); setDiffView('tailored'); }}
                        handleNavigateToDashboard={() => setViewMode('dashboard')}
                        handleTailorResume={handleTailorResume}
                        handleDownload={handleDownload}
                        handleLogout={handleLogout}
                        isLoading={isLoading}
                        isDownloading={isDownloading}
                        isTailorDisabled={!jobDescription}
                        selectedTemplate={selectedTemplate}
                        onTemplateChange={setSelectedTemplate}
                        resumeLength={resumeLength}
                        onLengthChange={setResumeLength}
                        targetScore={targetScore}
                        onTargetScoreChange={setTargetScore}
                        customTemplateSettings={customTemplateSettings}
                        onCustomTemplateSettingsChange={setCustomTemplateSettings}
                        highlightTailorButton={highlightTailorButton}
                    />
                }>
                    <Route path="/" element={
                        <DashboardPage
                            user={user.email?.split('@')[0] || 'User'}
                            onStartEditing={() => setViewMode('editor')}
                            onManageProfile={() => setViewMode('profile')}
                            onLogout={handleLogout}
                        />
                    } />
                    <Route path="/dashboard" element={
                        <DashboardPage
                            user={user.email?.split('@')[0] || 'User'}
                            onStartEditing={() => setViewMode('editor')}
                            onManageProfile={() => setViewMode('profile')}
                            onLogout={handleLogout}
                        />
                    } />
                    <Route path="/editor" element={
                        <EditorPage
                            originalResume={originalResume}
                            tailoredResume={tailoredResume}
                            jobDescription={jobDescription}
                            setJobDescription={setJobDescription}
                            handleResumeDataChange={handleResumeDataChange}
                            isLoading={isLoading}
                            isEnhancing={isEnhancing}
                            isDeepDiving={isDeepDiving}
                            sectionVisibility={sectionVisibility}
                            setSectionVisibility={setSectionVisibility}
                            handleEnhanceSection={handleEnhanceSection}
                            handleDeepDiveExperience={handleDeepDiveExperience}
                            handleBatchDeepDiveAndRetailor={handleBatchDeepDiveAndRetailor}
                            isBatchDeepDiving={isBatchDeepDiving}
                            errors={errors}
                            atsReport={atsReport}
                            diffView={diffView}
                            setDiffView={setDiffView}
                            selectedTemplate={selectedTemplate}
                            customTemplateSettings={customTemplateSettings}
                            setCustomTemplateSettings={setCustomTemplateSettings}
                            diffs={diffs}
                            handleApiError={handleApiError}
                        />
                    } />
                    <Route path="/profile" element={
                        <ProfilePage
                            resumeData={originalResume}
                            setResumeData={handleResumeDataChange}
                            onBack={() => setViewMode('dashboard')}
                        />
                    } />
                </Route>
            </Routes>

            {viewMode === 'editor' && (
                <ChatbotWidget
                    currentResume={originalResume}
                    onResumeUpdate={handleChatResumeUpdate}
                    handleApiError={handleApiError}
                />
            )}
        </BrowserRouter>
    );
};
export default App;