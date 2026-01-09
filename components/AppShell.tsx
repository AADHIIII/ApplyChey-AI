
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type DiffViewMode, type Template, type ViewMode, type CustomTemplateSettings } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { UserIcon } from './icons/UserIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LayoutDashboardIcon } from './icons/LayoutDashboardIcon';
import { TemplateSelector } from './TemplateSelector';
import { PageLengthSelector } from './PageLengthSelector';
import { ScoreTargetSlider } from './ScoreTargetSlider';
import { CustomTemplateSettingsPanel } from './CustomTemplateSettingsPanel';
import { RefreshCcwIcon } from './icons/RefreshCcwIcon';


interface AppShellProps {
  children: React.ReactNode;
  user: string;
  viewMode: ViewMode;
  hasTailoredResult: boolean;
  handleResetView: () => void;
  handleNavigateToDashboard: () => void;
  handleTailorResume: () => void;
  handleDownload: () => void;
  handleLogout: () => void;
  isLoading: boolean;
  isDownloading: boolean;
  isTailorDisabled: boolean;
  openCommandPalette: () => void;
  selectedTemplate: Template;
  onTemplateChange: (template: Template) => void;
  resumeLength: number;
  onLengthChange: (length: number) => void;
  targetScore: number;
  onTargetScoreChange: (score: number) => void;
  customTemplateSettings: CustomTemplateSettings;
  onCustomTemplateSettingsChange: (settings: CustomTemplateSettings) => void;
  highlightTailorButton: boolean;
}

const UserMenu: React.FC<{ user: string; onLogout: () => void; onNavigateToDashboard: () => void; }> = ({ user, onLogout, onNavigateToDashboard }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 bg-secondary rounded-full hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-foreground">{user.charAt(0).toUpperCase()}</span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl origin-top-right z-20"
                    >
                        <div className="p-2">
                            <div className="px-3 py-2 border-b border-border">
                                <p className="text-sm font-medium text-foreground truncate">Signed in as</p>
                                <p className="text-sm text-muted-foreground truncate font-semibold">{user}</p>
                            </div>
                            <div className="py-1">
                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToDashboard(); setIsOpen(false); }} className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-colors">
                                    <LayoutDashboardIcon className="w-4 h-4 mr-2" />
                                    Dashboard
                                </a>
                                <a href="#" className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-colors">
                                    <UserIcon className="w-4 h-4 mr-2" />
                                    Manage Account
                                </a>
                                <a href="#" className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-colors">
                                    <SettingsIcon className="w-4 h-4 mr-2" />
                                    Settings
                                </a>
                            </div>
                            <div className="pt-1 border-t border-border">
                                <button onClick={onLogout} className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                                    <LogoutIcon className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Header: React.FC<Omit<AppShellProps, 'children' | 'handleBackToEditor'>> = ({
    user, viewMode, hasTailoredResult, handleResetView, handleNavigateToDashboard, handleTailorResume, handleDownload, handleLogout,
    isLoading, isDownloading, isTailorDisabled, openCommandPalette,
    selectedTemplate, onTemplateChange, resumeLength, onLengthChange, targetScore, onTargetScoreChange,
    customTemplateSettings, onCustomTemplateSettingsChange, highlightTailorButton
}) => {
    return (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border shadow-sm">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold text-foreground font-charter cursor-pointer" onClick={handleNavigateToDashboard}>
                             ApplyChey <span className="text-primary">AI</span>
                        </h1>
                         {viewMode !== 'dashboard' && hasTailoredResult && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <button
                                    onClick={handleResetView}
                                    className="hidden sm:flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <RefreshCcwIcon className="w-4 h-4 mr-1.5" />
                                    Start Over
                                </button>
                            </motion.div>
                        )}
                    </div>
                    
                    <div className="flex items-center space-x-2 md:space-x-4">
                         {viewMode !== 'dashboard' && (
                            <>
                                <div className="hidden lg:flex items-center space-x-2 md:space-x-4">
                                    <TemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={onTemplateChange} />
                                    <PageLengthSelector value={resumeLength} onChange={onLengthChange} />
                                    <ScoreTargetSlider value={targetScore} onChange={onTargetScoreChange} />
                                    {selectedTemplate === 'custom' && (
                                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                            <CustomTemplateSettingsPanel settings={customTemplateSettings} onChange={onCustomTemplateSettingsChange} />
                                        </motion.div>
                                    )}
                                </div>
                                <div className="hidden sm:block border-l border-border h-8"></div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleTailorResume}
                                        disabled={isLoading || isTailorDisabled}
                                        className={`flex items-center justify-center px-3 py-2 text-primary-foreground rounded-md shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-all disabled:opacity-50 disabled:cursor-wait ${
                                            highlightTailorButton ? 'bg-success animate-pulse-glow' : 'bg-primary hover:bg-primary/90'
                                        }`}
                                        title="Tailor with AI"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <SparklesIcon className="w-4 h-4 sm:mr-2" />
                                                <span className="hidden sm:inline">Tailor with AI</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="flex items-center justify-center px-3 py-2 bg-secondary text-secondary-foreground rounded-md shadow-sm text-sm font-semibold hover:bg-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-all disabled:opacity-50 disabled:cursor-wait"
                                        title="Download as PDF"
                                    >
                                         {isDownloading ? (
                                            <div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                                        ) : (
                                            <DownloadIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <div className="border-l border-border h-8"></div>
                            </>
                         )}
                         <button onClick={openCommandPalette} className="hidden sm:flex items-center justify-center px-2 py-2 bg-secondary text-secondary-foreground rounded-md text-xs font-mono hover:bg-border transition-colors">
                           ⌘K
                         </button>
                        <UserMenu user={user} onLogout={handleLogout} onNavigateToDashboard={handleNavigateToDashboard} />
                    </div>
                </div>
            </div>
        </header>
    );
}

export const AppShell: React.FC<AppShellProps> = (props) => {
    return (
        <div className="min-h-screen bg-secondary/50 text-foreground">
            <Header {...props} />
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {props.children}
                </div>
            </main>
        </div>
    );
};