import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/AppShell';
import { Template, CustomTemplateSettings } from '../../types';
import { CommandPalette } from '../../components/CommandPalette';
import { useCommandPalette } from '../../hooks/useCommandPalette';

interface MainLayoutProps {
    user: string;
    viewMode: 'dashboard' | 'editor' | 'profile';
    hasTailoredResult: boolean;
    handleResetView: () => void;
    handleNavigateToDashboard: () => void;
    handleTailorResume: () => void;
    handleDownload: () => void;
    handleLogout: () => void;
    isLoading: boolean;
    isDownloading: boolean;
    isTailorDisabled: boolean;
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

export const MainLayout: React.FC<MainLayoutProps> = (props) => {
    const navigate = useNavigate();
    const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useCommandPalette();

    const handleNavigateToDashboard = () => {
        props.handleNavigateToDashboard();
        navigate('/dashboard');
    };

    const commands = [
        { name: 'Tailor Resume', action: props.handleTailorResume, disabled: props.isLoading },
        { name: 'Download PDF', action: props.handleDownload, disabled: props.isDownloading },
        { name: 'Switch to Dashboard', action: () => navigate('/dashboard') },
        { name: 'Switch to Editor', action: () => navigate('/editor') },
        { name: 'Manage Profile', action: () => navigate('/profile') },
        { name: 'Log Out', action: props.handleLogout },
    ];

    return (
        <>
            <AppShell
                {...props}
                handleNavigateToDashboard={handleNavigateToDashboard}
                openCommandPalette={openCommandPalette}
            >
                <Outlet />
            </AppShell>
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} actions={commands} />
        </>
    );
};
