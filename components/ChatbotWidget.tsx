
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ResumeData, type ChatMessage } from '../types';
import { updateResumeFromChat } from '../services/geminiService';
import { BotIcon } from './icons/BotIcon';
import { SendIcon } from './icons/SendIcon';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatbotWidgetProps {
    currentResume: ResumeData;
    onResumeUpdate: (newResume: ResumeData) => void;
    handleApiError: (error: unknown) => string | undefined;
}

const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ currentResume, onResumeUpdate, handleApiError }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'welcome', role: 'ai', content: "Hello! I'm your AI Resume Architect. How can I help you refine your profile today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: generateMessageId(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await updateResumeFromChat(input, currentResume, messages);
            onResumeUpdate(result.resume);
            const aiMessage: ChatMessage = { id: generateMessageId(), role: 'ai', content: result.confirmationMessage };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = handleApiError(error) ?? "I encountered an issue. Please try again.";
            const aiErrorMessage: ChatMessage = { id: generateMessageId(), role: 'ai', content: errorMessage };
            setMessages(prev => [...prev, aiErrorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    }

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-8 right-8 w-16 h-16 rounded-2xl shadow-xl z-50 flex items-center justify-center text-white transition-all duration-300 ${
                    isOpen 
                    ? 'bg-gradient-to-br from-gray-700 to-gray-900 rotate-90' 
                    : 'bg-gradient-to-br from-primary to-indigo-600'
                }`}
                aria-label="Toggle AI Assistant"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <XIcon className="w-7 h-7" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <SparklesIcon className="w-7 h-7" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
            
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} // smooth cubic-bezier
                        className="fixed bottom-28 right-4 sm:right-8 w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-8rem)] rounded-3xl overflow-hidden z-50 shadow-2xl flex flex-col border border-white/20 backdrop-blur-xl bg-white/80 supports-[backdrop-filter]:bg-white/60"
                    >
                        {/* Header */}
                        <div className="relative p-6 bg-gradient-to-r from-primary/90 to-indigo-600/90 backdrop-blur-md">
                             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner border border-white/10">
                                    <BotIcon className="w-6 h-6 text-white"/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-wide">AI Architect</h3>
                                    <p className="text-xs font-medium text-blue-100/80">Gemini 2.5 • Online</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-transparent to-white/50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            <div className="space-y-6">
                                {messages.map((msg) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        key={msg.id} 
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                            msg.role === 'user' 
                                                ? 'bg-gradient-to-br from-primary to-indigo-600 text-white rounded-br-none' 
                                                : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                     <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
                            <div className="relative flex items-center bg-gray-50/50 rounded-2xl border border-gray-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300 shadow-inner">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a command (e.g., 'Add Python to skills')..."
                                    className="w-full pl-5 pr-14 py-3.5 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-gray-800 placeholder:text-gray-400"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                                >
                                    <SendIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">AI can make mistakes. Review generated content.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
