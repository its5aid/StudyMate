

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, BrainCircuit, Paperclip, X } from 'lucide-react';
import { getChatResponse } from '../../services/geminiService';
import { ChatMessage } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { useApp } from '../../context/AppContext';

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useApp();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedFile) || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    setIsLoading(true);
    setFileError(null);

    try {
      const response = await getChatResponse(messages, input, attachedFile ?? undefined);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'model',
        content: t('feature.aiAssistant.error.generic'),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
      setAttachedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const SUPPORTED_TYPES = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp'];
      if (SUPPORTED_TYPES.includes(file.type)) {
        setAttachedFile(file);
      } else {
        setFileError(t('feature.aiAssistant.fileError'));
        setAttachedFile(null);
      }
    }
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-md flex flex-col flex-1">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <BrainCircuit size={48} className="mb-4"/>
                <p>{t('feature.aiAssistant.startConversation')}</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''} animate-fade-in-up`}>
              {msg.role === 'model' && (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <BrainCircuit size={24} />
                </div>
              )}
              <div className={`max-w-full md:max-w-xl lg:max-w-2xl p-4 rounded-xl break-words ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <User size={24} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <BrainCircuit size={24} />
                </div>
                <div className="max-w-xl p-4 rounded-lg bg-slate-100">
                    <LoadingSpinner />
                </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-slate-200 flex-shrink-0">
          {fileError && (
            <p className="text-red-500 text-sm mb-2 text-center">{fileError}</p>
          )}
          {attachedFile && (
            <div className="flex items-center justify-between bg-indigo-50 text-indigo-800 rounded-lg px-4 py-2 mb-2 text-sm">
                <span>{t('feature.aiAssistant.attachedFile')} {attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="text-indigo-600 hover:text-indigo-800">
                    <X size={16} />
                </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="application/pdf,text/plain,image/jpeg,image/png,image/webp"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 bg-slate-200 text-slate-600 rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-300 transition-colors"
                disabled={isLoading}
            >
                <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('feature.aiAssistant.placeholder')}
              className="w-full bg-slate-100 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="flex-shrink-0 bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:bg-indigo-300 transition-all duration-200 transform active:scale-95"
              disabled={isLoading || (!input.trim() && !attachedFile)}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;