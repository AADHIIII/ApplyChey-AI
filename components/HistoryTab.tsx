import React from 'react';
import { ResumeEntry } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { EyeIcon } from './icons/EyeIcon';

interface HistoryTabProps {
    history: ResumeEntry[];
    onLoad: (entry: ResumeEntry) => void;
    onDelete: (id: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ history, onLoad, onDelete }) => {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-border shadow-sm text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <FileTextIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No History Yet</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Tailor your resume to a job description to start building your history.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Role</th>
                            <th className="px-6 py-3 font-medium">Company</th>
                            <th className="px-6 py-3 font-medium">Location</th>
                            <th className="px-6 py-3 font-medium text-center">Score</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {history.map((entry) => (
                            <tr key={entry.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                    {new Date(entry.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-medium text-foreground">
                                    {entry.jobDetails.role}
                                </td>
                                <td className="px-6 py-4 text-foreground">
                                    {entry.jobDetails.company}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {entry.jobDetails.location}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.report.overallScore >= 80 ? 'bg-success/10 text-success' :
                                            entry.report.overallScore >= 60 ? 'bg-yellow-500/10 text-yellow-600' :
                                                'bg-destructive/10 text-destructive'
                                        }`}>
                                        {entry.report.overallScore}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => onLoad(entry)}
                                        className="text-primary hover:text-primary/80 transition-colors"
                                        title="View & Edit"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(entry.id)}
                                        className="text-destructive hover:text-destructive/80 transition-colors"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
