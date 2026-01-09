
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { MotionCard } from './ui/Motion';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { UserIcon } from './icons/UserIcon';
import { HistoryTab } from './HistoryTab';
import { ResumeEntry } from '../types';

interface DashboardProps {
    user: string;
    onStartEditing: () => void;
    onManageProfile: () => void;
    onLogout: () => void;
    history: ResumeEntry[];
    onLoadHistory: (entry: ResumeEntry) => void;
    onDeleteHistory: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onStartEditing, onManageProfile, onLogout, history, onLoadHistory, onDeleteHistory }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Welcome back, {user}!</h1>
                <p className="text-lg text-muted-foreground mt-1">Ready to land your next job? Let's get started.</p>
            </header>

            <div className="flex space-x-4 border-b border-border mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'overview'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'history'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    History
                </button>
            </div>

            {activeTab === 'overview' ? (
                <>
                    <h2 className="text-xl font-semibold text-foreground mb-4">Your Profiles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <MotionCard delay={0.1}>
                            <div className="flex flex-col h-full">
                                <h3 className="text-lg font-semibold text-card-foreground">Job Tailor</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4 flex-grow">Tailor your resume for a specific job description using AI.</p>
                                <button
                                    onClick={onStartEditing}
                                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                                >
                                    <EditIcon className="w-4 h-4 mr-2" />
                                    Open Editor
                                </button>
                            </div>
                        </MotionCard>

                        <MotionCard delay={0.2}>
                            <div className="flex flex-col h-full">
                                <h3 className="text-lg font-semibold text-card-foreground">User Profile</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4 flex-grow">Manage your personal details, education, and core data.</p>
                                <button
                                    onClick={onManageProfile}
                                    className="w-full flex justify-center items-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                                >
                                    <UserIcon className="w-4 h-4 mr-2" />
                                    Manage Profile
                                </button>
                            </div>
                        </MotionCard>

                        <MotionCard delay={0.3}>
                            <div className="flex flex-col h-full">
                                <h3 className="text-lg font-semibold text-card-foreground">Account Actions</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4 flex-grow">Manage your account settings or sign out of your current session.</p>
                                <button
                                    onClick={onLogout}
                                    className="w-full flex justify-center items-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <LogoutIcon className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        </MotionCard>
                    </div>
                </>
            ) : (
                <HistoryTab history={history} onLoad={onLoadHistory} onDelete={onDeleteHistory} />
            )}
        </div>
    );
};
