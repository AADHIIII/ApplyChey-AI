import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../../components/Dashboard';

import { ResumeEntry } from '../../types';

interface DashboardPageProps {
    user: string;
    onStartEditing: () => void;
    onManageProfile: () => void;
    onLogout: () => void;
    history: ResumeEntry[];
    onLoadHistory: (entry: ResumeEntry) => void;
    onDeleteHistory: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onStartEditing, onManageProfile, onLogout, history, onLoadHistory, onDeleteHistory }) => {
    const navigate = useNavigate();

    const handleStartEditing = () => {
        onStartEditing();
        navigate('/editor');
    };

    const handleManageProfile = () => {
        onManageProfile();
        navigate('/profile');
    };

    return (
        <div className="col-span-12">
            <Dashboard
                user={user}
                onStartEditing={handleStartEditing}
                onManageProfile={handleManageProfile}
                onLogout={onLogout}
                history={history}
                onLoadHistory={onLoadHistory}
                onDeleteHistory={onDeleteHistory}
            />
        </div>
    );
};
