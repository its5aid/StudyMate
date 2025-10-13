import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, Paperclip, X } from 'lucide-react';
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
  const { t, user } = useApp();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if ((!input.trim() && !attachedFile) || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    setIsLoading(true);
    setFileError(null);
    const currentInput = input;
    const currentFile = attachedFile;
    setInput('');
    setAttachedFile(null);


    try {
      const response = await getChatResponse(messages, currentInput, currentFile ?? undefined);
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
    <div className="flex flex-col h-full animate-fade-in-up">
      {/* Chat messages area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        <div className="max-w-4xl mx-auto w-full">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 pt-16">
                  <div className="bg-indigo-100 text-indigo-600 p-5 rounded-full mb-6">
                    <BrainCircuit size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('feature.aiAssistant.welcome.title', { name: user?.name || '' })}</h2>
                  <p className="mb-8">{t('feature.aiAssistant.startConversation')}</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : ''} animate-fade-in-up`}>
                {msg.role === 'model' && (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <BrainCircuit size={24} />
                  </div>
                )}
                <div className={`max-w-full md:max-w-xl lg:max-w-2xl p-4 rounded-2xl break-words shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                     <img
                        className="rounded-full w-full h-full object-cover"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=c7d2fe&color=4f46e5&font-size=0.4`}
                        alt="User avatar"
                      />
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <BrainCircuit size={24} />
                  </div>
                  <div className="max-w-xl p-4 rounded-lg bg-white border border-slate-200">
                      <LoadingSpinner />
                  </div>
              </div>
            )}
            <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 bg-slate-100/80 backdrop-blur-sm pt-2 pb-4 sm:pb-6 px-4">
        <div className="max-w-4xl mx-auto w-full">
            {fileError && (
              <p className="text-red-500 text-sm mb-2 text-center">{fileError}</p>
            )}
            {attachedFile && (
              <div className="flex items-center justify-between bg-indigo-50 text-indigo-800 rounded-lg px-4 py-2 mb-2 text-sm animate-fade-in-up">
                  <span>{t('feature.aiAssistant.attachedFile')} {attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)} className="text-indigo-600 hover:text-indigo-800">
                      <X size={16} />
                  </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-white rounded-xl shadow-lg p-2 border border-slate-200">
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
                  className="flex-shrink-0 text-slate-500 rounded-lg w-10 h-10 flex items-center justify-center hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                  aria-label={t('feature.aiAssistant.attachFileLabel')}
                  disabled={isLoading}
              >
                  <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('feature.aiAssistant.placeholder')}
                className="w-full bg-transparent p-2 focus:outline-none focus:ring-0 border-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="flex-shrink-0 bg-indigo-600 text-white rounded-lg w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:bg-indigo-300 transition-all duration-200 transform active:scale-95"
                disabled={isLoading || (!input.trim() && !attachedFile)}
                aria-label={t('feature.aiAssistant.sendLabel')}
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