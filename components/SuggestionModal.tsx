import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './icons/XIcon';

interface SuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    isLoading: boolean;
}

// A simple markdown-to-html renderer
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Italic
        .replace(/^- (.*?)(\n|$)/gm, '<li>$1</li>')       // List items
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');    // Wrap lists

    return <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: html }} />;
};

export const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative z-10 w-full max-w-lg bg-card border border-border shadow-2xl rounded-lg"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
                            <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:bg-secondary">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 min-h-[120px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-8 h-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <MarkdownRenderer text={content} />
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
