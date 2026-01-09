import React from 'react';
import { ProfileEditor } from '../../components/ProfileEditor';
import { ResumeData } from '../../types';

interface ProfilePageProps {
    resumeData: ResumeData;
    setResumeData: (data: ResumeData) => void;
    onBack: () => void;
}

import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC<ProfilePageProps> = ({ resumeData, setResumeData, onBack }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        onBack();
        navigate('/dashboard');
    };

    return (
        <div className="col-span-12">
            <ProfileEditor
                resumeData={resumeData}
                setResumeData={setResumeData}
                onBack={handleBack}
            />
        </div>
    );
};
